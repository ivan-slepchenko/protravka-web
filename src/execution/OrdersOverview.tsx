import React, { useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, IconButton, Text, VStack } from '@chakra-ui/react';
import { FiArrowRight } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { startExecution } from '../store/executionSlice';
import { fetchOrders } from '../store/ordersSlice';

const currentDate = new Date().toLocaleDateString();

const OrdersOverview: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const orders = useSelector((state: RootState) => state.orders.activeOrders.filter(order => order.operator.email === user.email));

    const handleOrderClick = (orderId: string) => {
        dispatch(startExecution(orderId));
    };

    useEffect(() => {
        fetchOrders();
    }, [dispatch]);

    return (
        <VStack>
            <Text py={2} px={2} fontSize="lg">You have the following lots to treat today, {currentDate}</Text>
      
            <TableContainer mt={4} w="full">
                <Table variant="simple" size="sm" w="full">
                    <Thead>
                        <Tr>
                            <Th>Crop</Th>
                            <Th>Lot</Th>
                            <Th>Products</Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {orders.map(order => (
                            <Tr key={order.id}>
                                <Td>{order.crop.name}</Td>
                                <Td>{order.lotNumber}</Td>
                                <Td>
                                    {order.productDetails.map(productDetail => (
                                        <Text key={productDetail.product?.id} fontSize="sm">{productDetail.product?.name}</Text>
                                    ))}
                                </Td>
                                <Td>
                                    <IconButton
                                        aria-label="Go"
                                        icon={<FiArrowRight />}
                                        size="xs"
                                        onClick={() => handleOrderClick(order.id)}
                                    />
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