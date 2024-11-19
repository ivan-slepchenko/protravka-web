import React, { useEffect } from "react";
import {
  Box,
  Grid,
  Input,
  Button,
  Select,
  Text,
  Radio,
  RadioGroup,
  Stack,
  HStack,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import {
  addProductDetail,
  updateProductDetail,
  updateField,
  setOrderState,
  ProductDetail,
  OrderStatus,
  Order,
} from "../store/newOrderSlice";

const ProductDetails: React.FC<{ index: number }> = ({ index }) => {
  const dispatch: AppDispatch = useDispatch();
  const productDetail = useSelector((state: RootState) => state.newOrder.productDetails[index]);
  const rateLabel = productDetail.rateType === "unit" ? `Rate per unit (${productDetail.rateUnit}):` : `Rate per 100kg (${productDetail.rateUnit}):`;

  const handleProductChange = (name: keyof ProductDetail, value: string) => {
    const updatedProduct = { ...productDetail, [name]: value };
    dispatch(updateProductDetail(updatedProduct));
  };

  return (
    <Box border="1px solid" borderColor="gray.200" p="2" borderRadius="md" mb="2">
      <Grid w="full" templateColumns="2fr 1fr 2fr" gap="1" alignItems="center" mb="2">
        <Box>
          <Text fontSize="xs">Product name:</Text>
          <Select
            name={`productName${index}`}
            value={productDetail.name}
            onChange={(e) => handleProductChange('name', e.target.value)}
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
            onChange={(e) => handleProductChange('density', e.target.value)}
            size="xs"
          />
        </Box>
        <Box>
          <Text fontSize="xs">{rateLabel}</Text>
          <InputGroup size="xs">
            <Input
              name={`rate${productDetail.rateType}${productDetail.rateUnit}${index}`}
              value={productDetail.rate}
              onChange={(e) => handleProductChange('rate', e.target.value)}
              placeholder="Enter rate"
            />
            <InputRightElement width="auto">
              <HStack spacing="0">
                <Select
                  width="110px"
                  name={`rateType${index}`}
                  value={productDetail.rateType}
                  onChange={(e) => handleProductChange('rateType', e.target.value)}
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
                  onChange={(e) => handleProductChange('rateUnit', e.target.value)}
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
  );
};

const PackagingOptions: React.FC<{ handleChange: (name: keyof Order, value: string) => void }> = ({ handleChange }) => {
  const formData = useSelector((state: RootState) => state.newOrder);

  return (
    <Box mb="2">
      <Text fontSize="xs" mb="1">How do you want to pack it?</Text>
      <HStack>
        <RadioGroup
          width="300px"
          name="packaging"
          value={formData.packaging}
          onChange={(value) => handleChange("packaging", value)}
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
          onChange={(e) => handleChange("bagSize", e.target.value)}
          placeholder="80"
          size="xs"
        />
      </HStack>
    </Box>
  );
};

const RecipeInfo: React.FC<{ handleChange: (name: keyof Order, value: string) => void }> = ({ handleChange }) => {
  const formData = useSelector((state: RootState) => state.newOrder);

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap="1" mb="2">
      <Box>
        <Text fontSize="xs">Recipe creation date:</Text>
        <Input
          type="date"
          name="recipeDate"
          value={formData.recipeDate}
          onChange={(e) => handleChange("recipeDate", e.target.value)}
          size="xs"
        />
      </Box>
      <Box>
        <Text fontSize="xs">Application date:</Text>
        <Input
          type="date"
          name="applicationDate"
          value={formData.applicationDate}
          onChange={(e) => handleChange("applicationDate", e.target.value)}
          size="xs"
        />
      </Box>
      <Box>
        <Text fontSize="xs">Operator:</Text>
        <Select
          name="operator"
          value={formData.operator}
          onChange={(e) => handleChange("operator", e.target.value)}
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
          onChange={(e) => handleChange("crop", e.target.value)}
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
          onChange={(e) => handleChange("variety", e.target.value)}
          size="xs"
        />
      </Box>
      <Box>
        <Text fontSize="xs">Lot Number:</Text>
        <Input
          name="lotNumber"
          value={formData.lotNumber}
          onChange={(e) => handleChange("lotNumber", e.target.value)}
          size="xs"
        />
      </Box>
      <Box>
        <Text fontSize="xs">TKW (g):</Text>
        <Input
          name="tkw"
          value={formData.tkw}
          onChange={(e) => handleChange("tkw", e.target.value)}
          size="xs"
        />
      </Box>
      <Box>
        <Text fontSize="xs">Quantity to treat (kg):</Text>
        <Input
          name="quantity"
          value={formData.quantity}
          onChange={(e) => handleChange("quantity", e.target.value)}
          size="xs"
        />
      </Box>
    </Grid>
  );
};

const SeedTreatmentForm: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.newOrder);
  const productCount = formData.productDetails.length;

  const handleChange = (name: keyof Order, value: string | OrderStatus) => {
    dispatch(updateField({ field: name, value }));
  };

  const handleSave = () => {
    console.log('Saving order:', formData);
  };

  const addProduct = () => {
    dispatch(addProductDetail({ id: productCount, name: "", quantity: 0, rateType: "unit", rateUnit: "ml", rate: 0, density: 0 }));
  };

  return (
    <Box width="800px" mx="auto" p="2" bg="white" boxShadow="md" borderRadius="md">
      <Text fontSize="lg" fontWeight="bold" textAlign="center" mb="1">
        Remington Seeds
      </Text>

      <RecipeInfo handleChange={handleChange} />
      <PackagingOptions handleChange={handleChange} />

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
      <Grid templateColumns="repeat(3, 1fr)" gap="1" mb="2">
        <Button colorScheme="green" size="xs" onClick={handleSave}>Done</Button>
        <Button colorScheme="yellow" size="xs" onClick={() => dispatch(setOrderState({
          productDetails: [],
          recipeDate: new Date().toISOString().split("T")[0],
          applicationDate: new Date().toISOString().split("T")[0],
          operator: "",
          crop: "",
          variety: "thermo",
          lotNumber: "ther123",
          tkw: "200",
          quantity: "2000",
          packaging: "inSeeds",
          bagSize: "",
          status: OrderStatus.NotStarted,
        }))}>Clear All</Button>
        <Button colorScheme="red" size="xs">Exit</Button>
      </Grid>
    </Box>
  );
};

export default SeedTreatmentForm;