import React, { useState, useEffect } from 'react';
import { 
  Settings, ChevronRight, ChevronDown, ChevronUp, 
  Plus, Trash2, X
} from 'lucide-react';
import { PREMIUM_STYLES } from '../../constants/styles';
import { getLocalized } from '../../utils/helpers';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

/**
 * Component: Bank Group (Collapsible Card)
 * 词库组组件 - 可折叠的卡片
 */
export const BankGroup = ({ 
    bankKey, bank, onDeleteOption, onAddOption, 
    onDeleteBank, onUpdateBankCategory, categories, t, language, 
    isDarkMode, bankSearchQuery 
}) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isEditingCategory, setIsEditingCategory] = useState(false);

    // Auto-expand if search query matches
    useEffect(() => {
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

