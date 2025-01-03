import React, { useState } from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Tfoot, Checkbox, Button, HStack, VStack } from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { nextPage } from '../store/executionSlice';
import { Packaging } from '../store/newOrderSlice';

const packagingMap = {
    [Packaging.InSeeds]: "ks",
    [Packaging.InKg]: "kg",
};

const OrderExecution1InitialOverview = () => {
    const currentOrderExecution = useSelector((state: RootState) => state.execution.currentOrderExecution);
    const currentOrderId = currentOrderExecution?.orderId;
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === currentOrderId));
    const [isChecked, setIsChecked] = useState(false);
    const dispatch: AppDispatch = useDispatch();

    if (!order) {
        return <Text>{'Receipe not found '}{currentOrderId}</Text>;
    }

    const totalLitres = order.orderRecipe.productRecipes.reduce((total, productRecipe) => total + productRecipe.mlSlurryRecipeToMix, 0) / 1000;
    const totalKg = order.orderRecipe.productRecipes.reduce((total, productRecipe) => total + productRecipe.grSlurryRecipeToMix, 0) / 1000;
    const bagSizeUnit = packagingMap[order.packaging];

    const handleNextClick = () => {
        dispatch(nextPage());
    // Navigate to the next page if needed
    };

    return (
        <VStack p={4} w="full" h="full">
            <Text fontSize="2xl" fontWeight="bold">Receipe Execution</Text>
            <Box mt={4}>
                <Text><strong>Lot:</strong> {order.lotNumber}</Text>
                <Text><strong>Seeds To Treat:</strong> {order.seedsToTreatKg} kg</Text>
                <Text><strong>TKW:</strong> {order.tkw} gr</Text>
                <Text><strong>Bag Size:</strong> {order.bagSize} {bagSizeUnit}</Text>
                <Text><strong>Expected Amount Of Bags:</strong> {order.orderRecipe.nbSeedsUnits.toFixed()} bags</Text>
            </Box>
            <Table variant="simple" size="sm" mt={4}>
                <Thead bg="orange.100">
                    <Tr>
                        <Th>Product</Th>
                        <Th>Litres/Lot</Th>
                        <Th>Kg/Lot</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {order.orderRecipe.productRecipes.map(productRecipe => {
                        return (
                            <Tr key={productRecipe.id}>
                                <Td>{productRecipe.productDetail.product?.name}</Td>
                                <Td>{(productRecipe.mlSlurryRecipeToMix / 1000).toFixed(2)}</Td>
                                <Td>{(productRecipe.grSlurryRecipeToMix / 1000).toFixed(2)}</Td>
                            </Tr>
                        )
                    })}
                </Tbody>
                <Tfoot>
                    <Tr>
                        <Th>Total</Th>
                        <Th>{totalLitres.toFixed(2)}</Th>
                        <Th>{totalKg.toFixed(2)}</Th>
                    </Tr>
                </Tfoot>
            </Table>
            <Checkbox mt={4} isChecked={isChecked} onChange={(e) => setIsChecked(e.target.checked)}>
                {'I understand the amount I need to use'}
            </Checkbox>
            <HStack justifyContent={"center"} mt='auto'>
                <Button mt={4} w="100px" colorScheme="orange" borderRadius="full" isDisabled={!isChecked} onClick={handleNextClick}>
                    {'Next'}
                </Button>
            </HStack>
        </VStack>
    );
};

export default OrderExecution1InitialOverview;