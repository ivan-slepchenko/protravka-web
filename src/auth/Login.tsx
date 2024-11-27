import React, { useState } from 'react';
import { Box, Input, Button, VStack, Heading, Alert, AlertIcon } from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const auth = getAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      if (user.email === null) {
        throw new Error('Email is null, user not logged in');
      }
      dispatch(setUser({ email: user.email, token }));
      setError(null); // Clear error if login is successful
    } catch (error) {
      setError((error as Error).message);
      console.error('Error logging in:', error);
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={4}>
        <Heading>Login</Heading>
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
        <Button onClick={handleLogin}>Login</Button>
        <Button variant="link" onClick={() => navigate('/signup')}>{"Don't have an account? Signup"}</Button>
      </VStack>
    </Box>
  );
};

export default Login;