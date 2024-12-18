import React, { useState } from "react";
import { Box, Button, Tabs, TabList, TabPanels, Tab, TabPanel, HStack, Heading, Textarea, Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState, AppDispatch } from "../../store/store";
import { fetchProducts } from "../../store/productsSlice";
import { fetchOrderExecution } from "../../store/executionSlice";
import OrderExecutionTab from "./OrderExecutionTab";
import OrderRecipeTab from "./OrderRecipeTab";
import { OrderStatus } from "../../store/newOrderSlice";
import { changeOrderStatus } from "../../store/ordersSlice";

const OrderInfo: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === orderId));
    const orderExecution = useSelector((state: RootState) => state.execution.orderExecutions.find(execution => execution.orderId === orderId));
    const [comment, setComment] = useState<string>('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [status, setStatus] = useState<OrderStatus | null>(null);

    React.useEffect(() => {
        if (orderId !== undefined) {
            dispatch(fetchProducts());
            dispatch(fetchOrderExecution(orderId));
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
                return <Heading size="lg" color="green.500" fontWeight="bold">Completed</Heading>;
            case OrderStatus.Failed:
                return <Heading size="lg" color="red.500" fontWeight="bold">Failed</Heading>;
            default:
                return null;
        }
    };

    return (
        <Box w="full" h="full" overflowY="auto">
            <HStack alignItems="center" p="4" borderBottom="1px solid #ccc">
                <Heading size="lg">Order: {order.lotNumber}</Heading>
                {getStatusLabel()}
                <Button ml="auto" onClick={handleClose}>Close</Button>
            </HStack>
            <Box p="4">
                <Tabs>
                    <TabList>
                        <Tab>Recipe</Tab>
                        {orderExecution && <Tab>Execution</Tab>}
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
                    <Button ml="auto" colorScheme="blue" onClick={handleApprove}>Mark as Completed</Button>
                    <Button colorScheme="red" onClick={handleDisapprove}>Mark as Failed</Button>
                </HStack>
            )}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalCloseButton />
                    <ModalBody>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Enter your comment here..."
                        />
                        <Button mt="4" colorScheme="blue" onClick={handleSubmit}>Submit</Button>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default OrderInfo;