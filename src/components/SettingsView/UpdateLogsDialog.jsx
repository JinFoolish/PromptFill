import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { updateLogsCN, updateLogsEN } from '../../constants/updateLogs';

/**
 * 更新日志对话框组件
 */
export const UpdateLogsDialog = ({ isOpen, onOpenChange, language, t, isDarkMode }) => {
  const currentLogs = language === 'cn' ? updateLogsCN : updateLogsEN;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh]">
        <DialogHeader>
          <DialogTitle>{t('changelog')}</DialogTitle>
          <DialogDescription>{t('timeline_changes_improvements')}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-10 pl-2">
            {currentLogs.map((log, idx) => (
              <div key={idx} className="flex gap-6 group">
                {/* Timeline Line */}
                <div className="relative flex flex-col items-center flex-shrink-0">
                  <div className={`w-[1.5px] h-full absolute top-3 group-last:hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                  <div className={`w-3 h-3 rounded-full border-[2.5px] border-orange-500 z-10 shadow-[0_0_10px_rgba(249,115,22,0.3)] ${isDarkMode ? 'bg-[#181818]' : 'bg-white'}`} />
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <span className={`text-[11px] font-black px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                      {log.version}
                    </span>
                    <span className={`text-[11px] font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {log.date}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ml-auto ${
                      log.type === 'MAJOR' ? 'bg-red-500 text-white' : 
                      log.type === 'NEW' ? 'bg-blue-500 text-white' : (isDarkMode ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-500')
                    }`}>
                      {log.type}
                    </span>
                  </div>
                  
                  <h3 className={`text-base font-black tracking-tight mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {log.title}
                  </h3>
                  
                  <ul className="space-y-2.5">
                    {log.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-400'}`} />
                        <p className={`text-[13px] leading-relaxed font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

