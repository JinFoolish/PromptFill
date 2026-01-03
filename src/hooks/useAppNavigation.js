import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ROUTES, getTemplateRoute } from '../routes/routes';

/**
 * 自定义导航 Hook
 * 统一管理应用的路由导航逻辑
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  /**
   * 导航到首页（发现视图）
   */
  const navigateToHome = () => {
    navigate(ROUTES.HOME);
  };

  /**
   * 导航到模板详情页
   */
  const navigateToTemplate = (templateId) => {
    navigate(getTemplateRoute(templateId));
  };

  /**
   * 导航到设置页
   */
  const navigateToSettings = () => {
    navigate(ROUTES.SETTINGS);
  };

  /**
   * 导航到历史记录页
   */
  const navigateToHistory = () => {
    navigate(ROUTES.HISTORY);
  };

  /**
   * 导航到词库管理页
   */
  const navigateToBanks = () => {
    navigate(ROUTES.BANKS);
  };

  /**
   * 判断当前路由是否为指定路由
   */
  const isActiveRoute = (route) => {
    if (route === ROUTES.HOME) {
      return location.pathname === '/';
    }
    if (route === ROUTES.TEMPLATE) {
      return location.pathname.startsWith('/template/');
    }
    return location.pathname === route;
  };

  /**
   * 获取当前激活的标签（用于 Sidebar）
   */
  const getActiveTab = () => {
    if (location.pathname === ROUTES.SETTINGS) return 'settings';
    if (location.pathname === ROUTES.HISTORY) return 'history';
    if (location.pathname === ROUTES.BANKS) return 'banks';
    if (location.pathname.startsWith('/template/')) return 'details';
    return 'home'; // 默认首页
  };

  /**
   * 从路由参数中获取模板ID
   */
  const getTemplateIdFromRoute = () => {
    return params.id || null;
  };

  return {
    navigate,
    location,
    params,
    navigateToHome,
    navigateToTemplate,
    navigateToSettings,
    navigateToHistory,
    navigateToBanks,
    isActiveRoute,
    getActiveTab,
    getTemplateIdFromRoute,
  };
};

