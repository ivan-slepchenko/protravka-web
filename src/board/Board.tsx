import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import OrderInfo from './OrderInfo';
import { OrderStatus } from '../store/newOrderSlice';
import { fetchOrders } from '../store/ordersSlice';
import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react';

const Board: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const columns = [OrderStatus.NotStarted, OrderStatus.InProgress, OrderStatus.Acknowledge, OrderStatus.Archived];
    const orders = useSelector((state: RootState) => state.orders.activeOrders);
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const handleOrderClick = (orderId: string) => {
        setSelectedOrder(orderId);
    };

    const handleClose = () => {
        setSelectedOrder(null);
    };

    return (
        <Flex w="full" justifyContent={'center'} h="100vh">
            <Flex p={5} gap={3} w="full" >
                {columns.map((column) => (
                    <Box key={column} w="full" border="1px solid #ccc" borderRadius="md" p={3}>
                        <Heading as="h3" size="md" mb={3}>{column}</Heading>
                        <VStack spacing={3} w="full">
                            {orders.filter(order => order.status === column).map((order, index) => (
                                <Box
                                    key={index}
                                    border="1px solid #ddd"
                                    borderRadius="md"
                                    p={3}
                                    w="full"
                                    cursor="pointer"
                                    onClick={() => handleOrderClick(order.id)}

                                >
                                    <Text><strong>Lot Number:</strong> {order.lotNumber}</Text>
                                    <Text><strong>Crop:</strong> {order.crop?.name}</Text>
                                    <Text><strong>Variety:</strong> {order.variety?.name}</Text>
                                    <Text><strong>Quantity:</strong> {order.quantity} kg</Text>
                                </Box>
                            ))}
                        </VStack>
                    </Box>
                ))}
                {selectedOrder && <OrderInfo isOpen={!!selectedOrder} onClose={handleClose} orderId={selectedOrder} />}
            </Flex>
        </Flex>
    );
};

export default Board;