
import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

const OrderExecution = () => {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <Box p={4}>
      <Text fontSize="2xl" fontWeight="bold">Order Execution</Text>
      <Text>Executing order ID: {orderId}</Text>
    </Box>
  );
};

export default OrderExecution;