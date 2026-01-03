import React, { useState, useEffect } from 'react';
import { List, ChevronRight, Plus } from 'lucide-react';
import { CATEGORY_STYLES } from '../../constants/styles';
import { getLocalized } from '../../utils/helpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

/**
 * Insert Variable Modal Component
 * 插入变量模态框组件
 */
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

