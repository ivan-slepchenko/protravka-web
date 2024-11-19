import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import newOrderReducer from './newOrderSlice';
import ordersReducer from './ordersSlice';
// ...import your reducers here...

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['newOrder', 'orders'],
};

const persistedNewOrderReducer = persistReducer(persistConfig, newOrderReducer);
const persistedOrdersReducer = persistReducer(persistConfig, ordersReducer);

const store = configureStore({
  reducer: {
    newOrder: persistedNewOrderReducer,
    orders: persistedOrdersReducer,
    // ...add your reducers here...
  },
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
