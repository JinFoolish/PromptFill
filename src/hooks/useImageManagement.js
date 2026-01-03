// 图片管理 Hook：处理图片上传、设置、重置和 AI 生成图片
import { useCallback } from 'react';
import { INITIAL_TEMPLATES_CONFIG } from '../data/templates';

/**
 * 图片管理 Hook
 */
export const useImageManagement = ({
  activeTemplateId,
  setTemplates,
  imageUpdateMode,
  currentImageEditIndex,
  storageMode,
  setImageUrlInput,
  setShowImageUrlInput,
  setGeneratedImages,
  setShowImageModal
}) => {
  // 上传图片
  const handleUploadImage = useCallback((e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        if (storageMode === 'browser') {
          alert('请选择图片文件');
        }
        return;
      }
      
      const reader = new FileReader();
      
      reader.onloadend = () => {
        try {
          setTemplates(prev => prev.map(t => {
            if (t.id !== activeTemplateId) return t;
            
            if (imageUpdateMode === 'add') {
              const newUrls = [...(t.imageUrls || [t.imageUrl]), reader.result];
              return { ...t, imageUrls: newUrls, imageUrl: newUrls[0] };
            } else {
              // Replace current index
              if (t.imageUrls && Array.isArray(t.imageUrls)) {
                const newUrls = [...t.imageUrls];
                newUrls[currentImageEditIndex] = reader.result;
                return { ...t, imageUrls: newUrls, imageUrl: newUrls[0] };
              }
              return { ...t, imageUrl: reader.result };
            }
          }));
        } catch (error) {
          console.error('图片上传失败:', error);
          if (error.name === 'QuotaExceededError') {
            console.error('存储空间不足！图片过大。建议使用图片链接方式或切换到本地文件夹模式。');
          } else {
            alert('图片上传失败，请重试');
          }
        }
      };
      
      reader.onerror = () => {
        console.error('文件读取失败');
        if (storageMode === 'browser') {
          alert('文件读取失败，请重试');
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('上传图片出错:', error);
      if (storageMode === 'browser') {
        alert('上传图片出错，请重试');
      }
    } finally {
      // 重置input，允许重复选择同一文件
      if (e.target) {
        e.target.value = '';
      }
    }
  }, [activeTemplateId, setTemplates, imageUpdateMode, currentImageEditIndex, storageMode]);

  // 重置图片
  const handleResetImage = useCallback(() => {
    const defaultUrl = INITIAL_TEMPLATES_CONFIG.find(t => t.id === activeTemplateId)?.imageUrl;
    const defaultUrls = INITIAL_TEMPLATES_CONFIG.find(t => t.id === activeTemplateId)?.imageUrls;
    
    setTemplates(prev => prev.map(t => 
      t.id === activeTemplateId ? { ...t, imageUrl: defaultUrl, imageUrls: defaultUrls } : t
    ));
  }, [activeTemplateId, setTemplates]);

  // 设置图片 URL
  const handleSetImageUrl = useCallback(() => {
    // 这个函数需要 imageUrlInput，但应该在调用时传入
    // 为了保持接口一致性，这里返回一个函数
    return (imageUrlInput) => {
      if (!imageUrlInput.trim()) return;
      
      setTemplates(prev => prev.map(t => {
        if (t.id !== activeTemplateId) return t;
        
        if (imageUpdateMode === 'add') {
          const newUrls = [...(t.imageUrls || [t.imageUrl]), imageUrlInput];
          return { ...t, imageUrls: newUrls, imageUrl: newUrls[0] };
        } else {
          // Replace current index
          if (t.imageUrls && Array.isArray(t.imageUrls)) {
            const newUrls = [...t.imageUrls];
            newUrls[currentImageEditIndex] = imageUrlInput;
            return { ...t, imageUrls: newUrls, imageUrl: newUrls[0] };
          }
          return { ...t, imageUrl: imageUrlInput };
        }
      }));
      setImageUrlInput("");
      setShowImageUrlInput(false);
    };
  }, [activeTemplateId, setTemplates, imageUpdateMode, currentImageEditIndex, setImageUrlInput, setShowImageUrlInput]);

  // AI 图片生成处理
  const handleImageGenerated = useCallback((images) => {
    setGeneratedImages(images);
    setShowImageModal(true);
  }, [setGeneratedImages, setShowImageModal]);

  return {
    handleUploadImage,
    handleResetImage,
    handleSetImageUrl,
    handleImageGenerated,
  };
};

