/**
 * 历史记录筛选和排序工具函数
 */

/**
 * 筛选和排序历史记录
 * @param {Array} records - 记录数组
 * @param {string} searchQuery - 搜索关键词
 * @param {string} filterProvider - 提供商筛选
 * @param {string} sortBy - 排序方式
 * @returns {Array} 筛选和排序后的记录
 */
export const filterAndSortRecords = (records, searchQuery, filterProvider, sortBy) => {
  if (!records || records.length === 0) return [];
  
  let filtered = [...records]; // 创建副本以避免直接修改原数组
  
  // 搜索筛选
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(record => {
      const promptMatch = record.prompt?.toLowerCase().includes(query) || false;
      const providerMatch = record.provider?.toLowerCase().includes(query) || false;
      const modelMatch = record.model?.toLowerCase().includes(query) || false;
      const templateNameMatch = record.templateName?.toLowerCase().includes(query) || false;
      return promptMatch || providerMatch || modelMatch || templateNameMatch;
    });
  }
  
  // 提供商筛选
  if (filterProvider !== 'all') {
    filtered = filtered.filter(record => record.provider === filterProvider);
  }
  
  // 排序
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'oldest': 
        return (a.savedAt || a.createdAt || 0) - (b.savedAt || b.createdAt || 0);
      case 'provider': 
        return (a.provider || '').localeCompare(b.provider || '');
      case 'newest': 
      default: 
        return (b.savedAt || b.createdAt || 0) - (a.savedAt || a.createdAt || 0);
    }
  });
  
  return filtered;
};

/**
 * 获取可用的提供商列表
 * @param {Array} records - 记录数组
 * @returns {Array} 提供商列表
 */
export const getAvailableProviders = (records) => {
  const providers = [...new Set(records.map(r => r.provider).filter(Boolean))];
  return providers.sort();
};

