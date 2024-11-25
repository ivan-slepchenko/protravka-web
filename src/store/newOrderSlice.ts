import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Operator } from './operatorsSlice';
import { Crop, Variety } from './cropsSlice';

export enum RateUnit {
  ML = 'ml',
  G = 'g',
}

export enum RateType {
  Unit = 'unit',
  Per100Kg = '100kg',
}

export interface ProductDetail {
  id: string;
  name: string;
  quantity: number;
  rateUnit: RateUnit;
  rateType: RateType;
  density: number;
  rate: number;
  index: number; // Add index property
}

export enum OrderStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Acknowledge = 'Acknowledge',
  Archived = 'Archived',
}

export interface Order {
  id: string;
  productDetails: ProductDetail[];
  recipeDate: string;
  applicationDate: string;
  operator: Operator;
  crop: Crop;
  variety: Variety;
  lotNumber: string;
  tkw: number;
  quantity: number;
  packaging: string;
  bagSize: number;
  status: OrderStatus;
}

export interface NewOrder {
  id: string;
  productDetails: ProductDetail[];
  recipeDate: string;
  applicationDate: string;
  operatorId?: string;
  cropId?: string;
  varietyId?: string;
  lotNumber: string;
  tkw: number;
  quantity: number;
  packaging: string;
  bagSize: number;
  status: OrderStatus;
}

export const createNewEmptyOrder: () => NewOrder = () => ({
  id: new Date().toISOString(),
  productDetails: [],
  recipeDate: new Date().toISOString().split("T")[0],
  applicationDate: new Date().toISOString().split("T")[0],
  operatorId: undefined,
  cropId: undefined,
  varietyId: undefined,
  lotNumber: "",
  tkw: 0,
  quantity: 0,
  packaging: "inSeeds",
  bagSize: 0,
  status: OrderStatus.NotStarted,
});

export const createNewEmptyProduct: () => ProductDetail = () => ({
  id: new Date().toISOString(),
  name: "",
  quantity: 0,
  rateUnit: RateUnit.ML,
  rateType: RateType.Unit,
  density: 0,
  rate: 0,
  index: 0, // Initialize index
});

const newOrderSlice = createSlice({
  name: 'newOrder',
  initialState: createNewEmptyOrder(),
  reducers: {
    addProductDetail: (state, action: PayloadAction<ProductDetail>) => {
      action.payload.index = state.productDetails.length; // Set index based on current length
      state.productDetails.push(action.payload);
    },
    updateProductDetail: (state, action: PayloadAction<ProductDetail>) => {
      const index = state.productDetails.findIndex(pd => pd.index === action.payload.index);
      if (index !== -1) {
        state.productDetails[index] = action.payload;
      }
    },
    removeProductDetail: (state, action: PayloadAction<number>) => {
      state.productDetails = state.productDetails.filter(pd => pd.index !== action.payload);
      state.productDetails.forEach((pd, idx) => pd.index = idx); // Reassign indexes
    },
    updateRecipeDate: (state, action: PayloadAction<string>) => {
      state.recipeDate = action.payload;
    },
    updateApplicationDate: (state, action: PayloadAction<string>) => {
      state.applicationDate = action.payload;
    },
    updateOperator: (state, action: PayloadAction<string>) => {
      state.operatorId = action.payload;
    },
    updateCrop: (state, action: PayloadAction<string>) => {
      state.cropId = action.payload;
    },
    updateVariety: (state, action: PayloadAction<string>) => {
      state.varietyId = action.payload;
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
    setOrderState: (state, action: PayloadAction<NewOrder>) => {
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