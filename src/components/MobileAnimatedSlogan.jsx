// 移动端动态 Slogan 组件
import React, { useState, useEffect } from 'react';
import { SCENE_WORDS, STYLE_WORDS } from '../constants/slogan';

export const MobileAnimatedSlogan = React.memo(({ isActive, language, isDarkMode }) => {
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
    <div className={`flex flex-wrap items-center justify-center gap-1.5 text-sm font-medium mb-3 min-h-[32px] ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
      <span className="whitespace-nowrap">"{language === 'en' ? 'Show' : '展示'}</span>
      <div className="inline-flex items-center justify-center min-w-[80px]">
        <span 
          key={`style-m-${styleIndex}-${language}`}
          className="inline-block px-2.5 py-0.5 rounded-full font-bold text-white text-xs whitespace-nowrap pill-animate"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            boxShadow: isDarkMode 
              ? 'inset 0px 2px 4px 0px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(96, 165, 250, 0.2)'
              : '0 2px 8px rgba(96, 165, 250, 0.3)'
          }}
        >
          {currentStyles[styleIndex]}
        </span>
      </div>
      <span className="whitespace-nowrap">{language === 'en' ? 'of' : '的'}</span>
      <div className="inline-flex items-center justify-center min-w-[80px]">
        <span 
          key={`scene-m-${sceneIndex}-${language}`}
          className="inline-block px-2.5 py-0.5 rounded-full font-bold text-white text-xs whitespace-nowrap pill-animate"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
            boxShadow: isDarkMode 
              ? 'inset 0px 2px 4px 0px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(251, 146, 60, 0.2)'
              : '0 2px 8px rgba(251, 146, 60, 0.3)'
          }}
        >
          {currentScenes[sceneIndex]}
        </span>
      </div>
      <span className="whitespace-nowrap">{language === 'en' ? 'scene"' : '场景"'}</span>
    </div>
  );
});

MobileAnimatedSlogan.displayName = 'MobileAnimatedSlogan';

