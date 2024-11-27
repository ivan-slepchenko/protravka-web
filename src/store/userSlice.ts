import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface UserState {
  email: string | null;
  token: string | null;
  error: string | null;
  message: string | null;
}

const initialState: UserState = {
  email: null,
  token: null,
  error: null,
  message: null,
};

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error('Failed to register user');
    }
    return response.json();
  }
);

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error('Failed to login');
    }
    return response.json();
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ email: string; token: string }>) {
      state.email = action.payload.email;
      state.token = action.payload.token;
    },
    clearUser(state) {
      state.email = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<{ email: string; token: string }>) => {
        state.email = action.payload.email;
        state.token = action.payload.token;
        state.message = 'Signup successful! Please check your email to verify your account.';
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to register user';
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ email: string; token: string }>) => {
        state.email = action.payload.email;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to login';
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;