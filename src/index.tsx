// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, Box } from "@chakra-ui/react";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store/store';

import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import { NewOrder } from "./newOrder/NewOrder";
import LeftMenu from './LeftMenu';
import Board from './board/Board';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

console.log('Are we here?');

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ChakraProvider>
          <BrowserRouter>
            <Box display="flex" w="full" h="full" position="relative">
              <LeftMenu />
              <Box ml="20%" w="full" h="full" position={'relative'}>
                <Routes>
                  <Route path="/new" element={<NewOrder />} />
                  <Route path="/board" element={<Board />} />
                </Routes>
              </Box>
            </Box>
          </BrowserRouter>
        </ChakraProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();