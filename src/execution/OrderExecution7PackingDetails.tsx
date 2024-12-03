import React, { useState } from 'react';
import { Box, Text, Button, useMediaQuery, VStack, HStack } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { nextPage, setPackedQuantity } from '../store/executionSlice';

const OrderExecutionPackingDetails = () => {
    const [isMobile] = useMediaQuery("(max-width: 600px)");
    const [packedQuantity, setPackedQuantityState] = useState<number>(0);

    const dispatch: AppDispatch = useDispatch();
    const expectedSeeds = useSelector((state: RootState) => state.execution.expectedSeeds);

    const handleNextButtonClick = () => {
        if (typeof packedQuantity === 'number') {
            dispatch(setPackedQuantity(packedQuantity));
            dispatch(nextPage());
        }
    };

    return (
        <VStack p={4} w="full" h="full">
            <Text fontSize="2xl" fontWeight="bold">How many seeds did you pack out of?</Text>
            <Box
                mt={4}
                p={8}
                bg="orange.500"
                color="white"
                fontSize="4xl"
                fontWeight="bold"
                borderRadius="md"
            >
                <input
                    type="number"
                    value={packedQuantity}
                    onChange={(e) => setPackedQuantityState(e.target.value === "" ? 0 : Number(e.target.value))}
                    style={{ width: '100%', textAlign: 'center', fontSize: 'inherit', fontWeight: 'inherit', background: 'inherit', color: 'inherit', border: 'none' }}
                />
            </Box>
            <Text mt={4}>You are obliged to make a photo of treater display showing this result on the next page!</Text>
            <Box mt={4} textAlign="left">
                {expectedSeeds > packedQuantity ? (
                    <Text>{expectedSeeds - packedQuantity} kg is missing! Please inform your line manager if you cannot find it</Text>
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

export default OrderExecutionPackingDetails;
