
import React from "react";
import { Box, Text, Button, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, HStack } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState, AppDispatch } from "../../store/store";
import { fetchProducts } from "../../store/productsSlice";
import { fetchOrderExecution } from "../../store/executionSlice";
import OrderInformation from "./OrderInformation";
import RecipeInformation from "./RecipeInformation";
import ProductDetails from "./ProductDetails";

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
                        <Tab>Execution</Tab>
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
                        <TabPanel>
                            <Box w="full">
                                <Text fontSize="md" fontWeight="bold" mt="4" mb="2">Order Execution Photos</Text>
                                <Box>
                                    <Text fontSize="xs">Packing Photo:</Text>
                                    {orderExecution?.packingPhoto ? <img src={orderExecution.packingPhoto} alt="Packing" /> : 'No Photo'}
                                </Box>
                                <Box>
                                    <Text fontSize="xs">Consumption Photo:</Text>
                                    {orderExecution?.consumptionPhoto ? <img src={orderExecution.consumptionPhoto} alt="Consumption" /> : 'No Photo'}
                                </Box>
                                <Text fontSize="md" fontWeight="bold" mt="4" mb="2">Product Execution Details</Text>
                                <Box maxHeight="300px" overflowY="auto" bg="gray.50" p="2" borderRadius="md">
                                    <Table variant="simple" size="sm" w="full">
                                        <Thead bg="orange.100">
                                            <Tr>
                                                <Th width="35%" whiteSpace="nowrap" borderBottom="2px" borderColor="gray.400">Product Name</Th>
                                                <Th whiteSpace="nowrap" borderBottom="2px" borderColor="gray.400">Application Photo</Th>
                                                <Th whiteSpace="nowrap" borderBottom="2px" borderColor="gray.400">Consumption Photo</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {order.productDetails && [...order.productDetails]
                                                .sort((a, b) => a.index - b.index) // Sort by index
                                                .map((productDetail, index) => {
                                                    const productExecution = orderExecution?.productExecutions.find(pe => pe.productId === productDetail.product?.id);
                                                    return (
                                                        <Tr key={index} borderBottom="2px" borderColor="gray.400">
                                                            <Td width="35%" borderBottom="2px" borderColor="gray.400">{productDetail.product ? productDetail.product.name : 'undefined'}</Td>
                                                            <Td borderBottom="2px" borderColor="gray.400">{productExecution?.applicationPhoto ? <img src={productExecution.applicationPhoto} alt="Application" /> : 'No Photo'}</Td>
                                                            <Td borderBottom="2px" borderColor="gray.400">{productExecution?.consumptionPhoto ? <img src={productExecution.consumptionPhoto} alt="Consumption" /> : 'No Photo'}</Td>
                                                        </Tr>
                                                    );
                                                })}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Box>
    );
};

export default OrderInfo;