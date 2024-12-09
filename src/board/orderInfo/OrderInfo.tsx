import React from "react";
import { Box, Text, Button, Tabs, TabList, TabPanels, Tab, TabPanel, HStack } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState, AppDispatch } from "../../store/store";
import { fetchProducts } from "../../store/productsSlice";
import { fetchOrderExecution } from "../../store/executionSlice";
import OrderInformation from "./OrderInformation";
import RecipeInformation from "./RecipeInformation";
import ProductDetails from "./ProductDetails";
import OrderExecutionTab from "./OrderExecutionTab";

const OrderInfo: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === orderId));
    const orderExecution = useSelector((state: RootState) => state.execution.orderExecutions.find(execution => execution.orderId === orderId));

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

    return (
        <Box w="full" h="full" overflowY="auto">
            <Box display="flex" justifyContent="space-between" alignItems="center" p="4" borderBottom="1px solid #ccc">
                <Text fontSize="2xl" fontWeight="bold">Your Order</Text>
                <Button onClick={handleClose}>Close</Button>
            </Box>
            <Box p="4">
                <Tabs>
                    <TabList>
                        <Tab>Recipe</Tab>
                        {orderExecution && <Tab>Execution</Tab>}
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Box w="full">
                                <HStack w="full">
                                    <OrderInformation order={order} />
                                    <RecipeInformation order={order} />
                                </HStack>
                                <Text fontSize="md" fontWeight="bold" mt="4" mb="2">Product Details</Text>
                                <ProductDetails order={order} />
                            </Box>
                        </TabPanel>
                        {orderExecution && (
                            <TabPanel>
                                <OrderExecutionTab order={order} orderExecution={orderExecution} />
                            </TabPanel>
                        )}
                    </TabPanels>
                </Tabs>
            </Box>
        </Box>
    );
};

export default OrderInfo;