import React from 'react';
import { Box, Grid, Badge, Text, HStack } from '@chakra-ui/react';
import { Order } from '../store/newOrderSlice';
import { useTranslation } from 'react-i18next';

interface RawOrderCardProps {
    order: Order;
    onClick: () => void;
}

const RawOrderCard: React.FC<RawOrderCardProps> = ({ order, onClick }) => {
    const { t } = useTranslation();

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
        >
            <Grid templateColumns="1fr 3fr" gap={2} fontSize="sm">
                <Badge colorScheme='blue' gridColumn="span 3">
                    <HStack w="full" justifyContent='space-between'>
                        <Text isTruncated>
                            {order.crop?.name}, {order.variety?.name}
                        </Text>
                        <Text>
                            {t('raw_order_card.new_recipe')}
                        </Text>
                    </HStack>
                </Badge>
                <Text px={1} gridColumn="span 2" color="gray.600">{t('raw_order_card.lot')}:</Text>
                <Text px={1} isTruncated>{order.lotNumber}</Text>
                <Text px={1} gridColumn="span 2" color="gray.600">{t('raw_order_card.seeds_to_treat')}:</Text>
                <Text px={1} isTruncated>{order.seedsToTreatKg}{' kg'}</Text>
                <Box gridColumn="span 3">
                    <Text px={1} color="gray.600" fontSize="xs" borderTop={1} borderStyle={'solid'} borderColor={'gray.400'}>{t('raw_order_card.assignment_date')}:</Text>
                    <Text px={1} isTruncated>{order.creationDate === null ? 'N/A' : new Date(order.creationDate).toLocaleString()}</Text>
                </Box>
            </Grid>
        </Box>
    );
};

export default RawOrderCard;
