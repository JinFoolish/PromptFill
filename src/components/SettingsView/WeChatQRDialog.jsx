import React from 'react';
import {
  Dialog,
  DialogContent,
} from '../ui/dialog';

/**
 * 微信二维码对话框组件
 */
export const WeChatQRDialog = ({ isOpen, onOpenChange, t, isDarkMode }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center">
          <div className={`w-56 h-56 rounded-2xl overflow-hidden mb-6 border p-2 shadow-inner ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
            <img 
              src="/Wechat.jpg" 
              alt="WeChat QR Code" 
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <p className={`text-base font-black mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('scan_to_connect')}
          </p>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            TanShilongMario
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

