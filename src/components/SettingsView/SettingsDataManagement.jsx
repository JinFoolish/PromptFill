import React from 'react';
import { Download, Upload, RefreshCw, Trash2 } from 'lucide-react';
import { SettingCard } from './SettingCard';
import { SettingItem } from './SettingItem';

/**
 * 数据管理设置卡片组件
 */
export const SettingsDataManagement = ({ 
  handleImportTemplate,
  handleExportAllTemplates,
  handleResetSystemData,
  handleClearAllData,
  t, 
  isDarkMode 
}) => {
  return (
    <SettingCard title={t('data_management')} isDarkMode={isDarkMode}>
      <div className="relative">
        <input type="file" accept=".json" onChange={handleImportTemplate} className="hidden" id="import-json" />
        <label htmlFor="import-json">
          <SettingItem 
            icon={Download} 
            label={t('import_json')}
            description={t('restore_from_backup')}
            isDarkMode={isDarkMode}
          />
        </label>
      </div>
      <SettingItem 
        icon={Upload} 
        label={t('export_all')} 
        description={t('backup_all_templates')}
        onClick={handleExportAllTemplates} 
        isDarkMode={isDarkMode}
      />
      <div className={`w-full h-[1px] my-1 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
      <SettingItem 
        icon={RefreshCw} 
        label={t('reset_defaults')} 
        onClick={handleResetSystemData} 
        isDarkMode={isDarkMode}
      />
      <SettingItem 
        icon={Trash2} 
        label={t('clear_all_data')} 
        danger={true}
        onClick={handleClearAllData} 
        isDarkMode={isDarkMode}
      />
    </SettingCard>
  );
};

