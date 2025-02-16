import React from "react";
import { Box, Text, Grid } from "@chakra-ui/react";
import { Order, Packaging } from "../../store/newOrderSlice";
import { useTranslation } from 'react-i18next';

const OrderInformation: React.FC<{ order: Order }> = ({ order }) => {
    const { t } = useTranslation();

    return (
        <Box border="1px" borderColor="gray.200" p="4" borderRadius="md" w="full">
            <Text fontSize="md" fontWeight="bold" mb="2">{t('order_information.recipe_information')}</Text>
            <Grid templateColumns="repeat(4, 1fr)" gap="1" borderColor="gray.200">
                <Box>
                    <Text fontSize="xs">{t('order_information.recipe_creation_date')}:</Text>
                    <Text>{order.creationDate}</Text>
                </Box>
                <Box>
                    <Text fontSize="xs">{t('order_information.application_date')}:</Text>
                    <Text>{order.applicationDate}</Text>
                </Box>
                <Box>
                    <Text fontSize="xs">{t('order_information.operator')}:</Text>
                    <Text>{order.operator ? `${order.operator.name} ${order.operator.surname}` : t('order_information.undefined')}</Text>
                </Box>
                <Box>
                    <Text fontSize="xs">{t('order_information.crop')}:</Text>
                    <Text>{order.crop.name}</Text>
                </Box>
                <Box>
                    <Text fontSize="xs">{t('order_information.variety')}:</Text>
                    <Text>{order.variety.name}</Text>
                </Box>
                <Box>
                    <Text fontSize="xs">{t('order_information.tkw')}:</Text>
                    <Text>{order.tkw}</Text>
                </Box>
                <Box>
                    <Text fontSize="xs">{t('order_information.seeds_to_treat')}:</Text>
                    <Text>{order.seedsToTreatKg}</Text>
                </Box>
                <Box>
                    <Text fontSize="xs">{order.packaging === Packaging.InSeeds ? t('order_information.bag_size_seeds') : t('order_information.bag_size_kg')}</Text>
                    <Text>{order.bagSize}</Text>
                </Box>
            </Grid>
        </Box>
    );
};

export default OrderInformation;