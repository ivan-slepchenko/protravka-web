
import React from "react";
import { Box, Grid, Input, Select, Text } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import {
  updateRecipeDate,
  updateApplicationDate,
  updateOperator,
  updateCrop,
  updateVariety,
  updateLotNumber,
  updateTkw,
  updateQuantity,
} from "../store/newOrderSlice";

const RecipeInfo: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.newOrder);

  const handleRecipeDateChange = (value: string) => {
    dispatch(updateRecipeDate(value));
  };

  const handleApplicationDateChange = (value: string) => {
    dispatch(updateApplicationDate(value));
  };

  const handleOperatorChange = (value: string) => {
    dispatch(updateOperator(value));
  };

  const handleCropChange = (value: string) => {
    dispatch(updateCrop(value));
  };

  const handleVarietyChange = (value: string) => {
    dispatch(updateVariety(value));
  };

  const handleLotNumberChange = (value: string) => {
    dispatch(updateLotNumber(value));
  };

  const handleTkwChange = (value: number) => {
    dispatch(updateTkw(value));
  };

  const handleQuantityChange = (value: number) => {
    dispatch(updateQuantity(value));
  };

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap="1" mb="2">
      <Box>
        <Text fontSize="xs">Recipe creation date:</Text>
        <Input
          type="date"
          name="recipeDate"
          value={formData.recipeDate}
          onChange={(e) => handleRecipeDateChange(e.target.value)}
          size="xs"
        />
      </Box>
      <Box>
        <Text fontSize="xs">Application date:</Text>
        <Input
          type="date"
          name="applicationDate"
          value={formData.applicationDate}
          onChange={(e) => handleApplicationDateChange(e.target.value)}
          size="xs"
        />
      </Box>
      <Box>
        <Text fontSize="xs">Operator:</Text>
        <Select
          name="operator"
          value={formData.operator}
          onChange={(e) => handleOperatorChange(e.target.value)}
          placeholder="Select operator"
          size="xs"
        >
          {["askold", "john_doe", "jane_smith"].map((operator) => (
            <option key={operator} value={operator}>
              {operator}
            </option>
          ))}
        </Select>
      </Box>
      <Box>
        <Text fontSize="xs">Crop:</Text>
        <Select
          name="crop"
          value={formData.crop}
          onChange={(e) => handleCropChange(e.target.value)}
          placeholder="Select crop"
          size="xs"
        >
          {["corn", "wheat", "soybean"].map((crop) => (
            <option key={crop} value={crop}>
              {crop}
            </option>
          ))}
        </Select>
      </Box>
      <Box>
        <Text fontSize="xs">Variety:</Text>
        <Input
          name="variety"
          value={formData.variety}
          onChange={(e) => handleVarietyChange(e.target.value)}
          size="xs"
        />
      </Box>
      <Box>
        <Text fontSize="xs">Lot Number:</Text>
        <Input
          name="lotNumber"
          value={formData.lotNumber}
          onChange={(e) => handleLotNumberChange(e.target.value)}
          size="xs"
        />
      </Box>
      <Box>
        <Text fontSize="xs">TKW (g):</Text>
        <Input
          name="tkw"
          value={formData.tkw}
          onChange={(e) => handleTkwChange(parseFloat(e.target.value))}
          size="xs"
        />
      </Box>
      <Box>
        <Text fontSize="xs">Quantity to treat (kg):</Text>
        <Input
          name="quantity"
          value={formData.quantity}
          onChange={(e) => handleQuantityChange(parseFloat(e.target.value))}
          size="xs"
        />
      </Box>
    </Grid>
  );
};

export default RecipeInfo;