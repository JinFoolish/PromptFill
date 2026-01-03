import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { CATEGORY_STYLES } from '../../constants/styles';
import { getLocalized } from '../../utils/helpers';
import { Button } from '../ui/button';
import { BankGroup } from './BankGroup';

/**
 * Component: Category Section (Masonry Item)
 * 分类区块组件 - 展示某个分类下的所有词库组
 */
export const CategorySection = ({ 
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

