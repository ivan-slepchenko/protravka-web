import React, { useEffect, useState } from 'react';
import { Box, Grid, Badge, Text, HStack } from '@chakra-ui/react';
import { OrderExecution, TkwMeasurement, fetchOrderExecution } from '../store/executionSlice';
import { Order, OrderStatus } from '../store/newOrderSlice';

interface ControlledOrderCardProps {
    order: Order;
    measurements: TkwMeasurement[];
    onClick: () => void;
}
const TREATMENT_LABEL = "In Treatment";
const TREATED_LABEL = "Treated";

const stateToLabel: Partial<Record<OrderStatus, string>> = {
    [OrderStatus.TreatmentInProgress]: TREATMENT_LABEL,
    [OrderStatus.RecipeCreated]: TREATMENT_LABEL,
    [OrderStatus.TKWConfirmed]: TREATMENT_LABEL,
    [OrderStatus.Completed]: TREATED_LABEL,
    [OrderStatus.Failed]: TREATED_LABEL,
    [OrderStatus.LabControl]: TREATED_LABEL,
    [OrderStatus.ToAcknowledge]: TREATED_LABEL,
};

const ControlledOrderCard: React.FC<ControlledOrderCardProps> = ({ order, measurements, onClick }) => {
    const [orderExecution, setOrderExecution] = useState<OrderExecution | null>(null);

    useEffect(() => {
        if (order.id) {
            fetchOrderExecution(order.id).then((execution) => {
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
                    colorScheme={stateToLabel[order.status] === TREATMENT_LABEL ? 'orange' : 'green'}
                    gridColumn="span 3"
                >
                    <HStack w="full" justifyContent="space-between">
                        <Text isTruncated>
                            {order.crop?.name}, {order.variety?.name}
                        </Text>
                        <Text>
                            {stateToLabel[order.status]}
                        </Text>
                    </HStack>
                </Badge>
                <Text px={1} gridColumn="span 2" color="gray.600">Lot:</Text>
                <Text px={1} isTruncated>{order.lotNumber}</Text>
                <Text px={1} color="gray.600" gridColumn="span 2">Seeds To Treat:</Text>
                <Text px={1} isTruncated>{order.seedsToTreatKg}{' kg'}</Text>
                <Text px={1} color="gray.600" gridColumn="span 2">Raw Average TKW:</Text>
                <Text px={1} isTruncated>{order.tkw === null ? 'N/A' : order.tkw.toFixed(2)}</Text>
                <Text px={1} color="gray.600" gridColumn="span 2">Treated Average TKW:</Text>
                <Text px={1} isTruncated>{treatedAverageTkw}</Text>
                <Text px={1} color="gray.600" gridColumn="span 2">Tests Performed:</Text>
                <Text px={1} isTruncated>{numberOfTkwMeasurements}</Text>
                <Box gridColumn="span 3">
                    <Text px={1} color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>Treatment Started:</Text>
                    <Text px={1} isTruncated>{treatmentStartDate}</Text>
                </Box>
                {(order.status === OrderStatus.Completed || order.status === OrderStatus.Failed || order.status === OrderStatus.ToAcknowledge) && (
                    <Box gridColumn="span 3">
                        <Text px={1} color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>Treatment Finished:</Text>
                        <Text px={1} isTruncated>{treatmentFinishDate}</Text>
                    </Box>
                )}
            </Grid>
        </Box>
    );
};

const ControlledOrderList: React.FC<{ orders: Order[], measurements: TkwMeasurement[], onClick: (order: Order) => void }> = ({ orders, measurements, onClick }) => {
    const inTreatmentOrders = orders.filter(order => stateToLabel[order.status] === TREATMENT_LABEL);
    const treatedOrders = orders.filter(order => stateToLabel[order.status] === TREATED_LABEL);

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
