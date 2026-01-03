import React from 'react';
import { Trash2, Search, ChevronLeft } from 'lucide-react';
import { Input } from '../ui/input';
import { HistoryStorageUsage } from './HistoryStorageUsage';

/**
 * 历史记录工具栏组件
 */
export const HistoryToolbar = ({
  onBack,
  records,
  searchQuery,
  setSearchQuery,
  filterProvider,
  setFilterProvider,
  sortBy,
  setSortBy,
  availableProviders,
  storageUsage,
  onClearAll,
  t,
  isDarkMode
}) => {
  return (
    <div className={`flex flex-col lg:flex-row items-center gap-4 p-4 border-b shadow-sm z-10`}>
      {/* 1. 标题与返回 */}
      <div className="flex items-center justify-between w-full lg:w-auto lg:shrink-0 gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <h1 className="text-lg font-bold whitespace-nowrap text-gray-900 dark:text-white">
            {t('history_title') || '历史记录'}
          </h1>
        </div>
        
        {records.length > 0 && (
          <button
            onClick={onClearAll}
            className="lg:hidden px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-red-50 dark:bg-red-600/20 text-red-600 dark:text-red-400"
          >
            {t('clear_all') || '清空'}
          </button>
        )}
      </div>

      {/* 2. 搜索 + 筛选 */}
      {records.length > 0 && (
        <div className="flex flex-col lg:flex-row items-center gap-2 w-full lg:w-auto justify-start">
          <div className="relative w-full lg:w-64 shrink-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 dark:text-gray-400 text-gray-500" />
            <Input
              type="text"
              placeholder={t('search_history') || '搜索...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar">
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="flex-1 lg:flex-none w-auto max-w-[120px] px-2 py-2 rounded-lg text-xs border cursor-pointer bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">{t('all_providers') || '全部厂商'}</option>
              {availableProviders.map(provider => (
                <option key={provider} value={provider}>{provider}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 lg:flex-none w-auto max-w-[120px] px-2 py-2 rounded-lg text-xs border cursor-pointer bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
            >
              <option value="newest">{t('sort_newest') || '最新'}</option>
              <option value="oldest">{t('sort_oldest') || '最旧'}</option>
              <option value="provider">{t('sort_provider') || '厂商'}</option>
            </select>
          </div>
        </div>
      )}

      {/* 3. 存储状态 */}
      <HistoryStorageUsage storageUsage={storageUsage} t={t} />

      {/* 4. 清空按钮 */}
      {records.length > 0 && (
        <button
          onClick={onClearAll}
          className="hidden lg:flex shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors items-center gap-2 bg-red-50 dark:bg-red-600/20 hover:bg-red-100 dark:hover:bg-red-600/30 text-red-600 dark:text-red-400"
          title={t('clear_all')}
        >
          <Trash2 size={14} />
          <span>{t('clear_all') || '清空全部'}</span>
        </button>
      )}
    </div>
  );
};

