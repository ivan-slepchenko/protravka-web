import React, { useEffect, useState } from "react";
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, Select, Input, CloseButton } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store/store";
import { OrderStatus } from "../store/newOrderSlice";
import { Bar } from "react-chartjs-2"; // Import Bar chart
import { useTranslation } from 'react-i18next';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

type StatusColorMap = {
    [key in OrderStatus]: string;
};

const statusColorMap: StatusColorMap = {
    [OrderStatus.Completed]: "#48BB78", // Green color (Chakra UI green.400)
    [OrderStatus.ToAcknowledge]: "#ECC94B", // Yellow color (Chakra UI yellow.400)
    [OrderStatus.Failed]: "#F56565", // Red color (Chakra UI red.400)
    [OrderStatus.TreatmentInProgress]: "#ED8936", // Orange color (Chakra UI orange.400)
    [OrderStatus.Archived]: "#4299E1", // Blue color (Chakra UI blue.400)
    [OrderStatus.RecipeCreated]: "#A0AEC0", // Gray color (Chakra UI gray.400)
    [OrderStatus.LabAssignmentCreated]: "#A0AEC0", // Gray color (Chakra UI gray.400)
    [OrderStatus.LabToControl]: "#A0AEC0", // Gray color (Chakra UI gray.400)
    [OrderStatus.TkwConfirmed]: "#A0AEC0", // Gray color (Chakra UI gray.400)
};

const Report: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
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
        setFilteredOrders(orders);
    }, [orders]);

    useEffect(() => {
        const filtered = orders.filter(order => {
            const matchesCrop = filters.crop ? order.crop.name.includes(filters.crop) : true;
            const matchesVariety = filters.variety ? order.variety.name.includes(filters.variety) : true;
            const matchesOperator = filters.operator
                ? order.operator
                    ? order.operator.name.includes(filters.operator)
                    : false
                : true;
            const matchesStatus = filters.status ? order.status === filters.status : true;
            const matchesStartDate = filters.startDate
                ? order.applicationDate === null
                    ? false 
                    : new Date(order.applicationDate) >= new Date(filters.startDate)
                : true;
            const matchesEndDate = filters.endDate
                ? order.applicationDate === null 
                    ? false
                    : new Date(order.applicationDate) <= new Date(filters.endDate)
                : true;
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

    const handleLotClick = (orderId: string) => {
        navigate(`/lot-report/${orderId}`);
    };

    // Collect crops from filtered orders
    const cropStats = filteredOrders.reduce((acc, order) => {
        const cropStat = acc.find(stat => stat.crop === order.crop.name);
        if (cropStat) {
            cropStat.su += order.orderRecipe ? order.orderRecipe.nbSeedsUnits : 0;
            cropStat.kg += order.seedsToTreatKg === null ? 0 : order.seedsToTreatKg;
        } else {
            acc.push({
                crop: order.crop.name,
                su: order.orderRecipe ? order.orderRecipe.nbSeedsUnits : 0,
                kg: order.seedsToTreatKg === null ? 0 : order.seedsToTreatKg,
            });
        }
        return acc;
    }, [] as { crop: string; su: number; kg: number }[]);

    // Group filtered orders based on their status
    const getCategoryStats = () => {
        const stats = {
            approved: { count: 0, su: 0, kg: 0 },
            to_acknowledge: { count: 0, su: 0, kg: 0 },
            disapproved: { count: 0, su: 0, kg: 0 },
        };

        filteredOrders.forEach((order) => {
            switch (order.status) {
                case OrderStatus.Completed:
                    stats.approved.count++;
                    stats.approved.su += order.orderRecipe ? order.orderRecipe.nbSeedsUnits : 0;
                    stats.approved.kg += order.seedsToTreatKg === null ? 0 : order.seedsToTreatKg;
                    break;
                case OrderStatus.ToAcknowledge:
                    stats.to_acknowledge.count++;
                    stats.to_acknowledge.su += order.orderRecipe ? order.orderRecipe.nbSeedsUnits : 0;
                    stats.to_acknowledge.kg += order.seedsToTreatKg === null ? 0 : order.seedsToTreatKg;
                    break;
                case OrderStatus.Failed:
                    stats.disapproved.count++;
                    stats.disapproved.su += order.orderRecipe ? order.orderRecipe.nbSeedsUnits : 0;
                    stats.disapproved.kg += order.seedsToTreatKg === null ? 0 : order.seedsToTreatKg;
                    break;
                default:
                    break;
            }
        });

        const total = {
            count: stats.approved.count + stats.to_acknowledge.count + stats.disapproved.count,
            su: stats.approved.su + stats.to_acknowledge.su + stats.disapproved.su,
            kg: stats.approved.kg + stats.to_acknowledge.kg + stats.disapproved.kg,
        };

        return { stats, total };
    };

    const { stats, total } = getCategoryStats();

    // Calculate category stats for the chart
    const categoryStats = {
        approved: 0,
        to_acknowledge: 0,
        disapproved: 0,
        inProgress: 0, // Add inProgress category
    };

    filteredOrders.forEach((order) => {
        switch (order.status) {
            case OrderStatus.Completed:
                categoryStats.approved++;
                break;
            case OrderStatus.ToAcknowledge:
                categoryStats.to_acknowledge++;
                break;
            case OrderStatus.Failed:
                categoryStats.disapproved++;
                break;
            case OrderStatus.TreatmentInProgress: // Add case for In Progress
                categoryStats.inProgress++;
                break;
            default:
                break;
        }
    });

    // Chart Data
    const chartData = {
        labels: [t('report.orders')],
        datasets: [
            {
                label: t('report.approved'),
                data: [categoryStats.approved],
                backgroundColor: statusColorMap[OrderStatus.Completed],
            },
            {
                label: t('report.to_acknowledge'),
                data: [categoryStats.to_acknowledge],
                backgroundColor: statusColorMap[OrderStatus.ToAcknowledge],
            },
            {
                label: t('report.disapproved'),
                data: [categoryStats.disapproved],
                backgroundColor: statusColorMap[OrderStatus.Failed],
            },
            {
                label: t('report.in_progress'),
                data: [categoryStats.inProgress],
                backgroundColor: statusColorMap[OrderStatus.TreatmentInProgress],
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
                <Text fontSize="2xl" fontWeight="bold">{t('report.report')}</Text>
                <CloseButton onClick={handleClose}></CloseButton>
            </Box>
            <Box p="4" px={6}>
                {/* Filters */}
                <HStack spacing={4} mb={4} w="full">
                    <Box flex="1">
                        <Text fontSize="sm" mb={1}>{t('report.crop')}</Text>
                        <Select placeholder={t('report.all_crops')} name="crop" onChange={handleFilterChange}>
                            {Array.from(new Set(orders.map(order => order.crop.name))).map(crop => (
                                <option key={crop} value={crop}>{crop}</option>
                            ))}
                        </Select>
                    </Box>
                    <Box flex="1">
                        <Text fontSize="sm" mb={1}>{t('report.variety')}</Text>
                        <Select placeholder={t('report.all_varieties')} name="variety" onChange={handleFilterChange}>
                            {getVarieties().map(variety => (
                                <option key={variety} value={variety}>{variety}</option>
                            ))}
                        </Select>
                    </Box>
                    <Box flex="1">
                        <Text fontSize="sm" mb={1}>{t('report.start_date')}</Text>
                        <Input type="date" placeholder={t('report.start_date')} name="startDate" onChange={handleFilterChange} />
                    </Box>
                    <Box flex="1">
                        <Text fontSize="sm" mb={1}>{t('report.end_date')}</Text>
                        <Input type="date" placeholder={t('report.end_date')} name="endDate" onChange={handleFilterChange} />
                    </Box>
                    <Box flex="1">
                        <Text fontSize="sm" mb={1}>{t('report.operator')}</Text>
                        <Select placeholder={t('report.all_operators')} name="operator" onChange={handleFilterChange}>
                            {Array.from(new Set(orders.map(order => order.operator ? order.operator.name : 'N/A'))).map(operator => (
                                <option key={operator} value={operator}>{operator}</option>
                            ))}
                        </Select>
                    </Box>
                    <Box flex="1">
                        <Text fontSize="sm" mb={1}>{t('report.status')}</Text>
                        <Select placeholder={t('report.all_statuses')} name="status" onChange={handleFilterChange}>
                            {Object.values(OrderStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </Select>
                    </Box>
                </HStack>

                <Box display="flex" flexWrap="wrap" w="full">
                    {/* Seed Processing Report */}
                    <Box mb={4} flex="1 1 100%" minWidth="300px">
                        <Text fontSize="lg" fontWeight="bold" mb={4} textAlign="center">{t('report.seed_processing_report')}</Text>
                        <Table variant="simple" size="sm">
                            <Thead bg="orange.100">
                                <Tr>
                                    <Th>#</Th>
                                    <Th>{t('report.crop')}</Th>
                                    <Th>{t('report.variety')}</Th>
                                    <Th>{t('report.lot')}</Th>
                                    <Th>{t('report.treatment_date')}</Th>
                                    <Th>{t('report.operator')}</Th>
                                    <Th>{t('report.lot_size_su')}</Th>
                                    <Th>{t('report.lot_size_kg')}</Th>
                                    <Th>{t('report.status')}</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredOrders.map((order, index) => (
                                    <Tr key={order.id} onClick={() => handleLotClick(order.id)} style={{ cursor: 'pointer' }}>
                                        <Td>{index + 1}</Td>
                                        <Td>{order.crop.name}</Td>
                                        <Td>{order.variety.name}</Td>
                                        <Td>{order.lotNumber}</Td>
                                        <Td>{order.applicationDate === null ? 'N/A' : new Date(order.applicationDate).toLocaleDateString()}</Td>
                                        <Td>{order.operator ? order.operator.name : 'N/A'}</Td>
                                        <Td>{order.orderRecipe ? order.orderRecipe.nbSeedsUnits.toFixed(1) : "N/A"}</Td>
                                        <Td>{order.seedsToTreatKg}</Td>
                                        <Td>{getStatusBadge(order.status)}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>

                    {/* Total */}
                    <Box mb={4} flex="1 1 50%" minWidth="200px" p={5}>
                        <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={4}>{t('report.total')}</Text>
                        <Table variant="simple" size="sm">
                            <Thead bg="orange.100">
                                <Tr>
                                    <Th>{t('report.crop')}</Th>
                                    <Th>{t('units.su')}</Th>
                                    <Th>{t('units.kg')}</Th>
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

                    {/* Treatment Overview Chart */}
                    {filters.status === "" && (
                        <Box height="300px" flex="1 1 50%" minWidth="200px" p={5}>
                            <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={2}>{t('report.treatment_overview')}</Text>
                            <Bar data={chartData} options={chartOptions} />
                        </Box>
                    )}

                    {/* Summary */}
                    {filters.status === "" && (
                        <Box mb={4} flex="1 1 100%" minWidth="300px">
                            <Text fontSize="lg" fontWeight="bold" mt={8} mb={4} textAlign="center">{t('report.summary')}</Text>
                            <Table variant="simple" size="sm">
                                <Thead bg="orange.100">
                                    <Tr>
                                        <Th>{t('report.category')}</Th>
                                        <Th>{t('report.number_of_lots')}</Th>
                                        <Th>{t('units.su')}</Th>
                                        <Th>{t('units.kg')}</Th>
                                        <Th>{t('units.percentage')}</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    <Tr bg="green.200">
                                        <Td>{t('report.approved_by_manager')}</Td>
                                        <Td>{stats.approved.count}</Td>
                                        <Td>{stats.approved.su.toFixed(1)}</Td>
                                        <Td>{stats.approved.kg.toFixed(1)}</Td>
                                        <Td>{total.count > 0 ? `${((stats.approved.count / total.count) * 100).toFixed(1)}%` : 'N/A'}</Td>
                                    </Tr>
                                    <Tr bg="yellow.200">
                                        <Td>{t('report.to_be_acknowledged')}</Td>
                                        <Td>{stats.to_acknowledge.count}</Td>
                                        <Td>{stats.to_acknowledge.su.toFixed(1)}</Td>
                                        <Td>{stats.to_acknowledge.kg.toFixed(1)}</Td>
                                        <Td>{total.count > 0 ? `${((stats.to_acknowledge.count / total.count) * 100).toFixed(1)}%` : 'N/A'}</Td>
                                    </Tr>
                                    <Tr bg="red.300">
                                        <Td>{t('report.disapproved_by_manager')}</Td>
                                        <Td>{stats.disapproved.count}</Td>
                                        <Td>{stats.disapproved.su.toFixed(1)}</Td>
                                        <Td>{stats.disapproved.kg.toFixed(1)}</Td>
                                        <Td>{total.count > 0 ? `${((stats.disapproved.count / total.count) * 100).toFixed(1)}%` : 'N/A'}</Td>
                                    </Tr>
                                    <Tr fontWeight="bold">
                                        <Td>{t('report.total')}</Td>
                                        <Td>{total.count}</Td>
                                        <Td>{total.su.toFixed(1)}</Td>
                                        <Td>{total.kg.toFixed(1)}</Td>
                                        <Td>{total.count > 0 ? '100%' : 'N/A'}</Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};
// Export Report component
export default Report;
