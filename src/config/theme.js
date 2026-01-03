/**
 * 主题配置文件
 * 集中管理主题配置，支持多套主题预设和主题切换
 */

import { designTokens } from './designTokens';

/**
 * 主题预设配置
 * 可以轻松添加新的主题预设
 */
export const themePresets = {
  orange: {
    name: 'Orange',
    description: '橙色主题（默认）',
    colors: {
      primary: designTokens.colors.primary,
    },
  },
  blue: {
    name: 'Blue',
    description: '蓝色主题',
    colors: {
      primary: {
        DEFAULT: 'hsl(217.2 91.2% 59.8%)',
        foreground: 'hsl(0 0% 98%)',
      },
    },
  },
  green: {
    name: 'Green',
    description: '绿色主题',
    colors: {
      primary: {
        DEFAULT: 'hsl(142.1 76.2% 36.3%)',
        foreground: 'hsl(0 0% 98%)',
      },
    },
  },
  purple: {
    name: 'Purple',
    description: '紫色主题',
    colors: {
      primary: {
        DEFAULT: 'hsl(262.1 83.3% 57.8%)',
        foreground: 'hsl(0 0% 98%)',
      },
    },
  },
};

/**
 * 当前主题配置
 */
let currentTheme = 'orange';

/**
 * 应用主题预设
 * @param {string} themeName - 主题名称
 */
export function applyTheme(themeName) {
  if (!themePresets[themeName]) {
    console.warn(`Theme "${themeName}" not found, using default theme.`);
    themeName = 'orange';
  }

  currentTheme = themeName;
  const theme = themePresets[themeName];

  // 更新 CSS 变量
  const root = document.documentElement;
  if (theme.colors.primary) {
    // 将 HSL 值转换为 CSS 变量格式（只保留数值部分）
    const primaryHsl = theme.colors.primary.DEFAULT.match(/hsl\(([^)]+)\)/)?.[1];
    if (primaryHsl) {
      root.style.setProperty('--primary', primaryHsl);
    }
  }

  // 可以在这里添加更多主题应用逻辑
  // 例如：更新其他 CSS 变量、触发事件等
}

/**
 * 获取当前主题
 * @returns {string} 当前主题名称
 */
export function getCurrentTheme() {
  return currentTheme;
}

/**
 * 自定义主题值
 * @param {Object} customValues - 自定义的主题值
 */
export function customizeTheme(customValues) {
  const root = document.documentElement;

  // 更新 CSS 变量
  if (customValues.colors?.primary) {
    const primaryHsl = customValues.colors.primary.match(/hsl\(([^)]+)\)/)?.[1];
    if (primaryHsl) {
      root.style.setProperty('--primary', primaryHsl);
    }
  }

  // 可以添加更多自定义逻辑
}

/**
 * 初始化主题
 * 从 localStorage 读取保存的主题，或使用默认主题
 */
export function initTheme() {
  const savedTheme = localStorage.getItem('app_theme');
  if (savedTheme && themePresets[savedTheme]) {
    applyTheme(savedTheme);
  } else {
    applyTheme('orange'); // 默认橙色主题
  }
}

