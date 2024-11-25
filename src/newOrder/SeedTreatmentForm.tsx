import React, { useEffect } from "react";
import { Box, Button, HStack, Text, Grid, Input, Select, InputGroup, InputRightElement, Stack, RadioGroup, Radio } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import {
  addProductDetail,
  setOrderState,
  createNewEmptyOrder,
  createNewEmptyProduct,
  updateRecipeDate,
  updateApplicationDate,
  updateOperator,
  updateCrop,
  updateVariety,
  updateLotNumber,
  updateTkw,
  updateQuantity,
  updateProductDetail,
  updatePackaging,
  updateBagSize,
  ProductDetail
} from "../store/newOrderSlice";
import { createOrder, fetchOrders } from "../store/ordersSlice";
import { fetchOperators } from "../store/operatorsSlice";

const SeedTreatmentForm: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.newOrder);
  const operators = useSelector((state: RootState) => state.operators.operators);
  const selectedOperator = useSelector((state: RootState) => state.newOrder.operator);

  useEffect(() => {
    dispatch(fetchOperators());
  }, [dispatch]);

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

  const handleRecipeDateChange = (value: string) => {
    dispatch(updateRecipeDate(value));
  };

  const handleApplicationDateChange = (value: string) => {
    dispatch(updateApplicationDate(value));
  };

  const handleOperatorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const operator = operators.find(op => op.id === event.target.value);
    if (operator) {
      dispatch(updateOperator(operator));
    }
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

  const handleProductChange = (index: number, name: keyof ProductDetail, value: string) => {
    const updatedProduct = { ...formData.productDetails[index], [name]: value };
    dispatch(updateProductDetail(updatedProduct));
  };

  const handlePackagingChange = (value: string) => {
    dispatch(updatePackaging(value));
  };

  const handleBagSizeChange = (value: number) => {
    dispatch(updateBagSize(value));
  };

  return (
    <Box width="800px" mx="auto" p="2" bg="white" boxShadow="md" borderRadius="md">
      <Text fontSize="lg" fontWeight="bold" textAlign="center" mb="1">
        Remington Seeds
      </Text>

      {/* Recipe Info */}
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
            value={selectedOperator.id}
            onChange={handleOperatorChange}
            placeholder="Select operator"
            size="xs"
          >
            {operators.map((operator) => (
              <option key={operator.id} value={operator.id}>
                {operator.name} {operator.surname}
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

      {/* Packaging Options */}
      <Box mb="2">
        <Text fontSize="xs" mb="1">How do you want to pack it?</Text>
        <HStack>
          <RadioGroup
            width="300px"
            name="packaging"
            value={formData.packaging}
            onChange={(e) => handlePackagingChange(e)}
          >
            <Stack direction="row" spacing="1">
              <Radio value="inSeeds" size="xs">in s/units</Radio>
              <Radio value="inKg" size="xs">in kg</Radio>
            </Stack>
          </RadioGroup>
          <Text flexShrink={0} fontSize="xs">Bag size (K/Seeds):</Text>
          <Input
            name="bagSize"
            value={formData.bagSize}
            onChange={(e) => handleBagSizeChange(parseFloat(e.target.value))}
            placeholder="80"
            size="xs"
          />
        </HStack>
      </Box>

      {/* Product Details */}
      {formData.productDetails.map((productDetail, index) => (
        <Box key={index} border="1px solid" borderColor="gray.200" p="2" borderRadius="md" mb="2">
          <Grid w="full" templateColumns="2fr 1fr 2fr" gap="1" alignItems="center" mb="2">
            <Box>
              <Text fontSize="xs">Product name:</Text>
              <Select
                name={`productName${index}`}
                value={productDetail.name}
                onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                placeholder="Select product"
                size="xs"
                focusBorderColor="transparent"
              >
                <option value="force-zea-260-fs">Force Zea 260 FS</option>
                <option value="product-2">Product 2</option>
                <option value="product-3">Product 3</option>
              </Select>
            </Box>
            <Box>
              <Text fontSize="xs">Density (g/ml):</Text>
              <Input
                name={`density${index}`}
                value={productDetail.density}
                onChange={(e) => handleProductChange(index, 'density', e.target.value)}
                size="xs"
              />
            </Box>
            <Box>
              <Text fontSize="xs">
                {productDetail.rateType === "unit" ? `Rate per unit (${productDetail.rateUnit}):` : `Rate per 100kg (${productDetail.rateUnit}):`}
              </Text>
              <InputGroup size="xs">
                <Input
                  name={`rate${productDetail.rateType}${productDetail.rateUnit}${index}`}
                  value={productDetail.rate}
                  onChange={(e) => handleProductChange(index, 'rate', e.target.value)}
                  placeholder="Enter rate"
                />
                <InputRightElement width="auto">
                  <HStack spacing="0">
                    <Select
                      width="110px"
                      name={`rateType${index}`}
                      value={productDetail.rateType}
                      onChange={(e) => handleProductChange(index, 'rateType', e.target.value)}
                      size="xs"
                      fontWeight="bold"
                      bg="gray.50"
                      border="1px solid"
                      borderColor="gray.300"
                      focusBorderColor="transparent"
                    >
                      <option value="unit">per unit</option>
                      <option value="100kg">per 100kg</option>
                    </Select>
                    <Select
                      width="110px"
                      name={`rateUnit${index}`}
                      value={productDetail.rateUnit}
                      onChange={(e) => handleProductChange(index, 'rateUnit', e.target.value)}
                      size="xs"
                      fontWeight="bold"
                      bg="gray.50"
                      border="1px solid"
                      borderColor="gray.300"
                      focusBorderColor="transparent"
                    >
                      <option value="ml">ml</option>
                      <option value="g">g</option>
                    </Select>
                  </HStack>
                </InputRightElement>
              </InputGroup>
            </Box>
          </Grid>
        </Box>
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