// 模板管理 Hook：处理模板的 CRUD 操作、标签管理、导入导出
import { useCallback } from 'react';
import { getLocalized } from '../utils/helpers';
import { TRANSLATIONS } from '../constants/translations';
import { INITIAL_TEMPLATES_CONFIG } from '../data/templates';
import { mergeTemplatesWithSystem } from '../utils/merge';
import { exportTemplate, exportAllTemplates, importTemplate } from '../services/templateService';

/**
 * 模板管理 Hook
 */
export const useTemplateManagement = ({
  templates,
  setTemplates,
  activeTemplateId,
  setActiveTemplateId,
  banks,
  defaults,
  setBanks,
  setDefaults,
  language,
  editingTemplateNameId,
  setEditingTemplateNameId,
  tempTemplateName,
  setTempTemplateName,
  tempTemplateAuthor,
  setTempTemplateAuthor,
  isMobileDevice,
  setMobileTab,
  setIsEditing,
  lastAppliedDataVersion,
  setLastAppliedDataVersion,
  SYSTEM_DATA_VERSION,
  t,
  showToast = alert
}) => {
  // 添加模板
  const handleAddTemplate = useCallback(() => {
    const newId = `tpl_${Date.now()}`;
    const newTemplate = {
      id: newId,
      name: t('new_template_name'),
      author: "",
      content: t('new_template_content'),
      selections: {},
      tags: []
    };
    setTemplates([...templates, newTemplate]);
    setActiveTemplateId(newId);
    setIsEditing(true);
    // 在移动端自动切换到编辑Tab
    if (isMobileDevice) {
      setMobileTab('editor');
    }
  }, [templates, setTemplates, setActiveTemplateId, setIsEditing, isMobileDevice, setMobileTab, t]);

  // 复制模板
  const handleDuplicateTemplate = useCallback((t_item, e) => {
    e.stopPropagation();
    const newId = `tpl_${Date.now()}`;
    
    const duplicateName = (name) => {
      if (typeof name === 'string') return `${name}${t('copy_suffix')}`;
      const newName = { ...name };
      Object.keys(newName).forEach(lang => {
        const suffix = TRANSLATIONS[lang]?.copy_suffix || ' (Copy)';
        newName[lang] = `${newName[lang]}${suffix}`;
      });
      return newName;
    };

    const newTemplate = {
      ...t_item,
      id: newId,
      name: duplicateName(t_item.name),
      author: t_item.author || "",
      selections: { ...t_item.selections }
    };
    setTemplates([...templates, newTemplate]);
    setActiveTemplateId(newId);
    // 在移动端自动切换到编辑Tab
    if (isMobileDevice) {
      setMobileTab('editor');
    }
  }, [templates, setTemplates, setActiveTemplateId, isMobileDevice, setMobileTab, t]);

  // 删除模板
  const handleDeleteTemplate = useCallback((id, e) => {
    e.stopPropagation();
    if (templates.length <= 1) {
      alert(t('alert_keep_one'));
      return;
    }
    if (window.confirm(t('confirm_delete_template'))) {
      const newTemplates = templates.filter(t => t.id !== id);
      setTemplates(newTemplates);
      if (activeTemplateId === id) {
        setActiveTemplateId(newTemplates[0].id);
      }
    }
  }, [templates, setTemplates, activeTemplateId, setActiveTemplateId, t]);

  // 重置模板
  const handleResetTemplate = useCallback((id, e) => {
    e.stopPropagation();
    if (!window.confirm(t('confirm_reset_template'))) return;

    const original = INITIAL_TEMPLATES_CONFIG.find(t => t.id === id);
    if (!original) return;

    setTemplates(prev => prev.map(t => 
      t.id === id ? JSON.parse(JSON.stringify(original)) : t
    ));
  }, [setTemplates, t]);

  // 开始重命名模板
  const startRenamingTemplate = useCallback((t_item, e) => {
    e.stopPropagation();
    setEditingTemplateNameId(t_item.id);
    setTempTemplateName(getLocalized(t_item.name, language));
    setTempTemplateAuthor(t_item.author || "");
  }, [setEditingTemplateNameId, setTempTemplateName, setTempTemplateAuthor, language]);

  // 保存模板名称
  const saveTemplateName = useCallback(() => {
    if (tempTemplateName.trim()) {
      setTemplates(prev => prev.map(t_item => {
        if (t_item.id === editingTemplateNameId) {
          const newName = typeof t_item.name === 'object' 
            ? { ...t_item.name, [language]: tempTemplateName }
            : tempTemplateName;
          return { ...t_item, name: newName, author: tempTemplateAuthor };
        }
        return t_item;
      }));
    }
    setEditingTemplateNameId(null);
  }, [tempTemplateName, tempTemplateAuthor, editingTemplateNameId, language, setTemplates, setEditingTemplateNameId]);

  // 刷新系统模板与词库，保留用户数据
  const handleRefreshSystemData = useCallback(() => {
    const backupSuffix = t('refreshed_backup_suffix') || '';
    
    // 迁移旧格式的 selections：将字符串值转换为对象格式
    const migratedTemplates = templates.map(tpl => {
      const newSelections = {};
      Object.entries(tpl.selections || {}).forEach(([key, value]) => {
        if (typeof value === 'string' && banks[key.split('-')[0]]) {
          // 查找对应的词库选项
          const bankKey = key.split('-')[0];
          const bank = banks[bankKey];
          if (bank && bank.options) {
            const matchedOption = bank.options.find(opt => 
              (typeof opt === 'string' && opt === value) ||
              (typeof opt === 'object' && (opt.cn === value || opt.en === value))
            );
            newSelections[key] = matchedOption || value;
          } else {
            newSelections[key] = value;
          }
        } else {
          newSelections[key] = value;
        }
      });
      return { ...tpl, selections: newSelections };
    });
    
    const templateResult = mergeTemplatesWithSystem(migratedTemplates, { backupSuffix });
    const { mergeBanksWithSystem } = require('../utils/merge');
    const bankResult = mergeBanksWithSystem(banks, defaults, { backupSuffix });

    setTemplates(templateResult.templates);
    setBanks(bankResult.banks);
    setDefaults(bankResult.defaults);
    setActiveTemplateId(prev => templateResult.templates.some(t => t.id === prev) ? prev : "tpl_default");
    
    // 更新版本号，避免再次提示更新
    setLastAppliedDataVersion(SYSTEM_DATA_VERSION);

    const notes = [...templateResult.notes, ...bankResult.notes];
    if (notes.length > 0) {
      alert(`${t('refresh_done_with_conflicts')}\n- ${notes.join('\n- ')}`);
    } else {
      alert(t('refresh_done_no_conflict'));
    }
  }, [banks, defaults, templates, setTemplates, setBanks, setDefaults, setActiveTemplateId, setLastAppliedDataVersion, SYSTEM_DATA_VERSION, t]);

  const handleAutoUpdate = useCallback(() => {
    handleRefreshSystemData();
    setLastAppliedDataVersion(SYSTEM_DATA_VERSION);
  }, [handleRefreshSystemData, setLastAppliedDataVersion, SYSTEM_DATA_VERSION]);

  // 更新模板标签
  const handleUpdateTemplateTags = useCallback((templateId, newTags) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, tags: newTags } : t
    ));
  }, [setTemplates]);

  // 导出模板
  const handleExportTemplate = useCallback(async (template) => {
    await exportTemplate(template, language, showToast);
  }, [language, showToast]);

  // 导出所有模板
  const handleExportAllTemplates = useCallback(async (categories) => {
    await exportAllTemplates(templates, banks, categories, showToast);
  }, [templates, banks, showToast]);

  // 导入模板
  const handleImportTemplate = useCallback((event, setCategories) => {
    const file = event.target.files?.[0];
    if (!file) return;
    importTemplate(file, setTemplates, setBanks, setCategories, setActiveTemplateId);
    // 重置input
    event.target.value = '';
  }, [setTemplates, setBanks, setActiveTemplateId]);

  return {
    handleAddTemplate,
    handleDuplicateTemplate,
    handleDeleteTemplate,
    handleResetTemplate,
    startRenamingTemplate,
    saveTemplateName,
    handleRefreshSystemData,
    handleAutoUpdate,
    handleUpdateTemplateTags,
    handleExportTemplate,
    handleExportAllTemplates,
    handleImportTemplate,
  };
};

