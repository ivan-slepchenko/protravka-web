import React, { useState, useEffect } from 'react';
import { Text, Table, Thead, Tbody, Tr, Th, Td, Button, VStack, Input, HStack } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setAppliedProductRateKg, nextPage, saveOrderExecution } from '../store/executionSlice';

const OrderExecution3ApplyingProduct = () => {
    const dispatch: AppDispatch = useDispatch();
    const currentOrderExecution = useSelector((state: RootState) => state.execution.currentOrderExecution);
    const currentOrder = useSelector((state: RootState) => state.execution.currentOrder);

    const currentProductIndex = currentOrderExecution?.currentProductIndex ?? 0;
    const currentProductExecution = currentOrderExecution?.productExecutions[currentProductIndex];

    const [inputError, setInputError] = useState(false);
    const [, setInputValue] = useState(currentProductExecution ? currentProductExecution.appliedRateKg : '');
    useEffect(() => {
        setInputValue(currentProductExecution ? currentProductExecution.appliedRateKg : '');
    }, [currentProductExecution]);

    if (currentOrder === null || currentOrderExecution === null  ) {
        return null;
    }

    const applicationMethod = currentOrderExecution?.applicationMethod;
    const currentProductId = currentOrder?.productDetails[currentProductIndex].product?.id;

    if (currentProductId === undefined) {
        return null;
    }

    const productRecipe = currentOrder?.orderRecipe?.productRecipes.find(productRecipe => productRecipe.productDetail.product?.id === currentProductId);

    const handleValueChange = (productId: string, value: number | undefined) => {
        if (currentOrder.id) {
            dispatch(setAppliedProductRateKg({ orderId: currentOrder.id, productId, appliedRateKg: value }));
            dispatch(saveOrderExecution());
            setInputError(false);
            setInputValue(value);
        }
    };

    const handleMakePhotoClick = () => {
        dispatch(nextPage());
        dispatch(saveOrderExecution());
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
                        value={(currentProductExecution && currentProductExecution.appliedRateKg !== undefined) ? currentProductExecution.appliedRateKg : ''}
                        onChange={(e) => handleValueChange(currentProductId, e.target.value === '' ? undefined : parseFloat(e.target.value.endsWith('.') ? e.target.value.slice(0, -1) : e.target.value))}
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
                        value={(currentProductExecution && currentProductExecution.appliedRateKg !== undefined) ? currentProductExecution.appliedRateKg : ''}
                        onChange={(e) => handleValueChange(currentProductId, e.target.value === undefined ? undefined : parseFloat(e.target.value))}
                        type="number"
                        step="0.01"
                        borderColor={inputError ? 'red.500' : 'gray.200'}
                    />
                </Td>
            </Tr>
        </Tbody>
    );

    const renderContent = () => {
        console.log('currentProductExecution', currentProductExecution);
        if (applicationMethod === 'Surry' || applicationMethod === 'CDS') {
            return (
                <>
                    <Text fontSize="xl" fontWeight="bold" mb={4}>{applicationMethod}{' Preparation'}</Text>
                    <Text mb={4}>
                        {'Product # '}
                        {currentProductIndex + 1}
                        {' of '}
                        {currentOrder.productDetails.length}
                        {': '}
                        {currentOrder.productDetails[currentProductIndex].product?.name}
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

    console.log('productRecipe', productRecipe);

    return (
        <VStack p={4} w="full" h="full">
            {renderContent()}
        </VStack>
    );
};

export default OrderExecution3ApplyingProduct;