// PC 端动态 Slogan 组件
import React, { useState, useEffect } from 'react';
import { SCENE_WORDS, STYLE_WORDS } from '../../constants/slogan';

export const AnimatedSlogan = React.memo(({ isActive, language, isDarkMode }) => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [styleIndex, setStyleIndex] = useState(0);

  const currentScenes = SCENE_WORDS[language] || SCENE_WORDS.cn;
  const currentStyles = STYLE_WORDS[language] || STYLE_WORDS.cn;
  
  useEffect(() => {
    if (!isActive) return;
    
    const sceneTimer = setInterval(() => {
      setSceneIndex(prev => (prev + 1) % currentScenes.length);
    }, 2000);
    const styleTimer = setInterval(() => {
      setStyleIndex(prev => (prev + 1) % currentStyles.length);
    }, 2500);
    return () => {
      clearInterval(sceneTimer);
      clearInterval(styleTimer);
    };
  }, [isActive, currentScenes.length, currentStyles.length]);

  return (
    <div className={`flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-3 text-base md:text-lg lg:text-xl font-medium font-['MiSans',system-ui,sans-serif] px-2 leading-relaxed min-h-[60px] ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
      <span className="whitespace-nowrap">"{language === 'en' ? 'Show a detailed, miniature' : '展示一个精致的、微缩'}</span>
      <div className="inline-flex items-center justify-center min-w-[120px]">
        <span 
          key={`style-${styleIndex}-${language}`}
          className="inline-block px-4 py-1.5 md:px-5 md:py-2 rounded-full transition-all duration-500 select-none font-bold text-white whitespace-nowrap pill-animate"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            boxShadow: isDarkMode 
              ? 'inset 0px 2px 4px 0px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(96, 165, 250, 0.2)'
              : 'inset 0px 2px 4px 0px rgba(255, 255, 255, 0.2), 0 4px 12px rgba(96, 165, 250, 0.4)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.3)',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          {currentStyles[styleIndex]}
        </span>
      </div>
      <span className="whitespace-nowrap">{language === 'en' ? 'of' : '的'}</span>
      <div className="inline-flex items-center justify-center min-w-[120px]">
        <span 
          key={`scene-${sceneIndex}-${language}`}
          className="inline-block px-4 py-1.5 md:px-5 md:py-2 rounded-full transition-all duration-500 select-none font-bold text-white whitespace-nowrap pill-animate"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
            boxShadow: isDarkMode 
              ? 'inset 0px 2px 4px 0px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(251, 146, 60, 0.2)'
              : 'inset 0px 2px 4px 0px rgba(255, 255, 255, 0.2), 0 4px 12px rgba(251, 146, 60, 0.4)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.3)',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          {currentScenes[sceneIndex]}
        </span>
      </div>
      <span className="whitespace-nowrap">{language === 'en' ? 'scene"' : '场景"'}</span>
    </div>
  );
});

AnimatedSlogan.displayName = 'AnimatedSlogan';

