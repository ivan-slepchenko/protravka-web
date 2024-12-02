import React, { useState } from 'react';
import { Box, Text, Checkbox, Button, VStack, HStack } from '@chakra-ui/react';
import { nextPage } from '../store/executionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';

const OrderExecution6TreatingConfirmation = () => {
    const [isChecked, setIsChecked] = useState(false);
    const dispatch: AppDispatch = useDispatch();

    const { currentOrderId } = useSelector((state: RootState) => state.execution);
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === currentOrderId));


    const handleNextButtonClick = () => {
        dispatch(nextPage());
    };

    const lotNumber = order?.lotNumber; // Replace with actual lot number

    return (
        <VStack p={4} w="full" h="full" gap={6}>
            <Text fontSize="xl" fontWeight="bold" textAlign="center">
                You are currently treating lot {lotNumber}
            </Text>
            <Text fontSize="md" textAlign="center">
                Please confirm when you finish the lot
            </Text>
            <Checkbox
                mt="auto"
                isChecked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                borderColor="green.300"
                alignSelf="flex-start"
            >
                I hereby confirm that I finished to treat lot {lotNumber} and ready to give the number of units packed.
            </Checkbox>
            <HStack justifyContent={"center"}>
                <Button
                    width="100%"
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