import React from "react";
import { Box, Text, Grid } from "@chakra-ui/react";
import { Order, Packaging } from "../../store/newOrderSlice";

const packagingMap = {
    [Packaging.InSeeds]: "In Seeds",
    [Packaging.InKg]: "In Kg",
};

const OrderInformation: React.FC<{ order: Order }> = ({ order }) => (
    <Box border="1px" borderColor="gray.200" p="4" borderRadius="md" w="full">
        <Text fontSize="md" fontWeight="bold" mb="2">Order Information</Text>
        <Grid templateColumns="repeat(4, 1fr)" gap="1" borderColor="gray.200">
            <Box>
                <Text fontSize="xs">Recipe Creation Date:</Text>
                <Text>{order.recipeDate}</Text>
            </Box>
            <Box>
                <Text fontSize="xs">Application Date:</Text>
                <Text>{order.applicationDate}</Text>
            </Box>
            <Box>
                <Text fontSize="xs">Operator:</Text>
                <Text>{order.operator ? `${order.operator.name} ${order.operator.surname}` : "undefined"}</Text>
            </Box>
            <Box>
                <Text fontSize="xs">Crop:</Text>
                <Text>{order.crop.name}</Text>
            </Box>
            <Box>
                <Text fontSize="xs">Variety:</Text>
                <Text>{order.variety.name}</Text>
            </Box>
            <Box>
                <Text fontSize="xs">TKW (g):</Text>
                <Text>{order.tkw}</Text>
            </Box>
            <Box>
                <Text fontSize="xs">Seeds To Treat (kg):</Text>
                <Text>{order.seedsToTreatKg}</Text>
            </Box>
            <Box>
                <Text fontSize="xs">{order.packaging === Packaging.InSeeds ? "Bag Size (K/Seeds)" : "Bag Size (Kg)"}</Text>
                <Text>{order.bagSize}</Text>
            </Box>
        </Grid>
    </Box>
);

export default OrderInformation;