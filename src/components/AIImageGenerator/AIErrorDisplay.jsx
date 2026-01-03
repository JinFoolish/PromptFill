import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '../ui/button';

/**
 * AI 图像生成器错误显示组件
 */
export const AIErrorDisplay = ({ error, onClose, isDarkMode, t }) => {
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
          onClick={onClose}
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

