/**
 * This slice manages the state of the order execution process.
 * This slice is also persisted to local storage for offline use.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OrderExecutionPage } from '../execution/OrderExecutionPage';
import { Order } from './newOrderSlice';
import { fetchOrders } from './ordersSlice';
import { handle403Redirect } from './handle403Redirect';

export interface ProductExecution {
    productId: string;
    appliedRateKg?: number;
    applicationPhoto?: Blob;
    productConsumptionPerLotKg?: number;
    consumptionPhoto?: Blob;
}

export interface OrderExecution {
    id: string | null;
    orderId: string;
    productExecutions: ProductExecution[];
    applicationMethod: string | null;
    packingPhoto: Blob | string | null;
    consumptionPhoto: Blob | string | null;
    packedseedsToTreatKg: number | null;
    slurryConsumptionPerLotKg: number | null;
    currentPage: OrderExecutionPage | null;
    currentProductIndex: number | null;
    operatorId: string | null;
    preparationStartDate: number | null;
    treatmentStartDate: number | null;
    treatmentFinishDate: number | null;
}

export interface TkwMeasurement {
    id: string;
    creationDate: string;
    probeDate?: string;
    orderExecution: OrderExecution;
    tkwProbe1?: number;
    tkwProbe2?: number;
    tkwProbe3?: number;
    tkwProbesPhoto?: Blob;
}

export interface ExecutionState {
    currentOrder: Order | null;
    currentOrderExecution: OrderExecution | null;
    orderExecutions: OrderExecution[];
    tkwMeasurements: TkwMeasurement[];
}

const initialState: ExecutionState = {
    currentOrder: null,
    currentOrderExecution: null,
    orderExecutions: [],
    tkwMeasurements: [],
};

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL || '';

export const saveOrderExecution = createAsyncThunk(
    'execution/saveOrderExecution',
    async (_, { getState, rejectWithValue }) => {
        const state = getState() as { execution: ExecutionState };
        const orderExecution = state.execution.currentOrderExecution;
        if (!orderExecution) {
            throw new Error('No current order execution to save');
        }
        try {
            const formData = new FormData();
            formData.append(
                'orderExecutionData',
                JSON.stringify({
                    orderId: orderExecution.orderId,
                    applicationMethod: orderExecution.applicationMethod,
                    packedseedsToTreatKg: orderExecution.packedseedsToTreatKg,
                    slurryConsumptionPerLotKg: orderExecution.slurryConsumptionPerLotKg,
                    currentPage: orderExecution.currentPage,
                    currentProductIndex: orderExecution.currentProductIndex,
                }),
            );

            if (orderExecution.packingPhoto !== null) {
                formData.append('packingPhoto', orderExecution.packingPhoto);
            }
            if (orderExecution.consumptionPhoto !== null) {
                formData.append('consumptionPhoto', orderExecution.consumptionPhoto);
            }

            const orderExecutionId = (
                (await (
                    await fetch(`${BACKEND_URL}/api/executions`, {
                        method: 'POST',
                        body: formData,
                        credentials: 'include',
                    })
                ).json()) as OrderExecution
            ).id;

            //FIXME: IVAN - I think we may save product executions few times, with invalid values.
            // decompose saving product executions to separate async thunk.
            for (const productExecution of orderExecution.productExecutions) {
                const formData = new FormData();
                formData.append('productExecution', JSON.stringify(productExecution));

                if (productExecution.applicationPhoto !== undefined) {
                    formData.append('applicationPhoto', productExecution.applicationPhoto);
                }
                if (productExecution.consumptionPhoto !== undefined) {
                    formData.append('consumptionPhoto', productExecution.consumptionPhoto);
                }

                const response = await fetch(
                    `${BACKEND_URL}/api/executions/${orderExecutionId}/product-execution`,
                    {
                        method: 'POST',
                        body: formData,
                        credentials: 'include',
                    },
                );

                if (!response.ok) {
                    throw new Error('Failed to save product execution');
                }
            }

            return await state.execution.currentOrderExecution;
        } catch (error) {
            console.error('Failed to save order execution:', error);
            return rejectWithValue(orderExecution);
        }
    },
);

export const saveOrderExecutionTreatmentStartTime = createAsyncThunk(
    'execution/saveOrderExecutionTreatmentStartTime',
    async (orderId: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/executions/${orderId}/start`, {
                method: 'POST',
                credentials: 'include', // Include credentials for requests
            });

            await handle403Redirect(response); // Apply middleware

            return await response.json();
        } catch (error) {
            console.error('Failed to save order execution treatment start time:', error);
            return rejectWithValue(orderId); // Return the payload for offline handling
        }
    },
);

export const saveOrderExecutionPreparationStartTime = createAsyncThunk(
    'execution/saveOrderExecutionPreparationStartTime',
    async (orderId: string, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/executions/${orderId}/praparation-start`,
                {
                    method: 'POST',
                    credentials: 'include', // Include credentials for requests
                },
            );

            await handle403Redirect(response); // Apply middleware

            return await response.json();
        } catch (error) {
            console.error(
                'Failed to save order execution treatment preparation start time:',
                error,
            );
            return rejectWithValue(orderId); // Return the payload for offline handling
        }
    },
);

export const saveOrderExecutionTreatmentFinishTime = createAsyncThunk(
    'execution/saveOrderExecutionTreatmentFinishTime',
    async (orderId: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/executions/${orderId}/finish`, {
                method: 'POST',
                credentials: 'include', // Include credentials for requests
            });

            await handle403Redirect(response); // Apply middleware

            return await response.json();
        } catch (error) {
            console.error('Failed to save order execution treatment finish time:', error);
            return rejectWithValue(orderId); // Return the payload for offline handling
        }
    },
);

export const fetchOrderExecutionForOrder = async (orderId: string) => {
    const response = await fetch(`${BACKEND_URL}/api/executions/${orderId}`, {
        credentials: 'include', // Include credentials in the request
    });

    await handle403Redirect(response); // Apply middleware

    return (await response.json()) as OrderExecution;
};

export const fetchOrderExecutionForOrderAsCurrent = createAsyncThunk(
    'execution/fetchOrderExecutionAsCurrent',
    fetchOrderExecutionForOrder,
);

export const fetchTkwMeasurements = createAsyncThunk('execution/fetchTkwMeasurements', async () => {
    const response = await fetch(`${BACKEND_URL}/api/executions/tkw-measurements`, {
        credentials: 'include',
    });

    await handle403Redirect(response); // Apply middleware

    return await response.json();
});

export const fetchTkwMeasurementsByExecutionId = async (executionId: string) => {
    const response = await fetch(`${BACKEND_URL}/api/executions/${executionId}/tkw-measurements`, {
        credentials: 'include',
    });

    await handle403Redirect(response); // Apply middleware

    if (!response.ok) {
        throw new Error('Failed to fetch TKW measurements');
    }
    return await response.json();
};

export const updateTkwMeasurement = createAsyncThunk(
    'execution/updateTkwMeasurement',
    async (
        {
            id,
            tkwRep1,
            tkwRep2,
            tkwRep3,
            tkwProbesPhoto,
        }: { id: string; tkwRep1: number; tkwRep2: number; tkwRep3: number; tkwProbesPhoto: Blob },
        { dispatch, rejectWithValue },
    ) => {
        try {
            const formData = new FormData();
            formData.append('tkwData', JSON.stringify({ tkwRep1, tkwRep2, tkwRep3 }));
            formData.append('tkwProbesPhoto', tkwProbesPhoto);

            const response = await fetch(`${BACKEND_URL}/api/executions/tkw-measurements/${id}`, {
                method: 'PUT',
                body: formData,
                credentials: 'include',
            });

            await handle403Redirect(response); // Apply middleware

            if (!response.ok) {
                throw new Error('Failed to update TKW measurement');
            } else {
                dispatch(fetchTkwMeasurements());
                dispatch(fetchOrders());
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    },
);

export const fetchOrderExecutionStartDate = createAsyncThunk(
    'execution/fetchOrderExecutionStartDate',
    async (orderId: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/executions/${orderId}/start-date`, {
                credentials: 'include',
            });

            await handle403Redirect(response); // Apply middleware

            if (!response.ok) {
                throw new Error('Failed to fetch order execution start date');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    },
);

export const fetchOrderPreparationStartDate = createAsyncThunk(
    'execution/fetchOrderPreparationStartDate',
    async (orderId: string, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/executions/${orderId}/preparation-start-date`,
                { credentials: 'include' },
            );

            await handle403Redirect(response); // Apply middleware

            if (!response.ok) {
                throw new Error('Failed to fetch order execution start date');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    },
);

export const fetchOrderExecutionFinishDate = createAsyncThunk(
    'execution/fetchOrderExecutionFinishDate',
    async (orderId: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/executions/${orderId}/finish-date`, {
                credentials: 'include',
            });

            await handle403Redirect(response); // Apply middleware

            if (!response.ok) {
                throw new Error('Failed to fetch order execution finish date');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    },
);

export const fetchLatestTkwMeasurementDate = createAsyncThunk(
    'execution/fetchLatestTkwMeasurementDate',
    async (orderId: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/executions/${orderId}/latest-tkw`, {
                credentials: 'include',
            });

            await handle403Redirect(response); // Apply middleware

            if (!response.ok) {
                throw new Error('Failed to fetch latest TKW measurement date');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    },
);

const executionSlice = createSlice({
    name: 'execution',
    initialState,
    reducers: {
        setActiveExecutionToEmptyOne: (state, action: PayloadAction<Order>) => {
            state.currentOrder = action.payload;
            const newOrderExecution = {
                id: null,
                orderId: action.payload.id,
                operatorId: null, // This will be set by the backend
                productExecutions: [],
                applicationMethod: null,
                packingPhoto: null,
                consumptionPhoto: null,
                packedseedsToTreatKg: null,
                slurryConsumptionPerLotKg: null,
                currentPage: OrderExecutionPage.InitialOverview,
                currentProductIndex: 0,
                treatmentStartDate: null,
                treatmentFinishDate: null,
                preparationStartDate: null,
            };
            state.currentOrderExecution = newOrderExecution;
        },
        incrementProductIndex: (state) => {
            if (
                state.currentOrderExecution &&
                state.currentOrderExecution.currentProductIndex !== null
            ) {
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
                    state.currentOrderExecution.currentPage = (state.currentOrderExecution
                        .currentPage + 1) as OrderExecutionPage;
                }
            }
        },
        deactivateActiveExecution: (state) => {
            state.currentOrder = null;
            state.currentOrderExecution = null;
        },
        setApplicationMethod: (state, action: PayloadAction<string>) => {
            if (state.currentOrderExecution) {
                state.currentOrderExecution.applicationMethod = action.payload;
            }
        },
        setAppliedProductRateKg: (
            state,
            action: PayloadAction<{
                orderId: string;
                productId: string;
                appliedRateKg: number | undefined;
            }>,
        ) => {
            if (state.currentOrderExecution) {
                const { productId, appliedRateKg } = action.payload;
                const productExecution = state.currentOrderExecution.productExecutions.find(
                    (productExecution) => productExecution.productId === productId,
                );
                if (productExecution) {
                    productExecution.appliedRateKg = appliedRateKg;
                } else {
                    state.currentOrderExecution.productExecutions.push({
                        productId,
                        appliedRateKg: appliedRateKg,
                    });
                }
            }
        },
        setExecutedSlurryConsumptionPerLotKg: (
            state,
            action: PayloadAction<{ orderId: string; slurryConsumptionPerLotKg: number }>,
        ) => {
            if (state.currentOrderExecution) {
                const { slurryConsumptionPerLotKg } = action.payload;
                state.currentOrderExecution.slurryConsumptionPerLotKg = slurryConsumptionPerLotKg;
            }
        },
        setExecutedProductConsumptionPerLotKg: (
            state,
            action: PayloadAction<{
                orderId: string;
                productId: string;
                productConsumptionPerLotKg: number;
            }>,
        ) => {
            if (state.currentOrderExecution) {
                const { productId, productConsumptionPerLotKg } = action.payload;
                const productExecution = state.currentOrderExecution.productExecutions.find(
                    (productExecution) => productExecution.productId === productId,
                );
                if (productExecution) {
                    productExecution.productConsumptionPerLotKg = productConsumptionPerLotKg;
                } else {
                    state.currentOrderExecution.productExecutions.push({
                        productId,
                        appliedRateKg: productConsumptionPerLotKg,
                    });
                }
            }
        },
        setPhotoForProvingProductApplication: (
            state,
            action: PayloadAction<{ photo: Blob; productId: string }>,
        ) => {
            if (state.currentOrderExecution) {
                const { photo, productId } = action.payload;
                const productExecution = state.currentOrderExecution.productExecutions.find(
                    (productExecution) => productExecution.productId === productId,
                );
                if (productExecution) {
                    productExecution.applicationPhoto = photo;
                }
            }
        },
        resetPhotoForProvingProductApplication: (
            state,
            action: PayloadAction<{ productId: string }>,
        ) => {
            if (state.currentOrderExecution) {
                const { productId } = action.payload;
                const productExecution = state.currentOrderExecution.productExecutions.find(
                    (productExecution) => productExecution.productId === productId,
                );
                if (productExecution) {
                    productExecution.applicationPhoto = undefined;
                }
            }
        },
        setProductConsumptionPhoto: (
            state,
            action: PayloadAction<{ photo: Blob; productId: string }>,
        ) => {
            if (state.currentOrderExecution) {
                const { photo, productId } = action.payload;
                const productExecution = state.currentOrderExecution.productExecutions.find(
                    (productExecution) => productExecution.productId === productId,
                );
                if (productExecution) {
                    productExecution.consumptionPhoto = photo;
                }
            }
        },
        setConsumptionPhoto: (state, action: PayloadAction<Blob>) => {
            if (state.currentOrderExecution) {
                state.currentOrderExecution.consumptionPhoto = action.payload;
            }
        },
        setPhotoForPacking: (state, action: PayloadAction<Blob>) => {
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
        builder.addCase(
            fetchOrderExecutionForOrderAsCurrent.fulfilled,
            (state, action: PayloadAction<OrderExecution>) => {
                state.currentOrderExecution = action.payload;
            },
        );
        builder.addCase(
            fetchTkwMeasurements.fulfilled,
            (state, action: PayloadAction<TkwMeasurement[]>) => {
                state.tkwMeasurements = action.payload;
            },
        );
    },
});

export const {
    setActiveExecutionToEmptyOne,
    resetCurrentProductIndex,
    nextPage,
    deactivateActiveExecution,
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
