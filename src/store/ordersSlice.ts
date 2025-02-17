import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OrderStatus, NewOrderState, ProductDetail, Order } from './newOrderSlice';

interface OrdersState {
    activeOrders: Order[];
    archivedOrders: Order[];
    fetchError: boolean;
}

const initialState: OrdersState = { activeOrders: [], archivedOrders: [], fetchError: false };

export interface ProductRecipe {
    id: string;
    rateMltoU_KS: number;
    rateGrToU_KS: number;
    rateMlTo100Kg: number;
    rateGrTo100Kg: number;
    mlSlurryRecipeToMix: number;
    grSlurryRecipeToMix: number;
    productDetail: ProductDetail;
}

export interface OrderRecipe {
    id: string;
    totalCompoundsDensity: number;
    slurryTotalMltoU_KS: number;
    slurryTotalGToU_KS: number;
    slurryTotalMlTo100Kg: number;
    slurryTotalGTo100Kgs: number;
    slurryTotalMlRecipeToMix: number;
    slurryTotalGrRecipeToMix: number;
    extraSlurryPipesAndPompFeedingMl: number;
    nbSeedsUnits: number;
    productRecipes: ProductRecipe[];
    unitWeight: number;
}

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL || '';

export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/orders`, {
                credentials: 'include', // Include credentials in the request
            });
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    },
);

export const createOrder = createAsyncThunk('orders/createOrder', async (order: NewOrderState) => {
    if (!order.cropId || !order.varietyId) {
        throw new Error('Operator, crop, and variety must be defined');
    }

    console.log('Creating receipe', order);
    const { id, productDetails, ...orderWithoutId } = order; // Remove id from receipe
    id.toString();
    const productDetailsWithoutIds = productDetails.map(({ id, ...rest }) => {
        id.toString();
        return rest;
    }); // Remove ids from productDetails
    const response = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...orderWithoutId, productDetails: productDetailsWithoutIds }),
        credentials: 'include', // Include credentials in the request
    });
    const jsonResponse = await response.json();
    console.log('Receipe created', jsonResponse);
    return jsonResponse;
});

export const finalizeOrder = createAsyncThunk('orders/finalizeOrder', async (order: Order) => {
    const { productDetails, ...orderWithoutId } = order; // Remove id from receipe
    const productDetailsWithoutIds = productDetails.map(({ id, ...rest }) => {
        id.toString();
        return rest;
    }); // Remove ids from productDetails
    const response = await fetch(`${BACKEND_URL}/api/orders/${order.id}/finalize`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...orderWithoutId, productDetails: productDetailsWithoutIds }),
        credentials: 'include', // Include credentials in the request
    });
    return response.json();
});

export const changeOrderStatus = createAsyncThunk(
    'orders/changeOrderStatus',
    async ({ id, status }: { id: string; status: string }, { dispatch }) => {
        const response = await fetch(`${BACKEND_URL}/api/orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
            credentials: 'include', // Include credentials in the request
        });
        const result = await response.json();
        dispatch(fetchOrders()); // We need to refetch orders, to have them in ServiceWorker cache for offline use cases. Probably this should become a pattern.
        return result;
    },
);

export const updateOrderTKW = createAsyncThunk(
    'orders/updateOrderTKW',
    async (
        {
            id,
            tkwRep1,
            tkwRep2,
            tkwRep3,
            tkwProbesPhoto,
        }: { id: string; tkwRep1: number; tkwRep2: number; tkwRep3: number; tkwProbesPhoto: Blob },
        { rejectWithValue },
    ) => {
        try {
            const formData = new FormData();
            formData.append('tkwRep1', tkwRep1.toString());
            formData.append('tkwRep2', tkwRep2.toString());
            formData.append('tkwRep3', tkwRep3.toString());
            formData.append('tkwProbesPhoto', tkwProbesPhoto, 'tkwProbesPhoto.png'); // Provide a filename

            const response = await fetch(`${BACKEND_URL}/api/orders/${id}/tkw`, {
                method: 'PUT',
                body: formData,
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to update TKW values');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    },
);

export const fetchOrderById = createAsyncThunk(
    'orders/fetchOrderById',
    async (id: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { orders: OrdersState };
            const existingOrder = state.orders.activeOrders.find((order) => order.id === id);
            if (existingOrder) {
                return existingOrder;
            }
            const response = await fetch(`${BACKEND_URL}/api/orders/${id}`, {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch order');
            }
            const order: Order = await response.json();
            return order;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    },
);

const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        updateOrder: (state, action: PayloadAction<Order>) => {
            const index = state.activeOrders.findIndex(
                (order) => order.lotNumber === action.payload.lotNumber,
            );
            if (index !== -1) {
                state.activeOrders[index] = action.payload;
            }
        },
        archiveOrder: (state, action: PayloadAction<string>) => {
            const index = state.activeOrders.findIndex(
                (order) => order.lotNumber === action.payload,
            );
            if (index !== -1) {
                const [order] = state.activeOrders.splice(index, 1);
                state.archivedOrders.push(order);
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
            state.activeOrders = action.payload;
            state.fetchError = false;
        });
        builder.addCase(fetchOrders.rejected, (state) => {
            state.fetchError = true;
        });
        builder.addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
            state.activeOrders.push(action.payload);
        });
        builder.addCase(finalizeOrder.fulfilled, (state, action: PayloadAction<Order>) => {
            const index = state.activeOrders.findIndex((order) => order.id === action.payload.id);
            if (index !== -1) {
                state.activeOrders[index] = action.payload;
            }
        });
        builder.addCase(changeOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
            const index = state.activeOrders.findIndex((order) => order.id === action.payload.id);
            if (index !== -1) {
                state.activeOrders[index].status = action.payload.status;
                if (action.payload.status === OrderStatus.Archived) {
                    const [order] = state.activeOrders.splice(index, 1);
                    state.archivedOrders.push(order);
                }
            }
        });
    },
});

export const { updateOrder, archiveOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
