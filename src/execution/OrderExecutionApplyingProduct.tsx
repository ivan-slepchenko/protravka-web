import React from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Button, VStack } from '@chakra-ui/react';
import { OrderExecutionPage } from './OrderExecutionPage';

const OrderExecutionApplyingProduct = () => {
    return (
        <Box p={4}>
            <VStack spacing={8} align="stretch">
                <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} justifyContent="space-between">
                    <Box border="1px solid" borderColor="green.300" borderRadius="md" p={4} flex="1" m={2}>
                        <Text fontSize="xl" fontWeight="bold" mb={4}>Slurry</Text>
                        <Text mb={4}>Product name #... out of ...</Text>
                        <Table variant="simple" mb={4}>
                            <Thead bg="orange.100">
                                <Tr>
                                    <Th>Target rate, kg</Th>
                                    <Th>Actual rate, kg</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>xxx</Td>
                                    <Td>xxx</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                        <Text mb={4}>You are obliged to make a photo of scales display on the next page!</Text>
                        <Button colorScheme="orange" borderRadius="full" _hover={{ backgroundColor: 'orange.200' }}>
              Make Photo
                        </Button>
                    </Box>
                    <Box border="1px solid" borderColor="green.300" borderRadius="md" p={4} flex="1" m={2}>
                        <Text fontSize="xl" fontWeight="bold" mb={4}>CDS</Text>
                        <Text mb={4}>Product name #... out of ...</Text>
                        <Table variant="simple" mb={4}>
                            <Thead bg="orange.100">
                                <Tr>
                                    <Th>Target rate, kg</Th>
                                    <Th>Machine Setting, kg</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>xxx</Td>
                                    <Td>xxx</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                        <Text mb={4}>You are obliged to make a photo of scales display on the next page!</Text>
                        <Button colorScheme="orange" borderRadius="full" _hover={{ backgroundColor: 'orange.200' }}>
              Make Photo
                        </Button>
                    </Box>
                </Box>
            </VStack>
        </Box>
    );
};

export default OrderExecutionApplyingProduct;