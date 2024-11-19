import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import newOrderReducer from './newOrderSlice';
// ...import your reducers here...

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['newOrder'],
};

const persistedReducer = persistReducer(persistConfig, newOrderReducer);

const store = configureStore({
  reducer: {
    newOrder: persistedReducer,
    // ...add your reducers here...
  },
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
