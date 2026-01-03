import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../contexts/AppContext';
import AppRoutes from './index';

/**
 * 路由提供者组件
 * 包装 BrowserRouter 和 AppProvider
 */
export const RouterProvider = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
};

