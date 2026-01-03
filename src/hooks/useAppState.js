// 核心应用状态管理 Hook
import { useState, useEffect, useMemo } from 'react';
import { useStickyState } from './useStickyState';
import { getSystemLanguage } from '../utils/helpers';
import { INITIAL_TEMPLATES_CONFIG, SYSTEM_DATA_VERSION } from '../data/templates';
import { INITIAL_BANKS, INITIAL_DEFAULTS, INITIAL_CATEGORIES } from '../data/banks';
import { MASONRY_STYLES } from '../constants/masonryStyles';
import { toggleDarkMode } from '../utils/themeManager';

/**
 * 核心应用状态管理 Hook
 * 管理全局状态：语言、主题、移动端检测、UI 状态等
 */
export const useAppState = () => {
  // 当前应用代码版本
  const APP_VERSION = "0.6.2";

  // 瀑布流样式管理
  const [masonryStyleKey, setMasonryStyleKey] = useState('poster');
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const currentMasonryStyle = MASONRY_STYLES[masonryStyleKey] || MASONRY_STYLES.default;

  // Global State with Persistence
  const [banks, setBanks] = useStickyState(INITIAL_BANKS, "app_banks_v9");
  const [defaults, setDefaults] = useStickyState(INITIAL_DEFAULTS, "app_defaults_v9");
  const [language, setLanguage] = useStickyState(getSystemLanguage(), "app_language_v1"); // 全局UI语言
  const [templateLanguage, setTemplateLanguage] = useStickyState(getSystemLanguage(), "app_template_language_v1"); // 模板内容语言
  const [categories, setCategories] = useStickyState(INITIAL_CATEGORIES, "app_categories_v1");
  
  const [templates, setTemplates] = useStickyState(INITIAL_TEMPLATES_CONFIG, "app_templates_v10");
  const [activeTemplateId, setActiveTemplateId] = useStickyState("tpl_default", "app_active_template_id_v4");
  
  const [lastAppliedDataVersion, setLastAppliedDataVersion] = useStickyState("", "app_data_version_v1");
  const [isDarkMode, setIsDarkMode] = useStickyState(false, "app_dark_mode_v1");
  const [showDataUpdateNotice, setShowDataUpdateNotice] = useState(false);
  const [showAppUpdateNotice, setShowAppUpdateNotice] = useState(false);

  // 同步 dark mode 状态到 HTML 根元素
  useEffect(() => {
    toggleDarkMode(isDarkMode);
  }, [isDarkMode]);

  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [activePopover, setActivePopover] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);

  // Template Management UI State
  const [editingTemplateNameId, setEditingTemplateNameId] = useState(null);
  const [tempTemplateName, setTempTemplateName] = useState("");
  const [tempTemplateAuthor, setTempTemplateAuthor] = useState("");
  const [zoomedImage, setZoomedImage] = useState(null);
  
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageUpdateMode, setImageUpdateMode] = useState('replace'); // 'replace' or 'add'
  const [currentImageEditIndex, setCurrentImageEditIndex] = useState(0);
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [showImageActionMenu, setShowImageActionMenu] = useState(false);
  
  // AI Image Generation State
  const [generatedImages, setGeneratedImages] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  
  // File System Access API State
  const [storageMode, setStorageMode] = useState(() => {
    return localStorage.getItem('app_storage_mode') || 'browser';
  });
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [isFileSystemSupported, setIsFileSystemSupported] = useState(false);
  
  // Template Tag Management State
  const [selectedTags, setSelectedTags] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTemplateTags, setEditingTemplateTags] = useState(null); // {id, tags}
  const [isDiscoveryView, setDiscoveryView] = useState(true); // 首次加载默认显示发现（海报）视图
  
  // 统一的发现页切换处理器
  const handleSetDiscoveryView = useMemo(() => {
    return (val) => {
      setDiscoveryView(val);
    };
  }, []);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBanksViewOpen, setIsBanksViewOpen] = useState(false);
  
  const showDiscoveryOverlay = isDiscoveryView;
  
  // Template Sort State
  const [sortOrder, setSortOrder] = useState("newest"); // newest, oldest, a-z, z-a, random
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [randomSeed, setRandomSeed] = useState(Date.now()); // 用于随机排序的种子
  
  // 趣味设计：灯具摆动状态
  const [lampRotation, setLampRotation] = useState(0);
  const [isLampHovered, setIsLampHovered] = useState(false);
  const [isLampOn, setIsLampOn] = useState(true); // 暗色模式下灯是否开启 (强度控制)
  
  // 当暗夜模式关闭时，重置灯的状态为开启
  useEffect(() => {
    if (!isDarkMode) {
      setIsLampOn(true);
    }
  }, [isDarkMode]);

  const handleLampMouseMove = (e) => {
    if (!isDarkMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const mouseX = e.clientX;
    const diffX = mouseX - centerX;
    // 灵敏度提升：由于感应区缩小到 32px，调整系数以保持摆动幅度
    const rotation = Math.max(-12, Math.min(12, -diffX / 1.5));
    setLampRotation(rotation);
    setIsLampHovered(true);
  };
  
  const [updateNoticeType, setUpdateNoticeType] = useState(null); // 'app' | 'data' | null

  // 确保有一个有效的 activeTemplateId - 自动选择第一个模板
  useEffect(() => {
    if (templates.length > 0) {
      // 检查当前 activeTemplateId 是否有效
      const currentTemplateExists = templates.some(t => t.id === activeTemplateId);
      if (!currentTemplateExists || !activeTemplateId) {
        // 如果当前选中的模板不存在或为空，选择第一个模板
        console.log('[自动选择] 选择第一个模板:', templates[0].id);
        setActiveTemplateId(templates[0].id);
      }
    }
  }, [templates, activeTemplateId, setActiveTemplateId]);


  // Fix initial categories if empty (migration safety)
  useEffect(() => {
    if (!categories || Object.keys(categories).length === 0) {
      setCategories(INITIAL_CATEGORIES);
    }
  }, [categories, setCategories]);

  // Ensure all templates have tags field and sync default templates' tags (migration safety)
  useEffect(() => {
    let needsUpdate = false;
    const updatedTemplates = templates.map(t => {
      // Find if this is a default template
      const defaultTemplate = INITIAL_TEMPLATES_CONFIG.find(dt => dt.id === t.id);
      
      if (defaultTemplate) {
        // Sync tags from default template if it's a built-in one
        if (JSON.stringify(t.tags) !== JSON.stringify(defaultTemplate.tags)) {
          needsUpdate = true;
          return { ...t, tags: defaultTemplate.tags || [] };
        }
      } else if (!t.tags) {
        // User-created template without tags
        needsUpdate = true;
        return { ...t, tags: [] };
      }
      
      return t;
    });
    
    if (needsUpdate) {
      setTemplates(updatedTemplates);
    }
  }, []); // 只在初始化时运行一次

  // Derived State: Current Active Template
  const activeTemplate = templates.find(t => t.id === activeTemplateId) || templates[0];

  return {
    // 版本信息
    APP_VERSION,
    SYSTEM_DATA_VERSION,
    
    // 瀑布流样式
    masonryStyleKey,
    setMasonryStyleKey,
    isStyleMenuOpen,
    setIsStyleMenuOpen,
    currentMasonryStyle,
    
    // 核心数据状态
    banks,
    setBanks,
    defaults,
    setDefaults,
    language,
    setLanguage,
    templateLanguage,
    setTemplateLanguage,
    categories,
    setCategories,
    templates,
    setTemplates,
    activeTemplateId,
    setActiveTemplateId,
    activeTemplate,
    lastAppliedDataVersion,
    setLastAppliedDataVersion,
    
    // 主题和UI状态
    isDarkMode,
    setIsDarkMode,
    showDataUpdateNotice,
    setShowDataUpdateNotice,
    showAppUpdateNotice,
    setShowAppUpdateNotice,
    updateNoticeType,
    setUpdateNoticeType,
    
    // 视图状态
    isDiscoveryView,
    setDiscoveryView: handleSetDiscoveryView,
    showDiscoveryOverlay,
    
    // UI 状态
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
    
    // 模板管理 UI 状态
    editingTemplateNameId,
    setEditingTemplateNameId,
    tempTemplateName,
    setTempTemplateName,
    tempTemplateAuthor,
    setTempTemplateAuthor,
    zoomedImage,
    setZoomedImage,
    
    // 图片管理状态
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
    
    // AI 图片生成状态
    generatedImages,
    setGeneratedImages,
    showImageModal,
    setShowImageModal,
    
    // 文件系统状态
    storageMode,
    setStorageMode,
    directoryHandle,
    setDirectoryHandle,
    isFileSystemSupported,
    setIsFileSystemSupported,
    
    // 模板标签和搜索状态
    selectedTags,
    setSelectedTags,
    searchQuery,
    setSearchQuery,
    editingTemplateTags,
    setEditingTemplateTags,
    
    // 视图状态
    isSettingsOpen,
    setIsSettingsOpen,
    isHistoryOpen,
    setIsHistoryOpen,
    isBanksViewOpen,
    setIsBanksViewOpen,
    
    // 排序状态
    sortOrder,
    setSortOrder,
    isSortMenuOpen,
    setIsSortMenuOpen,
    randomSeed,
    setRandomSeed,
    
    // 灯具效果状态
    lampRotation,
    setLampRotation,
    isLampHovered,
    setIsLampHovered,
    isLampOn,
    setIsLampOn,
    handleLampMouseMove,
  };
};

