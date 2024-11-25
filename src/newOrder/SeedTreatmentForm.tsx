import React, { useEffect } from "react";
import * as Yup from "yup";
import { Box, Button, HStack, Text, Grid, Input, Select, InputGroup, InputRightElement } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { Formik, Form, Field, FieldArray } from "formik";
import {
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
  NewOrder
} from "../store/newOrderSlice";
import { createOrder, fetchOrders } from "../store/ordersSlice";
import { fetchOperators } from "../store/operatorsSlice";
import { fetchCrops } from "../store/cropsSlice";

const validationSchema = Yup.object().shape({
  recipeDate: Yup.date().required("Required"),
  applicationDate: Yup.date().required("Required"),
  operator: Yup.string().required("Required"),
  crop: Yup.string().required("Required"),
  variety: Yup.string().required("Required"),
  lotNumber: Yup.string().required("Required"),
  tkw: Yup.number().positive("Must be positive").required("Required"),
  quantity: Yup.number().positive("Must be positive").required("Required"),
  bagSize: Yup.number().positive("Must be positive").required("Required"),
  packaging: Yup.string().required("Required"),
  productDetails: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Required"),
      density: Yup.number().positive("Must be positive").required("Required"),
      rate: Yup.number().positive("Must be positive").required("Required"),
      rateType: Yup.string().required("Required"),
      rateUnit: Yup.string().required("Required"),
    })
  ).min(1, "At least one product is required")
});

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

  const handleSave = (values: NewOrder) => {
    dispatch(createOrder(values));
    dispatch(fetchOrders());
    dispatch(setOrderState(createNewEmptyOrder()));
  };

  const handleClearAll = () => {
    dispatch(setOrderState(createNewEmptyOrder()));
  };

  return (
    <Formik
      initialValues={formData}
      validationSchema={validationSchema}
      onSubmit={handleSave}
      enableReinitialize
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
        <Form>
          <Box width="800px" mx="auto" p="2" bg="white" boxShadow="md" borderRadius="md">
            <Text fontSize="lg" fontWeight="bold" textAlign="center" mb="1">
              Remington Seeds
            </Text>

            {/* Recipe Info */}
            <Grid templateColumns="repeat(2, 1fr)" gap="1" mb="2">
              <Box>
                <Text fontSize="xs">Recipe creation date:</Text>
                <Field
                  as={Input}
                  type="date"
                  name="recipeDate"
                  size="xs"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e);
                    dispatch(updateRecipeDate(e.target.value));
                  }}
                />
              </Box>
              <Box>
                <Text fontSize="xs">Application date:</Text>
                <Field
                  as={Input}
                  type="date"
                  name="applicationDate"
                  size="xs"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e);
                    dispatch(updateApplicationDate(e.target.value));
                  }}
                />
              </Box>
              <Box>
                <Text fontSize="xs">Operator:</Text>
                <Field
                  as={Select}
                  name="operator"
                  placeholder="Select operator"
                  size="xs"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    handleChange(e);
                    const operator = operators.find(op => op.id === e.target.value);
                    if (operator) {
                      dispatch(updateOperator(operator));
                    }
                  }}
                >
                  {operators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.name} {operator.surname}
                    </option>
                  ))}
                </Field>
              </Box>
              <Box>
                <Text fontSize="xs">Crop:</Text>
                <Field
                  as={Select}
                  name="crop"
                  placeholder="Select crop"
                  size="xs"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    handleChange(e);
                    const crop = crops.find(c => c.id === e.target.value);
                    if (crop) {
                      dispatch(updateCrop(crop));
                    }
                  }}
                >
                  {crops.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.name}
                    </option>
                  ))}
                </Field>
              </Box>
              <Box>
                <Text fontSize="xs">Variety:</Text>
                <Field
                  as={Select}
                  name="variety"
                  placeholder={selectedCrop === undefined ? "Select crop first" : "Select variety"}
                  size="xs"
                  disabled={selectedCrop === undefined}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    handleChange(e);
                    if (selectedCrop === undefined) {
                      throw new Error("Crop is not selected");
                    }
                    const variety = selectedCrop.varieties.find(v => v.id === e.target.value);
                    if (variety) {
                      dispatch(updateVariety(variety));
                    }
                  }}
                >
                  {selectedCrop?.varieties.map((variety) => (
                    <option key={variety.id} value={variety.id}>
                      {variety.name}
                    </option>
                  ))}
                </Field>
              </Box>
              <Box>
                <Text fontSize="xs">Lot Number:</Text>
                <Field
                  as={Input}
                  name="lotNumber"
                  size="xs"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e);
                    dispatch(updateLotNumber(e.target.value));
                  }}
                />
              </Box>
              <Box>
                <Text fontSize="xs">TKW (g):</Text>
                <Field
                  as={Input}
                  name="tkw"
                  size="xs"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e);
                    dispatch(updateTkw(parseFloat(e.target.value)));
                  }}
                />
              </Box>
              <Box>
                <Text fontSize="xs">Quantity to treat (kg):</Text>
                <Field
                  as={Input}
                  name="quantity"
                  size="xs"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e);
                    dispatch(updateQuantity(parseFloat(e.target.value)));
                  }}
                />
              </Box>
            </Grid>

            {/* Packaging Options */}
            <Box mb="2">
              <Text fontSize="xs" mb="1">How do you want to pack it?</Text>
              <HStack>
                <InputGroup size="xs">
                  <Field
                    as={Input}
                    name="bagSize"
                    placeholder="80"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      dispatch(updateBagSize(parseFloat(e.target.value)));
                    }}
                  />
                  <InputRightElement width="auto">
                    <Field
                      as={Select}
                      name="packaging"
                      size="xs"
                      fontWeight="bold"
                      bg="gray.50"
                      border="1px solid"
                      borderColor="gray.300"
                      focusBorderColor="transparent"
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        handleChange(e);
                        dispatch(updatePackaging(e.target.value));
                      }}
                    >
                      <option value="inSeeds">in s/units</option>
                      <option value="inKg">in kg</option>
                    </Field>
                  </InputRightElement>
                </InputGroup>
              </HStack>
            </Box>

            {/* Product Details */}
            <FieldArray name="productDetails">
              {({ push, remove }) => (
                <>
                  {values.productDetails.map((productDetail, index) => (
                    <Box key={index} border="1px solid" borderColor="gray.200" p="2" borderRadius="md" mb="2">
                      <Grid w="full" templateColumns="2fr 1fr 2fr" gap="1" alignItems="center" mb="2">
                        <Box>
                          <Text fontSize="xs">Product name:</Text>
                          <Field
                            as={Select}
                            name={`productDetails.${index}.name`}
                            placeholder="Select product"
                            size="xs"
                            focusBorderColor="transparent"
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                              handleChange(e);
                              const updatedProduct = { ...values.productDetails[index], name: e.target.value };
                              setFieldValue(`productDetails.${index}`, updatedProduct);
                              dispatch(updateProductDetail(updatedProduct));
                            }}
                          >
                            <option value="force-zea-260-fs">Force Zea 260 FS</option>
                            <option value="product-2">Product 2</option>
                            <option value="product-3">Product 3</option>
                          </Field>
                        </Box>
                        <Box>
                          <Text fontSize="xs">Density (g/ml):</Text>
                          <Field
                            as={Input}
                            name={`productDetails.${index}.density`}
                            size="xs"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              handleChange(e);
                              const updatedProduct = { ...values.productDetails[index], density: parseInt(e.target.value) };
                              setFieldValue(`productDetails.${index}`, updatedProduct);
                              dispatch(updateProductDetail(updatedProduct));
                            }}
                          />
                        </Box>
                        <Box>
                          <Text fontSize="xs">
                            {productDetail.rateType === "unit" ? `Rate per unit (${productDetail.rateUnit}):` : `Rate per 100kg (${productDetail.rateUnit}):`}
                          </Text>
                          <InputGroup size="xs">
                            <Field
                              as={Input}
                              name={`productDetails.${index}.rate`}
                              placeholder="Enter rate"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                handleChange(e);
                                const updatedProduct = { ...values.productDetails[index], rate: parseInt(e.target.value) };
                                setFieldValue(`productDetails.${index}`, updatedProduct);
                                dispatch(updateProductDetail(updatedProduct));
                              }}
                            />
                            <InputRightElement width="auto">
                              <HStack spacing="0">
                                <Field
                                  as={Select}
                                  width="110px"
                                  name={`productDetails.${index}.rateType`}
                                  size="xs"
                                  fontWeight="bold"
                                  bg="gray.50"
                                  border="1px solid"
                                  borderColor="gray.300"
                                  focusBorderColor="transparent"
                                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    handleChange(e);
                                    const updatedProduct = { ...values.productDetails[index], rateType: e.target.value };
                                    setFieldValue(`productDetails.${index}`, updatedProduct);
                                    dispatch(updateProductDetail(updatedProduct));
                                  }}
                                >
                                  <option value="unit">per unit</option>
                                  <option value="100kg">per 100kg</option>
                                </Field>
                                <Field
                                  as={Select}
                                  width="110px"
                                  name={`productDetails.${index}.rateUnit`}
                                  size="xs"
                                  fontWeight="bold"
                                  bg="gray.50"
                                  border="1px solid"
                                  borderColor="gray.300"
                                  focusBorderColor="transparent"
                                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    handleChange(e);
                                    const updatedProduct = { ...values.productDetails[index], rateUnit: e.target.value };
                                    setFieldValue(`productDetails.${index}`, updatedProduct);
                                    dispatch(updateProductDetail(updatedProduct));
                                  }}
                                >
                                  <option value="ml">ml</option>
                                  <option value="g">g</option>
                                </Field>
                              </HStack>
                            </InputRightElement>
                          </InputGroup>
                        </Box>
                      </Grid>
                    </Box>
                  ))}
                  <HStack>
                    <Button colorScheme="blue" size="xs" onClick={() => push(createNewEmptyProduct())} ml="auto" mb={2}>+ Add Product</Button>
                  </HStack>
                </>
              )}
            </FieldArray>

            {/* Action Buttons */}
            <HStack justifyContent="flex-end" spacing="2" mb="2">
              <Button colorScheme="yellow" size="xs" onClick={handleClearAll}>Clear All</Button>
              <Button colorScheme="green" size="xs" type="submit">Done</Button>
            </HStack>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default SeedTreatmentForm;