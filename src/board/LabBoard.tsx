import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { Order, OrderStatus } from '../store/newOrderSlice';
import { fetchOrders } from '../store/ordersSlice';
import { fetchTkwMeasurements, TkwMeasurement } from '../store/executionSlice';
import { Box, Flex, Tabs, TabList, TabPanels, Tab, TabPanel, Grid } from '@chakra-ui/react';
import RecipeRawTkwDetailsInputModal from './RecipeRawTkwDetailsInputModal';
import RecipeTkwDetailsViewModal from './RecipeTkwDetailsViewModal';
import TkwMeasurementCard from './TkwMeasurementCard';
import RawOrderCard from './RawOrderCard';
import RecipeInProgressTkwDetailsInputModal from './RecipeInProgressTkwDetailsInputModal';

const statusToLabelMap: { [key: string]: OrderStatus[] } = {
    'Raw': [OrderStatus.ForLabToInitiate],
    'In Progress': [OrderStatus.ByLabInitiated, OrderStatus.ReadyToStart, OrderStatus.InProgress, OrderStatus.ForLabToControl],
    'Finished': [OrderStatus.ToAcknowledge, OrderStatus.Archived, OrderStatus.Completed, OrderStatus.Failed],
};

const isViewTkwMode = (status: OrderStatus): boolean => {
    return statusToLabelMap['Finished'].includes(status);
};

const isInputRawTkwMode = (status: OrderStatus): boolean => {
    return statusToLabelMap['Raw'].includes(status);
};

const isInputInProgressMode = (status: OrderStatus): boolean => {
    return statusToLabelMap['In Progress'].includes(status);
};

const LabBoard: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const orders = useSelector((state: RootState) => state.orders.activeOrders);
    const tkwMeasurements = useSelector((state: RootState) => state.execution.tkwMeasurements.filter((measurement) => measurement.probeDate === null));
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedMeasurement, setSelectedMeasurement] = useState<TkwMeasurement | null>(null);

    useEffect(() => {
        dispatch(fetchOrders());
        dispatch(fetchTkwMeasurements());
    }, [dispatch]);

    const handleRecipeClick = (order: Order) => {
        setSelectedOrder(order);
    };

    const handleMeasurementClick = (measurement: TkwMeasurement) => {
        setSelectedMeasurement(measurement);
    }

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
                                        {label === 'Raw' && orders.filter(order => statuses.includes(order.status)).map((order, index) => (
                                            <RawOrderCard key={index} order={order} onClick={() => handleRecipeClick(order)} />
                                        ))}
                                        {label === 'In Progress' && tkwMeasurements.map((measurement, index) => (
                                            <TkwMeasurementCard key={index} measurement={measurement} onClick={() => handleMeasurementClick(measurement)} />
                                        ))}
                                    </Grid>
                                </Box>
                            </Flex>
                        </TabPanel>
                    ))}
                </TabPanels>
            </Tabs>
            {selectedOrder && (
                <>
                    {/* {isViewTkwMode(selectedOrder.status) && (
                        <RecipeTkwDetailsViewModal
                            selectedOrder={selectedOrder}
                            onClose={() => setSelectedOrder(null)}
                        />
                    )} */}
                    {isInputRawTkwMode(selectedOrder.status) && (
                        <RecipeRawTkwDetailsInputModal
                            selectedOrder={selectedOrder}
                            onClose={() => setSelectedOrder(null)}
                        />
                    )}
                </>
            )}
            {selectedMeasurement && (
                <RecipeInProgressTkwDetailsInputModal
                    selectedMeasurement={selectedMeasurement}
                    onClose={() => setSelectedMeasurement(null)}
                />
            )}
        </Flex>
    );
};

export default LabBoard;