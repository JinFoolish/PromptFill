import React, { useState } from 'react';
import { List, Plus, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { CATEGORY_STYLES } from '../../constants/styles';
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
 * Category Manager Modal Component
 * 分类管理模态框组件
 */
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

