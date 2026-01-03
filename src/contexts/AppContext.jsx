// App Context：提供全局状态和功能
import React, { createContext, useContext } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useTemplateManagement } from '../hooks/useTemplateManagement';
import { useBankManagement } from '../hooks/useBankManagement';
import { useHistory } from '../hooks/useHistory';
import { useFileSystem } from '../hooks/useFileSystem';
import { useImageManagement } from '../hooks/useImageManagement';
import { useUpdateChecker } from '../hooks/useUpdateChecker';
import { useEditor } from '../hooks/useEditor';
import { useTemplateFilter } from '../hooks/useTemplateFilter';
import { TRANSLATIONS } from '../constants/translations';

const AppContext = createContext(null);

/**
 * App Context Provider
 * 整合所有 Hooks 和状态，提供全局访问
 */
export const AppProvider = ({ children }) => {
  // 核心应用状态
  const appState = useAppState();
  
  // 翻译函数
  const t = (key, params = {}) => {
    let str = TRANSLATIONS[appState.language][key] || key;
    Object.keys(params).forEach(k => {
      str = str.replace(`{{${k}}}`, params[k]);
    });
    return str;
  };

  // 历史记录（需要先创建，因为编辑器需要它的 updateActiveTemplateContent）
  const history = useHistory({
    activeTemplate: appState.activeTemplate,
    activeTemplateId: appState.activeTemplateId,
    setTemplates: appState.setTemplates,
  });

  // 编辑器逻辑
  const editor = useEditor({
    activeTemplate: appState.activeTemplate,
    activeTemplateId: appState.activeTemplateId,
    templateLanguage: appState.templateLanguage,
    isEditing: appState.isEditing,
    setIsEditing: appState.setIsEditing,
    setActivePopover: appState.setActivePopover,
    updateActiveTemplateContent: history.updateActiveTemplateContent,
    setTemplates: appState.setTemplates,
  });

  // 模板管理
  const templateManagement = useTemplateManagement({
    templates: appState.templates,
    setTemplates: appState.setTemplates,
    activeTemplateId: appState.activeTemplateId,
    setActiveTemplateId: appState.setActiveTemplateId,
    banks: appState.banks,
    defaults: appState.defaults,
    setBanks: appState.setBanks,
    setDefaults: appState.setDefaults,
    language: appState.language,
    editingTemplateNameId: appState.editingTemplateNameId,
    setEditingTemplateNameId: appState.setEditingTemplateNameId,
    tempTemplateName: appState.tempTemplateName,
    setTempTemplateName: appState.setTempTemplateName,
    tempTemplateAuthor: appState.tempTemplateAuthor,
    setTempTemplateAuthor: appState.setTempTemplateAuthor,
    setIsEditing: appState.setIsEditing,
    lastAppliedDataVersion: appState.lastAppliedDataVersion,
    setLastAppliedDataVersion: appState.setLastAppliedDataVersion,
    SYSTEM_DATA_VERSION: appState.SYSTEM_DATA_VERSION,
    t,
  });

  // 词库管理
  const bankManagement = useBankManagement({
    banks: appState.banks,
    setBanks: appState.setBanks,
    language: appState.language,
    t,
    parseVariableName: editor.parseVariableName,
    findLinkedVariables: editor.findLinkedVariables,
    updateActiveTemplateSelection: editor.updateActiveTemplateSelection,
    activeTemplate: appState.activeTemplate,
    activeTemplateId: appState.activeTemplateId,
    templates: appState.templates,
    setActivePopover: appState.setActivePopover,
  });

  // 文件系统
  const fileSystem = useFileSystem({
    storageMode: appState.storageMode,
    setStorageMode: appState.setStorageMode,
    directoryHandle: appState.directoryHandle,
    setDirectoryHandle: appState.setDirectoryHandle,
    setIsFileSystemSupported: appState.setIsFileSystemSupported,
    templates: appState.templates,
    banks: appState.banks,
    categories: appState.categories,
    defaults: appState.defaults,
    t,
  });

  // 图片管理
  const imageManagement = useImageManagement({
    activeTemplateId: appState.activeTemplateId,
    setTemplates: appState.setTemplates,
    imageUpdateMode: appState.imageUpdateMode,
    currentImageEditIndex: appState.currentImageEditIndex,
    storageMode: appState.storageMode,
    setImageUrlInput: appState.setImageUrlInput,
    setShowImageUrlInput: appState.setShowImageUrlInput,
    setGeneratedImages: appState.setGeneratedImages,
    setShowImageModal: appState.setShowImageModal,
  });

  // 更新检查
  useUpdateChecker({
    APP_VERSION: appState.APP_VERSION,
    lastAppliedDataVersion: appState.lastAppliedDataVersion,
    setLastAppliedDataVersion: appState.setLastAppliedDataVersion,
    setShowDataUpdateNotice: appState.setShowDataUpdateNotice,
    setShowAppUpdateNotice: appState.setShowAppUpdateNotice,
    setUpdateNoticeType: appState.setUpdateNoticeType,
  });

  // 模板过滤
  const templateFilter = useTemplateFilter({
    templates: appState.templates,
    searchQuery: appState.searchQuery,
    selectedTags: appState.selectedTags,
    language: appState.language,
    sortOrder: appState.sortOrder,
    randomSeed: appState.randomSeed,
  });

  const value = {
    // 核心状态
    ...appState,
    
    // 功能模块
    templateManagement,
    bankManagement,
    history,
    fileSystem,
    imageManagement,
    editor,
    templateFilter,
    
    // 工具函数
    t,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * 使用 App Context 的 Hook
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

