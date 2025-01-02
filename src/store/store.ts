import { configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import newOrderReducer from './newOrderSlice';
import ordersReducer from './ordersSlice';
import operatorsReducer from './operatorsSlice';
import cropsReducer from './cropsSlice';
import productsReducer from './productsSlice';
import userReducer from './userSlice';
import executionReducer from './executionSlice';

// Configure persist for execution reducer
const executionPersistConfig = {
    key: 'execution',
    storage,
    whitelist: ['execution'], // Only persist the execution state
};

const persistedExecutionReducer = persistReducer(executionPersistConfig, executionReducer);

const store = configureStore({
    reducer: {
        newOrder: newOrderReducer,
        orders: ordersReducer,
        operators: operatorsReducer,
        crops: cropsReducer,
        products: productsReducer,
        user: userReducer,
        execution: persistedExecutionReducer, // Use persisted reducer
        // ...add your reducers here...
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
