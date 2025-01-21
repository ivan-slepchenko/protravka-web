import React from 'react';
import { Box, Grid, Badge, Text, HStack } from '@chakra-ui/react';
import { Order, OrderStatus } from '../store/newOrderSlice';

interface RawOrderCardProps {
    order: Order;
    onClick: () => void;
}

const RawOrderCard: React.FC<RawOrderCardProps> = ({ order, onClick }) => {
    const getStatusLabel = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.ForLabToInitiate:
                return { label: 'New Recipe', color: 'blue.200' };
            case OrderStatus.ByLabInitiated:
            case OrderStatus.ReadyToStart:
            case OrderStatus.InProgress:
            case OrderStatus.ForLabToControl:
                return { label: 'In Treatment', color: 'green.200' };
            default:
                return { label: '', color: '' };
        }
    };

    const { label, color } = getStatusLabel(order.status);

    return (
        <Box
            borderColor={'gray.200'}
            borderWidth={1}
            borderStyle={'solid'}
            borderRadius="md"
            p={2}
            w="full"
            cursor="pointer"
            onClick={onClick}
            bg={color}
        >
            <Grid templateColumns="1fr 3fr" gap={2} fontSize="sm">
                <HStack justifyContent="space-between" gridColumn="span 3">
                    <Text fontWeight="bold">{order.lotNumber}</Text>
                    <Badge colorScheme={color === 'blue.200' ? 'blue' : 'green'}>{label}</Badge>
                </HStack>
                <Badge gridColumn="span 3" colorScheme="gray">
                    {order.crop?.name}, {order.variety?.name}
                </Badge>
                <Text px={1} gridColumn="span 3" color="gray.600">
                    Lot: {order.lotNumber}
                </Text>
                <Text px={1} gridColumn="span 2">Seeds To Treat:</Text>
                <Text px={1} isTruncated>{order.seedsToTreatKg}{' kg'}</Text>
            </Grid>
        </Box>
    );
};

export default RawOrderCard;
