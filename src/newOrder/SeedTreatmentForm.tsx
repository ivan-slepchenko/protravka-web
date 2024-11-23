import React from "react";
import { Box, Button, HStack, Text } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import {
  addProductDetail,
  setOrderState,
  createNewEmptyOrder,
  createNewEmptyProduct,
} from "../store/newOrderSlice";
import { createOrder, fetchOrders } from "../store/ordersSlice";
import ProductDetails from "./ProductDetails";
import PackagingOptions from "./PackagingOptions";
import RecipeInfo from "./RecipeInfo";

const SeedTreatmentForm: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.newOrder);

  const handleSave = () => {
    dispatch(createOrder(formData));
    dispatch(fetchOrders());
    dispatch(setOrderState(createNewEmptyOrder()));
  };

  const handleClearAll = () => {
    dispatch(setOrderState(createNewEmptyOrder()));
  };

  const addProduct = () => {
    dispatch(addProductDetail(createNewEmptyProduct()));
  };

  return (
    <Box width="800px" mx="auto" p="2" bg="white" boxShadow="md" borderRadius="md">
      <Text fontSize="lg" fontWeight="bold" textAlign="center" mb="1">
        Remington Seeds
      </Text>

      <RecipeInfo />
      <PackagingOptions />

      {/* Product Details */}
      {formData.productDetails.map((_, index) => (
        <ProductDetails
          key={index}
          index={index}
        />
      ))}
      <HStack>
        <Button colorScheme="blue" size="xs" onClick={addProduct} ml="auto" mb={2}>+ Add Product</Button>
      </HStack>
    
      {/* Action Buttons */}
      <HStack justifyContent="flex-end" spacing="2" mb="2">
        <Button colorScheme="yellow" size="xs" onClick={handleClearAll}>Clear All</Button>
        <Button colorScheme="green" size="xs" onClick={handleSave}>Done</Button>
      </HStack>
    </Box>
  );
};

export default SeedTreatmentForm;