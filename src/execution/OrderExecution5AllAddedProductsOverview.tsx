import React from 'react';
import { Text, Table, Thead, Tbody, Tr, Th, Td, Tfoot, Button, VStack, HStack } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { nextPage, saveOrderExecutionTreatmentStartTime } from '../store/executionSlice';
import { useTranslation } from 'react-i18next';

const OrderExecution5AllAddedProductsOverview = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const currentOrder = useSelector((state: RootState) => state.execution.currentOrder);
    const currentOrderExecution = useSelector((state: RootState) => state.execution.currentOrderExecution);

    if (currentOrder === null || currentOrderExecution === null) {
        return null;
    }

    const getTargetQty = (productId: string | undefined) => {
        if (!productId) return 0;
        const productRecipe = currentOrder.orderRecipe?.productRecipes.find(productRecipe => productRecipe.productDetail.product?.id === productId);
        return productRecipe ? (productRecipe.grSlurryRecipeToMix / 1000) : 0;
    };

    const totalTargetQty = currentOrder.productDetails.reduce((total, product) => total + getTargetQty(product.product?.id), 0) || 0;
    const totalActualQty = currentOrderExecution.productExecutions.reduce((total, product) => total + (product.appliedRateKg !== undefined ? product.appliedRateKg : 0), 0) || 0;

    const handleNextButtonClicked = React.useCallback(() => {
        dispatch(saveOrderExecutionTreatmentStartTime(currentOrder.id));
        dispatch(nextPage());
    }, [dispatch, currentOrder.id]);

    return (
        <VStack justifyContent="center" w="full" h="full" position={"relative"}>
            <VStack spacing={6} width="100%" h='full'>
                <Text fontSize="2xl" fontWeight="bold" textAlign="center">{t('order_execution.all_products_added')}</Text>
                <Table variant="simple" size="sm">
                    <Thead bg="orange.100">
                        <Tr>
                            <Th>{t('order_execution.product_name')}</Th>
                            <Th>{t('order_execution.target_qty_kg')}</Th>
                            <Th>{t('order_execution.actual_qty_kg')}</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {currentOrderExecution.productExecutions.map((product, index) => (
                            <Tr key={index}>
                                <Td>{currentOrder.productDetails[index].product?.name}</Td>
                                <Td>{getTargetQty(currentOrder.productDetails[index].product?.id).toFixed(2)}</Td>
                                <Td>{product.appliedRateKg}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                    <Tfoot>
                        <Tr>
                            <Th>{t('order_execution.total')}</Th>
                            <Th>{totalTargetQty.toFixed(2)}</Th>
                            <Th>{totalActualQty.toFixed(2)}</Th>
                        </Tr>
                    </Tfoot>
                </Table>
            </VStack>
            <Text mt='auto' fontSize="lg" textAlign="center">{t('order_execution.push_to_start_treatment')}</Text>
            <HStack justifyContent={"center"}>
                <Button width="100px" colorScheme="orange" borderRadius="full" _hover={{ backgroundColor: 'orange.200' }} onClick={handleNextButtonClicked}>
                    {t('order_execution.next')}
                </Button>
            </HStack>
        </VStack>
    );
};

export default OrderExecution5AllAddedProductsOverview;