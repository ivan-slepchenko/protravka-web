import React, { useState } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Text, VStack, HStack, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button, Box } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { deactivateActiveExecution, saveOrderExecution, saveOrderExecutionPreparationStartTime, setActiveExecutionToEmptyOne } from '../store/executionSlice';
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
    const user = useSelector((state: RootState) => state.user);
    const orders = useSelector((state: RootState) => 
        state.orders.activeOrders.filter(order => 
            (order.operator === null || order.operator.email === user.email) && 
            order.status === OrderStatus.RecipeCreated
        )
    );
    const fetchError = useSelector((state: RootState) => state.orders.fetchError);

    const handleOrderClick = (order: Order) => {
        setSelectedOrder(order);
        onOpen();
    };

    const handleConfirm = async () => {
        if (selectedOrder) {
            dispatch(setActiveExecutionToEmptyOne(selectedOrder));
            try {
                dispatch(changeOrderStatus({ id: selectedOrder.id, status: OrderStatus.TreatmentInProgress }));
                await dispatch(saveOrderExecution()).unwrap(); //if no internet, this fails first. 
                dispatch(saveOrderExecutionPreparationStartTime(selectedOrder.id));
                onClose();
            } catch (error) {
                console.log('Internet is not available: ', error);
                dispatch(deactivateActiveExecution()); //if no internet, because we started execution, we should complete it immediatelly.
                onAlertOpen();
            }
        }
    };

    const onRefreshClick = async () => {
        dispatch(fetchOrders());
    };

    return (
        <Box w='full' h='full'>
            <VStack w='full' h='full' p={4} overflow='auto'>
                {fetchError ? (
                    <>
                        <Text py={2} px={2} fontSize="lg" color="red.600">{t('orders_overview.no_internet_access')}</Text>
                        <Button colorScheme="orange" onClick={onRefreshClick}>{t('orders_overview.refresh')}</Button>
                    </>
                ) : (
                    <>
                        <Text py={2} px={2} fontSize="lg">{t('orders_overview.lots_to_treat_today', { date: currentDate })}</Text>
                        <Text py={2} px={2} fontSize="md" color="gray.600">{t('orders_overview.choose_lot_to_start')}</Text>
                
                        <TableContainer mt={4} w="full" overflowY='visible'>
                            <Table variant="simple" size="sm" w="full">
                                <Thead bg="orange.100">
                                    <Tr>
                                        <Th>{t('orders_overview.crop')}</Th>
                                        <Th>{t('orders_overview.lot')}</Th>
                                        <Th>{t('orders_overview.products')}</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {orders.map(order => (
                                        <Tr key={order.id} onClick={() => handleOrderClick(order)} cursor="pointer" _hover={{ bg: "gray.100" }} height={"50px"}>
                                            <Td>
                                                <HStack>
                                                    <Text>{order.crop.name}</Text>
                                                    <Text fontSize="sm" color="gray.600">{order.variety.name}</Text>
                                                </HStack>
                                            </Td>
                                            <Td>{order.lotNumber}</Td>
                                            <Td>
                                                <VStack gap={2} alignItems={"left"}>
                                                    {order.productDetails.map(productDetail => (
                                                        <Text key={productDetail.id} fontSize="sm">{productDetail.product?.name}</Text>
                                                    ))}
                                                </VStack>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
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
                onClose={onAlertClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent margin={4}>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            {t('orders_overview.internet_connection_required')}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            {t('orders_overview.internet_connection_required_message')}
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