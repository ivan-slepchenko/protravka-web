// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, Box } from "@chakra-ui/react";
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { AppDispatch, persistor, RootState } from './store/store';
import Crops from './crops/Crops';
import Products from './products/Products';
import { fetchUserByToken } from './store/userSlice';

import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { NewOrder } from "./newOrder/NewOrder";
import LeftMenu from './LeftMenu';
import Board from './board/Board';
import Operators from './operators/Operators';
import Login from './auth/Login';
import Signup from './auth/Signup';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const email = useSelector((state: RootState) => state.user.email);

  if (!email) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  const dispatch: AppDispatch = useDispatch();
  const email = useSelector((state: RootState) => state.user.email);
  const isAuthenticated = !!email;

  React.useEffect(() => {
    if(!isAuthenticated) dispatch(fetchUserByToken());
  }, [dispatch, isAuthenticated]);

  return (
    <Box display="flex" w="full" h="full" position="relative">
      {isAuthenticated && <LeftMenu />}
      <Box ml={isAuthenticated ? "20%" : "0"} w="full" h="full" position={'relative'}>
        <Routes>
          <Route path="/new" element={<RequireAuth><NewOrder /></RequireAuth>} />
          <Route path="/board" element={<RequireAuth><Board /></RequireAuth>} />
          <Route path="/operators" element={<RequireAuth><Operators /></RequireAuth>} />
          <Route path="/crops" element={<RequireAuth><Crops /></RequireAuth>} />
          <Route path="/products" element={<RequireAuth><Products /></RequireAuth>} />
          <Route path="/login" element={<LoginRedirect />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Box>
    </Box>
  );
};

const LoginRedirect = () => {
  const navigate = useNavigate();
  const email = useSelector((state: RootState) => state.user.email);

  React.useEffect(() => {
    if (email) {
      navigate('/board');
    }
  }, [navigate, email]);

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