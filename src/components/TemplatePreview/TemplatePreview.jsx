import React, { useEffect } from 'react';
import { TemplateHeader } from './TemplateHeader';
import { TemplateImageSection } from './TemplateImageSection';
import { TemplateContent } from './TemplateContent';

/**
 * TemplatePreview 主组件 - 负责渲染模版的预览内容，包括变量交互
 * 已重构：使用子组件分离关注点
 */
export const TemplatePreview = React.memo(({ 
  activeTemplate, 
  banks, 
  defaults, 
  categories, 
  activePopover, 
  setActivePopover, 
  handleSelect, 
  handleAddCustomAndSelect, 
  popoverRef, 
  t, 
  displayTag, 
  TAG_STYLES, 
  setZoomedImage, 
  fileInputRef, 
  setShowImageUrlInput, 
  handleResetImage, 
  language,
  setLanguage,
  // 标签编辑相关
  TEMPLATE_TAGS,
  handleUpdateTemplateTags,
  editingTemplateTags,
  setEditingTemplateTags,
  // 多图相关
  setImageUpdateMode,
  setCurrentImageEditIndex,
  // 标题编辑相关
  editingTemplateNameId,
  tempTemplateName,
  setTempTemplateName,
  saveTemplateName, 
  startRenamingTemplate, 
  setEditingTemplateNameId,
  // AI图像生成相关
  onImageGenerated,
  isDarkMode
}) => {
  // 自动切换到模板支持的语言
  useEffect(() => {
    const templateLangs = activeTemplate?.language ? 
      (Array.isArray(activeTemplate.language) ? activeTemplate.language : [activeTemplate.language]) : 
      ['cn', 'en'];
    
    if (!templateLangs.includes(language)) {
      setLanguage(templateLangs[0]);
    }
  }, [activeTemplate?.id, activeTemplate?.language, language, setLanguage]);

  // 统一的底层容器样式
  const unifiedStyle = isDarkMode ? {
    background: 'linear-gradient(180deg, #3B3B3B 0%, #242120 100%)',
    borderRadius: '16px',
    border: '1px solid transparent',
    backgroundImage: 'linear-gradient(180deg, #3B3B3B, #242120), linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
  } : {
    background: 'linear-gradient(180deg, #FAF5F1 0%, #F6EBE6 100%)',
    borderRadius: '16px',
    border: '1px solid transparent',
    backgroundImage: 'linear-gradient(180deg, #FAF5F1, #F6EBE6), linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
  };

  return (
    <div className="w-full h-full relative overflow-hidden group">
      {/* Background Image Layer - Blurry Ambient Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 opacity-30 blur-[60px] scale-110 pointer-events-none"
        style={{ 
          backgroundImage: activeTemplate?.imageUrl ? `url(${activeTemplate.imageUrl})` : 'none',
        }}
      ></div>
      <div className={`absolute inset-0 pointer-events-none ${isDarkMode ? 'bg-black/30' : 'bg-white/5'}`}></div>

      <div className="w-full h-full overflow-y-auto px-3 py-4 md:p-8 custom-scrollbar relative z-10">
        <div 
          id="preview-card"
          className={`max-w-4xl mx-auto p-4 sm:p-6 md:p-12 min-h-[500px] md:min-h-[600px] transition-all duration-500 relative ${isDarkMode ? 'bg-black/20 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl' : 'bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm'}`}
        >
          {/* Top Section: Title & Image */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-10 relative">
            {/* Left: Title & Meta Info */}
            <TemplateHeader
              activeTemplate={activeTemplate}
              editingTemplateNameId={editingTemplateNameId}
              tempTemplateName={tempTemplateName}
              setTempTemplateName={setTempTemplateName}
              saveTemplateName={saveTemplateName}
              startRenamingTemplate={startRenamingTemplate}
              setEditingTemplateNameId={setEditingTemplateNameId}
              editingTemplateTags={editingTemplateTags}
              setEditingTemplateTags={setEditingTemplateTags}
              handleUpdateTemplateTags={handleUpdateTemplateTags}
              TEMPLATE_TAGS={TEMPLATE_TAGS}
              displayTag={displayTag}
              TAG_STYLES={TAG_STYLES}
              language={language}
              defaults={defaults}
              onImageGenerated={onImageGenerated}
              t={t}
              isDarkMode={isDarkMode}
            />

            {/* Right: Image (Overhanging) */}
            <TemplateImageSection
              activeTemplate={activeTemplate}
              currentImageEditIndex={0}
              setCurrentImageEditIndex={setCurrentImageEditIndex}
              setImageUpdateMode={setImageUpdateMode}
              setShowImageUrlInput={setShowImageUrlInput}
              setZoomedImage={setZoomedImage}
              handleResetImage={handleResetImage}
              fileInputRef={fileInputRef}
              t={t}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Rendered Content */}
          <TemplateContent
            activeTemplate={activeTemplate}
            language={language}
            banks={banks}
            defaults={defaults}
            activePopover={activePopover}
            setActivePopover={setActivePopover}
            handleSelect={handleSelect}
            handleAddCustomAndSelect={handleAddCustomAndSelect}
            popoverRef={popoverRef}
            categories={categories}
            t={t}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
});

TemplatePreview.displayName = 'TemplatePreview';

