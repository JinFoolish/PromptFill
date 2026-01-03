/**
 * AI Image Generation History Manager Component
 * Integrated with ImagePopup for immersive details view
 * 已重构：使用子组件分离关注点
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Trash2, Download, Copy } from 'lucide-react';
import storageAdapter from '../../utils/storage';
import ImagePopup from '../ImagePopup';
import MasonryGrid from '../MasonryGrid';
import { HistoryLoadingState } from './HistoryLoadingState';
import { HistoryErrorState } from './HistoryErrorState';
import { HistoryEmptyState } from './HistoryEmptyState';
import { HistoryToolbar } from './HistoryToolbar';
import { HistoryImageCard } from './HistoryImageCard';
import { HistoryConfirmDialogs } from './HistoryConfirmDialogs';
import { filterAndSortRecords, getAvailableProviders } from './utils/historyFilters';
import { buildPopupTemplate } from './utils/historyPopupTemplate';
import { downloadImage, copyImage } from './utils/historyActions';

/**
 * 历史记录管理器主组件
 */
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
  const [previewUrl, setPreviewUrl] = useState(null);
  
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
      alert(t('delete_success') || '删除成功');
    } catch (err) {
      console.error('Failed to delete record:', err);
      setError(`删除失败: ${err.message}`);
      alert(`删除失败: ${err.message}`);
    }
  };

  // Clear all records
  const handleClearAll = async () => {
    try {
      await storageAdapter.clearAll();
      await loadHistory();
      setShowClearAllConfirm(false);
      alert(t('clear_all_success') || '已清空所有历史记录');
    } catch (err) {
      console.error('Failed to clear all records:', err);
      setError(`清空失败: ${err.message}`);
      alert(`清空失败: ${err.message}`);
    }
  };

  // Download image
  const handleDownloadImage = async (record) => {
    try {
      await downloadImage(record, t);
    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
  };

  // Copy image to clipboard
  const handleCopyImage = async (record) => {
    try {
      await copyImage(record, t);
    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
  };

  // Filter and sort
  const filteredAndSortedRecords = useMemo(() => {
    return filterAndSortRecords(records, searchQuery, filterProvider, sortBy);
  }, [records, searchQuery, filterProvider, sortBy]);

  const availableProviders = useMemo(() => {
    return getAvailableProviders(records);
  }, [records]);

  // Construct Template Object for ImagePopup
  const popupTemplate = useMemo(() => {
    return buildPopupTemplate(selectedRecord, t);
  }, [selectedRecord, t]);

  // Loading View
  if (loading) {
    return <HistoryLoadingState className={className} t={t} />;
  }

  // Error View
  if (error) {
    return <HistoryErrorState error={error} onRetry={loadHistory} className={className} t={t} />;
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 统一顶部工具栏 */}
      <HistoryToolbar
        onBack={onBack}
        records={records}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterProvider={filterProvider}
        setFilterProvider={setFilterProvider}
        sortBy={sortBy}
        setSortBy={setSortBy}
        availableProviders={availableProviders}
        storageUsage={storageUsage}
        onClearAll={() => setShowClearAllConfirm(true)}
        t={t}
        isDarkMode={isDarkMode}
      />

      {/* Records List Grid */}
      <div className="flex-1 overflow-auto">
        {filteredAndSortedRecords.length === 0 ? (
          <HistoryEmptyState 
            searchQuery={searchQuery} 
            filterProvider={filterProvider} 
            t={t} 
          />
        ) : (
          <div className="p-4">
            <MasonryGrid
              items={filteredAndSortedRecords}
              renderItem={(record, index) => (
                <HistoryImageCard
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
          language="cn"
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

      {/* Confirmation Dialogs */}
      <HistoryConfirmDialogs
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        showClearAllConfirm={showClearAllConfirm}
        setShowClearAllConfirm={setShowClearAllConfirm}
        onDeleteRecord={handleDeleteRecord}
        onClearAll={handleClearAll}
        t={t}
      />
    </div>
  );
};

export default HistoryManager;

