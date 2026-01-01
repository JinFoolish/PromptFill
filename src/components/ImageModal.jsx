// 图像显示模态框组件
import React, { useState } from 'react';
import { X, Download, Copy, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { PremiumButton } from './PremiumButton';

export const ImageModal = ({ 
  images = [], 
  isOpen, 
  onClose, 
  onSave, 
  isDarkMode = false, 
  t = (key) => key 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || !images.length) return null;

  const currentImage = images[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  };

  const handleSaveAction = (action) => {
    if (onSave) {
      onSave(currentImage, action);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = `ai-generated-${currentImage.id}.png`;
    link.click();
  };

  const handleCopyImage = async () => {
    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        // 可以添加成功提示
      } else {
        // 降级方案：复制图片URL
        await navigator.clipboard.writeText(currentImage.url);
      }
    } catch (error) {
      console.error('Failed to copy image:', error);
      // 降级方案：复制图片URL
      try {
        await navigator.clipboard.writeText(currentImage.url);
      } catch (urlError) {
        console.error('Failed to copy image URL:', urlError);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 z-10"
      >
        <X size={24} />
      </button>

      {/* 主要内容 */}
      <div className="max-w-4xl w-full h-full flex flex-col items-center justify-center">
        {/* 图像显示区域 */}
        <div className="relative flex-1 flex items-center justify-center w-full">
          <img
            src={currentImage.url}
            alt={`Generated image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />

          {/* 导航按钮 */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* 底部信息和操作区域 */}
        <div className="w-full max-w-2xl mt-6">
          {/* 图像信息 */}
          <div className={`p-4 rounded-xl mb-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/10'} backdrop-blur-sm`}>
            <div className="text-white/90 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('provider') || '服务商'}: {currentImage.provider}</span>
                <span className="text-white/70">{currentImage.model}</span>
              </div>
              {currentImage.width && currentImage.height && (
                <div className="text-white/70">
                  {t('size') || '尺寸'}: {currentImage.width} × {currentImage.height}
                </div>
              )}
              {images.length > 1 && (
                <div className="text-white/70 text-center">
                  {currentIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 justify-center">
            <PremiumButton
              onClick={handleDownload}
              icon={Download}
              color="blue"
              isDarkMode={true}
              className="px-6 py-3"
            >
              {t('download') || '下载'}
            </PremiumButton>

            <PremiumButton
              onClick={handleCopyImage}
              icon={Copy}
              color="green"
              isDarkMode={true}
              className="px-6 py-3"
            >
              {t('copy') || '复制'}
            </PremiumButton>

            <PremiumButton
              onClick={() => handleSaveAction('history')}
              icon={Save}
              color="orange"
              isDarkMode={true}
              className="px-6 py-3"
            >
              {t('save_to_history') || '保存到历史'}
            </PremiumButton>
          </div>

          {/* 批量操作提示 */}
          {images.length > 1 && (
            <div className="text-center mt-4">
              <p className="text-white/60 text-sm">
                {t('batch_operations_tip') || '使用左右箭头键或按钮浏览所有生成的图像'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};