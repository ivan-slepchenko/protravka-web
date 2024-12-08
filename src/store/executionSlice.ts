import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OrderExecutionPage } from '../execution/OrderExecutionPage';

export interface ProductExecution {
    productId: string;
    appliedQuantity: number;
    applicationPhoto?: string;
    consumptionPhoto?: string;
}

export interface OrderExecution {
    orderId: string;
    productExecutions: ProductExecution[];
    applicationMethod: string | null;
    packingPhoto: string | null;
    consumptionPhoto: string | null;
    packedQuantity: number | null;
}

export interface ExecutionState {
    currentOrderId: string | null;
    currentPage: OrderExecutionPage;
    orderExecutions: OrderExecution[];
    currentProductIndex: number;
}

const initialState: ExecutionState = {
    currentOrderId: null,
    currentPage: OrderExecutionPage.InitialOverview,
    orderExecutions: [],
    currentProductIndex: 0,
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const saveOrderExecutionToBackend = (orderExecution: OrderExecution) => {
    fetch(`${BACKEND_URL}/api/order-executions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderExecution),
        credentials: 'include', // Include credentials in the request
    })
        .then(response => response.json())
        .then(data => {
            console.log('Order execution saved:', data);
        })
        .catch(error => {
            console.error('Failed to save order execution:', error);
        });
};

export const fetchOrderExecution = createAsyncThunk('execution/fetchOrderExecution', async (orderId: string) => {
    const response = await fetch(`${BACKEND_URL}/api/order-executions/${orderId}`, {
        credentials: 'include', // Include credentials in the request
    });
    const data = await response.json();
    return { ...data, orderId };
});

const executionSlice = createSlice({
    name: 'execution',
    initialState,
    reducers: {
        startExecution: (state, action: PayloadAction<string>) => {
            state.currentOrderId = action.payload;
            state.currentPage = OrderExecutionPage.InitialOverview;
            state.currentProductIndex = 0;
            const existingExecution = state.orderExecutions.find(execution => execution.orderId === action.payload);
            if (!existingExecution) {
                const newOrderExecution = {
                    orderId: action.payload,
                    productExecutions: [],
                    applicationMethod: null,
                    packingPhoto: null,
                    consumptionPhoto: null,
                    packedQuantity: null,
                };
                state.orderExecutions.push(newOrderExecution);
                saveOrderExecutionToBackend(newOrderExecution);
            }
        },
        nextProduct: (state) => {
            state.currentProductIndex += 1;
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                saveOrderExecutionToBackend(orderExecution);
            }
        },
        resetCurrentProductIndex: (state) => {
            state.currentProductIndex = 0;
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                saveOrderExecutionToBackend(orderExecution);
            }
        },
        nextPage: (state, action: PayloadAction<OrderExecutionPage | undefined>) => {
            if (action.payload !== undefined) {
                state.currentPage = action.payload;
            } else {
                state.currentPage = state.currentPage + 1;
            }
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                saveOrderExecutionToBackend(orderExecution);
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
                saveOrderExecutionToBackend(orderExecution);
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
                saveOrderExecutionToBackend(orderExecution);
            }
        },
        setPhotoForProvingProductApplication: (state, action: PayloadAction<{ photo: string, productId: string }>) => {
            const { photo, productId } = action.payload;
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                const productExecution = orderExecution.productExecutions.find(productExecution => productExecution.productId === productId);
                if (productExecution) {
                    productExecution.applicationPhoto = photo;
                    saveOrderExecutionToBackend(orderExecution);
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
                    saveOrderExecutionToBackend(orderExecution);
                }
            }
        },
        setConsumptionPhoto: (state, action: PayloadAction<string>) => {
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                orderExecution.consumptionPhoto = action.payload;
                saveOrderExecutionToBackend(orderExecution);
            }
        },
        setPhotoForPacking: (state, action: PayloadAction<string>) => {
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                orderExecution.packingPhoto = action.payload;
                saveOrderExecutionToBackend(orderExecution);
            }
        },
        resetPhoto: (state) => {
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                orderExecution.packingPhoto = null;
                saveOrderExecutionToBackend(orderExecution);
            }
        },
        setPackedQuantity: (state, action: PayloadAction<number>) => {
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                orderExecution.packedQuantity = action.payload;
                saveOrderExecutionToBackend(orderExecution);
            }
        },
        incrementProductIndex: (state) => {
            state.currentProductIndex += 1;
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                saveOrderExecutionToBackend(orderExecution);
            }
        },
        saveOrderExecution: (state) => {
            const orderExecution = state.orderExecutions.find(execution => execution.orderId === state.currentOrderId);
            if (orderExecution) {
                fetch(`${BACKEND_URL}/api/order-executions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderExecution),
                    credentials: 'include', // Include credentials in the request
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Order execution saved:', data);
                    })
                    .catch(error => {
                        console.error('Failed to save order execution:', error);
                    });
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchOrderExecution.fulfilled, (state, action: PayloadAction<OrderExecution>) => {
            const index = state.orderExecutions.findIndex(execution => execution.orderId === action.payload.orderId);
            if (index !== -1) {
                state.orderExecutions[index] = action.payload;
            } else {
                state.orderExecutions.push(action.payload);
            }
        });
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
    setConsumptionPhoto,
    saveOrderExecution
} = executionSlice.actions;
export default executionSlice.reducer;