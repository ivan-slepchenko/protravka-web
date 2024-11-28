import React from 'react';
import { Box, Input, Button, VStack, Heading, Alert, AlertIcon, Grid, GridItem, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

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
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { error, message } = useSelector((state: RootState) => state.user);
  const [formErrors, setFormErrors] = React.useState<Yup.ValidationError[]>([]);
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
    <Box p={4}>
      <VStack spacing={4}>
        <Heading>Signup</Heading>
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
                  <Field name="email" as={Input} placeholder="Email" borderColor={getFieldError("email")} />
                </GridItem>
                <GridItem colSpan={2}>
                  <Field name="password" as={Input} placeholder="Password" type="password" borderColor={getFieldError("password")} />
                </GridItem>
                <GridItem colSpan={2}>
                  <Field name="repeatPassword" as={Input} placeholder="Repeat Password" type="password" borderColor={getFieldError("repeatPassword")} />
                </GridItem>
                <GridItem colSpan={1}>
                  <Field name="name" as={Input} placeholder="Name" borderColor={getFieldError("name")} />
                </GridItem>
                <GridItem colSpan={1}>
                  <Field name="surname" as={Input} placeholder="Surname" borderColor={getFieldError("surname")} />
                </GridItem>
                <GridItem colSpan={1}>
                  <Field name="birthday" as={Input} placeholder="Birthday" type="date" borderColor={getFieldError("birthday")} />
                </GridItem>
                <GridItem colSpan={1}>
                  <Field name="phone" as={Input} placeholder="Phone Number" borderColor={getFieldError("phone")} />
                </GridItem>
                <GridItem colSpan={2} display="flex">
                  <Button ml="auto" type="submit">Signup</Button>
                </GridItem>
              </Grid>
            </Form>
          )}
        </Formik>
        <Button variant="link" onClick={() => navigate('/login')}>Already have an account? Login</Button>
      </VStack>

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
    </Box>
  );
};

export default Signup;