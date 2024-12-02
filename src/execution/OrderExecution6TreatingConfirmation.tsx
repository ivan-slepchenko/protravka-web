import React, { useState } from 'react';
import { Box, Text, Checkbox, Button, VStack } from '@chakra-ui/react';
import { nextPage } from '../store/executionSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';

const OrderExecution6TreatingConfirmation = () => {
    const [isChecked, setIsChecked] = useState(false);
    const dispatch: AppDispatch = useDispatch();

    const handleNextButtonClick = () => {
        dispatch(nextPage());
    };

    const lotNumber = 'XXX'; // Replace with actual lot number

    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh" p={4}>
            <VStack spacing={8} width="100%" maxWidth="400px">
                <Text fontSize="xl" fontWeight="bold" textAlign="center">
          You are currently treating lot {lotNumber}
                </Text>
                <Text fontSize="md" textAlign="center">
          Please confirm when you finish the lot
                </Text>
                <Checkbox
                    isChecked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    borderColor="green.300"
                    alignSelf="flex-start"
                >
                    I hereby confirm that I finished to treat lot {lotNumber} and ready to give the number of units packed.
                </Checkbox>
                <Button
                    width="100%"
                    borderRadius="full"
                    colorScheme="orange"
                    isDisabled={!isChecked}
                    _hover={{ backgroundColor: 'orange.200' }}
                    onClick={handleNextButtonClick}
                >
                    Next
                </Button>
            </VStack>
        </Box>
    );
};

export default OrderExecution6TreatingConfirmation;