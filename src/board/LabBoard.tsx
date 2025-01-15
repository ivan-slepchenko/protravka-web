import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { Order, OrderStatus } from '../store/newOrderSlice';
import { fetchOrders } from '../store/ordersSlice';
import { Box, Flex, Text, Badge, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Input, Grid, GridItem, Center, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';

const statusToLabelMap: { [key: string]: OrderStatus[] } = {
    'Raw TKW': [OrderStatus.ForLabToInitiate],
    'In Progress': [OrderStatus.ByLabInitiated, OrderStatus.ReadyToStart, OrderStatus.InProgress],
    'Treated TKW': [OrderStatus.ForLabToControl],
    'Finished': [OrderStatus.ToAcknowledge, OrderStatus.Archived, OrderStatus.Completed, OrderStatus.Failed],
};

const LabBoard: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
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
            <Tabs w="full" size='sm' variant='enclosed' isFitted>
                <TabList>
                    {Object.keys(statusToLabelMap).map((label) => (
                        <Tab key={label} p={1}>{label}</Tab>
                    ))}
                </TabList>
                <TabPanels>
                    {Object.entries(statusToLabelMap).map(([label, statuses]) => (
                        <TabPanel key={label}>
                            <Flex p={1} gap={3} w="full">
                                <Box w="full">
                                    <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3} w="full">
                                        {orders.filter(order => statuses.includes(order.status)).map((order, index) => {
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
                            </Flex>
                        </TabPanel>
                    ))}
                </TabPanels>
            </Tabs>
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