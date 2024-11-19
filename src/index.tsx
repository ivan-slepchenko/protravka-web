// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {ChakraProvider, Box} from "@chakra-ui/react";

import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import {NewOrder} from "./newOrder/NewOrder";
import LeftMenu from './LeftMenu';
import Board from './board/Board';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

console.log('Are we here?');

root.render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <Box display="flex">
          <LeftMenu />
          <Box flex="1" ml="20%" w="full" h="full">
            <Routes>
              <Route path="/new" element={<NewOrder />} />
              <Route path="/board" element={<Board />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);

// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();