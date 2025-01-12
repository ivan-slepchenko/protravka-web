import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Operator } from './operatorsSlice';
import { OrderRecipe } from './ordersSlice';
import { Crop, Variety } from './cropsSlice';
import { Product } from './productsSlice';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

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
  rateUnit: RateUnit;
  rateType: RateType;
  rate: number;
  index: number; // Add index property
  productId: string; // Add productId property
  product?: Product; // Add product property << when comes from backend
}

export enum OrderStatus {
    ForLabToInitiate = 'For Lab To Initiate',
    ReadyToStart = 'Ready To Start',
    InProgress = 'In Progress',
    ForLabToControl = 'For Lab To Control',
    ToAcknowledge = 'To Acknowledge',
    Archived = 'Archived',
    Completed = "Completed",
    Failed = "Failed",
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
    seedsToTreatKg: number;
    packaging: Packaging;
    bagSize: number;
    status: OrderStatus;
    orderRecipe: OrderRecipe; 
    extraSlurry: number;
}

export interface NewOrderState {
    id: string;
    productDetails: ProductDetail[];
    recipeDate: string;
    applicationDate: string;
    operatorId?: string;
    cropId?: string;
    varietyId?: string;
    lotNumber: string;
    tkw: number;
    seedsToTreatKg: number;
    packaging: Packaging;
    bagSize: number;
    status: OrderStatus;
    extraSlurry: number; // Add extraSlurry field
    slurryTotalMlRecipeToMix?: number;
    slurryTotalGrRecipeToMix?: number;
    totalCompoundsDensity?: number;
}

export const createNewEmptyOrder: () => NewOrderState = () => ({
    id: new Date().toISOString(),
    productDetails: [],
    recipeDate: new Date().toISOString().split("T")[0],
    applicationDate: new Date().toISOString().split("T")[0],
    operatorId: undefined,
    cropId: undefined,
    varietyId: undefined,
    lotNumber: "",
    tkw: 0,
    seedsToTreatKg: 0,
    packaging: Packaging.InSeeds,
    bagSize: 0,
    status: OrderStatus.ReadyToStart,
    extraSlurry: 0, // Initialize extraSlurry
});

export const createNewEmptyProduct: () => ProductDetail = () => ({
    id: new Date().toISOString(),
    name: "",
    rateUnit: RateUnit.ML,
    rateType: RateType.Unit,
    density: 0,
    rate: 0,
    index: 0, // Initialize index
    productId: "", // Initialize productId
});

export const fetchCalculatedValues = createAsyncThunk(
    'newOrder/fetchCalculatedValues',
    async (order: NewOrderState, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/calculate-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(order),
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch calculated values');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

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
        updateseedsToTreatKg: (state, action: PayloadAction<number>) => {
            state.seedsToTreatKg = action.payload;
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
        updateCalculatedValues: (state, action: PayloadAction<{ slurryTotalMlRecipeToMix: number; slurryTotalGrRecipeToMix: number }>) => {
            state.slurryTotalMlRecipeToMix = action.payload.slurryTotalMlRecipeToMix;
            state.slurryTotalGrRecipeToMix = action.payload.slurryTotalGrRecipeToMix;
        },
        setOrderState: (state, action: PayloadAction<NewOrderState>) => {
            return action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCalculatedValues.fulfilled, (state, action) => {
            state.slurryTotalMlRecipeToMix = action.payload.slurryTotalMlRecipeToMix;
            state.slurryTotalGrRecipeToMix = action.payload.slurryTotalGrRecipeToMix;
            state.totalCompoundsDensity = action.payload.totalCompoundsDensity;
        });
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
    updateseedsToTreatKg,
    updatePackaging,
    updateBagSize,
    updateStatus,
    updateExtraSlurry,
    updateCalculatedValues,
    setOrderState,
} = newOrderSlice.actions;
export default newOrderSlice.reducer;