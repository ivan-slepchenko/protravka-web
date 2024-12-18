import React, { useState, useEffect } from 'react';
import { Text, Table, Thead, Tbody, Tr, Th, Td, Button, VStack, Input, HStack } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setAppliedProductRateKg, nextPage } from '../store/executionSlice';

const OrderExecution3ApplyingProduct = () => {
    const dispatch: AppDispatch = useDispatch();
    const orderExecution = useSelector((state: RootState) => state.execution.orderExecutions.find(orderExecution => orderExecution.orderId === state.execution.currentOrderId));
    const applicationMethod = orderExecution?.applicationMethod;
    const currentOrderId = useSelector((state: RootState) => state.execution.currentOrderId);
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === currentOrderId));
    const currentProductIndex = useSelector((state: RootState) => state.execution.currentProductIndex);
    const currentProductExecution = useSelector((state: RootState) => {
        const orderExecution = state.execution.orderExecutions.find(order => order.orderId === state.execution.currentOrderId);
        return orderExecution ? orderExecution.productExecutions[state.execution.currentProductIndex] : null;
    });
    const currentProductId = order?.productDetails[currentProductIndex].product?.id;
    const [inputError, setInputError] = useState(false);
    const [, setInputValue] = useState(currentProductExecution ? currentProductExecution.appliedRateKg : '');
    const productRecipe = order?.orderRecipe?.productRecipes.find(productRecipe => productRecipe.productDetail.product?.id === currentProductId);

    useEffect(() => {
        setInputValue(currentProductExecution ? currentProductExecution.appliedRateKg : '');
    }, [currentProductExecution]);

    if (currentProductId === undefined) {
        return null;
    }

    const handleValueChange = (productId: string, value: number) => {
        if (currentOrderId) {
            dispatch(setAppliedProductRateKg({ orderId: currentOrderId, productId, appliedRateKg: isNaN(value) ? 0 : value }));
            setInputError(false);
            setInputValue(value);
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
                        <Th w="50%"><span>Target Rate</span><br/>/ Lot, kg</Th>
                        <Th w="50%"><span>Actual Rate</span><br/>/ Lot, kg</Th>
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

    const renderTableBodyForSurry = () => productRecipe?.grSlurryRecipeToMix !== undefined ? (
        <Tbody>
            <Tr>
                <Td>{(productRecipe?.grSlurryRecipeToMix / 1000).toFixed(2)}</Td>
                <Td>
                    <Input
                        placeholder="Enter value"
                        value={currentProductExecution ? currentProductExecution.appliedRateKg : ''}
                        onChange={(e) => handleValueChange(currentProductId, parseFloat(e.target.value))}
                        type="number"
                        step="0.01"
                        borderColor={inputError ? 'red.500' : 'gray.200'}
                    />
                </Td>
            </Tr>
        </Tbody>
    ) : null;

    const renderTableBodyForNonSurry = () => (
        <Tbody>
            <Tr>
                <Td>{((productRecipe?.rateGrTo100Kg ?? 0)/1000).toFixed(2)}</Td>
                <Td>
                    <Input
                        placeholder="Enter value"
                        value={currentProductExecution ? currentProductExecution.appliedRateKg : ''}
                        onChange={(e) => handleValueChange(currentProductId, parseFloat(e.target.value))}
                        type="number"
                        step="0.01"
                        borderColor={inputError ? 'red.500' : 'gray.200'}
                    />
                </Td>
            </Tr>
        </Tbody>
    );

    const renderContent = () => {
        if (applicationMethod === 'Surry' || applicationMethod === 'CDS') {
            return (
                <>
                    <Text fontSize="xl" fontWeight="bold" mb={4}>{applicationMethod}</Text>
                    <Text mb={4}>
                        {'Product # '}
                        {currentProductIndex + 1}
                        {' of '}
                        {order?.productDetails.length}
                        {': '}
                        {order?.productDetails[currentProductIndex].product?.name}
                    </Text>
                    <Table variant="simple" size="sm" mb={4}>
                        {renderTableHeaders()}
                        {applicationMethod === 'Surry' ? renderTableBodyForSurry() : renderTableBodyForNonSurry()}
                    </Table>
                    <Text mb={4}>You are obliged to make a photo of scales display on the next page!</Text>
                    <HStack justifyContent={"center"} mt='auto'>
                        <Button
                            colorScheme="orange"
                            w="200px"
                            borderRadius="full"
                            _hover={{ backgroundColor: 'orange.200' }}
                            onClick={handleMakePhotoClick}
                            isDisabled={!currentProductExecution?.appliedRateKg || currentProductExecution.appliedRateKg <= 0}
                        >
                            Make Photo
                        </Button>
                    </HStack>
                </>
            );
        }
        return null;
    };

    return (
        <VStack p={4} w="full" h="full">
            {renderContent()}
        </VStack>
    );
};

export default OrderExecution3ApplyingProduct;