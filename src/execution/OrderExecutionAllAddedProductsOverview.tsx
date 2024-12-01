
import React from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Tfoot, Button, VStack } from '@chakra-ui/react';

const OrderExecutionAllAddedProductsOverview = () => {
    const placeholderData = [
        { name: 'Product 1', targetQty: 'xxx', actualQty: 'xxx' },
        { name: 'Product 2', targetQty: 'xxx', actualQty: 'xxx' },
    // Add more placeholder data as needed
    ];

    const totalTargetQty = placeholderData.reduce((total, item) => total + parseFloat(item.targetQty), 0);
    const totalActualQty = placeholderData.reduce((total, item) => total + parseFloat(item.actualQty), 0);

    return (
        <Box p={4}>
            <VStack spacing={8} align="stretch">
                <Text fontSize="2xl" fontWeight="bold" textAlign="center">You added all products.</Text>
                <Table variant="simple" mt={4} border="1px solid" borderColor="gray.200">
                    <Thead bg="orange.100">
                        <Tr>
                            <Th>Product name</Th>
                            <Th>Target Qty, kg</Th>
                            <Th>Actual Qty, kg</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {placeholderData.map((item, index) => (
                            <Tr key={index} bg={index % 2 === 0 ? 'gray.50' : 'white'}>
                                <Td>{item.name}</Td>
                                <Td>{item.targetQty}</Td>
                                <Td>{item.actualQty}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                    <Tfoot>
                        <Tr>
                            <Th>Total</Th>
                            <Th>{totalTargetQty}</Th>
                            <Th>{totalActualQty}</Th>
                        </Tr>
                    </Tfoot>
                </Table>
                <Text fontSize="lg" textAlign="center">Swipe to start treatment now.</Text>
                <Button colorScheme="orange" borderRadius="full" _hover={{ backgroundColor: 'orange.200' }}>
          Next
                </Button>
            </VStack>
        </Box>
    );
};

export default OrderExecutionAllAddedProductsOverview;