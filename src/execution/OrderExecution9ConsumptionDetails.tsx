import React, { useState } from 'react';
import { Button, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, Input, VStack, HStack } from "@chakra-ui/react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setExecutedProductConsumptionPerLotKg, nextPage, setExecutedSlurryConsumptionPerLotKg, saveOrderExecution } from '../store/executionSlice';
import { useTranslation } from 'react-i18next';

export default function OrderExecution9ConsumptionDetails() {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const currentOrderExecution = useSelector((state: RootState) => state.execution.currentOrderExecution);
    const currentOrder = useSelector((state: RootState) => state.execution.currentOrder);
    const applicationMethod = currentOrderExecution?.applicationMethod;
    const [inputValue, setInputValue] = useState<number | null>(null);
    
    const currentProductIndex = useSelector((state: RootState) => state.execution.currentOrderExecution?.currentProductIndex);
    const currentProductId = (currentProductIndex !== undefined && currentProductIndex !== null) ? currentOrder?.productDetails[currentProductIndex].product?.id : undefined;

    if (currentProductIndex === null || currentProductIndex === undefined || currentProductId === undefined || currentOrder === null) {
        return null;
    }
    
    const handleInputChange = (value: number) => {
        setInputValue(value);
        if (applicationMethod === 'Surry') {
            dispatch(setExecutedSlurryConsumptionPerLotKg({ orderId: currentOrder.id, slurryConsumptionPerLotKg: value }));
        } else {
            dispatch(setExecutedProductConsumptionPerLotKg({ orderId: currentOrder.id, productId: currentProductId, productConsumptionPerLotKg: value }));
        }
    };

    const handleNext = () => {
        dispatch(nextPage());
        dispatch(saveOrderExecution());
    };

    const renderTableHeaders = () => {
        if (applicationMethod === 'Surry') {
            return (
                <Thead bg="orange.100">
                    <Tr>
                        <Th>{t('order_execution.target_consumption_kg')}</Th>
                        <Th>{t('order_execution.actual_consumption_kg')}</Th>
                    </Tr>
                </Thead>
            );
        } else if (applicationMethod === 'CDS') {
            return (
                <Thead bg="orange.100">
                    <Tr>
                        <Th>{t('order_execution.target_consumption_kg')}</Th>
                        <Th>{t('order_execution.machine_setting_kg')}</Th>
                    </Tr>
                </Thead>
            );
        }
    };

    const renderTableBody = () => {
        const productRecipe = currentOrder?.orderRecipe?.productRecipes.find(productRecipe => productRecipe.productDetail.product?.id === currentProductId);
        if(productRecipe === undefined || currentOrder === undefined) return null;
        return (
            <Tbody>
                <Tr>
                    <Td>
                        {applicationMethod === 'Surry'
                            ? currentOrder.orderRecipe
                                ? (currentOrder.orderRecipe.slurryTotalGrRecipeToMix / 1000).toFixed(2)
                                : 'N/A'
                            : (productRecipe.grSlurryRecipeToMix / 1000).toFixed(2)}
                    </Td>
                    <Td>
                        <Input
                            placeholder={t('order_execution.enter_value')}
                            type="number"
                            step="0.01"
                            onChange={(e) => handleInputChange(parseFloat(e.target.value.endsWith('.') ? e.target.value.slice(0, -1) : e.target.value))}
                        />
                    </Td>
                </Tr>
            </Tbody>
        )
    };

    const renderContent = () => {
        return (
            <>
                <VStack w="full" h="full" overflow={'auto'}>
                    <Heading size="md" mb={2}>
                        {applicationMethod === 'Surry'
                            ? t('order_execution.total_slurry_consumption', { kg: currentOrder?.seedsToTreatKg ?? 0 })
                            : <span>
                                {t('order_execution.product')} {currentProductIndex + 1} {t('order_execution.of')} {currentOrder?.productDetails.length}: {currentOrder?.productDetails[currentProductIndex].product?.name} {t('order_execution.per_seeds', { kg: currentOrder?.seedsToTreatKg ?? 0 })}
                            </span>
                        }
                    </Heading>
                    <Table variant="simple" size="sm" mb={4}>
                        {renderTableHeaders()}
                        {renderTableBody()}
                    </Table>
                    <Text mb={4}  mt='auto'>
                        {t('order_execution.obliged_to_make_photo')}
                    </Text>
                </VStack>
            </>
        );
    };

    return (
        <VStack p={4} w="full" h="full">
            {renderContent()}
            <HStack justifyContent={"center"}>
                <Button
                    colorScheme="orange"
                    w="200px"
                    borderRadius="full"
                    _hover={{ backgroundColor: 'orange.200' }}
                    onClick={handleNext}
                    disabled={inputValue === null}
                >
                    {t('order_execution.next')}
                </Button>
            </HStack>
        </VStack>
    );
}
