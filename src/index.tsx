import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, Box, VStack, HStack, Link} from "@chakra-ui/react";
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor, AppDispatch, RootState } from './store/store';
import { fetchUserByToken, logoutUser } from './store/userSlice';
import { BrowserRouter } from "react-router-dom";
import { AlertProvider } from './contexts/AlertContext';
import MobileMenu from './menus/MobileMenu';
import DesktopMenu from './menus/DesktopMenu';
import AppRoutes from './AppRoutes';
import LogRocket from 'logrocket';
import { initReactI18next } from 'react-i18next';
import i18next from 'i18next';
import enUSTranslations from './locales/enUS.json';
import frTranslations from './locales/fr.json';
import DataSynchronizer from './DataSynchronizer';

LogRocket.init('protravka/client');

// Initialize i18n
i18next.use(initReactI18next).init({
    lng: 'enUS', // default language
    debug: true,
    resources: {
        enUS: { translation: enUSTranslations },
        fr: { translation: frTranslations },
    },
    interpolation: {
        escapeValue: false,
    },
});

const App = () => {
    const dispatch: AppDispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const useLab = user.company?.featureFlags.useLab;
    const isAuthenticated = user.email !== null;
    const [isPWA, setIsPWA] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(fetchUserByToken());
        }
    }, [dispatch, isAuthenticated]);

    useEffect(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsPWA(isStandalone);

        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        const mobile = /android|iphone|ipad|ipod|opera mini|iemobile|wpdesktop/i.test(userAgent);
        setIsMobile(mobile);
    }, []);

    if (isMobile && !isPWA) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" height="100vh" p={4}>
                <VStack>
                    <Box fontSize="xl" fontWeight="bold">This app works as PWA only</Box>
                    <Box>Please open as PWA</Box>
                    <Box>
                        <Link href="https://en.wikipedia.org/wiki/Putin_khuylo!" isExternal color="blue.500">
                            There should be PIZDATAYA link or the instruction on how to install/open it as PWA
                        </Link>
                    </Box>
                </VStack>
            </Box>
        );
    }

    console.log('Rendering App');

    return <>
        <Box display={{ base: 'block', md: 'none' }} w="full" h="full" position="relative">
            <VStack w="full" h="full" position="relative">
                {isAuthenticated && (
                    <MobileMenu
                        user={user}
                        handleLogout={handleLogout} 
                    />
                )}
                <Box w="full" h="calc(100% - 56px)" flexShrink={1} position={'relative'}>
                    <AppRoutes useLab={useLab} />
                </Box>
            </VStack>
        </Box>
        <HStack display={{ base: 'none', md: 'flex' }} w="full" h="full" position="relative">
            {isAuthenticated && (
                <DesktopMenu
                    user={user}
                    handleLogout={handleLogout}
                />
            )}
            <HStack h="full" w="full" overflowX="auto">
                <Box h="full" w="4px" bg="gray.100" />
                <AppRoutes useLab={useLab}/>
            </HStack>
        </HStack>
    </>;
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


root.render(
    <React.StrictMode>
        <ChakraProvider>
            <AlertProvider>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <BrowserRouter>
                            <App />
                            <DataSynchronizer />
                        </BrowserRouter>
                    </PersistGate>
                </Provider>
            </AlertProvider>
        </ChakraProvider>
    </React.StrictMode>
);

// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();