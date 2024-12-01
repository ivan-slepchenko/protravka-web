import React from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Button, VStack, Input } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setAppliedQuantity, nextPage } from '../store/executionSlice';

const OrderExecution3ApplyingProduct = () => {
    const dispatch: AppDispatch = useDispatch();
    const applicationMethod = useSelector((state: RootState) => state.execution.applicationMethod);
    const currentOrderId = useSelector((state: RootState) => state.execution.currentOrderId);

    const handleQuantityChange = (productId: string, quantity: number) => {
        if (currentOrderId) {
            dispatch(setAppliedQuantity({ orderId: currentOrderId, productId, quantity }));
        }
    };

    const handleMakePhotoClick = () => {
        dispatch(nextPage());
    };

    const renderTableHeaders = () => {
        if (applicationMethod === 'Slurry') {
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
                        onChange={(e) => handleQuantityChange('product-id', parseFloat(e.target.value))}
                    />
                </Td>
            </Tr>
        </Tbody>
    );

    const renderContent = () => {
        if (applicationMethod === 'Slurry' || applicationMethod === 'CDS') {
            return (
                <Box border="1px solid" borderColor="green.300" borderRadius="md" p={4} flex="1" m={2}>
                    <Text fontSize="xl" fontWeight="bold" mb={4}>{applicationMethod}</Text>
                    <Text mb={4}>Product name #... out of ...</Text>
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