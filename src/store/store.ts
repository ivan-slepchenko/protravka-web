import { configureStore } from '@reduxjs/toolkit';
import newOrderReducer from './newOrderSlice';
// ...import your reducers here...

const store = configureStore({
  reducer: {
    newOrder: newOrderReducer,
    // ...add your reducers here...
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
