import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * 历史记录错误状态组件
 */
export const HistoryErrorState = ({ error, onRetry, className = "", t }) => {
  return (
    <div className={`flex-1 flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('error_loading_history') || '加载失败'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          {t('retry') || '重试'}
        </button>
      </div>
    </div>
  );
};

