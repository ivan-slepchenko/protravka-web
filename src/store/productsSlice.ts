import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  activeIngredient?: string;
  density: number;
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
    const response = await fetch(`${BACKEND_URL}/api/products`, {
        credentials: 'include', // Include credentials in the request
    });
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    return response.json();
});

export const createProduct = createAsyncThunk('products/createProduct', async (product: Product) => {
    const { id, ...productWithoutId } = product;
    id.toString();
    const response = await fetch(`${BACKEND_URL}/api/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productWithoutId),
        credentials: 'include', // Include credentials in the request
    });
    if (!response.ok) {
        throw new Error('Failed to create product');
    }
    return response.json();
});

export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id: string) => {
    const response = await fetch(`${BACKEND_URL}/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include', // Include credentials in the request
    });
    if (!response.ok) {
        throw new Error('Failed to delete product');
    }
    return id;
});

const productsSlice = createSlice({
    name: 'products',
    initialState: {
        products: [] as Product[],
        loading: false,
        error: null as string | null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
                state.loading = false;
                state.products = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch products';
            })
            .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                state.products.push(action.payload);
            })
            .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
                state.products = state.products.filter(product => product.id !== action.payload);
            });
    },
});

export default productsSlice.reducer;