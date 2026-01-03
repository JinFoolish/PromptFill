import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * 历史记录空状态组件
 */
export const HistoryEmptyState = ({ searchQuery, filterProvider, t }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-100 dark:bg-gray-800">
        <Sparkles size={24} className="text-gray-400 dark:text-gray-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
        {searchQuery || filterProvider !== 'all' 
          ? (t('no_matching_records') || '没有匹配的记录')
          : (t('no_history_records') || '暂无历史记录')
        }
      </h3>
    </div>
  );
};

