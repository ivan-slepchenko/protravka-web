import React, { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, Box, VStack, HStack} from "@chakra-ui/react";
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor, AppDispatch, RootState } from './store/store';
import { fetchUserByToken, logoutUser } from './store/userSlice';
import { BrowserRouter } from "react-router-dom";
import { AlertProvider, useAlert } from './contexts/AlertContext';
import { FeaturesProvider, useFeatures } from './contexts/FeaturesContext';
import MobileMenu from './menus/MobileMenu';
import DesktopMenu from './menus/DesktopMenu';
import AppRoutes from './AppRoutes';
import { fetchOrders } from './store/ordersSlice';
import { fetchTkwMeasurements } from './store/executionSlice';
import { fetchProducts } from './store/productsSlice';
import { Role } from './operators/Operators';
import { fetchCrops } from './store/cropsSlice';
import { fetchOperators } from './store/operatorsSlice';
import LogRocket from 'logrocket';

LogRocket.init('protravka/client');

const App = () => {
    const dispatch: AppDispatch = useDispatch();
    const {addAlert} = useAlert();
    const user = useSelector((state: RootState) => state.user);
    const tkwMeasurements = useSelector((state: RootState) => state.execution.tkwMeasurements);
    const orders = useSelector((state: RootState) => state.orders.activeOrders);
    const oldOrdersRef = React.useRef(orders);
    const oldMeasurementsRef = React.useRef(tkwMeasurements);
    const isInitialLoadRef = React.useRef(true);
    const useLab = useFeatures().features.lab;
    const email = user.email;
    const isAuthenticated = !!email;

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    useEffect(() => {
        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
        } else if (oldMeasurementsRef.current !== null) {
            try {
                const oldIds = oldMeasurementsRef.current.map((m) => m.id);
                const newIds = tkwMeasurements.map((m) => m.id);
                const isNewMeasurementsAdded = newIds.some((id) => !oldIds.includes(id));
            

                const oldOrderIds = oldOrdersRef.current.map((o) => o.id);
                const newOrderIds = orders.map((o) => o.id);
                const isNewOrderAdded = newOrderIds.some((id) => !oldOrderIds.includes(id));
                if (isNewOrderAdded || isNewMeasurementsAdded) {
                    if (useLab && user.roles.includes(Role.LABORATORY)) {
                        addAlert('You have measurements to check');
                    }
                } 
                if (isNewOrderAdded) {
                    if (user.roles.includes(Role.OPERATOR)) {
                        addAlert('You have taks to do');
                    }
                }
            } catch (error) {
                console.error('Failed to check new measurements:', error);
            }
        }

        oldMeasurementsRef.current = tkwMeasurements;
        oldOrdersRef.current = orders;
    }, [tkwMeasurements, orders]);

    useEffect(() => {
        if (useLab !== undefined) {
            if (!isAuthenticated) {
                dispatch(fetchUserByToken());
            } else {
                
                if (!user.name || !user.email || !user.roles) {
                    throw new Error('User name or email is not set, invalid user data');
                }
                LogRocket.identify('THE_USER_ID_IN_YOUR_APP', {
                    name: user.name + ' ' + user.surname,
                    email: user.email,
                    roles: user.roles.join(', '),
                });

                dispatch(fetchOrders());
                setInterval(() => {
                    dispatch(fetchOrders());
                }, 10000);

                if (user.roles.includes(Role.ADMIN) || user.roles.includes(Role.MANAGER)) {
                    dispatch(fetchCrops());
                    dispatch(fetchProducts());
                    dispatch(fetchOperators());
                }

                if (useLab && user.roles.includes(Role.LABORATORY)) {
                    dispatch(fetchTkwMeasurements());
                    setInterval(() => {
                        dispatch(fetchTkwMeasurements());
                    }, 10000);
                }
            }
        }
    }, [dispatch, user, useLab, isAuthenticated]);

    console.log('Rendering App');

    const memoizedContent = useMemo(() => (
        <>
            <Box display={{ base: 'block', md: 'none' }} w="full" h="full" position="relative">
                <VStack w="full" h="full" position="relative">
                    {isAuthenticated && (
                        <MobileMenu
                            user={user}
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
                        handleLogout={handleLogout}
                    />
                )}
                <HStack h="full" w="full" overflowX="auto">
                    <Box h="full" w="4px" bg="gray.100" />
                    <AppRoutes useLab={useLab} />
                </HStack>
            </HStack>
        </>
    ), [useLab, user, isAuthenticated]);

    return memoizedContent;
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

console.log('Rendering root');

root.render(
    <React.StrictMode>
        <ChakraProvider>
            <AlertProvider>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <FeaturesProvider>
                            <BrowserRouter>
                                <App />
                            </BrowserRouter>
                        </FeaturesProvider>
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