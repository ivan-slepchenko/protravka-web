import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, Box, VStack, HStack} from "@chakra-ui/react";
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor, AppDispatch, RootState } from './store/store';
import { fetchUserByToken, logoutUser } from './store/userSlice';
import { Role } from './operators/Operators';
import { fetchOrders } from './store/ordersSlice';
import { BrowserRouter } from "react-router-dom";
import { AlertProvider } from './contexts/AlertContext';
import { FeaturesProvider, useFeatures } from './contexts/FeaturesContext';
import MobileMenu from './menus/MobileMenu';
import DesktopMenu from './menus/DesktopMenu';
import { FiTrello } from 'react-icons/fi';
import { TbReportAnalytics } from "react-icons/tb";
import { AtSignIcon, AddIcon } from '@chakra-ui/icons';
import { BiSolidComponent } from "react-icons/bi";
import { FaSeedling, FaTasks, FaFlask } from "react-icons/fa";
import AppRoutes from './AppRoutes';

const App = () => {
    const dispatch: AppDispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const useLab = useFeatures().features.lab;
    const email = user.email;
    const isAuthenticated = !!email;

    const roleToLinks = {
        [Role.MANAGER]: [
            { to: "/board", label: "Board", icon: <FiTrello /> },
            { to: "/new", label: "New Receipe", icon: <AddIcon /> },
            { to: "/report", label: "Report", icon: <TbReportAnalytics /> },
        ],
        [Role.ADMIN]: [
            { to: "/operators", label: "Operators", icon: <AtSignIcon /> },
            { to: "/crops", label: "Crops", icon: <FaSeedling /> },
            { to: "/products", label: "Products", icon: <BiSolidComponent /> },
        ],
        [Role.OPERATOR]: [
            { to: "/execution", label: "Execution", icon: <FaTasks /> },
        ],
        [Role.LABORATORY]: [
            { to: "/lab", label: "Lab", icon: <FaFlask /> },
        ],
    };

    const userRoles = user.roles || [];
    const managerLinks = userRoles.includes(Role.MANAGER) ? roleToLinks[Role.MANAGER] : [];
    const adminLinks = userRoles.includes(Role.ADMIN) ? roleToLinks[Role.ADMIN] : [];
    const operatorLinks = userRoles.includes(Role.OPERATOR) ? roleToLinks[Role.OPERATOR] : [];
    const laboratoryLinks = userRoles.includes(Role.LABORATORY) ? roleToLinks[Role.LABORATORY] : [];

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    useEffect(() => {
        if (!isAuthenticated) dispatch(fetchUserByToken());
        dispatch(fetchOrders());
    }, [dispatch, isAuthenticated]);

    console.log('Rendering App');

    return (
        <>
            <Box display={{ base: 'block', md: 'none' }} w="full" h="full" position="relative">
                <VStack w="full" h="full" position="relative">
                    {isAuthenticated && (
                        <MobileMenu
                            user={user}
                            managerLinks={managerLinks}
                            adminLinks={adminLinks}
                            operatorLinks={operatorLinks}
                            laboratoryLinks={laboratoryLinks}
                            handleLogout={handleLogout}
                        />
                    )}
                    <Box w="full" h="full" position={'relative'}>
                        <AppRoutes useLab={useLab} />
                    </Box>
                </VStack>
            </Box>
            <HStack display={{ base: 'none', md: 'flex' }} w="full" h="full" position="relative">
                {isAuthenticated && (
                    <DesktopMenu
                        user={user}
                        managerLinks={managerLinks}
                        adminLinks={adminLinks}
                        operatorLinks={operatorLinks}
                        laboratoryLinks={laboratoryLinks}
                        handleLogout={handleLogout}
                    />
                )}
                <HStack h="full" w="full" overflowX="auto">
                    <Box h="full" w="4px" bg="gray.100" />
                    <AppRoutes useLab={useLab} />
                </HStack>
            </HStack>
        </>
    );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

console.log('Rendering root');

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <ChakraProvider>
                    <AlertProvider>
                        <FeaturesProvider>
                            <BrowserRouter>
                                <App />
                            </BrowserRouter>
                        </FeaturesProvider>
                    </AlertProvider>
                </ChakraProvider>
            </PersistGate>
        </Provider>
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