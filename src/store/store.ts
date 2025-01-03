import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';
import { combineReducers, compose, applyMiddleware, createStore, StoreEnhancer } from '@reduxjs/toolkit';
import newOrderReducer from './newOrderSlice';
import ordersReducer from './ordersSlice';
import operatorsReducer from './operatorsSlice';
import cropsReducer from './cropsSlice';
import productsReducer from './productsSlice';
import userReducer from './userSlice';
import executionReducer from './executionSlice';

// Combine all reducers
const rootReducer = combineReducers({
    newOrder: newOrderReducer,
    orders: ordersReducer,
    operators: operatorsReducer,
    crops: cropsReducer,
    products: productsReducer,
    user: userReducer,
    execution: executionReducer,
});

// Enhance redux-offline middleware
const offlineEnhancer = offline(offlineConfig);

// Use a compatible enhancer configuration
const composedEnhancer: StoreEnhancer = compose(
    applyMiddleware(), // Add any additional middleware here if needed
    offlineEnhancer // Apply offline enhancer
);

// Create the store
const store = createStore(
    rootReducer,
    undefined, // Preloaded state can go here if needed
    composedEnhancer
);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
