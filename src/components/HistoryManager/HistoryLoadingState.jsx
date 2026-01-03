import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * 历史记录加载状态组件
 */
export const HistoryLoadingState = ({ className = "", t }) => {
  return (
    <div className={`flex-1 flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('loading_history') || '加载历史记录...'}
        </p>
      </div>
    </div>
  );
};

