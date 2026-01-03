/**
 * 移动端适配配置接口
 * 
 * 此文件用于控制移动端适配功能的启用/禁用
 * 当需要重新启用移动端适配时，只需修改此文件中的配置即可
 */

/**
 * 是否启用移动端适配
 * @type {boolean}
 * @default false
 */
export const ENABLE_MOBILE_ADAPTATION = false;

/**
 * 移动端断点宽度（像素）
 * 当屏幕宽度小于此值时，视为移动设备
 * @type {number}
 * @default 768
 */
export const MOBILE_BREAKPOINT = 768;

/**
 * 检测是否为移动设备
 * 根据配置决定是否启用移动端检测
 * @returns {boolean}
 */
export const isMobileDevice = () => {
  if (!ENABLE_MOBILE_ADAPTATION) {
    return false;
  }
  
  if (typeof window === 'undefined') {
    return false;
  }
  
  return window.innerWidth < MOBILE_BREAKPOINT;
};

/**
 * 检测用户代理是否为移动设备
 * 根据配置决定是否启用移动端检测
 * @returns {boolean}
 */
export const isMobileUserAgent = () => {
  if (!ENABLE_MOBILE_ADAPTATION) {
    return false;
  }
  
  if (typeof navigator === 'undefined') {
    return false;
  }
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

