import React from 'react';
import { HardDrive } from 'lucide-react';
import { formatFileSize } from './utils/historyFormatters';

/**
 * 存储使用情况组件
 */
export const HistoryStorageUsage = ({ storageUsage, t }) => {
  return (
    <div className="w-full lg:flex-1 flex flex-col justify-center gap-1.5 px-4 py-2 rounded-lg border lg:mx-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <HardDrive size={12} className="text-gray-500 dark:text-gray-400" />
          <span className="font-medium text-gray-600 dark:text-gray-300">
            {t('storage_usage') || '存储'}
          </span>
        </div>
        <span className="text-gray-400 dark:text-gray-500">
          {formatFileSize(storageUsage.used)} / {storageUsage.quota > 0 ? formatFileSize(storageUsage.quota) : '∞'}
        </span>
      </div>
      {storageUsage.quota > 0 && (
        <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              (storageUsage.used / storageUsage.quota) > 0.9 ? 'bg-red-500' : 'bg-orange-500'
            }`}
            style={{ width: `${Math.min((storageUsage.used / storageUsage.quota) * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

