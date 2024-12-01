import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, IconButton, Text, VStack } from '@chakra-ui/react';
import { FiArrowRight } from 'react-icons/fi';

const currentDate = new Date().toLocaleDateString();

interface OrdersOverviewProps {
  orders: Array<{
    id: string;
    crop: { name: string };
    lotNumber: string;
    productDetails: Array<{ product?: { id: string; name: string } }>;
  }>;
  onOrderClick: (orderId: string) => void;
}

const OrdersOverview: React.FC<OrdersOverviewProps> = ({ orders, onOrderClick }) => {
    return (
        <VStack>
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
                                        onClick={() => onOrderClick(order.id)}
                                    />
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>   
        </VStack>
    );
};

export default OrdersOverview;