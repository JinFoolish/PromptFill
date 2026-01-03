/**
 * 路由常量定义
 */
export const ROUTES = {
  HOME: '/',
  TEMPLATE: '/template/:id',
  SETTINGS: '/settings',
  HISTORY: '/history',
  BANKS: '/banks',
};

/**
 * 生成模板路由路径
 */
export const getTemplateRoute = (templateId) => `/template/${templateId}`;

