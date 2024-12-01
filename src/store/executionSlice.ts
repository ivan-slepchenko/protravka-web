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
}

const initialState: ExecutionState = {
    currentOrderId: null,
    currentPage: OrderExecutionPage.InitialOverview,
    applicationMethod: null,
    orderExecutions: [],
};

const executionSlice = createSlice({
    name: 'execution',
    initialState,
    reducers: {
        startExecution: (state, action: PayloadAction<string>) => {
            state.currentOrderId = action.payload;
            state.currentPage = OrderExecutionPage.InitialOverview;
            if (!state.orderExecutions.find(execution => execution.orderId === action.payload)) {
                state.orderExecutions.push({ orderId: action.payload, products: [] });
            }
        },
        nextPage: (state) => {
            state.currentPage = state.currentPage + 1;
        },
        resetExecution: (state) => {
            state.currentOrderId = null;
            state.currentPage = OrderExecutionPage.InitialOverview;
            state.applicationMethod = null;
        },
        completeExecution: (state) => {
            state.currentOrderId = null;
            state.currentPage = OrderExecutionPage.InitialOverview;
            state.applicationMethod = null;
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

export const { startExecution, nextPage, resetExecution, completeExecution, setApplicationMethod, setAppliedQuantity } = executionSlice.actions;
export default executionSlice.reducer;