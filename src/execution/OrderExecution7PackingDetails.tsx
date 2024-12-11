import React, { useState } from 'react';
import { Box, Text, Button, useMediaQuery, VStack, HStack, NumberInput, NumberInputField } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { nextPage, setPackedQuantity } from '../store/executionSlice';

const OrderExecution7PackingDetails = () => {
    const [isMobile] = useMediaQuery("(max-width: 600px)");
    const [packedQuantity, setPackedQuantityState] = useState<number>(0);

    const dispatch: AppDispatch = useDispatch();
    const currentOrderId = useSelector((state: RootState) => state.execution.currentOrderId);
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === currentOrderId));

    const handleNextButtonClick = () => {
        if (typeof packedQuantity === 'number') {
            dispatch(setPackedQuantity(packedQuantity));
            dispatch(nextPage());
        }
    };

    if (order?.quantity === undefined) {
        return <Text>Invalid data, order is not found</Text>;
    }

    return (
        <VStack p={4} w="full" h="full">
            <Text fontSize="xl" fontWeight="bold">How many seeds did you pack out of?</Text>
            <Box
                mt={4}
                p={8}
                bg="orange.500"
                color="white"
                fontSize="4xl"
                fontWeight="bold"
                borderRadius="md"
            >
                <NumberInput
                    value={packedQuantity}
                    onChange={(valueString) => setPackedQuantityState(valueString === "" ? 0 : Number(valueString))}
                    min={0}
                    width="100%"
                >
                    <NumberInputField
                        textAlign="center"
                        fontSize="inherit"
                        fontWeight="inherit"
                        background="inherit"
                        color="inherit"
                        border="none"
                    />
                </NumberInput>
            </Box>
            <Text mt={4}>You are obliged to make a photo of treater display showing this result on the next page!</Text>
            <Box mt={4} textAlign="left">
                {order?.quantity > packedQuantity ? (
                    <Text>{(order?.quantity - packedQuantity).toFixed(2)} kg is missing! Please inform your line manager if you cannot find it</Text>
                ) : (
                    <Text>This corresponds to the weight of the lot</Text>
                )}
            </Box>
            <HStack justifyContent={"center"} mt='auto'>
                <Button
                    mt={8}
                    w="100px" 
                    colorScheme="orange"
                    borderRadius="full"
                    _hover={{ bg: "orange.600" }}
                    size={isMobile ? "md" : "lg"}
                    onClick={handleNextButtonClick}
                >
                    Next
                </Button>
            </HStack>
        </VStack>
    );
};

export default OrderExecution7PackingDetails;
