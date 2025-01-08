/**
 * This slice manages the state of the order execution process.
 * This slice is also persisted to local storage for offline use.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OrderExecutionPage } from '../execution/OrderExecutionPage';
import { Order } from './newOrderSlice';

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
    currentOrder: Order | null;  
    currentOrderExecution: OrderExecution | null;
    orderExecutions: OrderExecution[];
}

const initialState: ExecutionState = {
    currentOrder: null,
    currentOrderExecution: null,
    orderExecutions: [],
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export const saveOrderExecution = createAsyncThunk(
    'execution/saveOrderExecution',
    async (_, { getState, rejectWithValue }) => {
        const state = getState() as { execution: ExecutionState };
        const orderExecution = state.execution.currentOrderExecution;
        if (!orderExecution) {
            throw new Error('No current order execution to save');
        }
        try {
            const response = await fetch(`${BACKEND_URL}/api/executions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderExecution),  
                credentials: 'include', // Include credentials for requests
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to save order execution:', error);
            return rejectWithValue(orderExecution); // Return the payload for offline handling
        }
    }
);

export const fetchOrderExecution = async (orderId: string) => {
    const response = await fetch(`${BACKEND_URL}/api/executions/${orderId}`, {
        credentials: 'include', // Include credentials in the request
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch order execution: ${response.statusText}`);
    }
    return await response.json() as OrderExecution;
}

export const fetchOrderExecutionAsCurrent = createAsyncThunk(
    'execution/fetchOrderExecutionAsCurrent',
    fetchOrderExecution
);

const executionSlice = createSlice({
    name: 'execution',
    initialState,
    reducers: {
        startExecution: (state, action: PayloadAction<Order>) => {
            state.currentOrder = action.payload;
            const newOrderExecution = {
                orderId: action.payload.id,
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
        },
        incrementProductIndex: (state) => {
            if (state.currentOrderExecution && state.currentOrderExecution.currentProductIndex !== null) {
                state.currentOrderExecution.currentProductIndex += 1;
            }
        },
        resetCurrentProductIndex: (state) => {
            if (state.currentOrderExecution) {
                state.currentOrderExecution.currentProductIndex = 0;
            }
        },
        nextPage: (state, action: PayloadAction<OrderExecutionPage | undefined>) => {
            if (state.currentOrderExecution && state.currentOrderExecution.currentPage !== null) {
                if (action.payload !== undefined) {
                    state.currentOrderExecution.currentPage = action.payload;
                } else {
                    state.currentOrderExecution.currentPage = (state.currentOrderExecution.currentPage + 1) as OrderExecutionPage;
                }
            }
        },
        completeExecution: (state) => {
            state.currentOrder = null;
            state.currentOrderExecution = null;
        },
        setApplicationMethod: (state, action: PayloadAction<string>) => {
            if (state.currentOrderExecution) {
                state.currentOrderExecution.applicationMethod = action.payload;
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
            }
        },
        setExecutedSlurryConsumptionPerLotKg: (state, action: PayloadAction<{ orderId: string, slurryConsumptionPerLotKg: number }>) => {
            if (state.currentOrderExecution) {
                const { slurryConsumptionPerLotKg } = action.payload;
                state.currentOrderExecution.slurryConsumptionPerLotKg = slurryConsumptionPerLotKg;
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
            }
        },
        setPhotoForProvingProductApplication: (state, action: PayloadAction<{ photo: string, productId: string }>) => {
            if (state.currentOrderExecution) {
                const { photo, productId } = action.payload;
                const productExecution = state.currentOrderExecution.productExecutions.find(productExecution => productExecution.productId === productId);
                if (productExecution) {
                    productExecution.applicationPhoto = photo;
                }
            }
        },
        resetPhotoForProvingProductApplication: (state, action: PayloadAction<{productId: string}>) => {
            if (state.currentOrderExecution) {
                const { productId } = action.payload;
                const productExecution = state.currentOrderExecution.productExecutions.find(productExecution => productExecution.productId === productId);
                if (productExecution) {
                    productExecution.applicationPhoto = undefined;
                }
            }
        },
        setProductConsumptionPhoto: (state, action: PayloadAction<{ photo: string, productId: string }>) => {
            if (state.currentOrderExecution) {
                const { photo, productId } = action.payload;
                const productExecution = state.currentOrderExecution.productExecutions.find(productExecution => productExecution.productId === productId);
                if (productExecution) {
                    productExecution.consumptionPhoto = photo;
                }
            }
        },
        setConsumptionPhoto: (state, action: PayloadAction<string>) => {
            if (state.currentOrderExecution) {
                state.currentOrderExecution.consumptionPhoto = action.payload;
            }
        },
        setPhotoForPacking: (state, action: PayloadAction<string>) => {
            if (state.currentOrderExecution) {
                state.currentOrderExecution.packingPhoto = action.payload;
            }
        },
        resetPackingPhoto: (state) => {
            if (state.currentOrderExecution) {
                state.currentOrderExecution.packingPhoto = null;
            }
        },
        setPackedseedsToTreatKg: (state, action: PayloadAction<number>) => {
            if (state.currentOrderExecution) {
                state.currentOrderExecution.packedseedsToTreatKg = action.payload;
            }
        },
        setCurrentOrder: (state, action: PayloadAction<Order>) => {
            state.currentOrder = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchOrderExecutionAsCurrent.fulfilled, (state, action: PayloadAction<OrderExecution>) => {
            state.currentOrderExecution = action.payload;
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
    resetPhotoForProvingProductApplication,
    setProductConsumptionPhoto,
    setPhotoForPacking,
    resetPackingPhoto,
    setPackedseedsToTreatKg,
    incrementProductIndex,
    setConsumptionPhoto,
    setExecutedSlurryConsumptionPerLotKg,
    setExecutedProductConsumptionPerLotKg,
    setCurrentOrder,
} = executionSlice.actions;
export default executionSlice.reducer;