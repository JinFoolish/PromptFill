// 组件统一导出文件
// 这个文件集中管理所有组件的导出，方便管理和导入
// 所有导入都从有真实代码实现的组件导入，不进行二次导入

export { Variable } from './Variable';
export { VisualEditor } from './VisualEditor';
export { TemplatePreview } from './TemplatePreview/TemplatePreview';
export { BanksView, InsertVariableModal, CategoryManager, AddBankModal } from './BanksView';
export { SettingsView } from './SettingsView/SettingsView';
export { AIImageGenerator } from './AIImageGenerator/AIImageGenerator';
export { default as ImagePopup } from './ImagePopup';
export { HistoryManager } from './HistoryManager/HistoryManager';
export { UpdateNotice } from './UpdateNotice';
export { AppUpdateNotice } from './AppUpdateNotice';

// Export App components
export { AppLayout } from './App/AppLayout';
export { EditorView } from './App/EditorView';
export { EditorToolbar } from './App/EditorToolbar';
export { TemplatesSidebar } from './App/TemplatesSidebar';
export { DarkModeLamp } from './App/DarkModeLamp';
export { Sidebar } from './App/Sidebar';

// Export HomePage components
export { DiscoveryView } from './HomePage/DiscoveryView';
export { AnimatedSlogan } from './HomePage/AnimatedSlogan';

// TemplatePreview is already exported above, but its sub-components are available:
// - TemplatePreview/TemplateHeader
// - TemplatePreview/TemplateImageSection
// - TemplatePreview/TemplateContent
// - TemplatePreview/VariableRenderer
// - TemplatePreview/TemplateNameEditor
// - TemplatePreview/TemplateTagEditor
// - TemplatePreview/utils/variableParser
// - TemplatePreview/utils/templateContentProcessor