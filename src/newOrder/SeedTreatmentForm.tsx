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
  ProductDetail,
  NewOrder
} from "../store/newOrderSlice";
import { createOrder, fetchOrders } from "../store/ordersSlice";
import { fetchOperators } from "../store/operatorsSlice";
import { fetchCrops } from "../store/cropsSlice";

const SeedTreatmentForm: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.newOrder as NewOrder);
  const operators = useSelector((state: RootState) => state.operators.operators);
  const selectedOperator = useSelector((state: RootState) => state.newOrder.operator);
  const crops = useSelector((state: RootState) => state.crops.crops);
  const selectedCrop = useSelector((state: RootState) => state.newOrder.crop);
  const selectedVariety = useSelector((state: RootState) => state.newOrder.variety);

  useEffect(() => {
    dispatch(fetchOperators());
    dispatch(fetchCrops());
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

  const handleCropChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const crop = crops.find(c => c.id === event.target.value);
    if (crop) {
      dispatch(updateCrop(crop));
    }
  };

  const handleVarietyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if(selectedCrop === undefined) {
      throw new Error("Crop is not selected");
    }
    const variety = selectedCrop.varieties.find(v => v.id === event.target.value);
    if (variety) {
      dispatch(updateVariety(variety));
    }
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
            value={selectedOperator?.id ?? undefined}
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
            value={selectedCrop?.id || ""}
            onChange={handleCropChange}
            placeholder="Select crop"
            size="xs"
          >
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name}
              </option>
            ))}
          </Select>
        </Box>
        <Box>
          <Text fontSize="xs">Variety:</Text>
          <Select
            name="variety"
            value={selectedVariety?.id || ""}
            onChange={handleVarietyChange}
            disabled={selectedCrop === undefined}
            placeholder={selectedCrop === undefined ? "Select crop first" : "Select variety"}
            size="xs"
          >
            {selectedCrop?.varieties.map((variety) => (
              <option key={variety.id} value={variety.id}>
                {variety.name}
              </option>
            ))}
          </Select>
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
          <InputGroup size="xs">
            <Input
              name="bagSize"
              value={formData.bagSize}
              onChange={(e) => handleBagSizeChange(parseFloat(e.target.value))}
              placeholder="80"
            />
            <InputRightElement width="auto">
              <Select
                name="packaging"
                value={formData.packaging}
                onChange={(e) => handlePackagingChange(e.target.value)}
                size="xs"
                fontWeight="bold"
                bg="gray.50"
                border="1px solid"
                borderColor="gray.300"
                focusBorderColor="transparent"
              >
                <option value="inSeeds">in s/units</option>
                <option value="inKg">in kg</option>
              </Select>
            </InputRightElement>
          </InputGroup>
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