import React from 'react';

const Board: React.FC = () => {
    const columns = ['Not Started', 'In Progress', 'Acknowledge', 'Archive'];

    return (
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
            {columns.map((column) => (
                <div key={column} style={{ width: '200px', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>
                    <h3>{column}</h3>
                    {/* Add your tasks here */}
                </div>
            ))}
        </div>
    );
};

export default Board;