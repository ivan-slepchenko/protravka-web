import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, Box, VStack, HStack} from "@chakra-ui/react";
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

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(fetchUserByToken());
        }
    }, [dispatch, isAuthenticated]);

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

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);

                // Listen for updates
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    if (installingWorker) {
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    // New update available
                                    console.log('New content is available; please refresh.');
                                } else {
                                    // Content cached for offline use
                                    console.log('Content is cached for offline use.');
                                }
                            }
                        };
                    }
                };
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();