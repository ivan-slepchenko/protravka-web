import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProductDetail {
  id: number;
  name: string;
  quantity: number;
  rateUnit: string;
  rateType: string;
  density: number;
  rate: number;
}

export enum OrderStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Acknowledge = 'Acknowledge',
  Archive = 'Archive',
}

export interface Order {
  productDetails: ProductDetail[];
  recipeDate: string;
  applicationDate: string;
  operator: string;
  crop: string;
  variety: string;
  lotNumber: string;
  tkw: string;
  quantity: string;
  packaging: string;
  bagSize: string;
  status: OrderStatus;
}

const initialState: Order = {
  productDetails: [],
  recipeDate: new Date().toISOString().split("T")[0],
  applicationDate: new Date().toISOString().split("T")[0],
  operator: "",
  crop: "",
  variety: "",
  lotNumber: "",
  tkw: "",
  quantity: "",
  packaging: "",
  bagSize: "",
  status: OrderStatus.NotStarted,
};

const newOrderSlice = createSlice({
  name: 'newOrder',
  initialState,
  reducers: {
    addProductDetail: (state, action: PayloadAction<ProductDetail>) => {
      state.productDetails.push(action.payload);
    },
    updateProductDetail: (state, action: PayloadAction<ProductDetail>) => {
      const index = state.productDetails.findIndex(pd => pd.id === action.payload.id);
      if (index !== -1) {
        state.productDetails[index] = action.payload;
      }
    },
    removeProductDetail: (state, action: PayloadAction<number>) => {
      state.productDetails = state.productDetails.filter(pd => pd.id !== action.payload);
    },
    updateField: (state, action: PayloadAction<{ field: keyof Order, value: string | OrderStatus }>) => {
      if (action.payload.field === 'productDetails' && typeof action.payload.value === 'string') {
        state.productDetails = JSON.parse(action.payload.value);
      } else {
        state[action.payload.field] = action.payload.value as any;
      }
    },
    setOrderState: (state, action: PayloadAction<Order>) => {
      return action.payload;
    },
  },
});

export const { addProductDetail, updateProductDetail, removeProductDetail, updateField, setOrderState } = newOrderSlice.actions;
export default newOrderSlice.reducer;