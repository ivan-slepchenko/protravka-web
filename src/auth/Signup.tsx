import React, { useState } from 'react';
import { Input, Button, VStack, Heading, Alert, AlertIcon, Grid, GridItem, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure, Center, Image } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

const SignupSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().min(6, 'Password is too short').required('Password is required'),
    repeatPassword: Yup.string()
        .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
        .required('Repeat Password is required'),
    name: Yup.string().required('Name is required'),
    surname: Yup.string().required('Surname is required'),
    birthday: Yup.date()
        .typeError('Invalid birthday date format')
        .required('Birthday is required'),
    phone: Yup.string().required('Phone number is required'),
});

const Signup = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    const { error, message } = useSelector((state: RootState) => state.user);
    const [formErrors, setFormErrors] = useState<Yup.ValidationError[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleSubmit = async (values: { email: string; password: string; repeatPassword: string; name: string; surname: string; birthday: string; phone: string }, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        try {
            await SignupSchema.validate(values, { abortEarly: false });
            dispatch(registerUser(values));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: Yup.ValidationError | any) {
            if (error.name !== "ValidationError") {
                throw error;
            }
            setFormErrors(error.inner);
            onOpen();
            setSubmitting(false);
        }
    };

    const getFieldError = (fieldName: string) => {
        const error = formErrors.find(error => error.path === fieldName);
        return error ? "red.500" : "gray.300";
    };

    return (
        <Center w="full" h="full" p={8}>
            <VStack spacing={4}>
                <Image src="/protravka_logo.png" alt={t('signup.logo')} width="200px" objectFit='contain'/>
                <Heading>{t('signup.signup')}</Heading>
                {error && (
                    <Alert status="error">
                        <AlertIcon />
                        {error}
                    </Alert>
                )}
                {message && (
                    <Alert status="success">
                        <AlertIcon />
                        {message}
                    </Alert>
                )}
                <Formik
                    initialValues={{ email: '', password: '', repeatPassword: '', name: '', surname: '', birthday: '', phone: '' }}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {() => (
                        <Form>
                            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                <GridItem colSpan={2}>
                                    <Field name="email" as={Input} placeholder={t('signup.email')} borderColor={getFieldError("email")} />
                                </GridItem>
                                <GridItem colSpan={2}>
                                    <Field name="password" as={Input} placeholder={t('signup.password')} type="password" borderColor={getFieldError("password")} />
                                </GridItem>
                                <GridItem colSpan={2}>
                                    <Field name="repeatPassword" as={Input} placeholder={t('signup.repeat_password')} type="password" borderColor={getFieldError("repeatPassword")} />
                                </GridItem>
                                <GridItem colSpan={1}>
                                    <Field name="name" as={Input} placeholder={t('signup.name')} borderColor={getFieldError("name")} />
                                </GridItem>
                                <GridItem colSpan={1}>
                                    <Field name="surname" as={Input} placeholder={t('signup.surname')} borderColor={getFieldError("surname")} />
                                </GridItem>
                                <GridItem colSpan={1}>
                                    <Field name="birthday" as={Input} placeholder={t('signup.birthday')} type="date" borderColor={getFieldError("birthday")} />
                                </GridItem>
                                <GridItem colSpan={1}>
                                    <Field name="phone" as={Input} placeholder={t('signup.phone_number')} borderColor={getFieldError("phone")} />
                                </GridItem>
                                <GridItem colSpan={2} display="flex">
                                    <Button ml="auto" type="submit">{t('signup.signup')}</Button>
                                </GridItem>
                            </Grid>
                        </Form>
                    )}
                </Formik>
                <Button variant="link" onClick={() => navigate('/login')}>{t('signup.already_have_account')}</Button>
            </VStack>

            {/* Error Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t('signup.form_errors')}</ModalHeader>
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
        </Center>
    );
};

export default Signup;