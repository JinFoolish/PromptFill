import React from 'react';
import { Loader2, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { getCurrentProviderModels, getCurrentModelSizes, formatSizeDisplay } from './utils/aiImageConfigHelpers';

/**
 * AI 图像生成器配置对话框组件
 */
export const AIConfigDialog = ({
  isOpen,
  onOpenChange,
  tempConfig,
  updateTempConfig,
  providerInfo,
  providers,
  isLoadingConfig,
  onConfirm,
  onCancel,
  isDarkMode,
  t
}) => {
  const getCurrentModels = () => getCurrentProviderModels(providerInfo, tempConfig.provider);
  const getCurrentSizes = () => getCurrentModelSizes(providerInfo, tempConfig.provider, tempConfig.model);

  const renderConfigContent = () => {
    return (
      <div className="space-y-6">
        {/* 服务提供商选择 */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('provider') || '服务提供商'}
          </label>
          <select
            value={tempConfig.provider}
            onChange={(e) => {
              const newProvider = e.target.value;
              const providerData = providerInfo[newProvider];
              updateTempConfig('provider', newProvider);
              if (providerData?.models?.[0]) {
                updateTempConfig('model', providerData.defaultModel || providerData.models[0]);
              }
            }}
            disabled={isLoadingConfig}
            className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
          >
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        {/* 模型选择 */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('model') || '模型'}
          </label>
          <select
            value={tempConfig.model}
            onChange={(e) => updateTempConfig('model', e.target.value)}
            className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
          >
            {getCurrentModels().map(model => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* 图像尺寸 */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('size') || '图像尺寸'}
          </label>
          <select
            value={tempConfig.size}
            onChange={(e) => updateTempConfig('size', e.target.value)}
            className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
          >
            {getCurrentSizes().map(size => (
              <option key={size} value={size}>
                {formatSizeDisplay(size)}
              </option>
            ))}
          </select>
        </div>

        {/* 按钮组 */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 py-3 px-4"
          >
            {t('cancel') || '取消'}
          </Button>
          <Button
            onClick={onConfirm}
            variant="default"
            className="flex-1 py-3 px-4"
          >
            {t('confirm') || '确认'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t('generation_settings') || '生成设置'}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto custom-scrollbar max-h-[calc(90vh-120px)]">
          {renderConfigContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * 配置按钮组件
 */
export const AIConfigButton = ({
  onClick,
  isLoadingConfig,
  t
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={isLoadingConfig}
      variant="outline"
      size="icon"
      className="p-2.5"
      title={t('generation_settings') || '生成设置'}
    >
      {isLoadingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
    </Button>
  );
};

