import React, { useState } from 'react';
import { Box, Text, Button, useMediaQuery, VStack, HStack, Center, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Spinner } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { deactivateActiveExecution, fetchTkwMeasurements, nextPage, saveOrderExecution, saveOrderExecutionTreatmentFinishTime } from '../store/executionSlice';
import { OrderExecutionPage } from './OrderExecutionPage';
import { changeOrderStatus } from '../store/ordersSlice';
import { OrderStatus } from '../store/newOrderSlice';
import { useTranslation } from 'react-i18next';

const OrderExecution11Completion = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const useLab = user.company?.featureFlags.useLab;
    const [isMobile] = useMediaQuery("(max-width: 600px)");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef(null);
    const currentOrder = useSelector((state: RootState) => state.execution.currentOrder);
    const [isSaving, setIsSaving] = useState(false);

    if (currentOrder === null) {
        return null;
    }

    const handleCompleteClick = async () => {
        setIsSaving(true);
        try {
            dispatch(nextPage(OrderExecutionPage.InitialOverview));
            await dispatch(saveOrderExecution()).unwrap();
            if (useLab) {
                dispatch(changeOrderStatus({ id: currentOrder.id, status: OrderStatus.LabToControl }));
            } else {
                dispatch(changeOrderStatus({ id: currentOrder.id, status: OrderStatus.ToAcknowledge }));
            }
            dispatch(saveOrderExecutionTreatmentFinishTime(currentOrder.id))
            dispatch(deactivateActiveExecution());
            if (useLab) {
                dispatch(fetchTkwMeasurements());
            }
        } catch (error) {
            console.log('Internet is not available: ', error);
            dispatch(nextPage(OrderExecutionPage.Completion));
            onOpen();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <VStack w="full" h="full">
            <Center h="full">
                <VStack>
                    <Text fontSize="xl" fontWeight="bold" textAlign="center">
                        {t('order_execution.finished_treating_lot', { lotNumber: currentOrder.lotNumber })}
                    </Text>
                    <Text>
                        {t('order_execution.check_further_tasks')}
                    </Text>
                    <Box
                        mt={4}
                        color="orange.500"
                        fontSize="4xl"
                        fontWeight="bold"
                        borderRadius="md"
                    >
                        {t('order_execution.thank_you')}
                    </Box>
                </VStack>
            </Center>
            <HStack justifyContent={"center"} mt='auto'>
                <Button
                    mt={8}
                    w="100px" 
                    colorScheme="orange"
                    borderRadius="full"
                    _hover={{ bg: "orange.600" }}
                    size={isMobile ? "md" : "lg"}
                    onClick={handleCompleteClick}
                    isDisabled={isSaving}
                >
                    {isSaving ? <Spinner size="sm" /> : t('order_execution.ok')}
                </Button>
            </HStack>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent margin={4}>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            {t('order_execution.internet_connection_required')}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            {t('order_execution.internet_connection_required_message')}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                {t('order_execution.close')}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </VStack>
    );
};

export default OrderExecution11Completion;