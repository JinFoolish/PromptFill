import React from 'react';
import { Github, Moon, Sun, Clock, Database } from 'lucide-react';

/**
 * Sidebar 组件 - 通用侧边导航栏
 */
export const Sidebar = ({
  activeTab = 'home', // 'home' | 'details' | 'settings' | 'history' | 'banks'
  onHome,
  onDetail,
  onHistory,
  onBanks,
  onSettings,
  // I18n
  // language,
  // setLanguage,
  // Theme
  isDarkMode,
  setIsDarkMode,
  t
}) => {
  // 定义三种状态的颜色
  const COLORS = isDarkMode ? {
    NORMAL: '#8E9196',    // gray-400 equivalent but slightly adjusted
    HOVER: '#F97316',     // orange-500
    SELECTED: '#FB923C'   // orange-400
  } : {
    NORMAL: '#6B7280',    // gray-500
    HOVER: '#F97316',     // orange-500
    SELECTED: '#EA580C'   // orange-600
  };

  // 获取图标样式的辅助函数
  const getIconStyle = () => ({
    width: '24px',
    height: '24px',
    WebkitMaskImage: `var(--mask-url)`,
    maskImage: `var(--mask-url)`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    filter: isDarkMode ? 'none' : 'drop-shadow(0px 2px 0px rgba(255, 255, 255, 0.5))',
    transition: 'all 0.3s ease'
  });

  // 统一的容器样式
  const containerStyle = isDarkMode ? {
    width: '62px',
    height: '100%',
    borderRadius: '16px',
    border: '1px solid transparent',
    backgroundImage: 'linear-gradient(180deg, #3B3B3B 0%, #242120 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
  } : {
    width: '62px',
    height: '100%',
    borderRadius: '16px',
    // 使用渐变背景 + 渐变描边技巧 (解决 border-radius 与 border-image 冲突)
    border: '1px solid transparent',
    backgroundImage: 'linear-gradient(180deg, #FAF5F1 0%, #F6EBE6 100%), linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
  };

  return (
    <aside 
      style={containerStyle}
      className="relative flex flex-col justify-between items-center py-8 mr-4 flex-shrink-0"
    >
      {/* 圣诞帽 - 仅限桌面端显示 */}
      {/* <img 
        src="/XmasHat.png" 
        alt="Christmas Hat"
        className="hidden lg:block pointer-events-none z-[100]"
        style={{
          position: 'absolute',
          left: '-24px',
          top: '-28px',
          width: '60px',
          height: '45px',
          transform: 'rotate(-27.44deg)',
          opacity: 1,
        }}
      /> */}
      
      {/* 上部分：Logo + 导航按钮 */}
      <div className="flex flex-col items-center gap-8 w-full">
        {/* Logo */}
        <div className="mt-4 mb-2">
          <img src="/Logo_icon.svg" alt="Logo" className="w-9 h-9" />
        </div>

        {/* 导航按钮组 */}
        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={onHome}
            className="p-2 group"
            title="主页"
          >
            <div 
              style={{ '--mask-url': 'url(/home.svg)', ...getIconStyle() }}
              className={`group-hover:bg-[#F97316] ${activeTab === 'home' ? (isDarkMode ? 'bg-[#FB923C]' : 'bg-[#EA580C]') : (isDarkMode ? 'bg-[#8E9196]' : 'bg-[#6B7280]')}`}
            />
          </button>
          
          <button 
            onClick={onDetail}
            className="p-2 group"
            title="详情页"
          >
            <div 
              style={{ '--mask-url': 'url(/list.svg)', ...getIconStyle() }}
              className={`group-hover:bg-[#F97316] ${activeTab === 'details' ? (isDarkMode ? 'bg-[#FB923C]' : 'bg-[#EA580C]') : (isDarkMode ? 'bg-[#8E9196]' : 'bg-[#6B7280]')}`}
            />
          </button>
          
          <button 
            onClick={onHistory}
            className="p-2 group"
            title={t('history_title') || '历史记录'}
          >
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-400'} group-hover:text-[#F97316] transition-colors ${activeTab === 'history' ? 'text-[#EA580C]' : ''}`}>
              <Clock size={24} style={{ filter: isDarkMode ? 'none' : 'drop-shadow(0px 2px 0px rgba(255, 255, 255, 0.5))' }} />
            </div>
          </button>
          
          <button 
            onClick={onBanks}
            className="p-2 group"
            title={t('banks_title') || '词库管理'}
          >
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-400'} group-hover:text-[#F97316] transition-colors ${activeTab === 'banks' ? 'text-[#EA580C]' : ''}`}>
              <Database size={24} style={{ filter: isDarkMode ? 'none' : 'drop-shadow(0px 2px 0px rgba(255, 255, 255, 0.5))' }} />
            </div>
          </button>
          

        </div>
      </div>

      {/* 下部分：设置组 */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* <button 
          onClick={() => setLanguage(language === 'cn' ? 'en' : 'cn')}
          className="p-2 group"
          title={t('language')}
        >
          <div 
            style={{ '--mask-url': 'url(/translate.svg)', ...getIconStyle() }}
            className={`${isDarkMode ? 'bg-[#8E9196]' : 'bg-[#6B7280]'} group-hover:bg-[#F97316]`}
          />
        </button> */}

        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 group"
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
        >
          <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-400'} group-hover:text-[#F97316] transition-colors`}>
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </div>
        </button>
        
        <button 
          onClick={onSettings}
          className="p-2 group"
          title={t('settings')}
        >
          <div 
            style={{ '--mask-url': 'url(/setting.svg)', ...getIconStyle() }}
            className={`group-hover:bg-[#F97316] ${activeTab === 'settings' ? (isDarkMode ? 'bg-[#FB923C]' : 'bg-[#EA580C]') : (isDarkMode ? 'bg-[#8E9196]' : 'bg-[#6B7280]')}`}
          />
        </button>
        
        <a 
          href="https://github.com/TanShilongMario/PromptFill/" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`p-2 ${isDarkMode ? 'text-gray-500 hover:text-orange-400' : 'text-gray-400 hover:text-orange-600'} transition-colors`}
          title="Github"
        >
          <Github size={24} style={{ filter: isDarkMode ? 'none' : 'drop-shadow(0px 2px 0px rgba(255, 255, 255, 0.5))' }} />
        </a>
      </div>
    </aside>
  );
};

