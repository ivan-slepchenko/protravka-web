import React, { useEffect, useState, useRef } from "react";
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, VStack, Image, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, Button, Textarea, Heading, useDisclosure } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import { fetchOrders, changeOrderStatus } from "../store/ordersSlice";
import { Order, OrderStatus, Packaging } from "../store/newOrderSlice";
import { fetchOrderExecution } from "../store/executionSlice";
import { useReactToPrint } from "react-to-print";

const statusColorMap = {
    green: "#48BB78", // Green color (Chakra UI green.400)
    yellow: "#ECC94B", // Yellow color (Chakra UI yellow.400)
    red: "#F56565", // Red color (Chakra UI red.400)
};

const StatusKeyLegend: React.FC = () => (
    <HStack >
        <Badge bgColor={statusColorMap.green} color="white" borderRadius="full" px={2} py={1}>😊 90-105%</Badge>
        <Badge bgColor={statusColorMap.yellow} color="white" borderRadius="full" px={2} py={1}>😐 80-90%; 105-115%</Badge>
        <Badge bgColor={statusColorMap.red} color="white" borderRadius="full" px={2} py={1}>😞 &lt;80%; &gt;115%</Badge>    
    </HStack>
);

const LotReport: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const dispatch: AppDispatch = useDispatch();
    const orders = useSelector((state: RootState) => state.orders.activeOrders);
    const orderExecutions = useSelector((state: RootState) => state.execution.orderExecutions);
    const [order, setOrder] = useState<Order | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const componentRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [comment, setComment] = useState<string>('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [status, setStatus] = useState<OrderStatus | null>(null);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    useEffect(() => {
        if (orderId) {
            const foundOrder = orders.find(order => order.id === orderId);
            setOrder(foundOrder || null);
            if (foundOrder && foundOrder.status !== OrderStatus.NotStarted) {
                dispatch(fetchOrderExecution(foundOrder.id));
            }
        }
    }, [orders, orderId, dispatch]);

    const getDeviationColor = (deviation: number) => {
        if (deviation >= 90 && deviation <= 105) return statusColorMap.green;
        if ((deviation >= 80 && deviation < 90) || (deviation > 105 && deviation <= 115)) return statusColorMap.yellow;
        return statusColorMap.red;
    };

    const calculateDeviation = (actual: number | null, target: number) => {
        if (target === 0) return 0;
        if (actual === null) return 0;
        return (actual / (target / 100));
    };

    const handlePhotoClick = (photoUrl: string | null) => {
        setSelectedPhoto(photoUrl);
    };

    const handleClose = () => {
        setSelectedPhoto(null);
    };

    const print = useReactToPrint({
        contentRef: componentRef,
        pageStyle: 'scale(0.8)',
    });

    const handleApprove = () => {
        setStatus(OrderStatus.Completed);
        onOpen();
    };

    const handleDisapprove = () => {
        setStatus(OrderStatus.Failed);
        onOpen();
    };

    const handleSubmit = () => {
        if (order?.id && status) {
            dispatch(changeOrderStatus({ id: order.id, status }));
            navigate('/board');
        }
        onClose();
    };

    const getStatusLabel = () => {
        switch (order?.status) {
            case OrderStatus.Completed:
                return <Badge size="lg" colorScheme="green" mt="3px">Completed</Badge>;
            case OrderStatus.Failed:
                return <Badge size="lg" colorScheme="red" mt="3px">Failed</Badge>;
            default:
                return null;
        }
    };

    if (!order) {
        return <Text>Loading...</Text>;
    }

    const orderExecution = order.status !== OrderStatus.NotStarted ? orderExecutions.find(execution => execution.orderId === order.id) : null;
    const orderRecipe = order.orderRecipe;
    if (!orderRecipe || (order.status !== OrderStatus.NotStarted && !orderExecution)) {
        return <Text>Loading...</Text>;
    }

    const unitNumberOfSeeds = order.packaging === Packaging.InKg ? order.bagSize / order.tkw : order.bagSize;

    return (
        <Box w="full" h="full" overflowY="auto" p={4} ref={componentRef}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <HStack spacing={2}>
                    <Heading size="lg">{order.crop.name}, {order.variety.name}</Heading>
                    <Text size="md">{'['}{order.lotNumber}{']'}</Text>
                    {getStatusLabel()}
                </HStack>
                <HStack spacing={2}>
                    {order.status === OrderStatus.ToAcknowledge && (
                        <>
                            <Button colorScheme="green" onClick={handleApprove}>Mark as Completed</Button>
                            <Button colorScheme="red" onClick={handleDisapprove}>Mark as Failed</Button>
                        </>
                    )}
                    <Button onClick={() => print()} colorScheme="blue">Print to PDF</Button>
                    <Button onClick={() => navigate(-1)} colorScheme="gray">Close</Button>
                </HStack>
            </Box>
            <HStack spacing={4} mb={4}>
                <Table variant="simple" size="sm">
                    <Thead bg="orange.100">
                        <Tr>
                            <Th>TKW</Th>
                            <Th>s.u., KS</Th>
                            <Th>s.u., kg</Th>
                            <Th>Total amount, s.u.</Th>
                            <Th>Total amount, kg</Th>
                            <Th>Packed Seeds, kg</Th>
                            <Th>Packing Photo</Th>
                            <Th>Deviation</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>{order.tkw}</Td>
                            <Td>{unitNumberOfSeeds.toFixed(2)}</Td>
                            <Td>{order.orderRecipe.unitWeight.toFixed(2)}</Td>
                            <Td>{order.orderRecipe.nbSeedsUnits.toFixed(2)}</Td>
                            <Td>{order.seedsToTreatKg}</Td>
                            <Td>{orderExecution && orderExecution.packedseedsToTreatKg || '---'}</Td>
                            <Td>
                                {orderExecution && orderExecution.packingPhoto ? (
                                    <Image
                                        src={orderExecution.packingPhoto}
                                        alt="Packing"
                                        width="150px"
                                        height="100px"
                                        objectFit="contain"
                                        onClick={() => handlePhotoClick(orderExecution.packingPhoto)}
                                        cursor="pointer"
                                        title="Packing Photo"
                                    />
                                ) : (
                                    <Box width="150px" height="100px" bg="gray.200" display="flex" alignItems="center" justifyContent="center">
                                        No Photo
                                    </Box>
                                )}
                            </Td>
                            <Td fontSize="lg" fontWeight="bold" color={getDeviationColor(calculateDeviation(orderExecution?.packedseedsToTreatKg ?? 0, order.seedsToTreatKg))}>
                                {orderExecution ? calculateDeviation(orderExecution.packedseedsToTreatKg, order.seedsToTreatKg).toFixed() + '%' : '---'}
                            </Td>
                        </Tr>
                    </Tbody>
                </Table>
            </HStack>
            <VStack spacing={4} align="stretch">
                <Box w="full" display="flex" justifyContent="space-between" alignItems="center">
                    <Text fontSize="lg" fontWeight="bold" mb={2}>Slurry Preparation per Lot</Text>
                    {order.status !== OrderStatus.NotStarted && <StatusKeyLegend />}
                </Box>
                <Box w="full">
                    <Table size="sm" variant="simple">
                        <Thead bg="orange.100">
                            <Tr>
                                <Th>Component</Th>
                                <Th>Density</Th>
                                <Th>Target rate kg / slurry</Th>
                                <Th>Actual rate kg / slurry</Th>
                                <Th>Application Photo</Th>
                                <Th>Target rate gr / 100 kg seed</Th>
                                <Th>Actual rate gr / 100 kg seeds</Th>
                                <Th>Target rate gr / per s.u.</Th>
                                <Th>Actual rate gr / per s.u.</Th>
                                <Th>Deviation</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {order.productDetails.map((detail, index) => {
                                const productExecution = orderExecution ? orderExecution.productExecutions.find(pe => pe.productId === detail.product?.id) : null;
                                const productRecipe = order.orderRecipe.productRecipes.find(productRecipe => productRecipe.productDetail.product?.id === detail.product?.id);

                                if (detail.product === undefined || productRecipe === undefined) {
                                    return (
                                        <Tr key={index} bg="red.100">
                                            <Td colSpan={10} textAlign="center">
                                                Error - Product data is not found, please contact support.
                                            </Td>
                                        </Tr>
                                    );
                                }

                                const actualRateGrTo100Kg: number | undefined = productExecution ? 100 * (productExecution.appliedRateKg ?? 0) / (order.seedsToTreatKg / 1000) : undefined;
                                const actualRateGrToU_KS: number | undefined = productExecution ? (1000 * (productExecution.appliedRateKg ?? 0) / orderRecipe.nbSeedsUnits) : undefined;
                                const deviation: number | undefined = productExecution ? calculateDeviation(actualRateGrToU_KS ?? 0, productRecipe.rateGrToU_KS) : undefined;

                                return (
                                    <Tr key={index}>
                                        <Td>{detail.product.name}</Td>
                                        <Td>{detail.product.density}</Td>
                                        <Td>{(productRecipe.grSlurryRecipeToMix / 1000).toFixed(2)}</Td>
                                        <Td>{productExecution ? productExecution.appliedRateKg.toFixed(2) : '---'}</Td>
                                        <Td>
                                            {productExecution && productExecution.applicationPhoto ? (
                                                <Image
                                                    src={productExecution.applicationPhoto}
                                                    alt="Appication"
                                                    width="150px"
                                                    height="100px"
                                                    objectFit="contain"
                                                    onClick={() => handlePhotoClick(productExecution.applicationPhoto || null)}
                                                    cursor="pointer"
                                                    title="Appication Photo"
                                                />
                                            ) : (
                                                <Box width="150px" height="100px" bg="gray.200" display="flex" alignItems="center" justifyContent="center">
                                                    No Photo
                                                </Box>
                                            )}
                                        </Td>
                                        <Td>{productRecipe.rateGrTo100Kg.toFixed(2)}</Td>
                                        <Td>{actualRateGrTo100Kg !== undefined ? actualRateGrTo100Kg.toFixed(2) : '---'}</Td>
                                        <Td>{productRecipe.rateGrToU_KS.toFixed(2)}</Td>
                                        <Td>{actualRateGrToU_KS !== undefined ? actualRateGrToU_KS.toFixed(2) : '---'}</Td>
                                        <Td fontSize="lg" fontWeight="bold" color={getDeviationColor(deviation ?? 0)}>
                                            {deviation !== undefined ? deviation.toFixed() + '%' : '---'}
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </Tbody>
                    </Table>
                </Box>
                <Box w="full" display="flex" justifyContent="space-between" alignItems="center">
                    <Text fontSize="lg" fontWeight="bold" mb={2}>Slurry Consumption Per Lot</Text>
                    {order.status !== OrderStatus.NotStarted && <StatusKeyLegend />}
                </Box>
                <Box w="50%" overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead bg="orange.100">
                            <Tr>
                                <Th>Target consumption, kg</Th>
                                <Th>Actual consumption, kg</Th>
                                <Th>Consumption Photo</Th>
                                <Th>Deviation</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td>{(order.orderRecipe.slurryTotalMlRecipeToMix / 1000).toFixed(2)}</Td>
                                <Td>{orderExecution ? orderExecution.slurryConsumptionPerLotKg : '---'}</Td>
                                <Td>
                                    {orderExecution && orderExecution.consumptionPhoto ? (
                                        <Image
                                            src={orderExecution.consumptionPhoto}
                                            alt="Consumption"
                                            width="150px"
                                            height="100px"
                                            objectFit="contain"
                                            onClick={() => handlePhotoClick(orderExecution.consumptionPhoto)}
                                            cursor="pointer"
                                            title="Consumption Photo"
                                        />
                                    ) : (
                                        <Box width="150px" height="100px" bg="gray.200" display="flex" alignItems="center" justifyContent="center">
                                            No Photo
                                        </Box>
                                    )}
                                </Td>
                                <Td fontSize="lg" fontWeight="bold" color={getDeviationColor(calculateDeviation(orderExecution?.slurryConsumptionPerLotKg ?? 0, order.orderRecipe.slurryTotalMlRecipeToMix / 1000))}>
                                    {orderExecution ? calculateDeviation(orderExecution.slurryConsumptionPerLotKg, order.orderRecipe.slurryTotalMlRecipeToMix / 1000).toFixed() + '%' : '---'}
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </Box>
            </VStack>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalCloseButton />
                    <ModalBody>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Enter your comment here..."
                        />
                        <Button mt="4" colorScheme="blue" onClick={handleSubmit}>Submit</Button>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal isOpen={!!selectedPhoto} onClose={handleClose}>
                <ModalOverlay />
                <ModalContent width="800px" height="600px" maxWidth="unset" p="6">
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedPhoto && (
                            <Image
                                src={selectedPhoto}
                                alt="Full Size"
                                width="full"
                                height="full"
                                objectFit="cover"
                            />
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default LotReport;
