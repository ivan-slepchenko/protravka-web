import React, { useState } from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Tfoot, Checkbox, Button, HStack, VStack } from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { nextPage } from '../store/executionSlice';
import { Packaging } from '../store/newOrderSlice';

const packagingMap = {
    [Packaging.InSeeds]: "seeds",
    [Packaging.InKg]: "kg",
};

const OrderExecution1InitialOverview = () => {
    const currentOrderId = useSelector((state: RootState) => state.execution.currentOrderId);
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === currentOrderId));
    const [isChecked, setIsChecked] = useState(false);
    const dispatch: AppDispatch = useDispatch();

    if (!order) {
        return <Text>{'Order not found '}{currentOrderId}</Text>;
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
            <Text fontSize="2xl" fontWeight="bold">Order Execution</Text>
            <Box mt={4}>
                <Text>Lot Number: {order.lotNumber}</Text>
                <Text>Seeds To Treat: {order.seedsToTreatKg} kg</Text>
                <Text>Bag Size: {order.bagSize} {bagSizeUnit}</Text>
                <Text>Expected Amount Of Bags: {order.orderRecipe.nbSeedsUnits.toFixed()} bags</Text>
            </Box>
            <Table variant="simple" mt={4} border="1px solid" borderColor="gray.200" size="sm">
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
            <Text mt={4} textAlign="center">
                {'You finished treating lot '}{order.lotNumber}{'. Please check your further tasks for today or contact your Manager.'}
            </Text>
        </VStack>
    );
};

export default OrderExecution1InitialOverview;