import React from "react";
import { Box, Button, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Select, Grid, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { OrderStatus, updateStatus } from "../store/newOrderSlice";
import { fetchProducts } from "../store/productsSlice";
import { getRateUnitLabel, getRateTypeLabel } from "../newOrder/SeedTreatmentForm";

interface OrderInfoProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

const OrderInfo: React.FC<OrderInfoProps> = ({ isOpen, onClose, orderId }) => {
  const dispatch: AppDispatch = useDispatch();
  const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === orderId));

  React.useEffect(() => {
    if (isOpen) {
      dispatch(fetchProducts());
    }
  }, [isOpen, dispatch]);

  if (!order) return null;

  const handleStatusChange = (status: OrderStatus) => {
    dispatch(updateStatus(status));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent minWidth="800px">
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
            <Box maxHeight="200px" overflowY="auto" bg="gray.50" p="2" borderRadius="md">
              <Table variant="simple" size="sm" w="full">
                <Thead>
                  <Tr>
                    <Th width="35%" whiteSpace="nowrap">Product Name</Th>
                    <Th whiteSpace="nowrap">Density (g/ml)</Th>
                    <Th whiteSpace="nowrap">Rate</Th>
                    <Th whiteSpace="nowrap">Rate Type</Th>
                    <Th whiteSpace="nowrap">Rate Unit</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {order.productDetails && [...order.productDetails]
                    .sort((a, b) => a.index - b.index) // Sort by index
                    .map((productDetail, index) => {
                      return (
                        <Tr key={index}>
                          <Td width="35%">{productDetail.product ? productDetail.product.name : 'undefined'}</Td>
                          <Td>{productDetail.density}</Td>
                          <Td>{productDetail.rate}</Td>
                          <Td>{getRateTypeLabel(productDetail.rateType)}</Td>
                          <Td>{getRateUnitLabel(productDetail.rateUnit)}</Td>
                        </Tr>
                      );
                    })}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Select value={order.status} onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}>
            <option value={OrderStatus.NotStarted}>Not Started</option>
            <option value={OrderStatus.InProgress}>In Progress</option>
            <option value={OrderStatus.Acknowledge}>Acknowledge</option>
            <option value={OrderStatus.Archived}>Archive</option>
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