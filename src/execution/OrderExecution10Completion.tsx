import React from 'react';
import { Box, Text, Button, useMediaQuery, VStack, HStack } from '@chakra-ui/react';

const OrderExecutionCompletion = () => {
    const [isMobile] = useMediaQuery("(max-width: 600px)");

    const handleCompleteClick = () => {

    // Navigate to the next page if needed
    };

    return (
        <VStack p={4} w="full" h="full">
            <Text fontSize="2xl" fontWeight="bold">You finished treating lot xxx</Text>
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
            <HStack justifyContent={"center"} mt='auto'>
                <Button
                    mt={8}
                    colorScheme="orange"
                    borderRadius="full"
                    _hover={{ bg: "orange.600" }}
                    size={isMobile ? "md" : "lg"}
                    onClick={handleCompleteClick}
                >
                    {'Next'}
                </Button>
            </HStack>
        </VStack>
    );
};

export default OrderExecutionCompletion;