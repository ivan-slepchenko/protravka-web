import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { Box, Button, HStack, Text, Grid, Input, Select, InputGroup, InputRightElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { Formik, Form, Field, FieldArray, FormikErrors, FormikTouched, FormikProps } from "formik";
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
  NewOrder,
  ProductDetail
} from "../store/newOrderSlice";
import { createOrder, fetchOrders } from "../store/ordersSlice";
import { fetchOperators } from "../store/operatorsSlice";
import { fetchCrops } from "../store/cropsSlice";

const validationSchema = Yup.object().shape({
  recipeDate: Yup.date().required("Required"),
  applicationDate: Yup.date().required("Required"),
  operatorId: Yup.string().required("Required"),
  cropId: Yup.string().required("Required"),
  varietyId: Yup.string().required("Required"),
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

const hasProductDetailError = (errors: FormikErrors<NewOrder>, touched: FormikTouched<NewOrder>, index: number, field: keyof ProductDetail): boolean => {
  if(!touched.productDetails?.[index]?.rateType) return false; 
  if (Array.isArray(errors.productDetails)) {
    const productDetailErrors = errors.productDetails[index];
    if (productDetailErrors && typeof productDetailErrors === 'object') {
      return !!productDetailErrors[field];
    }
  }
  return false;
};

const SeedTreatmentForm: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.newOrder as NewOrder);
  const operators = useSelector((state: RootState) => state.operators.operators);
  const crops = useSelector((state: RootState) => state.crops.crops);
  const selectedCropId = useSelector((state: RootState) => state.newOrder.cropId);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formErrors, setFormErrors] = useState<Yup.ValidationError[]>([]);

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

  const handleSubmit = (values: NewOrder, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void}) => {
    try {
      validationSchema.validateSync(values, { abortEarly: false });
    } catch (error:Yup.ValidationError | any) {
      if (error.name !== "ValidationError") {
        throw error;
      }

      setFormErrors((error as Yup.ValidationError).inner);
      onOpen();
      setSubmitting(false);
      return;
    }
    handleSave(values);
    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={formData}
      onSubmit={handleSubmit}
      // enableReinitialize
    >
       {(props: FormikProps<NewOrder>) => (
        <form onSubmit={props.handleSubmit}>
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
                    props.handleChange(e);
                    dispatch(updateRecipeDate(e.target.value));
                  }}
                  borderColor={props.errors.recipeDate && props.touched.recipeDate ? "red.500" : "gray.300"}
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
                    props.handleChange(e);
                    dispatch(updateApplicationDate(e.target.value));
                  }}
                  borderColor={props.errors.applicationDate && props.touched.applicationDate ? "red.500" : "gray.300"}
                />
              </Box>
              <Box>
                <Text fontSize="xs">Operator:</Text>
                <Field
                  as={Select}
                  name="operatorId"
                  placeholder="Select operator"
                  size="xs"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    props.handleChange(e);
                    dispatch(updateOperator(e.target.value));
                  }}
                  borderColor={props.errors.operatorId && props.touched.operatorId ? "red.500" : "gray.300"}
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
                  name="cropId"
                  placeholder="Select crop"
                  size="xs"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    props.handleChange(e);
                    dispatch(updateCrop(e.target.value));
                  }}
                  borderColor={props.errors.cropId && props.touched.cropId ? "red.500" : "gray.300"}
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
                  name="varietyId"
                  placeholder={selectedCropId === undefined ? "Select crop first" : "Select variety"}
                  size="xs"
                  disabled={selectedCropId === undefined}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    props.handleChange(e);
                    if (selectedCropId === undefined) {
                      throw new Error("Crop is not selected");
                    }
                    dispatch(updateVariety(e.target.value));
                  }}
                  borderColor={props.errors.varietyId && props.touched.varietyId ? "red.500" : "gray.300"}
                >
                  {crops.find(crop => crop.id === selectedCropId)?.varieties.map((variety) => (
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
                    props.handleChange(e);
                    dispatch(updateLotNumber(e.target.value));
                  }}
                  borderColor={props.errors.lotNumber && props.touched.lotNumber ? "red.500" : "gray.300"}
                />
              </Box>
              <Box>
                <Text fontSize="xs">TKW (g):</Text>
                <Field
                  as={Input}
                  name="tkw"
                  size="xs"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    props.handleChange(e);
                    dispatch(updateTkw(parseFloat(e.target.value)));
                  }}
                  borderColor={props.errors.tkw && props.touched.tkw ? "red.500" : "gray.300"}
                />
              </Box>
              <Box>
                <Text fontSize="xs">Quantity to treat (kg):</Text>
                <Field
                  as={Input}
                  name="quantity"
                  size="xs"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    props.handleChange(e);
                    dispatch(updateQuantity(parseFloat(e.target.value)));
                  }}
                  borderColor={props.errors.quantity && props.touched.quantity ? "red.500" : "gray.300"}
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
                      props.handleChange(e);
                      dispatch(updateBagSize(parseFloat(e.target.value)));
                    }}
                    borderColor={props.errors.bagSize && props.touched.bagSize ? "red.500" : "gray.300"}
                  />
                  <InputRightElement width="auto">
                    <Field
                      as={Select}
                      name="packaging"
                      size="xs"
                      fontWeight="bold"
                      bg="gray.50"
                      border="1px solid"
                      focusBorderColor="transparent"
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        props.handleChange(e);
                        dispatch(updatePackaging(e.target.value));
                      }}
                      borderColor={props.errors.packaging && props.touched.packaging ? "red.500" : "gray.300"}
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
                  {props.values.productDetails.map((productDetail, index) => (
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
                              const selectedProduct = e.target.value;
                              props.setFieldValue(`productDetails.${index}.name`, selectedProduct);
                              dispatch(updateProductDetail({ ...props.values.productDetails[index], name: selectedProduct }));
                            }}
                            borderColor={hasProductDetailError(props.errors, props.touched, index, 'name') ? "red.500" : "gray.300"}
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
                              const density = parseInt(e.target.value);
                              props.setFieldValue(`productDetails.${index}.density`, density);
                              dispatch(updateProductDetail({ ...props.values.productDetails[index], density }));
                            }}
                            borderColor={hasProductDetailError(props.errors, props.touched, index, 'density') ? "red.500" : "gray.300"}
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
                                const rate = parseInt(e.target.value);
                                props.setFieldValue(`productDetails.${index}.rate`, rate);
                                dispatch(updateProductDetail({ ...props.values.productDetails[index], rate }));
                              }}
                              borderColor={hasProductDetailError(props.errors, props.touched, index, 'rate') ? "red.500" : "gray.300"}
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
                                  focusBorderColor="transparent"
                                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    const rateType = e.target.value;
                                    props.setFieldValue(`productDetails.${index}.rateType`, rateType);
                                    dispatch(updateProductDetail({ ...props.values.productDetails[index], rateType }));
                                  }}
                                  borderColor={hasProductDetailError(props.errors, props.touched, index, 'rateType') ? "red.500" : "gray.300"}
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
                                  focusBorderColor="transparent"
                                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    const rateUnit = e.target.value;
                                    props.setFieldValue(`productDetails.${index}.rateUnit`, rateUnit);
                                    dispatch(updateProductDetail({ ...props.values.productDetails[index], rateUnit }));
                                  }}
                                  borderColor={hasProductDetailError(props.errors, props.touched, index, 'rateUnit') && props.touched.productDetails?.[index]?.rateUnit ? "red.500" : "gray.300"}
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

          {/* Error Modal */}
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Form Errors</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <ul>
                  {formErrors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </ModalBody>
            </ModalContent>
          </Modal>
        </form>
      )}
    </Formik>
  );
};

export default SeedTreatmentForm;