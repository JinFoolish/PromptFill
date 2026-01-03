import React, { useState, useMemo, useEffect } from 'react';
import { 
  Settings, List, Check, ChevronRight, ChevronDown, 
  Plus, Trash2, X, ChevronUp, Pencil, Search, Database 
} from 'lucide-react';
import { CATEGORY_STYLES, PREMIUM_STYLES } from '../constants/styles';
import { getLocalized } from '../utils/helpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

// --- Internal Sub-components ---

/**
 * Component: Bank Group (Collapsible Card)
 */
const BankGroup = ({ 
    bankKey, bank, onDeleteOption, onAddOption, 
    onDeleteBank, onUpdateBankCategory, categories, t, language, 
    isDarkMode, bankSearchQuery 
}) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isEditingCategory, setIsEditingCategory] = useState(false);

    // Auto-expand if search query matches
    React.useEffect(() => {
        if (bankSearchQuery) {
            setIsCollapsed(false);
        }
    }, [bankSearchQuery]);

    const categoryId = bank.category || 'other';
    const colorKey = categories[categoryId]?.color || 'slate';
    const premium = PREMIUM_STYLES[colorKey] || PREMIUM_STYLES.slate;

    const filteredOptions = bank.options.filter(opt => {
        if (!bankSearchQuery) return true;
        const query = bankSearchQuery.toLowerCase();
        const bankLabel = getLocalized(bank.label, language).toLowerCase();
        if (bankLabel.includes(query) || bankKey.toLowerCase().includes(query)) return true;
        return getLocalized(opt, language).toLowerCase().includes(query);
    });

    return (
        <div 
            className="relative group/card mb-3 ml-3 transition-all duration-300 hover:-translate-y-0.5"
        >
            {/* Colored Tag */}
            <div 
                className={`absolute top-[13px] transition-all duration-300 rounded-l-[4px] z-10 ${
                    !isCollapsed ? 'w-[12px] -left-[12px]' : 'w-[6px] -left-[6px] group-hover/card:w-[12px] group-hover/card:-left-[12px]'
                }`}
                style={{ backgroundColor: premium.from, height: '16px' }}
            />

            <div 
                className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                style={{
                    background: `var(--bank-card-bg) padding-box, var(--bank-card-border) border-box`,
                    border: '1px solid transparent',
                }}
            >
                {/* Header Row */}
                <div 
                    className="flex justify-between items-center py-3 px-4 cursor-pointer"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                        <div className="flex-shrink-0 transition-transform duration-300 text-gray-400 dark:text-gray-500">
                            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[14px] font-bold truncate text-gray-700 dark:text-gray-200 group-hover/card:text-gray-900 dark:group-hover/card:text-white">
                                {getLocalized(bank.label, language)}
                            </span>
                            <code className="text-[10px] font-black tracking-wider mt-0.5 opacity-60" style={{ color: premium.to }}>{`{{${bankKey}}}`}</code>
                        </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-1 items-center">
                        {!isCollapsed && (
                            <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsEditingCategory(!isEditingCategory); }}
                                    className="p-2 rounded-xl transition-all text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                                >
                                    <Settings size={16} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteBank(bankKey); }}
                                    className="p-2 rounded-xl transition-all text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
                
                {/* Expanded Content */}
                {!isCollapsed && (
                    <div className="px-4 pb-4 slide-in-from-top-1 duration-200">
                        <div className="h-px mb-4 bg-gray-100 dark:bg-white/5"></div>
                        
                        {/* Category Edit */}
                        {isEditingCategory && (
                            <div className="mb-4">
                                <label className="block text-[10px] uppercase font-black mb-2 px-1 tracking-widest text-gray-500 dark:text-gray-600">
                                    {t('category_label')}
                                </label>
                                <div className="relative">
                                    <select 
                                        value={categoryId}
                                        onChange={(e) => { onUpdateBankCategory(bankKey, e.target.value); setIsEditingCategory(false); }}
                                        className="w-full text-xs font-bold rounded-xl px-3 py-2.5 outline-none transition-all appearance-none bg-gray-50 dark:bg-black/20 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-black/30"
                                    >
                                        {Object.values(categories).map(cat => (
                                            <option key={cat.id} value={cat.id}>{getLocalized(cat.label, language)}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>
                        )}

                        {/* Options List */}
                        <div className="flex flex-col gap-1 mb-3">
                            {filteredOptions.map((opt, idx) => (
                                <div key={idx} className="group/opt flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                                    <span className="truncate select-text">{getLocalized(opt, language)}</span>
                                    <button 
                                        onClick={() => onDeleteOption(bankKey, opt)}
                                        className="opacity-0 group-hover/opt:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Option Input */}
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder={t('add_option_placeholder')}
                                className="flex-1 px-3 py-2 text-[13px] rounded-xl focus:ring-2 focus:ring-orange-500/20"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        onAddOption(bankKey, e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <button 
                                className="p-2 rounded-xl transition-all active:scale-95 hover:shadow-sm bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-orange-500 hover:text-white"
                                onClick={(e) => {
                                    const input = e.currentTarget.previousSibling;
                                    onAddOption(bankKey, input.value);
                                    input.value = '';
                                }}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Component: Category Section (Masonry Item)
 */
const CategorySection = ({ 
    catId, categories, banks, onDeleteOption, onAddOption, 
    onDeleteBank, onUpdateBankCategory, onStartAddBank, t, language, 
    isDarkMode, bankSearchQuery 
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const category = categories[catId];
  
    if (!category) return null;

    const catBanks = Object.entries(banks).filter(([key, bank]) => {
        const isInCategory = (bank.category || 'other') === catId;
        if (!isInCategory) return false;
        
        if (!bankSearchQuery) return true;
        
        const query = bankSearchQuery.toLowerCase();
        const bankLabel = getLocalized(bank.label, language).toLowerCase();
        const matchesBankName = bankLabel.includes(query) || key.toLowerCase().includes(query);
        const matchesOptions = bank.options.some(opt => 
            getLocalized(opt, language).toLowerCase().includes(query)
        );
        return matchesBankName || matchesOptions;
    });
  
    if (catBanks.length === 0 && bankSearchQuery) return null; // Hide if search yields no results
    // if (catBanks.length === 0) return null; // Optional: Hide empty categories if preferred

    const style = CATEGORY_STYLES[category.color] || CATEGORY_STYLES.slate;

    return (
        <div className={`break-inside-avoid mb-6 transition-opacity duration-300 ${catBanks.length === 0 ? 'opacity-50' : 'opacity-100'}`}>
            <div 
                className="flex items-center gap-2 mb-3 cursor-pointer group select-none py-2 px-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 flex-1 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                    <span className={`w-2 h-2 rounded-full ${style.dotBg}`}></span>
                    {getLocalized(category.label, language)}
                    <span className="ml-auto bg-gray-500/10 px-1.5 rounded text-[9px] tabular-nums opacity-60">
                        {catBanks.length}
                    </span>
                </h3>
            </div>
            
            {!isCollapsed && (
                <div className="space-y-1 pl-1">
                    {catBanks.map(([key, bank]) => (
                        <BankGroup 
                            key={key}
                            bankKey={key} 
                            bank={bank} 
                            onDeleteOption={onDeleteOption}
                            onAddOption={onAddOption}
                            onDeleteBank={onDeleteBank}
                            onUpdateBankCategory={onUpdateBankCategory}
                            categories={categories}
                            t={t}
                            language={language}
                            isDarkMode={isDarkMode}
                            bankSearchQuery={bankSearchQuery}
                        />
                    ))}
                    
                    {/* Add Bank Button inside Category */}
                    {!bankSearchQuery && (
                         <div className="pl-3 mt-2">
                            <Button
                                onClick={() => onStartAddBank(catId)}
                                variant="outline"
                                className="w-full justify-center py-3 border-dashed bg-transparent opacity-60 hover:opacity-100"
                            >
                                {/* 2. children 中只保留文本 */}
                                <span className="text-[12px] font-black uppercase tracking-widest">
                                    {t('add_bank_group')}
                                </span>
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Exported Modal Components (Refactored to use <Modal>) ---

export const CategoryManager = ({ isOpen, onClose, categories, setCategories, banks, setBanks, t, language, isDarkMode }) => {
    const [newCatName, setNewCatName] = useState("");
    const [newCatColor, setNewCatColor] = useState("slate");
    const [editingCatId, setEditingCatId] = useState(null);
    const [tempCatName, setTempCatName] = useState("");
    
    const availableColors = Object.keys(CATEGORY_STYLES);
  
    const handleAddCategory = () => {
      if (!newCatName.trim()) return;
      const newId = `cat_${Date.now()}`;
      setCategories(prev => ({
        ...prev,
        [newId]: { id: newId, label: newCatName, color: newCatColor }
      }));
      setNewCatName("");
      setNewCatColor("slate");
    };
  
    const handleDeleteCategory = (catId) => {
      if (catId === 'other') return;
      const catName = getLocalized(categories[catId].label, language);
      if (window.confirm(t('delete_category_confirm', { name: catName }))) {
         const updatedBanks = { ...banks };
         Object.keys(updatedBanks).forEach(key => {
             if (updatedBanks[key].category === catId) {
                 updatedBanks[key].category = 'other';
             }
         });
         setBanks(updatedBanks);
         const updatedCats = { ...categories };
         delete updatedCats[catId];
         setCategories(updatedCats);
      }
    };
  
    const startEditing = (cat) => {
        setEditingCatId(cat.id);
        setTempCatName(getLocalized(cat.label, language));
    };
  
    const saveEditing = () => {
        if (!tempCatName.trim()) return;
        setCategories(prev => {
            const cat = prev[editingCatId];
            const newLabel = typeof cat.label === 'object' ? { ...cat.label, [language]: tempCatName } : tempCatName;
            return {
              ...prev,
              [editingCatId]: { ...cat, label: newLabel }
            };
        });
        setEditingCatId(null);
    };

    const changeColor = (catId, color) => {
        setCategories(prev => ({
            ...prev,
            [catId]: { ...prev[catId], color }
        }));
    };
  
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <List className="h-5 w-5" />
                        {t('manage_categories')}
                    </DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto custom-scrollbar max-h-[calc(90vh-120px)]">
             {/* Add New */}
             <div className="flex gap-2 items-center mb-6 p-1.5 rounded-xl border dark:bg-black/20 dark:border-white/5 bg-gray-50 border-gray-200">
                <Input 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder={t('category_name_placeholder')}
                  className="flex-1 text-sm rounded-lg px-3 py-2 bg-transparent"
                />
                <select 
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="text-xs font-bold border rounded-lg px-2 py-2 outline-none cursor-pointer border-gray-200 dark:border-white/10 bg-white dark:bg-[#2A2726] text-gray-600 dark:text-gray-300"
                >
                  {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Button 
                  onClick={handleAddCategory}
                  disabled={!newCatName.trim()}
                  variant="default"
                  size="icon"
                  className="p-2 rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                </Button>
             </div>
  
             {/* List */}
             <div className="space-y-2">
               {Object.values(categories).map(cat => (
                 <div key={cat.id} className="group flex items-center gap-3 p-3 rounded-xl border transition-all border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:shadow-sm">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${CATEGORY_STYLES[cat.color].dotBg}`}></div>
                    
                    {editingCatId === cat.id ? (
                        <Input 
                          autoFocus
                          value={tempCatName}
                          onChange={(e) => setTempCatName(e.target.value)}
                          onBlur={saveEditing}
                          onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                          className="flex-1 text-sm bg-transparent border-b-2 border-orange-500 outline-none px-1 py-0.5"
                        />
                    ) : (
                        <span className="flex-1 text-sm font-bold text-gray-700 dark:text-gray-300">{getLocalized(cat.label, language)}</span>
                    )}
  
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {/* Color Picker */}
                        <div className="relative group/color">
                            <button className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/10 transition-colors">
                                <div className={`w-3 h-3 rounded-full ${CATEGORY_STYLES[cat.color].bg}`}></div>
                            </button>
                            <div className="absolute right-0 top-full mt-2 hidden group-hover/color:grid grid-cols-5 gap-1.5 p-3 border shadow-xl rounded-xl z-50 w-[140px] slide-in-from-top-2 bg-white dark:bg-[#1E1E1E] border-gray-100 dark:border-white/10">
                                {availableColors.map(c => (
                                    <div 
                                      key={c} 
                                      onClick={() => changeColor(cat.id, c)}
                                      className={`w-5 h-5 rounded-full cursor-pointer hover:scale-110 transition-transform ring-1 ring-offset-2 ring-offset-white dark:ring-offset-[#1E1E1E] ${CATEGORY_STYLES[c].dotBg} ${cat.color === c ? 'ring-gray-400' : 'ring-transparent'}`}
                                      title={c}
                                    />
                                ))}
                            </div>
                        </div>
  
                        <button onClick={() => startEditing(cat)} className="p-1.5 rounded-lg hover:text-orange-500 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"><Pencil size={14}/></button>
                        {cat.id !== 'other' && (
                            <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 rounded-lg hover:text-red-500 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"><Trash2 size={14}/></button>
                        )}
                    </div>
                 </div>
               ))}
             </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const AddBankModal = ({ isOpen, onClose, t, categories, newBankLabel, setNewBankLabel, newBankKey, setNewBankKey, newBankCategory, setNewBankCategory, onConfirm, language, isDarkMode }) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        {t('add_bank_title')}
                    </DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto custom-scrollbar max-h-[calc(90vh-120px)]">
            <div className="space-y-5 pt-1">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest pl-1 dark:text-gray-500 text-gray-400">{t('label_name')}</label>
                    <Input 
                        autoFocus
                        type="text" 
                        className="w-full text-sm rounded-xl px-4 py-3 border-2 focus:border-orange-500/50"
                        placeholder={t('label_placeholder')}
                        value={newBankLabel}
                        onChange={e => setNewBankLabel(e.target.value)}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest pl-1 dark:text-gray-500 text-gray-400">{t('id_name')}</label>
                    <Input 
                        type="text" 
                        className="w-full text-sm font-mono rounded-xl px-4 py-3 border-2 focus:border-orange-500/50"
                        placeholder={t('id_placeholder')}
                        value={newBankKey}
                        onChange={e => setNewBankKey(e.target.value)} 
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest pl-1 text-gray-400 dark:text-gray-500">{t('category_label')}</label>
                    <div className="relative">
                        <select 
                            value={newBankCategory}
                            onChange={e => setNewBankCategory(e.target.value)}
                            className="w-full text-sm appearance-none rounded-xl px-4 py-3 outline-none transition-all border-2 focus:border-orange-500/50 bg-gray-50 dark:bg-black/20 border-gray-100 dark:border-white/5 text-gray-800 dark:text-gray-200 focus:bg-white dark:focus:bg-black/40"
                        >
                            {Object.values(categories).map(cat => (
                                <option key={cat.id} value={cat.id}>{getLocalized(cat.label, language)}</option>
                            ))}
                        </select>
                        <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50`} size={16} />
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <Button 
                        onClick={onClose}
                        variant="outline"
                        className="flex-1 justify-center"
                    >
                        {t('cancel')}
                    </Button>
                    <Button 
                        onClick={onConfirm}
                        disabled={!newBankLabel.trim() || !newBankKey.trim()}
                        variant="default"
                        className="flex-1 justify-center"
                    >
                        {t('confirm_add')}
                    </Button>
                </div>
            </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// --- Main View Component ---

/**
 * BanksView - Dedicated page for Bank Configuration
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


export const InsertVariableModal = ({ isOpen, onClose, categories, banks, onSelect, t, language, isDarkMode }) => {
    // 管理每个分类的折叠状态，默认全部折叠
    const [collapsedCategories, setCollapsedCategories] = useState(() => {
        const initialState = {};
        Object.keys(categories).forEach(catId => {
            initialState[catId] = true; // 默认折叠
        });
        return initialState;
    });

    // 当 modal 打开时，重置所有分类为折叠状态
    useEffect(() => {
        if (isOpen) {
            const initialState = {};
            Object.keys(categories).forEach(catId => {
                initialState[catId] = true; // 默认折叠
            });
            setCollapsedCategories(initialState);
        }
    }, [isOpen, categories]);

    // 切换分类折叠状态
    const toggleCategory = (catId) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [catId]: !prev[catId]
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <List className="h-5 w-5" />
                        {t('insert')}
                    </DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto custom-scrollbar max-h-[calc(90vh-120px)]">
             <div className="space-y-6 pt-2">
               {Object.keys(categories).map(catId => {
                   const catBanks = Object.entries(banks).filter(([_, bank]) => (bank.category || 'other') === catId);
                   if (catBanks.length === 0) return null;
                   
                   const category = categories[catId];
                   const style = CATEGORY_STYLES[category.color] || CATEGORY_STYLES.slate;
                   const isCollapsed = collapsedCategories[catId] ?? true;
    
                   return (
                       <div key={catId}>
                           <h4 
                               className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2 cursor-pointer group/header transition-colors ${style.text} hover:text-gray-700 dark:hover:text-gray-300`}
                               onClick={() => toggleCategory(catId)}
                           >
                               <div className={`transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}>
                                   <ChevronRight size={14} />
                               </div>
                               <span className={`w-1.5 h-1.5 rounded-full ${style.dotBg}`}></span>
                               {getLocalized(category.label, language)}
                               <span className="ml-auto text-[9px] opacity-60 tabular-nums">
                                   {catBanks.length}
                               </span>
                           </h4>
                           {!isCollapsed && (
                               <div className="grid grid-cols-1 gap-2 slide-in-from-top-2 duration-200">
                                   {catBanks.map(([key, bank]) => (
                                       <button
                                           key={key}
                                           onClick={() => onSelect(key)}
                                           className="flex items-center justify-between p-3 rounded-xl border text-left transition-all group bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-orange-200 dark:hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                                       >
                                           <div>
                                               <span className="block text-sm font-bold transition-colors text-gray-700 dark:text-gray-300 group-hover:text-orange-700 dark:group-hover:text-orange-400">{getLocalized(bank.label, language)}</span>
                                               <code className="text-[10px] font-black tracking-wide opacity-50 text-gray-400 dark:text-gray-500">{`{{${key}}}`}</code>
                                           </div>
                                           <Plus size={16} className="transition-colors text-gray-300 dark:text-gray-600 group-hover:text-orange-500" />
                                       </button>
                                   ))}
                               </div>
                           )}
                       </div>
                   );
               })}
            </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
