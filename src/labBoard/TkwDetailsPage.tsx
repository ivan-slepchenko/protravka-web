import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Text, Button, HStack, VStack, CloseButton } from '@chakra-ui/react';
import { TkwMeasurement, fetchTkwMeasurementsByExecutionId, fetchOrderExecutionForOrder } from '../store/executionSlice';
import { Order } from '../store/newOrderSlice';
import { useTranslation } from 'react-i18next';
import { fetchOrderById } from '../store/ordersSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import TkwDetailsContent from './TkwDetailsContent';

const TkwDetailsPage: React.FC = () => {
    const { t } = useTranslation();
    const { orderId, measurementId } = useParams<{ orderId: string, measurementId?: string }>();
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const [order, setOrder] = useState<Order | null>(null);
    const [measurements, setMeasurements] = useState<TkwMeasurement[]>([]);

    useEffect(() => {
        if (orderId) {
            dispatch(fetchOrderById(orderId)).then((action) => {
                if (fetchOrderById.fulfilled.match(action)) {
                    setOrder(action.payload);
                }
            });
            fetchOrderExecutionForOrder(orderId).then((orderExecution) => {
                if (orderExecution.id === null) {
                    throw new Error('Order execution has no id, invalid use of TKW details page');
                }
                fetchTkwMeasurementsByExecutionId(orderExecution.id).then((data: TkwMeasurement[]) => {
                    setMeasurements(data);
                }).catch(error => console.error('Failed to fetch TKW measurements:', error));
            }).catch(error => console.error('Failed to fetch order execution:', error));
        }
    }, [orderId, dispatch]);

    return (
        <VStack h="full" w="full" p={4}>
            <HStack w="full" justifyContent="space-between">
                <Text fontSize="lg" fontWeight="bold">{t('tkw_details_page.tkw_details')}</Text>
                <CloseButton onClick={() => navigate(-1)} />
            </HStack>  
            {order && (
                <TkwDetailsContent order={order} measurements={measurements} measurementId={measurementId} />
            )}
            <HStack w="full" justifyContent="flex-end">
                <Button variant="ghost" onClick={() => navigate(-1)}>{t('tkw_details_page.back')}</Button>
            </HStack>
        </VStack>
    );
};

export default TkwDetailsPage;
