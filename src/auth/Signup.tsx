import React, { useState } from 'react';
import { Box, Input, Button, VStack, Heading, Alert, AlertIcon } from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const auth = getAuth();
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      if (user.email === null) {
        throw new Error('Email is null, user not created');
      }
      dispatch(setUser({ email: user.email, token }));
      setError(null); // Clear error if signup is successful
    } catch (error) {
      setError((error as Error).message);
      console.error('Error signing up:', error);
    }
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
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleSignup}>Signup</Button>
        <Button variant="link" onClick={() => navigate('/login')}>Already have an account? Login</Button>
      </VStack>
    </Box>
  );
};

export default Signup;