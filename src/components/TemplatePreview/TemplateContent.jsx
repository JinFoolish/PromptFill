import React, { useMemo } from 'react';
import { getLocalized } from '../../utils/helpers';
import { VariableRenderer } from './VariableRenderer';

/**
 * 模板内容渲染组件
 * 负责渲染模板的主要内容区域
 */
export const TemplateContent = ({
  activeTemplate,
  language,
  banks,
  defaults,
  activePopover,
  setActivePopover,
  handleSelect,
  handleAddCustomAndSelect,
  popoverRef,
  categories,
  t,
  isDarkMode
}) => {
  const renderedContent = useMemo(() => {
    const contentToRender = getLocalized(activeTemplate?.content, language);
    if (!contentToRender) return null;
    
    const lines = contentToRender.split('\n');
    const counters = {}; 
    
    return lines.map((line, lineIdx) => {
      if (!line.trim()) return <div key={lineIdx} className="h-6"></div>;

      let content = line;
      let Type = 'div';
      let className = `${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 leading-10`;

      if (line.startsWith('### ')) {
        Type = 'h3';
        className = `text-lg font-bold mt-6 mb-3 border-b pb-2 ${isDarkMode ? 'text-white border-white/10' : 'text-gray-900 border-gray-100'}`;
        content = line.replace('### ', '');
      } else if (line.trim().startsWith('- ')) {
        className = `ml-4 flex items-start gap-2 mb-2 leading-10 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;
        content = (
          <React.Fragment key={lineIdx}>
            <span className={`${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mt-2.5`}>•</span>
            <span className="flex-1">
              <VariableRenderer
                text={line.replace('- ', '').trim()}
                lineKeyPrefix={lineIdx}
                counters={counters}
                activeTemplate={activeTemplate}
                banks={banks}
                defaults={defaults}
                activePopover={activePopover}
                setActivePopover={setActivePopover}
                handleSelect={handleSelect}
                handleAddCustomAndSelect={handleAddCustomAndSelect}
                popoverRef={popoverRef}
                categories={categories}
                t={t}
                language={language}
                isDarkMode={isDarkMode}
              />
            </span>
          </React.Fragment>
        );
        return <div key={lineIdx} className={className}>{content}</div>;
      } else if (/^\d+\.\s/.test(line.trim())) {
         className = `ml-4 flex items-start gap-2 mb-2 leading-10 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;
         const number = line.trim().match(/^\d+\./)[0];
         const text = line.trim().replace(/^\d+\.\s/, '');
         content = (
            <React.Fragment key={lineIdx}>
              <span className={`font-mono mt-1 min-w-[20px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{number}</span>
              <span className="flex-1">
                <VariableRenderer
                  text={text}
                  lineKeyPrefix={lineIdx}
                  counters={counters}
                  activeTemplate={activeTemplate}
                  banks={banks}
                  defaults={defaults}
                  activePopover={activePopover}
                  setActivePopover={setActivePopover}
                  handleSelect={handleSelect}
                  handleAddCustomAndSelect={handleAddCustomAndSelect}
                  popoverRef={popoverRef}
                  categories={categories}
                  t={t}
                  language={language}
                  isDarkMode={isDarkMode}
                />
              </span>
            </React.Fragment>
        );
        return <div key={lineIdx} className={className}>{content}</div>;
      }

      if (typeof content === 'string') {
          return (
            <Type key={lineIdx} className={className}>
              <VariableRenderer
                text={content}
                lineKeyPrefix={lineIdx}
                counters={counters}
                activeTemplate={activeTemplate}
                banks={banks}
                defaults={defaults}
                activePopover={activePopover}
                setActivePopover={setActivePopover}
                handleSelect={handleSelect}
                handleAddCustomAndSelect={handleAddCustomAndSelect}
                popoverRef={popoverRef}
                categories={categories}
                t={t}
                language={language}
                isDarkMode={isDarkMode}
              />
            </Type>
          );
      }
      return <Type key={lineIdx} className={className}>{content}</Type>;
    });
  }, [activeTemplate.content, activeTemplate.selections, banks, defaults, activePopover, categories, t, language, handleSelect, handleAddCustomAndSelect, popoverRef, setActivePopover, isDarkMode]);

  return (
    <div id="final-prompt-content" className="md:px-4">
      {renderedContent}
    </div>
  );
};

