import React from 'react';
import { BanksView } from '../../components/BanksView/BanksView';
import { useApp } from '../../contexts/AppContext';

/**
 * 词库管理页面
 */
export const BanksPage = () => {
  const app = useApp();
  
  const {
    categories,
    banks,
    setCategories,
    setBanks,
    bankManagement,
    editor,
    t,
    language,
    isDarkMode,
  } = app;

  return (
    <BanksView
      categories={categories}
      banks={banks}
      setCategories={setCategories}
      setBanks={setBanks}
      handleDeleteOption={bankManagement.handleDeleteOption}
      handleAddOption={bankManagement.handleAddOption}
      handleDeleteBank={bankManagement.handleDeleteBank}
      handleUpdateBankCategory={bankManagement.handleUpdateBankCategory}
      t={t}
      language={language}
      isDarkMode={isDarkMode}
    />
  );
};

