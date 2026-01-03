// AI 图像生成器组件
import { useState, useEffect } from 'react';
import { Sparkles, Settings, Loader2, AlertCircle, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

export const AIImageGenerator = ({ 
  prompt, 
  parameters = {}, // 接收模板变量参数
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
    parameters: parameters // 使用传入的 parameters
  });
  
  // 临时配置状态（用于Modal中的编辑）
  const [tempConfig, setTempConfig] = useState({
    provider: 'dashscope',
    model: 'z-image-turbo',
    size: '1536*1536',
    parameters: parameters // 使用传入的 parameters
  });

  // 当 parameters prop 变化时，更新 config
  useEffect(() => {
    setConfig(prev => ({ ...prev, parameters }));
    setTempConfig(prev => ({ ...prev, parameters }));
  }, [parameters]);
  
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
          
          // 同时更新临时配置
          setTempConfig(prev => ({
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
    try {
      const generateRequest = {
        prompt: prompt.trim(),
        provider: config.provider,
        model: config.model,
        size: config.size,
        parameters: config.parameters
      };
      const response = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generateRequest)
      });

      const result = await response.json();

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

  // 更新配置
  const updateConfig = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 获取当前提供商的可用模型（基于临时配置）
  const getCurrentProviderModels = () => {
    const provider = providerInfo[tempConfig.provider];
    return provider?.models || [];
  };

  // 获取当前模型的可用尺寸（基于临时配置）
  const getCurrentModelSizes = () => {
    const provider = providerInfo[tempConfig.provider];
    if (provider?.sizeOptions) {
      return provider.sizeOptions[tempConfig.model] || provider.sizeOptions['default'] || [];
    }
    return ['1536*1536', '1024*1024', '512*512'];
  };

  // 计算尺寸比例
  const getSizeRatio = (size) => {
    if (!size || !size.includes('*')) return '';
    
    const [width, height] = size.split('*').map(Number);
    if (!width || !height) return '';
    
    // 计算最大公约数
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    
    const ratioW = width / divisor;
    const ratioH = height / divisor;
    
    return `${ratioW}:${ratioH}`;
  };

  // 格式化尺寸显示
  const formatSizeDisplay = (size) => {
    const ratio = getSizeRatio(size);
    return ratio ? `${size} (${ratio})` : size;
  };

  // 渲染错误信息
  const renderError = () => {
    if (!error) return null;

    return (
      <div className={`p-3 rounded-lg border-l-4 border-red-500 mb-3 ${
        isDarkMode 
          ? 'bg-red-900/20 text-red-300' 
          : 'bg-red-50/80 text-red-700'
      }`}>
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm mb-1">
              {t('generation_failed')} ({error.code})
            </div>
            <div className="text-xs opacity-90 truncate">
              {error.message}
            </div>
          </div>
          <Button
            onClick={() => setError(null)}
            variant="ghost"
            size="icon"
            className="p-1 flex-shrink-0"
            title={t('close_error') || '关闭错误'}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // 渲染配置内容
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
            {getCurrentProviderModels().map(model => (
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
            {getCurrentModelSizes().map(size => (
              <option key={size} value={size}>
                {formatSizeDisplay(size)}
              </option>
            ))}
          </select>
        </div>

        {/* 按钮组 */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleCancelConfig}
            variant="outline"
            className="flex-1 py-3 px-4"
          >
            {t('cancel') || '取消'}
          </Button>
          <Button
            onClick={handleConfirmConfig}
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
    <div className={`relative ${className}`}>
      {/* 错误显示 */}
      {renderError()}

        {/* 按钮行 */}
        <div className="flex gap-2 mb-3">
          {/* 生成按钮 */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt?.trim() || isLoadingConfig}
            variant="default"
            className="w-32 py-2.5 px-4 text-sm font-bold justify-center"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? (
              `${t('generating') || '生成中'}...`
            ) : (
              t('generate_image') || '生成图片'
            )}
          </Button>

          {/* 配置按钮 */}
          <Button
            onClick={handleOpenConfig}
            disabled={isLoadingConfig}
            variant="outline"
            size="icon"
            className="p-2.5"
            title={t('generation_settings') || '生成设置'}
          >
            {isLoadingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
          </Button>
        </div>


      {/* 配置Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={(open) => !open && handleCancelConfig()}>
        <DialogContent className="max-w-md max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{t('generation_settings') || '生成设置'}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto custom-scrollbar max-h-[calc(90vh-120px)]">
            {renderConfigContent()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};