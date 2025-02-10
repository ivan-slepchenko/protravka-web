import React, { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import OrdersOverview from './OrdersOverview';
import OrderExecution1InitialOverview from './OrderExecution1InitialOverview';
import OrderExecution5AllAddedProductsOverview from './OrderExecution5AllAddedProductsOverview';
import OrderExecution2ApplicationMethod from './OrderExecution2ApplicationMethod';
import OrderExecution3ApplyingProduct from './OrderExecution3ApplyingProduct';
import OrderExecution11Completion from './OrderExecution11Completion';
import OrderExecution9ConsumptionDetails from './OrderExecution9ConsumptionDetails';
import OrderExecution7PackingDetails from './OrderExecution7PackingDetails';
import OrderExecution8PackingProoving from './OrderExecution8PackingProoving';
import OrderExecution4ProovingProduct from './OrderExecution4ProovingProduct';
import OrderExecution6TreatingConfirmation from './OrderExecution6TreatingConfirmation';
import { OrderExecutionPage } from './OrderExecutionPage';
import OrderExecution10ConsumptionProoving from './OrderExecution10ConsumptionProoving';
import { OrderStatus } from '../store/newOrderSlice';
import { deactivateActiveExecution, fetchOrderExecutionAsCurrent, setCurrentOrder } from '../store/executionSlice';


const Execution = () => {
    const dispatch: AppDispatch = useDispatch();

    const user = useSelector((state: RootState) => state.user);
    const currentOrderExecution = useSelector((state: RootState) => state.execution.currentOrderExecution);
    const currentOrder = useSelector((state: RootState) => state.execution.currentOrder);
    const orders = useSelector((state: RootState) => state.orders.activeOrders);

    useEffect(() => {
        const ocurrentOrderByServer = orders.find(
            order => order.status === OrderStatus.TreatmentInProgress && order.operator?.email === user.email
        );
        if (currentOrder) {
            if (!ocurrentOrderByServer) {
                dispatch(deactivateActiveExecution());
            } else if (currentOrder.id !== ocurrentOrderByServer.id) {
                dispatch(fetchOrderExecutionAsCurrent(ocurrentOrderByServer.id));
                dispatch(setCurrentOrder(ocurrentOrderByServer));
            }
        } else {
            if (ocurrentOrderByServer) {
                dispatch(fetchOrderExecutionAsCurrent(ocurrentOrderByServer.id));
                dispatch(setCurrentOrder(ocurrentOrderByServer));
            }
        }
    }, [orders]);

    const renderCurrentPage = () => {
        if (!currentOrderExecution) {
            return <OrdersOverview />;
        }
        console.log('Current page:', currentOrderExecution.currentPage);

        switch (currentOrderExecution.currentPage) {
            case OrderExecutionPage.InitialOverview:
                return <OrderExecution1InitialOverview />;
            case OrderExecutionPage.AllAddedProductsOverview:
                return <OrderExecution5AllAddedProductsOverview />;
            case OrderExecutionPage.ApplicationMethod:
                return <OrderExecution2ApplicationMethod />;
            case OrderExecutionPage.ApplyingProduct:
                return <OrderExecution3ApplyingProduct />;
            case OrderExecutionPage.Completion:
                return <OrderExecution11Completion />;
            case OrderExecutionPage.ConsumptionDetails:
                return <OrderExecution9ConsumptionDetails />;
            case OrderExecutionPage.ProovingConsumption:
                return <OrderExecution10ConsumptionProoving />;
            case OrderExecutionPage.PackingDetails:
                return <OrderExecution7PackingDetails />;
            case OrderExecutionPage.PhotoConfirmation:
                return <OrderExecution8PackingProoving />;
            case OrderExecutionPage.ProovingProduct:
                return <OrderExecution4ProovingProduct />;
            case OrderExecutionPage.TreatingConfirmation:
                return <OrderExecution6TreatingConfirmation />;
            default:
                return null;
        }
    };

    return (
        <Box p={2} h="full" position={'relative'}>
            {renderCurrentPage()}
        </Box>
    );
};

export default Execution;