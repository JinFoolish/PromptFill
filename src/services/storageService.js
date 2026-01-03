// 存储服务：处理存储空间管理和清理

/**
 * 计算 localStorage 使用空间
 * @returns {string} 存储空间大小（KB）
 */
export const getStorageSize = () => {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return (total / 1024).toFixed(2); // KB
  } catch (error) {
    return '0';
  }
};

/**
 * 清除所有应用数据
 * @param {Function} t - 翻译函数
 * @returns {boolean} 是否成功清除
 */
export const clearAllData = (t) => {
  if (window.confirm(t('confirm_clear_all'))) {
    try {
      // 只清除应用相关的数据
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('app_')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // 刷新页面
      window.location.reload();
      return true;
    } catch (error) {
      console.error('清除数据失败:', error);
      alert('清除数据失败');
      return false;
    }
  }
  return false;
};

/**
 * 重置系统数据
 */
export const resetSystemData = () => {
  if (window.confirm('确定要重置系统数据吗？这将清除所有本地修改并重新从系统加载初始模板。')) {
    localStorage.removeItem('app_templates');
    localStorage.removeItem('app_banks');
    localStorage.removeItem('app_categories');
    window.location.reload();
  }
};

