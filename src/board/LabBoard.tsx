import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { Order, OrderStatus } from '../store/newOrderSlice';
import { fetchOrders } from '../store/ordersSlice';
import { Box, Flex, Text, Badge, Tabs, TabList, TabPanels, Tab, TabPanel, Grid } from '@chakra-ui/react';
import OrderDetailsModal from './OrderDetailsModal'; // Import the new OrderDetailsModal component

const statusToLabelMap: { [key: string]: OrderStatus[] } = {
    'Raw': [OrderStatus.ForLabToInitiate],
    'In Progress': [OrderStatus.ByLabInitiated, OrderStatus.ReadyToStart, OrderStatus.InProgress],
    'Treated': [OrderStatus.ForLabToControl],
    'Finished': [OrderStatus.ToAcknowledge, OrderStatus.Archived, OrderStatus.Completed, OrderStatus.Failed],
};

const LabBoard: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const orders = useSelector((state: RootState) => state.orders.activeOrders);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const handleRecipeClick = (order: Order) => {
        setSelectedOrder(order);
    };

    return (
        <Flex w="full" justifyContent={'center'} h="100vh">
            <Tabs w="full" size='sm' variant='line' isFitted>
                <TabList>
                    {Object.keys(statusToLabelMap).map((label) => (
                        <Tab key={label}>{label}</Tab>
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
                <OrderDetailsModal
                    selectedOrder={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </Flex>
    );
};

export default LabBoard;