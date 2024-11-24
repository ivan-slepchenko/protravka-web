import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { Box, Button, HStack, Text, Grid, Input, Select, InputGroup, InputRightElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { Formik, Field, FieldArray, FormikErrors, FormikTouched, FormikProps } from "formik";
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
  ProductDetail,
  RateUnit,
  RateType
} from "../store/newOrderSlice";
import { createOrder, fetchOrders } from "../store/ordersSlice";
import { fetchOperators } from "../store/operatorsSlice";
import { fetchCrops } from "../store/cropsSlice";
import { fetchProducts } from "../store/productsSlice";

const validationSchema = Yup.object().shape({
  recipeDate: Yup.date().required("Recipe Date is required"),
  applicationDate: Yup.date().required("Application Date is required"),
  operatorId: Yup.string().required("Operator is required"),
  cropId: Yup.string().required("Crop is required"),
  varietyId: Yup.string().required("Variety is required"),
  lotNumber: Yup.string().required("Lot Number is required"),
  tkw: Yup.number().positive("TKW must be positive").required("TKW is required"),
  quantity: Yup.number().positive("Quantity must be positive").required("Quantity is required"),
  bagSize: Yup.number().positive("Bag Size must be positive").required("Bag Size is required"),
  packaging: Yup.string().required("Packaging is required"),
  productDetails: Yup.array().of(
    Yup.object().shape({
      productId: Yup.string().required("Product is required"),
      density: Yup.number().positive("Density must be positive").required("Density is required"),
      rate: Yup.number().positive("Rate must be positive").required("Rate is required"),
      rateType: Yup.mixed<RateType>().oneOf(Object.values(RateType)).required("Rate Type is required"),
      rateUnit: Yup.mixed<RateUnit>().oneOf(Object.values(RateUnit)).required("Rate Unit is required"),
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
  const products = useSelector((state: RootState) => state.products.products);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formErrors, setFormErrors] = useState<Yup.ValidationError[]>([]);

  useEffect(() => {
    dispatch(fetchOperators());
    dispatch(fetchCrops());
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleSave = (values: NewOrder, resetForm: () => void) => {
    dispatch(createOrder(values));
    dispatch(fetchOrders());
    dispatch(setOrderState(createNewEmptyOrder()));
    resetForm();
  };

  const handleClearAll = (resetForm: () => void) => {
    dispatch(setOrderState(createNewEmptyOrder()));
    resetForm();
  };

  const handleSubmit = (values: NewOrder, { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void, resetForm: () => void }) => {
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
    handleSave(values, resetForm);
    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={formData}
      onSubmit={handleSubmit}
      enableReinitialize
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
              <Text fontSize="xs" mb="1">Bag size:</Text>
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
                      <option value="inSeeds">s/units</option>
                      <option value="inKg">kg</option>
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
                            name={`productDetails.${index}.productId`}
                            placeholder="Select product"
                            size="xs"
                            focusBorderColor="transparent"
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                              const selectedProduct = products.find(product => product.id === e.target.value);
                              if (selectedProduct) {
                                props.setFieldValue(`productDetails.${index}.productId`, selectedProduct.id);
                                dispatch(updateProductDetail({ ...props.values.productDetails[index], productId: selectedProduct.id }));
                              }
                            }}
                            borderColor={hasProductDetailError(props.errors, props.touched, index, 'productId') ? "red.500" : "gray.300"}
                          >
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
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
                            {productDetail.rateType === RateType.Unit ? `Rate per unit (${productDetail.rateUnit}):` : `Rate per 100kg (${productDetail.rateUnit}):`}
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
                                    const rateType = e.target.value as RateType;
                                    props.setFieldValue(`productDetails.${index}.rateType`, rateType);
                                    dispatch(updateProductDetail({ ...props.values.productDetails[index], rateType }));
                                  }}
                                  borderColor={hasProductDetailError(props.errors, props.touched, index, 'rateType') ? "red.500" : "gray.300"}
                                >
                                  <option value={RateType.Unit}>per unit</option>
                                  <option value={RateType.Per100Kg}>per 100kg</option>
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
                                    const rateUnit = e.target.value as RateUnit;
                                    props.setFieldValue(`productDetails.${index}.rateUnit`, rateUnit);
                                    dispatch(updateProductDetail({ ...props.values.productDetails[index], rateUnit }));
                                  }}
                                  borderColor={hasProductDetailError(props.errors, props.touched, index, 'rateUnit') && props.touched.productDetails?.[index]?.rateUnit ? "red.500" : "gray.300"}
                                >
                                  <option value={RateUnit.ML}>ml</option>
                                  <option value={RateUnit.G}>g</option>
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
              <Button colorScheme="yellow" size="xs" onClick={() => handleClearAll(props.resetForm)}>Clear All</Button>
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
                {formErrors.map((error, index) => (
                  <div key={index}>
                    {error.message}
                  </div>
                ))}
              </ModalBody>
            </ModalContent>
          </Modal>
        </form>
      )}
    </Formik>
  );
};

export default SeedTreatmentForm;