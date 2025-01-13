import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { Order, OrderStatus } from '../store/newOrderSlice';
import { fetchOrders } from '../store/ordersSlice';
import { Box, Flex, Heading, Text, Badge, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Input, Grid, GridItem, Center } from '@chakra-ui/react';

const LabBoard: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const columns = [OrderStatus.ForLabToInitiate, OrderStatus.ByLabInitiated, OrderStatus.ForLabToControl, OrderStatus.ToAcknowledge];
    const orders = useSelector((state: RootState) => state.orders.activeOrders);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [tkw, setTkw] = useState<number | null>(null);
    const [finalTkw, setFinalTkw] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const handleRecipeClick = (order: Order) => {
        setSelectedOrder(order);
        if (order.status === OrderStatus.ForLabToInitiate) {
            setTkw(order.tkw);
        } else if (order.status === OrderStatus.ForLabToControl) {
            setFinalTkw(order.tkw);
        }
    };

    const handleSave = () => {
        if (selectedOrder) {
            if (selectedOrder.status === OrderStatus.ForLabToInitiate && tkw !== null) {
                // Dispatch action to update TKW
            } else if (selectedOrder.status === OrderStatus.ForLabToControl && finalTkw !== null) {
                // Dispatch action to update final TKW
            }
            setSelectedOrder(null);
        }
    };

    return (
        <Flex w="full" justifyContent={'center'} h="100vh">
            <Flex p={5} gap={3} w="full" >
                {columns.map((column) => {
                    const bgColor = "gray.50";
                    return (
                        <Box key={column} w="full" border="gray.100" borderRadius="md" p={2} bg={bgColor}>
                            <Heading size="sm" m={1} mb={2}>{column}</Heading>
                            <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3} w="full">
                                {orders.filter(order => order.status === column).map((order, index) => {
                                    const cardColor = "white";
                                    return (
                                        <Box
                                            key={index}
                                            borderColor={'gray.200'}
                                            borderWidth={1}
                                            borderStyle={'solid'}
                                            borderRadius="md"
                                            p={2}
                                            w="full"
                                            cursor={order.status === OrderStatus.ForLabToInitiate || order.status === OrderStatus.ForLabToControl ? "pointer" : "default"}
                                            onClick={() => {
                                                if (order.status === OrderStatus.ForLabToInitiate || order.status === OrderStatus.ForLabToControl) {
                                                    handleRecipeClick(order);
                                                }
                                            }}
                                            bg={cardColor}
                                            boxShadow="sm"
                                        >
                                            <Grid templateColumns="1fr 3fr" gap={2} fontSize="sm">
                                                <Badge gridColumn="span 3" colorScheme="gray">
                                                    {order.crop?.name}, {order.variety?.name}
                                                </Badge>
                                                <Text px={1} gridColumn="span 3" color="gray.600">
                                                    Lot: {order.lotNumber}
                                                </Text>
                                                <Text px={1} gridColumn="span 2">Seeds To Treat:</Text>
                                                <Text px={1} isTruncated>{order.seedsToTreatKg}{' kg'}</Text>
                                            </Grid>
                                        </Box>
                                    );
                                })}
                            </Grid>
                        </Box>
                    );
                })}
            </Flex>
            {selectedOrder && (
                <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Order Details</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Center h='full' w='full'>
                                <Grid templateColumns="3fr 1fr" gap={4} w='full'>
                                    <GridItem borderBottom="1px dotted">
                                        <Text><strong>Lot:</strong></Text>
                                    </GridItem>
                                    <GridItem borderBottom="1px dotted">
                                        <Text>{selectedOrder.lotNumber}</Text>
                                    </GridItem>

                                    <GridItem borderBottom="1px dotted">
                                        <Text><strong>Seeds To Treat:</strong></Text>
                                    </GridItem>
                                    <GridItem borderBottom="1px dotted">
                                        <Text>{selectedOrder.seedsToTreatKg} kg</Text>
                                    </GridItem>

                                    <GridItem borderBottom="1px dotted">
                                        <Text><strong>TKW:</strong></Text>
                                    </GridItem>
                                    <GridItem borderBottom={selectedOrder.status === OrderStatus.ForLabToInitiate ? "none" : "1px dotted"}>
                                        {selectedOrder.status === OrderStatus.ForLabToInitiate ? (
                                            <Input
                                                placeholder="Set TKW"
                                                value={tkw ?? ''}
                                                onChange={(e) => setTkw(Number(e.target.value))}
                                            />
                                        ) : (
                                            <Text>{selectedOrder.tkw} gr</Text>
                                        )}
                                    </GridItem>

                                    {selectedOrder.status === OrderStatus.ForLabToControl && (
                                        <GridItem colSpan={2}>
                                            <Input
                                                placeholder="Set Final TKW"
                                                value={finalTkw ?? ''}
                                                onChange={(e) => setFinalTkw(Number(e.target.value))}
                                            />
                                        </GridItem>
                                    )}
                                </Grid>
                            </Center>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme="blue" mr={3} onClick={handleSave}>
                                Save
                            </Button>
                            <Button variant="ghost" onClick={() => setSelectedOrder(null)}>Cancel</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
        </Flex>
    );
};

export default LabBoard;