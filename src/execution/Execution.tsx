import React, { useEffect } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchOrders } from '../store/ordersSlice';
import { useNavigate } from 'react-router-dom';
import OrdersOverview from './OrdersOverview';
import OrderExecution1InitialOverview from './OrderExecution1InitialOverview';
import OrderExecutionAllAddedProductsOverview from './OrderExecutionAllAddedProductsOverview';
import OrderExecutionApplicationMethod from './OrderExecutionApplicationMethod';
import OrderExecutionApplyingProduct from './OrderExecutionApplyingProduct';
import OrderExecutionCompletion from './OrderExecutionCompletion';
import OrderExecutionConsumptionDetails from './OrderExecutionConsumptionDetails';
import OrderExecutionPackingDetails from './OrderExecutionPackingDetails';
import OrderExecutionPhotoConfirmation from './OrderExecutionPhotoConfirmation';
import OrderExecutionProovingProduct from './OrderExecutionProovingProduct';
import OrderExecutionTreatingConfirmation from './OrderExecutionTreatingConfirmation';
import { OrderExecutionPage } from './OrderExecutionPage';
import { startExecution } from '../store/executionSlice';

const Execution = () => {
    const dispatch: AppDispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const orders = useSelector((state: RootState) => state.orders.activeOrders.filter(order => order.operator.email === user.email));
    const currentOrderId = useSelector((state: RootState) => state.execution.currentOrderId);
    const currentPage = useSelector((state: RootState) => state.execution.currentPage);

    const handleOrderClick = (orderId: string) => {
        console.log('handleOrderClick', orderId);
        dispatch(startExecution(orderId));
    }

    const renderCurrentPage = () => {
        if (!currentOrderId) {
            return <OrdersOverview orders={orders} onOrderClick={handleOrderClick} />;
        }

        switch (currentPage) {
        case OrderExecutionPage.InitialOverview:
            return <OrderExecution1InitialOverview />;
        case OrderExecutionPage.AllAddedProductsOverview:
            return <OrderExecutionAllAddedProductsOverview />;
        case OrderExecutionPage.ApplicationMethod:
            return <OrderExecutionApplicationMethod />;
        case OrderExecutionPage.ApplyingProduct:
            return <OrderExecutionApplyingProduct />;
        case OrderExecutionPage.Completion:
            return <OrderExecutionCompletion />;
        case OrderExecutionPage.ConsumptionDetails:
            return <OrderExecutionConsumptionDetails />;
        case OrderExecutionPage.PackingDetails:
            return <OrderExecutionPackingDetails />;
        case OrderExecutionPage.PhotoConfirmation:
            return <OrderExecutionPhotoConfirmation />;
        case OrderExecutionPage.ProovingProduct:
            return <OrderExecutionProovingProduct />;
        case OrderExecutionPage.TreatingConfirmation:
            return <OrderExecutionTreatingConfirmation />;
        default:
            return null;
        }
    };

    return (
        <Box p={2}>
            {renderCurrentPage()}
        </Box>
    );
};

export default Execution;