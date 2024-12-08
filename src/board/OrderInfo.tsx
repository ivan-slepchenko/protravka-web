import React from "react";
import { Box, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Grid, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { OrderStatus, updateStatus } from "../store/newOrderSlice";
import { fetchProducts } from "../store/productsSlice";
import { getRateTypeLabel, getRateUnitLabel } from "../newOrder/NewOrder";
import { fetchOrderExecution } from "../store/executionSlice";

interface OrderInfoProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

const OrderInfo: React.FC<OrderInfoProps> = ({ isOpen, onClose, orderId }) => {
    const dispatch: AppDispatch = useDispatch();
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === orderId));
    const orderExecution = useSelector((state: RootState) => state.execution.orderExecutions.find(execution => execution.orderId === orderId));

    React.useEffect(() => {
        if (isOpen) {
            dispatch(fetchProducts());
            dispatch(fetchOrderExecution(orderId));
        }
    }, [isOpen, dispatch, orderId]);

    if (!order) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent minWidth="1200px">
                <ModalHeader>Order Information</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box w="full">
                        <Grid templateColumns="repeat(2, 1fr)" gap="1" mb="2">
                            <Box>
                                <Text fontSize="xs">Recipe creation date:</Text>
                                <Text>{order.recipeDate}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs">Application date:</Text>
                                <Text>{order.applicationDate}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs">Operator:</Text>
                                <Text>{order.operator ? `${order.operator.name} ${order.operator.surname}` : "undefined"}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs">Crop:</Text>
                                <Text>{order.crop.name}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs">Variety:</Text>
                                <Text>{order.variety.name}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs">Lot Number:</Text>
                                <Text>{order.lotNumber}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs">TKW (g):</Text>
                                <Text>{order.tkw}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs">Quantity to treat (kg):</Text>
                                <Text>{order.quantity}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs">Packaging:</Text>
                                <Text>{order.packaging}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs">Bag size (K/Seeds):</Text>
                                <Text>{order.bagSize}</Text>
                            </Box>
                        </Grid>
                        <Text fontSize="md" fontWeight="bold" mt="4" mb="2">Product Details</Text>
                        <Box maxHeight="300px" overflowY="auto" bg="gray.50" p="2" borderRadius="md">
                            <Table variant="simple" size="sm" w="full">
                                <Thead bg="orange.100">
                                    <Tr>
                                        <Th width="35%" whiteSpace="nowrap">Product Name</Th>
                                        <Th whiteSpace="nowrap">Density (g/ml)</Th>
                                        <Th whiteSpace="nowrap">Rate</Th>
                                        <Th whiteSpace="nowrap">Rate Type</Th>
                                        <Th whiteSpace="nowrap">Rate Unit</Th>
                                        {order.status === OrderStatus.Executed && <Th whiteSpace="nowrap">Application Photo</Th>}
                                        {order.status === OrderStatus.Executed && <Th whiteSpace="nowrap">Consumption Photo</Th>}
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {order.productDetails && [...order.productDetails]
                                        .sort((a, b) => a.index - b.index) // Sort by index
                                        .map((productDetail, index) => {
                                            const productExecution = orderExecution?.productExecutions.find(pe => pe.productId === productDetail.product?.id);
                                            return (
                                                <Tr key={index}>
                                                    <Td width="35%">{productDetail.product ? productDetail.product.name : 'undefined'}</Td>
                                                    <Td>{productDetail.product?.density}</Td>
                                                    <Td>{productDetail.rate}</Td>
                                                    <Td>{getRateTypeLabel(productDetail.rateType)}</Td>
                                                    <Td>{getRateUnitLabel(productDetail.rateUnit)}</Td>
                                                    {order.status === OrderStatus.Executed && <Td>{productExecution?.applicationPhoto ? <img src={productExecution.applicationPhoto} alt="Application" /> : 'No Photo'}</Td>}
                                                    {order.status === OrderStatus.Executed && <Td>{productExecution?.consumptionPhoto ? <img src={productExecution.consumptionPhoto} alt="Consumption" /> : 'No Photo'}</Td>}
                                                </Tr>
                                            );
                                        })}
                                </Tbody>
                            </Table>
                        </Box>
                        {orderExecution && order.status !== OrderStatus.Executed && (
                            <>
                                <Text fontSize="md" fontWeight="bold" mt="4" mb="2">Order Execution Photos</Text>
                                <Box>
                                    <Text fontSize="xs">Packing Photo:</Text>
                                    {orderExecution.packingPhoto ? <img src={orderExecution.packingPhoto} alt="Packing" /> : 'No Photo'}
                                </Box>
                                <Box>
                                    <Text fontSize="xs">Consumption Photo:</Text>
                                    {orderExecution.consumptionPhoto ? <img src={orderExecution.consumptionPhoto} alt="Consumption" /> : 'No Photo'}
                                </Box>
                            </>
                        )}
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default OrderInfo;