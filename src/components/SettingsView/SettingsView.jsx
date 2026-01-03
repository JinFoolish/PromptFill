/**
 * 设置视图主组件
 * 已重构：使用子组件分离关注点
 */

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { SettingsHeader } from './SettingsHeader';
import { SettingsGeneral } from './SettingsGeneral';
import { SettingsStorage } from './SettingsStorage';
import { SettingsDataManagement } from './SettingsDataManagement';
import { SettingsAbout } from './SettingsAbout';
import { UpdateLogsDialog } from './UpdateLogsDialog';
import { AIConfigDialog } from './AIConfigDialog';
import { WeChatQRDialog } from './WeChatQRDialog';

/**
 * 设置视图组件
 */
export const SettingsView = ({ 
  language, setLanguage, 
  storageMode, setStorageMode,
  handleImportTemplate, handleExportAllTemplates,
  handleResetSystemData, handleClearAllData,
  handleSelectDirectory, handleSwitchToLocalStorage,
  SYSTEM_DATA_VERSION, t,
  isDarkMode
}) => {
  const [showWechatQR, setShowWechatQR] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showUpdateLogs, setShowUpdateLogs] = useState(false);

  return (
    <Card variant="container" className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* 1. Header Area */}
      <SettingsHeader 
        SYSTEM_DATA_VERSION={SYSTEM_DATA_VERSION} 
        t={t} 
        isDarkMode={isDarkMode} 
      />

      {/* 2. Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Column 1: Core Preferences */}
          <div className="flex flex-col gap-6">
            <SettingsGeneral
              language={language}
              setLanguage={setLanguage}
              onOpenAIConfig={() => setShowAIConfig(true)}
              t={t}
              isDarkMode={isDarkMode}
            />

            <SettingsStorage
              storageMode={storageMode}
              handleSwitchToLocalStorage={handleSwitchToLocalStorage}
              handleSelectDirectory={handleSelectDirectory}
              t={t}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Column 2: Data & System */}
          <div className="flex flex-col gap-6">
            <SettingsDataManagement
              handleImportTemplate={handleImportTemplate}
              handleExportAllTemplates={handleExportAllTemplates}
              handleResetSystemData={handleResetSystemData}
              handleClearAllData={handleClearAllData}
              t={t}
              isDarkMode={isDarkMode}
            />

            <SettingsAbout
              onOpenUpdateLogs={() => setShowUpdateLogs(true)}
              onOpenWechatQR={() => setShowWechatQR(true)}
              t={t}
              isDarkMode={isDarkMode}
            />

            <div className="px-2">
              <p className={`text-[11px] font-bold leading-relaxed text-center opacity-60 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('built_for_creators')}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <UpdateLogsDialog
        isOpen={showUpdateLogs}
        onOpenChange={(open) => !open && setShowUpdateLogs(false)}
        language={language}
        t={t}
        isDarkMode={isDarkMode}
      />

      <AIConfigDialog
        isOpen={showAIConfig}
        onOpenChange={(open) => !open && setShowAIConfig(false)}
        language={language}
        t={t}
        isDarkMode={isDarkMode}
      />

      <WeChatQRDialog
        isOpen={showWechatQR}
        onOpenChange={(open) => !open && setShowWechatQR(false)}
        t={t}
        isDarkMode={isDarkMode}
      />
    </Card>
  );
};

