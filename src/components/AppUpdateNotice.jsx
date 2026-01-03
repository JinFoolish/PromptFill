// 应用更新提示组件
import { X, Sparkles } from 'lucide-react';

export const AppUpdateNotice = ({ 
  isOpen, 
  onClose, 
  onRefresh, 
  updateNoticeType, 
  t 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[150]">
      <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-md ml-auto border border-blue-400">
        <div className="p-2 bg-white/20 rounded-xl">
          <Sparkles size={24} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium leading-snug">
            {updateNoticeType === 'app' ? t('app_update_available_msg') : t('data_update_available_msg')}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-white text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-black/10 whitespace-nowrap"
        >
          {t('refresh_now')}
        </button>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

