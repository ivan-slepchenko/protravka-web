import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Operator, OrderRecipe } from './operatorsSlice';
import { Crop, Variety } from './cropsSlice';
import { Product } from './productsSlice';

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
  quantity: number;
  rateUnit: RateUnit;
  rateType: RateType;
  rate: number;
  index: number; // Add index property
  productId: string; // Add productId property
  product?: Product; // Add product property
}

export enum OrderStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Acknowledge = 'Acknowledge',
  Archived = 'Archived',
  Executed = "Executed",
}

export enum Packaging {
  InSeeds = 'inSeeds',
  InKg = 'inKg',
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
    packaging: Packaging;
    bagSize: number;
    status: OrderStatus;
    orderRecipe: OrderRecipe; 
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
  packaging: Packaging;
  bagSize: number;
  status: OrderStatus;
  extraSlurry: number; // Add extraSlurry field
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
    packaging: Packaging.InSeeds,
    bagSize: 0,
    status: OrderStatus.NotStarted,
    extraSlurry: 0, // Initialize extraSlurry
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
    productId: "", // Initialize productId
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
        updatePackaging: (state, action: PayloadAction<Packaging>) => {
            state.packaging = action.payload;
        },
        updateBagSize: (state, action: PayloadAction<number>) => {
            state.bagSize = action.payload;
        },
        updateStatus: (state, action: PayloadAction<OrderStatus>) => {
            state.status = action.payload;
        },
        updateExtraSlurry: (state, action: PayloadAction<number>) => {
            state.extraSlurry = action.payload;
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
    updateExtraSlurry,
    setOrderState,
} = newOrderSlice.actions;
export default newOrderSlice.reducer;