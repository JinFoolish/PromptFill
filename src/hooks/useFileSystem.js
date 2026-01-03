// 文件系统 Hook：处理 File System Access API 和自动保存
import { useEffect, useCallback } from 'react';
import {
  openDB,
  saveDirectoryHandle,
  getDirectoryHandle,
  deleteDirectoryHandle,
  saveToFileSystem,
  loadFromFileSystem,
  isFileSystemSupported
} from '../services/fileSystemService';

/**
 * 文件系统管理 Hook
 */
export const useFileSystem = ({
  storageMode,
  setStorageMode,
  directoryHandle,
  setDirectoryHandle,
  setIsFileSystemSupported,
  templates,
  banks,
  categories,
  defaults,
  t
}) => {
  // 检查文件系统 API 支持并恢复目录句柄
  useEffect(() => {
    const checkSupport = async () => {
      const supported = isFileSystemSupported();
      setIsFileSystemSupported(supported);
      
      // Try to restore directory handle from IndexedDB
      if (supported && storageMode === 'folder') {
        try {
          const db = await openDB();
          const handle = await getDirectoryHandle(db);
          if (handle) {
            // Verify permission
            const permission = await handle.queryPermission({ mode: 'readwrite' });
            if (permission === 'granted') {
              setDirectoryHandle(handle);
              // Load data from file system
              const data = await loadFromFileSystem(handle);
              if (data) {
                // 注意：这里不直接设置状态，而是返回数据让调用者处理
                // 因为数据加载应该在 App 层面处理
                console.log('从文件系统加载数据:', data);
              }
            } else {
              // Permission not granted, switch back to browser storage
              setStorageMode('browser');
              localStorage.setItem('app_storage_mode', 'browser');
            }
          }
        } catch (error) {
          console.error('恢复文件夹句柄失败:', error);
        }
      }
    };
    
    checkSupport();
  }, [storageMode, setStorageMode, setDirectoryHandle, setIsFileSystemSupported]);

  // 选择目录
  const handleSelectDirectory = useCallback(async () => {
    try {
      if (!isFileSystemSupported()) {
        alert(t('browser_not_supported'));
        return;
      }

      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });
      
      setDirectoryHandle(handle);
      setStorageMode('folder');
      localStorage.setItem('app_storage_mode', 'folder');
      
      // Save handle to IndexedDB for future use
      await saveDirectoryHandle(handle);
      
      // 尝试保存当前数据到文件夹
      const data = {
        templates,
        banks,
        categories,
        defaults,
        version: 'v9',
        lastSaved: new Date().toISOString()
      };
      await saveToFileSystem(handle, data);
      alert(t('auto_save_enabled'));
    } catch (error) {
      console.error('选择文件夹失败:', error);
      if (error.name !== 'AbortError') {
        alert(t('folder_access_denied'));
      }
    }
  }, [templates, banks, categories, defaults, setDirectoryHandle, setStorageMode, t]);

  // 切换到本地存储
  const handleSwitchToLocalStorage = useCallback(async () => {
    setStorageMode('browser');
    setDirectoryHandle(null);
    localStorage.setItem('app_storage_mode', 'browser');
    
    // Clear directory handle from IndexedDB
    await deleteDirectoryHandle();
  }, [setStorageMode, setDirectoryHandle]);

  // 手动从文件夹加载
  const handleManualLoadFromFolder = useCallback(async () => {
    if (directoryHandle) {
      try {
        const data = await loadFromFileSystem(directoryHandle);
        if (data) {
          alert('从文件夹加载成功！');
          return data;
        } else {
          alert('从文件夹加载失败，请检查文件是否存在');
        }
      } catch (error) {
        alert('从文件夹加载失败，请检查文件是否存在');
      }
    }
    return null;
  }, [directoryHandle]);

  // Auto-save to file system when data changes
  useEffect(() => {
    if (storageMode === 'folder' && directoryHandle) {
      const timeoutId = setTimeout(() => {
        const data = {
          templates,
          banks,
          categories,
          defaults,
          version: 'v9',
          lastSaved: new Date().toISOString()
        };
        saveToFileSystem(directoryHandle, data);
      }, 1000); // Debounce 1 second
      
      return () => clearTimeout(timeoutId);
    }
  }, [templates, banks, categories, defaults, storageMode, directoryHandle]);

  return {
    handleSelectDirectory,
    handleSwitchToLocalStorage,
    handleManualLoadFromFolder,
  };
};

