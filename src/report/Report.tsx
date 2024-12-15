import React, { useEffect } from "react";
import { Box, Text, Button, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, VStack } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import { fetchOrders } from "../store/ordersSlice";
import { OrderStatus } from "../store/newOrderSlice";
import { Bar } from "react-chartjs-2"; // Import Bar chart

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Report: React.FC = () => {
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const orders = useSelector((state: RootState) => state.orders.activeOrders);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const handleClose = () => {
        navigate('/board');
    };

    const getStatusBadge = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.InProgress:
                return <Badge colorScheme="yellow">In Progress</Badge>;
            case OrderStatus.ToAcknowledge:
                return <Badge colorScheme="red">To Acknowledge</Badge>;
            case OrderStatus.Completed:
                return <Badge colorScheme="green">Completed</Badge>;
            case OrderStatus.Failed:
                return <Badge colorScheme="red">Failed</Badge>;
            default:
                return <Badge colorScheme="gray">Unknown</Badge>;
        }
    };

    // Collect crops from state.orders
    const cropStats = orders.reduce((acc, order) => {
        const cropStat = acc.find(stat => stat.crop === order.crop.name);
        if (cropStat) {
            cropStat.su += order.orderRecipe.nbSeedsUnits;
            cropStat.kg += order.seedsToTreatKg;
        } else {
            acc.push({
                crop: order.crop.name,
                su: order.orderRecipe.nbSeedsUnits,
                kg: order.seedsToTreatKg,
            });
        }
        return acc;
    }, [] as { crop: string; su: number; kg: number }[]);
    
    // Group orders based on their status
    const getCategoryStats = () => {
        const stats = {
            approved: { count: 0, su: 0, kg: 0 },
            toAcknowledge: { count: 0, su: 0, kg: 0 },
            disapproved: { count: 0, su: 0, kg: 0 },
        };
    
        orders.forEach((order) => {
            switch (order.status) {
                case OrderStatus.Completed:
                    stats.approved.count++;
                    stats.approved.su += order.orderRecipe.nbSeedsUnits;
                    stats.approved.kg += order.seedsToTreatKg;
                    break;
                case OrderStatus.ToAcknowledge:
                    stats.toAcknowledge.count++;
                    stats.toAcknowledge.su += order.orderRecipe.nbSeedsUnits;
                    stats.toAcknowledge.kg += order.seedsToTreatKg;
                    break;
                case OrderStatus.Failed:
                    stats.disapproved.count++;
                    stats.disapproved.su += order.orderRecipe.nbSeedsUnits;
                    stats.disapproved.kg += order.seedsToTreatKg;
                    break;
                default:
                    break;
            }
        });
    
        const total = {
            count: stats.approved.count + stats.toAcknowledge.count + stats.disapproved.count,
            su: stats.approved.su + stats.toAcknowledge.su + stats.disapproved.su,
            kg: stats.approved.kg + stats.toAcknowledge.kg + stats.disapproved.kg,
        };
    
        return { stats, total };
    };
    
    const { stats, total } = getCategoryStats();

    // Calculate category stats for the chart
    const categoryStats = {
        approved: 0,
        toAcknowledge: 0,
        disapproved: 0,
        inProgress: 0, // Add inProgress category
    };

    orders.forEach((order) => {
        switch (order.status) {
            case OrderStatus.Completed:
                categoryStats.approved++;
                break;
            case OrderStatus.ToAcknowledge:
                categoryStats.toAcknowledge++;
                break;
            case OrderStatus.Failed:
                categoryStats.disapproved++;
                break;
            case OrderStatus.InProgress: // Add case for In Progress
                categoryStats.inProgress++;
                break;
            default:
                break;
        }
    });

    // Chart Data
    const chartData = {
        labels: ["Orders"],
        datasets: [
            {
                label: "Approved",
                data: [categoryStats.approved],
                backgroundColor: "#28a745", // Green color
            },
            {
                label: "To Acknowledge",
                data: [categoryStats.toAcknowledge],
                backgroundColor: "#ffc107", // Yellow color
            },
            {
                label: "Disapproved",
                data: [categoryStats.disapproved],
                backgroundColor: "#dc3545", // Red color
            },
            {
                label: "In Progress", // Add In Progress label
                data: [categoryStats.inProgress],
                backgroundColor: "#17a2b8", // Blue color
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { stacked: true },
            y: { stacked: true },
        },
        plugins: {
            legend: { position: "top" as const },
            title: {
                display: true,
                text: "Treatment Overview",
                font: { size: 18, weight: "bold" as const },
            },
        },
    };

    return (
        <Box w="full" h="full" overflowY="auto">
            <Box display="flex" justifyContent="space-between" alignItems="center" p="4" borderBottom="1px solid #ccc">
                <Text fontSize="2xl" fontWeight="bold">Report</Text>
                <Button onClick={handleClose}>Close</Button>
            </Box>
            <Box p="4">
                <Box maxW="100%" overflowX="auto" p={5}>
                    <HStack>
                        <VStack>
                            <Text fontSize="xl" fontWeight="bold" mb={4}>
                                {'Seed Processing Report'}
                            </Text>                            {/* Original Table */}
                            <Table variant="striped">
                                <Thead>
                                    <Tr>
                                        <Th>#</Th>
                                        <Th>Crop</Th>
                                        <Th>Variety</Th>
                                        <Th>Lot</Th>
                                        <Th>Treatment Date</Th>
                                        <Th>Operator</Th>
                                        <Th>Lot Size (s.u.)</Th>
                                        <Th>Lot Size (kg)</Th>
                                        <Th>Status</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {orders.map((order, index) => (
                                        <Tr key={order.id}>
                                            <Td>{index + 1}</Td>
                                            <Td>{order.crop.name}</Td>
                                            <Td>{order.variety.name}</Td>
                                            <Td>{order.lotNumber}</Td>
                                            <Td>{order.applicationDate}</Td>
                                            <Td>{order.operator.name}</Td>
                                            <Td>{order.orderRecipe.nbSeedsUnits.toFixed(1)}</Td>
                                            <Td>{order.seedsToTreatKg}</Td>
                                            <Td>{getStatusBadge(order.status)}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </VStack>
                        <Box flex="0.5">
                            <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={2}>Total</Text>
                            <Table variant="simple" size="md" border="1px solid black">
                                <Thead>
                                    <Tr>
                                        <Th>Crop</Th>
                                        <Th>s.u.</Th>
                                        <Th>kg</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {cropStats.map((stat) => (
                                        <Tr key={stat.crop}>
                                            <Td>{stat.crop}</Td>
                                            <Td>{stat.su.toFixed(1)}</Td>
                                            <Td>{stat.kg.toFixed(1)}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </HStack>

                    {/* New Summary Table */}
                    <Text fontSize="lg" fontWeight="bold" mt={8} mb={4}>Summary</Text>
                    <Table variant="simple" size="md" border="1px solid black">
                        <Thead>
                            <Tr>
                                <Th>Category</Th>
                                <Th>Number of Lots</Th>
                                <Th>s.u.</Th>
                                <Th>kg</Th>
                                <Th>%</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr bg="green.200">
                                <Td>Approved by manager</Td>
                                <Td>{stats.approved.count}</Td>
                                <Td>{stats.approved.su.toFixed(1)}</Td>
                                <Td>{stats.approved.kg.toFixed(1)}</Td>
                                <Td>{((stats.approved.count / total.count) * 100).toFixed(1)}%</Td>
                            </Tr>
                            <Tr bg="yellow.200">
                                <Td>To be acknowledged</Td>
                                <Td>{stats.toAcknowledge.count}</Td>
                                <Td>{stats.toAcknowledge.su.toFixed(1)}</Td>
                                <Td>{stats.toAcknowledge.kg.toFixed(1)}</Td>
                                <Td>{((stats.toAcknowledge.count / total.count) * 100).toFixed(1)}%</Td>
                            </Tr>
                            <Tr bg="red.300">
                                <Td>Disapproved by manager</Td>
                                <Td>{stats.disapproved.count}</Td>
                                <Td>{stats.disapproved.su.toFixed(1)}</Td>
                                <Td>{stats.disapproved.kg.toFixed(1)}</Td>
                                <Td>{((stats.disapproved.count / total.count) * 100).toFixed(1)}%</Td>
                            </Tr>
                            <Tr fontWeight="bold">
                                <Td>Total</Td>
                                <Td>{total.count}</Td>
                                <Td>{total.su.toFixed(1)}</Td>
                                <Td>{total.kg.toFixed(1)}</Td>
                                <Td>100%</Td>
                            </Tr>
                        </Tbody>
                    </Table>

                    {/* Treatment Overview Chart */}
                    <Box mt={10} height="400px">
                        <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={2}>Treatment Overview</Text>
                        <Bar data={chartData} options={chartOptions} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Report;
