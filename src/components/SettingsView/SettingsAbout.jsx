import React from 'react';
import { FileText, MessageCircle, Mail, Github } from 'lucide-react';
import { SettingCard } from './SettingCard';
import { SettingItem } from './SettingItem';

/**
 * 关于设置卡片组件
 */
export const SettingsAbout = ({ 
  onOpenUpdateLogs,
  onOpenWechatQR,
  t, 
  isDarkMode 
}) => {
  return (
    <SettingCard title={t('about')} isDarkMode={isDarkMode}>
      <SettingItem 
        icon={FileText} 
        label={t('changelog')} 
        value="V0.6.1"
        onClick={onOpenUpdateLogs}
        isDarkMode={isDarkMode}
      />
      <SettingItem 
        icon={MessageCircle} 
        label={t('contact_wechat')} 
        onClick={onOpenWechatQR}
        isDarkMode={isDarkMode}
      />
      <SettingItem 
        icon={Mail} 
        label={t('send_feedback')} 
        onClick={() => window.location.href = 'mailto:tanshilong@gmail.com'}
        isDarkMode={isDarkMode}
      />
      <SettingItem 
        icon={Github} 
        label={t('github')} 
        description={t('open_source_repository')}
        onClick={() => window.open('https://github.com/TanShilongMario/PromptFill', '_blank')}
        isDarkMode={isDarkMode}
      />
    </SettingCard>
  );
};

