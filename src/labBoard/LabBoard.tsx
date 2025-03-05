import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Order, OrderStatus } from '../store/newOrderSlice';
import { TkwMeasurement } from '../store/executionSlice';
import { Flex, Tabs, TabList, TabPanels, Tab, TabPanel, Grid } from '@chakra-ui/react';
import RecipeRawTkwDetailsInputModal from './RecipeRawTkwDetailsInputModal';
import TkwMeasurementCard from './TkwMeasurementCard';
import RawOrderCard from './RawOrderCard';
import RecipeInProgressTkwDetailsInputModal from './RecipeInProgressTkwDetailsInputModal';
import { ControlledOrderList } from './ControlledOrderCard';
import TkwDetailsModal from './TkwDetailsModal';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

const LabBoard: React.FC = () => {
    const { t } = useTranslation();
    const orders = useSelector((state: RootState) => state.orders.activeOrders);
    const tkwMeasurements = useSelector((state: RootState) => state.execution.tkwMeasurements);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedMeasurement, setSelectedMeasurement] = useState<TkwMeasurement | null>(null);
    const [ordersToControl, setOrdersToControl] = useState<Order[]>([]);
    const [measurementsToControl, setMeasurementsToControl] = useState<TkwMeasurement[]>([]);
    const [controlledOrders, setControlledOrders] = useState<Order[]>([]);
    const [selectedControlledOrder, setSelectedControlledOrder] = useState<Order | null>(null);
    const { orderId } = useParams<{ orderId?: string }>();

    const handleRecipeClick = (order: Order) => {
        setSelectedOrder(order);
    };

    const handleMeasurementClick = (measurement: TkwMeasurement) => {
        setSelectedMeasurement(measurement);
    };

    const handleControlledOrderClick = (order: Order) => {
        setSelectedControlledOrder(order);
    };

    const handleCloseTkwDetailsModal = () => {
        setSelectedControlledOrder(null);
    };

    useEffect(() => {
        if (orders) {
            setOrdersToControl(
                orders.filter((order) =>
                    [OrderStatus.LabAssignmentCreated].includes(order.status)
                )
            );
            setControlledOrders(
                orders.filter((order) =>
                    [
                        OrderStatus.TreatmentInProgress,
                        OrderStatus.Completed,
                        OrderStatus.TkwConfirmed,
                        OrderStatus.Failed,
                        OrderStatus.LabToControl,
                        OrderStatus.RecipeCreated,
                        OrderStatus.ToAcknowledge
                    ].includes(order.status)
                )
            );
        }
    }, [orders]);

    useEffect(() => {
        if (Array.isArray(tkwMeasurements)) {
            // Group measurements by order and keep only the latest one
            const latestByOrder = tkwMeasurements.reduce((acc, m) => {
                const existing = acc[m.orderExecution.orderId];
                if (!existing || new Date(m.creationDate) > new Date(existing.creationDate)) {
                    acc[m.orderExecution.orderId] = m;
                }
                return acc;
            }, {} as Record<string, TkwMeasurement>);

            // Include only orders whose latest measurement has probeDate === null
            const latestMeasurements = Object.values(latestByOrder)
                .filter((m) => m.probeDate === null);

            setMeasurementsToControl(latestMeasurements);
        } else {
            console.log('tkwMeasurements is not an array, got:', tkwMeasurements);
        }
    }, [tkwMeasurements]);

    useEffect(() => {
        if (orderId) {
            const measurement = tkwMeasurements.find(m => m.orderExecution.orderId === orderId);
            if (measurement) {
                setSelectedMeasurement(measurement);
            } else {
                const order = orders.find(o => o.id === orderId);
                if (order) {
                    setSelectedOrder(order);
                }
            }
        }
    }, [orderId, orders, tkwMeasurements]);

    const ToControl = t('lab_board.to_control');
    const Controlled = t('lab_board.controlled');

    return (
        <Flex w="full" justifyContent={'center'} h="full">
            <Tabs w="full" size='sm' variant='line' isFitted display="flex" flexDirection="column" flex="1" p={1}>
                <TabList>
                    <Tab key={ToControl}>{ToControl}</Tab>
                    <Tab key={Controlled}>{Controlled}</Tab>
                </TabList>
                <TabPanels h="full" px={1} py={2} flex="1" overflow={'auto'}>
                    <TabPanel key={ToControl} p={0}>
                        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3} w="full" px={1}>
                            {ordersToControl.map((order, index) => (
                                <RawOrderCard key={index} order={order} onClick={() => handleRecipeClick(order)} />
                            ))}
                            {measurementsToControl.map((measurement, index) => (
                                <TkwMeasurementCard key={index} measurement={measurement} onClick={() => handleMeasurementClick(measurement)} />
                            ))}
                        </Grid>
                    </TabPanel>
                    <TabPanel key={Controlled} p={0}>
                        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3} w="full" px={1}>
                            <ControlledOrderList
                                orders={controlledOrders}
                                measurements={tkwMeasurements}
                                onClick={handleControlledOrderClick}
                            />
                        </Grid>
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
            {selectedControlledOrder && (
                <TkwDetailsModal
                    onClose={handleCloseTkwDetailsModal}
                    order={selectedControlledOrder}
                    measurements={tkwMeasurements.filter(measurement => measurement.orderExecution.orderId === selectedControlledOrder.id)}
                />
            )}
        </Flex>
    );
};

export default LabBoard;