import React, { useEffect } from "react";
import { Box, Text, Button, Table, Thead, Tbody, Tr, Th, Td, Badge } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import { fetchOrders } from "../store/ordersSlice";
import { OrderStatus } from "../store/newOrderSlice";

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
            return <Badge colorScheme="green">Failed</Badge>;
        default:
            return <Badge colorScheme="gray">Unknown</Badge>;
        }
    };

    return (
        <Box w="full" h="full" overflowY="auto">
            <Box display="flex" justifyContent="space-between" alignItems="center" p="4" borderBottom="1px solid #ccc">
                <Text fontSize="2xl" fontWeight="bold">Report</Text>
                <Button onClick={handleClose}>Close</Button>
            </Box>
            <Box p="4">
                <Box maxW="100%" overflowX="auto" p={5}>
                    <Text fontSize="xl" fontWeight="bold" mb={4}>
                        Seed Processing Report
                    </Text>
                    <Table variant="striped" colorScheme="teal">
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
                                    <Td>{order.seedsToTreatKg}</Td>
                                    <Td>{order.seedsToTreatKg}</Td>
                                    <Td>{getStatusBadge(order.status)}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Box>
        </Box>
    );
};

export default Report;
