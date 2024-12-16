import React from 'react';
import { Text, Table, Thead, Tbody, Tr, Th, Td, Tfoot, Button, VStack, HStack, Center } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { nextPage } from '../store/executionSlice';

const OrderExecution5AllAddedProductsOverview = () => {
    const dispatch: AppDispatch = useDispatch();
    const { currentOrderId, orderExecutions } = useSelector((state: RootState) => state.execution);
    const currentOrder = orderExecutions.find(execution => execution.orderId === currentOrderId);
    const orders = useSelector((state: RootState) => state.orders.activeOrders);
    const order = orders.find(order => order.id === currentOrderId);

    const getTargetQty = (productId: string | undefined) => {
        if (!productId) return 0;
        const productRecipe = order?.orderRecipe?.productRecipes.find(productRecipe => productRecipe.productDetail.product?.id === productId);
        return productRecipe ? productRecipe.grSlurryRecipeToMix : 0;
    };

    const totalTargetQty = order?.productDetails.reduce((total, product) => total + getTargetQty(product.product?.id), 0) || 0;
    const totalActualQty = currentOrder?.productExecutions.reduce((total, product) => total + product.appliedRateKg, 0) || 0;

    const handleNextButtonClicked = (): void => {
        dispatch(nextPage());
    }

    return (
        <VStack p={4} w="full" h="full">
            <Center w='full' h='full'>
                <VStack>
                    <Text fontSize="2xl" fontWeight="bold" textAlign="center">You added all products.</Text>
                    <Table variant="simple" mt={4} border="1px solid" borderColor="gray.200"  size="sm">
                        <Thead bg="orange.100">
                            <Tr>
                                <Th>Product name</Th>
                                <Th>Target Qty, kg</Th>
                                <Th>Actual Qty, kg</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {currentOrder?.productExecutions.map((product, index) => (
                                <Tr key={index} bg={index % 2 === 0 ? 'gray.50' : 'white'}>
                                    <Td>{order?.productDetails[index].product?.name}</Td>
                                    <Td>{getTargetQty(order?.productDetails[index].product?.id).toFixed(2)}</Td>
                                    <Td>{product.appliedRateKg}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                        <Tfoot>
                            <Tr>
                                <Th>Total</Th>
                                <Th>{totalTargetQty.toFixed(2)}</Th>
                                <Th>{totalActualQty}</Th>
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