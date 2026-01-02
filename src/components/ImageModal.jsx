// 图像显示模态框组件
import React from 'react';
import { Download, Copy, Save } from 'lucide-react';
import { PremiumButton } from './PremiumButton';
import ImagePopup from './ImagePopup';

export const ImageModal = ({ 
  images = [], 
  isOpen, 
  onClose, 
  onSave, 
  isDarkMode = false, 
  t = (key) => key,
  language = 'cn' // 添加语言参数
}) => {
  if (!isOpen || !images.length) return null;

  // 将生成的图片转换为 ImagePopup 可以使用的格式
  const imageUrls = images.map(img => img.url);
  const firstImage = images[0];

  // 创建一个虚拟的模板对象来显示图片信息
  const virtualTemplate = {
    name: `${t('generated_image') || '生成的图片'}`,
    // author: `${firstImage.provider} · ${firstImage.model}`,
    content: firstImage.prompt || `${t('no_prompt_available') || '暂无提示词信息'}`,
    tags: [
      firstImage.provider,
      firstImage.model,
      firstImage.width && firstImage.height ? `${firstImage.width}×${firstImage.height}` : 'unknown-size'
    ].filter(Boolean)
  };

  // 自定义操作按钮
  const customActions = (currentImageUrl, currentIndex) => {
    const currentImage = images.find(img => img.url === currentImageUrl) || firstImage;
    
    const handleSaveAction = (action) => {
      if (onSave) {
        onSave(currentImage, action);
      }
    };

    return (
      <>
        {/* 图像信息 */}
        <div className={`px-4 py-2 rounded-xl mb-3 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/10'} backdrop-blur-sm`}>
          <div className="text-white/90 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium">{currentImage.provider}</span>
              <span className="text-white/70">{currentImage.model}</span>
              {currentImage.width && currentImage.height && (
                <span className="text-white/70">{currentImage.width}×{currentImage.height}</span>
              )}
              {images.length > 1 && (
                <span className="text-white/70">{currentIndex + 1}/{images.length}</span>
              )}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 justify-center">
          <PremiumButton
            onClick={() => handleSaveAction('download')}
            icon={Download}
            color="blue"
            isDarkMode={true}
            className="px-6 py-3"
          >
            {/* {t('download') || '另存为'} */}
          </PremiumButton>

          <PremiumButton
            onClick={() => handleSaveAction('copy')}
            icon={Copy}
            color="emerald"
            isDarkMode={true}
            className="px-6 py-3"
          >
            {/* {t('copy') || '复制图片'} */}
          </PremiumButton>

          <PremiumButton
            onClick={() => handleSaveAction('history')}
            icon={Save}
            color="orange"
            isDarkMode={true}
            className="px-6 py-3"
          >
            {/* {t('save_to_history') || '保存到历史记录'} */}
          </PremiumButton>
        </div>

        {/* 多图片提示 */}
        {images.length > 1 && (
          <div className="text-center mt-2">
            <p className="text-white/60 text-xs">
              {t('navigation_tip') || '使用左右箭头键或按钮浏览图像'}
            </p>
          </div>
        )}
      </>
    );
  };

  return (
    <ImagePopup
      isOpen={isOpen}
      onClose={onClose}
      imageUrl={firstImage.url}
      imageUrls={imageUrls}
      template={virtualTemplate}
      language={language}
      t={t}
      displayTag={(tag) => {
        // 如果是尺寸信息（包含×符号）
        if (tag.includes('×')) {
          return `${t('size') || '尺寸'}: ${tag}`;
        }
        
        // 如果是已知的提供商
        const providerMap = {
          'dashscope': 'DashScope',
          'openai': 'OpenAI',
          'midjourney': 'Midjourney',
          'stable-diffusion': 'Stable Diffusion'
        };
        
        if (providerMap[tag]) {
          return providerMap[tag];
        }
        
        // 如果是模型名称（通常包含特定模式）
        if (tag.includes('turbo') || tag.includes('xl') || tag.includes('v') || tag.includes('-')) {
          return `${t('model') || '模型'}: ${tag}`;
        }
        
        // 默认返回原标签
        return tag;
      }}
      onUseTemplate={null}
      isDarkMode={isDarkMode}
      showTemplateInfo={true}
      className="ai-image-modal"
      customActions={customActions}
    />
  );
};