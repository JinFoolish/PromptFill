/**
 * 主题管理工具
 * 提供运行时主题切换和管理功能
 */

import { applyTheme, getCurrentTheme, customizeTheme, initTheme } from '../config/theme';

/**
 * 切换暗色模式
 * @param {boolean} isDark - 是否为暗色模式
 */
export function toggleDarkMode(isDark) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * 应用主题并切换暗色模式
 * @param {string} themeName - 主题名称
 * @param {boolean} isDark - 是否为暗色模式
 */
export function applyThemeWithDarkMode(themeName, isDark) {
  applyTheme(themeName);
  toggleDarkMode(isDark);
  
  // 保存到 localStorage
  localStorage.setItem('app_theme', themeName);
  localStorage.setItem('app_dark_mode_v1', JSON.stringify(isDark));
}

/**
 * 初始化主题和暗色模式
 * 从 localStorage 读取保存的设置
 */
export function initThemeAndDarkMode() {
  // 初始化主题
  initTheme();
  
  // 初始化暗色模式
  const savedDarkMode = localStorage.getItem('app_dark_mode_v1');
  if (savedDarkMode !== null) {
    const isDark = JSON.parse(savedDarkMode);
    toggleDarkMode(isDark);
  }
}

/**
 * 动态修改 CSS 变量
 * @param {string} variableName - CSS 变量名（不含 -- 前缀）
 * @param {string} value - 变量值
 */
export function setCSSVariable(variableName, value) {
  const root = document.documentElement;
  root.style.setProperty(`--${variableName}`, value);
}

/**
 * 获取 CSS 变量值
 * @param {string} variableName - CSS 变量名（不含 -- 前缀）
 * @returns {string} 变量值
 */
export function getCSSVariable(variableName) {
  const root = document.documentElement;
  return getComputedStyle(root).getPropertyValue(`--${variableName}`).trim();
}

/**
 * 批量设置 CSS 变量
 * @param {Object} variables - 变量对象，例如 { 'primary': '24.6 95% 53.1%', 'radius': '0.5rem' }
 */
export function setCSSVariables(variables) {
  const root = document.documentElement;
  Object.entries(variables).forEach(([name, value]) => {
    root.style.setProperty(`--${name}`, value);
  });
}

