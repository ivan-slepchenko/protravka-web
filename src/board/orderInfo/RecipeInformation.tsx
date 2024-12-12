
import React from "react";
import { Box, Text, Grid } from "@chakra-ui/react";
import { Order } from "../../store/newOrderSlice";

const RecipeInformation: React.FC<{ order: Order }> = ({ order }) => (
    <Box border="1px" borderColor="gray.200" p="4" borderRadius="md" w="full">
        <Text fontSize="md" fontWeight="bold" mb="2">Recipe Information</Text>
        <Grid templateColumns="repeat(2, 1fr)" gap="1" borderColor="gray.200">
            <Box>
                <Text fontSize="xs">Total Compounds Density:</Text>
                <Text>{order.orderRecipe.totalCompoundsDensity.toFixed(2)}</Text>
            </Box>
            <Box>
                <Text fontSize="xs">Slurry Total (ml/U/KS):</Text>
                <Text>{order.orderRecipe.slurryTotalMltoU_KS.toFixed(2)}</Text>
            </Box>
            <Box>
                <Text fontSize="xs">Slurry Total (g/U/KS):</Text>
                <Text>{order.orderRecipe.slurryTotalGToU_KS.toFixed(2)}</Text>
            </Box>
            <Box>
                <Text fontSize="xs">Slurry Total (ml/100kg):</Text>
                <Text>{order.orderRecipe.slurryTotalMlTo100Kg.toFixed(2)}</Text>
            </Box>
            <Box>
                <Text fontSize="xs">Slurry Total (g/100kg):</Text>
                <Text>{order.orderRecipe.slurryTotalGTo100Kgs.toFixed(2)}</Text>
            </Box>
            <Box>
                <Text fontSize="xs">Slurry Total (ml Recipe/Mix):</Text>
                <Text>{order.orderRecipe.slurryTotalMlRecipeToMix.toFixed(2)}</Text>
            </Box>
            <Box>
                <Text fontSize="xs">Slurry Total (kg Recipe/Weight):</Text>
                <Text>{order.orderRecipe.slurryTotalGrRecipeToMix.toFixed(2)}</Text>
            </Box>
            <Box>
                <Text fontSize="xs">Extra Slurry (Pipes/Pump Feeding ml):</Text>
                <Text>{order.orderRecipe.extraSlurryPipesAndPompFeedingMl.toFixed(2)}</Text>
            </Box>
            <Box>
                <Text fontSize="xs">Number of Seed Units:</Text>
                <Text>{order.orderRecipe.nbSeedsUnits.toFixed(2)}</Text>
            </Box>
        </Grid>
    </Box>
);

export default RecipeInformation;