// updateLogs.js
export const updateLogsCN = [
  { 
    version: 'V0.6.1', 
    date: '2025年12月26日', 
    time: '11:00 AM',
    title: '联动组逻辑修复与版本升级',
    type: 'UPDATE',
    content: [
      '修复了联动组匹配过于宽松的 Bug，现在仅限相同组号联动。',
      '全站版本号同步升级至 V0.6.1，包含浏览器标题及各处 UI 标识。',
      '优化了暗色模式下的部分图标对比度及 UI 细节。'
    ]
  },
  { 
    version: 'V0.6.0', 
    date: '2025年12月24日', 
    time: '02:00 PM',
    title: '暗夜模式与视觉体验升级',
    type: 'NEW',
    content: [
      '新增暗夜模式（Dark Mode）：全局深度适配，支持一键切换沉浸式黑色主题。',
      'UI 细节优化：重构了标签、图标及按钮的视觉反馈，提升高对比度下的舒适度。',
      '性能增强：优化了长列表模版过滤逻辑，确保切换不同分类时的极致流畅。'
    ]
  },
  { 
    version: 'V0.5.1', 
    date: '2025年12月22日', 
    time: '10:30 AM',
    title: '移动端交互重构与视觉升级',
    type: 'NEW',
    content: [
      '全新移动端架构：引入侧滑抽屉（Drawer）交互，优化单手操作体验。',
      '沉浸式预览：针对手机端重新设计图片预览，支持 3D 陀螺仪视觉反馈与全屏手势操作。',
      '性能飞跃：首页引入高性能 Mesh Gradient 算法彻底解决背景闪烁，海报滚动升级至 60FPS。',
      '细节打磨：重写核心图标提升高分屏清晰度，优化数据迁移逻辑支持无损升级。'
    ]
  },
  { 
    version: 'V0.5.0', 
    date: '2025年12月20日', 
    time: '04:15 PM',
    title: '发现页瀑布流与架构重构',
    type: 'MAJOR',
    content: [
      '架构重构：完成巨型应用组件化解耦，大幅提升代码维护性与资源调度效率。',
      '新增发现页：基于 Masonry 布局的瀑布流门户，支持海量精美模版快速浏览。',
      '导出增强：宽度提升至 860px 适配复杂排版，优化长图拼接清晰度。',
      '版本感知：新增模版/应用双重版本校验，支持云端更新实时无损同步。'
    ]
  },
  { 
    version: 'V0.4.1', 
    date: '2025年12月12日', 
    time: '09:00 AM',
    title: '导出优化与交互细节提升',
    type: 'UPDATE',
    content: [
      '存储优化：导出格式改为 JPG（92% 质量），文件体积减小 60-70%。',
      '智能氛围：引入氛围色提取算法，自动根据模版图片生成高级背景。',
      '交互升级：移动端导入模版全面采用 Toast 通知替代 alert。',
      '导出稳定性：彻底解决了导出时正文内容可能遗漏的问题。'
    ]
  },
  { 
    version: 'V0.4.0', 
    date: '2025年12月10日', 
    time: '11:00 AM',
    title: '模版体验与持久化增强',
    type: 'UPDATE',
    content: [
      '模版系统：新增瀑布流展示与标签过滤，支持导入/导出（Beta）。',
      '数据安全：默认本地化保存模版与词库，支持刷新预设并保留用户数据。',
      '工程优化：支持上传本地图片或 URL 替换模版预览图。'
    ]
  },
  { 
    version: 'V0.3.0', 
    date: '2025年12月08日', 
    time: '02:00 PM',
    title: 'UI 规范化与功能说明完善',
    type: 'UPDATE',
    content: [
      'UI 升级：采用统一的 Premium Button 设计语言，增加悬停渐变动效。',
      '全屏预览：引入 Lightbox 全屏图片预览模式，支持查看海报细节。',
      '文档完善：重构分步骤使用指南，新增图像管理与使用技巧说明。'
    ]
  },
  { 
    version: 'V0.2.0', 
    date: '2025年12月05日', 
    time: '10:00 AM',
    title: '导出功能与响应式适配',
    type: 'UPDATE',
    content: [
      '功能新增：增加模版导出高清长图分享功能。',
      '高度自定义：开放自定义分类颜色配置，优化视觉清晰度。',
      '布局优化：全面优化桌面端与移动端的响应式布局适配。'
    ]
  },
  { 
    version: 'V0.1.0', 
    date: '2024年11月20日', 
    time: '09:00 AM',
    title: '初始版本发布',
    type: 'UPDATE',
    content: [
      '核心引擎：实现基于 {{variable}} 语法的结构化 Prompt 引擎。',
      '基础功能：支持模版创建、词库管理及变量填空交互系统。',
      '数据持久化：建立基于 LocalStorage 的本地存储方案。'
    ]
  }
];

export const updateLogsEN = [
  { 
    version: 'V0.6.1', 
    date: 'Dec 26, 2025', 
    time: '11:00 AM',
    title: 'Linkage Group Fix & Version Bump',
    type: 'UPDATE',
    content: [
      'Fixed bug where linkage groups were too loose; now only same groupId syncs.',
      'Synchronized versioning to V0.6.1 across the entire app.',
      'Optimized icon contrast and minor UI details in Dark Mode.'
    ]
  },
  { 
    version: 'V0.6.0', 
    date: 'Dec 24, 2025', 
    time: '02:00 PM',
    title: 'Dark Mode & Visual Upgrade',
    type: 'NEW',
    content: [
      'Added Dark Mode support with system-wide adaptation.',
      'Refined UI components for better clarity and comfort in dark themes.',
      'Improved performance for template list filtering.'
    ]
  },
  { 
    version: 'V0.5.1', 
    date: 'Dec 22, 2025', 
    time: '10:30 AM',
    title: 'Mobile Interaction Refactor',
    type: 'NEW',
    content: [
      'New mobile architecture with drawer interactions.',
      'Immersive preview with gyroscope feedback and full-screen gestures.',
      'Mesh Gradient integration to fix background flickering on low-end devices.',
      'Redrawn core icons for better clarity on high-DPI screens.'
    ]
  },
  { 
    version: 'V0.5.0', 
    date: 'Dec 20, 2025', 
    time: '04:15 PM',
    title: 'Discovery View & Performance',
    type: 'MAJOR',
    content: [
      'Added Discovery View with Masonry layout for better template browsing.',
      'Enhanced export options with custom ratios and improved clarity.',
      'Refactored LocalStorage logic for real-time multi-tab synchronization.',
      'Improved English localizations and fixed UI alignment issues.'
    ]
  },
  { 
    version: 'V0.4.1', 
    date: 'Dec 12, 2025', 
    time: '09:00 AM',
    title: 'Export & UX Improvements',
    type: 'UPDATE',
    content: [
      'Exported JPG format (92% quality), reducing file size by 60-70%.',
      'Automatic atmosphere background extraction from template images.',
      'Mobile import now uses Toast notifications instead of alerts.',
      'Fixed stability issues during long image exports.'
    ]
  },
  { 
    version: 'V0.4.0', 
    date: 'Dec 10, 2025', 
    time: '11:00 AM',
    title: 'Templates & Persistence',
    type: 'UPDATE',
    content: [
      'New Discovery View with masonry layout and tag filtering.',
      'Improved data persistence with system preset merging.',
      'Support for local file and URL image uploads.'
    ]
  },
  { 
    version: 'V0.3.0', 
    date: 'Dec 08, 2025', 
    time: '02:00 PM',
    title: 'UI & Documentation',
    type: 'UPDATE',
    content: [
      'Premium Button design language with hover animations.',
      'Lightbox mode for full-screen image preview.',
      'Complete user guide refactor with step-by-step instructions.'
    ]
  },
  { 
    version: 'V0.2.0', 
    date: 'Dec 05, 2025', 
    time: '10:00 AM',
    title: 'Export & Responsive Design',
    type: 'UPDATE',
    content: [
      'Added high-definition long image export for sharing.',
      'Customizable category colors for better visual organization.',
      'Comprehensive responsive layout optimizations.'
    ]
  },
  { 
    version: 'V0.1.0', 
    date: 'Nov 20, 2024', 
    time: '09:00 AM',
    title: 'Initial Release',
    type: 'UPDATE',
    content: [
      'Structured Prompt engine with {{variable}} syntax.',
      'Template management and variable-based fill-in interaction.',
      'LocalStorage-based data persistence solution.'
    ]
  }
];