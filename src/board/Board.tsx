import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { OrderStatus } from '../store/newOrderSlice';
import { Box, Flex, Heading, VStack } from '@chakra-ui/react';
import { useFeatures } from '../contexts/FeaturesContext';
import Card from './Card';

const Board: React.FC = () => {
    const features = useFeatures();
    const COMMPLETED_COLUMN = 'Completed';
    const columns = features.features.lab
        ? [OrderStatus.LabAssignmentCreated, OrderStatus.TKWConfirmed, OrderStatus.RecipeCreated, OrderStatus.TreatmentInProgress, OrderStatus.LabControl, OrderStatus.ToAcknowledge, COMMPLETED_COLUMN]
        : [OrderStatus.RecipeCreated, OrderStatus.TreatmentInProgress, OrderStatus.ToAcknowledge, COMMPLETED_COLUMN];
    const orders = useSelector((state: RootState) => state.orders.activeOrders);

    console.log('Orders:', orders);

    return (
        <Flex w="full" justifyContent={'center'} h="100vh">
            <Flex p={5} gap={3} w="full" >
                {columns.map((column) => {
                    const bgColor = "gray.50";
                    return (
                        <Box key={column} w="full" border="gray.100" borderRadius="md" p={2} bg={bgColor}>
                            <Heading size="sm" m={1} mb={2}>{column}</Heading>
                            <VStack spacing={3} w="full">
                                {orders.filter(order => {
                                    if (column === COMMPLETED_COLUMN) {
                                        console.log('Order:', order);
                                        return order.status === OrderStatus.Completed || order.status === OrderStatus.Failed;
                                    } else {
                                        return order.status === column
                                    }
                                }).map((order, index) => (
                                    <Card key={index} order={order} />
                                ))}
                            </VStack>
                        </Box>
                    );
                })}
            </Flex>
        </Flex>
    );
};

export default Board;