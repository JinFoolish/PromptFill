/**
 * 设计令牌配置文件
 * 集中定义所有可配置的设计变量，便于后期统一修改整体设计样式
 */

export const designTokens = {
  // 颜色系统
  colors: {
    primary: {
      DEFAULT: 'hsl(24.6 95% 53.1%)', // 橙色主色调
      foreground: 'hsl(0 0% 98%)',
      // 可以轻松修改为其他颜色，例如：
      // DEFAULT: 'hsl(217.2 91.2% 59.8%)', // 蓝色
      // DEFAULT: 'hsl(142.1 76.2% 36.3%)', // 绿色
    },
    secondary: {
      DEFAULT: 'hsl(210 40% 96.1%)',
      foreground: 'hsl(222.2 47.4% 11.2%)',
    },
    muted: {
      DEFAULT: 'hsl(210 40% 96.1%)',
      foreground: 'hsl(215.4 16.3% 46.9%)',
    },
    accent: {
      DEFAULT: 'hsl(210 40% 96.1%)',
      foreground: 'hsl(222.2 47.4% 11.2%)',
    },
    destructive: {
      DEFAULT: 'hsl(0 84.2% 60.2%)',
      foreground: 'hsl(0 0% 98%)',
    },
    border: 'hsl(214.3 31.8% 91.4%)',
    input: 'hsl(214.3 31.8% 91.4%)',
    ring: 'hsl(24.6 95% 53.1%)', // 橙色，与 primary 一致
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(222.2 47.4% 11.2%)',
    // 暗色模式颜色
    dark: {
      primary: {
        DEFAULT: 'hsl(24.6 95% 53.1%)', // 橙色主色调（暗色模式）
        foreground: 'hsl(0 0% 98%)',
      },
      secondary: {
        DEFAULT: 'hsl(217.2 32.6% 17.5%)',
        foreground: 'hsl(210 40% 98%)',
      },
      muted: {
        DEFAULT: 'hsl(217.2 32.6% 17.5%)',
        foreground: 'hsl(215 20.2% 65.1%)',
      },
      accent: {
        DEFAULT: 'hsl(217.2 32.6% 17.5%)',
        foreground: 'hsl(210 40% 98%)',
      },
      destructive: {
        DEFAULT: 'hsl(0 62.8% 30.6%)',
        foreground: 'hsl(0 0% 98%)',
      },
      border: 'hsl(217.2 32.6% 17.5%)',
      input: 'hsl(217.2 32.6% 17.5%)',
      ring: 'hsl(24.6 95% 53.1%)',
      background: 'hsl(222.2 47.4% 11.2%)',
      foreground: 'hsl(210 40% 98%)',
    },
  },

  // 间距系统
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },

  // 圆角系统
  borderRadius: {
    none: '0px',
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // 字体系统
  fontFamily: {
    sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    mono: ['ui-monospace', 'monospace'],
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },

  // 阴影系统
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // 动画时长
  transitionDuration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // 断点系统（响应式）
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

/**
 * 获取设计令牌值
 * @param {string} path - 令牌路径，例如 'colors.primary.DEFAULT'
 * @returns {any} 令牌值
 */
export function getDesignToken(path) {
  const keys = path.split('.');
  let value = designTokens;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return undefined;
  }
  return value;
}

