import { useState } from 'react';
import { Input, Button, VStack, Heading, Alert, AlertIcon, Center, Image } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/store';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    const { error } = useSelector((state: RootState) => state.user);

    const handleLogin = () => {
        dispatch(loginUser({ email, password }));
    };

    return (
        <Center w="full" h="full" p={8}>
            <VStack spacing={4} maxW="400px" w="full">
                <Image src="/protravka_logo.png" alt={t('login.logo')} width="200px" objectFit='contain'/>
                <Heading>{t('login.login')}</Heading>
                {error && (
                    <Alert status="error">
                        <AlertIcon />
                        {t(error)}
                    </Alert>
                )}
                <Input
                    placeholder={t('login.email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                    placeholder={t('login.password')}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handleLogin}>{t('login.login')}</Button>
                <Button variant="link" onClick={() => navigate('/signup')}>{t('login.dont_have_account')}</Button>
            </VStack>
        </Center>
    );
};

export default Login;