import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, Box, VStack, Alert, AlertIcon, HStack, Text } from "@chakra-ui/react";
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor, AppDispatch, RootState } from './store/store';
import Crops from './crops/Crops';
import Products from './products/Products';
import { fetchUserByToken, logoutUser } from './store/userSlice';
import { Role } from './operators/Operators';
import Execution from './execution/Execution';
import MobileMenu from './menus/MobileMenu';
import DesktopMenu from './menus/DesktopMenu';
import Report from './report/Report';

import {
    BrowserRouter,
    Route,
    Routes,
    Navigate,
    useLocation,
    useNavigate,
} from "react-router-dom";
import Board from './board/Board';
import Operators from './operators/Operators';
import Login from './auth/Login';
import Signup from './auth/Signup';
import { NewReceipe as NewReceipeNoLab } from './newReceipe/noLab/NewReceipe';
import { NewReceipe as NewReceipeLab } from './newReceipe/lab/NewReceipe';
import LotReport from './report/LotReport';
import { FiTrello } from 'react-icons/fi';
import { TbReportAnalytics } from "react-icons/tb";
import { AtSignIcon, AddIcon } from '@chakra-ui/icons'; 
import { BiSolidComponent } from "react-icons/bi";
import { FaSeedling, FaTasks, FaFlask } from "react-icons/fa";
import LabBoard from './board/LabBoard';
import { FinalizeRecipe } from './newReceipe/lab/FinalizeRecipe';

const AlertContext = createContext<{ addAlert: (message: string) => void }>({
    addAlert: () => {
        return;
    }
});

const AlertProvider = ({ children }: { children: React.ReactNode }) => {
    const [alerts, setAlerts] = useState<string[]>([]);

    const addAlert = useCallback((message: string) => {
        setAlerts((prevAlerts) => [...prevAlerts, message]);
        setTimeout(() => {
            setAlerts((prevAlerts) => prevAlerts.slice(1));
        }, 3000);
    }, []);

    return (
        <AlertContext.Provider value={{ addAlert }}>
            {children}
            <Box position="fixed" top="4" right="4" zIndex="1000">
                {alerts.map((alert, index) => (
                    <Alert key={index} status="success" variant="subtle" mb={4}>
                        <AlertIcon />
                        {alert}
                    </Alert>
                ))}
            </Box>
        </AlertContext.Provider>
    );
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export const useAlert = () => useContext(AlertContext);

const FeaturesContext = createContext<{ features: Features }>({
    features: {
        lab: false,
    },
});

type Features = {
    lab: boolean;
}    

const FeaturesProvider = ({ children }: { children: React.ReactNode }) => {
    const [features, setFeatures] = useState<Features>({
        lab: false,
    });

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/features`);
                const data = await response.json();
                setFeatures(data);
            } catch (error) {
                console.error('Failed to fetch features:', error);
            }
        };

        fetchFeatures();
    }, []);

    return (
        <FeaturesContext.Provider value={{ features }}>
            {children}
        </FeaturesContext.Provider>
    );
};

export const useFeatures = () => useContext(FeaturesContext);

const RequireAuth = ({ children, roles }: { children: JSX.Element, roles?: Role[] }) => {
    const location = useLocation();
    const user = useSelector((state: RootState) => state.user);

    if (!user.email) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && !roles.some(role => user.roles.includes(role))) {
        return <Navigate to="/" replace />;
    }

    return children;
};

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
    }, [dispatch, isAuthenticated]);

    return (
        <>
            <Box display={{ base: 'block', md: 'none' }} w="full" h="full" position="relative">
                <VStack w="full" h="full" position="relative">
                    {isAuthenticated && (
                        <>
                            <MobileMenu
                                user={user}
                                managerLinks={managerLinks}
                                adminLinks={adminLinks}
                                operatorLinks={operatorLinks}
                                laboratoryLinks={laboratoryLinks}
                                handleLogout={handleLogout}
                            />
                        </>
                    )}
                    <Box w="full" h="full" position={'relative'}>
                        <Routes>
                            <Route path="/" element={<RequireAuth roles={[Role.MANAGER, Role.ADMIN]}><Board /></RequireAuth>} />
                            <Route path="/new" element={<RequireAuth roles={[Role.MANAGER]}>
                                {useLab ? <NewReceipeLab /> : <NewReceipeNoLab />}
                            </RequireAuth>} />
                            <Route path="/finalize" element={<RequireAuth roles={[Role.MANAGER]}><FinalizeRecipe /></RequireAuth>} />
                            <Route path="/lab" element={<RequireAuth roles={[Role.LABORATORY]}><LabBoard /></RequireAuth>} />
                            <Route path="/board" element={<RequireAuth roles={[Role.MANAGER]}><Board /></RequireAuth>} />
                            <Route path="/report" element={<RequireAuth roles={[Role.MANAGER]}><Report /></RequireAuth>} />
                            <Route path="/operators" element={<RequireAuth roles={[Role.ADMIN]}><Operators /></RequireAuth>} />
                            <Route path="/crops" element={<RequireAuth roles={[Role.ADMIN]}><Crops /></RequireAuth>} />
                            <Route path="/products" element={<RequireAuth roles={[Role.ADMIN]}><Products /></RequireAuth>} />
                            <Route path="/execution" element={<RequireAuth roles={[Role.OPERATOR]}><Execution /></RequireAuth>} />
                            <Route path="/lot-report/:lotNumber" element={<RequireAuth roles={[Role.MANAGER, Role.ADMIN]}><LotReport /></RequireAuth>} />
                            <Route path="/login" element={<LoginRedirect />} />
                            <Route path="/signup" element={<Signup />} />
                        </Routes>
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
                    <Box h="full" w="4px" bg="gray.100"/>
                    <Routes>
                        <Route path="/" element={<RequireAuth roles={[Role.MANAGER, Role.ADMIN]}><Board /></RequireAuth>} />
                        <Route path="/new" element={<RequireAuth roles={[Role.MANAGER]}>
                            {useLab ? <NewReceipeLab /> : <NewReceipeNoLab />}
                        </RequireAuth>} />
                        <Route path="/finalize" element={<RequireAuth roles={[Role.MANAGER]}><FinalizeRecipe /></RequireAuth>} />
                        <Route path="/lab" element={<RequireAuth roles={[Role.LABORATORY]}><LabBoard /></RequireAuth>} />
                        <Route path="/board" element={<RequireAuth roles={[Role.MANAGER]}><Board /></RequireAuth>} />
                        <Route path="/report" element={<RequireAuth roles={[Role.MANAGER]}><Report /></RequireAuth>} />
                        <Route path="/lot-report/:orderId" element={<RequireAuth roles={[Role.MANAGER, Role.ADMIN]}><LotReport /></RequireAuth>} />
                        <Route path="/operators" element={<RequireAuth roles={[Role.ADMIN]}><Operators /></RequireAuth>} />
                        <Route path="/crops" element={<RequireAuth roles={[Role.ADMIN]}><Crops /></RequireAuth>} />
                        <Route path="/products" element={<RequireAuth roles={[Role.ADMIN]}><Products /></RequireAuth>} />
                        <Route path="/execution" element={<RequireAuth roles={[Role.OPERATOR]}><Execution /></RequireAuth>} />
                        <Route path="/login" element={<LoginRedirect />} />
                        <Route path="/signup" element={<Signup />} />
                    </Routes>
                </HStack>
            </HStack>
        </>
    );
};

const LoginRedirect = () => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (user.email) {
            if (user.roles.includes(Role.OPERATOR)) {
                navigate('/execution');
            } else if (user.roles.includes(Role.MANAGER)) {
                navigate('/board');
            } else if (user.roles.includes(Role.LABORATORY)) {
                navigate('/lab');
            } else {
                navigate('/operators');
            }
        }
    }, [navigate, user]);

    return <Login />;
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

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