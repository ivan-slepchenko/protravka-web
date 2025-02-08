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
    index: number;
    productId: string;
    product?: Product;
}

export enum OrderStatus {
    LabAssignmentCreated = 'Lab Assignment Created',
    TKWConfirmed = 'TKW Confirmed',
    RecipeCreated = 'Recipe Created',
    TreatmentInProgress = 'Treatment In Progress',
    LabControl = 'Lab To Control',
    ToAcknowledge = 'To Acknowledge',
    Archived = 'Archived',
    Completed = 'Completed',
    Failed = 'Failed',
}

export enum Packaging {
    InSeeds = 'inSeeds',
    InKg = 'inKg',
}

export interface Order {
    id: string;
    productDetails: ProductDetail[];
    operator: Operator | null;
    crop: Crop;
    variety: Variety;
    lotNumber: string;
    tkw: number;
    tkwRep1: number;
    tkwRep2: number;
    tkwRep3: number;
    tkwProbesPhoto: string;
    seedsToTreatKg: number;
    packaging: Packaging;
    bagSize: number;
    status: OrderStatus;
    orderRecipe: OrderRecipe | null;
    extraSlurry: number;
    tkwMeasurementInterval: number;
    tkwMeasurementDate: number;
    creationDate: number;
    finalizationDate: number;
    applicationDate: number;
    completionDate: number;
}

export interface NewOrderState {
    id: string;
    productDetails: ProductDetail[];
    applicationDate: number;
    operatorId: string | null;
    cropId: string | null;
    varietyId: string | null;
    lotNumber: string;
    tkw: number | null;
    seedsToTreatKg: number | null;
    packaging: Packaging;
    bagSize: number | null;
    status: OrderStatus;
    extraSlurry: number | null;
    slurryTotalMlRecipeToMix: number | null;
    slurryTotalGrRecipeToMix: number | null;
    totalCompoundsDensity: number | null;
    tkwMeasurementInterval: number;
}

export const createNewEmptyOrder: () => NewOrderState = () => ({
    id: new Date().toISOString(),
    productDetails: [],
    operatorId: null,
    cropId: null,
    varietyId: null,
    lotNumber: '',
    tkw: null,
    seedsToTreatKg: null,
    packaging: Packaging.InSeeds,
    bagSize: null,
    status: OrderStatus.RecipeCreated,
    extraSlurry: null,
    tkwMeasurementInterval: 60,
    slurryTotalMlRecipeToMix: null,
    slurryTotalGrRecipeToMix: null,
    totalCompoundsDensity: null,
    applicationDate: Date.now(),
});

export const createNewEmptyProduct: () => ProductDetail = () => ({
    id: new Date().toISOString(),
    name: '',
    rateUnit: RateUnit.ML,
    rateType: RateType.Unit,
    density: 0,
    rate: 0,
    index: 0, // Initialize index
    productId: '', // Initialize productId
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
    },
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
            const index = state.productDetails.findIndex((pd) => pd.index === action.payload.index);
            if (index !== -1) {
                state.productDetails[index] = action.payload;
            }
        },
        removeProductDetail: (state, action: PayloadAction<number>) => {
            state.productDetails = state.productDetails.filter((pd) => pd.index !== action.payload);
            state.productDetails.forEach((pd, idx) => (pd.index = idx)); // Reassign indexes
        },
        updateApplicationDate: (state, action: PayloadAction<number>) => {
            state.applicationDate = action.payload;
        },
        updateOperator: (state, action: PayloadAction<string | null>) => {
            state.operatorId = action.payload;
        },
        updateCrop: (state, action: PayloadAction<string | null>) => {
            state.cropId = action.payload;
        },
        updateVariety: (state, action: PayloadAction<string | null>) => {
            state.varietyId = action.payload;
        },
        updateLotNumber: (state, action: PayloadAction<string>) => {
            state.lotNumber = action.payload;
        },
        updateTkw: (state, action: PayloadAction<number | null>) => {
            state.tkw = action.payload;
        },
        updateseedsToTreatKg: (state, action: PayloadAction<number | null>) => {
            state.seedsToTreatKg = action.payload;
        },
        updatePackaging: (state, action: PayloadAction<Packaging>) => {
            state.packaging = action.payload;
        },
        updateBagSize: (state, action: PayloadAction<number | null>) => {
            state.bagSize = action.payload;
        },
        updateStatus: (state, action: PayloadAction<OrderStatus>) => {
            state.status = action.payload;
        },
        updateExtraSlurry: (state, action: PayloadAction<number | null>) => {
            state.extraSlurry = action.payload;
        },
        updateTkwMeasurementInterval: (state, action: PayloadAction<number>) => {
            state.tkwMeasurementInterval = action.payload;
        },
        updateCalculatedValues: (
            state,
            action: PayloadAction<{
                slurryTotalMlRecipeToMix: number;
                slurryTotalGrRecipeToMix: number;
            }>,
        ) => {
            state.slurryTotalMlRecipeToMix = action.payload.slurryTotalMlRecipeToMix;
            state.slurryTotalGrRecipeToMix = action.payload.slurryTotalGrRecipeToMix;
        },
        setOrderState: (state, action: PayloadAction<NewOrderState>) => {
            return action.payload;
        },
        loadOrderData: (state, action: PayloadAction<Partial<NewOrderState>>) => {
            return {
                ...state,
                ...action.payload,
            };
        },
        resetStateToDefaultFinalize: (state) => {
            console.log('Resetting state to default');
            // TODO: Continue on this, as form is not resetting on clear
            return {
                ...state,
                productDetails: [],
                applicationDate: Date.now(),
                packaging: Packaging.InSeeds,
                bagSize: null,
                extraSlurry: null,
                operatorId: null,
                tkwMeasurementInterval: 60,
            };
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
    loadOrderData,
    updateTkwMeasurementInterval,
    resetStateToDefaultFinalize,
} = newOrderSlice.actions;

export default newOrderSlice.reducer;
