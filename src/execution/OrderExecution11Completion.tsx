import React, { useState } from 'react';
import { Box, Text, Button, useMediaQuery, VStack, HStack, Center, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Spinner } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { completeExecution, nextPage, saveOrderExecution } from '../store/executionSlice';
import { OrderExecutionPage } from './OrderExecutionPage';
import { changeOrderStatus } from '../store/ordersSlice';
import { OrderStatus } from '../store/newOrderSlice';
import { useFeatures } from '../contexts/FeaturesContext';

const OrderExecution11Completion = () => {
    const dispatch: AppDispatch = useDispatch();
    const useLab = useFeatures().features.lab;
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
            await dispatch(saveOrderExecution()).unwrap();
            dispatch(nextPage(OrderExecutionPage.InitialOverview));
            if (useLab) {
                dispatch(changeOrderStatus({ id: currentOrder.id, status: OrderStatus.ForLabToControl }));
            } else {
                dispatch(changeOrderStatus({ id: currentOrder.id, status: OrderStatus.ToAcknowledge }));
            }
            dispatch(completeExecution());
        } catch (error) {
            onOpen();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <VStack p={4} w="full" h="full">
            <Center h="full">
                <VStack>
                    <Text mt={4} textAlign="center">
                        <span><strong>{'You finished treating lot '}{currentOrder.lotNumber}.</strong></span>
                        <br />
                        <br />
                        <span>{'Please check your further tasks for today or contact your Manager.'}</span>
                    </Text>
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
                    {isSaving ? <Spinner size="sm" /> : 'Ok'}
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
                            Internet Connection Required
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            {'You may complete execution only when internet access is available. Please find better internet connection.'}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Close
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </VStack>
    );
};

export default OrderExecution11Completion;