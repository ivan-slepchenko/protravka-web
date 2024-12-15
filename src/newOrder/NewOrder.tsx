import { Center, Checkbox, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Box, Button, HStack, Text, Grid, Input, Select, InputGroup, useDisclosure } from "@chakra-ui/react";
import { Role } from '../operators/Operators';
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
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
    updateseedsToTreatKg,
    updateProductDetail,
    updatePackaging,
    updateBagSize,
    NewOrderState,
    ProductDetail,
    RateUnit,
    RateType,
    addProductDetail,
    updateExtraSlurry,
    Packaging,
    fetchCalculatedValues
} from "../store/newOrderSlice";
import { createOrder, fetchOrders } from "../store/ordersSlice";
import { fetchCrops } from "../store/cropsSlice";
import { fetchProducts } from "../store/productsSlice";
import { fetchOperators } from '../store/operatorsSlice';
import { useNavigate } from "react-router-dom";
import { useAlert } from '../index';

const validationSchema = Yup.object().shape({
    recipeDate: Yup.date().required("Recipe Date is required"),
    applicationDate: Yup.date().required("Application Date is required"),
    operatorId: Yup.string().required("Operator is required"),
    cropId: Yup.string().required("Crop is required"),
    varietyId: Yup.string().required("Variety is required"),
    lotNumber: Yup.string().required("Lot Number is required"),
    tkw: Yup.number().moreThan(0, "TKW must be greater than 0").required("TKW is required"),
    seedsToTreatKg: Yup.number().moreThan(0, "Seeds To Treat must be greater than 0").required("Seeds To Treat is required"),
    bagSize: Yup.number().moreThan(0, "Bag Size must be greater than 0").required("Bag Size is required"),
    packaging: Yup.string().required("Packaging is required"),
    productDetails: Yup.array().of(
        Yup.object().shape({
            productId: Yup.string().required("Product is required"),
            rate: Yup.number().moreThan(0, "Rate must be greater than 0").required("Rate is required"),
            rateType: Yup.mixed<RateType>().oneOf(Object.values(RateType)).required("Rate Type is required"),
            rateUnit: Yup.mixed<RateUnit>().oneOf(Object.values(RateUnit)).required("Rate Unit is required"),
        })
    ).min(1, "At least one product is required")
});


const hasProductDetailError = (errors: FormikErrors<NewOrderState>, touched: FormikTouched<NewOrderState>, index: number, field: keyof ProductDetail): boolean => {
    if(!touched.productDetails?.[index]?.rateType) return false; 
    if (Array.isArray(errors.productDetails)) {
        const productDetailErrors = errors.productDetails[index];
        if (productDetailErrors && typeof productDetailErrors === 'object') {
            return !!productDetailErrors[field];
        }
    }
    return false;
};

export const getRateUnitLabel = (unit: RateUnit): string => {
    switch (unit) {
        case RateUnit.ML:
            return "ml";
        case RateUnit.G:
            return "g";
        default:
            return unit;
    }
};

export const getRateTypeLabel = (type: RateType): string => {
    switch (type) {
        case RateType.Unit:
            return "per unit";
        case RateType.Per100Kg:
            return "per 100 kg";
        default:
            return type;
    }
};

export const NewOrderForm = () => {
    const dispatch: AppDispatch = useDispatch();
    const formData = useSelector((state: RootState) => state.newOrder as NewOrderState);
    const crops = useSelector((state: RootState) => state.crops.crops);
    const selectedCropId = useSelector((state: RootState) => state.newOrder.cropId);
    const products = useSelector((state: RootState) => state.products.products);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [formErrors, setFormErrors] = useState<Yup.ValidationError[]>([]);
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const [operatorName, setOperatorName] = useState('');
    const [orderDate, setOrderDate] = useState('');
    const [doNotShowAgain, setDoNotShowAgain] = useState(() => {
        return localStorage.getItem('doNotShowAgain') === 'true';
    });
    const addAlert = useAlert().addAlert;

    useEffect(() => {
        dispatch(fetchCrops());
        dispatch(fetchProducts());
        dispatch(fetchOperators());
    }, [dispatch]);

    const handleSave = (values: NewOrderState, resetForm: () => void) => {
        dispatch(createOrder(values));
        dispatch(fetchOrders());
        dispatch(setOrderState(createNewEmptyOrder()));
        resetForm();
        const operator = operators.find(op => op.id === values.operatorId);
        setOperatorName(operator ? `${operator.name} ${operator.surname}` : '');
        setOrderDate(values.applicationDate);
        if (!doNotShowAgain) {
            setShowPopup(true);
        } else {
            addAlert('Recipe successfully created.');
        }
    };

    const handleClearAll = (resetForm: () => void) => {
        dispatch(setOrderState(createNewEmptyOrder()));
        resetForm();
    };

    const handleSubmit = (values: NewOrderState, { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void, resetForm: () => void }) => {
        try {
            validationSchema.validateSync(values, { abortEarly: false });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const handleClosePopup = () => {
        setShowPopup(false);
        navigate('/board');
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setDoNotShowAgain(checked);
        localStorage.setItem('doNotShowAgain', checked.toString());
    };

    const operators = useSelector((state: RootState) => state.operators.operators);
    const operatorRole = Role.OPERATOR;
    const filteredOperators = operators.filter(operator => operator.roles.includes(operatorRole));

    return (
        <Center w='full' h='full' fontSize={'xs'}>
            <Formik
                initialValues={formData}
                onSubmit={handleSubmit}
                enableReinitialize
                validationSchema={validationSchema}
                validateOnChange={true}
                validateOnBlur={true}
            >
                {(props: FormikProps<NewOrderState>) => {
                    useEffect(() => {
                        if (props.isValid) {
                            const filteredValues = {
                                ...props.values,
                                productDetails: props.values.productDetails.filter(pd => pd.productId),
                            };
                            dispatch(fetchCalculatedValues(filteredValues));
                        }
                    }, [props.values, props.isValid, dispatch]);

                    return (
                        <form onSubmit={props.handleSubmit} style={{ width: '100%' }}>
                            <Box width="full" mx="auto" p="4">
                                <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb="4">
                                    {'Remington Seeds'}
                                </Text>

                                {/* Recipe Info */}
                                <Grid templateColumns="repeat(3, 1fr)" gap="4" mb="4">
                                    <Box>
                                        <Text fontSize="md">Recipe creation date:</Text>
                                        <Field
                                            as={Input}
                                            type="date"
                                            name="recipeDate"
                                            size="md"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                props.handleChange(e);
                                                dispatch(updateRecipeDate(e.target.value));
                                            }}
                                            borderColor={props.errors.recipeDate && props.touched.recipeDate ? "red.500" : "gray.300"}
                                        />
                                    </Box>
                                    <Box>
                                        <Text fontSize="md">Application date:</Text>
                                        <Field
                                            as={Input}
                                            type="date"
                                            name="applicationDate"
                                            size="md"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                props.handleChange(e);
                                                dispatch(updateApplicationDate(e.target.value));
                                            }}
                                            borderColor={props.errors.applicationDate && props.touched.applicationDate ? "red.500" : "gray.300"}
                                        />
                                    </Box>
                                    <Box>
                                        <Text fontSize="md">Operator:</Text>
                                        <Field
                                            as={Select}
                                            name="operatorId"
                                            placeholder="Select operator"
                                            size="md"
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                props.handleChange(e);
                                                dispatch(updateOperator(e.target.value));
                                            }}
                                            borderColor={props.errors.operatorId && props.touched.operatorId ? "red.500" : "gray.300"}
                                        >
                                            {filteredOperators.map((operator) => (
                                                <option key={operator.id} value={operator.id}>
                                                    {operator.name} {operator.surname}
                                                </option>
                                            ))}
                                        </Field>
                                    </Box>
                                    <Box>
                                        <Text fontSize="md">Crop:</Text>
                                        <Field
                                            as={Select}
                                            name="cropId"
                                            placeholder="Select crop"
                                            size="md"
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
                                        <Text fontSize="md">Variety:</Text>
                                        <Field
                                            as={Select}
                                            name="varietyId"
                                            placeholder={selectedCropId === undefined ? "Select crop first" : "Select variety"}
                                            size="md"
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
                                        <Text fontSize="md">Lot Number:</Text>
                                        <Field
                                            as={Input}
                                            name="lotNumber"
                                            size="md"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                props.handleChange(e);
                                                dispatch(updateLotNumber(e.target.value));
                                            }}
                                            borderColor={props.errors.lotNumber && props.touched.lotNumber ? "red.500" : "gray.300"}
                                        />
                                    </Box>
                                    <Box>
                                        <Text fontSize="md">TKW (g):</Text>
                                        <Field
                                            as={Input}
                                            name="tkw"
                                            size="md"
                                            type="number"
                                            step="0.01"
                                            placeholder="0"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                props.handleChange(e);
                                                dispatch(updateTkw(parseFloat(e.target.value) || 0));
                                            }}
                                            borderColor={props.errors.tkw && props.touched.tkw ? "red.500" : "gray.300"}
                                        />
                                    </Box>
                                    <Box>
                                        <Text fontSize="md">Seeds To Treat (kg):</Text>
                                        <Field
                                            as={Input}
                                            name="seedsToTreatKg"
                                            size="md"
                                            placeholder="0"
                                            type="number"
                                            step="0.01"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                props.handleChange(e);
                                                dispatch(updateseedsToTreatKg(parseFloat(e.target.value) || 0));
                                            }}
                                            borderColor={props.errors.seedsToTreatKg && props.touched.seedsToTreatKg ? "red.500" : "gray.300"}
                                        />
                                    </Box>
                                    <Box>
                                        <Text fontSize="md">How do you want to pack?</Text>
                                        <Field
                                            as={Select}
                                            name="packaging"
                                            size="md"
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                props.handleChange(e);
                                                dispatch(updatePackaging(e.target.value as Packaging));
                                            }}
                                            borderColor={props.errors.packaging && props.touched.packaging ? "red.500" : "gray.300"}
                                        >
                                            <option value={Packaging.InSeeds}>s/units</option>
                                            <option value={Packaging.InKg}>kg</option>
                                        </Field>
                                    </Box>
                                    <Box>
                                        <Text fontSize="md" mb="2">Bag Size ({formData.packaging === Packaging.InSeeds ? 's/units' : 'kg'}):</Text>
                                        <InputGroup size="md">
                                            <Field
                                                as={Input}
                                                name="bagSize"
                                                placeholder="0"
                                                type="number"
                                                step="0.01"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    props.handleChange(e);
                                                    dispatch(updateBagSize(parseFloat(e.target.value) || 0));
                                                }}
                                                borderColor={props.errors.bagSize && props.touched.bagSize ? "red.500" : "gray.300"}
                                            />
                                        </InputGroup>
                                    </Box>
                                    <Box>
                                        <Text fontSize="md" mb="2">Extra Slurry (%):</Text>
                                        <InputGroup size="md">
                                            <Field
                                                as={Input}
                                                name="extraSlurry"
                                                placeholder="0"
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    props.handleChange(e);
                                                    dispatch(updateExtraSlurry(parseFloat(e.target.value)));
                                                }}
                                                borderColor={props.errors.extraSlurry && props.touched.extraSlurry ? "red.500" : "gray.300"}
                                            />
                                        </InputGroup>
                                    </Box>
                                </Grid>

                                {/* Product Details */}
                                <FieldArray name="productDetails">
                                    {({ push }) => (
                                        <Box border="1px solid" borderColor="gray.200" p="4" borderRadius="md" mb="4">
                                            {props.values.productDetails.map((productDetail, index) => (
                                                <Grid key={index} w="full" templateColumns="2fr 3fr" gap="4" alignItems="center" mb="4">
                                                    <Box>
                                                        <Text fontSize="md">Product:</Text>
                                                        <Field
                                                            as={Select}
                                                            name={`productDetails.${index}.productId`}
                                                            placeholder="Select product"
                                                            size="md"
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
                                                                    {product.name} <span style={{ float: 'right', color: 'gray' }}>({product.density} g/ml)</span>
                                                                </option>
                                                            ))}
                                                        </Field>
                                                    </Box>
                                                    <Box>
                                                        <Text fontSize="md">
                                                            {productDetail.rateType === RateType.Unit ? `Rate per unit (${getRateUnitLabel(productDetail.rateUnit)}):` : `Rate per 100kg (${getRateUnitLabel(productDetail.rateUnit)}):`}
                                                        </Text>
                                                        <HStack spacing="0">
                                                            <Field
                                                                as={Select}
                                                                width="200px"
                                                                name={`productDetails.${index}.rateType`}
                                                                size="md"
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
                                                                borderRightRadius="0"
                                                            >
                                                                <option value={RateType.Unit}>{getRateTypeLabel(RateType.Unit)}</option>
                                                                <option value={RateType.Per100Kg}>{getRateTypeLabel(RateType.Per100Kg)}</option>
                                                            </Field>
                                                            <Field
                                                                as={Select}
                                                                width="150px"
                                                                name={`productDetails.${index}.rateUnit`}
                                                                size="md"
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
                                                                borderRadius="0"
                                                            >
                                                                <option value={RateUnit.ML}>{getRateUnitLabel(RateUnit.ML)}</option>
                                                                <option value={RateUnit.G}>{getRateUnitLabel(RateUnit.G)}</option>
                                                            </Field>
                                                            <Field
                                                                as={Input}
                                                                name={`productDetails.${index}.rate`}
                                                                placeholder="0"
                                                                type="number"
                                                                step="0.01"
                                                                borderLeftRadius="0"
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    const value = e.target.value;
                                                                    const rate = value === "" ? 0 : parseFloat(value);
                                                                    props.setFieldValue(`productDetails.${index}.rate`, rate);
                                                                    dispatch(updateProductDetail({ ...props.values.productDetails[index], rate }));
                                                                }}
                                                                value={props.values.productDetails[index].rate === 0 ? "" : props.values.productDetails[index].rate}
                                                                borderColor={hasProductDetailError(props.errors, props.touched, index, 'rate') ? "red.500" : "gray.300"}
                                                            />
                                                        </HStack>
                                                    </Box>
                                                </Grid>
                                            ))}
                                            <HStack>
                                                <Button colorScheme="blue" size="md" onClick={() => {
                                                    const newEmptyProduct = createNewEmptyProduct();
                                                    push(newEmptyProduct);
                                                    dispatch(addProductDetail(createNewEmptyProduct()));
                                                }} ml="auto" mb={4}>+ Add Product</Button>
                                            </HStack>
                                        </Box>
                                    )}
                                </FieldArray>

                                {/* Action Buttons */}
                                <HStack justifyContent="space-between">
                                    {!!formData.slurryTotalGrRecipeToMix && !!formData.slurryTotalMlRecipeToMix  && !!formData.totalCompoundsDensity &&(
                                        <HStack w="full">
                                            <Text fontSize="md" fontWeight="bold" >Slurry Density:</Text>
                                            <Text fontSize="md">{formData.totalCompoundsDensity}{' g / ml, '}</Text>
                                            <Text fontSize="md" fontWeight="bold" >Slurry / 100 kg:</Text>
                                            <Text fontSize="md">{(100 * formData.slurryTotalGrRecipeToMix / (1000 * formData.seedsToTreatKg))?.toFixed(2)} kg / {(100 * formData.slurryTotalMlRecipeToMix / (1000 * formData.seedsToTreatKg))?.toFixed(2)}{' l, '}</Text>
                                            <Text fontSize="md" fontWeight="bold" >Slurry / Lot:</Text>
                                            <Text fontSize="md">{(formData.slurryTotalGrRecipeToMix / 1000)?.toFixed(2)} kg / {(formData.slurryTotalMlRecipeToMix / 1000)?.toFixed(2)} l</Text>
                                           
                                        </HStack>
                                    )}
                                    <HStack>
                                        <Button colorScheme="yellow" size="md" onClick={() => handleClearAll(props.resetForm)}>Clear All</Button>
                                        <Button colorScheme="green" size="md" type="submit">Done</Button>
                                    </HStack>
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

                            {/* Popup Modal */}
                            <Modal isOpen={showPopup} onClose={handleClosePopup} isCentered>
                                <ModalOverlay />
                                <ModalContent>
                                    <ModalHeader>Order Created</ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody>
                                        <Text>
                                            <span>Recipe successfully created and sent to the operator {operatorName} for processing on {orderDate}.</span>
                                            <br />
                                            <span>You can view this Order Recipe in the <strong>Board</strong>, by clicking on your <strong>Order</strong> and opening <strong>Recipe Tab</strong>.</span>
                                            <br />
                                            <span>Note: You can modify the recipe only before the operator starts working on it.</span>
                                        </Text>
                                        <Checkbox mt={4} isChecked={doNotShowAgain} onChange={handleCheckboxChange}>
                                            Do not show this message again.
                                        </Checkbox>
                                    </ModalBody>
                                    <Box textAlign="center" mb="4">
                                        <Button onClick={handleClosePopup}>Close</Button>
                                    </Box>
                                </ModalContent>
                            </Modal>
                        </form>
                    );
                }}
            </Formik>
        </Center>
    );
};