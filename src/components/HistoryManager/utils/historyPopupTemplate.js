import { formatDate } from './historyFormatters';

/**
 * 构建用于 ImagePopup 的模板对象
 * @param {Object} selectedRecord - 选中的记录
 * @param {Function} t - 翻译函数
 * @returns {Object|null} 模板对象
 */
export const buildPopupTemplate = (selectedRecord, t) => {
  if (!selectedRecord) return null;
  
  // Tags: 服务提供商、模型名称、图像分辨率
  const tags = [];
  // 服务提供商
  if (selectedRecord.provider) {
    tags.push(selectedRecord.provider);
  }
  // 模型名称
  if (selectedRecord.model) {
    tags.push(selectedRecord.model);
  }
  // 图像分辨率（最后一个）
  if (selectedRecord.width && selectedRecord.height) {
    tags.push(`${selectedRecord.width}×${selectedRecord.height}`);
  }

  return {
    name: selectedRecord.templateName || t('generated_image') || '生成的图片', // 模板名称
    author: formatDate(selectedRecord.savedAt || selectedRecord.createdAt), // 生成日期
    content: selectedRecord.prompt || t('no_prompt'),
    tags: tags
  };
};

