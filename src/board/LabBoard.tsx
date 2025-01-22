import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { Order, OrderStatus } from '../store/newOrderSlice';
import { fetchOrders } from '../store/ordersSlice';
import { fetchTkwMeasurements, TkwMeasurement } from '../store/executionSlice';
import { Box, Flex, Tabs, TabList, TabPanels, Tab, TabPanel, Grid } from '@chakra-ui/react';
import RecipeRawTkwDetailsInputModal from './RecipeRawTkwDetailsInputModal';
import TkwMeasurementCard from './TkwMeasurementCard';
import RawOrderCard from './RawOrderCard';
import RecipeInProgressTkwDetailsInputModal from './RecipeInProgressTkwDetailsInputModal';

const LabBoard: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const orders = useSelector((state: RootState) => state.orders.activeOrders);
    const tkwMeasurements = useSelector((state: RootState) => state.execution.tkwMeasurements);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedMeasurement, setSelectedMeasurement] = useState<TkwMeasurement | null>(null);
    const [ordersToControl, setOrdersToControl] = useState<Order[]>([]);
    const [measurementsToControl, setMeasurementsToControl] = useState<TkwMeasurement[]>([]);

    
    useEffect(() => {
        console.log('Fetching orders and TKW measurements');
        dispatch(fetchTkwMeasurements());
        dispatch(fetchOrders());
    }, []);

    const handleRecipeClick = (order: Order) => {
        setSelectedOrder(order);
    };

    const handleMeasurementClick = (measurement: TkwMeasurement) => {
        setSelectedMeasurement(measurement);
    };

    console.log('Orders:', orders);
    console.log('TKW Measurements:', tkwMeasurements);

    useEffect(() => {
        if (orders) {
            setOrdersToControl(
                orders.filter((order) =>
                    [OrderStatus.ForLabToInitiate, OrderStatus.InProgress, OrderStatus.ForLabToControl].includes(order.status)
                )
            );
        }
    }, [orders]);

    useEffect(() => {
        if (Array.isArray(tkwMeasurements)) {
            console.log('tkwMeasurements is array');
            setMeasurementsToControl(
                tkwMeasurements.filter((measurement) => measurement.probeDate === null)
            );
        } else {
            //TODO: Handle this case, should not happen!
            console.log('tkwMeasurements is not array, got:', tkwMeasurements);
        }
    }, [tkwMeasurements]);

    const ToControl = 'To Control';
    const Controlled = 'Controlled';

    return (
        <Flex w="full" justifyContent={'center'} h="100vh">
            <Tabs w="full" size='sm' variant='line' isFitted>
                <TabList>
                    <Tab key={ToControl}>{ToControl}</Tab>
                    <Tab key={Controlled}>{Controlled}</Tab>
                </TabList>
                <TabPanels>     
                    <TabPanel key={ToControl}>
                        <Flex p={1} gap={3} w="full">
                            <Box w="full">
                                <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3} w="full">
                                    {ordersToControl.map((order, index) => (
                                        <RawOrderCard key={index} order={order} onClick={() => handleRecipeClick(order)} />
                                    ))}
                                    {measurementsToControl.map((measurement, index) => (
                                        <TkwMeasurementCard key={index} measurement={measurement} onClick={() => handleMeasurementClick(measurement)} />
                                    ))}
                                </Grid>
                            </Box>
                        </Flex>
                    </TabPanel>
                    <TabPanel key={Controlled}>
                        <Flex p={1} gap={3} w="full">
                            <Box w="full">
                                <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3} w="full">
                                    {ordersToControl.map((order, index) => (
                                        <RawOrderCard key={index} order={order} onClick={() => handleRecipeClick(order)} />
                                    ))}
                                    {measurementsToControl.map((measurement, index) => (
                                        <TkwMeasurementCard key={index} measurement={measurement} onClick={() => handleMeasurementClick(measurement)} />
                                    ))}
                                </Grid>
                            </Box>
                        </Flex>
                    </TabPanel>
                </TabPanels>
            </Tabs>
            {selectedOrder && (
                <RecipeRawTkwDetailsInputModal
                    selectedOrder={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
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