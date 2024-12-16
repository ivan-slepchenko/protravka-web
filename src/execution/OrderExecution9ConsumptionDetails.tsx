import React from 'react';
import { Button, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, Input, VStack, HStack, Center } from "@chakra-ui/react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setExecutedProductConsumptionPerLotKg, nextPage, setExecutedSlurryConsumptionPerLotKg } from '../store/executionSlice';

export default function OrderExecution9ConsumptionDetails() {
    const dispatch: AppDispatch = useDispatch();
    const orderExecution = useSelector((state: RootState) => state.execution.orderExecutions.find(orderExecution => orderExecution.orderId === state.execution.currentOrderId));
    const applicationMethod = orderExecution?.applicationMethod;
    const currentOrderId = useSelector((state: RootState) => state.execution.currentOrderId);
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === currentOrderId));
    const currentProductIndex = useSelector((state: RootState) => state.execution.currentProductIndex);
    const currentProductId = order?.productDetails[currentProductIndex].product?.id;


    if (currentProductId === undefined) {
        return null;
    }
    
    const handleInputChange = (value: number) => {
        if (currentOrderId) {
            if (applicationMethod === 'Surry') {
                dispatch(setExecutedSlurryConsumptionPerLotKg({ orderId: currentOrderId, slurryConsumptionPerLotKg: value }));
            } else {
                dispatch(setExecutedProductConsumptionPerLotKg({ orderId: currentOrderId, productId: currentProductId, productConsumptionPerLotKg: value }));
            }
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
        const productRecipe = order?.orderRecipe?.productRecipes.find(productRecipe => productRecipe.productDetail.product?.id === currentProductId);
        if(productRecipe === undefined || order === undefined) return null;
        return (
            <Tbody>
                <Tr>
                    <Td>
                        {applicationMethod === 'Surry' ? (order.orderRecipe.slurryTotalGrRecipeToMix / 1000).toFixed(2) : (productRecipe.grSlurryRecipeToMix/1000).toFixed(2)}
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
                                ? `Total Surry Consumption / ${order?.seedsToTreatKg ?? 0} kg`
                                : <span>
                                    {'Product: '}
                                    {order?.productDetails[currentProductIndex].product?.name}
                                    {' #'}
                                    {currentProductIndex + 1}
                                    {'  out of '}
                                    {order?.productDetails.length}
                                    {` Per ${order?.seedsToTreatKg ?? 0} kg seeds`}
                                </span>
                            }
                        </Heading>
                        <Table variant="simple" mb={4}  size="sm">
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
                    onClick={handleMakePhotoClick}
                >
                    Make Photo
                </Button>
            </HStack>
        </VStack>
    );
}
