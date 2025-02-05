import React, { useEffect, useState, useRef } from "react";
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, VStack, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, Button, Textarea, Heading, useDisclosure, CloseButton, ModalHeader } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import { changeOrderStatus } from "../store/ordersSlice";
import { Order, OrderStatus, Packaging } from "../store/newOrderSlice";
import { useReactToPrint } from "react-to-print";
import { fetchOrderExecution, OrderExecution } from "../store/executionSlice";
import useImageModal from "../hooks/useImageModal";

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
    const [order, setOrder] = useState<Order | null>(null);
    const componentRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [comment, setComment] = useState<string>('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [status, setStatus] = useState<OrderStatus | null>(null);
    const [orderExecution, setOrderExecution] = useState<OrderExecution | null>(null);
    const { ImageModal, ImageWithModal, selectedPhoto, handleClose } = useImageModal();

    useEffect(() => {
        if (orderId && order !== null && [OrderStatus.LabAssignmentCreated, OrderStatus.TKWConfirmed, OrderStatus.RecipeCreated].indexOf(order.status) === -1) {        
            fetchOrderExecution(orderId).then((orderExecution) => {
                setOrderExecution(orderExecution);
            });
        }
    }, [orderId, order]);

    useEffect(() => {
        if (orderId) {
            const foundOrder = orders.find(order => order.id === orderId);
            setOrder(foundOrder || null);
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

    const unitNumberOfSeeds = order.packaging === Packaging.InKg ? order.bagSize / order.tkw : order.bagSize;

    return (     
        <VStack w="full" h="full" overflowY="auto" p={4} ref={componentRef}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} w="full">
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
                    <CloseButton onClick={() => navigate(-1)}/>
                </HStack>
            </Box>
            <VStack w="full" h="full" overflowY="auto" justifyContent={"center"}>
                <HStack w="full" spacing={4} mb={4}>
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
                                <Td>{order.orderRecipe ? order.orderRecipe.unitWeight.toFixed(2) : 'N/A'}</Td>
                                <Td>{order.orderRecipe ? order.orderRecipe.nbSeedsUnits.toFixed(2) : 'N/A'}</Td>
                                <Td>{order.seedsToTreatKg}</Td>
                                <Td>{orderExecution && orderExecution.packedseedsToTreatKg || 'N/A'}</Td>
                                <Td>
                                    {orderExecution && orderExecution.packingPhoto ? (
                                        <ImageWithModal src={orderExecution.packingPhoto} />
                                    ) : (
                                        <Box width="150px" height="100px" bg="gray.200" display="flex" alignItems="center" justifyContent="center">
                                                No Photo
                                        </Box>
                                    )}
                                </Td>
                                <Td fontWeight={orderExecution ? "bold" : "normal"} color={orderExecution ? getDeviationColor(calculateDeviation(orderExecution.packedseedsToTreatKg, order.seedsToTreatKg)) : "black"}>
                                    {orderExecution ? calculateDeviation(orderExecution.packedseedsToTreatKg, order.seedsToTreatKg).toFixed() + '%' : 'N/A'}
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </HStack>
                <VStack spacing={4} align="stretch">
                    <Box w="full" display="flex" justifyContent="space-between" alignItems="center">
                        <Text fontSize="lg" fontWeight="bold" mb={2}>Slurry Preparation per Lot</Text>
                        {order.status !== OrderStatus.RecipeCreated && <StatusKeyLegend />}
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
                                    const productRecipe =  order.orderRecipe ? order.orderRecipe.productRecipes.find(productRecipe => productRecipe.productDetail.product?.id === detail.product?.id) : undefined;

                                    if (detail.product === undefined) {
                                        return (
                                            <Tr key={index} bg="red.100">
                                                <Td colSpan={10} textAlign="center">
                                                        Error - Product data is not found, please contact support.
                                                </Td>
                                            </Tr>
                                        );
                                    }

                                    const actualRateGrTo100Kg: number | undefined = productExecution ? 100 * (productExecution.appliedRateKg ?? 0) / (order.seedsToTreatKg / 1000) : undefined;
                                    const actualRateGrToU_KS: number | undefined = (order.orderRecipe !== null && productExecution) ? (1000 * (productExecution.appliedRateKg ?? 0) / order.orderRecipe.nbSeedsUnits) : undefined;
                                    const deviation: number | undefined = (productRecipe && productExecution) ? calculateDeviation(actualRateGrToU_KS ?? 0, productRecipe.rateGrToU_KS) : undefined;

                                    return (
                                        <Tr key={index}>
                                            <Td>{detail.product.name}</Td>
                                            <Td>{detail.product.density}</Td>
                                            <Td>{productRecipe ? (productRecipe.grSlurryRecipeToMix / 1000).toFixed(2) : "N/A"}</Td>
                                            <Td>{(productExecution && productExecution.appliedRateKg !== undefined) ? productExecution.appliedRateKg.toFixed(2) : 'N/A'}</Td>
                                            <Td>
                                                {productExecution && productExecution.applicationPhoto ? (
                                                    <ImageWithModal src={productExecution.applicationPhoto} />
                                                ) : (
                                                    <Box width="150px" height="100px" bg="gray.200" display="flex" alignItems="center" justifyContent="center">
                                                            No Photo
                                                    </Box>
                                                )}
                                            </Td>
                                            <Td>{productRecipe ? productRecipe.rateGrTo100Kg.toFixed(2) : "N/A"}</Td>
                                            <Td>{actualRateGrTo100Kg !== undefined ? actualRateGrTo100Kg.toFixed(2) : 'N/A'}</Td>
                                            <Td>{productRecipe ? productRecipe.rateGrToU_KS.toFixed(2) : "N/A"}</Td>
                                            <Td>{actualRateGrToU_KS !== undefined ? actualRateGrToU_KS.toFixed(2) : 'N/A'}</Td>
                                            <Td fontSize="lg" fontWeight="bold" color={getDeviationColor(deviation ?? 0)}>
                                                {deviation !== undefined ? deviation.toFixed() + '%' : 'N/A'}
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </Tbody>
                        </Table>
                    </Box>
                    <Box w="full" display="flex" justifyContent="space-between" alignItems="center">
                        <Text fontSize="lg" fontWeight="bold" mb={2}>Slurry Consumption Per Lot</Text>
                        {order.status !== OrderStatus.RecipeCreated && <StatusKeyLegend />}
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
                                    <Td>{order.orderRecipe ? (order.orderRecipe.slurryTotalMlRecipeToMix / 1000).toFixed(2) : "N/A"}</Td>
                                    <Td>{orderExecution ? orderExecution.slurryConsumptionPerLotKg : 'N/A'}</Td>
                                    <Td>
                                        {orderExecution && orderExecution.consumptionPhoto ? (
                                            <ImageWithModal src={orderExecution.consumptionPhoto} />
                                        ) : (
                                            <Box width="150px" height="100px" bg="gray.200" display="flex" alignItems="center" justifyContent="center">
                                                    No Photo
                                            </Box>
                                        )}
                                    </Td>
                                    <Td fontWeight={(order.orderRecipe && orderExecution)  ? "bold" : "normal"} color={(order.orderRecipe && orderExecution) ? getDeviationColor(calculateDeviation(orderExecution.slurryConsumptionPerLotKg, order.orderRecipe.slurryTotalMlRecipeToMix / 1000)) : "black"}>
                                        {(order.orderRecipe && orderExecution) ? calculateDeviation(orderExecution.slurryConsumptionPerLotKg, order.orderRecipe.slurryTotalMlRecipeToMix / 1000).toFixed() + '%' : 'N/A'}
                                    </Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </Box>
                </VStack>
            </VStack>
            {/* </Center> */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Completition Comment<ModalCloseButton /></ModalHeader>
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
            <ImageModal selectedPhoto={selectedPhoto} handleClose={handleClose} />
        </VStack>
    );
};

export default LotReport;
