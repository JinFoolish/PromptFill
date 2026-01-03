/**
 * 样式工具函数
 * 提供统一的样式访问接口
 */

import { designTokens, getDesignToken } from '../config/designTokens';

/**
 * 获取主题颜色
 * @param {string} colorPath - 颜色路径，例如 'primary' 或 'primary.foreground'
 * @param {boolean} isDark - 是否为暗色模式
 * @returns {string} 颜色值
 */
export function getThemeColor(colorPath, isDark = false) {
  const basePath = isDark ? `colors.dark.${colorPath}` : `colors.${colorPath}`;
  return getDesignToken(basePath) || getDesignToken(`colors.${colorPath}`);
}

/**
 * 获取间距值
 * @param {string} size - 间距大小 (xs, sm, md, lg, xl, 2xl, 3xl)
 * @returns {string} 间距值
 */
export function getSpacing(size) {
  return designTokens.spacing[size] || designTokens.spacing.md;
}

/**
 * 获取圆角值
 * @param {string} size - 圆角大小 (none, sm, md, lg, xl, 2xl, full)
 * @returns {string} 圆角值
 */
export function getBorderRadius(size) {
  return designTokens.borderRadius[size] || designTokens.borderRadius.md;
}

/**
 * 获取字体大小
 * @param {string} size - 字体大小 (xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
 * @returns {Array} [fontSize, lineHeight]
 */
export function getFontSize(size) {
  return designTokens.fontSize[size] || designTokens.fontSize.base;
}

/**
 * 获取阴影值
 * @param {string} size - 阴影大小 (sm, md, lg, xl)
 * @returns {string} 阴影值
 */
export function getBoxShadow(size) {
  return designTokens.boxShadow[size] || designTokens.boxShadow.md;
}

/**
 * 获取过渡时长
 * @param {string} speed - 速度 (fast, normal, slow, slower)
 * @returns {string} 过渡时长
 */
export function getTransitionDuration(speed) {
  return designTokens.transitionDuration[speed] || designTokens.transitionDuration.normal;
}

/**
 * 合并样式对象
 * @param {...Object} styles - 样式对象
 * @returns {Object} 合并后的样式对象
 */
export function mergeStyles(...styles) {
  return Object.assign({}, ...styles);
}

