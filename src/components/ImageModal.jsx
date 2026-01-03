// 图像显示模态框组件
import React from 'react';
import { Download, Copy, Save } from 'lucide-react';
import { Button } from './ui/button';
import ImagePopup from './ImagePopup';

export const ImageModal = ({ 
  images = [], 
  isOpen, 
  onClose, 
  onSave, 
  isDarkMode = false, 
  t = (key) => key,
  language = 'cn', // 添加语言参数
  templateName = null // 模板名称（可选）
}) => {
  if (!isOpen || !images.length) return null;

  // 将生成的图片转换为 ImagePopup 可以使用的格式
  const imageUrls = images.map(img => img.url);
  const firstImage = images[0];

  // 格式化生成日期
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '今天';
    if (diffDays === 2) return '昨天';
    if (diffDays <= 7) return `${diffDays - 1}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  // 创建一个虚拟的模板对象来显示图片信息
  const virtualTemplate = {
    name: templateName || `${t('generated_image') || '生成的图片'}`,
    author: formatDate(firstImage.timestamp),
    content: firstImage.prompt || `${t('no_prompt_available') || '暂无提示词信息'}`,
    tags: (() => {
      const tags = [];
      // 服务提供商
      if (firstImage.provider) {
        tags.push(firstImage.provider);
      }
      // 模型名称
      if (firstImage.model) {
        tags.push(firstImage.model);
      }
      // 图像分辨率（最后一个）
      if (firstImage.width && firstImage.height) {
        tags.push(`${firstImage.width}×${firstImage.height}`);
      }
      return tags;
    })()
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
        {/* <div className={`px-4 py-2 rounded-xl mb-3 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/10'} backdrop-blur-sm`}>
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
        </div> */}

        {/* 操作按钮 */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => handleSaveAction('download')}
            variant="default"
            className="px-6 py-3"
          >
            <Download className="h-4 w-4" />
            {/* {t('download') || '另存为'} */}
          </Button>

          <Button
            onClick={() => handleSaveAction('copy')}
            variant="secondary"
            className="px-6 py-3"
          >
            <Copy className="h-4 w-4" />
            {/* {t('copy') || '复制图片'} */}
          </Button>

          <Button
            onClick={() => handleSaveAction('history')}
            variant="default"
            className="px-6 py-3"
          >
            <Save className="h-4 w-4" />
            {/* {t('save_to_history') || '保存到历史记录'} */}
          </Button>
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
        // 直接返回标签值（服务提供商、模型名称、分辨率）
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