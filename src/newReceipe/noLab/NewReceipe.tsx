import { Checkbox, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Box, Button, HStack, Text, Grid, Input, Select, InputGroup, useDisclosure, Table, Thead, Tr, Th, Tbody, Td, VStack, Heading, CloseButton, CircularProgress } from "@chakra-ui/react";
import { Role } from '../../operators/Operators';
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { Formik, Field, FieldArray, FormikErrors, FormikTouched, FormikProps } from "formik";
import {
    setOrderState,
    createNewEmptyOrder,
    createNewEmptyProduct,
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
    fetchCalculatedValues,
    OrderStatus
} from "../../store/newOrderSlice";
import { createOrder, fetchOrders } from "../../store/ordersSlice";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import { useTranslation } from 'react-i18next';

const currentDate = Date.now();

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

export const NewReceipe = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const formData = useSelector((state: RootState) => state.newOrder as NewOrderState);
    const crops = useSelector((state: RootState) => state.crops.crops);
    const products = useSelector((state: RootState) => state.products.products);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [formErrors, setFormErrors] = useState<Yup.ValidationError[]>([]);
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const [orderDate, setOrderDate] = useState(new Date().getTime());
    const [doNotShowAgain, setDoNotShowAgain] = useState(() => {
        return localStorage.getItem('doNotShowAgain') === 'true';
    });
    const addAlert = useAlert().addAlert;
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const validationSchema = Yup.object().shape({
        applicationDate: Yup.number().required(t('new_receipe.application_date_required')),
        operatorId: Yup.string().optional(),
        cropId: Yup.string().required(t('new_receipe.crop_required')),
        varietyId: Yup.string().required(t('new_receipe.variety_required')),
        lotNumber: Yup.string()
            .required(t('new_receipe.lot_number_required'))
            .notOneOf([""], t('new_receipe.lot_number_not_empty')),
        tkw: Yup.number().moreThan(0, t('new_receipe.tkw_more_than_zero')).required(t('new_receipe.tkw_required')),
        seedsToTreatKg: Yup.number().moreThan(0, t('new_receipe.seeds_to_treat_more_than_zero')).required(t('new_receipe.seeds_to_treat_required')),
        bagSize: Yup.number().moreThan(0, t('new_receipe.bag_size_more_than_zero')).required(t('new_receipe.bag_size_required')),
        packaging: Yup.string().required(t('new_receipe.packaging_required')),
        productDetails: Yup.array().of(
            Yup.object().shape({
                productId: Yup.string().required(t('new_receipe.product_required')),
                rate: Yup.number().moreThan(0, t('new_receipe.rate_more_than_zero')).required(t('new_receipe.rate_required')),
                rateType: Yup.mixed<RateType>().oneOf(Object.values(RateType)).required(t('new_receipe.rate_type_required')),
                rateUnit: Yup.mixed<RateUnit>().oneOf(Object.values(RateUnit)).required(t('new_receipe.rate_unit_required')),
            })
        ).min(1, t('new_receipe.at_least_one_product'))
    });

    const handleSave = (values: NewOrderState, resetForm: () => void) => {
        setIsSaving(true);
        values.status = OrderStatus.RecipeCreated;
        values.extraSlurry = values.extraSlurry === null ? 0 : values.extraSlurry;
        dispatch(createOrder(values)).then(() => {
            dispatch(fetchOrders());
            dispatch(setOrderState(createNewEmptyOrder()));
            resetForm();
            setOrderDate(values.applicationDate);
            setIsSaving(false);
            if (!doNotShowAgain) {
                setShowPopup(true);
            } else {
                addAlert(t('new_receipe.recipe_created'));
            }
        });
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
        <VStack w="full" h='full' fontSize={'xs'} p={4}>
            <HStack w="full">
                <Heading size="lg">{t('new_receipe.new_receipe')}</Heading>
                <CloseButton ml="auto" onClick={() => navigate(-1)} />
            </HStack>
            <VStack w="full" h="full" justifyContent={'center'}>
                <Formik
                    initialValues={{
                        ...formData,
                        applicationDate: formData.applicationDate || currentDate,
                    }}
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

                        const selectedCropId = props.values.cropId;

                        return (
                            <form onSubmit={props.handleSubmit} style={{ width: '100%' }}>
                                <Box width="full" mx="auto"  pointerEvents={isSaving ? 'none' : 'auto'}>
                                    {/* Recipe Info */}
                                    <Grid templateColumns="repeat(3, 1fr)" gap="4" mb="4">
                                        <Box>
                                            <Text fontSize="md">{t('new_receipe.application_date')}:</Text>
                                            <Field
                                                as={Input}
                                                type="date"
                                                name="applicationDate"
                                                size="md"
                                                value={props.values.applicationDate ? new Date(props.values.applicationDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const date = e.target.value ? new Date(e.target.value) : new Date();
                                                    props.handleChange(e);
                                                    dispatch(updateApplicationDate(date.getTime()));
                                                }}
                                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.preventDefault()}
                                                borderColor={props.errors.applicationDate && props.touched.applicationDate ? "red.500" : "gray.300"}
                                                disabled={isSaving}
                                            />
                                        </Box>
                                        <Box>
                                            <Text fontSize="md">{t('new_receipe.operator')}:</Text>
                                            <Field
                                                as={Select}
                                                name="operatorId"
                                                size="md"
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                    props.handleChange(e);
                                                    dispatch(updateOperator(e.target.value || null));
                                                }}
                                                value={props.values.operatorId || ''}
                                                borderColor={props.errors.operatorId && props.touched.operatorId ? "red.500" : "gray.300"}
                                                disabled={isSaving}
                                            >
                                                <option value="">{t('new_receipe.any_operator')}</option>
                                                {filteredOperators.map((operator) => (
                                                    <option key={operator.id} value={operator.id}>
                                                        {operator.name} {operator.surname}
                                                    </option>
                                                ))}
                                            </Field>
                                        </Box>
                                        <Box>
                                            <Text fontSize="md">{t('new_receipe.crop')}:</Text>
                                            <Field
                                                as={Select}
                                                name="cropId"
                                                placeholder={t('new_receipe.select_crop')}
                                                size="md"
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                    props.handleChange(e);
                                                    dispatch(updateCrop(e.target.value || null));
                                                }}
                                                value={props.values.cropId || ''}
                                                borderColor={props.errors.cropId && props.touched.cropId ? "red.500" : "gray.300"}
                                                disabled={isSaving}
                                            >
                                                {crops.map((crop) => (
                                                    <option key={crop.id} value={crop.id}>
                                                        {crop.name}
                                                    </option>
                                                ))}
                                            </Field>
                                        </Box>
                                        <Box>
                                            <Text fontSize="md">{t('new_receipe.variety')}:</Text>
                                            <Field
                                                as={Select}
                                                name="varietyId"
                                                placeholder={selectedCropId === null ? t('new_receipe.select_crop_first') : t('new_receipe.select_variety')}
                                                size="md"
                                                disabled={selectedCropId === null || isSaving}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                    props.handleChange(e);
                                                    if (selectedCropId === null) {
                                                        throw new Error("Crop is not selected");
                                                    }
                                                    dispatch(updateVariety(e.target.value || null));
                                                }}
                                                value={props.values.varietyId || ''}
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
                                            <Text fontSize="md">{t('new_receipe.lot_number')}:</Text>
                                            <Field
                                                as={Input}
                                                name="lotNumber"
                                                placeholder="#123"
                                                size="md"
                                                value={props.values.lotNumber !== null ? props.values.lotNumber : undefined}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    props.handleChange(e);
                                                    dispatch(updateLotNumber(e.target.value));
                                                }}
                                                borderColor={props.errors.lotNumber && props.touched.lotNumber ? "red.500" : "gray.300"}
                                                disabled={isSaving}
                                            />
                                        </Box>
                                        <Box>
                                            <Text fontSize="md">{t('new_receipe.tkw')}:</Text>
                                            <Field
                                                as={Input}
                                                name="tkw"
                                                size="md"
                                                type="number"
                                                step="0.01"
                                                placeholder="0"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    props.handleChange(e);
                                                    dispatch(updateTkw(parseFloat(e.target.value.endsWith('.') ? e.target.value.slice(0, -1) : e.target.value) || null));
                                                }}
                                                value={props.values.tkw !== null ? props.values.tkw : ''}
                                                borderColor={props.errors.tkw && props.touched.tkw ? "red.500" : "gray.300"}
                                                disabled={isSaving}
                                            />
                                        </Box>
                                        <Box>
                                            <Text fontSize="md">{t('new_receipe.seeds_to_treat')}:</Text>
                                            <Field
                                                as={Input}
                                                name="seedsToTreatKg"
                                                size="md"
                                                placeholder="0"
                                                type="number"
                                                step="0.01"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    props.handleChange(e);
                                                    dispatch(updateseedsToTreatKg(parseFloat(e.target.value.endsWith('.') ? e.target.value.slice(0, -1) : e.target.value) || null));
                                                }}
                                                value={props.values.seedsToTreatKg !== null ? props.values.seedsToTreatKg : ''}
                                                borderColor={props.errors.seedsToTreatKg && props.touched.seedsToTreatKg ? "red.500" : "gray.300"}
                                                disabled={isSaving}
                                            />
                                        </Box>
                                        <Box>
                                            <Text fontSize="md">{t('new_receipe.how_to_pack')}</Text>
                                            <Field
                                                as={Select}
                                                name="packaging"
                                                size="md"
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                    props.handleChange(e);
                                                    dispatch(updatePackaging(e.target.value as Packaging));
                                                }}
                                                value={props.values.packaging}
                                                borderColor={props.errors.packaging && props.touched.packaging ? "red.500" : "gray.300"}
                                                disabled={isSaving}
                                            >
                                                <option value={Packaging.InSeeds}>{t('new_receipe.in_seeds')}</option>
                                                <option value={Packaging.InKg}>{t('new_receipe.in_kg')}</option>
                                            </Field>
                                        </Box>
                                        <Box>
                                            <Text fontSize="md">{t('new_receipe.bag_size', { unit: props.values.packaging === Packaging.InSeeds ? t('new_receipe.units') : t('units.kg') })}:</Text>
                                            <InputGroup size="md">
                                                <Field
                                                    as={Input}
                                                    name="bagSize"
                                                    placeholder="0"
                                                    type="number"
                                                    step="0.01"
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        props.handleChange(e);
                                                        dispatch(updateBagSize(parseFloat(e.target.value.endsWith('.') ? e.target.value.slice(0, -1) : e.target.value) || null));
                                                    }}
                                                    value={props.values.bagSize !== null ? props.values.bagSize : ''}
                                                    borderColor={props.errors.bagSize && props.touched.bagSize ? "red.500" : "gray.300"}
                                                    disabled={isSaving}
                                                />
                                            </InputGroup>
                                        </Box>
                                        <Box>
                                            <Text fontSize="md" mb="2">{t('new_receipe.extra_slurry')}:</Text>
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
                                                        dispatch(updateExtraSlurry(parseFloat(e.target.value.endsWith('.') ? e.target.value.slice(0, -1) : e.target.value)));
                                                    }}
                                                    value={props.values.extraSlurry !== null ? props.values.extraSlurry : ''}
                                                    borderColor={props.errors.extraSlurry && props.touched.extraSlurry ? "red.500" : "gray.300"}
                                                    disabled={isSaving}
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
                                                            <Text fontSize="md">{t('new_receipe.product')}:</Text>
                                                            <Field
                                                                as={Select}
                                                                name={`productDetails.${index}.productId`}
                                                                placeholder={t('new_receipe.select_product')}
                                                                size="md"
                                                                focusBorderColor="transparent"
                                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                                    const selectedProduct = products.find(product => product.id === e.target.value);
                                                                    if (selectedProduct) {
                                                                        props.setFieldValue(`productDetails.${index}.productId`, selectedProduct.id);
                                                                        dispatch(updateProductDetail({ ...props.values.productDetails[index], productId: selectedProduct.id }));
                                                                    }
                                                                }}
                                                                value={props.values.productDetails[index].productId || ''}
                                                                borderColor={hasProductDetailError(props.errors, props.touched, index, 'productId') ? "red.500" : "gray.300"}
                                                                disabled={isSaving}
                                                            >
                                                                {products.map((product) => (
                                                                    <option key={product.id} value={product.id}>
                                                                        {product.name} <span style={{ float: 'right', color: 'gray' }}>({product.density} {t('units.g_ml')}))</span>
                                                                    </option>
                                                                ))}
                                                            </Field>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="md">
                                                                {productDetail.rateType === RateType.Unit ? t('new_receipe.rate_per_unit', { unit: getRateUnitLabel(productDetail.rateUnit) }) : t('new_receipe.rate_per_100kg', { unit: getRateUnitLabel(productDetail.rateUnit) })}
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
                                                                    value={props.values.productDetails[index].rateType || ''}
                                                                    borderColor={hasProductDetailError(props.errors, props.touched, index, 'rateType') ? "red.500" : "gray.300"}
                                                                    borderRightRadius="0"
                                                                    disabled={isSaving}
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
                                                                    value={props.values.productDetails[index].rateUnit || ''}
                                                                    borderColor={hasProductDetailError(props.errors, props.touched, index, 'rateUnit') && props.touched.productDetails?.[index]?.rateUnit ? "red.500" : "gray.300"}
                                                                    borderRadius="0"
                                                                    disabled={isSaving}
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
                                                                        const rate = value === "" ? 0 : parseFloat(value.endsWith('.') ? value.slice(0, -1) : value);
                                                                        props.setFieldValue(`productDetails.${index}.rate`, rate);
                                                                        dispatch(updateProductDetail({ ...props.values.productDetails[index], rate }));
                                                                    }}
                                                                    value={props.values.productDetails[index].rate !== 0 ? props.values.productDetails[index].rate : ''}
                                                                    borderColor={hasProductDetailError(props.errors, props.touched, index, 'rate') ? "red.500" : "gray.300"}
                                                                    disabled={isSaving}
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
                                                    }} ml="auto" mb={4} disabled={isSaving}>{t('new_receipe.add_product')}</Button>
                                                </HStack>
                                            </Box>
                                        )}
                                    </FieldArray>

                                    {/* Action Buttons */}
                                    <HStack justifyContent="space-between" alignItems={"end"}>
                                        {!!formData.slurryTotalGrRecipeToMix && !!formData.slurryTotalMlRecipeToMix && !!formData.totalCompoundsDensity && (
                                            <Table variant="simple" size="sm" w="50%">
                                                <Thead bg="orange.100">
                                                    <Tr>
                                                        <Th rowSpan={2}>{t('new_receipe.slurry_density')}</Th>
                                                        <Th colSpan={2}>{t('new_receipe.slurry_per_100kg')}</Th>
                                                        <Th colSpan={2}>{t('new_receipe.slurry_per_lot')}</Th>
                                                    </Tr>
                                                    <Tr>
                                                        <Th>{t('units.ml')}</Th>
                                                        <Th>{t('units.gr')}</Th>
                                                        <Th>{t('units.l')}</Th>
                                                        <Th>{t('units.kg')}</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    <Tr>
                                                        <Td>{formData.totalCompoundsDensity.toFixed(3)} {t('units.g_ml')})</Td>
                                                        <Td>{formData.seedsToTreatKg ? (100 * formData.slurryTotalMlRecipeToMix / (formData.seedsToTreatKg)).toFixed(2) : 'N/A'}</Td>
                                                        <Td>{formData.seedsToTreatKg ? (100 * formData.slurryTotalGrRecipeToMix / (formData.seedsToTreatKg)).toFixed(2) : 'N/A'}</Td>
                                                        <Td>{(formData.slurryTotalMlRecipeToMix / 1000).toFixed(3)}</Td>
                                                        <Td>{(formData.slurryTotalGrRecipeToMix / 1000).toFixed(3)}</Td>
                                                    </Tr>
                                                </Tbody>
                                            </Table>
                                        )}
                                        
                                        <Button ml="auto" colorScheme="yellow" size="md" onClick={() => handleClearAll(props.resetForm)} disabled={isSaving}>{t('new_receipe.clear_all')}</Button>
                                        <Button colorScheme="green" size="md" type="submit" isLoading={isSaving} spinner={<CircularProgress isIndeterminate size="24px" color="green.500" />}>{t('new_receipe.done')}</Button>
                                    </HStack>
                                </Box>

                                {/* Error Modal */}
                                <Modal isOpen={isOpen} onClose={onClose}>
                                    <ModalOverlay />
                                    <ModalContent>
                                        <ModalHeader>{t('new_receipe.form_errors')}</ModalHeader>
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
                                        <ModalHeader>{t('new_receipe.recipe_created')}</ModalHeader>
                                        <ModalCloseButton />
                                        <ModalBody>
                                            <Text>
                                                <span>{t('new_receipe.recipe_created_for_processing', { date: new Date(orderDate).toLocaleString() })}</span>
                                                <br />
                                                <span>{t('new_receipe.view_recipe_in_board')}</span>
                                            </Text>
                                            <Checkbox mt={4} isChecked={doNotShowAgain} onChange={handleCheckboxChange}>
                                                {t('new_receipe.do_not_show_again')}
                                            </Checkbox>
                                        </ModalBody>
                                        <Box textAlign="center" mb="4">
                                            <Button onClick={handleClosePopup}>{t('new_receipe.close')}</Button>
                                        </Box>
                                    </ModalContent>
                                </Modal>
                            </form>
                        );
                    }}
                </Formik>
            </VStack>
        </VStack>
    );
};