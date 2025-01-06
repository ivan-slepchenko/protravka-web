import React, { useState } from 'react';
import { Text, Checkbox, Button, VStack, HStack, Center } from '@chakra-ui/react';
import { nextPage, saveOrderExecution } from '../store/executionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';

const OrderExecution6TreatingConfirmation = () => {
    const [isChecked, setIsChecked] = useState(false);
    const dispatch: AppDispatch = useDispatch();

    const currentOrderId = useSelector((state: RootState) => state.execution.currentOrderExecution?.orderId);
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === currentOrderId));


    const handleNextButtonClick = () => {
        dispatch(nextPage());
        dispatch(saveOrderExecution());
    };

    const lotNumber = order?.lotNumber; // Replace with actual lot number

    return (
        <VStack p={4} w="full" h="full" gap={6}>
            <Center w="full" h="full">
                <VStack>
                    <Text textAlign="center">
                        <span>You are currently treating lot <b>{lotNumber}</b></span>
                    </Text>
                    <Text fontSize="lg" textAlign="center" fontWeight="bold">
                        Please confirm when you finish the lot
                    </Text>
                </VStack>
            </Center>
            <Checkbox
                mt="auto"
                isChecked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                borderColor="green.300"
                alignSelf="flex-start"
            >
                <span>I hereby confirm that I finished to treat lot</span> <b>{lotNumber}</b> and ready to give the number of units packed.
            </Checkbox>
            <HStack justifyContent={"center"}>
                <Button
                    w="100px" 
                    borderRadius="full"
                    colorScheme="orange"
                    isDisabled={!isChecked}
                    _hover={{ backgroundColor: 'orange.200' }}
                    onClick={handleNextButtonClick}
                >
                    Next
                </Button>
            </HStack>
        </VStack>
    );
};

export default OrderExecution6TreatingConfirmation;