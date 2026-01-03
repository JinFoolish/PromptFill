// 文件系统服务：处理 File System Access API 和 IndexedDB 操作

/**
 * 打开 IndexedDB 数据库
 * @returns {Promise<IDBDatabase>}
 */
export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PromptFillDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('handles')) {
        db.createObjectStore('handles');
      }
    };
  });
};

/**
 * 保存目录句柄到 IndexedDB
 * @param {FileSystemDirectoryHandle} handle - 目录句柄
 */
export const saveDirectoryHandle = async (handle) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(['handles'], 'readwrite');
    const store = transaction.objectStore('handles');
    await store.put(handle, 'directory');
  } catch (error) {
    console.error('保存文件夹句柄失败:', error);
  }
};

/**
 * 从 IndexedDB 获取目录句柄
 * @param {IDBDatabase} db - 数据库实例
 * @returns {Promise<FileSystemDirectoryHandle|null>}
 */
export const getDirectoryHandle = async (db) => {
  try {
    const transaction = db.transaction(['handles'], 'readonly');
    const store = transaction.objectStore('handles');
    return new Promise((resolve, reject) => {
      const request = store.get('directory');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('获取文件夹句柄失败:', error);
    return null;
  }
};

/**
 * 删除目录句柄
 */
export const deleteDirectoryHandle = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(['handles'], 'readwrite');
    const store = transaction.objectStore('handles');
    await store.delete('directory');
  } catch (error) {
    console.error('清除文件夹句柄失败:', error);
  }
};

/**
 * 保存数据到文件系统
 * @param {FileSystemDirectoryHandle} handle - 目录句柄
 * @param {Object} data - 要保存的数据对象
 */
export const saveToFileSystem = async (handle, data) => {
  if (!handle) return;
  
  try {
    const fileHandle = await handle.getFileHandle('prompt_fill_data.json', { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
    
    console.log('数据已保存到本地文件夹');
  } catch (error) {
    console.error('保存到文件系统失败:', error);
  }
};

/**
 * 从文件系统加载数据
 * @param {FileSystemDirectoryHandle} handle - 目录句柄
 * @returns {Promise<Object|null>} 加载的数据对象
 */
export const loadFromFileSystem = async (handle) => {
  if (!handle) return null;
  
  try {
    const fileHandle = await handle.getFileHandle('prompt_fill_data.json');
    const file = await fileHandle.getFile();
    const text = await file.text();
    const data = JSON.parse(text);
    
    console.log('从本地文件夹加载数据成功');
    return data;
  } catch (error) {
    console.error('从文件系统读取失败:', error);
    return null;
  }
};

/**
 * 检查文件系统 API 是否支持
 * @returns {boolean}
 */
export const isFileSystemSupported = () => {
  return 'showDirectoryPicker' in window;
};

