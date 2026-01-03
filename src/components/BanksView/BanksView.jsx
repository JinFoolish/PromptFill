import React, { useState } from 'react';
import { Settings, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { CategorySection } from './CategorySection';
import { CategoryManager } from './CategoryManager';
import { AddBankModal } from './AddBankModal';

/**
 * BanksView - Dedicated page for Bank Configuration
 * 词库管理视图 - 词库配置专用页面
 */
export const BanksView = ({ 
  categories, banks, setCategories, setBanks,
  handleDeleteOption, handleAddOption, handleDeleteBank, 
  handleUpdateBankCategory,
  t, language, isDarkMode
}) => {
  // Modal States
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState("");

  // Add Bank Form State
  const [newBankLabel, setNewBankLabel] = useState("");
  const [newBankKey, setNewBankKey] = useState("");
  const [newBankCategory, setNewBankCategory] = useState("other");

  // Handlers
  const handleStartAddBank = (defaultCatId = 'other') => {
      setNewBankCategory(defaultCatId);
      setNewBankLabel("");
      setNewBankKey("");
      setShowAddBankModal(true);
  };

  const handleConfirmAddBank = () => {
    if (!newBankLabel.trim() || !newBankKey.trim()) return;
    if (banks[newBankKey]) {
        alert(t('bank_id_exists') || "Bank ID already exists");
        return;
    }
    
    setBanks(prev => ({
        ...prev,
        [newBankKey]: {
            label: newBankLabel,
            options: [],
            category: newBankCategory
        }
    }));
    setShowAddBankModal(false);
  };

  return (
    <Card variant="container" className="flex-1 flex flex-col h-full overflow-hidden relative">
      
      {/* 1. Header Area */}
      <div className="px-8 pt-10 pb-6 flex-shrink-0 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">
                {t('bank_config') || 'Bank Library'}
              </h1>
              <p className="text-[11px] font-bold mt-2 text-gray-400 dark:text-gray-500">
                Manage your reusable prompt variables
              </p>
            </div>
            
            <Button 
                onClick={() => setShowCategoryManager(true)}
                variant="default"
                className="font-bold"
            >
                <Settings className="h-4 w-4" />
                {t('manage_categories')}
            </Button>
        </div>

        {/* Search Bar */}
        <div className="relative group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none z-10 dark:text-gray-600 text-gray-400 group-focus-within:text-orange-500" size={16} />
            <Input 
              type="text" 
              placeholder={t('search_templates') || "Search banks..."} 
              value={bankSearchQuery} 
              onChange={(e) => setBankSearchQuery(e.target.value)} 
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-[14px] font-medium shadow-sm" 
            />
        </div>
      </div>

      {/* 2. Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-20">
        <div className="max-w-5xl mx-auto">
           {/* Masonry-like Grid (Simple 2 Columns) */}
           <div className="columns-1 md:columns-2 gap-6 space-y-6">
                {Object.keys(categories).map(catId => (
                    <CategorySection 
                        key={catId}
                        catId={catId}
                        categories={categories}
                        banks={banks}
                        onDeleteOption={handleDeleteOption}
                        onAddOption={handleAddOption}
                        onDeleteBank={handleDeleteBank}
                        onUpdateBankCategory={handleUpdateBankCategory}
                        onStartAddBank={handleStartAddBank}
                        t={t}
                        language={language}
                        isDarkMode={isDarkMode}
                        bankSearchQuery={bankSearchQuery}
                    />
                ))}
           </div>
        </div>
      </div>

      {/* --- Modals --- */}
      
      <CategoryManager 
          isOpen={showCategoryManager}
          onClose={() => setShowCategoryManager(false)}
          categories={categories}
          setCategories={setCategories}
          banks={banks}
          setBanks={setBanks}
          t={t}
          language={language}
          isDarkMode={isDarkMode}
      />

      <AddBankModal 
          isOpen={showAddBankModal}
          onClose={() => setShowAddBankModal(false)}
          t={t}
          categories={categories}
          newBankLabel={newBankLabel}
          setNewBankLabel={setNewBankLabel}
          newBankKey={newBankKey}
          setNewBankKey={setNewBankKey}
          newBankCategory={newBankCategory}
          setNewBankCategory={setNewBankCategory}
          onConfirm={handleConfirmAddBank}
          language={language}
          isDarkMode={isDarkMode}
      />

    </Card>
  );
};

// 同时导出为默认导出，以保持向后兼容性
export default BanksView;

