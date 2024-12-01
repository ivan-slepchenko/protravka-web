import React, { useState } from 'react';
import { Box, Input, Button, VStack, Heading, Alert, AlertIcon } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch:AppDispatch = useDispatch();
    const navigate = useNavigate();
    const { error } = useSelector((state: RootState) => state.user);

    const handleLogin = () => {
        dispatch(loginUser({ email, password }));
    };

    return (
        <Box p={4}>
            <VStack spacing={4} maxW="800px">
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