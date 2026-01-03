import React, { useState } from 'react';
import { 
  Database, Download, Upload, 
  Trash2, Mail, MessageCircle, Github, 
  ChevronRight, RefreshCw, FolderOpen,
  Image as ImageIcon, FileText
} from 'lucide-react';
import { Modal } from './Modal';
import { SimpleAIConfig } from './SimpleAIConfig';
import { updateLogsCN, updateLogsEN } from '../constants/updateLogs';

export const SettingsView = ({ 
  language, setLanguage, 
  storageMode, setStorageMode,
  handleImportTemplate, handleExportAllTemplates,
  handleResetSystemData, handleClearAllData,
  handleSelectDirectory, handleSwitchToLocalStorage,
  SYSTEM_DATA_VERSION, t,
  globalContainerStyle,
  isDarkMode
}) => {
  const [showWechatQR, setShowWechatQR] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showUpdateLogs, setShowUpdateLogs] = useState(false);

  // 获取当前语言的日志
  const currentLogs = language === 'cn' ? updateLogsCN : updateLogsEN;

  // --- UI Components ---

  const SettingCard = ({ title, children, className = "" }) => (
    <div className={`rounded-[24px] border p-5 flex flex-col gap-2 shadow-sm ${isDarkMode ? 'bg-[#1E1E1E] border-white/5' : 'bg-white border-gray-100'} ${className}`}>
      {title && (
        <h3 className={`text-[10px] font-black uppercase tracking-[0.15em] mb-2 pl-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );

  const SettingItem = ({ icon: Icon, label, value, onClick, disabled = false, danger = false, active = false, description }) => (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left w-full
        ${disabled ? 'opacity-40 cursor-not-allowed' : active 
          ? (isDarkMode ? 'bg-orange-500/20' : 'bg-orange-50') 
          : (isDarkMode ? 'hover:bg-white/5 active:scale-[0.99]' : 'hover:bg-gray-50 active:scale-[0.99]')}
      `}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200
          ${active 
            ? 'bg-orange-500/20 text-orange-600' 
            : (isDarkMode ? 'bg-gray-800 text-gray-400 group-hover:text-gray-200' : 'bg-gray-100 text-gray-500 group-hover:text-gray-700')}
          ${danger && !active ? 'bg-red-50 text-red-500 group-hover:bg-red-100 group-hover:text-red-600' : ''}
        `}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className={`text-[13px] font-bold tracking-tight truncate ${danger ? 'text-red-600' : active ? 'text-orange-600' : (isDarkMode ? 'text-gray-300' : 'text-gray-800')}`}>
            {label}
          </div>
          {description && (
            <div className={`text-[10px] font-medium truncate ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {description}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 pl-3">
        {value && (
          <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
            active 
              ? 'bg-orange-500/20 text-orange-600'
              : (isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-500')
          }`}>
            {value}
          </span>
        )}
        {!disabled && (
          <ChevronRight size={14} className={`transition-colors opacity-50 ${active ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
        )}
      </div>
    </button>
  );

  return (
    <div style={globalContainerStyle} className="flex-1 flex flex-col h-full overflow-hidden relative">
      
      {/* 1. Header Area */}
      <div className="px-8 pt-10 pb-6 flex-shrink-0 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div>
          <h1 className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('settings_title')}
          </h1>
          <p className={`text-[11px] font-bold mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            System V0.6.1 • Data {SYSTEM_DATA_VERSION}
          </p>
        </div>
        <div className="flex gap-2">
           {/* Header Actions if needed */}
        </div>
      </div>

      {/* 2. Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Column 1: Core Preferences */}
          <div className="flex flex-col gap-6">
            <SettingCard title={t('general')}>
              <SettingItem 
                icon={() => <img 
                  src="/translate.svg" 
                  alt="translate" 
                  className="w-5 h-5" 
                  style={{
                    filter: isDarkMode 
                      ? 'brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(60%) contrast(100%)' 
                      : 'brightness(0) saturate(100%) invert(40%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(60%) contrast(100%)'
                  }}
                />} 
                label={t('interface_language')} 
                description={t('switch_ui_language')}
                value={t(language === 'cn' ? 'chinese' : 'english')} 
                onClick={() => setLanguage(language === 'cn' ? 'en' : 'cn')}
              />
              <SettingItem 
                icon={ImageIcon} 
                label={t('ai_image_generation_config')}
                description={t('configure_api_keys_models')} 
                onClick={() => setShowAIConfig(true)}
              />
            </SettingCard>

            <SettingCard title={t('storage_location')}>
              <SettingItem 
                icon={Database} 
                label={t('browser_storage')}
                description={t('fast_simplified_storage')}
                active={storageMode === 'browser'}
                onClick={handleSwitchToLocalStorage}
              />
              <SettingItem 
                icon={FolderOpen} 
                label={t('local_directory')}
                description={t('sync_local_filesystem')}
                active={storageMode === 'folder'}
                onClick={handleSelectDirectory}
              />
            </SettingCard>
          </div>

          {/* Column 2: Data & System */}
          <div className="flex flex-col gap-6">
            <SettingCard title={t('data_management')}>
              <div className="relative">
                <input type="file" accept=".json" onChange={handleImportTemplate} className="hidden" id="import-json" />
                <label htmlFor="import-json">
                   <SettingItem 
                    icon={Download} 
                    label={t('import_json')}
                    description={t('restore_from_backup')}
                  />
                </label>
              </div>
              <SettingItem 
                icon={Upload} 
                label={t('export_all')} 
                description={t('backup_all_templates')}
                onClick={handleExportAllTemplates} 
              />
              <div className={`w-full h-[1px] my-1 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
              <SettingItem 
                icon={RefreshCw} 
                label={t('reset_defaults')} 
                onClick={handleResetSystemData} 
              />
              <SettingItem 
                icon={Trash2} 
                label={t('clear_all_data')} 
                danger={true}
                onClick={handleClearAllData} 
              />
            </SettingCard>

            <SettingCard title={t('about')}>
              <SettingItem 
                icon={FileText} 
                label={t('changelog')} 
                value="V0.6.1"
                onClick={() => setShowUpdateLogs(true)}
              />
              <SettingItem 
                icon={MessageCircle} 
                label={t('contact_wechat')} 
                onClick={() => setShowWechatQR(true)}
              />
               <SettingItem 
                icon={Mail} 
                label={t('send_feedback')} 
                onClick={() => window.location.href = 'mailto:tanshilong@gmail.com'}
              />
              <SettingItem 
                icon={Github} 
                label={t('github')} 
                description={t('open_source_repository')}
                onClick={() => window.open('https://github.com/TanShilongMario/PromptFill', '_blank')}
              />
            </SettingCard>

            <div className="px-2">
               <p className={`text-[11px] font-bold leading-relaxed text-center opacity-60 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('built_for_creators')}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* --- Modals --- */}

      {/* Update Logs Modal */}
      <Modal
        isOpen={showUpdateLogs}
        onClose={() => setShowUpdateLogs(false)}
        title={t('changelog')}
        subtitle={t('timeline_changes_improvements')}
        isDarkMode={isDarkMode}
        maxWidth="max-w-3xl"
        maxHeight="h-[85vh]"
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-10 pl-2">
            {currentLogs.map((log, idx) => (
              <div key={idx} className="flex gap-6 group">
                {/* Timeline Line */}
                <div className="relative flex flex-col items-center flex-shrink-0">
                  <div className={`w-[1.5px] h-full absolute top-3 group-last:hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                  <div className={`w-3 h-3 rounded-full border-[2.5px] border-orange-500 z-10 shadow-[0_0_10px_rgba(249,115,22,0.3)] ${isDarkMode ? 'bg-[#181818]' : 'bg-white'}`} />
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                   <div className="flex flex-wrap items-baseline gap-3 mb-2">
                     <span className={`text-[11px] font-black px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                       {log.version}
                     </span>
                     <span className={`text-[11px] font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                       {log.date}
                     </span>
                     <span className={`px-1.5 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ml-auto ${
                        log.type === 'MAJOR' ? 'bg-red-500 text-white' : 
                        log.type === 'NEW' ? 'bg-blue-500 text-white' : (isDarkMode ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-500')
                      }`}>
                        {log.type}
                      </span>
                   </div>
                   
                  <h3 className={`text-base font-black tracking-tight mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {log.title}
                  </h3>
                  
                  <ul className="space-y-2.5">
                    {log.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-400'}`} />
                        <p className={`text-[13px] leading-relaxed font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* AI Config Modal */}
      <Modal
        isOpen={showAIConfig}
        onClose={() => setShowAIConfig(false)}
        title={t('ai_config_title')}
        subtitle={t('ai_config_subtitle')}
        isDarkMode={isDarkMode}
      >
        <SimpleAIConfig 
          language={language}
          isDarkMode={isDarkMode}
          onClose={() => setShowAIConfig(false)}
        />
      </Modal>

      {/* WeChat QR Modal */}
      <Modal
        isOpen={showWechatQR}
        onClose={() => setShowWechatQR(false)}
        isDarkMode={isDarkMode}
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center">
          <div className={`w-56 h-56 rounded-2xl overflow-hidden mb-6 border p-2 shadow-inner ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
            <img 
              src="/Wechat.jpg" 
              alt="WeChat QR Code" 
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <p className={`text-base font-black mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('scan_to_connect')}
          </p>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            TanShilongMario
          </p>
        </div>
      </Modal>

    </div>
  );
};