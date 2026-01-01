// AI 图像生成器组件
import React, { useState, useEffect } from 'react';
import { Sparkles, Settings, Image as ImageIcon, Loader2, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { PremiumButton } from './PremiumButton';

export const AIImageGenerator = ({ 
  prompt, 
  onImageGenerated, 
  isDarkMode = false, 
  t = (key) => key,
  className = "" 
}) => {
  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const [error, setError] = useState(null);
  
  // 配置状态
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState({
    provider: 'dashscope',
    model: 'z-image-turbo',
    count: 1,
    size: '1536*1536',
    parameters: {}
  });
  
  // 可用的配置选项
  const [providers, setProviders] = useState([]);
  const [providerInfo, setProviderInfo] = useState({});
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // 加载配置和提供商信息
  useEffect(() => {
    loadConfiguration();
    loadProviders();
  }, []);

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/v1/config');
      if (response.ok) {
        const data = await response.json();
        if (data.providers && data.providers.length > 0) {
          const activeProvider = data.activeProvider || data.providers[0].id;
          const activeProviderConfig = data.providers.find(p => p.id === activeProvider);
          
          setConfig(prev => ({
            ...prev,
            provider: activeProvider,
            model: activeProviderConfig?.defaultModel || activeProviderConfig?.models?.[0] || prev.model
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const loadProviders = async () => {
    try {
      const response = await fetch('/api/v1/providers');
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers || []);
        
        // 构建提供商信息映射
        const infoMap = {};
        data.providers?.forEach(provider => {
          infoMap[provider.id] = provider;
        });
        setProviderInfo(infoMap);
      }
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
    setGenerationProgress(0);
    setGenerationStatus(t('generating_status_preparing') || '准备生成...');

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      const generateRequest = {
        prompt: prompt.trim(),
        provider: config.provider,
        model: config.model,
        count: config.count,
        size: config.size,
        parameters: config.parameters
      };

      setGenerationStatus(t('generating_status_calling_api') || '调用AI服务...');

      const response = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generateRequest)
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      const result = await response.json();

      if (result.success && result.images) {
        setGenerationStatus(t('generating_status_success') || '生成完成');
        
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

        // 重置状态
        setTimeout(() => {
          setGenerationProgress(0);
          setGenerationStatus('');
        }, 2000);

      } else if (result.error) {
        setError(result.error);
        setGenerationStatus(t('generating_status_failed') || '生成失败');
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
      setGenerationStatus(t('generating_status_failed') || '生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  // 更新配置
  const updateConfig = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 获取当前提供商的可用模型
  const getCurrentProviderModels = () => {
    const provider = providerInfo[config.provider];
    return provider?.models || [];
  };

  // 获取当前模型的可用尺寸
  const getCurrentModelSizes = () => {
    const provider = providerInfo[config.provider];
    if (provider?.sizeOptions) {
      return provider.sizeOptions[config.model] || provider.sizeOptions['default'] || [];
    }
    return ['1536*1536', '1024*1024', '512*512'];
  };

  // 渲染错误信息
  const renderError = () => {
    if (!error) return null;

    return (
      <div className={`p-4 rounded-xl border-l-4 border-red-500 ${isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'} mb-4`}>
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium mb-1">
              {t('generation_failed')} ({error.code})
            </div>
            <div className="text-sm opacity-90">
              {error.message}
            </div>
            {error.provider && error.provider !== 'system' && (
              <div className="text-xs opacity-70 mt-1">
                {t('provider')}: {error.provider}
              </div>
            )}
          </div>
          <button
            onClick={() => setError(null)}
            className={`p-1 rounded-full hover:bg-red-500/20 transition-colors`}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  };

  // 渲染进度条
  const renderProgress = () => {
    if (!isGenerating && generationProgress === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {generationStatus}
          </span>
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {Math.round(generationProgress)}%
          </span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 ease-out"
            style={{ width: `${generationProgress}%` }}
          />
        </div>
      </div>
    );
  };

  // 渲染配置面板
  const renderConfigPanel = () => {
    if (!isConfigOpen) return null;

    return (
      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} mb-4`}>
        <div className="space-y-4">
          {/* 服务提供商选择 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('provider') || '服务提供商'}
            </label>
            <select
              value={config.provider}
              onChange={(e) => {
                const newProvider = e.target.value;
                const providerData = providerInfo[newProvider];
                updateConfig('provider', newProvider);
                if (providerData?.models?.[0]) {
                  updateConfig('model', providerData.defaultModel || providerData.models[0]);
                }
              }}
              disabled={isLoadingConfig}
              className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
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
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('model') || '模型'}
            </label>
            <select
              value={config.model}
              onChange={(e) => updateConfig('model', e.target.value)}
              className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            >
              {getCurrentProviderModels().map(model => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* 生成数量 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('count') || '生成数量'}
            </label>
            <select
              value={config.count}
              onChange={(e) => updateConfig('count', parseInt(e.target.value))}
              className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? (t('image') || '张') : (t('images') || '张')}
                </option>
              ))}
            </select>
          </div>

          {/* 图像尺寸 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('size') || '图像尺寸'}
            </label>
            <select
              value={config.size}
              onChange={(e) => updateConfig('size', e.target.value)}
              className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            >
              {getCurrentModelSizes().map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {/* 错误显示 */}
      {renderError()}

      {/* 进度显示 */}
      {renderProgress()}

      {/* 配置面板 */}
      {renderConfigPanel()}

      {/* 主要操作按钮 */}
      <div className="flex gap-3">
        {/* 生成按钮 */}
        <PremiumButton
          onClick={handleGenerate}
          disabled={isGenerating || !prompt?.trim() || isLoadingConfig}
          active={true}
          color="orange"
          isDarkMode={isDarkMode}
          className="flex-1 py-3 text-base font-bold"
          icon={isGenerating ? Loader2 : Sparkles}
        >
          <span className={isGenerating ? 'animate-spin' : ''}>
            {isGenerating ? (
              config.count > 1 
                ? `${t('generating_batch') || '批量生成中'}...` 
                : `${t('generating') || '生成中'}...`
            ) : (
              config.count > 1 
                ? `${t('generate_batch')} (${config.count}${t('images') || '张'})` 
                : (t('generate_image') || '生成图片')
            )}
          </span>
        </PremiumButton>

        {/* 配置按钮 */}
        <PremiumButton
          onClick={() => setIsConfigOpen(!isConfigOpen)}
          active={isConfigOpen}
          color="slate"
          hoverColor="orange"
          isDarkMode={isDarkMode}
          className="px-4 py-3"
          icon={isConfigOpen ? ChevronUp : (isLoadingConfig ? Loader2 : Settings)}
          title={t('settings') || '设置'}
        >
          <span className={isLoadingConfig ? 'animate-spin' : ''} />
        </PremiumButton>
      </div>

      {/* 配置信息显示 */}
      {!isConfigOpen && !isLoadingConfig && (
        <div className={`mt-3 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
          {config.provider} · {config.model} · {config.size}
          {config.count > 1 && ` · ${config.count}${t('images') || '张'}`}
        </div>
      )}
    </div>
  );
};