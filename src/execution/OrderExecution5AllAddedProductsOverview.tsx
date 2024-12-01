import React from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Tfoot, Button, VStack } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const OrderExecution5AllAddedProductsOverview = () => {
    const { currentOrderId, orderExecutions } = useSelector((state: RootState) => state.execution);
    const currentOrder = orderExecutions.find(execution => execution.orderId === currentOrderId);
    const orders = useSelector((state: RootState) => state.orders.activeOrders);
    const orderDetails = orders.find(order => order.id === currentOrderId);

    const totalTargetQty = orderDetails?.productDetails.reduce((total, product) => total + product.quantity, 0) || 0;
    const totalActualQty = currentOrder?.products.reduce((total, product) => total + product.appliedQuantity, 0) || 0;

    return (
        <Box p={4}>
            <VStack spacing={8} align="stretch">
                <Text fontSize="2xl" fontWeight="bold" textAlign="center">You added all products.</Text>
                <Table variant="simple" mt={4} border="1px solid" borderColor="gray.200">
                    <Thead bg="orange.100">
                        <Tr>
                            <Th>Product name</Th>
                            <Th>Target Qty, kg</Th>
                            <Th>Actual Qty, kg</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {currentOrder?.products.map((product, index) => (
                            <Tr key={index} bg={index % 2 === 0 ? 'gray.50' : 'white'}>
                                <Td>{product.productId}</Td>
                                <Td>{orderDetails?.productDetails[index].quantity || '-'}</Td>
                                <Td>{product.appliedQuantity}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                    <Tfoot>
                        <Tr>
                            <Th>Total</Th>
                            <Th>{totalTargetQty}</Th>
                            <Th>{totalActualQty}</Th>
                        </Tr>
                    </Tfoot>
                </Table>
                <Text fontSize="lg" textAlign="center">Swipe to start treatment now.</Text>
                <Button colorScheme="orange" borderRadius="full" _hover={{ backgroundColor: 'orange.200' }}>
                    Next
                </Button>
            </VStack>
        </Box>
    );
};

export default OrderExecution5AllAddedProductsOverview;