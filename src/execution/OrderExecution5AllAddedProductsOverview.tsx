import React, { useState } from 'react';
import { Text, Table, Thead, Tbody, Tr, Th, Td, Tfoot, Button, VStack, HStack, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Spinner } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { nextPage, saveOrderExecution, saveOrderExecutionTreatmentStartTime } from '../store/executionSlice';
import { useTranslation } from 'react-i18next';
import { OrderExecutionPage } from './OrderExecutionPage';

const OrderExecution5AllAddedProductsOverview = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const currentOrder = useSelector((state: RootState) => state.execution.currentOrder);
    const currentOrderExecution = useSelector((state: RootState) => state.execution.currentOrderExecution);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef(null);
    const [isSaving, setIsSaving] = useState(false);

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

    const handleNextButtonClicked = React.useCallback(async () => {
        setIsSaving(true);
        try {
            dispatch(nextPage()); //we increase page, then save order execution, to sync page with backend.
            await dispatch(saveOrderExecutionTreatmentStartTime(currentOrder.id));
            await dispatch(saveOrderExecution());
        } catch (err) {
            dispatch(nextPage(OrderExecutionPage.AllAddedProductsOverview));
            onOpen();
        } finally {
            setIsSaving(false);
        }
    }, [dispatch, currentOrder.id, t]);

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
                        {currentOrderExecution.productExecutions.map((productExecution, index) => {
                            console.log('Product:', productExecution, 'Index: ', index, 'currentOrder.productDetails[index]', currentOrder.productDetails[index]);
                            return (
                                <Tr key={index}>
                                    <Td>{currentOrder.productDetails[index].product?.name}</Td>
                                    <Td>{getTargetQty(currentOrder.productDetails[index].product?.id).toFixed(2)}</Td>
                                    <Td>{productExecution.appliedRateKg}</Td>
                                </Tr>
                            )
                        })}
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
                <Button width="100px" colorScheme="orange" borderRadius="full" _hover={{ backgroundColor: 'orange.200' }} onClick={handleNextButtonClicked} isDisabled={isSaving}>
                    {isSaving ? <Spinner size="sm" /> : t('order_execution.next')}
                </Button>
            </HStack>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent margin={4}>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            {t('order_execution.internet_connection_required')}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            {t('order_execution.internet_connection_required_message')}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                {t('order_execution.close')}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </VStack>
    );
};

export default OrderExecution5AllAddedProductsOverview;