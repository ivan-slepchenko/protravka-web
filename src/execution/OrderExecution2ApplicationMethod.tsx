import React from 'react';
import { Text, Button, VStack } from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { nextPage, saveOrderExecution, setApplicationMethod } from '../store/executionSlice';
import { useTranslation } from 'react-i18next';

const OrderExecution2ApplicationMethod = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();

    const handleApplicationMethodSelect = (method: string) => {
        dispatch(setApplicationMethod(method));
        dispatch(saveOrderExecution());
        dispatch(nextPage());
    };

    return (
        <VStack p={4} w="full" h="full" justifyContent="center" gap={4}>
            <Text fontSize="xl" fontWeight="bold" textAlign="center">{t('order_execution.choose_application_method')}</Text>
            <Button
                onClick={() => handleApplicationMethodSelect('Surry')}
                borderRadius="md"
                width="200px"
                border="1px solid"
                borderColor="gray.300"
                _hover={{ backgroundColor: 'gray.100' }}
            >
                {t('order_execution.slurry')}
            </Button>
            <Button
                onClick={() => handleApplicationMethodSelect('CDS')}
                borderRadius="md"
                width="200px"
                border="1px solid"
                borderColor="gray.300"
                _hover={{ backgroundColor: 'gray.100' }}
            >
                {t('order_execution.cds')}
            </Button>
        </VStack>
    );
};

export default OrderExecution2ApplicationMethod;
