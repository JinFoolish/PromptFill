import storageAdapter from '../../../utils/storage';

/**
 * 历史记录操作工具函数
 */

/**
 * 下载图片
 * @param {Object} record - 记录对象
 * @param {Function} t - 翻译函数
 * @returns {Promise<void>}
 */
export const downloadImage = async (record, t) => {
  try {
    const { blob } = await storageAdapter.getImage(record.id);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai_image_${record.id}.${blob.type.split('/')[1] || 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert(t('download_success') || '图片已保存');
  } catch (err) {
    console.error('Failed to download image:', err);
    throw new Error(`下载失败: ${err.message}`);
  }
};

/**
 * 复制图片到剪贴板
 * @param {Object} record - 记录对象
 * @param {Function} t - 翻译函数
 * @returns {Promise<void>}
 */
export const copyImage = async (record, t) => {
  try {
    const { blob } = await storageAdapter.getImage(record.id);
    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      console.log('Image copied to clipboard');
      alert(t('copy_success') || '图片已复制到剪贴板');
    } else {
      throw new Error('Clipboard API not supported');
    }
  } catch (err) {
    console.error('Failed to copy image:', err);
    throw new Error(`复制失败: ${err.message}`);
  }
};

