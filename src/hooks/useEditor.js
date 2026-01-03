// 编辑器 Hook：处理编辑器相关逻辑、变量插入、光标检测、变量分组
import { useState, useRef, useEffect, useCallback } from 'react';
import { getLocalized } from '../utils/helpers';

/**
 * 编辑器 Hook
 */
export const useEditor = ({
  activeTemplate,
  activeTemplateId,
  templateLanguage,
  isEditing,
  setIsEditing,
  setActivePopover,
  updateActiveTemplateContent,
  setTemplates
}) => {
  // Cursor State for Grouping
  const [cursorInVariable, setCursorInVariable] = useState(false);
  const [currentVariableName, setCurrentVariableName] = useState(null);
  const [currentGroupId, setCurrentGroupId] = useState(null);

  const textareaRef = useRef(null);

  // 变量解析工具函数：从变量名中提取 baseKey 和 groupId
  const parseVariableName = useCallback((varName) => {
    const match = varName.match(/^(.+?)(?:_(\d+))?$/);
    if (match) {
      return {
        baseKey: match[1],
        groupId: match[2] || null
      };
    }
    return { baseKey: varName, groupId: null };
  }, []);

  // 检测光标是否在变量内，并提取当前变量信息
  const detectCursorInVariable = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !isEditing) {
      setCursorInVariable(false);
      setCurrentVariableName(null);
      setCurrentGroupId(null);
      return;
    }

    const text = textarea.value;
    const cursorPos = textarea.selectionStart;

    // 向前查找最近的 {{
    let startPos = cursorPos;
    while (startPos > 0 && text.substring(startPos - 2, startPos) !== '{{') {
      startPos--;
    }
    
    // 向后查找最近的 }}
    let endPos = cursorPos;
    while (endPos < text.length && text.substring(endPos, endPos + 2) !== '}}') {
      endPos++;
    }

    // 检查光标是否在 {{...}} 之间
    if (startPos >= 0 && endPos < text.length && 
        text.substring(startPos - 2, startPos) === '{{' && 
        text.substring(endPos, endPos + 2) === '}}') {
      // 光标在变量内
      const variableName = text.substring(startPos, endPos).trim();
      const parsed = parseVariableName(variableName);
      
      setCursorInVariable(true);
      setCurrentVariableName(variableName);
      setCurrentGroupId(parsed.groupId);
    } else {
      setCursorInVariable(false);
      setCurrentVariableName(null);
      setCurrentGroupId(null);
    }
  }, [isEditing, parseVariableName]);

  // 监听光标位置变化
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !isEditing) return;

    const handleSelectionChange = () => {
      detectCursorInVariable();
    };

    textarea.addEventListener('keyup', handleSelectionChange);
    textarea.addEventListener('click', handleSelectionChange);
    textarea.addEventListener('select', handleSelectionChange);

    return () => {
      textarea.removeEventListener('keyup', handleSelectionChange);
      textarea.removeEventListener('click', handleSelectionChange);
      textarea.removeEventListener('select', handleSelectionChange);
    };
  }, [isEditing, detectCursorInVariable]);

  // 查找关联变量（同一组的变量）
  const findLinkedVariables = useCallback((template, baseKey, groupId) => {
    if (!groupId) return [];
    
    const content = getLocalized(template.content, templateLanguage);
    const regex = new RegExp(`\\{\\{${baseKey}_${groupId}\\}\\}`, 'g');
    const matches = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const fullKey = `${baseKey}_${groupId}`;
      // 计算这是第几个匹配（用于生成 uniqueKey）
      const beforeMatch = content.substring(0, match.index);
      const count = (beforeMatch.match(new RegExp(`\\{\\{${baseKey}_${groupId}\\}\\}`, 'g')) || []).length;
      matches.push(`${fullKey}-${count}`);
    }
    
    return matches;
  }, [templateLanguage]);

  // 更新模板选择
  const updateActiveTemplateSelection = useCallback((uniqueKey, value, linkedKeys = []) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== activeTemplateId) return t;
      
      const newSelections = { ...t.selections, [uniqueKey]: value };
      
      // 同步更新关联变量
      linkedKeys.forEach(linkedKey => {
        newSelections[linkedKey] = value;
      });
      
      return { ...t, selections: newSelections };
    }));
  }, [activeTemplateId, setTemplates]);

  // 设置变量组
  const handleSetGroup = useCallback((groupNum) => {
    if (!cursorInVariable || !currentVariableName) return;
    
    const parsed = parseVariableName(currentVariableName);
    const baseKey = parsed.baseKey;
    const newVariableName = `${baseKey}_${groupNum}`;
    
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    
    // 查找当前变量位置
    let startPos = cursorPos;
    while (startPos > 0 && text.substring(startPos - 2, startPos) !== '{{') {
      startPos--;
    }
    
    let endPos = cursorPos;
    while (endPos < text.length && text.substring(endPos, endPos + 2) !== '}}') {
      endPos++;
    }
    
    if (startPos >= 0 && endPos < text.length) {
      const before = text.substring(0, startPos);
      const after = text.substring(endPos + 2);
      const updatedText = `${before}{{${newVariableName}}}${after}`;
      
      const currentContent = activeTemplate.content || "";
      const isMultilingual = typeof currentContent === 'object';
      
      if (isMultilingual) {
        updateActiveTemplateContent({ ...currentContent, [templateLanguage]: updatedText }, true);
      } else {
        updateActiveTemplateContent(updatedText, true);
      }
      
      setTimeout(() => {
        textarea.focus();
        const newPos = startPos + newVariableName.length + 4; // {{ + name + }}
        textarea.setSelectionRange(newPos, newPos);
        detectCursorInVariable();
      }, 0);
    }
  }, [cursorInVariable, currentVariableName, parseVariableName, activeTemplate.content, templateLanguage, updateActiveTemplateContent, detectCursorInVariable]);

  // 移除变量组
  const handleRemoveGroup = useCallback(() => {
    if (!cursorInVariable || !currentVariableName) return;
    
    const parsed = parseVariableName(currentVariableName);
    if (!parsed.groupId) return; // 没有组ID，无需移除
    
    const baseKey = parsed.baseKey;
    const newVariableName = baseKey;
    
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    
    // 查找当前变量位置
    let startPos = cursorPos;
    while (startPos > 0 && text.substring(startPos - 2, startPos) !== '{{') {
      startPos--;
    }
    
    let endPos = cursorPos;
    while (endPos < text.length && text.substring(endPos, endPos + 2) !== '}}') {
      endPos++;
    }
    
    if (startPos >= 0 && endPos < text.length) {
      const before = text.substring(0, startPos);
      const after = text.substring(endPos + 2);
      const updatedText = `${before}{{${newVariableName}}}${after}`;
      
      const currentContent = activeTemplate.content || "";
      const isMultilingual = typeof currentContent === 'object';
      
      if (isMultilingual) {
        updateActiveTemplateContent({ ...currentContent, [templateLanguage]: updatedText }, true);
      } else {
        updateActiveTemplateContent(updatedText, true);
      }
      
      setTimeout(() => {
        textarea.focus();
        const newPos = startPos + newVariableName.length + 4;
        textarea.setSelectionRange(newPos, newPos);
        detectCursorInVariable();
      }, 0);
    }
  }, [cursorInVariable, currentVariableName, parseVariableName, activeTemplate.content, templateLanguage, updateActiveTemplateContent, detectCursorInVariable]);

  // 插入变量到模板
  const insertVariableToTemplate = useCallback((key, dropPoint = null) => {
    const textToInsert = ` {{${key}}} `;
    const currentContent = activeTemplate.content || "";
    const isMultilingual = typeof currentContent === 'object';
    const text = isMultilingual ? (currentContent[templateLanguage] || "") : currentContent;

    if (!isEditing) {
      setIsEditing(true);
      setTimeout(() => {
        const updatedText = text + textToInsert;
        if (isMultilingual) {
          updateActiveTemplateContent({ ...currentContent, [templateLanguage]: updatedText }, true);
        } else {
          updateActiveTemplateContent(updatedText, true);
        }
        if(textareaRef.current) textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }, 50);
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;

    const safeText = String(text);
    const before = safeText.substring(0, start);
    const after = safeText.substring(end, safeText.length);
    const updatedText = `${before}${textToInsert}${after}`;
    
    if (isMultilingual) {
      updateActiveTemplateContent({ ...currentContent, [templateLanguage]: updatedText }, true);
    } else {
      updateActiveTemplateContent(updatedText, true);
    }
    
    setTimeout(() => {
      textarea.focus();
      const newPos = start + textToInsert.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }, [activeTemplate.content, templateLanguage, isEditing, setIsEditing, updateActiveTemplateContent]);

  // 复制处理
  const handleCopy = useCallback(() => {
    // 获取当前模板语言的内容
    let finalString = getLocalized(activeTemplate.content, templateLanguage);
    const counters = {};

    finalString = finalString.replace(/{{(.*?)}}/g, (match, key) => {
      const fullKey = key.trim();
      const parsed = parseVariableName(fullKey);
      const baseKey = parsed.baseKey;
      
      // 使用完整的 fullKey 作为计数器的 key
      const idx = counters[fullKey] || 0;
      counters[fullKey] = idx + 1;

      const uniqueKey = `${fullKey}-${idx}`;
      // Prioritize selection, then default (use baseKey for defaults), and get localized value
      const value = activeTemplate.selections?.[uniqueKey] || activeTemplate.selections?.[baseKey];
      return getLocalized(value, templateLanguage) || match;
    });

    const cleanText = finalString
      .replace(/###\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\n\s*\n/g, '\n\n');

    navigator.clipboard.writeText(cleanText).then(() => {
      // 复制成功，由调用者处理 UI 反馈
    }).catch(() => {});
  }, [activeTemplate, templateLanguage, parseVariableName]);

  return {
    textareaRef,
    cursorInVariable,
    currentVariableName,
    currentGroupId,
    parseVariableName,
    detectCursorInVariable,
    findLinkedVariables,
    updateActiveTemplateSelection,
    handleSetGroup,
    handleRemoveGroup,
    insertVariableToTemplate,
    handleCopy,
  };
};

