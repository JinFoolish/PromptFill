import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Eye, Edit3, Check, Copy as CopyIcon, Image as ImageIcon, Globe } from 'lucide-react';
import { TemplatesSidebar } from './TemplatesSidebar';
import { VisualEditor } from '../VisualEditor';
import { TemplatePreview } from '../TemplatePreview/TemplatePreview';
import { EditorToolbar } from './EditorToolbar';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useApp } from '../../contexts/AppContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { getLocalized } from '../../utils/helpers';
import { exportImage } from '../../services/exportService';
import { INITIAL_TEMPLATES_CONFIG, TEMPLATE_TAGS } from '../../data/templates';
import { TAG_STYLES } from '../../constants/styles';
import { useToast } from '../../hooks/use-toast';

/**
 * 编辑器视图组件
 * 包含模板侧边栏和主编辑器
 */
export const EditorView = () => {
  const app = useApp();
  const navigation = useAppNavigation();
  const { toast } = useToast();
  
  const {
    activeTemplate,
    activeTemplateId,
    setActiveTemplateId,
    templates,
    banks,
    defaults,
    categories,
    isEditing,
    setIsEditing,
    activePopover,
    setActivePopover,
    copied,
    setCopied,
    isExporting,
    setIsExporting,
    isInsertModalOpen,
    setIsInsertModalOpen,
    templateLanguage,
    setTemplateLanguage,
    language,
    zoomedImage,
    setZoomedImage,
    imageUrlInput,
    setImageUrlInput,
    imageUpdateMode,
    setImageUpdateMode,
    currentImageEditIndex,
    setCurrentImageEditIndex,
    showImageUrlInput,
    setShowImageUrlInput,
    showImageActionMenu,
    setShowImageActionMenu,
    editingTemplateTags,
    setEditingTemplateTags,
    editingTemplateNameId,
    tempTemplateName,
    setTempTemplateName,
    tempTemplateAuthor,
    setTempTemplateAuthor,
    selectedTags,
    setSelectedTags,
    searchQuery,
    setSearchQuery,
    isSortMenuOpen,
    setIsSortMenuOpen,
    sortOrder,
    setSortOrder,
    randomSeed,
    setRandomSeed,
    isDarkMode,
    t,
    templateFilter,
    templateManagement,
    bankManagement,
    editor,
    history,
    imageManagement,
    setTemplates,
  } = app;

  const popoverRef = useRef(null);
  const fileInputRef = useRef(null);

  const displayTag = useCallback((tag) => {
    return TAG_STYLES[tag] ? tag : tag;
  }, []);

  // 点击外部关闭 popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setActivePopover(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setActivePopover]);

  // 导出图片
  const handleExportImage = async () => {
    const element = document.getElementById('preview-card');
    if (!element) return;

    await exportImage({
      element,
      activeTemplate,
      activeTemplateId,
      INITIAL_TEMPLATES_CONFIG,
      language,
      setIsExporting,
      showToast: (message) => {
        toast({
          title: message,
          duration: 3000,
        });
      }
    });
  };

  // 复制处理
  const handleCopy = () => {
    editor.handleCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // AI 图片生成处理
  const handleImageGenerated = (images) => {
    imageManagement.handleImageGenerated(images);
  };

  // 设置图片 URL
  const handleSetImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    
    setTemplates(prev => prev.map(t => {
      if (t.id !== activeTemplateId) return t;
      
      if (imageUpdateMode === 'add') {
        const newUrls = [...(t.imageUrls || [t.imageUrl]), imageUrlInput];
        return { ...t, imageUrls: newUrls, imageUrl: newUrls[0] };
      } else {
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

  if (!activeTemplate) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>{t('template_not_found') || 'Template not found'}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex gap-4 overflow-hidden">
      <TemplatesSidebar 
        setDiscoveryView={() => navigation.navigateToHome()}
        activeTemplateId={activeTemplateId}
        setActiveTemplateId={(id) => {
          setActiveTemplateId(id);
          navigation.navigateToTemplate(id);
        }}
        filteredTemplates={templateFilter.filteredTemplates}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        TEMPLATE_TAGS={TEMPLATE_TAGS}
        displayTag={displayTag}
        language={language}
        setLanguage={app.setLanguage}
        isDarkMode={isDarkMode}
        setIsSettingsOpen={navigation.navigateToSettings}
        t={t}
        isSortMenuOpen={isSortMenuOpen}
        setIsSortMenuOpen={setIsSortMenuOpen}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        setRandomSeed={setRandomSeed}
        handleResetTemplate={templateManagement.handleResetTemplate}
        startRenamingTemplate={templateManagement.startRenamingTemplate}
        handleDuplicateTemplate={templateManagement.handleDuplicateTemplate}
        handleExportTemplate={templateManagement.handleExportTemplate}
        handleDeleteTemplate={templateManagement.handleDeleteTemplate}
        handleAddTemplate={templateManagement.handleAddTemplate}
        INITIAL_TEMPLATES_CONFIG={INITIAL_TEMPLATES_CONFIG}
        editingTemplateNameId={editingTemplateNameId}
        tempTemplateName={tempTemplateName}
        setTempTemplateName={setTempTemplateName}
        tempTemplateAuthor={tempTemplateAuthor}
        setTempTemplateAuthor={setTempTemplateAuthor}
        saveTemplateName={templateManagement.saveTemplateName}
        setEditingTemplateNameId={app.setEditingTemplateNameId}
      />

      {/* 主编辑器 */}
      <Card 
        variant="container"
        className="flex flex-1 flex-col h-full overflow-hidden relative origin-left"
      >
        <div className="flex flex-col w-full h-full bg-white/30 dark:bg-black/20 backdrop-blur-sm rounded-2xl">
          {/* 顶部工具栏 */}
          <div className="px-4 md:px-8 py-3 md:py-4 border-b border-gray-100/50 dark:border-white/5 flex justify-between items-center z-20 h-auto min-h-[60px] md:min-h-[72px]">
            <div className="min-w-0 flex-1 mr-4 flex items-center gap-6">
              <h1 className="text-xl md:text-2xl font-black truncate tracking-tight text-gray-900 dark:text-white">
                {getLocalized(activeTemplate.name, language)}
              </h1>
              
              {/* Language Toggle */}
              {activeTemplate && (() => {
                const templateLangs = activeTemplate.language ? 
                  (Array.isArray(activeTemplate.language) ? activeTemplate.language : [activeTemplate.language]) : 
                  ['cn', 'en'];
                const showLanguageToggle = templateLangs.length > 1;
                const supportsChinese = templateLangs.includes('cn');
                const supportsEnglish = templateLangs.includes('en');
                
                if (!showLanguageToggle) return null;

                return (
                  <div className="flex items-center p-1 rounded-xl border shadow-inner shrink-0 bg-gray-100/80 dark:bg-black/20 border-gray-200 dark:border-white/5">
                    <button 
                      onClick={() => supportsChinese && setTemplateLanguage('cn')}
                      disabled={!supportsChinese}
                      className={`
                        text-[10px] font-black tracking-widest transition-all py-1.5 px-3 rounded-lg
                        ${!supportsChinese 
                          ? 'text-gray-600 cursor-not-allowed opacity-30' 
                          : templateLanguage === 'cn' 
                            ? 'bg-white dark:bg-white/10 text-orange-600 dark:text-orange-400 shadow-sm dark:shadow-lg ring-1 ring-black/5' 
                            : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}
                      `}
                    >
                      CN
                    </button>
                    <button 
                      onClick={() => supportsEnglish && setTemplateLanguage('en')}
                      disabled={!supportsEnglish}
                      className={`
                        text-[10px] font-black tracking-widest transition-all py-1.5 px-3 rounded-lg
                        ${!supportsEnglish 
                          ? 'text-gray-600 cursor-not-allowed opacity-30' 
                          : templateLanguage === 'en' 
                            ? 'bg-white dark:bg-white/10 text-orange-600 dark:text-orange-400 shadow-sm dark:shadow-lg ring-1 ring-black/5' 
                            : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}
                      `}
                    >
                      EN
                    </button>
                  </div>
                );
              })()}
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <div className="flex p-1 rounded-xl border shadow-inner bg-gray-100/80 dark:bg-black/20 border-gray-200 dark:border-white/5">
                <button
                  onClick={() => setIsEditing(false)}
                  className={`
                    p-1.5 md:px-3 md:py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1.5
                    ${!isEditing 
                      ? 'bg-white dark:bg-white/10 text-orange-600 dark:text-orange-400 shadow-sm dark:shadow-lg ring-1 ring-black/5' 
                      : 'text-gray-500 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}
                  `}
                  title={t('preview_mode')}
                >
                  <Eye size={16} /> <span className="hidden md:inline">{t('preview_mode')}</span>
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`
                    p-1.5 md:px-3 md:py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1.5
                    ${isEditing 
                      ? 'bg-white dark:bg-white/10 text-orange-600 dark:text-orange-400 shadow-sm dark:shadow-lg ring-1 ring-black/5' 
                      : 'text-gray-500 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}
                  `}
                  title={t('edit_mode')}
                >
                  <Edit3 size={16} /> <span className="hidden md:inline">{t('edit_mode')}</span>
                </button>
              </div>

              <div className={`h-6 w-px mx-1 hidden md:block dark:bg-white/5 bg-gray-200`}></div>

              <Button 
                onClick={handleExportImage} 
                disabled={isEditing || isExporting} 
                title={isExporting ? t('exporting') : t('export_image')} 
                variant="default"
              >
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{isExporting ? t('exporting') : t('export_image')}</span>
              </Button>
              <Button 
                onClick={handleCopy} 
                title={copied ? t('copied') : t('copy_result')} 
                variant={copied ? "secondary" : "default"}
                className="transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {copied ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                <span className="hidden md:inline ml-1">{copied ? t('copied') : t('copy_result')}</span>
              </Button>
            </div>
          </div>

          {/* 核心内容区 */}
          <div className="flex-1 overflow-hidden relative flex flex-col">
            {isEditing && (
              <div className="backdrop-blur-sm bg-white/30 dark:bg-black/20">
                <EditorToolbar 
                  onInsertClick={() => setIsInsertModalOpen(true)}
                  canUndo={history.canUndo}
                  canRedo={history.canRedo}
                  onUndo={history.handleUndo}
                  onRedo={history.handleRedo}
                  t={t}
                  cursorInVariable={editor.cursorInVariable}
                  currentGroupId={editor.currentGroupId}
                  onSetGroup={editor.handleSetGroup}
                  onRemoveGroup={editor.handleRemoveGroup}
                />
              </div>
            )}
            
            {isEditing ? (
              <div className="flex-1 relative overflow-hidden">
                <VisualEditor
                  ref={editor.textareaRef}
                  value={getLocalized(activeTemplate.content, templateLanguage)}
                  onChange={(e) => {
                    const newText = e.target.value;
                    if (typeof activeTemplate.content === 'object') {
                      history.updateActiveTemplateContent({
                        ...activeTemplate.content,
                        [templateLanguage]: newText
                      });
                    } else {
                      history.updateActiveTemplateContent(newText);
                    }
                  }}
                  banks={banks}
                  categories={categories}
                  isDarkMode={isDarkMode}
                />
              </div>
            ) : (
              <TemplatePreview
                activeTemplate={activeTemplate}
                banks={banks}
                defaults={defaults}
                categories={categories}
                activePopover={activePopover}
                setActivePopover={setActivePopover}
                handleSelect={(key, index, value) => {
                  bankManagement.handleSelect(key, index, value);
                }}
                handleAddCustomAndSelect={(key, index, newValue) => {
                  bankManagement.handleAddCustomAndSelect(key, index, newValue, bankManagement.handleAddOption, bankManagement.handleSelect);
                }}
                popoverRef={popoverRef}
                t={t}
                displayTag={displayTag}
                TAG_STYLES={TAG_STYLES}
                setZoomedImage={setZoomedImage}
                fileInputRef={fileInputRef}
                setShowImageUrlInput={setShowImageUrlInput}
                handleResetImage={imageManagement.handleResetImage}
                language={templateLanguage}
                setLanguage={setTemplateLanguage}
                TEMPLATE_TAGS={TEMPLATE_TAGS}
                handleUpdateTemplateTags={templateManagement.handleUpdateTemplateTags}
                editingTemplateTags={editingTemplateTags}
                setEditingTemplateTags={setEditingTemplateTags}
                setImageUpdateMode={setImageUpdateMode}
                setCurrentImageEditIndex={setCurrentImageEditIndex}
                editingTemplateNameId={editingTemplateNameId}
                tempTemplateName={tempTemplateName}
                setTempTemplateName={setTempTemplateName}
                saveTemplateName={templateManagement.saveTemplateName}
                startRenamingTemplate={templateManagement.startRenamingTemplate}
                setEditingTemplateNameId={app.setEditingTemplateNameId}
                onImageGenerated={handleImageGenerated}
                isDarkMode={isDarkMode}
              />
            )}
                     
            {/* Image URL Input Modal */}
            {showImageUrlInput && (
              <div 
                className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => { setShowImageUrlInput(false); setImageUrlInput(""); }}
              >
                <div 
                  className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-blue-500" />
                    {t('image_url')}
                  </h3>
                  <input
                    autoFocus
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder={t('image_url_placeholder')}
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSetImageUrl()}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSetImageUrl}
                      disabled={!imageUrlInput.trim()}
                      className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {t('use_url')}
                    </button>
                    <button
                      onClick={() => { setShowImageUrlInput(false); setImageUrlInput(""); }}
                      className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 隐藏的图片选择器 */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={imageManagement.handleUploadImage}
      />

      {/* Image Action Menu */}
      {showImageActionMenu && (() => {
        const buttonEl = window.__imageMenuButtonRef;
        if (!buttonEl) return null;
        const rect = buttonEl.getBoundingClientRect();
        return (
          <>
            <div 
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowImageActionMenu(false)}
            />
            <div 
              style={{
                position: 'fixed',
                top: `${rect.bottom + 8}px`,
                left: `${rect.left}px`,
                zIndex: 9999,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden min-w-[140px] animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowImageActionMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 transition-colors flex items-center gap-2 text-gray-700"
                >
                  <ImageIcon size={16} />
                  {t('upload_image')}
                </button>
                <div className="h-px bg-gray-100"></div>
                <button
                  onClick={() => {
                    setShowImageUrlInput(true);
                    setShowImageActionMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 text-gray-700"
                >
                  <Globe size={16} />
                  {t('image_url')}
                </button>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
};

