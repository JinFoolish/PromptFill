import React from 'react';
import { HistoryManager } from '../../components/HistoryManager/HistoryManager';
import { Card } from '../../components/ui/card';
import { useApp } from '../../contexts/AppContext';

/**
 * 历史记录页面
 */
export const HistoryPage = () => {
  const app = useApp();
  const { isDarkMode, t } = app;

  return (
    <Card 
      variant="container"
      className="flex-1 flex flex-col overflow-hidden bg-white/30 dark:bg-black/20 backdrop-blur-sm"
    >
      <HistoryManager 
        isDarkMode={isDarkMode}
        t={t}
        className="flex-1"
      />
    </Card>
  );
};

