import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from './routes';
import { HomePage } from './pages/HomePage';
import { TemplatePage } from './pages/TemplatePage';
import { SettingsPage } from './pages/SettingsPage';
import { HistoryPage } from './pages/HistoryPage';
import { BanksPage } from './pages/BanksPage';
import { AppLayout } from '../components/App/AppLayout';

/**
 * 应用路由配置
 */
const AppRoutes = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.TEMPLATE} element={<TemplatePage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
        <Route path={ROUTES.BANKS} element={<BanksPage />} />
      </Routes>
    </AppLayout>
  );
};

export default AppRoutes;

