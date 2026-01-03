// 重构后的 App.jsx - 使用提取的 Hooks、Context 和组件
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Copy, Plus, X, Settings, Check, Edit3, Eye, ChevronRight, Download, Upload, Image as ImageIcon, Copy as CopyIcon, Globe, Sun, Moon, RefreshCw, Trash2 } from 'lucide-react';

// 导入数据配置
import { INITIAL_TEMPLATES_CONFIG, TEMPLATE_TAGS, SYSTEM_DATA_VERSION } from './data/templates';

// 导入常量配置
import { TAG_STYLES, TAG_LABELS } from './constants/styles';
import { MASONRY_STYLES } from './constants/masonryStyles';

// 导入工具函数
import { getLocalized } from './utils/helpers';
import { exportImage } from './services/exportService';
import { getStorageSize, clearAllData } from './services/storageService';
import { toggleDarkMode } from './utils/themeManager';

// 导入 Context
import { AppProvider, useApp } from './contexts/AppContext';

// 导入 UI 组件
import {
  Variable,
  VisualEditor,
  EditorToolbar,
  InsertVariableModal,
  TemplatePreview,
  TemplatesSidebar,
  BanksView,
  DiscoveryView,
  SettingsView,
  Sidebar,
  ImageModal,
  ImagePopup,
  HistoryManager,
  AnimatedSlogan,
  UpdateNotice,
  AppUpdateNotice,
  DarkModeLamp
} from './components';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';

// App 主组件（使用 Context）
const AppContent = () => {
  const app = useApp();
  const { toast } = useToast();
  
  // Toast 消息函数
  const showToastMessage = (message) => {
    toast({
      title: message,
      duration: 3000,
    });
  };
  
  // 从 Context 中解构所有需要的状态和函数
  const {
    // 核心状态
    isDarkMode,
    setIsDarkMode,
    language,
    setLanguage,
    templateLanguage,
    setTemplateLanguage,
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
    isDiscoveryView,
    setDiscoveryView,
    showDiscoveryOverlay,
    isSettingsOpen,
    setIsSettingsOpen,
    isHistoryOpen,
    setIsHistoryOpen,
    isBanksViewOpen,
    setIsBanksViewOpen,
    isTemplatesDrawerOpen,
    setIsTemplatesDrawerOpen,
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
    generatedImages,
    setGeneratedImages,
    showImageModal,
    setShowImageModal,
    storageMode,
    setStorageMode,
    directoryHandle,
    isFileSystemSupported,
    selectedTags,
    setSelectedTags,
    searchQuery,
    setSearchQuery,
    editingTemplateNameId,
    setEditingTemplateNameId,
    tempTemplateName,
    setTempTemplateName,
    tempTemplateAuthor,
    setTempTemplateAuthor,
    editingTemplateTags,
    setEditingTemplateTags,
    sortOrder,
    setSortOrder,
    isSortMenuOpen,
    setIsSortMenuOpen,
    randomSeed,
    setRandomSeed,
    masonryStyleKey,
    currentMasonryStyle,
    lampRotation,
    setLampRotation,
    isLampHovered,
    setIsLampHovered,
    isLampOn,
    setIsLampOn,
    handleLampMouseMove,
    showDataUpdateNotice,
    setShowDataUpdateNotice,
    showAppUpdateNotice,
    setShowAppUpdateNotice,
    updateNoticeType,
    SYSTEM_DATA_VERSION,
    lastAppliedDataVersion,
    setLastAppliedDataVersion,
    
    // 功能模块
    templateManagement,
    bankManagement,
    history,
    fileSystem,
    imageManagement,
    editor,
    templateFilter,
    
    // 工具函数
    t,
    
    // 额外的状态设置函数（从 appState 中获取）
    setCategories,
    setBanks,
    setTemplates,
    setDefaults,
  } = app;

  // 同步暗色模式到 document.documentElement
  useEffect(() => {
    toggleDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Refs
  const popoverRef = useRef(null);
  const fileInputRef = useRef(null);
  const posterScrollRef = useRef(null);
  const [isPosterAutoScrollPaused, setIsPosterAutoScrollPaused] = useState(false);

  // 显示标签
  const displayTag = useCallback((tag) => {
    return TAG_LABELS[language]?.[tag] || tag;
  }, [language]);

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

  // Poster Mode Auto Scroll Animation
  useEffect(() => {
    if (masonryStyleKey !== 'poster' || !posterScrollRef.current || isPosterAutoScrollPaused || !isDiscoveryView) {
      return;
    }

    const scrollContainer = posterScrollRef.current;
    let scrollDirection = 1;
    const scrollSpeed = 0.5;
    let animationFrameId;

    const performScroll = () => {
      if (!scrollContainer) return;

      const currentScroll = scrollContainer.scrollTop;
      const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;

      if (scrollDirection === 1 && currentScroll >= maxScroll - 1) {
        scrollDirection = -1;
      } else if (scrollDirection === -1 && currentScroll <= 1) {
        scrollDirection = 1;
      }

      scrollContainer.scrollTop += scrollSpeed * scrollDirection;
      animationFrameId = requestAnimationFrame(performScroll);
    };

    animationFrameId = requestAnimationFrame(performScroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [masonryStyleKey, isPosterAutoScrollPaused, isDiscoveryView]);

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
      showToast: showToastMessage
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

  // 清除所有数据
  const handleClearAllData = () => {
    clearAllData(t);
  };

  // globalContainerStyle 已迁移到 Card 组件的 container variant

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
            activeTab={isSettingsOpen ? 'settings' : (isHistoryOpen ? 'history' : (isBanksViewOpen ? 'banks' : (showDiscoveryOverlay ? 'home' : 'details')))}
            onHome={() => {
              setIsSettingsOpen(false);
              setIsHistoryOpen(false);
              setIsBanksViewOpen(false);
              setDiscoveryView(true);
            }}
            onDetail={() => {
              setIsSettingsOpen(false);
              setIsHistoryOpen(false);
              setIsBanksViewOpen(false);
              setDiscoveryView(false);
            }}
            onHistory={() => {
              setIsSettingsOpen(false);
              setIsBanksViewOpen(false);
              setIsHistoryOpen(true);
              setDiscoveryView(false);
            }}
            onBanks={() => {
              setIsSettingsOpen(false);
              setIsHistoryOpen(false);
              setIsBanksViewOpen(true);
              setDiscoveryView(false);
            }}
            onSettings={() => {
              setIsHistoryOpen(false);
              setIsBanksViewOpen(false);
              setIsSettingsOpen(true);
              setDiscoveryView(false);
            }}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            t={t}
          />
          
          <DarkModeLamp
            isDarkMode={isDarkMode}
            lampRotation={lampRotation}
            isLampHovered={isLampHovered}
            isLampOn={isLampOn}
            setIsLampOn={setIsLampOn}
            handleLampMouseMove={handleLampMouseMove}
            setLampRotation={setLampRotation}
            setIsLampHovered={setIsLampHovered}
          />

      {/* 主视图区域 */}
      <div className="flex-1 relative flex overflow-hidden">
        {isSettingsOpen ? (
          <SettingsView
            language={language}
            setLanguage={setLanguage}
            storageMode={storageMode}
            setStorageMode={setStorageMode}
            handleImportTemplate={(e) => templateManagement.handleImportTemplate(e, setCategories)}
            handleExportAllTemplates={() => templateManagement.handleExportAllTemplates(categories)}
            handleResetSystemData={templateManagement.handleRefreshSystemData}
            handleClearAllData={handleClearAllData}
            handleSelectDirectory={fileSystem.handleSelectDirectory}
            handleSwitchToLocalStorage={fileSystem.handleSwitchToLocalStorage}
            SYSTEM_DATA_VERSION={SYSTEM_DATA_VERSION}
            t={t}
            isDarkMode={isDarkMode}
          />
        ) : isHistoryOpen ? (
          <Card 
            variant="container"
            className="flex-1 flex flex-col overflow-hidden bg-white/30 dark:bg-black/20 backdrop-blur-sm"
          >
            <HistoryManager 
              isDarkMode={isDarkMode}
              t={t}
              className="flex-1"
            />
          </Card>
        ) : isBanksViewOpen ? (
          <BanksView
            categories={categories}
            banks={banks}
            setCategories={setCategories}
            setBanks={setBanks}
            handleDeleteOption={bankManagement.handleDeleteOption}
            handleAddOption={bankManagement.handleAddOption}
            handleDeleteBank={bankManagement.handleDeleteBank}
            handleUpdateBankCategory={bankManagement.handleUpdateBankCategory}
            insertVariableToTemplate={editor.insertVariableToTemplate}
            t={t}
            language={language}
            isDarkMode={isDarkMode}
          />
        ) : showDiscoveryOverlay ? (
          <DiscoveryView 
            filteredTemplates={templateFilter.discoveryTemplates}
            setActiveTemplateId={setActiveTemplateId}
            setDiscoveryView={setDiscoveryView}
            setZoomedImage={setZoomedImage}
            posterScrollRef={posterScrollRef}
            setIsPosterAutoScrollPaused={setIsPosterAutoScrollPaused}
            currentMasonryStyle={currentMasonryStyle}
            masonryStyleKey={masonryStyleKey}
            AnimatedSlogan={AnimatedSlogan}
            isSloganActive={!zoomedImage}
            t={t}
            TAG_STYLES={TAG_STYLES}
            displayTag={displayTag}
            handleRefreshSystemData={templateManagement.handleRefreshSystemData}
            language={language}
            setLanguage={setLanguage}
            setIsSettingsOpen={setIsSettingsOpen}
            isDarkMode={isDarkMode}
          />
        ) : (
          <div className="flex-1 flex gap-4 overflow-hidden">
            <TemplatesSidebar 
              setDiscoveryView={setDiscoveryView}
              activeTemplateId={activeTemplateId}
              setActiveTemplateId={setActiveTemplateId} 
              filteredTemplates={templateFilter.filteredTemplates}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              TEMPLATE_TAGS={TEMPLATE_TAGS}
              displayTag={displayTag}
              language={language}
              setLanguage={setLanguage}
              isDarkMode={isDarkMode}
              setIsSettingsOpen={setIsSettingsOpen}
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
              setEditingTemplateNameId={setEditingTemplateNameId}
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
                      <h1 className="text-xl md:text-2xl font-black truncate tracking-tight text-gray-900 dark:text-white">{getLocalized(activeTemplate.name, language)}</h1>
                      
                      {/* Language Toggle */}
                      {activeTemplate && (() => {
                        const templateLangs = activeTemplate.language ? (Array.isArray(activeTemplate.language) ? activeTemplate.language : [activeTemplate.language]) : ['cn', 'en'];
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
                  <>
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
                          setEditingTemplateNameId={setEditingTemplateNameId}
                          onImageGenerated={handleImageGenerated}
                          isDarkMode={isDarkMode}
                        />
                      )}
                  </>
                           
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
          </div>
        )}
      </div>
      
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

      {/* Image View Modal */}
      {zoomedImage && (
        <ImagePopup
          isOpen={!!zoomedImage}
          onClose={() => setZoomedImage(null)}
          imageUrl={zoomedImage}
          imageUrls={
            INITIAL_TEMPLATES_CONFIG.find(t => t.imageUrl === zoomedImage || t.imageUrls?.includes(zoomedImage))?.imageUrls ||
            templates.find(t => t.imageUrl === zoomedImage || t.imageUrls?.includes(zoomedImage))?.imageUrls ||
            (activeTemplate.imageUrl === zoomedImage || activeTemplate.imageUrls?.includes(zoomedImage) ? activeTemplate.imageUrls : undefined)
          }
          template={
            INITIAL_TEMPLATES_CONFIG.find(t => t.imageUrl === zoomedImage || t.imageUrls?.includes(zoomedImage)) || 
            templates.find(t => t.imageUrl === zoomedImage || t.imageUrls?.includes(zoomedImage)) ||
            (activeTemplate.imageUrl === zoomedImage || activeTemplate.imageUrls?.includes(zoomedImage) ? activeTemplate : null)
          }
          language={language}
          t={t}
          displayTag={displayTag}
          onUseTemplate={(template) => {
            setActiveTemplateId(template.id);
            setDiscoveryView(false);
            // 移动端适配已禁用，通过配置接口可重新启用
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
        language={templateLanguage}
        isDarkMode={isDarkMode}
      />

      {/* AI Generated Images Modal */}
      <ImageModal
        images={generatedImages}
        isOpen={showImageModal}
        templateName={getLocalized(activeTemplate.name, language)}
        onClose={() => {
          setShowImageModal(false);
          setGeneratedImages([]);
        }}
        onSave={async (image, action) => {
          try {
            switch (action) {
              case 'download':
                const { default: fileManager } = await import('./utils/fileManager.js');
                const response = await fetch(image.url);
                const blob = await response.blob();
                const filename = fileManager.generateFilename(image.provider, 'png');
                await fileManager.saveImageFile(blob, filename);
                alert(t('download_success') || '图片已保存');
                break;
              case 'copy':
                const { default: fileManagerCopy } = await import('./utils/fileManager.js');
                const responseCopy = await fetch(image.url);
                const blobCopy = await responseCopy.blob();
                await fileManagerCopy.copyImageToClipboard(blobCopy);
                alert(t('copy_success') || '图片已复制到剪贴板');
                break;
              case 'history':
                const { default: storageAdapter } = await import('./utils/storage.js');
                const responseHistory = await fetch(image.url);
                const blobHistory = await responseHistory.blob();
                const metadata = {
                  prompt: image.prompt,
                  images: [{
                    id: image.id,
                    blobId: image.id,
                    originalUrl: image.url,
                    mimeType: blobHistory.type,
                    size: blobHistory.size
                  }],
                  provider: image.provider,
                  model: image.model,
                  parameters: image.parameters || {},
                  templateName: getLocalized(activeTemplate.name, language), // 保存模板名称
                  width: image.width, // 保存图像宽度
                  height: image.height, // 保存图像高度
                  createdAt: image.timestamp || Date.now()
                };
                await storageAdapter.saveImage(image.id, blobHistory, metadata);
                alert(t('save_to_history_success') || '已保存到历史记录');
                break;
              default:
                console.warn('Unknown save action:', action);
            }
          } catch (error) {
            console.error('Save operation failed:', error);
            alert(`保存失败: ${error.message}`);
          }
        }}
        isDarkMode={isDarkMode}
        t={t}
        language={language}
      />

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

// App 组件（包装 Provider）
const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;

