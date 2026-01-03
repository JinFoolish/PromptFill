/**
 * AI 图像生成器 API 调用函数
 */

/**
 * 加载配置
 * @returns {Promise<Object|null>} 配置对象或 null
 */
export const loadConfiguration = async () => {
  try {
    const response = await fetch('/api/v1/config');
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error('Failed to load configuration:', error);
    return null;
  }
};

/**
 * 加载提供商列表
 * @returns {Promise<Array>} 提供商列表
 */
export const loadProviders = async () => {
  try {
    const response = await fetch('/api/v1/providers');
    if (response.ok) {
      const data = await response.json();
      return data.providers || [];
    }
    return [];
  } catch (error) {
    console.error('Failed to load providers:', error);
    return [];
  }
};

/**
 * 生成图像
 * @param {Object} params - 生成参数
 * @param {string} params.prompt - 提示词
 * @param {string} params.provider - 服务提供商
 * @param {string} params.model - 模型名称
 * @param {string} params.size - 图像尺寸
 * @param {Object} params.parameters - 额外参数
 * @returns {Promise<Object>} 生成结果
 */
export const generateImage = async ({ prompt, provider, model, size, parameters }) => {
  try {
    const response = await fetch('/api/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
        provider,
        model,
        size,
        parameters
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Generation failed:', error);
    throw error;
  }
};

