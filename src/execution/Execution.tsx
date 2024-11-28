import React, { useEffect } from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Button } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchOrders } from '../store/ordersSlice';
import { useNavigate } from 'react-router-dom';

const Execution = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  //TODO: compare by id, you need to pass user id from  backend too.
  const orders = useSelector((state: RootState) => state.orders.activeOrders.filter(order => order.operator.email === user.email));

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const currentDate = new Date().toLocaleDateString();

  return (
    <Box p={4}>
      <Text fontSize="lg">You have the following lots to treat today, {currentDate}</Text>
      <TableContainer mt={4}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Crop</Th>
              <Th>Lot Number</Th>
              <Th>Products to Apply</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map(order => (
              <Tr key={order.id}>
                <Td>{order.crop.name}</Td>
                <Td>{order.lotNumber}</Td>
                <Td>{order.productDetails.map(pd => pd.product?.name).join(', ')}</Td>
                <Td>
                  <Button size="sm" onClick={() => navigate(`/order-execution/${order.id}`)}>Execute</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Execution;