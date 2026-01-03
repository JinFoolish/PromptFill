import React from 'react';
import { Check, X } from 'lucide-react';

/**
 * 模板名称编辑器组件
 */
export const TemplateNameEditor = ({ 
  tempTemplateName,
  setTempTemplateName,
  saveTemplateName,
  setEditingTemplateNameId,
  t,
  isDarkMode
}) => {
  return (
    <div className="mb-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
      <input 
        autoFocus
        type="text" 
        value={tempTemplateName}
        onChange={(e) => setTempTemplateName(e.target.value)}
        className={`text-2xl md:text-3xl font-bold bg-transparent border-b-2 border-orange-500 focus:outline-none w-full pb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
        placeholder={t('label_placeholder')}
        onKeyDown={(e) => e.key === 'Enter' && saveTemplateName()}
      />
      <div className="flex gap-2">
        <button 
          onClick={saveTemplateName}
          className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Check size={14} />
          {t('confirm')}
        </button>
        <button 
          onClick={() => setEditingTemplateNameId(null)}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${isDarkMode ? 'bg-white/10 text-gray-400 hover:bg-white/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          <X size={14} />
          {t('cancel')}
        </button>
      </div>
    </div>
  );
};

