import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { Download, Copy, Save } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { DarkModeLamp } from './DarkModeLamp';
import { ImagePopup, InsertVariableModal, UpdateNotice, AppUpdateNotice } from '../index';
import { Button } from '../ui/button';
import { Toaster } from '../ui/toaster';
import { useApp } from '../../contexts/AppContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { INITIAL_TEMPLATES_CONFIG } from '../../data/templates';
import { TAG_STYLES, TAG_LABELS } from '../../constants/styles';
import { getLocalized } from '../../utils/helpers';
import { formatDate } from '../HistoryManager/utils/historyFormatters';

/**
 * 应用布局组件
 * 包含 Sidebar、DarkModeLamp、全局模态框等
 */
export const AppLayout = ({ children }) => {
  const app = useApp();
  const navigation = useAppNavigation();
  
  const {
    isDarkMode,
    setIsDarkMode,
    language,
    zoomedImage,
    setZoomedImage,
    templates,
    activeTemplate,
    activeTemplateId,
    setActiveTemplateId,
    isInsertModalOpen,
    setIsInsertModalOpen,
    showImageModal,
    setShowImageModal,
    generatedImages,
    setGeneratedImages,
    showDataUpdateNotice,
    setShowDataUpdateNotice,
    showAppUpdateNotice,
    setShowAppUpdateNotice,
    updateNoticeType,
    SYSTEM_DATA_VERSION,
    lastAppliedDataVersion,
    setLastAppliedDataVersion,
    templateManagement,
    editor,
    categories,
    banks,
    t,
  } = app;

  const displayTag = useCallback((tag) => {
    return TAG_LABELS[language]?.[tag] || tag;
  }, [language]);

  // 为 AI 生成的图片创建虚拟模板对象
  const aiImageTemplate = useMemo(() => {
    if (!generatedImages || generatedImages.length === 0) return null;
    const firstImage = generatedImages[0];
    
    const tags = [];
    if (firstImage.provider) tags.push(firstImage.provider);
    if (firstImage.model) tags.push(firstImage.model);
    if (firstImage.width && firstImage.height) {
      tags.push(`${firstImage.width}×${firstImage.height}`);
    }

    return {
      name: activeTemplate ? getLocalized(activeTemplate.name, language) : (t('generated_image') || '生成的图片'),
      author: formatDate(firstImage.timestamp),
      content: firstImage.prompt || (t('no_prompt_available') || '暂无提示词信息'),
      tags
    };
  }, [generatedImages, activeTemplate, language, t]);

  // AI 图片自定义操作按钮
  const aiImageCustomActions = useCallback((currentImageUrl, currentIndex, allImages) => {
    const currentImage = generatedImages.find(img => img.url === currentImageUrl) || generatedImages[0];
    if (!currentImage) return null;

    const handleSaveAction = async (action) => {
      try {
        switch (action) {
          case 'download':
            const { default: fileManager } = await import('../../utils/fileManager.js');
            const response = await fetch(currentImage.url);
            const blob = await response.blob();
            const filename = fileManager.generateFilename(currentImage.provider, 'png');
            await fileManager.saveImageFile(blob, filename);
            alert(t('download_success') || '图片已保存');
            break;
          case 'copy':
            const { default: fileManagerCopy } = await import('../../utils/fileManager.js');
            const responseCopy = await fetch(currentImage.url);
            const blobCopy = await responseCopy.blob();
            await fileManagerCopy.copyImageToClipboard(blobCopy);
            alert(t('copy_success') || '图片已复制到剪贴板');
            break;
          case 'history':
            const { default: storageAdapter } = await import('../../utils/storage.js');
            const responseHistory = await fetch(currentImage.url);
            const blobHistory = await responseHistory.blob();
            const metadata = {
              prompt: currentImage.prompt,
              images: [{
                id: currentImage.id,
                blobId: currentImage.id,
                originalUrl: currentImage.url,
                mimeType: blobHistory.type,
                size: blobHistory.size
              }],
              provider: currentImage.provider,
              model: currentImage.model,
              parameters: currentImage.parameters || {},
              templateName: activeTemplate ? getLocalized(activeTemplate.name, language) : '',
              width: currentImage.width,
              height: currentImage.height,
              createdAt: currentImage.timestamp || Date.now()
            };
            await storageAdapter.saveImage(currentImage.id, blobHistory, metadata);
            alert(t('save_to_history_success') || '已保存到历史记录');
            break;
          default:
            console.warn('Unknown save action:', action);
        }
      } catch (error) {
        console.error('Save operation failed:', error);
        alert(`保存失败: ${error.message}`);
      }
    };

    return (
      <>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => handleSaveAction('download')}
            variant="default"
            className="px-6 py-3"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleSaveAction('copy')}
            variant="secondary"
            className="px-6 py-3"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleSaveAction('history')}
            variant="default"
            className="px-6 py-3"
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
        {generatedImages.length > 1 && (
          <div className="text-center mt-2">
            <p className="text-white/60 text-xs">
              {t('navigation_tip') || '使用左右箭头键或按钮浏览图像'}
            </p>
          </div>
        )}
      </>
    );
  }, [generatedImages, activeTemplate, language, t]);

  return (
    <div 
      className="flex h-screen w-screen overflow-hidden mesh-gradient-bg md:p-4 dark:mesh-gradient-bg-dark dark:md:p-4"
      style={{
        background: 'var(--background-gradient)',
        padding: '16px'
      }}
    >
      {/* 全局侧边栏 */}
      <Sidebar 
        activeTab={navigation.getActiveTab()}
        onHome={navigation.navigateToHome}
        onDetail={() => {
          // 如果有激活的模板，导航到模板页面
          if (activeTemplateId) {
            navigation.navigateToTemplate(activeTemplateId);
          }
        }}
        onHistory={navigation.navigateToHistory}
        onBanks={navigation.navigateToBanks}
        onSettings={navigation.navigateToSettings}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        t={t}
      />
      
      <DarkModeLamp
        isDarkMode={isDarkMode}
        lampRotation={app.lampRotation}
        isLampHovered={app.isLampHovered}
        isLampOn={app.isLampOn}
        setIsLampOn={app.setIsLampOn}
        handleLampMouseMove={app.handleLampMouseMove}
        setLampRotation={app.setLampRotation}
        setIsLampHovered={app.setIsLampHovered}
      />

      {/* 主视图区域 - 路由出口 */}
      <div className="flex-1 relative flex overflow-hidden">
        {children || <Outlet />}
      </div>
      
      {/* Image View Modal */}
      {zoomedImage && (
        <ImagePopup
          isOpen={!!zoomedImage}
          onClose={() => setZoomedImage(null)}
          imageUrl={zoomedImage}
          imageUrls={
            INITIAL_TEMPLATES_CONFIG.find(t => t.imageUrl === zoomedImage || t.imageUrls?.includes(zoomedImage))?.imageUrls ||
            templates.find(t => t.imageUrl === zoomedImage || t.imageUrls?.includes(zoomedImage))?.imageUrls ||
            (activeTemplate?.imageUrl === zoomedImage || activeTemplate?.imageUrls?.includes(zoomedImage) ? activeTemplate.imageUrls : undefined)
          }
          template={
            INITIAL_TEMPLATES_CONFIG.find(t => t.imageUrl === zoomedImage || t.imageUrls?.includes(zoomedImage)) || 
            templates.find(t => t.imageUrl === zoomedImage || t.imageUrls?.includes(zoomedImage)) ||
            (activeTemplate?.imageUrl === zoomedImage || activeTemplate?.imageUrls?.includes(zoomedImage) ? activeTemplate : null)
          }
          language={language}
          t={t}
          displayTag={displayTag}
          onUseTemplate={(template) => {
            setActiveTemplateId(template.id);
            navigation.navigateToTemplate(template.id);
          }}
          isDarkMode={isDarkMode}
          showTemplateInfo={true}
        />
      )}

      {/* Insert Variable Modal */}
      <InsertVariableModal
        isOpen={isInsertModalOpen}
        onClose={() => setIsInsertModalOpen(false)}
        categories={categories}
        banks={banks}
        onSelect={(key) => {
          editor.insertVariableToTemplate(key);
          setIsInsertModalOpen(false);
        }}
        t={t}
        language={app.templateLanguage}
        isDarkMode={isDarkMode}
      />

      {/* AI Generated Images Modal */}
      {showImageModal && generatedImages && generatedImages.length > 0 && (
        <ImagePopup
          isOpen={showImageModal}
          onClose={() => {
            setShowImageModal(false);
            setGeneratedImages([]);
          }}
          imageUrl={generatedImages[0].url}
          imageUrls={generatedImages.map(img => img.url)}
          template={aiImageTemplate}
          language={language}
          t={t}
          displayTag={(tag) => tag}
          onUseTemplate={null}
          isDarkMode={isDarkMode}
          showTemplateInfo={true}
          className="ai-image-modal"
          customActions={aiImageCustomActions}
        />
      )}

      {/* 数据更新提示 */}
      <UpdateNotice
        isOpen={showDataUpdateNotice}
        onClose={() => {
          setLastAppliedDataVersion(SYSTEM_DATA_VERSION);
          setShowDataUpdateNotice(false);
        }}
        onUpdate={() => {
          templateManagement.handleAutoUpdate();
          setShowDataUpdateNotice(false);
        }}
        t={t}
      />

      {/* 应用更新提示 */}
      <AppUpdateNotice
        isOpen={showAppUpdateNotice}
        onClose={() => setShowAppUpdateNotice(false)}
        onRefresh={() => window.location.reload()}
        updateNoticeType={updateNoticeType}
        t={t}
      />
      
      {/* Toast 通知 */}
      <Toaster />
    </div>
  );
};

