import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Role } from '../operators/Operators';
import { ProductDetail } from './newOrderSlice';

export interface Operator {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  roles: Role[];
}

export interface ProductRecipe {
    id: string;
    rateMltoU_KS: number;
    rateGToU_KS: number;
    rateMlTo100Kg: number;
    rateGTo100Kg: number;
    literSlurryRecipeToMix: number;
    kgSlurryRecipeToMix: number;
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
    slurryTotalKgRecipeToWeight: number;
    extraSlurryPipesAndPompFeedingMl: number;
    nbSeedsUnits: number;
    productRecipes: ProductRecipe[];
}

interface OperatorsState {
  operators: Operator[];
}

const initialState: OperatorsState = {
    operators: []
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export const fetchOperators = createAsyncThunk('operators/fetchOperators', async () => {
    const response = await fetch(`${BACKEND_URL}/api/operators`, {
        credentials: 'include', // Include credentials in the request
    });
    return response.json();
});

export const createOperator = createAsyncThunk('operators/createOperator', async (operator: Operator) => {
    const { id, ...operatorWithoutId } = operator; // Remove id from operator
    id.toString();
    const response = await fetch(`${BACKEND_URL}/api/operators`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(operatorWithoutId),
        credentials: 'include', // Include credentials in the request
    });
    return response.json();
});

export const pushOperatorChanges = createAsyncThunk('operators/updateOperator', async (operator: Operator) => {
    const response = await fetch(`${BACKEND_URL}/api/operators/${operator.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(operator),
        credentials: 'include', // Include credentials in the request
    });
    return response.json();
});

const operatorsSlice = createSlice({
    name: 'operators',
    initialState,
    reducers: {
        addOperator: (state, action: PayloadAction<Operator>) => {
            state.operators.push(action.payload);
        },
        updateOperator: (state, action: PayloadAction<Operator>) => {
            const index = state.operators.findIndex(op => op.id === action.payload.id);
            if (index !== -1) {
                state.operators[index] = action.payload;
            }
        },
        deleteOperator: (state, action: PayloadAction<string>) => {
            state.operators = state.operators.filter(op => op.id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchOperators.fulfilled, (state, action: PayloadAction<Operator[]>) => {
            state.operators = action.payload || [];
        });
        builder.addCase(createOperator.fulfilled, (state, action: PayloadAction<Operator>) => {
            state.operators.push(action.payload);
        });
        builder.addCase(pushOperatorChanges.fulfilled, (state, action: PayloadAction<Operator>) => {
            const index = state.operators.findIndex(op => op.id === action.payload.id);
            if (index !== -1) {
                state.operators[index] = action.payload;
            }
        });
    },
});

export const { addOperator, deleteOperator, updateOperator } = operatorsSlice.actions;
export default operatorsSlice.reducer;