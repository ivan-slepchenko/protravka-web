import { Checkbox, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Box, Button, HStack, Text, Grid, Input, Select, InputGroup, useDisclosure, Table, Thead, Tr, Th, Tbody, Td, VStack, Heading, CircularProgress, CloseButton, IconButton } from "@chakra-ui/react";
import { Role } from '../../operators/Operators';
import React, { useEffect, useState, useCallback } from "react";
import * as Yup from "yup";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { Formik, Field, FieldArray, FormikErrors, FormikTouched, FormikProps } from "formik";
import {
    resetStateToDefaultFinalize,
    createNewEmptyProduct,
    updateApplicationDate,
    updateOperator,
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
    loadOrderData,
    Order,
    updateTkwMeasurementInterval,
    removeProductDetail,
    setOrderState,
    createNewEmptyOrder,
} from "../../store/newOrderSlice";
import { finalizeOrder, fetchOrders, fetchOrderById } from "../../store/ordersSlice";
import { useNavigate, useParams } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import { useTranslation } from 'react-i18next';

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

const currentDate = new Date().getTime();

export const FinalizeRecipe = () => {
    const { t } = useTranslation();
    const { orderId } = useParams<{ orderId: string }>();
    const dispatch: AppDispatch = useDispatch();
    const formData = useSelector((state: RootState) => state.newOrder);
    const crops = useSelector((state: RootState) => state.crops.crops);
    const selectedCropId = useSelector((state: RootState) => state.newOrder.cropId);
    const products = useSelector((state: RootState) => state.products.products);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [formErrors, setFormErrors] = useState<Yup.ValidationError[]>([]);
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const [doNotShowAgain, setDoNotShowAgain] = useState(() => {
        return localStorage.getItem('doNotShowAgain') === 'true';
    });
    const addAlert = useAlert().addAlert;
    const [order, setOrder] = useState<Order | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    useEffect(() => {
        if (orderId) {
            dispatch(fetchOrderById(orderId)).then((action) => {
                if (fetchOrderById.fulfilled.match(action)) {
                    const fetchedOrder = action.payload;
                    setOrder(fetchedOrder);
                    const partialOrderData: Partial<NewOrderState> = {
                        cropId: fetchedOrder.crop.id,
                        varietyId: fetchedOrder.variety.id,
                        lotNumber: fetchedOrder.lotNumber,
                        tkw: fetchedOrder.tkw,
                        seedsToTreatKg: fetchedOrder.seedsToTreatKg,
                    };
                    dispatch(loadOrderData(partialOrderData));
                }
            });
        }
    }, [orderId, dispatch]);

    const validationSchema = Yup.object().shape({
        applicationDate: Yup.number().required(t('finalize_recipe.application_date_required')),
        operatorId: Yup.string().nullable(),
        bagSize: Yup.number().moreThan(0, t('finalize_recipe.bag_size_more_than_zero')).required(t('finalize_recipe.bag_size_required')),
        packaging: Yup.string().required(t('finalize_recipe.packaging_required')),
        productDetails: Yup.array().of(
            Yup.object().shape({
                productId: Yup.string().required(t('finalize_recipe.product_required')),
                rate: Yup.number().moreThan(0, t('finalize_recipe.rate_more_than_zero')).required(t('finalize_recipe.rate_required')),
                rateType: Yup.mixed<RateType>().oneOf(Object.values(RateType)).required(t('finalize_recipe.rate_type_required')),
                rateUnit: Yup.mixed<RateUnit>().oneOf(Object.values(RateUnit)).required(t('finalize_recipe.rate_unit_required')),
            })
        ).min(1, t('finalize_recipe.at_least_one_product'))
    });

    const handleSave = useCallback((values: NewOrderState) => {
        if (!orderId || !order) return;

        if (
            values.tkw === null ||
            values.seedsToTreatKg === null ||
            values.bagSize === null ||
            values.lotNumber === null ||
            values.slurryTotalMlRecipeToMix === null ||
            values.slurryTotalGrRecipeToMix === null ||
            values.totalCompoundsDensity === null
        ) {
            throw new Error('Required fields cannot be null');
        }

        setIsSaving(true);
        const updatedOrder: Order = {
            ...order,
            ...values,
            id: orderId,
            lotNumber: values.lotNumber,
            seedsToTreatKg: values.seedsToTreatKg,
            bagSize: values.bagSize,
            extraSlurry: values.extraSlurry === null ? 0 : values.extraSlurry,
        };
        dispatch(finalizeOrder(updatedOrder)).then(() => {
            dispatch(fetchOrders());
            dispatch(setOrderState(createNewEmptyOrder()));
            setIsSaving(false);
            if (!doNotShowAgain) {
                setShowPopup(true);
            } else {
                addAlert(t('finalize_recipe.recipe_created'));
                navigate('/board');
            }
        });
    }, [orderId, order, dispatch, doNotShowAgain, addAlert, navigate]);

    const handleClearAll = (resetForm: (nextState?: Partial<FormikProps<NewOrderState>>) => void) => {
        dispatch(resetStateToDefaultFinalize());
        resetForm({
            values: {
                ...formData,
                applicationDate: currentDate,
                productDetails: [],
                bagSize: null,
                extraSlurry: null,
                operatorId: null,
                tkwMeasurementInterval: 60,
            },
        });
    };

    const handleSubmit = (values: NewOrderState, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
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
        handleSave(values);
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

    const tkwMeasurementIntervals = [60, 45, 30, 20, 10, 1];
    // if (import.meta.env.MODE === 'development') {
    //     tkwMeasurementIntervals.push(1);
    // }

    return (
        <VStack w='full' h='full' fontSize={'xs'} p={4} >
            <HStack w="full">
                <Heading size="lg">{t('finalize_recipe.finalize_recipe')}</Heading>
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
                                    tkw: props.values.tkw === null ? 0 : props.values.tkw,
                                };
                                dispatch(fetchCalculatedValues(filteredValues));
                            }
                        }, [props.values, props.isValid, dispatch]);

                        return (
                            <form onSubmit={props.handleSubmit} style={{ width: '100%' }}>
                                <Box width="full" mx="auto" pointerEvents={isSaving ? 'none' : 'auto'}>
                                    {/* Recipe Info */}
                                    <Grid templateColumns="repeat(3, 1fr)" gap="4" mb="4" width="full">
                                        <Box>
                                            <Text fontSize="md">{t('finalize_recipe.application_date')}:</Text>
                                            <Field
                                                as={Input}
                                                type="date"
                                                name="applicationDate"
                                                size="md"
                                                value={props.values.applicationDate ? new Date(props.values.applicationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
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
                                            <Text fontSize="md">{t('finalize_recipe.operator')}:</Text>
                                            <Field
                                                as={Select}
                                                name="operatorId"
                                                placeholder={t('finalize_recipe.any_operator')}
                                                size="md"
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                    props.handleChange(e);
                                                    dispatch(updateOperator(e.target.value));
                                                }}
                                                value={props.values.operatorId || ''}
                                                borderColor={props.errors.operatorId && props.touched.operatorId ? "red.500" : "gray.300"}
                                                disabled={isSaving}
                                            >
                                                {filteredOperators.map((operator) => (
                                                    <option key={operator.id} value={operator.id}>
                                                        {operator.name} {operator.surname}
                                                    </option>
                                                ))}
                                            </Field>
                                        </Box>
                                        <Box>
                                            <Text fontSize="md">{t('finalize_recipe.crop')}:</Text>
                                            <Box
                                                p="2"
                                                border="1px solid"
                                                borderColor="gray.300"
                                                borderRadius="md"
                                                bg="gray.50"
                                                fontSize='md'
                                                height="40px"
                                            >
                                                {crops.find(crop => crop.id === formData.cropId)?.name}
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Text fontSize="md">{t('finalize_recipe.variety')}:</Text>
                                            <Box
                                                p="2"
                                                border="1px solid"
                                                borderColor="gray.300"
                                                borderRadius="md"
                                                bg="gray.50"
                                                fontSize='md'
                                                height="40px"
                                            >
                                                {crops.find(crop => crop.id === selectedCropId)?.varieties.find(variety => variety.id === formData.varietyId)?.name}
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Text fontSize="md">{t('finalize_recipe.lot_number')}:</Text>
                                            <Box
                                                p="2"
                                                border="1px solid"
                                                borderColor="gray.300"
                                                borderRadius="md"
                                                bg="gray.50"
                                                fontSize='md'
                                                height="40px"
                                            >
                                                {formData.lotNumber}
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Text fontSize="md">{t('finalize_recipe.tkw')}:</Text>
                                            <Box
                                                p="2"
                                                border="1px solid"
                                                borderColor="gray.300"
                                                borderRadius="md"
                                                bg="gray.50"
                                                fontSize='md'
                                                height="40px"
                                            >
                                                {formData.tkw?.toFixed(2)}
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Text fontSize="md">{t('finalize_recipe.seeds_to_treat')}:</Text>
                                            <Box
                                                p="2"
                                                border="1px solid"
                                                borderColor="gray.300"
                                                borderRadius="md"
                                                bg="gray.50"
                                                fontSize='md'
                                                height="40px"
                                            >
                                                {formData.seedsToTreatKg}
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Text fontSize="md">{t('finalize_recipe.how_to_pack')}</Text>
                                            <Field
                                                as={Select}
                                                name="packaging"
                                                size="md"
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                    props.handleChange(e);
                                                    dispatch(updatePackaging(e.target.value as Packaging));
                                                }}
                                                borderColor={props.errors.packaging && props.touched.packaging ? "red.500" : "gray.300"}
                                                disabled={isSaving}
                                            >
                                                <option value={Packaging.InSeeds}>{t('finalize_recipe.in_seeds')}</option>
                                                <option value={Packaging.InKg}>{t('finalize_recipe.in_kg')}</option>
                                            </Field>
                                        </Box>
                                        <Box>
                                            <Text fontSize="md">{t('finalize_recipe.bag_size', { unit: formData.packaging === Packaging.InSeeds ? t('finalize_recipe.units') : t('units.kg') })}:</Text>
                                            <InputGroup size="md">
                                                <Field
                                                    as={Input}
                                                    name="bagSize"
                                                    placeholder="0"
                                                    type="number"
                                                    step="0.01"
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        props.handleChange(e);
                                                        dispatch(updateBagSize(parseFloat(e.target.value.endsWith('.') ? e.target.value.slice(0, -1) : e.target.value) || 0));
                                                    }}
                                                    value={props.values.bagSize !== null ? props.values.bagSize : ''}
                                                    borderColor={props.errors.bagSize && props.touched.bagSize ? "red.500" : "gray.300"}
                                                    disabled={isSaving}
                                                />
                                            </InputGroup>
                                        </Box>
                                        <Box>
                                            <Text fontSize="md" mb="2">{t('finalize_recipe.extra_slurry')}:</Text>
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
                                        <Box>
                                            <Text fontSize="md" mb="2">{t('finalize_recipe.tkw_measurement_interval')}:</Text>
                                            <Field
                                                as={Select}
                                                name="tkwMeasurementInterval"
                                                size="md"
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                    props.handleChange(e);
                                                    dispatch(updateTkwMeasurementInterval(parseInt(e.target.value)));
                                                }}
                                                borderColor={props.errors.tkwMeasurementInterval && props.touched.tkwMeasurementInterval ? "red.500" : "gray.300"}
                                                disabled={isSaving}
                                            >
                                                {tkwMeasurementIntervals.map((interval) => (
                                                    <option key={interval} value={interval}>
                                                        {interval} {t('units.minutes')}
                                                    </option>
                                                ))}
                                            </Field>
                                        </Box>
                                    </Grid>

                                    {/* Product Details */}
                                    <FieldArray name="productDetails">
                                        {({ push, remove }) => (
                                            <Box border="1px solid" borderColor="gray.200" p="4" borderRadius="md" mb="4">
                                                {props.values.productDetails.map((productDetail, index) => (
                                                    <Grid key={index} w="full" templateColumns="2fr 4fr" gap="4" alignItems="center" mb="4">
                                                        <Box>
                                                            <Text fontSize="md">{t('finalize_recipe.product')}:</Text>
                                                            <Field
                                                                as={Select}
                                                                name={`productDetails.${index}.productId`}
                                                                placeholder={t('finalize_recipe.select_product')}
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
                                                                disabled={isSaving}
                                                            >
                                                                {products.map((product) => (
                                                                    <option key={product.id} value={product.id}>
                                                                        {product.name} <span style={{ float: 'right', color: 'gray' }}>({product.density} {t('units.g_ml')})</span>
                                                                    </option>
                                                                ))}
                                                            </Field>
                                                        </Box>
                                                        <Box>
                                                            <Text fontSize="md">
                                                                {productDetail.rateType === RateType.Unit ? `${t('finalize_recipe.rate_per_unit', { unit: getRateUnitLabel(productDetail.rateUnit) })}:` : `${t('finalize_recipe.rate_per_100kg', { unit: getRateUnitLabel(productDetail.rateUnit) })}:`}
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
                                                                <IconButton
                                                                    ml="4"
                                                                    mt="auto"
                                                                    aria-label="Delete product"
                                                                    icon={<CloseButton />}
                                                                    colorScheme="red"
                                                                    onClick={() => {
                                                                        remove(index);
                                                                        dispatch(removeProductDetail(index));
                                                                    }}
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
                                                    }} ml="auto" mb={4} disabled={isSaving}>{t('finalize_recipe.add_product')}</Button>
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
                                                        <Th rowSpan={2}>{t('finalize_recipe.slurry_density')}</Th>
                                                        <Th colSpan={2}>{t('finalize_recipe.slurry_per_100kg')}</Th>
                                                        <Th colSpan={2}>{t('finalize_recipe.slurry_per_lot')}</Th>
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
                                                        <Td>{formData.totalCompoundsDensity.toFixed(3)} {t('units.g_ml')}</Td>
                                                        <Td>{formData.seedsToTreatKg ? (100 * formData.slurryTotalMlRecipeToMix / (formData.seedsToTreatKg)).toFixed(2) : 'N/A'}</Td>
                                                        <Td>{formData.seedsToTreatKg ? (100 * formData.slurryTotalGrRecipeToMix / (formData.seedsToTreatKg)).toFixed(2) : 'N/A'}</Td>
                                                        <Td>{(formData.slurryTotalMlRecipeToMix / 1000).toFixed(3)}</Td>
                                                        <Td>{(formData.slurryTotalGrRecipeToMix / 1000).toFixed(3)}</Td>
                                                    </Tr>
                                                </Tbody>
                                            </Table>
                                        )}
                                        <Button ml="auto" colorScheme="yellow" size="md" onClick={() => handleClearAll(props.resetForm)} disabled={isSaving}>{t('finalize_recipe.clear_all')}</Button>
                                        <Button colorScheme="green" size="md" type="submit" isLoading={isSaving} spinner={<CircularProgress isIndeterminate size="24px" color="green.500" />}>{t('finalize_recipe.save')}</Button>
                                    </HStack>
                                </Box>
                                {/* Error Modal */}
                                <Modal isOpen={isOpen} onClose={onClose}>
                                    <ModalOverlay />
                                    <ModalContent>
                                        <ModalHeader>{t('finalize_recipe.form_errors')}</ModalHeader>
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
                                        <ModalHeader>{t('finalize_recipe.recipe_created')}</ModalHeader>
                                        <ModalCloseButton />
                                        <ModalBody>
                                            <Text>
                                                <span>{t('finalize_recipe.recipe_created_message')}</span>
                                                <br />
                                                <span>{t('finalize_recipe.view_in_board')}</span>
                                            </Text>
                                            <Checkbox mt={4} isChecked={doNotShowAgain} onChange={handleCheckboxChange}>
                                                {t('finalize_recipe.do_not_show_again')}
                                            </Checkbox>
                                        </ModalBody>
                                        <Box textAlign="center" mb="4">
                                            <Button onClick={handleClosePopup}>{t('finalize_recipe.close')}</Button>
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