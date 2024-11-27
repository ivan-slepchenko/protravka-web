import React, { useState } from 'react';
import { Box, Input, Button, VStack, Heading, Alert, AlertIcon } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { registerUser } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, message } = useSelector((state: RootState) => state.user);

  const handleSignup = () => {
    dispatch(registerUser({ email, password }));
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