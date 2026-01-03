import React from 'react';
import { Database, ChevronDown } from 'lucide-react';
import { getLocalized } from '../../utils/helpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

/**
 * Add Bank Modal Component
 * 添加词库组模态框组件
 */
export const AddBankModal = ({ 
  isOpen, 
  onClose, 
  t, 
  categories, 
  newBankLabel, 
  setNewBankLabel, 
  newBankKey, 
  setNewBankKey, 
  newBankCategory, 
  setNewBankCategory, 
  onConfirm, 
  language, 
  isDarkMode 
}) => {
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

