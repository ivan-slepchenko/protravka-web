import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OrderExecutionPage } from '../execution/OrderExecutionPage';

export interface ProductExecution {
    productId: string;
    appliedRateKg: number;
    applicationPhoto?: string;
    productConsumptionPerLotKg?: number;
    consumptionPhoto?: string;
}

export interface OrderExecution {
    orderId: string;
    productExecutions: ProductExecution[];
    applicationMethod: string | null;
    packingPhoto: string | null;
    consumptionPhoto: string | null;
    packedseedsToTreatKg: number | null;
    slurryConsumptionPerLotKg: number | null;
    currentPage: OrderExecutionPage | null;
    currentProductIndex: number | null;
    operatorId: string | null;
}

export interface ExecutionState {
    currentOrderExecution: OrderExecution | null;
    orderExecutions: OrderExecution[];
}

const initialState: ExecutionState = {
    currentOrderExecution: null,
    orderExecutions: [],
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export const fetchUserOrderExecutions = createAsyncThunk('execution/fetchUserOrderExecutions', async () => {
    const response = await fetch(`${BACKEND_URL}/api/executions/user-order-executions`, {
        credentials: 'include', // Include credentials in the request
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch user order executions: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
});

export const fetchOrderExecution = createAsyncThunk('execution/fetchOrderExecution', async (orderId: string) => {
    const response = await fetch(`${BACKEND_URL}/api/executions/${orderId}`, {
        credentials: 'include', // Include credentials in the request
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch order execution: ${response.statusText}`);
    }
    const data = await response.json();
    return { ...data, orderId };
});

const executionSlice = createSlice({
    name: 'execution',
    initialState,
    reducers: {
        startExecution: (state, action: PayloadAction<string>) => {
            const newOrderExecution = {
                orderId: action.payload,
                productExecutions: [],
                applicationMethod: null,
                packingPhoto: null,
                consumptionPhoto: null,
                packedseedsToTreatKg: null,
                slurryConsumptionPerLotKg: null,
                currentPage: OrderExecutionPage.InitialOverview,
                currentProductIndex: 0,
                operatorId: null, // This will be set by the backend
            };
            state.currentOrderExecution = newOrderExecution;
            executionSlice.caseReducers.saveOrderExecution(state);
        },
        incrementProductIndex: (state) => {
            if (state.currentOrderExecution && state.currentOrderExecution.currentProductIndex !== null) {
                state.currentOrderExecution.currentProductIndex += 1;
                executionSlice.caseReducers.saveOrderExecution(state);
            }
        },
        resetCurrentProductIndex: (state) => {
            if (state.currentOrderExecution) {
                state.currentOrderExecution.currentProductIndex = 0;
                executionSlice.caseReducers.saveOrderExecution(state);
            }
        },
        nextPage: (state, action: PayloadAction<OrderExecutionPage | undefined>) => {
            if (state.currentOrderExecution && state.currentOrderExecution.currentPage !== null) {
                if (action.payload !== undefined) {
                    state.currentOrderExecution.currentPage = action.payload;
                } else {
                    state.currentOrderExecution.currentPage = (state.currentOrderExecution.currentPage + 1) as OrderExecutionPage;
                }
                executionSlice.caseReducers.saveOrderExecution(state);
            }
        },
        completeExecution: (state) => {
            state.currentOrderExecution = null;
        },
        setApplicationMethod: (state, action: PayloadAction<string>) => {
            if (state.currentOrderExecution) {
                state.currentOrderExecution.applicationMethod = action.payload;
                executionSlice.caseReducers.saveOrderExecution(state);
            }
        },
        setAppliedProductRateKg: (state, action: PayloadAction<{ orderId: string, productId: string, appliedRateKg: number }>) => {
            if (state.currentOrderExecution) {
                const { productId, appliedRateKg } = action.payload;
                const productExecution = state.currentOrderExecution.productExecutions.find(productExecution => productExecution.productId === productId);
                if (productExecution) {
                    productExecution.appliedRateKg = appliedRateKg;
                } else {
                    state.currentOrderExecution.productExecutions.push({ productId, appliedRateKg: appliedRateKg });
                }
                executionSlice.caseReducers.saveOrderExecution(state);
            }
        },
        setExecutedSlurryConsumptionPerLotKg: (state, action: PayloadAction<{ orderId: string, slurryConsumptionPerLotKg: number }>) => {
            if (state.currentOrderExecution) {
                const { slurryConsumptionPerLotKg } = action.payload;
                state.currentOrderExecution.slurryConsumptionPerLotKg = slurryConsumptionPerLotKg;
                executionSlice.caseReducers.saveOrderExecution(state);
            }
        },
        setExecutedProductConsumptionPerLotKg: (state, action: PayloadAction<{ orderId: string, productId: string, productConsumptionPerLotKg: number }>) => {
            if (state.currentOrderExecution) {
                const { productId, productConsumptionPerLotKg } = action.payload;
                const productExecution = state.currentOrderExecution.productExecutions.find(productExecution => productExecution.productId === productId);
                if (productExecution) {
                    productExecution.productConsumptionPerLotKg = productConsumptionPerLotKg;
                } else {
                    state.currentOrderExecution.productExecutions.push({ productId, appliedRateKg: productConsumptionPerLotKg });
                }
                executionSlice.caseReducers.saveOrderExecution(state);
            }
        },
        setPhotoForProvingProductApplication: (state, action: PayloadAction<{ photo: string, productId: string }>) => {
            if (state.currentOrderExecution) {
                const { photo, productId } = action.payload;
                const productExecution = state.currentOrderExecution.productExecutions.find(productExecution => productExecution.productId === productId);
                if (productExecution) {
                    productExecution.applicationPhoto = photo;
                    executionSlice.caseReducers.saveOrderExecution(state);
                }
            }
        },
        setProductConsumptionPhoto: (state, action: PayloadAction<{ photo: string, productId: string }>) => {
            if (state.currentOrderExecution) {
                const { photo, productId } = action.payload;
                const productExecution = state.currentOrderExecution.productExecutions.find(productExecution => productExecution.productId === productId);
                if (productExecution) {
                    productExecution.consumptionPhoto = photo;
                    executionSlice.caseReducers.saveOrderExecution(state);
                }
            }
        },
        setConsumptionPhoto: (state, action: PayloadAction<string>) => {
            if (state.currentOrderExecution) {
                state.currentOrderExecution.consumptionPhoto = action.payload;
                executionSlice.caseReducers.saveOrderExecution(state);
            }
        },
        setPhotoForPacking: (state, action: PayloadAction<string>) => {
            if (state.currentOrderExecution) {
                state.currentOrderExecution.packingPhoto = action.payload;
                executionSlice.caseReducers.saveOrderExecution(state);
            }
        },
        resetPhoto: (state) => {
            if (state.currentOrderExecution) {
                state.currentOrderExecution.packingPhoto = null;
                executionSlice.caseReducers.saveOrderExecution(state);
            }
        },
        setPackedseedsToTreatKg: (state, action: PayloadAction<number>) => {
            if (state.currentOrderExecution) {
                state.currentOrderExecution.packedseedsToTreatKg = action.payload;
                executionSlice.caseReducers.saveOrderExecution(state);
            }
        },
        saveOrderExecution: (state) => {
            if (state.currentOrderExecution) {
                fetch(`${BACKEND_URL}/api/executions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(state.currentOrderExecution),
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
        builder.addCase(fetchUserOrderExecutions.fulfilled, (state, action: PayloadAction<OrderExecution[]>) => {
            if (action.payload.length > 0) {
                state.currentOrderExecution = action.payload[0]; // Assuming only one in-progress execution per user
            }
        });
    },
});

export const {
    startExecution,
    resetCurrentProductIndex,
    nextPage,
    completeExecution,
    setApplicationMethod,
    setAppliedProductRateKg,
    setPhotoForProvingProductApplication,
    setProductConsumptionPhoto,
    setPhotoForPacking,
    resetPhoto,
    setPackedseedsToTreatKg,
    incrementProductIndex,
    setConsumptionPhoto,
    saveOrderExecution,
    setExecutedSlurryConsumptionPerLotKg,
    setExecutedProductConsumptionPerLotKg,
} = executionSlice.actions;
export default executionSlice.reducer;