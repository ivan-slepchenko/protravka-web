import React, { useState } from 'react';
import { Box, Input, Button, VStack, Heading, Alert, AlertIcon, Grid, GridItem, Image, Text } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import manPersonIcon from 'man-person-icon.svg';

const SignupSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too Short!').required('Required'),
  repeatPassword: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
    .required('Required'),
  name: Yup.string().required('Required'),
  surname: Yup.string().required('Required'),
  photo: Yup.mixed().required('Required'),
  birthday: Yup.date().required('Required'),
  phone: Yup.string().required('Required'),
});

const Signup = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { error, message } = useSelector((state: RootState) => state.user);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
          initialValues={{ email: '', password: '', repeatPassword: '', name: '', surname: '', photo: null as File | null, birthday: '', phone: '' }}
          validationSchema={SignupSchema}
          onSubmit={async (values) => {
            if (values.photo) {
              const storage = getStorage();
              const photoRef = ref(storage, `user_photos/${values.email}`);
              await uploadBytes(photoRef, values.photo);
              const photoURL = await getDownloadURL(photoRef);
              dispatch(registerUser({ ...values, photo: photoURL }));
            }
          }}
        >
          {({ setFieldValue }) => (
            <Form>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem colSpan={2}>
                  <Field name="email" as={Input} placeholder="Email" />
                </GridItem>
                <GridItem colSpan={2}>
                  <Field name="password" as={Input} placeholder="Password" type="password" />
                </GridItem>
                <GridItem colSpan={2}>
                  <Field name="repeatPassword" as={Input} placeholder="Repeat Password" type="password" />
                </GridItem>
                <GridItem colSpan={1}>
                  <Field name="name" as={Input} placeholder="Name" />
                </GridItem>
                <GridItem colSpan={1}>
                  <Field name="surname" as={Input} placeholder="Surname" />
                </GridItem>
                <GridItem colSpan={2}>
                  <Button as="label" htmlFor="photo-upload" cursor="pointer">
                    Choose File
                  </Button>
                  <Input
                    id="photo-upload"
                    name="photo"
                    type="file"
                    hidden
                    onChange={(event) => {
                      if (event.currentTarget.files) {
                        setFieldValue('photo', event.currentTarget.files[0]);
                        const reader = new FileReader();
                        reader.onload = () => {
                          setPhotoPreview(reader.result as string);
                        };
                        reader.readAsDataURL(event.currentTarget.files[0]);
                      }
                    }}
                  />
                  {photoPreview ? (
                    <Image src={photoPreview} alt="Photo Preview" boxSize="100px" />
                  ) : (
                    <Image src={manPersonIcon} alt="Placeholder" boxSize="100px" />
                  )}
                </GridItem>
                <GridItem colSpan={1}>
                  <Field name="birthday" as={Input} placeholder="Birthday" type="date" />
                </GridItem>
                <GridItem colSpan={1}>
                  <Field name="phone" as={Input} placeholder="Phone Number" />
                </GridItem>
                <GridItem colSpan={2}>
                  <Button type="submit">Signup</Button>
                </GridItem>
              </Grid>
            </Form>
          )}
        </Formik>
        <Button variant="link" onClick={() => navigate('/login')}>Already have an account? Login</Button>
      </VStack>
    </Box>
  );
};

export default Signup;