import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Role } from '../operators/Operators';

interface Company {
    id: string;
    name: string;
    contactEmail: string;
    featureFlags: { useLab: boolean };
    availableLanguages: string[]; // Add availableLanguages property
}

interface UserState {
    email: string | null;
    name: string | null;
    surname: string | null;
    phone: string | null;
    roles: Role[];
    error: string | null;
    message: string | null;
    company: Company | null;
}

const initialState: UserState = {
    email: null,
    name: null,
    surname: null,
    phone: null,
    roles: [],
    error: null,
    message: null,
    company: null,
};

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL || '';

export const registerUser = createAsyncThunk(
    'user/registerUser',
    async (
        {
            email,
            password,
            name,
            surname,
            birthday,
            phone,
        }: {
            email: string;
            password: string;
            name: string;
            surname: string;
            birthday: string;
            phone: string;
        },
        { rejectWithValue },
    ) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, surname, birthday, phone }),
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('authentication.register_failed'); // Localized error message
            }
            return response.json();
        } catch (error) {
            return rejectWithValue('authentication.register_failed'); // Localized error message
        }
    },
);

export const loginUser = createAsyncThunk(
    'user/loginUser',
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Include credentials in the request
            });
            if (!response.ok) {
                throw new Error('authentication.login_failed'); // Localized error message
            }

            const { user } = (await response.json()) as { user: UserState };

            if (!user.company) {
                throw new Error('authentication.no_company'); // Localized error message
            }

            return user;
        } catch (error) {
            return rejectWithValue('authentication.login_failed'); // Localized error message
        }
    },
);

export const fetchUserByToken = createAsyncThunk(
    'user/fetchUserByToken',
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/user`, { credentials: 'include' });
            if (!res.ok) {
                throw new Error('authentication.session_timed_out'); // Localized error message
            }

            const user = (await res.json()) as UserState;

            if (!user.company) {
                throw new Error('authentication.no_company'); // Localized error message
            }

            return user;
        } catch (error) {
            return rejectWithValue('authentication.session_timed_out'); // Localized error message
        }
    },
);

export const logoutUser = createAsyncThunk('user/logoutUser', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('authentication.logout_failed'); // Localized error message
        }
        return response.json();
    } catch (error) {
        return rejectWithValue('authentication.logout_failed'); // Localized error message
    }
});

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(
            state,
            action: PayloadAction<{
                email: string;
                name: string;
                surname: string;
                phone: string;
                roles: Role[];
            }>,
        ) {
            state.email = action.payload.email;
            state.name = action.payload.name;
            state.surname = action.payload.surname;
            state.phone = action.payload.phone;
            state.roles = action.payload.roles;
        },
        clearUser(state) {
            state.email = null;
            state.name = null;
            state.surname = null;
            state.phone = null;
            state.roles = [];
        },
        logout(state) {
            state.email = null;
            state.name = null;
            state.surname = null;
            state.phone = null;
            state.roles = [];
            state.error = null;
            state.message = null;
            // Clear all cookies
            document.cookie.split(';').forEach((c) => {
                document.cookie = c
                    .replace(/^ +/, '')
                    .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
            });
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.fulfilled, (state) => {
                state.message =
                    'Signup successful! Please check your email to verify your account.';
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.error =
                    action.error.message || (action.payload as string) || 'Failed to register user';
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                const { email, name, surname, phone, roles, company } = action.payload;
                state.email = email;
                state.name = name;
                state.surname = surname;
                state.phone = phone;
                state.roles = roles;
                state.error = null;
                state.company = company;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to login';
            })
            .addCase(fetchUserByToken.fulfilled, (state, action) => {
                const { email, name, surname, phone, roles, company } = action.payload;
                state.email = email;
                state.name = name;
                state.surname = surname;
                state.phone = phone;
                state.error = null;
                state.roles = roles;
                state.company = company;
            })
            .addCase(fetchUserByToken.rejected, (state, action) => {
                state.error =
                    (action.payload as string) || action.error.message || 'Failed to fetch user';
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.email = null;
                state.name = null;
                state.surname = null;
                state.phone = null;
                state.error = null;
                state.message = null;
                state.roles = [];
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to logout';
            });
    },
});

export const { setUser, clearUser, logout } = userSlice.actions;
export default userSlice.reducer;
