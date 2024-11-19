import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { OrderStatus } from '../store/newOrderSlice';
import OrderInfo from './OrderInfo';

const Board: React.FC = () => {
    const columns = [OrderStatus.NotStarted, OrderStatus.InProgress, OrderStatus.Acknowledge, OrderStatus.Archive];
    const orders = useSelector((state: RootState) => state.orders.activeOrders);
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

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
                    {orders.filter(order => order.status === column).map(order => (
                        <div key={order.lotNumber} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '5px', marginBottom: '5px', cursor: 'pointer' }} onClick={() => handleOrderClick(order.lotNumber)}>
                            <p><strong>Lot Number:</strong> {order.lotNumber}</p>
                            <p><strong>Crop:</strong> {order.crop}</p>
                            <p><strong>Variety:</strong> {order.variety}</p>
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