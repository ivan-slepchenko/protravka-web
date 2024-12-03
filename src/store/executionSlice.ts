import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrderExecutionPage } from '../execution/OrderExecutionPage';

interface ProductExecution {
    productId: string;
    appliedQuantity: number;
    applicationPhoto?: string;
    consumptionPhoto?: string;
}

interface OrderExecution {
    orderId: string;
    productExecutions: ProductExecution[];
    applicationMethod: string | null;
    packingPhoto: string | null;
    consumptionPhoto: string | null;
    packedQuantity: number | null;
}

interface ExecutionState {
    currentOrderId: string | null;
    currentPage: OrderExecutionPage;
    orderExecutions: OrderExecution[];
    currentProductIndex: number;
    expectedSeeds: number;
}

const initialState: ExecutionState = {
    currentOrderId: null,
    currentPage: OrderExecutionPage.InitialOverview,
    orderExecutions: [],
    currentProductIndex: 0,
    expectedSeeds: Math.floor(Math.random() * 100) + 1,
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
                state.orderExecutions.push({
                    orderId: action.payload,
                    productExecutions: [],
                    applicationMethod: null,
                    packingPhoto: null,
                    consumptionPhoto: null,
                    packedQuantity: null,
                });
            }
        },
        nextProduct: (state) => {
            state.currentProductIndex += 1;
        },
        resetCurrentProductIndex: (state) => {
            state.currentProductIndex = 0;
        },
        nextPage: (state, action: PayloadAction<OrderExecutionPage | undefined>) => {
            if (action.payload !== undefined) {
                state.currentPage = action.payload;
            } else {
                state.currentPage = state.currentPage + 1;
            }
        },
        resetExecution: (state) => {
            state.currentOrderId = null;
            state.currentPage = OrderExecutionPage.InitialOverview;
            state.currentProductIndex = 0;
        },
        completeExecution: (state) => {
            state.currentOrderId = null;
            state.currentPage = OrderExecutionPage.InitialOverview;
            state.currentProductIndex = 0;
        },
        setApplicationMethod: (state, action: PayloadAction<string>) => {
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                orderExecution.applicationMethod = action.payload;
            }
        },
        setAppliedQuantity: (state, action: PayloadAction<{ orderId: string, productId: string, quantity: number }>) => {
            const { orderId, productId, quantity } = action.payload;
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === orderId);
            if (orderExecution) {
                const productExecution = orderExecution.productExecutions.find(productExecution => productExecution.productId === productId);
                if (productExecution) {
                    productExecution.appliedQuantity = quantity;
                } else {
                    orderExecution.productExecutions.push({ productId, appliedQuantity: quantity });
                }
            }
        },
        setPhotoForProvingProductApplication: (state, action: PayloadAction<{ photo: string, productId: string }>) => {
            const { photo, productId } = action.payload;
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                const productExecution = orderExecution.productExecutions.find(productExecution => productExecution.productId === productId);
                if (productExecution) {
                    productExecution.applicationPhoto = photo;
                }
            }
        },
        setProductConsumptionPhoto: (state, action: PayloadAction<{ photo: string, productId: string }>) => {
            const { photo, productId } = action.payload;
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                const productExecution = orderExecution.productExecutions.find(productExecution => productExecution.productId === productId);
                if (productExecution) {
                    productExecution.consumptionPhoto = photo;
                }
            }
        },
        setConsumptionPhoto: (state, action: PayloadAction<string>) => {
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                orderExecution.consumptionPhoto = action.payload;
            }
        },
        setPhotoForPacking: (state, action: PayloadAction<string>) => {
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                orderExecution.packingPhoto = action.payload;
            }
        },
        resetPhoto: (state) => {
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                orderExecution.packingPhoto = null;
            }
        },
        setPackedQuantity: (state, action: PayloadAction<number>) => {
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                orderExecution.packedQuantity = action.payload;
            }
        },
        incrementProductIndex: (state) => {
            state.currentProductIndex += 1;
        },
    },
});

export const {
    startExecution,
    nextProduct,
    resetCurrentProductIndex,
    nextPage,
    resetExecution,
    completeExecution,
    setApplicationMethod,
    setAppliedQuantity,
    setPhotoForProvingProductApplication,
    setProductConsumptionPhoto,
    setPhotoForPacking,
    resetPhoto,
    setPackedQuantity,
    incrementProductIndex,
    setConsumptionPhoto
} = executionSlice.actions;
export default executionSlice.reducer;