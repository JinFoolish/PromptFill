/**
 * AI 图像生成器配置辅助函数
 */

/**
 * 计算尺寸比例
 * @param {string} size - 尺寸字符串，格式如 "1536*1536"
 * @returns {string} 比例字符串，如 "1:1"
 */
export const getSizeRatio = (size) => {
  if (!size || !size.includes('*')) return '';
  
  const [width, height] = size.split('*').map(Number);
  if (!width || !height) return '';
  
  // 计算最大公约数
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  
  const ratioW = width / divisor;
  const ratioH = height / divisor;
  
  return `${ratioW}:${ratioH}`;
};

/**
 * 格式化尺寸显示
 * @param {string} size - 尺寸字符串
 * @returns {string} 格式化后的尺寸字符串，包含比例
 */
export const formatSizeDisplay = (size) => {
  const ratio = getSizeRatio(size);
  return ratio ? `${size} (${ratio})` : size;
};

/**
 * 获取当前提供商的可用模型
 * @param {Object} providerInfo - 提供商信息映射
 * @param {string} providerId - 当前提供商 ID
 * @returns {Array} 模型列表
 */
export const getCurrentProviderModels = (providerInfo, providerId) => {
  const provider = providerInfo[providerId];
  return provider?.models || [];
};

/**
 * 获取当前模型的可用尺寸
 * @param {Object} providerInfo - 提供商信息映射
 * @param {string} providerId - 当前提供商 ID
 * @param {string} modelId - 当前模型 ID
 * @returns {Array} 尺寸列表
 */
export const getCurrentModelSizes = (providerInfo, providerId, modelId) => {
  const provider = providerInfo[providerId];
  if (provider?.sizeOptions) {
    return provider.sizeOptions[modelId] || provider.sizeOptions['default'] || [];
  }
  return ['1536*1536', '1024*1024', '512*512'];
};

