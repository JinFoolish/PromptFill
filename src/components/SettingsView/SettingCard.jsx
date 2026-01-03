import React from 'react';

/**
 * 设置卡片容器组件
 */
export const SettingCard = ({ title, children, className = "", isDarkMode }) => {
  return (
    <div className={`rounded-[24px] border p-5 flex flex-col gap-2 shadow-sm ${isDarkMode ? 'bg-[#1E1E1E] border-white/5' : 'bg-white border-gray-100'} ${className}`}>
      {title && (
        <h3 className={`text-[10px] font-black uppercase tracking-[0.15em] mb-2 pl-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

