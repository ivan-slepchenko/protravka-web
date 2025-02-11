import { Center, Checkbox, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Box, Button, HStack, Text, Grid, Input, Select, useDisclosure, VStack, Heading, CircularProgress } from "@chakra-ui/react";
import React, { useState } from "react";
import * as Yup from "yup";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { Formik, Field, FormikProps } from "formik";
import {
    setOrderState,
    createNewEmptyOrder,
    updateCrop,
    updateVariety,
    updateLotNumber,
    updateseedsToTreatKg,
    NewOrderState,
    OrderStatus,
} from "../../store/newOrderSlice";
import { createOrder, fetchOrders } from "../../store/ordersSlice";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";

const validationSchema = Yup.object().shape({
    cropId: Yup.string().required("Crop is required"),
    varietyId: Yup.string().required("Variety is required"),
    lotNumber: Yup.string()
        .required("Lot Number is required")
        .notOneOf([""], "Lot Number cannot be empty"),
});

export const NewAssignment = () => {
    const dispatch: AppDispatch = useDispatch();
    const formData = useSelector((state: RootState) => state.newOrder);
    const crops = useSelector((state: RootState) => state.crops.crops);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [formErrors, setFormErrors] = useState<Yup.ValidationError[]>([]);
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const [doNotShowAgain, setDoNotShowAgain] = useState(() => {
        return localStorage.getItem('doNotShowAgain') === 'true';
    });
    const addAlert = useAlert().addAlert;
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = (values: NewOrderState, resetForm: () => void) => {
        setIsSaving(true);
        values.status = OrderStatus.LabAssignmentCreated;
        dispatch(createOrder(values)).then(() => {
            dispatch(fetchOrders());
            dispatch(setOrderState(createNewEmptyOrder()));
            resetForm();
            setIsSaving(false);
            if (!doNotShowAgain) {
                setShowPopup(true);
            } else {
                addAlert('Assignment successfully created.');
            }
        });
    };

    const handleClearAll = (resetForm: (nextState?: Partial<FormikProps<NewOrderState>>) => void) => {
        dispatch(setOrderState(createNewEmptyOrder()));
        resetForm({
            values: {
                ...formData,
                cropId: null,
                varietyId: null,
                lotNumber: '',
                bagSize: null,
                seedsToTreatKg: null
            },
        });
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


    return (
        <Center w='full' h='full' fontSize={'xs'}>
            <VStack>
                <Heading size="lg">New Assignment</Heading>
                <Formik
                    initialValues={{
                        ...formData,
                    }}
                    onSubmit={handleSubmit}
                    enableReinitialize
                    validationSchema={validationSchema}
                    validateOnChange={true}
                    validateOnBlur={true}
                >
                    {(props: FormikProps<NewOrderState>) => {

                        const selectedCropId = props.values.cropId;

                        return (
                            <form onSubmit={props.handleSubmit} style={{ width: '100%' }}>
                                <Box width="full" mx="auto" p="4" pointerEvents={isSaving ? 'none' : 'auto'}>
                                    {/* Recipe Info */}
                                    <Grid templateColumns="repeat(4, 1fr)" gap="4" mb="4">
                                        <Box>
                                            <Text fontSize="md">Crop:</Text>
                                            <Field
                                                as={Select}
                                                name="cropId"
                                                placeholder="Select crop"
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
                                            <Text fontSize="md">Variety:</Text>
                                            <Field
                                                as={Select}
                                                name="varietyId"
                                                placeholder={selectedCropId === null ? "Select crop first" : "Select variety"}
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
                                            <Text fontSize="md">Lot Number:</Text>
                                            <Field
                                                as={Input}
                                                name="lotNumber"
                                                placeholder="#123"
                                                size="md"
                                                value={props.values.lotNumber === "" ? undefined : props.values.lotNumber}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    props.handleChange(e);
                                                    dispatch(updateLotNumber(e.target.value));
                                                }}
                                                borderColor={props.errors.lotNumber && props.touched.lotNumber ? "red.500" : "gray.300"}
                                                disabled={isSaving}
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
                                                disabled={isSaving}
                                                value={props.values.seedsToTreatKg !== null ? props.values.seedsToTreatKg : ''}
                                            />
                                        </Box>
                                    </Grid>

                                    {/* Action Buttons */}
                                    <HStack justifyContent="space-between" alignItems={"end"}>
                                        <Button ml="auto" colorScheme="yellow" size="md" onClick={() => handleClearAll(props.resetForm)} disabled={isSaving}>Clear All</Button>
                                        <Button colorScheme="green" size="md" type="submit" disabled={isSaving}>
                                            {isSaving ? <CircularProgress isIndeterminate size="24px" color='green.300' /> : 'Save'}
                                        </Button>
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
                                        <ModalHeader>Assignment Created</ModalHeader>
                                        <ModalCloseButton />
                                        <ModalBody>
                                            <Text>
                                                <span>Assignment successfully created and sent to the lab for processing.</span>
                                                <br />
                                                <span>You can view this Assignment in the <strong>Board</strong>.</span>
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
            </VStack>
        </Center>
    );
};