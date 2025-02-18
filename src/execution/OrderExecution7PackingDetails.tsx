import React, { useState } from 'react';
import { Box, Text, Button, useMediaQuery, VStack, HStack, NumberInput, NumberInputField } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { nextPage, saveOrderExecution, setPackedseedsToTreatKg } from '../store/executionSlice';
import { useTranslation } from 'react-i18next';

const OrderExecution7PackingDetails = () => {
    const { t } = useTranslation();
    const [isMobile] = useMediaQuery("(max-width: 600px)");
    const [packedseedsToTreatKg, setPackedseedsToTreatKgState] = useState<number>(0);

    const dispatch: AppDispatch = useDispatch();
    const currentOrder = useSelector((state: RootState) => state.execution.currentOrder);

    const handleNextButtonClick = () => {
        if (typeof packedseedsToTreatKg === 'number') {
            dispatch(setPackedseedsToTreatKg(packedseedsToTreatKg));
            dispatch(nextPage());
            dispatch(saveOrderExecution());
        }
    };

    if (currentOrder === undefined || currentOrder?.seedsToTreatKg === undefined || currentOrder.seedsToTreatKg === null) {
        return <Text>{t('order_execution.invalid_data_order_not_found')}</Text>;
    }

    return (
        
        <VStack h='full' overflow={'auto'}>
            <Text fontSize="xl" fontWeight="bold" textAlign="center">{t('order_execution.how_many_seeds_kg')}</Text>
            <Box
                mt={4}
                p={8}
                bg="orange.500"
                color="white"
                fontSize="4xl"
                fontWeight="bold"
                borderRadius="md"
            >
                <NumberInput
                    value={packedseedsToTreatKg}
                    onChange={(valueString) => setPackedseedsToTreatKgState(valueString === "" ? 0 : Number(valueString))}
                    min={0}
                    width="100%"
                >
                    <NumberInputField
                        textAlign="center"
                        fontSize="inherit"
                        fontWeight="inherit"
                        background="inherit"
                        color="inherit"
                        border="none"
                    />
                </NumberInput>
            </Box>
            <Text p={2} mt={4}>{t('order_execution.obliged_to_make_photo_treater_display')}</Text>
            <Box p={2} mt={4} w="full">
                {currentOrder.seedsToTreatKg > packedseedsToTreatKg ? (
                    <Text><b><span style={{ color: "red" }}>{t('order_execution.kg_is_missing', { kg: (currentOrder.seedsToTreatKg - packedseedsToTreatKg).toFixed(2)})}</span></b> {t('order_execution.inform_line_manager')}</Text>
                ) : (
                    <Text>{t('order_execution.corresponds_to_weight')}</Text>
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
                    {t('order_execution.next')}
                </Button>
            </HStack>
        </VStack>
    );
};

export default OrderExecution7PackingDetails;
