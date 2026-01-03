import React from 'react';
import { Database, FolderOpen } from 'lucide-react';
import { SettingCard } from './SettingCard';
import { SettingItem } from './SettingItem';

/**
 * 存储设置卡片组件
 */
export const SettingsStorage = ({ 
  storageMode,
  handleSwitchToLocalStorage,
  handleSelectDirectory,
  t, 
  isDarkMode 
}) => {
  return (
    <SettingCard title={t('storage_location')} isDarkMode={isDarkMode}>
      <SettingItem 
        icon={Database} 
        label={t('browser_storage')}
        description={t('fast_simplified_storage')}
        active={storageMode === 'browser'}
        onClick={handleSwitchToLocalStorage}
        isDarkMode={isDarkMode}
      />
      <SettingItem 
        icon={FolderOpen} 
        label={t('local_directory')}
        description={t('sync_local_filesystem')}
        active={storageMode === 'folder'}
        onClick={handleSelectDirectory}
        isDarkMode={isDarkMode}
      />
    </SettingCard>
  );
};

