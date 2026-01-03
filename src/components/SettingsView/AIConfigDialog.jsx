import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

const SimpleAIConfig = ({ language, isDarkMode, onClose }) => {
  const [provider, setProvider] = useState('dashscope');
  const [apiKey, setApiKey] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [keyPreview, setKeyPreview] = useState('');
  const [status, setStatus] = useState(null); // null, 'success', 'error'
  const [message, setMessage] = useState('');

  const providers = [
    { id: 'dashscope', name: 'DashScope (阿里云)', label: language === 'cn' ? '阿里云 DashScope' : 'Alibaba DashScope' },
    { id: 'openai', name: 'OpenAI DALL-E', label: 'OpenAI DALL-E' },
    { id: 'stability', name: 'Stability AI', label: 'Stability AI' }
  ];

  // Load existing config from backend
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/v1/config');
        if (response.ok) {
          const data = await response.json();
          if (data.activeProvider) {
            setProvider(data.activeProvider);
            // Find the active provider's config
            const activeProviderConfig = data.providers.find(p => p.id === data.activeProvider);
            if (activeProviderConfig && activeProviderConfig.apiKey) {
                setHasExistingKey(true);
                setKeyPreview(activeProviderConfig.apiKey);
                setApiKey(''); // Don't set the masked key as the actual value
              
            }
          }
        }
      } catch (error) {
        console.error('Failed to load AI config:', error);
        // Fallback to localStorage for backward compatibility
        try {
          const saved = localStorage.getItem('ai_image_config');
          if (saved) {
            const config = JSON.parse(saved);
            setProvider(config.provider || 'dashscope');
            setApiKey(config.apiKey || '');
            setHasExistingKey(false);
          }
        } catch (fallbackError) {
          console.error('Failed to load fallback config:', fallbackError);
        }
      }
    };

    loadConfig();
  }, []);

  const handleSave = async () => {
    // If there's an existing key and no new key is entered, keep current config
    if (!apiKey.trim() && hasExistingKey) {
      setStatus('success');
      setMessage(language === 'cn' ? '保持当前配置' : 'Current configuration maintained');
      setTimeout(() => {
        onClose();
      }, 1500);
      return;
    }

    // If no existing key and no new key entered, show error
    if (!apiKey.trim() && !hasExistingKey) {
      setStatus('error');
      setMessage(language === 'cn' ? 'API Key 不能为空' : 'API Key cannot be empty');
      return;
    }

    try {
      // Prepare the config request for backend API
      const configRequest = {
        provider: provider,
        config: {
          apiKey: apiKey.trim(),
          setActive: true // Set this provider as active
        }
      };

      const response = await fetch('/api/v1/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configRequest)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStatus('success');
          setMessage(language === 'cn' ? '配置保存成功！' : 'Configuration saved successfully!');
          
          // Auto close after success
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setStatus('error');
          setMessage(result.error || (language === 'cn' ? '保存失败，请重试' : 'Save failed, please try again'));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setStatus('error');
        setMessage(errorData.error || (language === 'cn' ? '保存失败，请重试' : 'Save failed, please try again'));
      }
      
    } catch (error) {
      console.error('Failed to save config:', error);
      setStatus('error');
      setMessage(language === 'cn' ? '网络错误，请检查连接' : 'Network error, please check connection');
    }
  };

  return (
    <div className="space-y-6 ">
      {/* Provider Selection */}
      <div>
        <label className={`block text-sm font-bold mb-3 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {language === 'cn' ? '服务提供商' : 'Service Provider'}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {providers.map((p) => (
            <label key={p.id} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="provider"
                value={p.id}
                checked={provider === p.id}
                onChange={(e) => setProvider(e.target.value)}
                className="sr-only"
              />
              <div className={`flex items-center w-full p-3 rounded-xl border transition-all ${
                provider === p.id
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : (isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300')
              }`}>
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  provider === p.id
                    ? 'border-white bg-white'
                    : (isDarkMode ? 'border-gray-600' : 'border-gray-300')
                }`}>
                  {provider === p.id && (
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  provider === p.id
                    ? 'text-white'
                    : (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                }`}>
                  {p.label}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* API Key Input */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={`text-sm font-bold ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            API Key
          </label>
          {/* Show existing key preview if available */}
          {hasExistingKey && (
            <div className={`flex items-center ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <span className="text-xs font-medium">{keyPreview}</span>
              <span className={`ml-2 text-xs ${
                isDarkMode ? 'text-gray-600' : 'text-gray-500'
              }`}>
                ({language === 'cn' ? '已配置' : 'Configured'})
              </span>
            </div>
          )}
        </div>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={
            hasExistingKey 
              ? (language === 'cn' ? '输入新的 API Key 以更新配置' : 'Enter new API Key to update configuration')
              : (language === 'cn' ? '请输入您的 API Key' : 'Enter your API Key')
          }
          className={`w-full p-3 rounded-xl border text-sm font-medium transition-colors ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500' 
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
          } focus:outline-none`}
        />
      </div>

      {/* Status Message */}
      {status && (
        <div className={`flex items-center gap-2 p-3 rounded-xl ${
          status === 'success' 
            ? (isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600')
            : (isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600')
        }`}>
          {status === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span className="text-sm font-medium">{message}</span>
        </div>
      )}

      {/* Save Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSave}
            disabled={!apiKey.trim() && !hasExistingKey}
            variant="default"
            className="w-1/2 py-3 rounded-xl font-bold text-sm"
          >
            {hasExistingKey && !apiKey.trim() 
              ? (language === 'cn' ? '保持当前配置' : 'Keep Current Config')
              : (language === 'cn' ? '保存配置' : 'Save Configuration')
            }
          </Button>
        </div>
    </div>
  );
};

/**
 * AI 配置对话框组件
 */
export const AIConfigDialog = ({ isOpen, onOpenChange, language, t, isDarkMode }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('ai_config_title')}</DialogTitle>
          <DialogDescription>{t('ai_config_subtitle')}</DialogDescription>
        </DialogHeader>
        <SimpleAIConfig 
          language={language}
          isDarkMode={isDarkMode}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

