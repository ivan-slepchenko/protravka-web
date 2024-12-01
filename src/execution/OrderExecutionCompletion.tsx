import React from 'react';
import { Box, Text, Button, useMediaQuery } from '@chakra-ui/react';
import { useDispatch } from 'react-redux';

const OrderExecutionCompletion = () => {
    const [isMobile] = useMediaQuery("(max-width: 600px)");
    const dispatch = useDispatch();

    const handleCompleteClick = () => {

    // Navigate to the next page if needed
    };

    return (
        <Box p={4} textAlign="center" display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
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
        Thank you
            </Box>
            <Button
                mt={8}
                colorScheme="orange"
                borderRadius="full"
                _hover={{ bg: "orange.600" }}
                size={isMobile ? "md" : "lg"}
                onClick={handleCompleteClick}
            >
        swipe
            </Button>
        </Box>
    );
};

export default OrderExecutionCompletion;