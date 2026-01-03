// 词库管理 Hook：处理词库的 CRUD 操作、选项管理、分类管理、变量选择
import { useCallback } from 'react';
import { getLocalized } from '../utils/helpers';

/**
 * 词库管理 Hook
 */
export const useBankManagement = ({
  banks,
  setBanks,
  language,
  t,
  parseVariableName,
  findLinkedVariables,
  updateActiveTemplateSelection,
  activeTemplate,
  activeTemplateId,
  templates,
  setActivePopover
}) => {
  // 添加选项
  const handleAddOption = useCallback((key, newOption) => {
    if (!newOption.trim()) return;
    setBanks(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        options: [...prev[key].options, newOption]
      }
    }));
  }, [setBanks]);

  // 删除选项
  const handleDeleteOption = useCallback((key, optionToDelete) => {
    setBanks(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        options: prev[key].options.filter(opt => opt !== optionToDelete)
      }
    }));
  }, [setBanks]);

  // 删除词库
  const handleDeleteBank = useCallback((key) => {
    const bankLabel = getLocalized(banks[key].label, language);
    if (window.confirm(t('confirm_delete_bank', { name: bankLabel }))) {
      const newBanks = { ...banks };
      delete newBanks[key];
      setBanks(newBanks);
    }
  }, [banks, setBanks, language, t]);

  // 更新词库分类
  const handleUpdateBankCategory = useCallback((key, newCategory) => {
    setBanks(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        category: newCategory
      }
    }));
  }, [setBanks]);

  // 选择变量值
  const handleSelect = useCallback((key, index, value) => {
    const uniqueKey = `${key}-${index}`;
    
    // 解析变量名，检查是否有联动组
    const parsed = parseVariableName(key);
    
    // 如果有关联组，找到所有需要联动的变量
    let linkedKeys = [];
    if (parsed.groupId) {
      const activeTemplate = templates.find(t => t.id === activeTemplateId);
      if (activeTemplate) {
        linkedKeys = findLinkedVariables(activeTemplate, parsed.baseKey, parsed.groupId);
      }
    }
    
    updateActiveTemplateSelection(uniqueKey, value, linkedKeys);
    setActivePopover(null);
  }, [parseVariableName, findLinkedVariables, updateActiveTemplateSelection, templates, activeTemplateId, setActivePopover]);

  // 添加自定义选项并选择
  const handleAddCustomAndSelect = useCallback((key, index, newValue, handleAddOption, handleSelect) => {
    if (!newValue || !newValue.trim()) return;
    
    // 解析变量名，获取 baseKey（词库的 key）
    const parsed = parseVariableName(key);
    const baseKey = parsed.baseKey;
    
    // 1. Add to bank if not exists (使用 baseKey)
    if (banks[baseKey] && !banks[baseKey].options.includes(newValue)) {
      handleAddOption(baseKey, newValue);
    }
    
    // 2. Select it (使用完整的 key，可能包含 groupId)
    handleSelect(key, index, newValue);
  }, [banks, parseVariableName]);

  return {
    handleAddOption,
    handleDeleteOption,
    handleDeleteBank,
    handleUpdateBankCategory,
    handleSelect,
    handleAddCustomAndSelect,
  };
};

