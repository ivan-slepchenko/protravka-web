import React, { useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Text, VStack, HStack, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { startExecution } from '../store/executionSlice';
import { changeOrderStatus, fetchOrders } from '../store/ordersSlice';
import { OrderStatus } from '../store/newOrderSlice';

const currentDate = new Date().toLocaleDateString();

const OrdersOverview: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef(null);
    const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);
    const user = useSelector((state: RootState) => state.user);
    const orders = useSelector((state: RootState) => 
        state.orders.activeOrders.filter(order => 
            order.operator.email === user.email && 
            order.status === OrderStatus.NotStarted &&
            new Date(order.applicationDate).toLocaleDateString() === currentDate
        )
    );

    const handleOrderClick = (orderId: string) => {
        setSelectedOrderId(orderId);
        onOpen();
    };

    const handleConfirm = () => {
        if (selectedOrderId) {
            dispatch(startExecution(selectedOrderId));
            dispatch(changeOrderStatus({ id: selectedOrderId, status: OrderStatus.InProgress }));
            onClose();
        }
    };

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    return (
        <VStack>
            <Text py={2} px={2} fontSize="lg">You have the following lots to treat today, {currentDate}</Text>
            <Text py={2} px={2} fontSize="md" color="gray.600">Choose the lot to start treatment</Text>
      
            <TableContainer mt={4} w="full">
                <Table variant="simple" size="sm" w="full">
                    <Thead bg="orange.100">
                        <Tr>
                            <Th>Crop</Th>
                            <Th>Lot</Th>
                            <Th>Products</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {orders.map(order => (
                            <Tr key={order.id} onClick={() => handleOrderClick(order.id)} cursor="pointer" _hover={{ bg: "gray.100" }} height={"50px"}>
                                <Td>
                                    <HStack>
                                        <Text>{order.crop.name}</Text>
                                        <Text fontSize="sm" color="gray.600">{order.variety.name}</Text>
                                    </HStack>
                                </Td>
                                <Td>{order.lotNumber}</Td>
                                <Td>
                                    <VStack  gap={2} alignItems={"left"}>
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
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent margin={4}>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Confirm Start Processing
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            {'Confirm you want to start processing this receipe. You cannot cancel this process later.'}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleConfirm} ml={3}>
                                Confirm
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </VStack>
    );
};

export default OrdersOverview;