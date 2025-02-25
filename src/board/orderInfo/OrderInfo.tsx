import { FC, useEffect, useState } from "react";
import { Box, Button, Tabs, TabList, TabPanels, Tab, TabPanel, HStack, Heading, Textarea, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, useDisclosure, ModalHeader } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState, AppDispatch } from "../../store/store";
import OrderExecutionTab from "./OrderExecutionTab";
import OrderRecipeTab from "./OrderRecipeTab";
import { OrderStatus } from "../../store/newOrderSlice";
import { changeOrderStatus } from "../../store/ordersSlice";
import { fetchOrderExecutionForOrder, OrderExecution } from "../../store/executionSlice";
import { useTranslation } from 'react-i18next';

const OrderInfo: FC = () => {
    const { t } = useTranslation();
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === orderId));

    const [comment, setComment] = useState<string>('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [status, setStatus] = useState<OrderStatus | null>(null);
    const [orderExecution, setOrderExecution] = useState<OrderExecution | null>(null);

    useEffect(() => {
        if (orderId !== undefined) {
            fetchOrderExecutionForOrder(orderId).then((order) => {
                setOrderExecution(order);
            });
        }
    }, [dispatch, orderId]);

    if (!order) return null;

    const handleClose = () => {
        navigate('/board');
    };

    const handleApprove = () => {
        setStatus(OrderStatus.Completed);
        onOpen();
    };

    const handleDisapprove = () => {
        setStatus(OrderStatus.Failed);
        onOpen();
    };

    const handleSubmit = () => {
        if (order.id && status) {
            dispatch(changeOrderStatus({ id: order.id, status }));
            navigate('/board');
        }
        onClose();
    };

    const getStatusLabel = () => {
        switch (order.status) {
            case OrderStatus.Completed:
                return <Heading size="lg" color="green.500" fontWeight="bold">{t('order_info.completed')}</Heading>;
            case OrderStatus.Failed:
                return <Heading size="lg" color="red.500" fontWeight="bold">{t('order_info.failed')}</Heading>;
            default:
                return null;
        }
    };

    return (
        <Box w="full" h="full" overflowY="auto">
            <HStack alignItems="center" p="4" borderBottom="1px solid #ccc">
                <Heading size="lg">{t('order_info.recipe')}: {order.lotNumber}</Heading>
                {getStatusLabel()}
                <Button ml="auto" onClick={handleClose}>{t('order_info.close')}</Button>
            </HStack>
            <Box p="4">
                <Tabs>
                    <TabList>
                        <Tab>{t('order_info.recipe')}</Tab>
                        {orderExecution && <Tab>{t('order_info.execution')}</Tab>}
                    </TabList>
                    <TabPanels>
                        <TabPanel px={0}>
                            <OrderRecipeTab order={order} />
                        </TabPanel>
                        {orderExecution && (
                            <TabPanel px={0}>
                                <OrderExecutionTab order={order} orderExecution={orderExecution} />
                            </TabPanel>
                        )}
                    </TabPanels>
                </Tabs>
            </Box>
            {order.status === OrderStatus.ToAcknowledge && (
                <HStack w="full" mt="4" textAlign="right" position="fixed" bottom="4" right="4">
                    <Button ml="auto" colorScheme="blue" onClick={handleApprove}>{t('order_info.mark_as_completed')}</Button>
                    <Button colorScheme="red" onClick={handleDisapprove}>{t('order_info.mark_as_failed')}</Button>
                </HStack>
            )}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t('order_info.add_completion_comment')}<ModalCloseButton /></ModalHeader>
                    <ModalBody>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t('order_info.enter_comment')}
                        />
                        <Button mt="4" colorScheme="blue" onClick={handleSubmit}>{t('order_info.submit')}</Button>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default OrderInfo;