import React from 'react';
import { Button, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, Input, VStack, HStack, Center } from "@chakra-ui/react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setExecutedProductConsumptionPerLotKg, nextPage, setExecutedSlurryConsumptionPerLotKg, saveOrderExecution } from '../store/executionSlice';

export default function OrderExecution9ConsumptionDetails() {
    const dispatch: AppDispatch = useDispatch();
    const currentOrderExecution = useSelector((state: RootState) => state.execution.currentOrderExecution);
    const currentOrder = useSelector((state: RootState) => state.execution.currentOrder);
    const applicationMethod = currentOrderExecution?.applicationMethod;
    
    const currentProductIndex = useSelector((state: RootState) => state.execution.currentOrderExecution?.currentProductIndex);
    const currentProductId = (currentProductIndex !== undefined && currentProductIndex !== null) ? currentOrder?.productDetails[currentProductIndex].product?.id : undefined;

    if (currentProductIndex === null || currentProductIndex === undefined || currentProductId === undefined || currentOrder === null) {
        return null;
    }
    
    const handleInputChange = (value: number) => {
        if (applicationMethod === 'Surry') {
            dispatch(setExecutedSlurryConsumptionPerLotKg({ orderId: currentOrder.id, slurryConsumptionPerLotKg: value }));
        } else {
            dispatch(setExecutedProductConsumptionPerLotKg({ orderId: currentOrder.id, productId: currentProductId, productConsumptionPerLotKg: value }));
        }
        dispatch(saveOrderExecution());
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
                        <Th>Target consumption, kg</Th>
                        <Th>Actual consumption, kg</Th>
                    </Tr>
                </Thead>
            );
        } else if (applicationMethod === 'CDS') {
            return (
                <Thead bg="orange.100">
                    <Tr>
                        <Th>Target consumption, kg</Th>
                        <Th>Machine Setting, kg</Th>
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
                            placeholder="Enter value"
                            type="number"
                            step="0.01"
                            onChange={(e) => handleInputChange(parseFloat(e.target.value))}
                        />
                    </Td>
                </Tr>
            </Tbody>
        )
    };

    const renderContent = () => {
        return (
            <>
                <Center w="full" h="full">
                    <VStack>
                        <Heading size="md" mb={2}>
                            {applicationMethod === 'Surry'
                                ? `Total Slurry Consumption / ${currentOrder?.seedsToTreatKg ?? 0} kg`
                                : <span>
                                    {'Product # '}
                                    {currentProductIndex + 1}
                                    {' of '}
                                    {currentOrder?.productDetails.length}
                                    {': '}
                                    {currentOrder?.productDetails[currentProductIndex].product?.name}
                                    {` Per ${currentOrder?.seedsToTreatKg ?? 0} kg seeds`}
                                </span>
                            }
                        </Heading>
                        <Table variant="simple" size="sm" mb={4}>
                            {renderTableHeaders()}
                            {renderTableBody()}
                        </Table>
                    </VStack>
                </Center>
                <Text mb={4}  mt='auto'>
                    You are obliged to make a photo of scales display on the next page!
                </Text>
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
                >
                    Next
                </Button>
            </HStack>
        </VStack>
    );
}
