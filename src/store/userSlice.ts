import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface UserState {
  email: string | null;
  error: string | null;
  message: string | null;
}

const initialState: UserState = {
  email: null,
  error: null,
  message: null,
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch(`${BACKEND_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Include credentials in the request
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
    const response = await fetch(`${BACKEND_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Include credentials in the request
    });
    if (!response.ok) {
      throw new Error('Failed to login');
    }
    return response.json();
  }
);

export const fetchUserByToken = createAsyncThunk(
  'user/fetchUserByToken',
  async () => {
    const response = await fetch(`${BACKEND_URL}/api/user`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user');
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
    },
    clearUser(state) {
      state.email = null;
    },
    logout(state) {
      state.email = null;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<{ email: string; token: string }>) => {
        state.email = action.payload.email;
        state.message = 'Signup successful! Please check your email to verify your account.';
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to register user';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { email } = action.payload.userCredential.user;
        state.email = email;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to login';
      })
      .addCase(fetchUserByToken.fulfilled, (state, action) => {
        state.email = action.payload.email;
        state.error = null;
      })
      .addCase(fetchUserByToken.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch user';
      });
  },
});

export const { setUser, clearUser, logout } = userSlice.actions;
export default userSlice.reducer;