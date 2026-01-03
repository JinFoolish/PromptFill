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

// 导入 Context
import { AppProvider, useApp } from './contexts/AppContext';

// 导入 UI 组件
import {
  Variable,
  VisualEditor,
  PremiumButton,
  EditorToolbar,
  InsertVariableModal,
  TemplatePreview,
  TemplatesSidebar,
  BanksView,
  DiscoveryView,
  MobileSettingsView,
  SettingsView,
  Sidebar,
  ImageModal,
  ImagePopup,
  HistoryManager,
  AnimatedSlogan,
  MobileAnimatedSlogan,
  UpdateNotice,
  AppUpdateNotice,
  DarkModeLamp
} from './components';
import MobileTabBar from './components/MobileTabBar';

// Toast 消息函数（简单实现）
const showToastMessage = (message) => {
  // 简单的 alert 实现，可以后续替换为更好的 Toast 组件
  console.log(message);
  // 如果需要，可以使用 alert(message) 或实现一个 Toast 组件
};

// App 主组件（使用 Context）
const AppContent = () => {
  const app = useApp();
  
  // 从 Context 中解构所有需要的状态和函数
  const {
    // 核心状态
    isDarkMode,
    setIsDarkMode,
    isMobileDevice,
    mobileTab,
    setMobileTab,
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

  // 全局容器样式
  const globalContainerStyle = isDarkMode ? {
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
    <div 
      className={`flex h-screen w-screen overflow-hidden ${isDarkMode ? '' : 'mesh-gradient-bg md:p-4'}`}
      style={isDarkMode ? { 
        background: 'linear-gradient(180deg, #323131 0%, #181716 100%)',
        padding: isMobileDevice ? '0' : '16px'
      } : {}}
    >
      {/* 桌面端全局侧边栏 */}
      {!isMobileDevice && (
        <>
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
        </>
      )}

      {/* 主视图区域 */}
      <div className="flex-1 relative flex overflow-hidden">
        {isSettingsOpen && !isMobileDevice ? (
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
            globalContainerStyle={globalContainerStyle}
            isDarkMode={isDarkMode}
          />
        ) : isHistoryOpen && !isMobileDevice ? (
          <div 
            style={globalContainerStyle}
            className={`flex-1 flex flex-col overflow-hidden ${isDarkMode ? 'bg-black/20 backdrop-blur-sm rounded-2xl' : 'bg-white/30 backdrop-blur-sm rounded-2xl'}`}
          >
            <HistoryManager 
              isDarkMode={isDarkMode}
              t={t}
              className="flex-1"
            />
          </div>
        ) : isBanksViewOpen && !isMobileDevice ? (
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
            globalContainerStyle={globalContainerStyle}
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
            AnimatedSlogan={isMobileDevice ? MobileAnimatedSlogan : AnimatedSlogan}
            isSloganActive={!zoomedImage}
            t={t}
            TAG_STYLES={TAG_STYLES}
            displayTag={displayTag}
            handleRefreshSystemData={templateManagement.handleRefreshSystemData}
            language={language}
            setLanguage={setLanguage}
            setIsSettingsOpen={setIsSettingsOpen}
            isDarkMode={isDarkMode}
            globalContainerStyle={globalContainerStyle}
          />
        ) : (
          <div className="flex-1 flex gap-4 overflow-hidden">
            <TemplatesSidebar 
              mobileTab={mobileTab}
              isTemplatesDrawerOpen={isTemplatesDrawerOpen}
              setIsTemplatesDrawerOpen={setIsTemplatesDrawerOpen}
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
              globalContainerStyle={globalContainerStyle}
            />

            {/* 主编辑器 */}
            <div 
              style={!isMobileDevice ? globalContainerStyle : {}}
              className={`
                ${(mobileTab === 'editor' || mobileTab === 'settings' || mobileTab === 'history') ? 'flex fixed inset-0 z-50 md:static md:bg-transparent' : 'hidden'} 
                ${(mobileTab === 'editor' || mobileTab === 'settings' || mobileTab === 'history') && isMobileDevice ? (isDarkMode ? 'bg-[#242120]' : 'bg-white') : ''}
                md:flex flex-1 flex-col h-full overflow-hidden relative
                md:rounded-2xl origin-left
              `}
            >
              <div className={`flex flex-col w-full h-full ${!isMobileDevice ? (isDarkMode ? 'bg-black/20 backdrop-blur-sm rounded-2xl' : 'bg-white/30 backdrop-blur-sm rounded-2xl') : ''}`}>
                {/* Mobile Side Drawer Triggers */}
                {isMobileDevice && (
                  <div className={`md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${mobileTab === 'editor' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <button 
                      onClick={() => setIsTemplatesDrawerOpen(true)}
                      className={`p-3 backdrop-blur-md rounded-r-2xl shadow-lg border border-l-0 active:scale-95 transition-all ${isDarkMode ? 'bg-black/40 border-white/5 text-gray-600' : 'bg-white/60 border-white/40 text-gray-400'}`}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              
                {/* 顶部工具栏 */}
                {(!isMobileDevice || mobileTab !== 'settings') && (
                  <div className={`px-4 md:px-8 py-3 md:py-4 border-b flex justify-between items-center z-20 h-auto min-h-[60px] md:min-h-[72px] ${isDarkMode ? 'border-white/5' : 'border-gray-100/50'}`}>
                    <div className="min-w-0 flex-1 mr-4 flex items-center gap-6">
                      <h1 className={`text-xl md:text-2xl font-black truncate tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getLocalized(activeTemplate.name, language)}</h1>
                      
                      {/* Language Toggle */}
                      {activeTemplate && (() => {
                        const templateLangs = activeTemplate.language ? (Array.isArray(activeTemplate.language) ? activeTemplate.language : [activeTemplate.language]) : ['cn', 'en'];
                        const showLanguageToggle = templateLangs.length > 1;
                        const supportsChinese = templateLangs.includes('cn');
                        const supportsEnglish = templateLangs.includes('en');
                        
                        if (!showLanguageToggle) return null;

                        return (
                          <div className={`flex items-center p-1 rounded-xl border shadow-inner shrink-0 ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-100/80 border-gray-200'}`}>
                            <button 
                              onClick={() => supportsChinese && setTemplateLanguage('cn')}
                              disabled={!supportsChinese}
                              className={`
                                text-[10px] font-black tracking-widest transition-all py-1.5 px-3 rounded-lg
                                ${!supportsChinese 
                                  ? 'text-gray-600 cursor-not-allowed opacity-30' 
                                  : templateLanguage === 'cn' 
                                    ? (isDarkMode ? 'bg-white/10 text-orange-400 shadow-lg' : 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5') 
                                    : (isDarkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50')}
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
                                    ? (isDarkMode ? 'bg-white/10 text-orange-400 shadow-lg' : 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5') 
                                    : (isDarkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50')}
                              `}
                            >
                              EN
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                      <div className={`flex p-1 rounded-xl border shadow-inner ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-100/80 border-gray-200'}`}>
                        <button
                          onClick={() => setIsEditing(false)}
                          className={`
                            p-1.5 md:px-3 md:py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1.5
                            ${!isEditing 
                              ? (isDarkMode ? 'bg-white/10 text-orange-400 shadow-lg' : 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5') 
                              : (isDarkMode ? 'text-gray-600 hover:text-gray-300 hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')}
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
                              ? (isDarkMode ? 'bg-white/10 text-orange-400 shadow-lg' : 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5') 
                              : (isDarkMode ? 'text-gray-600 hover:text-gray-300 hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')}
                          `}
                          title={t('edit_mode')}
                        >
                          <Edit3 size={16} /> <span className="hidden md:inline">{t('edit_mode')}</span>
                        </button>
                      </div>

                      <div className={`h-6 w-px mx-1 hidden md:block ${isDarkMode ? 'bg-white/5' : 'bg-gray-200'}`}></div>

                      <PremiumButton 
                        onClick={handleExportImage} 
                        disabled={isEditing || isExporting} 
                        title={isExporting ? t('exporting') : t('export_image')} 
                        icon={ImageIcon} 
                        color="orange"
                        isDarkMode={isDarkMode}
                      >
                        <span className="hidden sm:inline">{isExporting ? t('exporting') : t('export_image')}</span>
                      </PremiumButton>
                      <PremiumButton 
                        onClick={handleCopy} 
                        title={copied ? t('copied') : t('copy_result')} 
                        icon={copied ? Check : CopyIcon} 
                        color={copied ? "emerald" : "orange"}
                        active={true}
                        isDarkMode={isDarkMode}
                        className="transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        <span className="hidden md:inline ml-1">{copied ? t('copied') : t('copy_result')}</span>
                      </PremiumButton>
                    </div>
                  </div>
                )}

                {/* 核心内容区 */}
                <div className={`flex-1 overflow-hidden relative pb-24 md:pb-0 flex flex-col ${mobileTab === 'settings' || mobileTab === 'history' ? 'pt-0' : ''}`}>
                  {mobileTab === 'settings' ? (
                    <div className={`flex-1 flex flex-col overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#181716]' : 'bg-white'}`}>
                      <MobileSettingsView 
                        language={language}
                        setLanguage={setLanguage}
                        storageMode={storageMode}
                        setStorageMode={setStorageMode}
                        handleImportTemplate={(e) => templateManagement.handleImportTemplate(e, app.setCategories)}
                        handleExportAllTemplates={() => templateManagement.handleExportAllTemplates(categories)}
                        handleCompleteBackup={() => templateManagement.handleExportAllTemplates(categories)}
                        handleImportAllData={(e) => templateManagement.handleImportTemplate(e, app.setCategories)}
                        handleResetSystemData={templateManagement.handleRefreshSystemData}
                        handleClearAllData={handleClearAllData}
                        SYSTEM_DATA_VERSION={SYSTEM_DATA_VERSION}
                        t={t}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  ) : mobileTab === 'history' ? (
                    <div className={`flex-1 flex flex-col overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#181716]' : 'bg-white'}`}>
                      <HistoryManager 
                        isDarkMode={isDarkMode}
                        t={t}
                        onBack={() => setMobileTab('home')}
                      />
                    </div>
                  ) : (
                    <>
                      {isEditing && (
                        <div className={`backdrop-blur-sm ${isDarkMode ? 'bg-black/20' : 'bg-white/30'}`}>
                          <EditorToolbar 
                            onInsertClick={() => setIsInsertModalOpen(true)}
                            canUndo={history.canUndo}
                            canRedo={history.canRedo}
                            onUndo={history.handleUndo}
                            onRedo={history.handleRedo}
                            t={t}
                            isDarkMode={isDarkMode}
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
                          globalContainerStyle={globalContainerStyle}
                          onImageGenerated={handleImageGenerated}
                          isDarkMode={isDarkMode}
                        />
                      )}
                    </>
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
            </div>
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

      {/* Settings Modal - Mobile */}
      {isSettingsOpen && isMobileDevice && (
        <div 
          className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div 
            className="bg-gradient-to-br from-white via-white to-gray-50/30 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border-2 border-white/60 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-between px-6 py-5 border-b border-gray-100/80 bg-gradient-to-r from-orange-50/50 via-white to-blue-50/30 backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-blue-500/5"></div>
              
              <div className="relative flex items-center gap-3 text-gray-800">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30">
                  <Settings size={20} />
                </div>
                <div>
                  <p className="text-base font-bold tracking-tight">{t('settings')}</p>
                  <p className="text-xs text-gray-500 font-medium">{t('app_title')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="relative p-2.5 text-gray-400 hover:text-gray-700 hover:bg-white/80 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-110"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-8 max-h-[75vh] overflow-y-auto">
              {/* Import / Export */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
                  <p className="text-sm font-bold tracking-tight text-gray-700">{t('import_template')} / {t('export_all_templates')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={(e) => templateManagement.handleImportTemplate(e, setCategories)}
                      className="hidden" 
                      id="import-template-input-modal"
                    />
                    <div 
                      onClick={() => document.getElementById('import-template-input-modal').click()}
                      className="cursor-pointer w-full text-center px-5 py-4 text-sm font-semibold bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 text-gray-700 rounded-2xl transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg hover:scale-[1.02]"
                    >
                      <Download size={18} />
                      <span>{t('import_template')}</span>
                    </div>
                  </label>
                  <button
                    onClick={() => templateManagement.handleExportAllTemplates(categories)}
                    className="w-full text-center px-5 py-4 text-sm font-semibold bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl transition-all duration-300 border-2 border-orange-500 hover:border-orange-600 flex items-center justify-center gap-2.5 shadow-md shadow-orange-500/30 hover:shadow-lg hover:shadow-orange-500/40 hover:scale-[1.02]"
                  >
                    <Upload size={18} />
                    <span>{t('export_all_templates')}</span>
                  </button>
                </div>
              </div>

              {/* Data Refresh */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></div>
                  <p className="text-sm font-bold tracking-tight text-gray-700">{t('refresh_system')}</p>
                </div>
                <button
                  onClick={templateManagement.handleRefreshSystemData}
                  className="w-full text-center px-5 py-4 text-sm font-semibold bg-white hover:bg-orange-50 text-orange-600 rounded-2xl transition-all duration-300 border-2 border-orange-100 hover:border-orange-200 flex items-center justify-center gap-2.5 shadow-sm"
                >
                  <RefreshCw size={18} />
                  <span>{t('refresh_system')}</span>
                </button>
              </div>

              {/* Storage */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                  <p className="text-sm font-bold tracking-tight text-gray-700">{t('storage_mode')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={fileSystem.handleSwitchToLocalStorage}
                    className={`relative w-full px-5 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 border-2 flex items-center justify-between overflow-hidden group ${
                      storageMode === 'browser' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30' 
                        : 'bg-gradient-to-br from-white to-gray-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-[1.02]'
                    }`}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <Globe size={18} />
                      <span>{t('use_browser_storage')}</span>
                    </div>
                    {storageMode === 'browser' && (
                      <div className="relative z-10">
                        <Check size={18} className="animate-in zoom-in duration-300" />
                      </div>
                    )}
                  </button>
                  <button
                    onClick={fileSystem.handleSelectDirectory}
                    disabled={!isFileSystemSupported || isMobileDevice}
                    className={`relative w-full px-5 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 border-2 flex items-center justify-between overflow-hidden group ${
                      storageMode === 'folder' 
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-500 shadow-lg shadow-green-500/30' 
                        : `bg-gradient-to-br from-white to-gray-50 text-gray-700 border-gray-200 ${(!isFileSystemSupported || isMobileDevice) ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-300 hover:shadow-md hover:scale-[1.02]'}`
                    }`}
                    title={isMobileDevice ? t('use_browser_storage') : (!isFileSystemSupported ? t('browser_not_supported') : '')}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <Download size={18} />
                      <span>{t('use_local_folder')}</span>
                    </div>
                    {storageMode === 'folder' && (
                      <div className="relative z-10">
                        <Check size={18} className="animate-in zoom-in duration-300" />
                      </div>
                    )}
                  </button>
                </div>

                {storageMode === 'folder' && directoryHandle && (
                  <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200/60 rounded-xl text-sm text-green-700 flex items-center justify-between gap-3 shadow-sm animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-2.5 font-medium">
                      <div className="p-1 bg-green-500 rounded-lg text-white">
                        <Check size={14} />
                      </div>
                      <span>{t('auto_save_enabled')}</span>
                    </div>
                    <button
                      onClick={fileSystem.handleManualLoadFromFolder}
                      className="px-4 py-1.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-xs font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      {t('load_from_folder')}
                    </button>
                  </div>
                )}

                {storageMode === 'browser' && (
                  <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                    <p className="text-xs text-blue-700 font-medium">
                      {t('storage_used')}: <span className="font-bold">{getStorageSize()} KB</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Danger Zone */}
              <div className="space-y-4 pt-4 border-t-2 border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-red-400 to-red-600 rounded-full"></div>
                  <p className="text-sm font-bold tracking-tight text-red-600">{t('clear_all_data')}</p>
                </div>
                <button
                  onClick={handleClearAllData}
                  className="w-full text-center px-5 py-4 text-sm font-semibold bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 hover:text-red-700 rounded-2xl transition-all duration-300 border-2 border-red-200 hover:border-red-300 flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg hover:scale-[1.02] group"
                >
                  <Trash2 size={18} className="group-hover:animate-pulse" />
                  <span>{t('clear_all_data')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            if (isMobileDevice) setMobileTab('editor');
          }}
          isDarkMode={isDarkMode}
          showTemplateInfo={true}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-2xl border-t flex justify-around items-center z-[250] h-16 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.05)] transition-colors duration-300 ${isDarkMode ? 'bg-[#181716]/25 border-white/5' : 'bg-white/25 border-white/30'}`}>
        <button 
          onClick={() => {
            setMobileTab('home');
            setDiscoveryView(true);
            setZoomedImage(null);
            setIsTemplatesDrawerOpen(false);
          }}
          className="flex flex-col items-center justify-center w-full h-full transition-all active:scale-90 group"
        >
          <div className={`p-2 rounded-xl transition-all ${mobileTab === 'home' ? (isDarkMode ? 'bg-white/5' : 'bg-orange-50/50') : ''}`}>
            <div 
              style={{ 
                width: '24px', 
                height: '24px', 
                backgroundColor: mobileTab === 'home' ? '#EA580C' : (isDarkMode ? '#8E9196' : '#6B7280'),
                WebkitMaskImage: 'url(/home.svg)',
                maskImage: 'url(/home.svg)',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                filter: isDarkMode ? 'none' : 'drop-shadow(1px 1px 0px rgba(255,255,255,0.3))'
              }}
            />
          </div>
        </button>
        
        <button 
          onClick={() => {
            setDiscoveryView(false);
            setZoomedImage(null);
            setIsTemplatesDrawerOpen(false);
            if (templates.length > 0 && !activeTemplateId) {
              const firstId = templates[0].id;
              setActiveTemplateId(firstId);
            }
            setMobileTab('editor');
          }}
          className="flex flex-col items-center justify-center w-full h-full transition-all active:scale-90 group"
        >
          <div className={`p-2 rounded-xl transition-all ${mobileTab === 'editor' ? (isDarkMode ? 'bg-white/5' : 'bg-orange-50/50') : ''}`}>
            <div 
              style={{ 
                width: '24px', 
                height: '24px', 
                backgroundColor: mobileTab === 'editor' ? '#EA580C' : (isDarkMode ? '#8E9196' : '#6B7280'),
                WebkitMaskImage: 'url(/list.svg)',
                maskImage: 'url(/list.svg)',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                filter: isDarkMode ? 'none' : 'drop-shadow(1px 1px 0px rgba(255,255,255,0.3))'
              }}
            />
          </div>
        </button>
        
        <button 
          onClick={() => {
            setMobileTab('history');
            setDiscoveryView(false);
            setZoomedImage(null);
            setIsTemplatesDrawerOpen(false);
          }}
          className="flex flex-col items-center justify-center w-full h-full transition-all active:scale-90 group"
        >
          <div className={`p-2 rounded-xl transition-all ${mobileTab === 'history' ? (isDarkMode ? 'bg-white/5' : 'bg-orange-50/50') : ''}`}>
            <div className={`${mobileTab === 'history' ? 'text-[#EA580C]' : (isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]')} transition-colors`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => {
            setMobileTab('settings');
            setDiscoveryView(false);
            setZoomedImage(null);
            setIsTemplatesDrawerOpen(false);
          }}
          className="flex flex-col items-center justify-center w-full h-full transition-all active:scale-90 group"
        >
          <div className={`p-2 rounded-xl transition-all ${mobileTab === 'settings' ? (isDarkMode ? 'bg-white/5' : 'bg-orange-50/50') : ''}`}>
            <div 
              style={{ 
                width: '24px', 
                height: '24px', 
                backgroundColor: mobileTab === 'settings' ? '#EA580C' : (isDarkMode ? '#8E9196' : '#6B7280'),
                WebkitMaskImage: 'url(/setting.svg)',
                maskImage: 'url(/setting.svg)',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                filter: isDarkMode ? 'none' : 'drop-shadow(1px 1px 0px rgba(255,255,255,0.3))'
              }}
            />
          </div>
        </button>

        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex flex-col items-center justify-center w-full h-full transition-all active:scale-90 group"
        >
          <div className="p-2 rounded-xl transition-all">
            <div className={`${isDarkMode ? 'text-[#8E9196]' : 'text-[#6B7280]'} transition-colors`}>
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </div>
          </div>
        </button>
      </div>

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
                break;
              case 'copy':
                const { default: fileManagerCopy } = await import('./utils/fileManager.js');
                const responseCopy = await fetch(image.url);
                const blobCopy = await responseCopy.blob();
                await fileManagerCopy.copyImageToClipboard(blobCopy);
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
                  createdAt: image.timestamp || Date.now()
                };
                await storageAdapter.saveImage(image.id, blobHistory, metadata);
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

