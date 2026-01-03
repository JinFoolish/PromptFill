import React from 'react';
import { 
  Search, RotateCcw, 
  ChevronRight, ChevronDown, ImageIcon, ArrowUpRight, Plus,
  Pencil, Copy as CopyIcon, Download, Trash2, ListFilter // [新增] 引入 ListFilter 图标
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { getLocalized } from '../utils/helpers';

/**
 * TemplatesSidebar 组件 - 负责展示左侧模版列表
 */
export const TemplatesSidebar = React.memo(({ 
  mobileTab, 
  isTemplatesDrawerOpen,
  setIsTemplatesDrawerOpen,
  setDiscoveryView,
  activeTemplateId,
  setActiveTemplateId, 
  filteredTemplates,
  searchQuery,
  setSearchQuery,
  selectedTags,
  setSelectedTags,
  TEMPLATE_TAGS,
  displayTag,
  language,
  setLanguage,
  setIsSettingsOpen,
  t,
  isSortMenuOpen,
  setIsSortMenuOpen,
  sortOrder,
  setSortOrder,
  setRandomSeed,
  handleResetTemplate,
  startRenamingTemplate,
  handleDuplicateTemplate,
  handleExportTemplate,
  handleDeleteTemplate,
  handleAddTemplate,
  INITIAL_TEMPLATES_CONFIG,
  editingTemplateNameId,
  tempTemplateName,
  setTempTemplateName,
  tempTemplateAuthor,
  setTempTemplateAuthor,
  saveTemplateName,
  setEditingTemplateNameId,
  isDarkMode
}) => {
  // 移动端适配已禁用，通过配置接口可重新启用
  const isMobile = false; // 使用配置接口: import { isMobileDevice } from '../config/mobileConfig';

  return (
    <>
      {/* Mobile Overlay (已禁用) */}
      {false && isMobile && isTemplatesDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[290] animate-in fade-in duration-300"
          onClick={() => setIsTemplatesDrawerOpen(false)}
        />
      )}

      <Card 
        variant="container"
        className="relative md:flex flex-col flex-shrink-0 h-full w-[340px] overflow-hidden flex overflow-hidden bg-transparent"
      >
        <div className="flex flex-col w-full h-full bg-transparent backdrop-blur-sm rounded-2xl">
          {/* --- Sidebar Header with Tools --- */}
      <div className="flex-shrink-0 p-6">
         <div className="flex items-center justify-between mb-6">
             <div className="flex flex-col items-start gap-1">
                  <h1 className={`${isMobile ? 'text-[18px]' : 'text-[22px]'} font-black tracking-tight text-orange-500 flex items-baseline gap-2`}>
                      提示词填空器
                      <span className="text-gray-400 dark:text-gray-600 text-xs font-bold tracking-widest">V0.6.1</span>
                  </h1>
             </div>
             
             {/* 仅在移动端显示顶部操作按钮 */}
             <div className="hidden md:hidden items-center gap-1.5">
                  {/* 移动端按钮暂时隐藏 */}
             </div>
         </div>

         <div className="flex flex-col gap-4">
            {/* Search & Controls Row (合并为一行) */}
            <div className="flex items-center gap-2">
                {/* 极简搜索框 - 添加 flex-1 占据剩余空间 */}
                <div className="relative group flex-1">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none z-10 dark:text-gray-600 text-gray-400 group-focus-within:text-orange-500`} size={16} />
                    <Input 
                      type="text" 
                      placeholder={t('search_templates')} 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="w-full pl-11 pr-4 py-3 rounded-2xl text-[14px] font-medium shadow-sm" 
                    />
                </div>

                {/* Sort Button */}
                <div className="relative">
                  <Button
                    onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                    variant={isSortMenuOpen ? "default" : "outline"}
                    size="icon"
                    title={t('sort')}
                    className="w-[46px] h-[46px] flex items-center justify-center rounded-2xl"
                  >
                    <ListFilter className="h-4 w-4" />
                  </Button>
                  
                  {isSortMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 backdrop-blur-xl rounded-2xl shadow-2xl border py-2 min-w-[160px] z-[110] animate-in slide-in-from-top-2 duration-200 bg-white/95 dark:bg-black/80 border-white/60 dark:border-white/10">
                      {[
                        { value: 'newest', label: t('sort_newest') },
                        { value: 'oldest', label: t('sort_oldest') },
                        { value: 'a-z', label: t('sort_az') },
                        { value: 'z-a', label: t('sort_za') },
                        { value: 'random', label: t('sort_random') }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortOrder(option.value);
                            if (option.value === 'random') setRandomSeed(Date.now());
                            setIsSortMenuOpen(false);
                          }}
                          className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${sortOrder === option.value ? 'text-orange-600 font-semibold' : 'text-gray-700 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-white/10'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

            </div>
            
            {/* 极简标签选择 */}
            <div className="flex flex-wrap items-center gap-1.5 pb-1 px-1">
                <button 
                  onClick={() => setSelectedTags("")} 
                  className={`px-3 py-1 rounded-xl tracking-widest capitalize transition-all ${
                    language === 'cn' 
                      ? 'text-[11px] font-black' 
                      : 'text-[8px] font-medium'
                  } ${selectedTags === "" ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                >
                  {t('all_templates')}
                </button>
                {TEMPLATE_TAGS.map(tag => (
                  <button 
                    key={tag} 
                    onClick={() => setSelectedTags(selectedTags === tag ? "" : tag)} 
                    className={`px-3 py-1 rounded-xl tracking-widest capitalize transition-all ${
                      language === 'cn' 
                        ? 'text-[11px] font-black' 
                        : 'text-[8px] font-medium'
                    } ${selectedTags === tag ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : (isDarkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100')}`}
                  >
                    {displayTag(tag)}
                  </button>
                ))}
            </div>
         </div>
      </div>

      {/* --- Template List --- */}
      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          <div className="flex flex-col gap-1">
              {filteredTemplates.map(t_item => (
                  <div 
                      key={t_item.id} 
                      onClick={() => {
                          setActiveTemplateId(t_item.id);
                          // 移动端适配已禁用
                      }} 
                      className={`group flex flex-col p-4 rounded-2xl transition-all duration-300 relative text-left cursor-pointer ${t_item.id === activeTemplateId ? 'bg-[#FFE9D0] dark:bg-orange-500/20' : 'bg-transparent hover:bg-[#F2EDE7] dark:hover:bg-white/5'}`}
                  >
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                              {editingTemplateNameId === t_item.id ? (
                                <div className="flex-1 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Input 
                                        autoFocus
                                        type="text" 
                                        value={tempTemplateName}
                                        onChange={(e) => setTempTemplateName(e.target.value)}
                                        className="w-full px-2 py-1 text-base font-black border-b-2 border-orange-500 bg-transparent focus:outline-none"
                                        placeholder={t('label_placeholder')}
                                        onKeyDown={(e) => e.key === 'Enter' && saveTemplateName()}
                                    />
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={saveTemplateName}
                                            className="px-3 py-1 bg-orange-500 text-white text-[10px] font-black rounded-lg hover:bg-orange-600 transition-colors"
                                        >
                                            {t('confirm')}
                                        </button>
                                        <button 
                                            onClick={() => setEditingTemplateNameId(null)}
                                            className={`px-3 py-1 text-[10px] font-black rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                        >
                                            {t('cancel')}
                                        </button>
                                    </div>
                                </div>
                              ) : (
                                <span className={`truncate text-[14px] tracking-tight leading-tight transition-all ${activeTemplateId === t_item.id ? (isDarkMode ? 'font-bold text-orange-400' : 'font-bold text-gray-900') : (isDarkMode ? 'font-semibold text-gray-500 group-hover:text-gray-300' : 'font-semibold text-gray-600 group-hover:text-gray-800')}`}>
                                  {getLocalized(t_item.name, language)}
                                </span>
                              )}
                          </div>
                      </div>

                      {/* 选中时展开的功能行 */}
                      {activeTemplateId === t_item.id && !editingTemplateNameId && (
                        <div className={`flex items-center gap-1 mt-3 pt-3 border-t animate-in slide-in-from-top-2 duration-300 ${isDarkMode ? 'border-white/5' : 'border-orange-200/30'}`}>
                            {INITIAL_TEMPLATES_CONFIG.some(cfg => cfg.id === t_item.id) && (
                                <button 
                                    title={t('reset_template')}
                                    onClick={(e) => { e.stopPropagation(); handleResetTemplate(t_item.id, e); }}
                                    className={`p-2 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-white/5 text-gray-500 hover:text-orange-400' : 'hover:bg-white/50 text-gray-500 hover:text-orange-600'}`}
                                >
                                    <RotateCcw size={14} />
                                </button>
                            )}
                            <button 
                                title={t('rename')}
                                onClick={(e) => { e.stopPropagation(); startRenamingTemplate(t_item, e); }}
                                className={`p-2 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-white/5 text-gray-500 hover:text-orange-400' : 'hover:bg-white/50 text-gray-500 hover:text-orange-600'}`}
                            >
                                <Pencil size={14} />
                            </button>
                            <button 
                                title={t('duplicate')}
                                onClick={(e) => { e.stopPropagation(); handleDuplicateTemplate(t_item, e); }}
                                className={`p-2 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-white/5 text-gray-500 hover:text-orange-400' : 'hover:bg-white/50 text-gray-500 hover:text-orange-600'}`}
                            >
                                <CopyIcon size={14} />
                            </button>
                            <button 
                                title={t('export_template')}
                                onClick={(e) => { e.stopPropagation(); handleExportTemplate(t_item); }}
                                className={`p-2 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-white/5 text-gray-500 hover:text-blue-400' : 'hover:bg-white/50 text-gray-500 hover:text-blue-600'}`}
                            >
                                <Download size={14} />
                            </button>
                            <button 
                                title={t('delete')}
                                onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t_item.id, e); }}
                                className={`p-2 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-white/5 text-gray-500 hover:text-red-400' : 'hover:bg-white/50 text-gray-500 hover:text-red-600'}`}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                      )}
                  </div>
              ))}
          </div>
      </div>

      {/* --- Footer & Create Button --- */}
      <div className="flex-shrink-0">
          <div className="p-6 pb-10 md:pb-8">
            <Button
                onClick={handleAddTemplate}
                variant="default"
                className="w-full py-3 text-[15px] font-black transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/20"
            >
                <Plus className="h-4 w-4" />
                {t('new_template')}
            </Button>
          </div>
      </div>
    </div>
  </Card>
  </>
  );
});

TemplatesSidebar.displayName = 'TemplatesSidebar';