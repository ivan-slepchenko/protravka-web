import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { OrderStatus } from '../store/newOrderSlice';
import { Flex, Heading, VStack } from '@chakra-ui/react';
import Card from './Card';
import { useTranslation } from 'react-i18next';

const Board: React.FC = () => {
    const { t } = useTranslation();
    const user = useSelector((state: RootState) => state.user);
    const useLab = user.company?.featureFlags.useLab;

    const COMPLETED_COLUMN = 'Completed';
    const columns = useLab
        ? [OrderStatus.LabAssignmentCreated, OrderStatus.TkwConfirmed, OrderStatus.RecipeCreated, OrderStatus.TreatmentInProgress, OrderStatus.LabToControl, OrderStatus.ToAcknowledge, COMPLETED_COLUMN]
        : [OrderStatus.RecipeCreated, OrderStatus.TreatmentInProgress, OrderStatus.ToAcknowledge, COMPLETED_COLUMN];
    const orders = useSelector((state: RootState) => state.orders.activeOrders);

    console.log('Orders:', orders);

    return (
        <Flex w="full" justifyContent={'center'} h="100vh" p={2} overflow={'auto'} >
            <Flex gap={3} w="full" p={2}  h='min-content' overflow={'auto'}>
                {columns.map((column) => {
                    const bgColor = "gray.50";
                    return (
                        <VStack key={column}  minW="310px" w='full' minH='min-content' border="gray.100" borderRadius="md" p={2} bg={bgColor}>
                            <Heading size="sm" m={1} mb={2}>{t(`board.${column.toLowerCase().replace(/\s+/g, '_')}`)}</Heading>
                            <VStack spacing={3} w="full">
                                {orders.filter(order => {
                                    if (column === COMPLETED_COLUMN) {
                                        return order.status === OrderStatus.Completed || order.status === OrderStatus.Failed;
                                    } else {
                                        return order.status === column
                                    }
                                }).map((order, index) => (
                                    <Card key={index} order={order} />
                                ))}
                            </VStack>
                        </VStack>
                    );
                })}
            </Flex>
        </Flex>
    );
};

export default Board;