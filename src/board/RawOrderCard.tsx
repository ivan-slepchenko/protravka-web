import React from 'react';
import { Box, Grid, Badge, Text } from '@chakra-ui/react';
import { Order, OrderStatus } from '../store/newOrderSlice';

interface RawOrderCardProps {
    order: Order;
    onClick: () => void;
}

const RawOrderCard: React.FC<RawOrderCardProps> = ({ order, onClick }) => {
    const cardColor = "white";

    return (
        <Box
            borderColor={'gray.200'}
            borderWidth={1}
            borderStyle={'solid'}
            borderRadius="md"
            p={2}
            w="full"
            cursor={order.status === OrderStatus.ForLabToInitiate ? "pointer" : "default"}
            onClick={onClick}
            bg={cardColor}
        >
            <Grid templateColumns="1fr 3fr" gap={2} fontSize="sm">
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
