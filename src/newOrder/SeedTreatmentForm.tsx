import React, { useState, useEffect, ChangeEvent } from "react";
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
} from "@chakra-ui/react";

interface ProductDetailsProps {
  index: number;
  formData: { [key: string]: string };
  handleChange: (name: string, value: string) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ index, formData, handleChange }) => {
  const rateUnit = formData[`rateUnit${index}`];
  const rateType = formData[`rateType${index}`];
  const rateLabel = rateType === "unit" ? `Rate per unit (${rateUnit}):` : `Rate per 100kg (${rateUnit}):`;

  return (
    <Box border="1px solid" borderColor="gray.200" p="2" borderRadius="md" mb="2">
      <Grid templateColumns="repeat(5, 1fr)" gap="1" alignItems="center" mb="2">
        <Box textAlign="center">
          <Text fontSize="xs">Product name:</Text>
          <Select
            name={`productName${index}`}
            value={formData[`productName${index}`]}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
            placeholder="Select product"
            size="xs"
          >
            <option value="force-zea-260-fs">Force Zea 260 FS</option>
            <option value="product-2">Product 2</option>
            <option value="product-3">Product 3</option>
          </Select>
        </Box>
        <Box textAlign="center">
          <Text fontSize="xs">Density (g/ml):</Text>
          <Input
            name={`density${index}`}
            value={formData[`density${index}`]}
            isReadOnly
            size="xs"
          />
        </Box>
        <Box textAlign="center">
          <Text fontSize="xs">Is rate in ml or g?</Text>
          <RadioGroup
            name={`rateUnit${index}`}
            value={formData[`rateUnit${index}`]}
            onChange={(value) => handleChange(`rateUnit${index}`, value)}
          >
            <Stack direction="row" spacing="1" justify="space-around">
              <Radio value="ml" size="xs">ml</Radio>
              <Radio value="g" size="xs">g</Radio>
            </Stack>
          </RadioGroup>
        </Box>
        <Box textAlign="center" width="200px">
          <Text fontSize="xs">Rate type:</Text>
          <RadioGroup
            name={`rateType${index}`}
            value={formData[`rateType${index}`]}
            onChange={(value) => handleChange(`rateType${index}`, value)}
          >
            <Stack direction="row" spacing="1" justify="space-around">
              <Radio value="unit" size="xs">Per unit</Radio>
              <Radio value="100kg" size="xs">Per 100kg</Radio>
            </Stack>
          </RadioGroup>
        </Box>
        <Box textAlign="center">
          <Text fontSize="xs">{rateLabel}</Text>
          <Input
            name={`rate${rateType}${rateUnit}${index}`}
            value={formData[`rate${rateType}${rateUnit}${index}`]}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
            placeholder="Enter rate"
            size="xs"
          />
        </Box>
      </Grid>
    </Box>
  );
};

interface PackagingOptionsProps {
  formData: { [key: string]: string };
  handleChange: (name: string, value: string) => void;
}

const PackagingOptions: React.FC<PackagingOptionsProps> = ({ formData, handleChange }) => (
  <Box mb="2">
    <Text fontSize="xs" mb="1">How do you want to pack it?</Text>
    <RadioGroup
      name="packaging"
      value={formData.packaging}
      onChange={(value) => handleChange("packaging", value)}
    >
      <Stack direction="row" spacing="1">
        <Radio value="inSeeds" size="xs">In s/units</Radio>
        <Radio value="inKg" size="xs">In kg</Radio>
      </Stack>
    </RadioGroup>
    <Box mt="1">
      <Text fontSize="xs">Bag size (K/Seeds):</Text>
      <Input
        name="bagSize"
        value={formData.bagSize}
        onChange={(e) => handleChange(e.target.name, e.target.value)}
        placeholder="80"
        size="xs"
      />
    </Box>
  </Box>
);

interface RecipeInfoProps {
  formData: { [key: string]: string };
  handleChange: (name: string, value: string) => void;
}

const RecipeInfo: React.FC<RecipeInfoProps> = ({ formData, handleChange }) => (
  <Grid templateColumns="repeat(2, 1fr)" gap="1" mb="2">
    <Box>
      <Text fontSize="xs">Recipe creation date:</Text>
      <Input
        type="date"
        name="recipeDate"
        value={formData.recipeDate}
        onChange={(e) => handleChange(e.target.name, e.target.value)}
        size="xs"
      />
    </Box>
    <Box>
      <Text fontSize="xs">Application date:</Text>
      <Input
        type="date"
        name="applicationDate"
        value={formData.applicationDate}
        onChange={(e) => handleChange(e.target.name, e.target.value)}
        size="xs"
      />
    </Box>
    <Box>
      <Text fontSize="xs">Operator:</Text>
      <Select
        name="operator"
        value={formData.operator}
        onChange={(e) => handleChange(e.target.name, e.target.value)}
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
        onChange={(e) => handleChange(e.target.name, e.target.value)}
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
        isReadOnly
        size="xs"
      />
    </Box>
    <Box>
      <Text fontSize="xs">Lot Number:</Text>
      <Input
        name="lotNumber"
        value={formData.lotNumber}
        isReadOnly
        size="xs"
      />
    </Box>
    <Box>
      <Text fontSize="xs">TKW (g):</Text>
      <Input
        name="tkw"
        value={formData.tkw}
        isReadOnly
        size="xs"
      />
    </Box>
    <Box>
      <Text fontSize="xs">Quantity to treat (kg):</Text>
      <Input
        name="quantity"
        value={formData.quantity}
        isReadOnly
        size="xs"
      />
    </Box>
  </Grid>
);

const SeedTreatmentForm = () => {
  const [formData, setFormData] = useState({
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
    productName0: "",
    density0: "1.30",
    rateUnit0: "ml",
    rateType0: "unit",
    rateunitml0: "",
    rateunitg0: "",
    rate100kgml0: "",
    rate100kgg0: "",
  });

  const [productCount, setProductCount] = useState(1);

  useEffect(() => {
    const savedData = localStorage.getItem("seedTreatmentForm");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem("seedTreatmentForm", JSON.stringify(formData));
  };

  const addProduct = () => {
    setProductCount(productCount + 1);
    setFormData((prevData) => ({
      ...prevData,
      [`productName${productCount}`]: "",
      [`density${productCount}`]: "1.30",
      [`rateUnit${productCount}`]: "ml",
      [`rateType${productCount}`]: "unit",
      [`rateunitml${productCount}`]: "",
      [`rateunitg${productCount}`]: "",
      [`rate100kgml${productCount}`]: "",
      [`rate100kgg${productCount}`]: "",
    }));
  };

  return (
    <Box maxW="800px" mx="auto" p="2" bg="white" boxShadow="md" borderRadius="md">
      <Text fontSize="lg" fontWeight="bold" textAlign="center" mb="1">
        Remington Seeds
      </Text>

      <RecipeInfo formData={formData} handleChange={handleChange} />
      <PackagingOptions formData={formData} handleChange={handleChange} />

      {/* Product Details */}
      {Array.from({ length: productCount }).map((_, index) => (
        <ProductDetails
          key={index}
          index={index}
          formData={formData}
          handleChange={handleChange}
        />
      ))}
      <Button colorScheme="blue" size="xs" onClick={addProduct}>+ Add Product</Button>

      {/* Action Buttons */}
      <Grid templateColumns="repeat(3, 1fr)" gap="1" mb="2">
        <Button colorScheme="green" size="xs" onClick={handleSave}>Done</Button>
        <Button colorScheme="yellow" size="xs" onClick={() => setFormData({
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
          productName0: "",
          density0: "1.30",
          rateUnit0: "ml",
          rateType0: "unit",
          rateunitml0: "",
          rateunitg0: "",
          rate100kgml0: "",
          rate100kgg0: "",
        })}>Clear All</Button>
        <Button colorScheme="red" size="xs">Exit</Button>
      </Grid>

      {/* Total Section */}
      <Box borderTop="1px solid" borderColor="gray.200" pt="1">
        <Grid templateColumns="repeat(4, 1fr)" gap="1">
          <Text fontSize="xs">Total:</Text>
          <Text fontSize="xs" textAlign="right">1.30</Text>
          <Text fontSize="xs" textAlign="right">100</Text>
          <Text fontSize="xs" textAlign="right">130</Text>
        </Grid>
      </Box>
    </Box>
  );
};

export default SeedTreatmentForm;