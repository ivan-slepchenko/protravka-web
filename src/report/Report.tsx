import React, { useEffect, useState } from "react";
import { Box, Text, Button, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, Select, Input } from "@chakra-ui/react";
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

type StatusColorMap = {
    [key in OrderStatus]: string;
};

const statusColorMap: StatusColorMap = {
    [OrderStatus.Completed]: "#48BB78", // Green color (Chakra UI green.400)
    [OrderStatus.ToAcknowledge]: "#ECC94B", // Yellow color (Chakra UI yellow.400)
    [OrderStatus.Failed]: "#F56565", // Red color (Chakra UI red.400)
    [OrderStatus.InProgress]: "#ED8936", // Orange color (Chakra UI orange.400)
    [OrderStatus.Archived]: "#4299E1", // Blue color (Chakra UI blue.400)
    [OrderStatus.NotStarted]: "#A0AEC0", // Gray color (Chakra UI gray.400)
};

const Report: React.FC = () => {
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const orders = useSelector((state: RootState) => state.orders.activeOrders);

    const [filteredOrders, setFilteredOrders] = useState(orders);
    const [filters, setFilters] = useState({
        crop: "",
        variety: "",
        startDate: "",
        endDate: "",
        operator: "",
        status: "",
    });

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    useEffect(() => {
        setFilteredOrders(orders);
    }, [orders]);

    useEffect(() => {
        const filtered = orders.filter(order => {
            const matchesCrop = filters.crop ? order.crop.name.includes(filters.crop) : true;
            const matchesVariety = filters.variety ? order.variety.name.includes(filters.variety) : true;
            const matchesOperator = filters.operator ? order.operator.name.includes(filters.operator) : true;
            const matchesStatus = filters.status ? order.status === filters.status : true;
            const matchesStartDate = filters.startDate ? new Date(order.applicationDate) >= new Date(filters.startDate) : true;
            const matchesEndDate = filters.endDate ? new Date(order.applicationDate) <= new Date(filters.endDate) : true;
            return matchesCrop && matchesVariety && matchesOperator && matchesStatus && matchesStartDate && matchesEndDate;
        });
        setFilteredOrders(filtered);
    }, [filters, orders]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    };

    const handleClose = () => {
        navigate('/board');
    };

    const getStatusBadge = (status: OrderStatus) => {
        const color = statusColorMap[status];
        return <Badge bgColor={color}>{status}</Badge>;
    };

    const handleLotClick = (lotNumber: string) => {
        const encodedLotNumber = encodeURIComponent(lotNumber);
        navigate(`/lot-report/${encodedLotNumber}`);
    };

    // Collect crops from filtered orders
    const cropStats = filteredOrders.reduce((acc, order) => {
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

    // Group filtered orders based on their status
    const getCategoryStats = () => {
        const stats = {
            approved: { count: 0, su: 0, kg: 0 },
            toAcknowledge: { count: 0, su: 0, kg: 0 },
            disapproved: { count: 0, su: 0, kg: 0 },
            inProgress: { count: 0, su: 0, kg: 0 },
            notStarted: { count: 0, su: 0, kg: 0 },
        };

        filteredOrders.forEach((order) => {
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
                case OrderStatus.InProgress:
                    stats.inProgress.count++;
                    stats.inProgress.su += order.orderRecipe.nbSeedsUnits;
                    stats.inProgress.kg += order.seedsToTreatKg;
                    break;
                case OrderStatus.NotStarted:
                    stats.notStarted.count++;
                    stats.notStarted.su += order.orderRecipe.nbSeedsUnits;
                    stats.notStarted.kg += order.seedsToTreatKg;
                    break;
                default:
                    break;
            }
        });

        const total = {
            count: stats.approved.count + stats.toAcknowledge.count + stats.disapproved.count + stats.inProgress.count + stats.notStarted.count,
            su: stats.approved.su + stats.toAcknowledge.su + stats.disapproved.su + stats.inProgress.su + stats.notStarted.su,
            kg: stats.approved.kg + stats.toAcknowledge.kg + stats.disapproved.kg + stats.inProgress.kg + stats.notStarted.kg,
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

    filteredOrders.forEach((order) => {
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
                backgroundColor: statusColorMap[OrderStatus.Completed],
            },
            {
                label: "To Acknowledge",
                data: [categoryStats.toAcknowledge],
                backgroundColor: statusColorMap[OrderStatus.ToAcknowledge],
            },
            {
                label: "Disapproved",
                data: [categoryStats.disapproved],
                backgroundColor: statusColorMap[OrderStatus.Failed],
            },
            {
                label: "In Progress",
                data: [categoryStats.inProgress],
                backgroundColor: statusColorMap[OrderStatus.InProgress],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true,
                barThickness: 16,
                barPercentage: 0.5,
            },
            y: {
                stacked: true,
                beginAtZero: true,
            },
        },
        plugins: {
            legend: { position: "bottom" as const },
        },
    };

    // Get varieties based on selected crop
    const getVarieties = () => {
        if (filters.crop) {
            const selectedCrop = orders.find(order => order.crop.name === filters.crop);
            if (selectedCrop) {
                return Array.from(new Set(orders.filter(order => order.crop.name === filters.crop).map(order => order.variety.name)));
            }
        }
        return Array.from(new Set(orders.map(order => order.variety.name)));
    };

    return (
        <Box w="full" h="full" overflowY="auto">
            <Box display="flex" justifyContent="space-between" alignItems="center" p="4" borderBottom="1px solid #ccc">
                <Text fontSize="2xl" fontWeight="bold">Report</Text>
                <Button onClick={handleClose}>Close</Button>
            </Box>
            <Box p="4" px={6}>
                {/* Filters */}
                <HStack spacing={4} mb={4} w="full">
                    <Box flex="1">
                        <Text fontSize="sm" mb={1}>Crop</Text>
                        <Select placeholder="All Crops" name="crop" onChange={handleFilterChange}>
                            {Array.from(new Set(orders.map(order => order.crop.name))).map(crop => (
                                <option key={crop} value={crop}>{crop}</option>
                            ))}
                        </Select>
                    </Box>
                    <Box flex="1">
                        <Text fontSize="sm" mb={1}>Variety</Text>
                        <Select placeholder="All Varieties" name="variety" onChange={handleFilterChange}>
                            {getVarieties().map(variety => (
                                <option key={variety} value={variety}>{variety}</option>
                            ))}
                        </Select>
                    </Box>
                    <Box flex="1">
                        <Text fontSize="sm" mb={1}>Start Date</Text>
                        <Input type="date" placeholder="Start Date" name="startDate" onChange={handleFilterChange} />
                    </Box>
                    <Box flex="1">
                        <Text fontSize="sm" mb={1}>End Date</Text>
                        <Input type="date" placeholder="End Date" name="endDate" onChange={handleFilterChange} />
                    </Box>
                    <Box flex="1">
                        <Text fontSize="sm" mb={1}>Operator</Text>
                        <Select placeholder="All Operators" name="operator" onChange={handleFilterChange}>
                            {Array.from(new Set(orders.map(order => order.operator.name))).map(operator => (
                                <option key={operator} value={operator}>{operator}</option>
                            ))}
                        </Select>
                    </Box>
                    <Box flex="1">
                        <Text fontSize="sm" mb={1}>Status</Text>
                        <Select placeholder="All Statuses" name="status" onChange={handleFilterChange}>
                            {Object.values(OrderStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </Select>
                    </Box>
                </HStack>

                <Box display="grid" gridTemplateColumns="70% 30%" gridTemplateRows="auto auto" gap={4}>
                    {/* Seed Processing Report */}
                    <Box gridColumn="1 / 2" gridRow="1 / 2">
                        <Text fontSize="lg" fontWeight="bold" mb={4} textAlign="center">Seed Processing Report</Text>
                        <Table variant="simple" size="sm" border="1px solid" borderColor="gray.200">
                            <Thead bg="orange.100">
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
                                {filteredOrders.map((order, index) => (
                                    <Tr key={order.id} onClick={() => handleLotClick(order.lotNumber)} style={{ cursor: 'pointer' }}>
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
                    </Box>

                    {/* Total */}
                    <Box gridColumn="2 / 3" gridRow="1 / 2">
                        <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={4}>Total</Text>
                        <Table variant="simple" size="sm" border="1px solid" borderColor="gray.200">
                            <Thead bg="orange.100">
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

                    {/* Summary */}
                    {filters.status === "" && (
                        <Box gridColumn="1 / 2" gridRow="2 / 3">
                            <Text fontSize="lg" fontWeight="bold" mt={8} mb={4} textAlign="center">Summary</Text>
                            <Table variant="simple" size="sm" border="1px solid" borderColor="gray.200">
                                <Thead bg="orange.100">
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
                                    <Tr bg="orange.200">
                                        <Td>In Progress</Td>
                                        <Td>{stats.inProgress.count}</Td>
                                        <Td>{stats.inProgress.su.toFixed(1)}</Td>
                                        <Td>{stats.inProgress.kg.toFixed(1)}</Td>
                                        <Td>{((stats.inProgress.count / total.count) * 100).toFixed(1)}%</Td>
                                    </Tr>
                                    <Tr bg="gray.200">
                                        <Td>Not Started</Td>
                                        <Td>{stats.notStarted.count}</Td>
                                        <Td>{stats.notStarted.su.toFixed(1)}</Td>
                                        <Td>{stats.notStarted.kg.toFixed(1)}</Td>
                                        <Td>{((stats.notStarted.count / total.count) * 100).toFixed(1)}%</Td>
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
                        </Box>
                    )}

                    {/* Treatment Overview Chart */}
                    {filters.status === "" && (
                        <Box gridColumn="2 / 3" gridRow="2 / 3" mt={10} height="300px">
                            <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={2}>Treatment Overview</Text>
                            <Bar data={chartData} options={chartOptions} />
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Report;
