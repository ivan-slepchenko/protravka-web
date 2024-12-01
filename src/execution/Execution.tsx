import React, { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchOrders } from '../store/ordersSlice';
import OrdersOverview from './OrdersOverview';
import OrderExecution1InitialOverview from './OrderExecution1InitialOverview';
import OrderExecutionAllAddedProductsOverview from './OrderExecutionAllAddedProductsOverview';
import OrderExecution2ApplicationMethod from './OrderExecution2ApplicationMethod';
import OrderExecution3ApplyingProduct from './OrderExecution3ApplyingProduct';
import OrderExecutionCompletion from './OrderExecutionCompletion';
import OrderExecutionConsumptionDetails from './OrderExecutionConsumptionDetails';
import OrderExecutionPackingDetails from './OrderExecutionPackingDetails';
import OrderExecutionPhotoConfirmation from './OrderExecutionPhotoConfirmation';
import OrderExecution4ProovingProduct from './OrderExecution4ProovingProduct';
import OrderExecutionTreatingConfirmation from './OrderExecutionTreatingConfirmation';
import { OrderExecutionPage } from './OrderExecutionPage';

const Execution = () => {
    const dispatch: AppDispatch = useDispatch();
    const currentOrderId = useSelector((state: RootState) => state.execution.currentOrderId);
    const currentPage = useSelector((state: RootState) => state.execution.currentPage);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const renderCurrentPage = () => {
        if (!currentOrderId) {
            return <OrdersOverview />;
        }

        switch (currentPage) {
        case OrderExecutionPage.InitialOverview:
            return <OrderExecution1InitialOverview />;
        case OrderExecutionPage.AllAddedProductsOverview:
            return <OrderExecutionAllAddedProductsOverview />;
        case OrderExecutionPage.ApplicationMethod:
            return <OrderExecution2ApplicationMethod />;
        case OrderExecutionPage.ApplyingProduct:
            return <OrderExecution3ApplyingProduct />;
        case OrderExecutionPage.Completion:
            return <OrderExecutionCompletion />;
        case OrderExecutionPage.ConsumptionDetails:
            return <OrderExecutionConsumptionDetails />;
        case OrderExecutionPage.PackingDetails:
            return <OrderExecutionPackingDetails />;
        case OrderExecutionPage.PhotoConfirmation:
            return <OrderExecutionPhotoConfirmation />;
        case OrderExecutionPage.ProovingProduct:
            return <OrderExecution4ProovingProduct />;
        case OrderExecutionPage.TreatingConfirmation:
            return <OrderExecutionTreatingConfirmation />;
        default:
            return null;
        }
    };

    return (
        <Box p={2} h="full">
            {renderCurrentPage()}
        </Box>
    );
};

export default Execution;