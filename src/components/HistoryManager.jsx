/**
 * AI Image Generation History Manager Component
 * Integrated with ImagePopup for immersive details view
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Trash2, 
  Download, 
  Copy, 
  Eye, 
  HardDrive, 
  AlertCircle, 
  RefreshCw,
  ChevronLeft,
  Search,
  Sparkles
} from 'lucide-react';
import storageAdapter from '../utils/storage';
// 假设 ImagePopup 在同一目录下，如果不是请调整路径
import ImagePopup from './ImagePopup'; 
import MasonryGrid from './MasonryGrid';

export const HistoryManager = ({ 
  isDarkMode = false, 
  t = (key) => key,
  onBack,
  className = "" 
}) => {
  // State management
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storageUsage, setStorageUsage] = useState({ used: 0, quota: 0, count: 0 });
  
  // Selection & Popup State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // 用于 ImagePopup 的 URL
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Load history records and storage usage
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [historyRecords, usage] = await Promise.all([
        storageAdapter.listImages(),
        storageAdapter.getStorageUsage()
      ]);
      
      setRecords(historyRecords);
      setStorageUsage(usage);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Handle Record Selection (Generate URL for ImagePopup)
  useEffect(() => {
    let url = null;
    if (selectedRecord) {
      const loadPreview = async () => {
        try {
          const { blob } = await storageAdapter.getImage(selectedRecord.id);
          url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        } catch (err) {
          console.error('Failed to load preview for popup:', err);
          // 可以设置一个错误状态或默认图
        }
      };
      loadPreview();
    } else {
      setPreviewUrl(null);
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [selectedRecord]);

  // Delete individual record
  const handleDeleteRecord = async (recordId) => {
    try {
      await storageAdapter.deleteImage(recordId);
      await loadHistory(); 
      setShowDeleteConfirm(null);
      // 如果正在查看该记录，关闭弹窗
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(null);
      }
    } catch (err) {
      console.error('Failed to delete record:', err);
      setError(`删除失败: ${err.message}`);
    }
  };

  // Clear all records
  const handleClearAll = async () => {
    try {
      await storageAdapter.clearAll();
      await loadHistory();
      setShowClearAllConfirm(false);
    } catch (err) {
      console.error('Failed to clear all records:', err);
      setError(`清空失败: ${err.message}`);
    }
  };

  // Download image
  const handleDownloadImage = async (record) => {
    try {
      const { blob } = await storageAdapter.getImage(record.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai_image_${record.id}.${blob.type.split('/')[1] || 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download image:', err);
      setError(`下载失败: ${err.message}`);
    }
  };

  // Copy image to clipboard
  const handleCopyImage = async (record) => {
    try {
      const { blob } = await storageAdapter.getImage(record.id);
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
        console.log('Image copied to clipboard');
      } else {
        throw new Error('Clipboard API not supported');
      }
    } catch (err) {
      console.error('Failed to copy image:', err);
      setError(`复制失败: ${err.message}`);
    }
  };

  // Helpers
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '今天';
    if (diffDays === 2) return '昨天';
    if (diffDays <= 7) return `${diffDays - 1}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  // Filter and sort
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = records;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.prompt?.toLowerCase().includes(query) ||
        record.provider?.toLowerCase().includes(query) ||
        record.model?.toLowerCase().includes(query)
      );
    }
    if (filterProvider !== 'all') {
      filtered = filtered.filter(record => record.provider === filterProvider);
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest': return a.savedAt - b.savedAt;
        case 'provider': return (a.provider || '').localeCompare(b.provider || '');
        case 'newest': default: return b.savedAt - a.savedAt;
      }
    });
    return filtered;
  }, [records, searchQuery, filterProvider, sortBy]);

  const availableProviders = useMemo(() => {
    const providers = [...new Set(records.map(r => r.provider).filter(Boolean))];
    return providers.sort();
  }, [records]);

  // Construct Template Object for ImagePopup
  const popupTemplate = useMemo(() => {
    if (!selectedRecord) return null;
    
    // Extract parameters for tags
    const tags = [];
    if (selectedRecord.parameters) {
      Object.entries(selectedRecord.parameters).forEach(([key, val]) => {
        // Skip long values, keep short tech specs
        if (typeof val !== 'object' && String(val).length < 20) {
           tags.push(`${key}: ${val}`);
        }
      });
    }

    return {
      name: formatDate(selectedRecord.savedAt) + " 生成",
      author: `${selectedRecord.provider || 'AI'} / ${selectedRecord.model || 'Model'}`,
      content: selectedRecord.prompt || t('no_prompt'),
      tags: tags
    };
  }, [selectedRecord, t]);

  // Loading View
  if (loading) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('loading_history') || '加载历史记录...'}
          </p>
        </div>
      </div>
    );
  }

  // Error View
  if (error) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('error_loading_history') || '加载失败'}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
          <button
            onClick={loadHistory}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            {t('retry') || '重试'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 统一顶部工具栏 */}
      <div className={`flex flex-col lg:flex-row items-center gap-4 p-4 border-b shadow-sm z-10 `}>
        
        {/* 1. 标题与返回 */}
        <div className="flex items-center justify-between w-full lg:w-auto lg:shrink-0 gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h1 className={`text-lg font-bold whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('history_title') || '历史记录'}
            </h1>
          </div>
          
          {records.length > 0 && (
            <button
              onClick={() => setShowClearAllConfirm(true)}
              className={`lg:hidden px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isDarkMode ? 'bg-red-600/20 text-red-400' : 'bg-red-50 text-red-600'
              }`}
            >
              {t('clear_all') || '清空'}
            </button>
          )}
        </div>

        {/* 2. 搜索 + 筛选 */}
        {records.length > 0 && (
          <div className="flex flex-col lg:flex-row items-center gap-2 w-full lg:w-auto justify-start">
            <div className="relative w-full lg:w-64 shrink-0">
              <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder={t('search_history') || '搜索...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm transition-all ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500'
                } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
              />
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar">
              <select
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
                className={`flex-1 lg:flex-none w-auto max-w-[120px] px-2 py-2 rounded-lg text-xs border cursor-pointer ${
                  isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:border-orange-500`}
              >
                <option value="all">{t('all_providers') || '全部厂商'}</option>
                {availableProviders.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`flex-1 lg:flex-none w-auto max-w-[120px] px-2 py-2 rounded-lg text-xs border cursor-pointer ${
                  isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:border-orange-500`}
              >
                <option value="newest">{t('sort_newest') || '最新'}</option>
                <option value="oldest">{t('sort_oldest') || '最旧'}</option>
                <option value="provider">{t('sort_provider') || '厂商'}</option>
              </select>
            </div>
          </div>
        )}

        {/* 3. 存储状态 */}
        <div className={`w-full lg:flex-1 flex flex-col justify-center gap-1.5 px-4 py-2 rounded-lg border lg:mx-2 ${
           isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <HardDrive size={12} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
              <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('storage_usage') || '存储'}
              </span>
            </div>
            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
              {formatFileSize(storageUsage.used)} / {storageUsage.quota > 0 ? formatFileSize(storageUsage.quota) : '∞'}
            </span>
          </div>
          {storageUsage.quota > 0 && (
            <div className={`w-full h-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  (storageUsage.used / storageUsage.quota) > 0.9 ? 'bg-red-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min((storageUsage.used / storageUsage.quota) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* 4. 清空按钮 */}
        {records.length > 0 && (
          <button
            onClick={() => setShowClearAllConfirm(true)}
            className={`hidden lg:flex shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors items-center gap-2 ${
              isDarkMode ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'
            }`}
            title={t('clear_all')}
          >
            <Trash2 size={14} />
            <span>{t('clear_all') || '清空全部'}</span>
          </button>
        )}
      </div>

      {/* Records List Grid */}
      <div className="flex-1 overflow-auto">
        {filteredAndSortedRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Sparkles size={24} className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {searchQuery || filterProvider !== 'all' 
                ? (t('no_matching_records') || '没有匹配的记录')
                : (t('no_history_records') || '暂无历史记录')
              }
            </h3>
          </div>
        ) : (
          <div className="p-4">
            <MasonryGrid
              items={filteredAndSortedRecords}
              renderItem={(record, index) => (
                <ImageCard
                  key={record.id}
                  record={record}
                  onClick={() => setSelectedRecord(record)}
                  onDelete={() => setShowDeleteConfirm(record.id)}
                  isDarkMode={isDarkMode}
                />
              )}
              masonryStyleKey="classic"
              gap={16}
            />
          </div>
        )}
      </div>

      {/* Image Popup Integration */}
      {selectedRecord && previewUrl && (
        <ImagePopup
          isOpen={true}
          onClose={() => setSelectedRecord(null)}
          imageUrl={previewUrl}
          template={popupTemplate}
          language="cn" // 这里的语言参数可以根据实际应用的语言上下文传入
          isDarkMode={isDarkMode}
          t={t}
          showTemplateInfo={true}
          // 在详情页中显示自定义操作按钮
          customActions={() => (
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button 
                onClick={() => handleDownloadImage(selectedRecord)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors backdrop-blur-md"
              >
                <Download size={16} />
                {t('download') || '下载'}
              </button>
              <button 
                onClick={() => handleCopyImage(selectedRecord)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors backdrop-blur-md"
              >
                <Copy size={16} />
                {t('copy') || '复制'}
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(selectedRecord.id)}
                className="px-4 py-3 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-xl flex items-center justify-center transition-colors backdrop-blur-md"
                title={t('delete')}
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmModal
          title={t('confirm_delete_record') || '确认删除'}
          message={t('confirm_delete_record_message') || '确定要删除这条记录吗？此操作无法撤销。'}
          confirmText={t('delete') || '删除'}
          cancelText={t('cancel') || '取消'}
          onConfirm={() => handleDeleteRecord(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
          isDarkMode={isDarkMode}
          isDestructive={true}
        />
      )}

      {/* Clear All Confirmation Modal */}
      {showClearAllConfirm && (
        <ConfirmModal
          title={t('confirm_clear_all') || '确认清空全部'}
          message={t('confirm_clear_all_message') || '确定要清空所有历史记录吗？此操作无法撤销。'}
          confirmText={t('clear_all') || '清空全部'}
          cancelText={t('cancel') || '取消'}
          onConfirm={handleClearAll}
          onCancel={() => setShowClearAllConfirm(false)}
          isDarkMode={isDarkMode}
          isDestructive={true}
        />
      )}
    </div>
  );
};

// Image Card Component for Masonry Grid
const ImageCard = ({ record, onClick, onDelete, isDarkMode }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let url = null;
    const loadImage = async () => {
      try {
        const { blob } = await storageAdapter.getImage(record.id);
        url = URL.createObjectURL(blob);
        setImageUrl(url);
      } catch (err) {
        setImageError(true);
      }
    };
    loadImage();
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [record.id]);

  return (
    <div 
      className="relative group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      onClick={onClick}
    >
      {/* Image */}
      <div className={`w-full aspect-auto relative ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl} 
            alt="" 
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" 
            onError={() => setImageError(true)} 
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center">
            <Eye size={24} className="text-gray-400" />
          </div>
        )}
        
        {/* Delete Button - Top Right Corner */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-3 right-3 p-1 text-white/80 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 hover:scale-110"
          title="删除"
        >
          <Trash2 size={18} />
        </button>
        
        {/* Hover Overlay with Model Name */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end pointer-events-none z-20">
          <div className="w-full p-3">
            <div className="text-white text-sm font-medium">
              {record.provider && record.model ? `${record.provider} / ${record.model}` : record.model || record.provider || 'Unknown Model'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirm Modal (保持不变)
const ConfirmModal = ({ 
  title, message, confirmText, cancelText, onConfirm, onCancel, isDarkMode, isDestructive = false 
}) => {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-sm rounded-2xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
      }`}>
        <div className="p-6">
          <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <p className={`text-sm mb-6 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={onCancel} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>{cancelText}</button>
            <button onClick={onConfirm} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                isDestructive ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 shadow-lg' : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryManager;