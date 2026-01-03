// 历史记录管理 Hook：处理 Undo/Redo 功能
import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * 历史记录管理 Hook
 */
export const useHistory = ({
  activeTemplate,
  activeTemplateId,
  setTemplates
}) => {
  // History State for Undo/Redo
  const [historyPast, setHistoryPast] = useState([]);
  const [historyFuture, setHistoryFuture] = useState([]);
  const historyLastSaveTime = useRef(0);

  // Reset history when template changes
  useEffect(() => {
    setHistoryPast([]);
    setHistoryFuture([]);
    historyLastSaveTime.current = 0;
  }, [activeTemplateId]);

  // 更新模板内容并管理历史记录
  const updateActiveTemplateContent = useCallback((newContent, forceSaveHistory = false) => {
    // History Management
    const now = Date.now();
    const shouldSave = forceSaveHistory || (now - historyLastSaveTime.current > 1000);

    if (shouldSave) {
      setHistoryPast(prev => [...prev, activeTemplate.content]);
      setHistoryFuture([]); // Clear redo stack on new change
      historyLastSaveTime.current = now;
    }

    setTemplates(prev => prev.map(t => 
      t.id === activeTemplateId ? { ...t, content: newContent } : t
    ));
  }, [activeTemplate.content, activeTemplateId, setTemplates]);

  // Undo 操作
  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;
    
    const previous = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, -1);
    
    setHistoryFuture(prev => [activeTemplate.content, ...prev]);
    setHistoryPast(newPast);
    
    // Direct update without saving history again
    setTemplates(prev => prev.map(t => 
      t.id === activeTemplateId ? { ...t, content: previous } : t
    ));
  }, [activeTemplate.content, activeTemplateId, historyPast, setTemplates]);

  // Redo 操作
  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;

    const next = historyFuture[0];
    const newFuture = historyFuture.slice(1);

    setHistoryPast(prev => [...prev, activeTemplate.content]);
    setHistoryFuture(newFuture);

    // Direct update without saving history again
    setTemplates(prev => prev.map(t => 
      t.id === activeTemplateId ? { ...t, content: next } : t
    ));
  }, [activeTemplate.content, activeTemplateId, historyFuture, setTemplates]);

  return {
    historyPast,
    historyFuture,
    updateActiveTemplateContent,
    handleUndo,
    handleRedo,
    canUndo: historyPast.length > 0,
    canRedo: historyFuture.length > 0,
  };
};

