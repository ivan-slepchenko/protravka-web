import React, { useEffect } from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, TableContainer, IconButton } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchOrders } from '../store/ordersSlice';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

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
    <Box p={2}>
      <Text py={2} px={2} fontSize="lg">You have the following lots to treat today, {currentDate}</Text>
      <TableContainer mt={4} w="full">
        <Table variant="simple" size="sm" w="full">
          <Thead>
            <Tr>
              <Th>Crop</Th>
              <Th>Lot</Th>
              <Th>Products</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map(order => (
              <Tr key={order.id}>
                <Td>{order.crop.name}</Td>
                <Td>{order.lotNumber}</Td>
                <Td>
                  {order.productDetails.map(pd => (
                    <Text key={pd.product?.id} fontSize="sm">{pd.product?.name}</Text>
                  ))}
                </Td>
                <Td>
                  <IconButton
                    aria-label="Go"
                    icon={<FiArrowRight />}
                    size="xs"
                    onClick={() => navigate(`/order-execution/${order.id}`)}
                  />
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