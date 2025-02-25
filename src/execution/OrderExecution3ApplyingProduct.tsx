import React, { useState, useEffect } from 'react';
import { Text, Table, Thead, Tbody, Tr, Th, Td, Button, VStack, Input, HStack } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setAppliedProductRateKg, nextPage, saveOrderExecution } from '../store/executionSlice';
import { useTranslation } from 'react-i18next';

const OrderExecution3ApplyingProduct = () => {
    const { t } = useTranslation();
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
            setInputError(false);
            setInputValue(value);
        }
    };

    const handleMakePhotoClick = () => {
        dispatch(nextPage());//we increase page, then save order execution, to sync page with backend.
        dispatch(saveOrderExecution());
    };

    const renderTableHeaders = () => {
        if (applicationMethod === 'Surry') {
            return (
                <Thead bg="orange.100">
                    <Tr>
                        <Th w="50%"><span>{t('order_execution.target_rate')}</span><br/>{t('order_execution.lot_kg')}</Th>
                        <Th w="50%"><span>{t('order_execution.actual_rate')}</span><br/>{t('order_execution.lot_kg')}</Th>
                    </Tr>
                </Thead>
            );
        } else if (applicationMethod === 'CDS') {
            return (
                <Thead bg="orange.100">
                    <Tr>
                        <Th>{t('order_execution.target_rate_kg')}</Th>
                        <Th>{t('order_execution.machine_setting_kg')}</Th>
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
                        placeholder={t('order_execution.enter_value')}
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
                        placeholder={t('order_execution.enter_value')}
                        value={(currentProductExecution && currentProductExecution.appliedRateKg !== undefined) ? currentProductExecution.appliedRateKg : ''}
                        onChange={(e) => handleValueChange(currentProductId, e.target.value === undefined ? undefined : parseFloat(e.target.value.endsWith('.') ? e.target.value.slice(0, -1) : e.target.value))}
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
                    <Text fontSize="xl" fontWeight="bold" mb={4}>{applicationMethod} {t('order_execution.preparation')}</Text>
                    <Text mb={4}>
                        {t('order_execution.product')} {currentProductIndex + 1} {t('order_execution.of')} {currentOrder.productDetails.length}: {currentOrder.productDetails[currentProductIndex].product?.name}
                    </Text>
                    <Table variant="simple" size="sm" mb={4}>
                        {renderTableHeaders()}
                        {applicationMethod === 'Surry' ? renderTableBodyForSurry() : renderTableBodyForNonSurry()}
                    </Table>
                    <Text mb={4}>{t('order_execution.obliged_to_make_photo')}</Text>
                    <HStack justifyContent={"center"} mt='auto'>
                        <Button
                            colorScheme="orange"
                            w="200px"
                            borderRadius="full"
                            _hover={{ backgroundColor: 'orange.200' }}
                            onClick={handleMakePhotoClick}
                            isDisabled={!currentProductExecution?.appliedRateKg || currentProductExecution.appliedRateKg <= 0}
                        >
                            {t('order_execution.make_photo')}
                        </Button>
                    </HStack>
                </>
            );
        }
        return null;
    };

    console.log('productRecipe', productRecipe);

    return (
        <VStack p={4} w="full" h="full" overflow={'auto'}>
            {renderContent()}
        </VStack>
    );
};

export default OrderExecution3ApplyingProduct;