/**
 * AI 图像生成器主组件
 * 已重构：使用子组件分离关注点
 */

import { useState, useEffect } from 'react';
import { AIErrorDisplay } from './AIErrorDisplay';
import { AIGenerateButton } from './AIGenerateButton';
import { AIConfigDialog, AIConfigButton } from './AIConfigDialog';
import { loadConfiguration, loadProviders, generateImage } from './utils/aiImageGeneratorApi';

/**
 * AI 图像生成器组件
 */
export const AIImageGenerator = ({ 
  prompt, 
  parameters = {},
  onImageGenerated, 
  isDarkMode = false, 
  t = (key) => key,
  className = "" 
}) => {
  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  // 配置状态
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState({
    provider: 'dashscope',
    model: 'z-image-turbo',
    size: '1536*1536',
    parameters: parameters
  });
  
  // 临时配置状态（用于Modal中的编辑）
  const [tempConfig, setTempConfig] = useState({
    provider: 'dashscope',
    model: 'z-image-turbo',
    size: '1536*1536',
    parameters: parameters
  });

  // 可用的配置选项
  const [providers, setProviders] = useState([]);
  const [providerInfo, setProviderInfo] = useState({});
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // 当 parameters prop 变化时，更新 config
  useEffect(() => {
    setConfig(prev => ({ ...prev, parameters }));
    setTempConfig(prev => ({ ...prev, parameters }));
  }, [parameters]);

  // 加载配置和提供商信息
  useEffect(() => {
    loadConfigurationData();
    loadProvidersData();
  }, []);

  const loadConfigurationData = async () => {
    setIsLoadingConfig(true);
    try {
      const data = await loadConfiguration();
      if (data?.providers && data.providers.length > 0) {
        const activeProvider = data.activeProvider || data.providers[0].id;
        const activeProviderConfig = data.providers.find(p => p.id === activeProvider);
        
        const newConfig = {
          provider: activeProvider,
          model: activeProviderConfig?.defaultModel || activeProviderConfig?.models?.[0] || config.model,
          size: config.size,
          parameters: config.parameters
        };
        
        setConfig(newConfig);
        setTempConfig(newConfig);
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const loadProvidersData = async () => {
    try {
      const providersList = await loadProviders();
      setProviders(providersList);
      
      // 构建提供商信息映射
      const infoMap = {};
      providersList.forEach(provider => {
        infoMap[provider.id] = provider;
      });
      setProviderInfo(infoMap);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  // 生成图像
  const handleGenerate = async () => {
    if (!prompt?.trim()) {
      setError({
        code: 'EMPTY_PROMPT',
        message: t('error_empty_prompt') || '请输入提示词',
        provider: 'system'
      });
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateImage({
        prompt: prompt.trim(),
        provider: config.provider,
        model: config.model,
        size: config.size,
        parameters: config.parameters
      });

      if (result.success && result.images) {
        // 转换图像格式以匹配现有接口
        const generatedImages = result.images.map(img => ({
          id: img.id,
          url: img.url,
          prompt: prompt.trim(),
          timestamp: Date.now(),
          provider: config.provider,
          model: config.model,
          parameters: config.parameters,
          width: img.width,
          height: img.height
        }));

        // 调用回调函数
        if (onImageGenerated) {
          onImageGenerated(generatedImages);
        }
      } else if (result.error) {
        setError(result.error);
      } else {
        setError({
          code: 'UNKNOWN_ERROR',
          message: t('error_unknown') || '未知错误',
          provider: config.provider
        });
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setError({
        code: 'NETWORK_ERROR',
        message: t('error_network') || '网络错误，请检查连接',
        provider: 'system'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 更新临时配置
  const updateTempConfig = (key, value) => {
    setTempConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 确认配置更改
  const handleConfirmConfig = () => {
    setConfig(tempConfig);
    setIsConfigOpen(false);
  };

  // 取消配置更改
  const handleCancelConfig = () => {
    setTempConfig(config); // 重置为当前配置
    setIsConfigOpen(false);
  };

  // 打开配置Modal时，初始化临时配置
  const handleOpenConfig = () => {
    setTempConfig(config);
    setIsConfigOpen(true);
  };

  return (
    <div className={`relative ${className}`}>
      {/* 错误显示 */}
      <AIErrorDisplay 
        error={error} 
        onClose={() => setError(null)} 
        isDarkMode={isDarkMode} 
        t={t} 
      />

      {/* 按钮行 */}
      <div className="flex gap-2 mb-3">
        {/* 生成按钮 */}
        <AIGenerateButton
          isGenerating={isGenerating}
          isLoadingConfig={isLoadingConfig}
          hasPrompt={prompt?.trim()}
          onClick={handleGenerate}
          t={t}
        />

        {/* 配置按钮 */}
        <AIConfigButton
          onClick={handleOpenConfig}
          isLoadingConfig={isLoadingConfig}
          t={t}
        />
      </div>

      {/* 配置Dialog */}
      <AIConfigDialog
        isOpen={isConfigOpen}
        onOpenChange={(open) => !open && handleCancelConfig()}
        tempConfig={tempConfig}
        updateTempConfig={updateTempConfig}
        providerInfo={providerInfo}
        providers={providers}
        isLoadingConfig={isLoadingConfig}
        onConfirm={handleConfirmConfig}
        onCancel={handleCancelConfig}
        isDarkMode={isDarkMode}
        t={t}
      />
    </div>
  );
};

