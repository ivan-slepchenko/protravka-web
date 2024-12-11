
import React from "react";
import { Box, Text, HStack } from "@chakra-ui/react";
import OrderInformation from "./OrderInformation";
import RecipeInformation from "./RecipeInformation";
import ProductDetails from "./ProductDetails";
import { Order } from "../../store/newOrderSlice";

interface OrderRecipeTabProps {
    order: Order;
}

const OrderRecipeTab: React.FC<OrderRecipeTabProps> = ({ order }) => {
    return (
        <Box w="full">
            <HStack w="full">
                <OrderInformation order={order} />
                <RecipeInformation order={order} />
            </HStack>
            <Text fontSize="md" fontWeight="bold" mt="4" mb="2">Product Details</Text>
            <ProductDetails order={order} />
        </Box>
    );
};

export default OrderRecipeTab;