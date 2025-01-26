import React from 'react';
import { Box, Grid, Badge, Text, HStack } from '@chakra-ui/react';
import { TkwMeasurement } from '../store/executionSlice';
import { Order, OrderStatus } from '../store/newOrderSlice';

interface ControlledOrderCardProps {
    order: Order;
    measurements: TkwMeasurement[];
    onClick: () => void;
}
const TREATMENT_LABEL = "In Treatment";
const TREATED_LABEL = "Treated";

const stateToLabel: Partial<Record<OrderStatus, string>> = {
    [OrderStatus.InProgress]: TREATMENT_LABEL,
    [OrderStatus.ReadyToStart]: TREATMENT_LABEL,
    [OrderStatus.ByLabInitiated]: TREATMENT_LABEL,
    [OrderStatus.Completed]: TREATED_LABEL,
    [OrderStatus.Failed]: TREATED_LABEL,
    [OrderStatus.ForLabToControl]: TREATED_LABEL,
    [OrderStatus.ToAcknowledge]: TREATED_LABEL,
};


const ControlledOrderCard: React.FC<ControlledOrderCardProps> = ({ order, measurements, onClick }) => {
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
                <Text px={1} gridColumn="span 3" color="gray.600">
                    Lot: {order.lotNumber}
                </Text>
                <Text px={1} gridColumn="span 2">Seeds To Treat:</Text>
                <Text px={1} isTruncated>{order.seedsToTreatKg}{' kg'}</Text>
                <Text px={1} gridColumn="span 2">Raw Average TKW:</Text>
                <Text px={1} isTruncated>{order.tkw.toFixed(2)}</Text>
                <Text px={1} gridColumn="span 2">Treated Average TKW:</Text>
                <Text px={1} isTruncated>{treatedAverageTkw}</Text>
            </Grid>
        </Box>
    );
};

export default ControlledOrderCard;
