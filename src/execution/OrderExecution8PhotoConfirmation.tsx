import React from 'react';
import { Box, Text, Button, useMediaQuery, VStack, HStack } from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import { nextPage } from '../store/executionSlice';
import { OrderExecutionPage } from './OrderExecutionPage';

const OrderExecutionPhotoConfirmation = () => {
    const [isMobile] = useMediaQuery("(max-width: 600px)");
    const dispatch = useDispatch();

    const handleNextClick = () => {
        dispatch(nextPage());
    // Navigate to the next page if needed
    };

    return (
        <VStack p={4} w="full" h="full">
            <Text fontSize="2xl" fontWeight="bold">How many seeds did you pack out of?</Text>
            <Box
                mt={4}
                p={8}
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
                textAlign="center"
            >
                Photo of the machine display
            </Box>
            <HStack justifyContent={"center"} mt='auto'>
                <Button
                    colorScheme="orange"
                    borderRadius="full"
                    size={isMobile ? "sm" : "md"}
                    mr={4}
                >
                    Retake the picture
                </Button>
                <Button
                    colorScheme="orange"
                    borderRadius="full"
                    _hover={{ bg: "orange.600" }}
                    size={isMobile ? "md" : "lg"}
                    onClick={handleNextClick}
                >
                    Next
                </Button>
            </HStack>
        </VStack>
    );
};

export default OrderExecutionPhotoConfirmation;