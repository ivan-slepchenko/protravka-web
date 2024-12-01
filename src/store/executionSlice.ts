import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrderExecutionPage } from '../execution/OrderExecutionPage';

interface ExecutionState {
  currentOrderId: string | null;
  currentPage: OrderExecutionPage;
}

const initialState: ExecutionState = {
    currentOrderId: null,
    currentPage: OrderExecutionPage.InitialOverview,
};

const executionSlice = createSlice({
    name: 'execution',
    initialState,
    reducers: {
        startExecution: (state, action: PayloadAction<string>) => {
            state.currentOrderId = action.payload;
            state.currentPage = OrderExecutionPage.InitialOverview;
        },
        nextPage: (state) => {
            state.currentPage = state.currentPage + 1;
        },
        resetExecution: (state) => {
            state.currentOrderId = null;
            state.currentPage = OrderExecutionPage.InitialOverview;
        },
        completeExecution: (state) => {
            state.currentOrderId = null;
            state.currentPage = OrderExecutionPage.InitialOverview;
        }
    },
});

export const { startExecution, nextPage, resetExecution } = executionSlice.actions;
export default executionSlice.reducer;