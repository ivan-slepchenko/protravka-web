import React from 'react';
import { Box, Text, Button, useMediaQuery, VStack, HStack, Center } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { completeExecution, nextPage } from '../store/executionSlice';
import { OrderExecutionPage } from './OrderExecutionPage';
import { changeOrderStatus } from '../store/ordersSlice';
import { OrderStatus } from '../store/newOrderSlice';

const OrderExecution11Completion = () => {
    const dispatch: AppDispatch = useDispatch();
    const [isMobile] = useMediaQuery("(max-width: 600px)");
    const currentOrderId = useSelector((state: RootState) => state.execution.currentOrderId);
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === currentOrderId));

    const handleCompleteClick = () => {
        if (currentOrderId !== null) {
            dispatch(nextPage(OrderExecutionPage.InitialOverview));
            dispatch(completeExecution());
            dispatch(changeOrderStatus({ id: currentOrderId, status: OrderStatus.Executed }));
        } else {
            console.error('No current order id');
        }
    };

    return (
        <VStack p={4} w="full" h="full">
            <Center h="full">
                <VStack>
                    <Text mt={4} textAlign="center">
                        <span><strong>{'You finished treating lot '}{order?.lotNumber}.</strong></span>
                        <br />
                        <br />
                        <span>{'Please check your further tasks for today or contact your Manager.'}</span>
                    </Text>111
                    <Box
                        mt={4}
                        p={8}
                        bg="orange.500"
                        color="white"
                        fontSize="4xl"
                        fontWeight="bold"
                        borderRadius="md"
                    >
                        {'Thank you'}
                    </Box>
                </VStack>
            </Center>
            <HStack justifyContent={"center"} mt='auto'>
                <Button
                    mt={8}
                    w="100px" 
                    colorScheme="orange"
                    borderRadius="full"
                    _hover={{ bg: "orange.600" }}
                    size={isMobile ? "md" : "lg"}
                    onClick={handleCompleteClick}
                >
                    {'Ok'}
                </Button>
            </HStack>
        </VStack>
    );
};

export default OrderExecution11Completion;