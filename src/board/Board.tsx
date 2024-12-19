import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { OrderStatus } from '../store/newOrderSlice';
import { fetchOrders } from '../store/ordersSlice';
import { Box, Flex, Heading, Text, VStack, Badge } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Board: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    const columns = [OrderStatus.NotStarted, OrderStatus.InProgress, OrderStatus.ToAcknowledge, OrderStatus.Completed, OrderStatus.Failed];
    const orders = useSelector((state: RootState) => state.orders.activeOrders);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const handleOrderClick = (orderId: string) => {
        navigate(`/lot-report/${orderId}`);
    };

    return (
        <Flex w="full" justifyContent={'center'} h="100vh">
            <Flex p={5} gap={3} w="full" >
                {columns.map((column) => {
                    let bgColor = "gray.50";
                    if (column === OrderStatus.Completed) bgColor = "green.50";
                    if (column === OrderStatus.Failed) bgColor = "red.50";
                    return (
                        <Box key={column} w="full" border="gray.100" borderRadius="md" p={2} bg={bgColor}>
                            <Heading size="sm" m={1} mb={2}>{column}</Heading>
                            <VStack spacing={3} w="full">
                                {orders.filter(order => order.status === column).map((order, index) => (
                                    <Box
                                        key={index}
                                        borderColor={'gray.200'}
                                        borderWidth={1}
                                        borderStyle={'solid'}
                                        borderRadius="md"
                                        p={2}
                                        w="full"
                                        cursor="pointer"
                                        onClick={() => handleOrderClick(order.id)}
                                        bg="white"
                                        boxShadow="sm"
                                    >
                                        <Box display="grid" gridTemplateColumns="1fr 3fr" gap={2} fontSize="sm">
                                            <Badge gridColumn="span 3" colorScheme="gray">
                                                {order.crop?.name}, {order.variety?.name}
                                            </Badge>
                                            <Text px={1} gridColumn="span 3" color="gray.600">
                                                Lot: {order.lotNumber}
                                            </Text>
                                            <Text px={1} gridColumn="span 3">
                                                {'for '}{order.operator?.name} {order.operator?.surname}
                                            </Text>
                                            <Text px={1} gridColumn="span 2">Seeds To Treat:</Text>
                                            <Text px={1} isTruncated>{order.seedsToTreatKg}{' kg'}</Text>
                                            <Text px={1} gridColumn="span 2">Application:</Text>
                                            <Text px={1} isTruncated>{order.applicationDate}</Text>
                                        </Box>
                                    </Box>
                                ))}
                            </VStack>
                        </Box>
                    );
                })}
            </Flex>
        </Flex>
    );
};

export default Board;