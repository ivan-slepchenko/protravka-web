import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import OrderInfo from './OrderInfo';
import { OrderStatus } from '../store/newOrderSlice';
import { fetchOrders } from '../store/ordersSlice';

const Board: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const columns = [OrderStatus.NotStarted, OrderStatus.InProgress, OrderStatus.Acknowledge, OrderStatus.Archived];
    const orders = useSelector((state: RootState) => state.orders.activeOrders);
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const handleOrderClick = (orderId: string) => {
        setSelectedOrder(orderId);
    };

    const handleClose = () => {
        setSelectedOrder(null);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
            {columns.map((column) => (
                <div key={column} style={{ width: '200px', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>
                    <h3>{column}</h3>
                    {orders.filter(order => order.status === column).map((order, index) => (
                        <div key={index} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '5px', marginBottom: '5px', cursor: 'pointer' }} onClick={() => handleOrderClick(order.id)}>
                            <p><strong>Lot Number:</strong> {order.lotNumber}</p>
                            <p><strong>Crop:</strong> {order.crop?.name && ''}</p>
                            <p><strong>Variety:</strong> {order.variety?.name && ''}</p>
                            <p><strong>Quantity:</strong> {order.quantity} kg</p>
                        </div>
                    ))}
                </div>
            ))}
            {selectedOrder && <OrderInfo isOpen={!!selectedOrder} onClose={handleClose} orderId={selectedOrder} />}
        </div>
    );
};

export default Board;