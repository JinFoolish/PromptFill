// 更新检查 Hook：检查应用版本和数据版本更新
import { useEffect, useState } from 'react';
import { SYSTEM_DATA_VERSION } from '../data/templates';

/**
 * 更新检查 Hook
 */
export const useUpdateChecker = ({
  APP_VERSION,
  lastAppliedDataVersion,
  setLastAppliedDataVersion,
  setShowDataUpdateNotice,
  setShowAppUpdateNotice,
  setUpdateNoticeType
}) => {
  // 检测数据版本更新 (模板与词库)
  useEffect(() => {
    if (SYSTEM_DATA_VERSION && lastAppliedDataVersion !== SYSTEM_DATA_VERSION) {
      // 检查是否有存储的数据。如果是第一次使用（无数据），直接静默更新版本号
      const hasTemplates = localStorage.getItem("app_templates_v10");
      const hasBanks = localStorage.getItem("app_banks_v9");
      
      if (hasTemplates || hasBanks) {
        setShowDataUpdateNotice(true);
      } else {
        setLastAppliedDataVersion(SYSTEM_DATA_VERSION);
      }
    }
  }, [lastAppliedDataVersion, setLastAppliedDataVersion, setShowDataUpdateNotice]);

  // 检查应用代码版本更新与数据版本更新
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const response = await fetch('/version.json?t=' + Date.now());
        if (response.ok) {
          const data = await response.json();
          
          // 检查应用版本更新
          if (data.appVersion && data.appVersion !== APP_VERSION) {
            setUpdateNoticeType('app');
            setShowAppUpdateNotice(true);
            return; // 优先提示程序更新
          }
          
          // 检查数据定义更新 (存在于代码中，但服务器上更新了)
          if (data.dataVersion && data.dataVersion !== SYSTEM_DATA_VERSION) {
            setUpdateNoticeType('data');
            setShowAppUpdateNotice(true);
          }
        }
      } catch (e) {
        // 静默失败
      }
    };
    
    checkUpdates();
    const timer = setInterval(checkUpdates, 5 * 60 * 1000); // 5分钟检查一次
    
    return () => clearInterval(timer);
  }, [APP_VERSION, setShowAppUpdateNotice, setUpdateNoticeType]);
};

