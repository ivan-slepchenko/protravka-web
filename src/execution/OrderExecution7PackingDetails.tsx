import React from 'react';
import { Box, Text, Button, useMediaQuery, VStack, HStack } from '@chakra-ui/react';

const OrderExecutionPackingDetails = () => {
    const [isMobile] = useMediaQuery("(max-width: 600px)");

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
                XXXX
            </Box>
            <Text mt={4}>You are obliged to make a photo of treater display showing this result on the next page!</Text>
            <Box mt={4} textAlign="left">
                <Text>Option 1: This corresponds to the weight of the lot</Text>
                <Text mt={2}>Option 2: XXX kg is missing! Please inform your line manager if you cannot find it</Text>
            </Box>
            <HStack justifyContent={"center"} mt='auto'>
                <Button
                    mt={8}
                    colorScheme="orange"
                    borderRadius="full"
                    _hover={{ bg: "orange.600" }}
                    size={isMobile ? "md" : "lg"}
                >
                    swipe
                </Button>
            </HStack>
        </VStack>
    );
};

export default OrderExecutionPackingDetails;
