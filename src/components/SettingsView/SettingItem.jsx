import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * 设置项组件
 */
export const SettingItem = ({ 
  icon: Icon, 
  label, 
  value, 
  onClick, 
  disabled = false, 
  danger = false, 
  active = false, 
  description,
  isDarkMode 
}) => {
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left w-full
        ${disabled ? 'opacity-40 cursor-not-allowed' : active 
          ? (isDarkMode ? 'bg-orange-500/20' : 'bg-orange-50') 
          : (isDarkMode ? 'hover:bg-white/5 active:scale-[0.99]' : 'hover:bg-gray-50 active:scale-[0.99]')}
      `}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200
          ${active 
            ? 'bg-orange-500/20 text-orange-600' 
            : (isDarkMode ? 'bg-gray-800 text-gray-400 group-hover:text-gray-200' : 'bg-gray-100 text-gray-500 group-hover:text-gray-700')}
          ${danger && !active ? 'bg-red-50 text-red-500 group-hover:bg-red-100 group-hover:text-red-600' : ''}
        `}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className={`text-[13px] font-bold tracking-tight truncate ${danger ? 'text-red-600' : active ? 'text-orange-600' : (isDarkMode ? 'text-gray-300' : 'text-gray-800')}`}>
            {label}
          </div>
          {description && (
            <div className={`text-[10px] font-medium truncate ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {description}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 pl-3">
        {value && (
          <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
            active 
              ? 'bg-orange-500/20 text-orange-600'
              : (isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-500')
          }`}>
            {value}
          </span>
        )}
        {!disabled && (
          <ChevronRight size={14} className={`transition-colors opacity-50 ${active ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
        )}
      </div>
    </button>
  );
};

