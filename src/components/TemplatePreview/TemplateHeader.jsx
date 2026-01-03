import React from 'react';
import { Pencil } from 'lucide-react';
import { getLocalized } from '../../utils/helpers';
import { TemplateNameEditor } from './TemplateNameEditor';
import { TemplateTagEditor } from './TemplateTagEditor';
import { AIImageGenerator } from '../AIImageGenerator/AIImageGenerator';
import { generateFilledPrompt, collectTemplateParameters } from './utils/templateContentProcessor';

/**
 * 模板头部组件
 * 包含标题、标签、元信息和AI图片生成器
 */
export const TemplateHeader = ({
  activeTemplate,
  editingTemplateNameId,
  tempTemplateName,
  setTempTemplateName,
  saveTemplateName,
  startRenamingTemplate,
  setEditingTemplateNameId,
  editingTemplateTags,
  setEditingTemplateTags,
  handleUpdateTemplateTags,
  TEMPLATE_TAGS,
  displayTag,
  TAG_STYLES,
  language,
  defaults,
  onImageGenerated,
  t,
  isDarkMode
}) => {
  const templateContent = getLocalized(activeTemplate.content, language);
  const filledPrompt = generateFilledPrompt(templateContent, activeTemplate, defaults, language);
  const templateParameters = collectTemplateParameters(activeTemplate, defaults, language);

  return (
    <div className="flex-1 min-w-0 pr-4 z-10 pt-2">
      {editingTemplateNameId === activeTemplate.id ? (
        <TemplateNameEditor
          tempTemplateName={tempTemplateName}
          setTempTemplateName={setTempTemplateName}
          saveTemplateName={saveTemplateName}
          setEditingTemplateNameId={setEditingTemplateNameId}
          t={t}
          isDarkMode={isDarkMode}
        />
      ) : (
        <div className="flex items-center gap-3 mb-3 group/title-edit">
          <h2 className={`text-3xl md:text-4xl font-bold tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {getLocalized(activeTemplate.name, language)}
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              startRenamingTemplate(activeTemplate, e);
            }}
            className={`p-2 rounded-xl transition-all duration-200 opacity-0 group-hover/title-edit:opacity-100 ${isDarkMode ? 'text-gray-600 hover:text-orange-400 hover:bg-white/5' : 'text-gray-300 hover:text-orange-500 hover:bg-orange-50'}`}
            title={t('rename')}
          >
            <Pencil size={18} />
          </button>
        </div>
      )}
      
      {/* Tags / Meta */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border ${isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-600 border-orange-100/50'}`}>
          V0.6.1
        </span>
        {(activeTemplate.tags || []).map(tag => (
          <span 
            key={tag} 
            className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border ${TAG_STYLES[tag] || TAG_STYLES["default"]}`}
          >
            {displayTag(tag)}
          </span>
        ))}
        
        {editingTemplateTags?.id !== activeTemplate.id && (
          <TemplateTagEditor
            activeTemplate={activeTemplate}
            editingTemplateTags={editingTemplateTags}
            setEditingTemplateTags={setEditingTemplateTags}
            handleUpdateTemplateTags={handleUpdateTemplateTags}
            TEMPLATE_TAGS={TEMPLATE_TAGS}
            displayTag={displayTag}
            t={t}
            isDarkMode={isDarkMode}
          />
        )}
      </div>

      {/* Editing Tags UI - 在编辑模式下显示在 tags 列表下面 */}
      {editingTemplateTags?.id === activeTemplate.id && (
        <div className="mb-4">
          <TemplateTagEditor
            activeTemplate={activeTemplate}
            editingTemplateTags={editingTemplateTags}
            setEditingTemplateTags={setEditingTemplateTags}
            handleUpdateTemplateTags={handleUpdateTemplateTags}
            TEMPLATE_TAGS={TEMPLATE_TAGS}
            displayTag={displayTag}
            t={t}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      <p className={`text-sm font-medium mt-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
        {t('source_and_contribution')}：{activeTemplate.author === '官方' ? t('official') : (activeTemplate.author || t('official'))}
      </p>
      <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
        {t('made_by')}
      </p>

      {/* AI Image Generator */}
      <div className="mt-4">
        <AIImageGenerator
          prompt={filledPrompt}
          parameters={templateParameters}
          onImageGenerated={onImageGenerated}
          isDarkMode={isDarkMode}
          t={t}
          className="w-full max-w-md"
        />
      </div>
    </div>
  );
};

