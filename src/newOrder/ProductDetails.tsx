
import React from "react";
import { Box, Grid, Input, Select, Text, InputGroup, InputRightElement, HStack } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { updateProductDetail, ProductDetail } from "../store/newOrderSlice";

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

export default ProductDetails;