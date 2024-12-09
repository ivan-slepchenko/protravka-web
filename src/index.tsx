import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, Box, VStack } from "@chakra-ui/react";
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { AppDispatch, persistor, RootState } from './store/store';
import Crops from './crops/Crops';
import Products from './products/Products';
import { fetchUserByToken, logoutUser } from './store/userSlice';
import { Role } from './operators/Operators';
import Execution from './execution/Execution';
import MobileMenu from './menus/MobileMenu';
import DesktopMenu from './menus/DesktopMenu';
import OrderInfo from './board/OrderInfo';

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
import { NewOrderForm } from './newOrder/NewOrder';

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
    const email = user.email;
    const isAuthenticated = !!email;

    const roleToLinks = {
        [Role.MANAGER]: [
            { to: "/board", label: "Board" },
            { to: "/new", label: "New Order" },
        ],
        [Role.ADMIN]: [
            { to: "/operators", label: "Operators" },
            { to: "/crops", label: "Crops" },
            { to: "/products", label: "Products" },
        ],
        [Role.OPERATOR]: [
            { to: "/execution", label: "Execution" },
        ],
    };

    const userRoles = user.roles || [];
    const managerLinks = userRoles.includes(Role.MANAGER) ? roleToLinks[Role.MANAGER] : [];
    const adminLinks = userRoles.includes(Role.ADMIN) ? roleToLinks[Role.ADMIN] : [];
    const operatorLinks = userRoles.includes(Role.OPERATOR) ? roleToLinks[Role.OPERATOR] : [];

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    React.useEffect(() => {
        if (!isAuthenticated) dispatch(fetchUserByToken());
    }, [dispatch, isAuthenticated]);

    return (
        <>
            <Box display={{ base: 'block', md: 'none' }} w="full" h="full" position="relative">
                <VStack w="full" h="full" position="relative">
                    {isAuthenticated && (
                        <MobileMenu user={user} managerLinks={managerLinks} adminLinks={adminLinks} operatorLinks={operatorLinks} handleLogout={handleLogout} />
                    )}
                    <Box w="full" h="full" position={'relative'}>
                        <Routes>
                            <Route path="/" element={<RequireAuth roles={[Role.MANAGER, Role.ADMIN]}><Board /></RequireAuth>} />
                            <Route path="/new" element={<RequireAuth roles={[Role.MANAGER]}><NewOrderForm /></RequireAuth>} />
                            <Route path="/board" element={<RequireAuth roles={[Role.MANAGER]}><Board /></RequireAuth>} />
                            <Route path="/operators" element={<RequireAuth roles={[Role.ADMIN]}><Operators /></RequireAuth>} />
                            <Route path="/crops" element={<RequireAuth roles={[Role.ADMIN]}><Crops /></RequireAuth>} />
                            <Route path="/products" element={<RequireAuth roles={[Role.ADMIN]}><Products /></RequireAuth>} />
                            <Route path="/execution" element={<RequireAuth roles={[Role.OPERATOR]}><Execution /></RequireAuth>} />
                            <Route path="/order/:orderId" element={<RequireAuth roles={[Role.MANAGER, Role.ADMIN]}><OrderInfo /></RequireAuth>} />
                            <Route path="/login" element={<LoginRedirect />} />
                            <Route path="/signup" element={<Signup />} />
                        </Routes>
                    </Box>
                </VStack>
            </Box>
            <Box display={{ base: 'none', md: 'flex' }} w="full" h="full" position="relative"> 
                {isAuthenticated && (
                    <DesktopMenu user={user} managerLinks={managerLinks} adminLinks={adminLinks} operatorLinks={operatorLinks} handleLogout={handleLogout} />
                )}
                <Box ml={isAuthenticated ? "20%" : 'unset'} w="full" h="full" position={'relative'}>
                    <Routes>
                        <Route path="/" element={<RequireAuth roles={[Role.MANAGER, Role.ADMIN]}><Board /></RequireAuth>} />
                        <Route path="/new" element={<RequireAuth roles={[Role.MANAGER]}><NewOrderForm /></RequireAuth>} />
                        <Route path="/board" element={<RequireAuth roles={[Role.MANAGER]}><Board /></RequireAuth>} />
                        <Route path="/operators" element={<RequireAuth roles={[Role.ADMIN]}><Operators /></RequireAuth>} />
                        <Route path="/crops" element={<RequireAuth roles={[Role.ADMIN]}><Crops /></RequireAuth>} />
                        <Route path="/products" element={<RequireAuth roles={[Role.ADMIN]}><Products /></RequireAuth>} />
                        <Route path="/execution" element={<RequireAuth roles={[Role.OPERATOR]}><Execution /></RequireAuth>} />
                        <Route path="/order/:orderId" element={<RequireAuth roles={[Role.MANAGER, Role.ADMIN]}><OrderInfo /></RequireAuth>} />
                        <Route path="/login" element={<LoginRedirect />} />
                        <Route path="/signup" element={<Signup />} />
                    </Routes>
                </Box>
            </Box>
        </>
    );
};

const LoginRedirect = () => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user);

    React.useEffect(() => {
        if (user.email) {
            if (user.roles.includes(Role.OPERATOR)) {
                navigate('/execution');
            } else if (user.roles.includes(Role.MANAGER)) {
                navigate('/board');
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
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </ChakraProvider>
            </PersistGate>
        </Provider>
    </React.StrictMode>
);

// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();