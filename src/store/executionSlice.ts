import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrderExecutionPage } from '../execution/OrderExecutionPage';

interface ProductExecution {
    productId: string;
    appliedQuantity: number;
    photo?: string;
    consumptionPhoto?: string;
}

interface OrderExecution {
    orderId: string;
    productExecutions: ProductExecution[];
}

interface ExecutionState {
    currentOrderId: string | null;
    currentPage: OrderExecutionPage;
    applicationMethod: string | null;
    orderExecutions: OrderExecution[];
    currentProductIndex: number;
    packingPhoto: string | null;
    consumptionPhoto: string | null;
    packedQuantity: number | null;
    expectedSeeds: number;
}

const initialState: ExecutionState = {
    currentOrderId: null,
    currentPage: OrderExecutionPage.InitialOverview,
    applicationMethod: null,
    orderExecutions: [],
    currentProductIndex: 0,
    packingPhoto: null,
    consumptionPhoto: null,
    packedQuantity: null,
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
                state.orderExecutions.push({ orderId: action.payload, productExecutions: [] });
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
                const productExecution = orderExecution.productExecutions.find(productExecution => productExecution.productId === productId);
                if (productExecution) {
                    productExecution.appliedQuantity = quantity;
                } else {
                    orderExecution.productExecutions.push({ productId, appliedQuantity: quantity });
                }
            }
        },
        setPhotoForProvingProduct: (state, action: PayloadAction<{ photo: string, productId: string }>) => {
            const { photo, productId } = action.payload;
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                const productExecution = orderExecution.productExecutions.find(productExecution => productExecution.productId === productId);
                if (productExecution) {
                    productExecution.photo = photo;
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
            state.consumptionPhoto = action.payload;
        },
        setPhotoForPacking: (state, action: PayloadAction<string>) => {
            state.packingPhoto = action.payload;
        },
        resetPhoto: (state) => {
            state.packingPhoto = null;
        },
        setPackedQuantity: (state, action: PayloadAction<number>) => {
            state.packedQuantity = action.payload;
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
    setPhotoForProvingProduct,
    setProductConsumptionPhoto,
    setPhotoForPacking,
    resetPhoto,
    setPackedQuantity,
    incrementProductIndex,
    setConsumptionPhoto
} = executionSlice.actions;
export default executionSlice.reducer;