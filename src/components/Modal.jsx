import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, // 标题现在显示在顶部 Header 栏
  icon: Icon, // 新增：支持传入图标组件
  children, 
  isDarkMode,
  maxWidth = "max-w-md", // 默认宽度改为 max-w-md 以匹配你的样式
  maxHeight = "max-h-[90vh]" // 默认高度限制
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 打开时禁止背景滚动
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    // 1. 外层覆盖：全屏固定，居中，黑色半透明背景
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      
      {/* 背景遮罩层 - 点击关闭 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* 2. Modal 内容容器 - 匹配你提供的样式 */}
      <div 
        className={`
          relative w-full ${maxWidth} ${maxHeight} flex flex-col overflow-hidden 
          rounded-xl shadow-2xl transition-all  ${isDarkMode ? 'bg-[#242120] border border-white/5' : 'bg-white'}
        `}
        onClick={e => e.stopPropagation()} // 防止点击内容触发背景关闭
      >
        
        {/* Header 区域 - 固定在顶部 */}
        <div className={`
          shrink-0 p-4 border-b flex justify-between items-center select-none
          ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-gray-50'}
        `}>
          <h3 className={`font-bold text-lg flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
            {Icon && <Icon size={18} />}
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className={`
              p-1 rounded transition-colors duration-200
              ${isDarkMode ? 'hover:bg-white/10 text-gray-500 hover:text-gray-300' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'}
            `}
          >
            <X size={18}/>
          </button>
        </div>
        
        {/* Content 区域 - 可滚动 */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {children}
        </div>

      </div>
    </div>,
    document.body
  );
};