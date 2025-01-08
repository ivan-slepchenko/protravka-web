import React from 'react';
import { Text, Table, Thead, Tbody, Tr, Th, Td, Tfoot, Button, VStack, HStack, Center } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { nextPage, saveOrderExecution } from '../store/executionSlice';

const OrderExecution5AllAddedProductsOverview = () => {
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
    const totalActualQty = currentOrderExecution.productExecutions.reduce((total, product) => total + product.appliedRateKg, 0) || 0;

    const handleNextButtonClicked = (): void => {
        dispatch(nextPage());
        dispatch(saveOrderExecution());
    }

    return (
        <VStack p={4} w="full" h="full">
            <Center w='full' h='full'>
                <VStack>
                    <Text fontSize="2xl" fontWeight="bold" textAlign="center">You added all products.</Text>
                    <Table variant="simple" size="sm" mt={4}>
                        <Thead bg="orange.100">
                            <Tr>
                                <Th>Product name</Th>
                                <Th>Target Qty, kg</Th>
                                <Th>Actual Qty, kg</Th>
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
                                <Th>Total</Th>
                                <Th>{totalTargetQty.toFixed(2)}</Th>
                                <Th>{totalActualQty.toFixed(2)}</Th>
                            </Tr>
                        </Tfoot>
                    </Table>
                </VStack>
            </Center>
            <Text mt='auto' fontSize="lg" textAlign="center">Push to start treatment.</Text>
            <HStack justifyContent={"center"}>
                <Button width="100px" colorScheme="orange" borderRadius="full" _hover={{ backgroundColor: 'orange.200' }} onClick={handleNextButtonClicked}>
                    Next
                </Button>
            </HStack>
        </VStack>
    );
};

export default OrderExecution5AllAddedProductsOverview;