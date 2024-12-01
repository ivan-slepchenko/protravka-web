import React from 'react';
import { Box, Text, Button, VStack } from '@chakra-ui/react';

const OrderExecutionApplicationMethod = () => {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh" p={4}>
            <VStack spacing={8} width="100%" maxWidth="400px">
                <Text fontSize="2xl" fontWeight="bold" textAlign="center">Choose the application method</Text>
                <Button
                    width="100%"
                    height="100px"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="gray.300"
                    _hover={{ backgroundColor: 'gray.100' }}
                >
          Slurry
                </Button>
                <Button
                    width="100%"
                    height="100px"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="gray.300"
                    _hover={{ backgroundColor: 'gray.100' }}
                >
          CDS
                </Button>
            </VStack>
        </Box>
    );
};

export default OrderExecutionApplicationMethod;
