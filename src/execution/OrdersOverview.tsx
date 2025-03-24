import React, { useState } from 'react';
import { Box, VStack, Text, Button, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, HStack, Badge, Grid } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { deactivateActiveExecution, startExecution } from '../store/executionSlice';
import { changeOrderStatus, fetchOrders } from '../store/ordersSlice';
import { Order, OrderStatus } from '../store/newOrderSlice';
import { useTranslation } from 'react-i18next';

const currentDate = new Date().toLocaleDateString();

const OrdersOverview: React.FC = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
    const cancelRef = React.useRef(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isAlreadyInProgress, setIsAlreadyInProgress] = useState<boolean>(false);
    const [warningOperator, setWarningOperator] = useState<{ name: string; surname: string } | null>(null);
    const user = useSelector((state: RootState) => state.user);
    const orders = useSelector((state: RootState) => 
        state.orders.activeOrders.filter(order => {
            const now = Date.now();
            const applicationDate = order.applicationDate || 0;
            return (
                (order.operator === null || order.operator.email === user.email) &&
                order.status === OrderStatus.RecipeCreated &&
                applicationDate <= now
            );
        })
    );
    const fetchError = useSelector((state: RootState) => state.orders.fetchError);

    const handleOrderClick = (order: Order) => {
        setSelectedOrder(order);
        onOpen();
    };

    const handleConfirm = async () => {
        if (selectedOrder) {
            try {
                //TODO: IVAN - this should be refactored, we need to run this whole thing on backend
                const result = await dispatch(
                    changeOrderStatus({ id: selectedOrder.id, status: OrderStatus.TreatmentInProgress })
                ).unwrap();
                if (result.alreadyInProgress) {
                    setIsAlreadyInProgress(true);
                    setWarningOperator(result.operator);
                    fetchOrders();
                    onClose();
                    onAlertOpen();
                } else {
                    await dispatch(startExecution(selectedOrder)).unwrap();
                }
                onClose();
            } catch (error) {
                // TODO: Potentially status may be updated, but right after that internet connection may be lost, so execution will not be started.
                // TODO: This should be somehow handled on backend.
                console.log('Internet is not available: ', error);
                dispatch(deactivateActiveExecution()); // If no internet, complete it immediately.
                onAlertOpen();
            }
        }
    };

    const onRefreshClick = async () => {
        dispatch(fetchOrders());
    };

    const renderOrderCard = (order: Order) => (
        <Box
            key={order.id}
            borderColor="gray.200"
            borderWidth={1}
            borderStyle="solid"
            borderRadius="md"
            p={2}
            w="full"
            cursor="pointer"
            onClick={() => handleOrderClick(order)}
            _hover={{ bg: "gray.100" }}
            maxW={'400px'}
        >
            <Grid templateColumns="1fr 3fr" gap={2} fontSize="sm">
                <Badge colorScheme='blue' gridColumn="span 3">
                    <HStack w="full" justifyContent='space-between'>
                        <Text isTruncated>
                            {order.crop?.name}, {order.variety?.name}
                        </Text>
                    </HStack>
                </Badge>
                <Text px={1} gridColumn="span 2">{t('orders_overview.lot')}:</Text>
                <Text isTruncated>{order.lotNumber}</Text>
                <Text px={1} gridColumn="span 2">Untreated Average TKW:</Text>
                <Text isTruncated>{order.tkw} kg</Text>
                <Text px={1} gridColumn="span 2">{t('orders_overview.products')}:</Text>
                <HStack>
                    <Box display='flow'>
                        {order.productDetails.map(productDetail => (
                            <Text key={productDetail.id} fontSize="sm">{productDetail.product?.name}</Text>
                        ))}
                    </Box>
                </HStack>
                <Text px={1} gridColumn="span 2">Seeds To Treat:</Text>
                <Text isTruncated>{order.seedsToTreatKg}</Text>
            </Grid>
        </Box>
    );

    return (
        <Box w="full" h="full">
            <VStack w="full" h="full" p={4} overflow="auto">
                {fetchError ? (
                    <>
                        <Text py={2} px={2} fontSize="lg" color="red.600">{t('orders_overview.no_internet_access')}</Text>
                        <Button colorScheme="orange" onClick={onRefreshClick}>{t('orders_overview.refresh')}</Button>
                    </>
                ) : (
                    <>
                        <Text py={2} px={2} fontSize="lg">{t('orders_overview.lots_to_treat_today', { date: currentDate })}</Text>
                        <Text py={2} px={2} fontSize="md" color="gray.600">{t('orders_overview.choose_lot_to_start')}</Text>
                        <VStack mt={4} w="full" spacing={4}>
                            {orders.map(order => renderOrderCard(order))}
                        </VStack>
                    </>
                )}
            </VStack>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent margin={4}>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            {t('orders_overview.confirm_start_processing')}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            {t('orders_overview.confirm_start_processing_message')}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                {t('orders_overview.cancel')}
                            </Button>
                            <Button colorScheme="red" onClick={handleConfirm} ml={3}>
                                {t('orders_overview.confirm')}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            <AlertDialog
                isOpen={isAlertOpen}
                leastDestructiveRef={cancelRef}
                onClose={() => {
                    if (isAlreadyInProgress) {
                        setIsAlreadyInProgress(false);
                        setWarningOperator(null);
                        window.location.href = '/board'; // Redirect to /board
                    } else {
                        onAlertClose();
                    }
                }}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent margin={4}>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            {isAlreadyInProgress
                                ? 'Order Is Already In Progress'
                                : t('orders_overview.internet_connection_required')}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            {isAlreadyInProgress
                                ? `Operator is already in progress by ${warningOperator?.name} ${warningOperator?.surname}`
                                : t('orders_overview.internet_connection_required_message')}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onAlertClose}>
                                {t('orders_overview.close')}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default OrdersOverview;