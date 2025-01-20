import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { fetchOrderById } from '../store/ordersSlice';
import { TkwMeasurement } from '../store/executionSlice';
import { Box, Grid, Badge, Text } from '@chakra-ui/react';
import { Order } from '../store/newOrderSlice';

interface TkwMeasurementCardProps {
    measurement: TkwMeasurement;
}

const TkwMeasurementCard: React.FC<TkwMeasurementCardProps> = ({ measurement }) => {
    const dispatch: AppDispatch = useDispatch();
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        dispatch(fetchOrderById(measurement.orderExecution.orderId)).then((action) => {
            if (fetchOrderById.fulfilled.match(action)) {
                setOrder(action.payload);
            }
        });
    }, [dispatch, measurement.orderExecution.orderId]);

    return (
        <Box
            borderColor={'gray.200'}
            borderWidth={1}
            borderStyle={'solid'}
            borderRadius="md"
            p={2}
            w="full"
            bg="white"
        >
            <Grid templateColumns="1fr 3fr" gap={2} fontSize="sm">
                <Badge gridColumn="span 3" colorScheme="gray">
                    {order ? `${order.crop?.name}, ${order.variety?.name}` : 'Loading...'}
                </Badge>
                <Text px={1} gridColumn="span 3" color="gray.600">
                    Lot: {order ? order.lotNumber : 'Loading...'}
                </Text>
                <Text px={1} gridColumn="span 2">Measurement Date:</Text>
                <Text px={1} isTruncated>{new Date(measurement.creationDate).toLocaleString()}</Text>
            </Grid>
        </Box>
    );
};

export default TkwMeasurementCard;
