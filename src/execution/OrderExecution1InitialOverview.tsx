import React, { useState } from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Tfoot, Checkbox, Button, HStack, VStack } from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { RateUnit } from '../store/newOrderSlice';
import { nextPage } from '../store/executionSlice';

const OrderExecution1InitialOverview = () => {
    const currentOrderId = useSelector((state: RootState) => state.execution.currentOrderId);
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === currentOrderId));
    const [isChecked, setIsChecked] = useState(false);
    const dispatch: AppDispatch = useDispatch();

    if (!order) {
        return <Text>{'Order not found '}{currentOrderId}</Text>;
    }

    const computeLitresPerLot = (rate: number, rateUnit: RateUnit) => {
        return rateUnit === RateUnit.ML ? rate / 1000 : 0;
    };

    const computeKgPerLot = (rate: number, rateUnit: RateUnit) => {
        return rateUnit === RateUnit.G ? rate / 1000 : 0;
    };

    const totalLitres = order.productDetails.reduce((total, product) => total + computeLitresPerLot(product.rate, product.rateUnit), 0);
    const totalKg = order.productDetails.reduce((total, product) => total + computeKgPerLot(product.rate, product.rateUnit), 0);

    const handleNextClick = () => {
        dispatch(nextPage());
    // Navigate to the next page if needed
    };

    return (
        <VStack p={4} w="full" h="full">
            <Text fontSize="2xl" fontWeight="bold">Order Execution</Text>
            <Box mt={4}>
                <Text>Lot number: {order.lotNumber}</Text>
                <Text>Quantity to treat: {order.quantity}</Text>
                <Text>Bag size: {order.bagSize}</Text>
                <Text>Expected amount of bags: <b>{order.orderRecipe.numberOfBags}</b></Text>
            </Box>
            <Table variant="simple" mt={4} border="1px solid" borderColor="gray.200">
                <Thead bg="orange.100">
                    <Tr>
                        <Th>Product name</Th>
                        <Th>Litres per lot</Th>
                        <Th>Kg per lot</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {order.productDetails.map(product => (
                        <Tr key={product.id}>
                            <Td>{product.product?.name}</Td>
                            <Td>{computeLitresPerLot(product.rate, product.rateUnit)}</Td>
                            <Td>{computeKgPerLot(product.rate, product.rateUnit)}</Td>
                        </Tr>
                    ))}
                </Tbody>
                <Tfoot>
                    <Tr>
                        <Th>Total</Th>
                        <Th>{totalLitres}</Th>
                        <Th>{totalKg}</Th>
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