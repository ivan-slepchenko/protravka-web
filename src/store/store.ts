import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import newOrderReducer from './newOrderSlice';
import ordersReducer from './ordersSlice';
import operatorsReducer from './operatorsSlice';
import cropsReducer from './cropsSlice';
import productsReducer from './productsSlice';
import userReducer from './userSlice';
import executionReducer from './executionSlice';
// ...import your reducers here...

const persistConfig = {
    key: 'newOrder',
    storage,
    blacklist: ['recipeDate', 'applicationDate']
};

const persistedNewOrderReducer = persistReducer(persistConfig, newOrderReducer);


const store = configureStore({
    reducer: {
        newOrder: persistedNewOrderReducer,
        orders: ordersReducer,
        operators: operatorsReducer,
        crops: cropsReducer,
        products: productsReducer,
        user: userReducer,
        execution: executionReducer,
    // ...add your reducers here...
    }
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
