import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  Globe, 
  Image, 
  ChevronDown, 
  ChevronRight, 
  Check, 
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

export const AIConfigPanel = ({ 
  language, 
  isDarkMode, 
  t,
  onConfigUpdate 
}) => {
  const [providers, setProviders] = useState([]);
  const [activeProvider, setActiveProvider] = useState('');
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    provider: true,
    model: true,
    parameters: false
  });

  // Load configuration on component mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we're in Wails environment
      const isWails = window.go && window.go.main && window.go.main.App;
      
      if (isWails) {
        // Desktop version - call Go backend
        const response = await window.go.main.App.GetAIConfig();
        if (response.success) {
          setProviders(response.data.providers || []);
          setActiveProvider(response.data.activeProvider || '');
          setConfig(response.data.config || {});
        } else {
          throw new Error(response.error || 'Failed to load configuration');
        }
      } else {
        // Web version - call API endpoint
        const response = await fetch('/api/v1/config');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setProviders(data.providers || []);
        setActiveProvider(data.activeProvider || '');
        setConfig(data.config || {});
      }
    } catch (err) {
      console.error('Failed to load AI configuration:', err);
      setError(err.message);
      // Set default values for offline development
      setProviders([
        {
          id: 'dashscope',
          name: '阿里云百炼',
          models: ['z-image-turbo'],
          sizeOptions: ['1536*1536', '1296*1728', '1728*1296']
        }
      ]);
      setActiveProvider('dashscope');
      setConfig({
        apiKey: '',
        model: 'z-image-turbo',
        size: '1536*1536'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateConfiguration = (providerConfig) => {
    const errors = {};
    
    if (!providerConfig.apiKey || providerConfig.apiKey.trim() === '') {
      errors.apiKey = language === 'cn' ? 'API Key 不能为空' : 'API Key is required';
    }
    
    if (!providerConfig.model) {
      errors.model = language === 'cn' ? '请选择模型' : 'Model is required';
    }
    
    if (!providerConfig.size) {
      errors.size = language === 'cn' ? '请选择图像尺寸' : 'Image size is required';
    }
    
    return errors;
  };

  const handleProviderChange = (providerId) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      setActiveProvider(providerId);
      // Reset config to defaults for new provider
      setConfig({
        apiKey: config.apiKey || '',
        model: provider.models[0] || '',
        size: provider.sizeOptions?.[0] || '1536*1536'
      });
      setValidationErrors({});
    }
  };

  const handleConfigChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Validate configuration
      const errors = validateConfiguration(config);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
      
      const configData = {
        provider: activeProvider,
        config: config
      };
      
      // Check if we're in Wails environment
      const isWails = window.go && window.go.main && window.go.main.App;
      
      if (isWails) {
        // Desktop version - call Go backend
        const response = await window.go.main.App.SaveAIConfig(configData);
        if (!response.success) {
          throw new Error(response.error || 'Failed to save configuration');
        }
      } else {
        // Web version - call API endpoint
        const response = await fetch('/api/v1/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(configData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
      }
      
      // Notify parent component of successful update
      if (onConfigUpdate) {
        onConfigUpdate(configData);
      }
      
      // Show success message briefly
      const successMessage = language === 'cn' ? '配置已保存' : 'Configuration saved';
      // You could add a toast notification here
      
    } catch (err) {
      console.error('Failed to save AI configuration:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const currentProvider = providers.find(p => p.id === activeProvider);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-orange-500" />
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'cn' ? '加载配置中...' : 'Loading configuration...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-orange-500/20' : 'bg-orange-500/10'}`}>
          <Image size={20} className="text-orange-500" />
        </div>
        <div>
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {language === 'cn' ? 'AI 图像生成配置' : 'AI Image Generation Config'}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'cn' ? '配置 AI 服务提供商和生成参数' : 'Configure AI service providers and generation parameters'}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span className="text-sm font-medium">
              {language === 'cn' ? '配置错误' : 'Configuration Error'}
            </span>
          </div>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Provider Selection */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection('provider')}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}
        >
          <div className="flex items-center gap-2">
            <Globe size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {language === 'cn' ? '服务提供商' : 'Service Provider'}
            </span>
          </div>
          {expandedSections.provider ? 
            <ChevronDown size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} /> :
            <ChevronRight size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
          }
        </button>

        {expandedSections.provider && (
          <div className="space-y-2 pl-4">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleProviderChange(provider.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                  activeProvider === provider.id
                    ? (isDarkMode ? 'bg-orange-500/20 border-orange-500/30' : 'bg-orange-500/10 border-orange-500/20')
                    : (isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100')
                } border`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activeProvider === provider.id ? 'bg-orange-500' : (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')
                  }`} />
                  <span className={`font-medium ${
                    activeProvider === provider.id 
                      ? 'text-orange-600' 
                      : (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                  }`}>
                    {provider.name}
                  </span>
                </div>
                {activeProvider === provider.id && (
                  <Check size={16} className="text-orange-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* API Key Configuration */}
      {currentProvider && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Key size={14} className="inline mr-2" />
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey || ''}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                placeholder={language === 'cn' ? '输入 API Key...' : 'Enter API Key...'}
                className={`w-full px-3 py-2 pr-10 rounded-lg border transition-colors ${
                  validationErrors.apiKey
                    ? 'border-red-500 focus:border-red-500'
                    : (isDarkMode 
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-orange-500' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500')
                } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {validationErrors.apiKey && (
              <p className="text-sm text-red-500">{validationErrors.apiKey}</p>
            )}
          </div>

          {/* Model Selection */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('model')}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}
            >
              <div className="flex items-center gap-2">
                <Settings size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {language === 'cn' ? '模型设置' : 'Model Settings'}
                </span>
              </div>
              {expandedSections.model ? 
                <ChevronDown size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} /> :
                <ChevronRight size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              }
            </button>

            {expandedSections.model && (
              <div className="space-y-4 pl-4">
                {/* Model Selection */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {language === 'cn' ? '模型' : 'Model'}
                  </label>
                  <select
                    value={config.model || ''}
                    onChange={(e) => handleConfigChange('model', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      validationErrors.model
                        ? 'border-red-500 focus:border-red-500'
                        : (isDarkMode 
                            ? 'bg-white/5 border-white/10 text-white focus:border-orange-500' 
                            : 'bg-white border-gray-200 text-gray-900 focus:border-orange-500')
                    } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                  >
                    <option value="">
                      {language === 'cn' ? '选择模型...' : 'Select model...'}
                    </option>
                    {currentProvider.models?.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                  {validationErrors.model && (
                    <p className="text-sm text-red-500">{validationErrors.model}</p>
                  )}
                </div>

                {/* Size Selection */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {language === 'cn' ? '图像尺寸' : 'Image Size'}
                  </label>
                  <select
                    value={config.size || ''}
                    onChange={(e) => handleConfigChange('size', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      validationErrors.size
                        ? 'border-red-500 focus:border-red-500'
                        : (isDarkMode 
                            ? 'bg-white/5 border-white/10 text-white focus:border-orange-500' 
                            : 'bg-white border-gray-200 text-gray-900 focus:border-orange-500')
                    } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                  >
                    <option value="">
                      {language === 'cn' ? '选择尺寸...' : 'Select size...'}
                    </option>
                    {currentProvider.sizeOptions?.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  {validationErrors.size && (
                    <p className="text-sm text-red-500">{validationErrors.size}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-white/10">
            <button
              onClick={handleSaveConfiguration}
              disabled={saving || Object.keys(validationErrors).length > 0}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                saving || Object.keys(validationErrors).length > 0
                  ? (isDarkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl active:scale-[0.98]'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {language === 'cn' ? '保存中...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Check size={16} />
                  {language === 'cn' ? '保存配置' : 'Save Configuration'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};