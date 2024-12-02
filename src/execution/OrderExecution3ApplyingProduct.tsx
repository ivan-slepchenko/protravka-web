import React from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Button, VStack, Input } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setAppliedQuantity, nextPage } from '../store/executionSlice';

const OrderExecution3ApplyingProduct = () => {
    const dispatch: AppDispatch = useDispatch();
    const applicationMethod = useSelector((state: RootState) => state.execution.applicationMethod);
    const currentOrderId = useSelector((state: RootState) => state.execution.currentOrderId);
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === currentOrderId));
    const currentProductIndex = useSelector((state: RootState) => state.execution.currentProductIndex);
    const currentProduct = useSelector((state: RootState) => {
        const currentOrder = state.execution.orderExecutions.find(order => order.orderId === state.execution.currentOrderId);
        return currentOrder ? currentOrder.productExecutions[currentProductIndex] : null;
    });

    const handleQuantityChange = (productId: string, quantity: number) => {
        if (currentOrderId) {
            dispatch(setAppliedQuantity({ orderId: currentOrderId, productId, quantity }));
        }
    };

    const handleMakePhotoClick = () => {
        dispatch(nextPage());
    };

    const renderTableHeaders = () => {
        if (applicationMethod === 'Surry') {
            return (
                <Thead bg="orange.100">
                    <Tr>
                        <Th>Target rate, kg</Th>
                        <Th>Actual rate, kg</Th>
                    </Tr>
                </Thead>
            );
        } else if (applicationMethod === 'CDS') {
            return (
                <Thead bg="orange.100">
                    <Tr>
                        <Th>Target rate, kg</Th>
                        <Th>Machine Setting, kg</Th>
                    </Tr>
                </Thead>
            );
        }
    };

    const renderTableBody = () => (
        <Tbody>
            <Tr>
                <Td>xxx</Td>
                <Td>
                    <Input
                        placeholder="Enter value"
                        value={currentProduct ? currentProduct.appliedQuantity : ''}
                        onChange={(e) => handleQuantityChange(currentProduct ? currentProduct.productId : '', parseFloat(e.target.value))}
                    />
                </Td>
            </Tr>
        </Tbody>
    );

    const renderContent = () => {
        if (applicationMethod === 'Surry' || applicationMethod === 'CDS') {
            return (
                <Box border="1px solid" borderColor="green.300" borderRadius="md" p={4} flex="1" m={2}>
                    <Text fontSize="xl" fontWeight="bold" mb={4}>{applicationMethod}</Text>
                    <Text mb={4}>Product name #{currentProductIndex + 1} out of {order?.productDetails.length}</Text>
                    <Table variant="simple" mb={4}>
                        {renderTableHeaders()}
                        {renderTableBody()}
                    </Table>
                    <Text mb={4}>You are obliged to make a photo of scales display on the next page!</Text>
                    <Button
                        colorScheme="orange"
                        borderRadius="full"
                        _hover={{ backgroundColor: 'orange.200' }}
                        onClick={handleMakePhotoClick}
                    >
                        Make Photo
                    </Button>
                </Box>
            );
        }
        return null;
    };

    return (
        <Box p={4}>
            <VStack spacing={8} align="stretch">
                <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} justifyContent="space-between">
                    {renderContent()}
                </Box>
            </VStack>
        </Box>
    );
};

export default OrderExecution3ApplyingProduct;