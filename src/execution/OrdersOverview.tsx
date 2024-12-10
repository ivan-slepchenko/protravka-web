import React, { useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Text, VStack, Grid, GridItem, HStack } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { startExecution } from '../store/executionSlice';
import { changeOrderStatus, fetchOrders } from '../store/ordersSlice';
import { OrderStatus } from '../store/newOrderSlice';

const currentDate = new Date().toLocaleDateString();

const OrdersOverview: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const orders = useSelector((state: RootState) => 
        state.orders.activeOrders.filter(order => 
            order.operator.email === user.email && order.status === OrderStatus.NotStarted
        )
    );

    const handleOrderClick = (orderId: string) => {
        dispatch(startExecution(orderId));
        dispatch(changeOrderStatus({ id: orderId, status: OrderStatus.InProgress }));
    };

    useEffect(() => {
        fetchOrders();
    }, [dispatch]);

    return (
        <VStack>
            <Text py={2} px={2} fontSize="lg">You have the following lots to treat today, {currentDate}</Text>
            <Text py={2} px={2} fontSize="md" color="gray.600">Click on a row to start treating</Text>
      
            <TableContainer mt={4} w="full">
                <Table variant="simple" size="sm" w="full">
                    <Thead bg="orange.100">
                        <Tr>
                            <Th>Crop</Th>
                            <Th>Lot</Th>
                            <Th>Products</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {orders.map(order => (
                            <Tr key={order.id} onClick={() => handleOrderClick(order.id)} cursor="pointer" _hover={{ bg: "gray.100" }}>
                                <Td>
                                    <HStack>
                                        <Text>{order.crop.name}</Text>
                                        <Text fontSize="sm" color="gray.600">{order.variety.name}</Text>
                                    </HStack>
                                </Td>
                                <Td>{order.lotNumber}</Td>
                                <Td>
                                    <Grid templateColumns="1fr 1fr" gap={2}>
                                        {order.productDetails.map(productDetail => (
                                            <GridItem key={productDetail.id}>
                                                <Text fontSize="sm">{productDetail.product?.name}</Text>
                                            </GridItem>                    
                                        ))}
                                    </Grid>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>   
        </VStack>
    );
};

export default OrdersOverview;