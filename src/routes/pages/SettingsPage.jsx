import React from 'react';
import { SettingsView } from '../../components/SettingsView/SettingsView';
import { useApp } from '../../contexts/AppContext';

/**
 * 设置页面
 */
export const SettingsPage = () => {
  const app = useApp();
  
  const {
    language,
    setLanguage,
    storageMode,
    setStorageMode,
    templateManagement,
    fileSystem,
    SYSTEM_DATA_VERSION,
    categories,
    t,
    isDarkMode,
  } = app;

  return (
    <SettingsView
      language={language}
      setLanguage={setLanguage}
      storageMode={storageMode}
      setStorageMode={setStorageMode}
      handleImportTemplate={(e) => templateManagement.handleImportTemplate(e, app.setCategories)}
      handleExportAllTemplates={() => templateManagement.handleExportAllTemplates(categories)}
      handleResetSystemData={templateManagement.handleRefreshSystemData}
      handleClearAllData={() => {
        // 从 storageService 导入
        import('../../services/storageService').then(({ clearAllData }) => {
          clearAllData(t);
        });
      }}
      handleSelectDirectory={fileSystem.handleSelectDirectory}
      handleSwitchToLocalStorage={fileSystem.handleSwitchToLocalStorage}
      SYSTEM_DATA_VERSION={SYSTEM_DATA_VERSION}
      t={t}
      isDarkMode={isDarkMode}
    />
  );
};

