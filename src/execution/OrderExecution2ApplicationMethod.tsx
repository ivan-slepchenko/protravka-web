import React from 'react';
import { Box, Text, Button, VStack } from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { nextPage, setApplicationMethod } from '../store/executionSlice';

const OrderExecution2ApplicationMethod = () => {
    const dispatch: AppDispatch = useDispatch();

    const handleApplicationMethodSelect = (method: string) => {
        dispatch(setApplicationMethod(method));
        dispatch(nextPage());
    };

    return (
        <VStack p={4} w="full" h="full" justifyContent="center" gap={4}>
            <Text fontSize="xl" fontWeight="bold" textAlign="center">Choose the application method</Text>
            <Button
                onClick={() => handleApplicationMethodSelect('Surry')}
                borderRadius="md"
                width="200px"
                border="1px solid"
                borderColor="gray.300"
                _hover={{ backgroundColor: 'gray.100' }}
            >
                Surry
            </Button>
            <Button
                onClick={() => handleApplicationMethodSelect('CDS')}
                borderRadius="md"
                width="200px"
                border="1px solid"
                borderColor="gray.300"
                _hover={{ backgroundColor: 'gray.100' }}
            >
                CDS
            </Button>
        </VStack>
    );
};

export default OrderExecution2ApplicationMethod;
