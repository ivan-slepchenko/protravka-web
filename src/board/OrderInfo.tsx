import React from "react";
import { Box, Button, HStack, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Select } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { Order, OrderStatus, updateStatus } from "../store/newOrderSlice";

interface OrderInfoProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

const OrderInfo: React.FC<OrderInfoProps> = ({ isOpen, onClose, orderId }) => {
  const dispatch: AppDispatch = useDispatch();
  const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.lotNumber === orderId));

  if (!order) return null;

  const handleStatusChange = (status: OrderStatus) => {
    dispatch(updateStatus(status));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Order Information</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Text fontSize="lg" fontWeight="bold" textAlign="center" mb="1">
              Remington Seeds
            </Text>

            <Box mb="2">
              <Text fontSize="xs">Recipe creation date:</Text>
              <Text>{order.recipeDate}</Text>
            </Box>
            <Box mb="2">
              <Text fontSize="xs">Application date:</Text>
              <Text>{order.applicationDate}</Text>
            </Box>
            <Box mb="2">
              <Text fontSize="xs">Operator:</Text>
              <Text>{order.operator}</Text>
            </Box>
            <Box mb="2">
              <Text fontSize="xs">Crop:</Text>
              <Text>{order.crop}</Text>
            </Box>
            <Box mb="2">
              <Text fontSize="xs">Variety:</Text>
              <Text>{order.variety}</Text>
            </Box>
            <Box mb="2">
              <Text fontSize="xs">Lot Number:</Text>
              <Text>{order.lotNumber}</Text>
            </Box>
            <Box mb="2">
              <Text fontSize="xs">TKW (g):</Text>
              <Text>{order.tkw}</Text>
            </Box>
            <Box mb="2">
              <Text fontSize="xs">Quantity to treat (kg):</Text>
              <Text>{order.quantity}</Text>
            </Box>
            <Box mb="2">
              <Text fontSize="xs">Packaging:</Text>
              <Text>{order.packaging}</Text>
            </Box>
            <Box mb="2">
              <Text fontSize="xs">Bag size (K/Seeds):</Text>
              <Text>{order.bagSize}</Text>
            </Box>

            {/* Product Details */}
            {order.productDetails.map((product, index) => (
              <Box key={index} border="1px solid" borderColor="gray.200" p="2" borderRadius="md" mb="2">
                <Text fontSize="xs">Product name:</Text>
                <Text>{product.name}</Text>
                <Text fontSize="xs">Density (g/ml):</Text>
                <Text>{product.density}</Text>
                <Text fontSize="xs">Rate:</Text>
                <Text>{product.rate}</Text>
                <Text fontSize="xs">Rate Type:</Text>
                <Text>{product.rateType}</Text>
                <Text fontSize="xs">Rate Unit:</Text>
                <Text>{product.rateUnit}</Text>
              </Box>
            ))}
          </Box>
        </ModalBody>
        <ModalFooter>
          <Select value={order.status} onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}>
            <option value={OrderStatus.NotStarted}>Not Started</option>
            <option value={OrderStatus.InProgress}>In Progress</option>
            <option value={OrderStatus.Acknowledge}>Acknowledge</option>
            <option value={OrderStatus.Archive}>Archive</option>
          </Select>
          <Button colorScheme="blue" ml={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OrderInfo;