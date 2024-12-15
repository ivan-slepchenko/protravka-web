import React, { useEffect, useState } from "react";
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, VStack } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import { fetchOrders } from "../store/ordersSlice";
import { Order, OrderStatus } from "../store/newOrderSlice";

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
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    useEffect(() => {
        const foundOrder = orders.find(order => order.lotNumber === decodedLotNumber);
        setOrder(foundOrder || null);
    }, [orders, decodedLotNumber]);

    const getDeviationColor = (deviation: number) => {
        if (deviation >= 90 && deviation <= 105) return statusColorMap.green;
        if ((deviation >= 80 && deviation < 90) || (deviation > 105 && deviation <= 115)) return statusColorMap.yellow;
        return statusColorMap.red;
    };

    if (!order) {
        return <Text>Loading...</Text>;
    }

    return (
        <Box w="full" h="full" overflowY="auto" p={4}>
            <Text fontSize="2xl" fontWeight="bold" mb={4}>5. By Lot</Text>
            <HStack spacing={4} mb={4}>
                <Box>
                    <Text fontSize="sm" mb={1}>Lot</Text>
                    <Text>{order.lotNumber}</Text>
                </Box>
                <Box>
                    <Text fontSize="sm" mb={1}>Crop</Text>
                    <Text>{order.crop.name}</Text>
                </Box>
                <Box>
                    <Text fontSize="sm" mb={1}>Variety</Text>
                    <Text>{order.variety.name}</Text>
                </Box>
                <Box>
                    <Text fontSize="sm" mb={1}>Status</Text>
                    <Text>{order.status}</Text>
                </Box>
            </HStack>
            <HStack spacing={4} mb={4}>
                <Box>
                    <Text fontSize="sm" mb={1}>TKW</Text>
                    <Text>{order.tkw}</Text>
                </Box>
                <Box>
                    <Text fontSize="sm" mb={1}>s.u., number of seeds</Text>
                    <Text>{order.orderRecipe.nbSeedsUnits.toFixed(1)}</Text>
                </Box>
                <Box>
                    <Text fontSize="sm" mb={1}>s.u., kg</Text>
                    <Text>{order.seedsToTreatKg}</Text>
                </Box>
                <Box>
                    <Text fontSize="sm" mb={1}>Total amount, s.u.</Text>
                    <Text>{order.orderRecipe.nbSeedsUnits.toFixed(1)}</Text>
                </Box>
                <Box>
                    <Text fontSize="sm" mb={1}>Total amount, kg</Text>
                    <Text>{order.seedsToTreatKg}</Text>
                </Box>
            </HStack>
            <VStack spacing={4} align="stretch">
                <Box>
                    <Text fontSize="lg" fontWeight="bold" mb={2}>Lot Details</Text>
                    <Table variant="striped" size="md" border="1px solid black">
                        <Thead>
                            <Tr>
                                <Th>Treatment date</Th>
                                <Th>Operator</Th>
                                <Th>Density</Th>
                                <Th>Target rate per slurry</Th>
                                <Th>Actual rate per slurry</Th>
                                <Th>Photo</Th>
                                <Th>Target rate per 100 kg seed</Th>
                                <Th>Actual rate per 100 kg seeds</Th>
                                <Th>Target rate per s.u.</Th>
                                <Th>Actual rate per s.u.</Th>
                                <Th>Deviation</Th>
                                <Th>Comment</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {order.productDetails.map((detail, index) => (
                                <Tr key={index}>
                                    <Td>{order.applicationDate}</Td>
                                    <Td>{order.operator.name}</Td>
                                    <Td>{detail.product?.density}</Td>
                                    <Td>{detail.rate}</Td>
                                    <Td>{detail.rate}</Td>
                                    <Td>Photo</Td>
                                    <Td>{detail.rate}</Td>
                                    <Td>{detail.rate}</Td>
                                    <Td>{detail.rate}</Td>
                                    <Td>{detail.rate}</Td>
                                    <Td>
                                        <Badge bgColor={getDeviationColor(detail.rate)}>
                                            {detail.rate}%
                                        </Badge>
                                    </Td>
                                    <Td>Comment</Td>
                                </Tr>
                            ))}
                            <Tr>
                                <Td colSpan={10}>Treated seeds</Td>
                                <Td>{order.orderRecipe.nbSeedsUnits.toFixed(1)}</Td>
                                <Td>{order.seedsToTreatKg}</Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </Box>
                <Box>
                    <Text fontSize="lg" fontWeight="bold" mb={2}>Slurry Consumption Per Lot</Text>
                    <Table variant="striped" size="md" border="1px solid black">
                        <Thead>
                            <Tr>
                                <Th>Target consumption, ml</Th>
                                <Th>Actual consumption, ml</Th>
                                <Th>Photo</Th>
                                <Th>Deviation</Th>
                                <Th>Comment</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td>{order.orderRecipe.slurryTotalMlRecipeToMix}</Td>
                                <Td>{order.orderRecipe.slurryTotalMlRecipeToMix}</Td>
                                <Td>Photo</Td>
                                <Td>
                                    <Badge bgColor={getDeviationColor(order.orderRecipe.slurryTotalMlRecipeToMix)}>
                                        {order.orderRecipe.slurryTotalMlRecipeToMix}%
                                    </Badge>
                                </Td>
                                <Td>Comment</Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </Box>
            </VStack>
            <Box mt={4}>
                <Text fontSize="lg" fontWeight="bold" mb={2}>Status Key/Legend</Text>
                <Table variant="simple" size="sm" border="1px solid black">
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
