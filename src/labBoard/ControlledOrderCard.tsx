import React, { useEffect, useState } from 'react';
import { Box, Grid, Badge, Text, HStack } from '@chakra-ui/react';
import { OrderExecution, TkwMeasurement, fetchOrderExecutionForOrder } from '../store/executionSlice';
import { Order, OrderStatus } from '../store/newOrderSlice';
import { useTranslation } from 'react-i18next';

interface ControlledOrderCardProps {
    order: Order;
    measurements: TkwMeasurement[];
    onClick: () => void;
}

enum LabColumn {
    TREATMENT = 'in_treatment',
    TREATED = 'treated',
}

const stateToLabColumn: Partial<Record<OrderStatus, string>> = {
    [OrderStatus.TreatmentInProgress]: LabColumn.TREATMENT,
    [OrderStatus.RecipeCreated]: LabColumn.TREATMENT,
    [OrderStatus.TkwConfirmed]: LabColumn.TREATMENT,
    [OrderStatus.Completed]: LabColumn.TREATED,
    [OrderStatus.Failed]: LabColumn.TREATED,
    [OrderStatus.LabToControl]: LabColumn.TREATED,
    [OrderStatus.ToAcknowledge]: LabColumn.TREATED,
};

const ControlledOrderCard: React.FC<ControlledOrderCardProps> = ({ order, measurements, onClick }) => {
    const { t } = useTranslation();
    const [orderExecution, setOrderExecution] = useState<OrderExecution | null>(null);

    useEffect(() => {
        if (order.id) {
            fetchOrderExecutionForOrder(order.id).then((execution) => {
                setOrderExecution(execution);
            }).catch((error) => {
                console.error('Failed to fetch order execution:', error);
            });
        }
    }, [order.id]);

    const calculateAverageTkw = (measurements: TkwMeasurement[]) => {
        if (measurements.length === 0) return 'N/A';
        const totalTkw = measurements.reduce((sum, measurement) => {
            const tkwValues = [measurement.tkwProbe1, measurement.tkwProbe2, measurement.tkwProbe3].filter((probe) => probe !== undefined) as number[];
            const tkwAllValues = tkwValues.reduce((a, b) => a + b, 0);
            return sum + tkwAllValues / tkwValues.length;
        }, 0);
        return totalTkw.toFixed(2);
    };

    const treatedAverageTkw = calculateAverageTkw(measurements);
    const treatmentStartDate = orderExecution?.treatmentStartDate ? new Date(orderExecution.treatmentStartDate).toLocaleString() : 'N/A';
    const treatmentFinishDate = orderExecution?.treatmentFinishDate ? new Date(orderExecution.treatmentFinishDate).toLocaleString() : 'N/A';
    const numberOfTkwMeasurements = measurements.length;

    return (
        <Box
            borderColor={'gray.200'}
            borderWidth={1}
            borderStyle={'solid'}
            borderRadius="md"
            p={2}
            w="full"
            cursor="pointer"
            onClick={onClick}
        >
            <Grid templateColumns="1fr 3fr" gap={2} fontSize="sm">
                <Badge
                    colorScheme={stateToLabColumn[order.status] === LabColumn.TREATMENT ? 'orange' : 'green'}
                    gridColumn="span 3"
                >
                    <HStack w="full" justifyContent="space-between">
                        <Text isTruncated>
                            {order.crop?.name}, {order.variety?.name}
                        </Text>
                        <Text>
                            {t(`controlled_order_card.${order.status.toLowerCase().replaceAll(' ', '_')}`)}
                        </Text>
                    </HStack>
                </Badge>
                <Text px={1} gridColumn="span 2" color="gray.600">{t('controlled_order_card.lot')}:</Text>
                <Text px={1} isTruncated>{order.lotNumber}</Text>
                <Text px={1} color="gray.600" gridColumn="span 2">{t('controlled_order_card.seeds_to_treat')}:</Text>
                <Text px={1} isTruncated>{order.seedsToTreatKg}{' kg'}</Text>
                <Text px={1} color="gray.600" gridColumn="span 2">{t('controlled_order_card.raw_average_tkw')}:</Text>
                <Text px={1} isTruncated>{order.tkw === null ? 'N/A' : order.tkw.toFixed(2)}</Text>
                <Text px={1} color="gray.600" gridColumn="span 2">{t('controlled_order_card.treated_average_tkw')}:</Text>
                <Text px={1} isTruncated>{treatedAverageTkw}</Text>
                <Text px={1} color="gray.600" gridColumn="span 2">{t('controlled_order_card.tests_performed')}:</Text>
                <Text px={1} isTruncated>{numberOfTkwMeasurements}</Text>
                <Box gridColumn="span 3">
                    <Text px={1} color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('controlled_order_card.treatment_started')}:</Text>
                    <Text px={1} isTruncated>{treatmentStartDate}</Text>
                </Box>
                {(order.status === OrderStatus.Completed || order.status === OrderStatus.Failed || order.status === OrderStatus.ToAcknowledge) && (
                    <Box gridColumn="span 3">
                        <Text px={1} color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('controlled_order_card.treatment_finished')}:</Text>
                        <Text px={1} isTruncated>{treatmentFinishDate}</Text>
                    </Box>
                )}
            </Grid>
        </Box>
    );
};

const ControlledOrderList: React.FC<{ orders: Order[], measurements: TkwMeasurement[], onClick: (order: Order) => void }> = ({ orders, measurements, onClick }) => {
   
    const inTreatmentOrders = orders.filter(order => stateToLabColumn[order.status] === LabColumn.TREATMENT);
    const treatedOrders = orders.filter(order => stateToLabColumn[order.status] === LabColumn.TREATED);

    return (
        <>
            {inTreatmentOrders.map(order => (
                <ControlledOrderCard key={order.id} order={order} measurements={measurements} onClick={() => onClick(order)} />
            ))}
            {treatedOrders.map(order => (
                <ControlledOrderCard key={order.id} order={order} measurements={measurements} onClick={() => onClick(order)} />
            ))}
        </>
    );
};

export default ControlledOrderCard;
export { ControlledOrderList };
