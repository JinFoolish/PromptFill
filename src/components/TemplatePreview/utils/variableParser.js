/**
 * 变量解析工具函数
 */

/**
 * 从变量名中提取 baseKey 和 groupId
 * @param {string} varName - 变量名，如 "fruit_1" 或 "fruit"
 * @returns {{baseKey: string, groupId: string|null}} - 解析后的结果
 */
export const parseVariableName = (varName) => {
  const match = varName.match(/^(.+?)(?:_(\d+))?$/);
  if (match) {
    return {
      baseKey: match[1],
      groupId: match[2] || null
    };
  }
  return { baseKey: varName, groupId: null };
};

