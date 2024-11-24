import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import newOrderReducer from './newOrderSlice';
import ordersReducer from './ordersSlice';
import operatorsReducer from './operatorsSlice';
import cropsReducer from './cropsSlice';
// ...import your reducers here...

const persistConfig = {
  key: 'newOrder',
  storage
};

const persistedNewOrderReducer = persistReducer(persistConfig, newOrderReducer);


const store = configureStore({
  reducer: {
    newOrder: persistedNewOrderReducer,
    orders: ordersReducer,
    operators: operatorsReducer,
    crops: cropsReducer,
    // ...add your reducers here...
  }
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
