import React from 'react';
import { Pencil, Check, X } from 'lucide-react';

/**
 * 模板标签编辑器组件
 */
export const TemplateTagEditor = ({
  activeTemplate,
  editingTemplateTags,
  setEditingTemplateTags,
  handleUpdateTemplateTags,
  TEMPLATE_TAGS,
  displayTag,
  t,
  isDarkMode
}) => {
  if (editingTemplateTags?.id !== activeTemplate.id) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditingTemplateTags({ id: activeTemplate.id, tags: activeTemplate.tags || [] });
        }}
        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 group/edit-tag ${isDarkMode ? 'text-gray-600 hover:text-orange-400 hover:bg-white/5' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`}
        title={t('edit_tags')}
      >
        <Pencil size={12} className="transition-transform group-hover/edit-tag:scale-110" />
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/edit-tag:opacity-100 transition-opacity">{t('edit_tags')}</span>
      </button>
    );
  }

  return (
    <div className={`mb-6 p-4 backdrop-blur-sm rounded-2xl border shadow-sm flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-white/50 border-orange-100'}`}>
      <div className={`flex items-center justify-between border-b pb-2 mb-1 ${isDarkMode ? 'border-white/5' : 'border-orange-50'}`}>
        <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
          <Pencil size={12} className="text-orange-500" />
          {t('edit_tags')}
        </span>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpdateTemplateTags(activeTemplate.id, editingTemplateTags.tags);
              setEditingTemplateTags(null);
            }}
            className="p-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-sm hover:shadow-orange-200 flex items-center gap-1.5 px-3"
          >
            <Check size={14} />
            <span className="text-xs font-bold">{t('confirm')}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingTemplateTags(null);
            }}
            className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 px-3 ${isDarkMode ? 'bg-white/10 text-gray-400 hover:bg-white/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <X size={14} />
            <span className="text-xs font-bold">{t('cancel')}</span>
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {TEMPLATE_TAGS.map(tag => (
          <button
            key={tag}
            onClick={(e) => {
              e.stopPropagation();
              const currentTags = editingTemplateTags.tags || [];
              const newTags = currentTags.includes(tag)
                ? currentTags.filter(t => t !== tag)
                : [...currentTags, tag];
              setEditingTemplateTags({ id: activeTemplate.id, tags: newTags });
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              (editingTemplateTags.tags || []).includes(tag)
                ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200 scale-105'
                : (isDarkMode ? 'bg-white/5 text-gray-500 border-white/5 hover:border-orange-500/50 hover:text-orange-400' : 'bg-white text-gray-500 border-gray-100 hover:border-orange-200 hover:text-orange-500')
            }`}
          >
            {displayTag(tag)}
          </button>
        ))}
      </div>
    </div>
  );
};

