import React, { useState } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Text, VStack, HStack, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button, Box } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { deactivateActiveExecution, saveOrderExecution, saveOrderExecutionTreatmentStartTime, setActiveExecutionToEmptyOne } from '../store/executionSlice';
import { changeOrderStatus, fetchOrders } from '../store/ordersSlice';
import { Order, OrderStatus } from '../store/newOrderSlice';

const currentDate = new Date().toLocaleDateString();

const OrdersOverview: React.FC = () => {
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
                await dispatch(saveOrderExecution()).unwrap(); //if no internet, this fails first. 
                dispatch(changeOrderStatus({ id: selectedOrder.id, status: OrderStatus.TreatmentInProgress }));
                dispatch(saveOrderExecutionTreatmentStartTime(selectedOrder.id));
                onClose();
            } catch (error) {
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
                        <Text py={2} px={2} fontSize="lg" color="red.600">No access to internet available.</Text>
                        <Button colorScheme="orange" onClick={onRefreshClick}>Refresh</Button>
                    </>
                ) : (
                    <>
                        <Text py={2} px={2} fontSize="lg">You have the following lots to treat today, {currentDate}</Text>
                        <Text py={2} px={2} fontSize="md" color="gray.600">Choose the lot to start treatment</Text>
                
                        <TableContainer mt={4} w="full" overflowY='visible'>
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
            <AlertDialog
                isOpen={isAlertOpen}
                leastDestructiveRef={cancelRef}
                onClose={onAlertClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent margin={4}>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Internet Connection Required
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            {'You may start execution only when internet access is available. Please find better internet connection.'}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onAlertClose}>
                                Close
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default OrdersOverview;