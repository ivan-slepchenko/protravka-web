import React, { useState } from 'react';
import { Text, Checkbox, Button, VStack, HStack, Center } from '@chakra-ui/react';
import { nextPage, saveOrderExecution } from '../store/executionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { useTranslation } from 'react-i18next';

const OrderExecution6TreatingConfirmation = () => {
    const { t } = useTranslation();
    const [isChecked, setIsChecked] = useState(false);
    const dispatch: AppDispatch = useDispatch();

    const currentOrder = useSelector((state: RootState) => state.execution.currentOrder);

    if (currentOrder === null) {
        return null;
    }

    const handleNextButtonClick = () => {
        dispatch(nextPage());
        dispatch(saveOrderExecution());
    };

    const lotNumber = currentOrder.lotNumber;

    return (
        <VStack w="full" h="full" gap={6} overflow={'auto'}>
            <Center w="full" h="full">
                <VStack>
                    <Text textAlign="center">
                        <span>{t('order_execution.currently_treating_lot')} <b>{lotNumber}</b></span>
                    </Text>
                    <Text fontSize="lg" textAlign="center" fontWeight="bold">
                        {t('order_execution.confirm_when_finish')}
                    </Text>
                </VStack>
            </Center>
            <Checkbox
                mt="auto"
                isChecked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                borderColor="green.300"
                alignSelf="flex-start"
            >
                <span>{t('order_execution.confirm_finished_treating')} <b>{lotNumber}</b> {t('order_execution.ready_to_give_units_packed')}</span>
            </Checkbox>
            <HStack justifyContent={"center"}>
                <Button
                    w="100px" 
                    borderRadius="full"
                    colorScheme="orange"
                    isDisabled={!isChecked}
                    _hover={{ backgroundColor: 'orange.200' }}
                    onClick={handleNextButtonClick}
                >
                    {t('order_execution.next')}
                </Button>
            </HStack>
        </VStack>
    );
};

export default OrderExecution6TreatingConfirmation;