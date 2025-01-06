import React, { useState } from 'react';
import { Box, Text, Button, useMediaQuery, VStack, HStack, NumberInput, NumberInputField, Center } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { nextPage, saveOrderExecution, setPackedseedsToTreatKg } from '../store/executionSlice';

const OrderExecution7PackingDetails = () => {
    const [isMobile] = useMediaQuery("(max-width: 600px)");
    const [packedseedsToTreatKg, setPackedseedsToTreatKgState] = useState<number>(0);

    const dispatch: AppDispatch = useDispatch();
    const currentOrderId = useSelector((state: RootState) => state.execution.currentOrderExecution?.orderId);
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === currentOrderId));

    const handleNextButtonClick = () => {
        if (typeof packedseedsToTreatKg === 'number') {
            dispatch(setPackedseedsToTreatKg(packedseedsToTreatKg));
            dispatch(nextPage());
            dispatch(saveOrderExecution());
        }
    };

    if (order?.seedsToTreatKg === undefined) {
        return <Text>Invalid data, order is not found</Text>;
    }

    return (
        <Center w="full" h="full">
            <VStack p={4}>
                <Text fontSize="xl" fontWeight="bold" textAlign="center"><span>How many seeds (kg)</span><br/><span>did you pack out of?</span></Text>
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
                        value={packedseedsToTreatKg}
                        onChange={(valueString) => setPackedseedsToTreatKgState(valueString === "" ? 0 : Number(valueString))}
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
                <Text p={2} mt={4}>You are obliged to make a photo of treater display showing this result on the next page!</Text>
                <Box p={2} mt={4} w="full">
                    {order?.seedsToTreatKg > packedseedsToTreatKg ? (
                        <Text><b><span style={{ color: "red" }}>{(order?.seedsToTreatKg - packedseedsToTreatKg).toFixed(2)} kg is missing!</span></b> Please inform your line manager if you cannot find it</Text>
                    ) : (
                        <Text>This corresponds to the weight of the lot.</Text>
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
        </Center>
    );
};

export default OrderExecution7PackingDetails;
