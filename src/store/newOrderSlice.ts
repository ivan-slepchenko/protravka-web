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
  tkw: number;
  quantity: number;
  packaging: string;
  bagSize: number;
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
  tkw: 0,
  quantity: 0,
  packaging: "",
  bagSize: 0,
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
    updateRecipeDate: (state, action: PayloadAction<string>) => {
      state.recipeDate = action.payload;
    },
    updateApplicationDate: (state, action: PayloadAction<string>) => {
      state.applicationDate = action.payload;
    },
    updateOperator: (state, action: PayloadAction<string>) => {
      state.operator = action.payload;
    },
    updateCrop: (state, action: PayloadAction<string>) => {
      state.crop = action.payload;
    },
    updateVariety: (state, action: PayloadAction<string>) => {
      state.variety = action.payload;
    },
    updateLotNumber: (state, action: PayloadAction<string>) => {
      state.lotNumber = action.payload;
    },
    updateTkw: (state, action: PayloadAction<number>) => {
      state.tkw = action.payload;
    },
    updateQuantity: (state, action: PayloadAction<number>) => {
      state.quantity = action.payload;
    },
    updatePackaging: (state, action: PayloadAction<string>) => {
      state.packaging = action.payload;
    },
    updateBagSize: (state, action: PayloadAction<number>) => {
      state.bagSize = action.payload;
    },
    updateStatus: (state, action: PayloadAction<OrderStatus>) => {
      state.status = action.payload;
    },
    setOrderState: (state, action: PayloadAction<Order>) => {
      return action.payload;
    },
  },
});

export const {
  addProductDetail,
  updateProductDetail,
  removeProductDetail,
  updateRecipeDate,
  updateApplicationDate,
  updateOperator,
  updateCrop,
  updateVariety,
  updateLotNumber,
  updateTkw,
  updateQuantity,
  updatePackaging,
  updateBagSize,
  updateStatus,
  setOrderState,
} = newOrderSlice.actions;
export default newOrderSlice.reducer;