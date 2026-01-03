import React from 'react';
import { Variable } from '../Variable';
import { parseVariableName } from './utils/variableParser';

/**
 * 变量渲染组件
 * 负责将文本中的变量解析并渲染为交互式 Variable 组件
 */
export const VariableRenderer = ({ 
  text, 
  lineKeyPrefix, 
  counters,
  activeTemplate,
  banks,
  defaults,
  activePopover,
  setActivePopover,
  handleSelect,
  handleAddCustomAndSelect,
  popoverRef,
  categories,
  t,
  language,
  isDarkMode
}) => {
  const parts = text.split(/({{[^}]+}})/g);
  
  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('{{') && part.endsWith('}}')) {
          const fullKey = part.slice(2, -2).trim();
          const parsed = parseVariableName(fullKey);
          const baseKey = parsed.baseKey;
          
          // 使用完整的 fullKey 作为计数器的 key，以区分不同组的同名变量
          const varIndex = counters[fullKey] || 0;
          counters[fullKey] = varIndex + 1;
          
          const uniqueKey = `${fullKey}-${varIndex}`;
          // 获取值：优先从 selections 中获取，否则从 defaults 中获取（使用 baseKey）
          let currentValue = activeTemplate.selections?.[uniqueKey];
          
          // 如果存储的值是字符串且等于变量名（如 "fruit_1"），说明是错误存储，使用默认值
          if (typeof currentValue === 'string' && currentValue === fullKey) {
            currentValue = defaults[baseKey];
          } else if (!currentValue) {
            // 如果没有选择值，使用默认值
            currentValue = defaults[baseKey];
          }
          
          // 如果 currentValue 是字符串且包含变量名后缀（如 "柠檬_1"），需要清理
          if (typeof currentValue === 'string' && currentValue.endsWith(`_${parsed.groupId}`) && parsed.groupId) {
            // 如果值以 groupId 结尾，可能是错误拼接，尝试从词库中查找正确的值
            const bank = banks[baseKey];
            if (bank && bank.options) {
              // 尝试找到匹配的选项（去掉后缀后匹配）
              const valueWithoutSuffix = currentValue.replace(`_${parsed.groupId}`, '');
              const matchedOption = bank.options.find(opt => {
                const optStr = typeof opt === 'string' ? opt : (opt[language] || opt.cn || opt.en || '');
                return optStr === valueWithoutSuffix;
              });
              if (matchedOption) {
                currentValue = matchedOption;
              }
            }
          }

          // 获取词库配置：使用 baseKey 查找，确保即使变量名是 fruit_1 也能找到 fruit 词库
          const bankConfig = banks[baseKey];
          
          // 如果找不到词库，尝试使用 fullKey 作为后备（向后兼容）
          const config = bankConfig || banks[fullKey];
          
          // 调试：如果找不到词库，输出警告（开发环境）
          if (!config && process.env.NODE_ENV === 'development') {
            console.warn(`[Variable] 找不到词库配置: baseKey="${baseKey}", fullKey="${fullKey}", available keys:`, Object.keys(banks).slice(0, 10));
          }
          
          // 确保 config 存在且包含 category，否则使用默认值
          if (config && !config.category) {
            console.warn(`[Variable] 词库配置缺少 category: baseKey="${baseKey}", config:`, config);
          }

          return (
            <Variable 
              key={`${lineKeyPrefix}-${idx}`}
              id={fullKey}
              index={varIndex}
              config={config}  // 使用 baseKey 获取的词库配置，确保颜色正确
              currentVal={currentValue}
              isOpen={activePopover === uniqueKey}
              onToggle={(e) => {
                e.stopPropagation();
                setActivePopover(activePopover === uniqueKey ? null : uniqueKey);
              }}
              onSelect={(opt) => handleSelect(fullKey, varIndex, opt)}
              onAddCustom={(val) => handleAddCustomAndSelect(fullKey, varIndex, val)}
              popoverRef={popoverRef}
              categories={categories}
              t={t}
              language={language}
              isDarkMode={isDarkMode}
              groupId={parsed.groupId}  // 传递 groupId 用于显示分组标识
            />
          );
        }
        
        // 处理粗体标记 **text**
        const boldParts = part.split(/(\*\*.*?\*\*)/g);
        return (
          <React.Fragment key={`${lineKeyPrefix}-${idx}`}>
            {boldParts.map((bp, bIdx) => {
              if (bp.startsWith('**') && bp.endsWith('**')) {
                return <strong key={`${lineKeyPrefix}-${idx}-${bIdx}`} className={isDarkMode ? 'text-white' : 'text-gray-900'}>{bp.slice(2, -2)}</strong>;
              }
              return <span key={`${lineKeyPrefix}-${idx}-${bIdx}`}>{bp}</span>;
            })}
          </React.Fragment>
        );
      })}
    </>
  );
};

