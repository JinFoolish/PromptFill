import React, { useState, useEffect } from 'react';
import { 
  ImageIcon, ArrowUpRight
} from 'lucide-react';
import { getLocalized } from '../utils/helpers';
import MasonryGrid from './MasonryGrid';

/**
 * DiscoveryView 组件 - 瀑布流展示所有模板
 */
export const DiscoveryView = React.memo(({ 
  filteredTemplates,
  setActiveTemplateId,
  setDiscoveryView,
  setZoomedImage,
  posterScrollRef,
  setIsPosterAutoScrollPaused,
  currentMasonryStyle,
  AnimatedSlogan,
  isSloganActive = true,
  t,
  TAG_STYLES,
  displayTag,
  // Tools props
  handleRefreshSystemData,
  language,
  setLanguage,
  setIsSettingsOpen,
  isDarkMode,
  globalContainerStyle,
  masonryStyleKey
}) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (isMobile) {
    // ... 保持移动端逻辑不变
    return (
      <div 
        className={`fixed inset-0 z-10 flex flex-col overflow-y-auto pb-32 md:pb-20 ${isDarkMode ? '' : 'mesh-gradient-bg'}`}
        style={isDarkMode ? { background: 'linear-gradient(180deg, #323131 0%, #181716 100%)' } : {}}
      >
        <div className="flex flex-col w-full min-h-full px-5 py-8 gap-6">
          {/* 1. 顶部 SVG 标题区域 */}
          <div className="w-full flex justify-center px-4">
            <img 
              src={isDarkMode ? "/Title_Dark.svg" : "/Title.svg"} 
              alt="Prompt Fill Logo" 
              className="w-full max-w-[280px] h-auto"
            />
          </div>

          {/* 2. 动态文字区 */}
          <div className="w-full">
            <AnimatedSlogan isActive={isSloganActive} language={language} isDarkMode={isDarkMode} />
          </div>

          {/* 3. 图像展示（单列） */}
          <div className="flex flex-col gap-6 mt-2">
            {filteredTemplates.map(t_item => (
              <div 
                key={t_item.id}
                onClick={() => {
                  setZoomedImage(t_item.imageUrl);
                }}
                className={`w-full rounded-3xl overflow-hidden shadow-sm border active:scale-[0.98] transition-all ${isDarkMode ? 'bg-[#2A2726] border-white/5' : 'bg-white border-gray-100'}`}
              >
                <div className="relative w-full bg-gray-50/5">
                  {t_item.imageUrl ? (
                    <img 
                      src={t_item.imageUrl} 
                      alt={getLocalized(t_item.name, language)} 
                      className="w-full h-auto block"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] flex items-center justify-center text-gray-300">
                      <ImageIcon size={48} strokeWidth={1} />
                    </div>
                  )}
                  {/* Title Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 pt-10 rounded-b-3xl">
                    <h3 className="text-white font-bold text-lg">{getLocalized(t_item.name, language)}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 flex items-center justify-center overflow-hidden"
    >
      {/* Poster Content Container */}
      <div 
        style={globalContainerStyle}
        className="flex flex-col w-full h-full overflow-hidden relative z-10 p-4 md:p-6 lg:p-9"
      >
          <div className="flex-1 flex flex-col lg:flex-row gap-8 lg:gap-20 overflow-hidden py-6 lg:py-10 px-4 lg:px-8">
              {/* Left Side: Logo & Slogan */}
              <div className="flex flex-col justify-center items-center lg:items-start lg:w-[380px] xl:w-[460px] flex-shrink-0 px-4 lg:pl-8 lg:pr-6 gap-8">
                  <div className="w-full max-w-[400px] scale-75 sm:scale-90 lg:scale-100 origin-center lg:origin-left">
                      <img 
                          src={isDarkMode ? "/Title_Dark.svg" : "/Title.svg"} 
                          alt="Prompt Fill Logo" 
                          className="w-full h-auto"
                      />
                  </div>
                  <AnimatedSlogan isActive={isSloganActive} language={language} isDarkMode={isDarkMode} />
              </div>

              {/* Right Side: Waterfall Grid */}
              <div 
                  ref={posterScrollRef}
                  className="flex-1 overflow-y-auto overflow-x-visible pr-4 lg:pr-8 scroll-smooth poster-scrollbar will-change-scroll"
                  onMouseEnter={() => setIsPosterAutoScrollPaused(true)}
                  onMouseLeave={() => setIsPosterAutoScrollPaused(false)}
              >
                  <div className="h-full w-full py-8 lg:py-12 px-6 lg:px-12">
                      <MasonryGrid
                          items={filteredTemplates}
                          renderItem={(t_item, index) => (
                              <TemplateCard
                                  key={t_item.id}
                                  template={t_item}
                                  onClick={() => setZoomedImage(t_item.imageUrl)}
                                  language={language}
                                  isDarkMode={isDarkMode}
                              />
                          )}
                          masonryStyleKey={masonryStyleKey}
                      />
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
});

// Template Card Component for Masonry Grid
const TemplateCard = ({ template, onClick, language, isDarkMode }) => {
  return (
    <div 
      onClick={onClick}
      className={`cursor-pointer group transition-shadow duration-300 relative overflow-hidden rounded-2xl isolate border-2 hover:shadow-[0_0_25px_rgba(251,146,60,0.6)] will-change-transform ${isDarkMode ? 'border-white/10' : 'border-white'}`}
    >
      <div className={`relative w-full overflow-hidden rounded-xl ${isDarkMode ? 'bg-[#2A2726]' : 'bg-gray-100'}`} style={{ transform: 'translateZ(0)' }}>
        {template.imageUrl ? (
          <img 
            src={template.imageUrl} 
            alt={getLocalized(template.name, language)} 
            className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-[3/4] bg-gray-100/5 flex items-center justify-center text-gray-300">
            <ImageIcon size={32} />
          </div>
        )}
        
        {/* Hover Overlay: Bottom Glass Mask */}
        <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-[opacity,transform] duration-500 ease-out z-20 rounded-b-xl overflow-hidden">
          <div className={`backdrop-blur-md border-t py-4 px-6 shadow-2xl rounded-b-xl ${isDarkMode ? 'bg-black/60 border-white/10' : 'bg-white/40 border-white/40'}`}>
            <p className={`font-bold text-base leading-snug text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              {getLocalized(template.name, language)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

DiscoveryView.displayName = 'DiscoveryView';
