// 模板服务：处理模板的导入导出功能
import { getLocalized } from '../utils/helpers';

/**
 * 导出单个模板
 * @param {Object} template - 要导出的模板对象
 * @param {string} language - 当前语言
 * @param {Function} showToast - Toast 提示函数
 */
export const exportTemplate = async (template, language, showToast = alert) => {
  try {
    const templateName = getLocalized(template.name, language);
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const filename = `${templateName.replace(/\s+/g, '_')}_template.json`;
    
    // 桌面端或降级方案：使用传统下载方式
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // iOS Safari 特殊处理
    if (isIOS) {
      link.target = '_blank';
    }
    
    document.body.appendChild(link);
    link.click();
    
    // 延迟清理，确保iOS有足够时间处理
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    showToast('✅ 模板已导出');
  } catch (error) {
    console.error('导出失败:', error);
    alert('导出失败，请重试');
  }
};

/**
 * 导出所有模板（完整备份）
 * @param {Array} templates - 模板数组
 * @param {Object} banks - 词库对象
 * @param {Object} categories - 分类对象
 * @param {Function} showToast - Toast 提示函数
 */
export const exportAllTemplates = async (templates, banks, categories, showToast = alert) => {
  try {
    const exportData = {
      templates,
      banks,
      categories,
      version: 'v9',
      exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const filename = `prompt_fill_backup_${Date.now()}.json`;
    
    // 移动端适配已禁用，通过配置接口可重新启用
    const isMobileDevice = false; // 使用配置接口
    const isIOS = false; // 使用配置接口
    
    // 桌面端或降级方案：使用传统下载方式
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // iOS Safari 特殊处理
    if (isIOS) {
      link.target = '_blank';
    }
    
    document.body.appendChild(link);
    link.click();
    
    // 延迟清理，确保iOS有足够时间处理
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    showToast('✅ 备份已导出');
  } catch (error) {
    console.error('导出失败:', error);
    alert('导出失败，请重试');
  }
};

/**
 * 导入模板
 * @param {File} file - 要导入的文件
 * @param {Function} setTemplates - 设置模板的函数
 * @param {Function} setBanks - 设置词库的函数
 * @param {Function} setCategories - 设置分类的函数
 * @param {Function} setActiveTemplateId - 设置活动模板ID的函数
 */
export const importTemplate = (file, setTemplates, setBanks, setCategories, setActiveTemplateId) => {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      // 检查是单个模板还是完整备份
      if (data.templates && Array.isArray(data.templates)) {
        // 完整备份
        if (window.confirm('检测到完整备份文件。是否要覆盖当前所有数据？')) {
          setTemplates(data.templates);
          if (data.banks) setBanks(data.banks);
          if (data.categories) setCategories(data.categories);
          alert('导入成功！');
        }
      } else if (data.id && data.name) {
        // 单个模板
        const newId = `tpl_${Date.now()}`;
        const newTemplate = { ...data, id: newId };
        setTemplates(prev => [...prev, newTemplate]);
        setActiveTemplateId(newId);
        alert('模板导入成功！');
      } else {
        alert('文件格式不正确');
      }
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败，请检查文件格式');
    }
  };
  reader.readAsText(file);
};

