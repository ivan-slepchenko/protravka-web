
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Variety {
  id: string;
  name: string;
  crop?: Crop;
}

export interface Crop {
  id: string;
  name: string;
  varieties: Variety[];
}

interface CropsState {
  crops: Crop[];
}

const initialState: CropsState = {
  crops: []
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export const fetchCrops = createAsyncThunk('crops/fetchCrops', async () => {
  const response = await fetch(`${BACKEND_URL}/api/crops`);
  return response.json();
});

export const createCrop = createAsyncThunk('crops/createCrop', async (crop: Crop) => {
  const { id, ...cropWithoutId } = crop; // Remove id from crop
  const response = await fetch(`${BACKEND_URL}/api/crops`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cropWithoutId),
  });
  return response.json();
});

export const createVariety = createAsyncThunk('crops/createVariety', async ({ cropId, variety }: { cropId: string, variety: Variety }) => {
  const { id, ...varietyWithoutId } = variety; // Remove id from variety
  const response = await fetch(`${BACKEND_URL}/api/crops/${cropId}/varieties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(varietyWithoutId),
  });
  return response.json();
});

const cropsSlice = createSlice({
  name: 'crops',
  initialState,
  reducers: {
    addCrop: (state, action: PayloadAction<Crop>) => {
      state.crops.push(action.payload);
    },
    updateCrop: (state, action: PayloadAction<Crop>) => {
      const index = state.crops.findIndex(crop => crop.id === action.payload.id);
      if (index !== -1) {
        state.crops[index] = action.payload;
      }
    },
    deleteCrop: (state, action: PayloadAction<string>) => {
      state.crops = state.crops.filter(crop => crop.id !== action.payload);
    },
    addVariety: (state, action: PayloadAction<{ cropId: string, variety: Variety }>) => {
      const crop = state.crops.find(crop => crop.id === action.payload.cropId);
      if (crop) {
        crop.varieties.push(action.payload.variety);
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCrops.fulfilled, (state, action: PayloadAction<Crop[]>) => {
      state.crops = action.payload || [];
    });
    builder.addCase(createCrop.fulfilled, (state, action: PayloadAction<Crop>) => {
      state.crops.push(action.payload);
    });
    builder.addCase(createVariety.fulfilled, (state, action: PayloadAction<Variety>) => {
      const crop = state.crops.find(crop => crop.id === action.payload.crop?.id);
      if (crop) {
        crop.varieties.push(action.payload);
      }
    });
  },
});

export const { addCrop, updateCrop, deleteCrop, addVariety } = cropsSlice.actions;
export default cropsSlice.reducer;