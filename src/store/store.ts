import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import newOrderReducer from './newOrderSlice';
import ordersReducer from './ordersSlice';
import operatorsReducer from './operatorsSlice';
import cropsReducer from './cropsSlice';
import productsReducer from './productsSlice';
import userReducer from './userSlice';
import executionReducer from './executionSlice';

// Persist configuration for executionReducer
const executionPersistConfig = {
    key: 'execution',
    storage,
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
        execution: persistedExecutionReducer,
        // ...add your reducers here...
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware(),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
