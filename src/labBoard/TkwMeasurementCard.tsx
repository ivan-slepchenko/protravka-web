import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { fetchOrderById } from '../store/ordersSlice';
import { TkwMeasurement } from '../store/executionSlice';
import { Box, Grid, Badge, Text, HStack } from '@chakra-ui/react';
import { Order, OrderStatus } from '../store/newOrderSlice';
import { useTranslation } from 'react-i18next';

interface TkwMeasurementCardProps {
    measurement: TkwMeasurement;
    onClick: () => void;
}

const TkwMeasurementCard: FC<TkwMeasurementCardProps> = ({ measurement, onClick }) => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        console.log('Fetching order by ID:', measurement.orderExecution.orderId);
        dispatch(fetchOrderById(measurement.orderExecution.orderId)).then((action) => {
            if (fetchOrderById.fulfilled.match(action)) {
                setOrder(action.payload);
            }
        });
    }, [dispatch, measurement.orderExecution.orderId]);

    if (measurement.orderExecution.treatmentStartDate === null) {
        // console.error('Measurement has no treatment start date, invalid card is displayed:', measurement);
        return null;
    }

    return (
        <Box
            borderColor={'gray.200'}
            borderWidth={1}
            borderStyle={'solid'}
            borderRadius="md"
            p={2}
            w="full"
            bg="white"
            cursor="pointer"
            onClick={onClick}
        >
            <Grid templateColumns="1fr 3fr" gap={2} fontSize="sm">
                <Badge colorScheme='orange' gridColumn="span 3">
                    <HStack w="full" justifyContent="space-between">
                        {order ? <>
                            <Text isTruncated>
                                {`${order.crop?.name}, ${order.variety?.name}`}
                            </Text>
                            <Text>{order.status === OrderStatus.LabToControl ? 'Lab To Control' : t('tkw_measurement_card.in_treatment')}</Text>
                        </> : 'Loading...'}
                    </HStack>
                </Badge>
                <Text px={1} gridColumn="span 2" color="gray.600">
                    {t('tkw_measurement_card.lot')}:
                </Text>                
                <Text px={1} textAlign='right'>{order ? order.lotNumber : 'Loading...'}</Text>
                <Text px={1} gridColumn="span 2">{t('tkw_measurement_card.seeds_to_treat')}:</Text>
                <Text px={1} textAlign='right'>{order ? `${order.seedsToTreatKg} kg` : 'Loading...'}</Text>
                <Box gridColumn="span 3">
                    <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_measurement_card.treatment_started_at')}:</Text>
                    <Text isTruncated>{new Date(measurement.orderExecution.treatmentStartDate).toLocaleString()}</Text>
                </Box>
                <Box gridColumn="span 3">
                    <Text color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('tkw_measurement_card.measurement_assigned_at')}:</Text>
                    <Text isTruncated>{new Date(measurement.creationDate).toLocaleString()}</Text>
                </Box>
            </Grid>
        </Box>
    );
};

export default TkwMeasurementCard;
