import { getLocalized } from '../../../utils/helpers';
import { parseVariableName } from './variableParser';

/**
 * 模板内容处理工具函数
 */

/**
 * 收集模板变量的值到 parameters 对象
 * @param {object} activeTemplate - 当前激活的模板
 * @param {object} defaults - 默认值对象
 * @param {string} language - 当前语言
 * @returns {object} - 包含所有变量值的对象
 */
export const collectTemplateParameters = (activeTemplate, defaults, language) => {
  const parameters = {};
  const templateContent = getLocalized(activeTemplate.content, language);
  if (!templateContent) return parameters;
  
  const counters = {};
  
  // 提取所有变量及其值
  templateContent.replace(/{{([^}]+)}}/g, (match, fullKey) => {
    const parsed = parseVariableName(fullKey.trim());
    const baseKey = parsed.baseKey;
    
    // 使用完整的 fullKey 作为计数器的 key
    const varIndex = counters[fullKey] || 0;
    counters[fullKey] = varIndex + 1;
    
    const uniqueKey = `${fullKey}-${varIndex}`;
    
    // 获取当前选择的值
    let currentValue = activeTemplate.selections?.[uniqueKey];
    
    // 如果没有选择值，使用默认值
    if (!currentValue) {
      currentValue = defaults[baseKey];
    }
    
    // 处理多语言值，提取字符串值
    let stringValue = '';
    if (typeof currentValue === 'object' && currentValue !== null) {
      stringValue = currentValue[language] || currentValue.cn || currentValue.en || '';
    } else if (typeof currentValue === 'string') {
      stringValue = currentValue;
    }
    
    // 只保存非空的字符串值，使用 baseKey 作为 key（去重）
    if (stringValue && stringValue.trim()) {
      // 如果同一个 baseKey 已经有值，不覆盖（保留第一个）
      if (!parameters[baseKey]) {
        parameters[baseKey] = stringValue.trim();
      }
    }
    
    return match; // 返回原匹配，不影响替换逻辑
  });
  
  return parameters;
};

/**
 * 生成填充后的完整提示词
 * @param {string} templateContent - 模板内容
 * @param {object} activeTemplate - 当前激活的模板
 * @param {object} defaults - 默认值对象
 * @param {string} language - 当前语言
 * @returns {string} - 填充后的提示词
 */
export const generateFilledPrompt = (templateContent, activeTemplate, defaults, language) => {
  if (!templateContent) return '';
  
  const counters = {};
  
  // 替换所有变量为实际值
  return templateContent.replace(/{{([^}]+)}}/g, (match, fullKey) => {
    const parsed = parseVariableName(fullKey.trim());
    const baseKey = parsed.baseKey;
    
    // 使用完整的 fullKey 作为计数器的 key
    const varIndex = counters[fullKey] || 0;
    counters[fullKey] = varIndex + 1;
    
    const uniqueKey = `${fullKey}-${varIndex}`;
    
    // 获取当前选择的值
    let currentValue = activeTemplate.selections?.[uniqueKey];
    
    // 如果没有选择值，使用默认值
    if (!currentValue) {
      currentValue = defaults[baseKey];
    }
    
    // 处理多语言值
    if (typeof currentValue === 'object' && currentValue !== null) {
      return currentValue[language] || currentValue.cn || currentValue.en || fullKey;
    }
    
    // 返回字符串值或原变量名（如果没有找到值）
    return typeof currentValue === 'string' ? currentValue : fullKey;
  });
};

