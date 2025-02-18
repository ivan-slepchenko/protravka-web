import { Box, HStack } from "@chakra-ui/react";
import OrderInformation from "./OrderInformation";
import ProductDetails from "./ProductDetails";
import { Order } from "../../store/newOrderSlice";
import { FC } from "react";

interface OrderRecipeTabProps {
    order: Order;
}

const OrderRecipeTab: FC<OrderRecipeTabProps> = ({ order }) => {
    return (
        <Box w="full">
            <HStack w="full">
                <OrderInformation order={order} />
            </HStack>
            <ProductDetails order={order} />
        </Box>
    );
};

export default OrderRecipeTab;