import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrderExecutionPage } from '../execution/OrderExecutionPage';

interface ProductExecution {
  productId: string;
  appliedQuantity: number;
}

interface OrderExecution {
  orderId: string;
  products: ProductExecution[];
}

interface ExecutionState {
  currentOrderId: string | null;
  currentPage: OrderExecutionPage;
  applicationMethod: string | null;
  orderExecutions: OrderExecution[];
  currentProductIndex: number;
}

const initialState: ExecutionState = {
    currentOrderId: null,
    currentPage: OrderExecutionPage.InitialOverview,
    applicationMethod: null,
    orderExecutions: [],
    currentProductIndex: 0,
};

const executionSlice = createSlice({
    name: 'execution',
    initialState,
    reducers: {
        startExecution: (state, action: PayloadAction<string>) => {
            state.currentOrderId = action.payload;
            state.currentPage = OrderExecutionPage.InitialOverview;
            state.currentProductIndex = 0;
            if (!state.orderExecutions.find(execution => execution.orderId === action.payload)) {
                state.orderExecutions.push({ orderId: action.payload, products: [] });
            }
        },
        nextProduct: (state) => {
            const currentOrder = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (currentOrder && state.currentProductIndex < currentOrder.products.length - 1) {
                state.currentProductIndex += 1;
            }
        },
        nextPage: (state) => {
            state.currentPage = state.currentPage + 1;
        },
        resetExecution: (state) => {
            state.currentOrderId = null;
            state.currentPage = OrderExecutionPage.InitialOverview;
            state.applicationMethod = null;
            state.currentProductIndex = 0;
        },
        completeExecution: (state) => {
            state.currentOrderId = null;
            state.currentPage = OrderExecutionPage.InitialOverview;
            state.applicationMethod = null;
            state.currentProductIndex = 0;
        },
        setApplicationMethod: (state, action: PayloadAction<string>) => {
            state.applicationMethod = action.payload;
        },
        setAppliedQuantity: (state, action: PayloadAction<{ orderId: string, productId: string, quantity: number }>) => {
            const { orderId, productId, quantity } = action.payload;
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === orderId);
            if (orderExecution) {
                const productExecution = orderExecution.products.find(product => product.productId === productId);
                if (productExecution) {
                    productExecution.appliedQuantity = quantity;
                } else {
                    orderExecution.products.push({ productId, appliedQuantity: quantity });
                }
            }
        }
    },
});

export const { startExecution, nextProduct, nextPage, resetExecution, completeExecution, setApplicationMethod, setAppliedQuantity } = executionSlice.actions;
export default executionSlice.reducer;