import React from 'react';

/**
 * 设置页面头部组件
 */
export const SettingsHeader = ({ SYSTEM_DATA_VERSION, t, isDarkMode }) => {
  return (
    <div className="px-8 pt-10 pb-6 flex-shrink-0 flex items-center justify-between max-w-5xl mx-auto w-full">
      <div>
        <h1 className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('settings_title')}
        </h1>
        <p className={`text-[11px] font-bold mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          System V0.6.1 • Data {SYSTEM_DATA_VERSION}
        </p>
      </div>
      <div className="flex gap-2">
        {/* Header Actions if needed */}
      </div>
    </div>
  );
};

