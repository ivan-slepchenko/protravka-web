import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus } from './newOrderSlice';

interface OrdersState {
  activeOrders: Order[];
  archivedOrders: Order[];
}

const initialState: OrdersState = {
  activeOrders: [],
  archivedOrders: [],
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.activeOrders.push(action.payload);
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.activeOrders.findIndex(order => order.lotNumber === action.payload.lotNumber);
      if (index !== -1) {
        state.activeOrders[index] = action.payload;
      }
    },
    archiveOrder: (state, action: PayloadAction<string>) => {
      const index = state.activeOrders.findIndex(order => order.lotNumber === action.payload);
      if (index !== -1) {
        const [order] = state.activeOrders.splice(index, 1);
        state.archivedOrders.push(order);
      }
    },
  },
});

export const { addOrder, updateOrder, archiveOrder } = ordersSlice.actions;
export default ordersSlice.reducer;