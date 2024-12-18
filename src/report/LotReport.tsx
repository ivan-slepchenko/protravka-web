import React, { useEffect, useState, useRef } from "react";
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, VStack, Image, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, Button } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import { fetchOrders } from "../store/ordersSlice";
import { Order } from "../store/newOrderSlice";
import { fetchOrderExecution } from "../store/executionSlice";
import { useReactToPrint } from "react-to-print";

const statusColorMap = {
    green: "#48BB78", // Green color (Chakra UI green.400)
    yellow: "#ECC94B", // Yellow color (Chakra UI yellow.400)
    red: "#F56565", // Red color (Chakra UI red.400)
};

const LotReport: React.FC = () => {
    const { lotNumber } = useParams<{ lotNumber: string }>();
    const decodedLotNumber = decodeURIComponent(lotNumber || "");
    const dispatch: AppDispatch = useDispatch();
    const orders = useSelector((state: RootState) => state.orders.activeOrders);
    const orderExecutions = useSelector((state: RootState) => state.execution.orderExecutions);
    const [order, setOrder] = useState<Order | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const componentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    useEffect(() => {
        if (order) {
            dispatch(fetchOrderExecution(order?.id));
        }
    }, [dispatch, order]);

    useEffect(() => {
        const foundOrder = orders.find(order => order.lotNumber === decodedLotNumber);
        setOrder(foundOrder || null);
    }, [orders, decodedLotNumber]);

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

    if (!order) {
        return <Text>Loading...</Text>;
    }

    const orderExecution = orderExecutions.find(execution => execution.orderId === order.id);
    const orderRecipe = order.orderRecipe;
    if (!orderExecution || !orderRecipe) {
        return <Text>Loading...</Text>;
    }

    return (
        <Box w="full" h="full" overflowY="auto" p={4} ref={componentRef}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Text fontSize="2xl" fontWeight="bold">{`Lot: ${order.lotNumber}`}</Text>
                <Button onClick={()=>print()} colorScheme="blue">Print to PDF</Button>
            </Box>
            <HStack spacing={4} mb={4}>
                <Table variant="simple" size="sm">
                    <Thead bg="orange.100">
                        <Tr>
                            <Th>Crop</Th>
                            <Th>Variety</Th>
                            <Th>Status</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>{order.crop.name}</Td>
                            <Td>{order.variety.name}</Td>
                            <Td>{order.status}</Td>
                        </Tr>
                    </Tbody>
                </Table>
                <Table variant="simple" size="sm">
                    <Thead bg="orange.100">
                        <Tr>
                            <Th>TKW</Th>
                            <Th>s.u., number of seeds</Th>
                            <Th>s.u., kg</Th>
                            <Th>Total amount, s.u.</Th>
                            <Th>Total amount, kg</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>{order.tkw}</Td>
                            <Td>{order.orderRecipe.nbSeedsUnits.toFixed(2)}</Td>
                            <Td>{order.orderRecipe.unitWeight.toFixed(2)}</Td>
                            <Td>{order.orderRecipe.nbSeedsUnits.toFixed(2)}</Td>
                            <Td>{order.seedsToTreatKg}</Td>
                        </Tr>
                    </Tbody>
                </Table>
            </HStack>
            <VStack spacing={4} align="stretch">
                <Box w="50%">
                    <Text fontSize="lg" fontWeight="bold" mb={2}>Treatment Info</Text>
                    <Table variant="simple" size="sm">
                        <Thead bg="orange.100">
                            <Tr>
                                <Th>Treatment date</Th>
                                <Th>Operator</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td>{order.applicationDate}</Td>
                                <Td>{order.operator.name + ' ' + order.operator.surname}</Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </Box>
                <Box w="full">
                    <Text fontSize="lg" fontWeight="bold" mb={2}>Lot Details</Text>
                    <Table size="sm" variant="simple">
                        <Thead bg="orange.100">
                            <Tr>
                                <Th>Component</Th>
                                <Th>Density</Th>
                                <Th>Target rate kg / slurry</Th>
                                <Th>Actual rate kg / slurry</Th>
                                <Th>Photo</Th>
                                <Th>Target rate gr / 100 kg seed</Th>
                                <Th>Actual rate gr / 100 kg seeds</Th>
                                <Th>Target rate gr / per s.u.</Th>
                                <Th>Actual rate gr / per s.u.</Th>
                                <Th>Deviation</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {order.productDetails.map((detail, index) => {
                                const productExecution = orderExecution.productExecutions.find(pe => pe.productId === detail.product?.id);
                                const productRecipe = order.orderRecipe.productRecipes.find(productRecipe => productRecipe.productDetail.product?.id === detail.product?.id);
    
                                if (productExecution === undefined || productRecipe === undefined) return null;
                                const actualRateGrTo100Kg = 100 * (productExecution.appliedRateKg ?? 0) / (orderRecipe.slurryTotalGrRecipeToMix / 1000);
                                const actualRateGrToU_KS = (100 * (productExecution.appliedRateKg ?? 0) / orderRecipe.nbSeedsUnits);
                                const deviation = calculateDeviation(productExecution.appliedRateKg ?? 0, productRecipe.grSlurryRecipeToMix ?? 0);
                                if (detail.product === undefined) return null;
                                return (
                                    <Tr key={index}>
                                        <Td>{detail.product.name}</Td>
                                        <Td>{detail.product.density}</Td>
                                        <Td>{(productRecipe.grSlurryRecipeToMix / 1000).toFixed(2)}</Td>
                                        <Td>{productExecution.appliedRateKg}</Td>
                                        <Td>
                                            {productExecution.applicationPhoto ? (
                                                <Image
                                                    src={productExecution.applicationPhoto}
                                                    alt="Detail"
                                                    width="150px"
                                                    height="100px"
                                                    objectFit="contain"
                                                    onClick={() => handlePhotoClick(productExecution.applicationPhoto || null)}
                                                    cursor="pointer"
                                                    title="Detail Photo"
                                                />
                                            ) : 'No Photo'}
                                        </Td>
                                        <Td>{productRecipe.rateGrTo100Kg}</Td>
                                        <Td>{actualRateGrTo100Kg.toFixed(2)}</Td>
                                        <Td>{productRecipe.rateGrToU_KS}</Td>
                                        <Td>{actualRateGrToU_KS.toFixed(2)}</Td>
                                        <Td>
                                            <Badge bgColor={getDeviationColor(deviation)}>
                                                {deviation.toFixed(2)}%
                                            </Badge>
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </Tbody>
                    </Table>
                </Box>
                <Box w="50%">
                    <Text fontSize="lg" fontWeight="bold" mb={2}>Treated Seeds</Text>
                    <Table variant="simple" size="sm">
                        <Thead bg="orange.100">
                            <Tr>
                                <Th colSpan={10}>Treated seeds</Th>
                                <Th>s.u.</Th>
                                <Th>kg</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td colSpan={10}>Treated seeds</Td>
                                <Td>{orderExecution.packedseedsToTreatKg ? (orderExecution.packedseedsToTreatKg / order.orderRecipe.unitWeight).toFixed(2) : 0}</Td>
                                <Td>{orderExecution.packedseedsToTreatKg ? orderExecution.packedseedsToTreatKg.toFixed(2) : 0}</Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </Box>
                <Box w="full" overflowX="auto">
                    <Text fontSize="lg" fontWeight="bold" mb={2}>Slurry Consumption Per Lot</Text>
                    <Table variant="simple" size="sm">
                        <Thead bg="orange.100">
                            <Tr>
                                <Th>Target consumption, ml</Th>
                                <Th>Actual consumption, ml</Th>
                                <Th>Photo</Th>
                                <Th>Deviation</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td>{order.orderRecipe.slurryTotalMlRecipeToMix.toFixed(2)}</Td>
                                <Td>{orderExecution.packedseedsToTreatKg}</Td>
                                <Td>
                                    {orderExecution.consumptionPhoto ? (
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
                                    ) : 'No Photo'}
                                </Td>
                                <Td>
                                    {orderExecution && (
                                        <Badge bgColor={getDeviationColor(calculateDeviation(orderExecution.packedseedsToTreatKg, order.orderRecipe.slurryTotalMlRecipeToMix))}>
                                            {calculateDeviation(orderExecution.packedseedsToTreatKg, order.orderRecipe.slurryTotalMlRecipeToMix).toFixed(2)}%
                                        </Badge>
                                    )}
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </Box>
            </VStack>
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
            <Box mt={4} w="50%">
                <Text fontSize="lg" fontWeight="bold" mb={2}>Status Key/Legend</Text>
                <Table variant="simple" size="sm">
                    <Tbody>
                        <Tr>
                            <Td><Badge bgColor={statusColorMap.green}>😊</Badge></Td>
                            <Td>90-105%</Td>
                        </Tr>
                        <Tr>
                            <Td><Badge bgColor={statusColorMap.yellow}>😐</Badge></Td>
                            <Td>80-90%; 105-115%</Td>
                        </Tr>
                        <Tr>
                            <Td><Badge bgColor={statusColorMap.red}>😞</Badge></Td>
                            <Td>&lt;80%; &gt;115%</Td>
                        </Tr>
                    </Tbody>
                </Table>
            </Box>
        </Box>
    );
};

export default LotReport;
