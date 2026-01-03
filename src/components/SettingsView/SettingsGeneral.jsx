import React from 'react';
import { Languages, Image as ImageIcon } from 'lucide-react';
import { SettingCard } from './SettingCard';
import { SettingItem } from './SettingItem';

/**
 * 通用设置卡片组件
 */
export const SettingsGeneral = ({ 
  language, 
  setLanguage, 
  onOpenAIConfig,
  t, 
  isDarkMode 
}) => {
  return (
    <SettingCard title={t('general')} isDarkMode={isDarkMode}>
      <SettingItem 
        icon={Languages}
        label={t('interface_language')} 
        description={t('switch_ui_language')}
        value={t(language === 'cn' ? 'chinese' : 'english')} 
        onClick={() => setLanguage(language === 'cn' ? 'en' : 'cn')}
        isDarkMode={isDarkMode}
      />
      <SettingItem 
        icon={ImageIcon} 
        label={t('ai_image_generation_config')}
        description={t('configure_api_keys_models')} 
        onClick={onOpenAIConfig}
        isDarkMode={isDarkMode}
      />
    </SettingCard>
  );
};

