import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles, ImageIcon } from 'lucide-react';
import { getLocalized } from '../utils/helpers';
import { Button } from './ui/button';

const ImagePopup = React.memo(({ 
  isOpen,
  onClose,
  imageUrl,
  imageUrls = [],
  template = null,
  language = 'cn',
  t = (key) => key,
  displayTag = (tag) => tag,
  onUseTemplate = null,
  isDarkMode = false,
  showTemplateInfo = true,
  className = "",
  customActions = null // 新增：自定义操作按钮
}) => {
  const [modalMousePos, setModalMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const touchStartY = useRef(0);

  // 获取所有图片列表
  const allImages = useMemo(() => {
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      return imageUrls;
    }
    return imageUrl ? [imageUrl] : [];
  }, [imageUrls, imageUrl]);

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (!imageUrl || !allImages.length) return 0;
    const idx = allImages.indexOf(imageUrl);
    return idx >= 0 ? idx : 0;
  });

  const currentImageUrl = allImages[currentIndex] || imageUrl;

  // 锁定/解锁背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // 计算 3D 旋转角度
  const rotateY = (modalMousePos.x - window.innerWidth / 2) / (window.innerWidth / 2) * 15;
  const rotateX = (modalMousePos.y - window.innerHeight / 2) / (window.innerHeight / 2) * -15;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % allImages.length);
  };

  // 移动端手势处理
  const handleCardTouchStart = (e) => {
    // 如果触摸开始于内容区域，不记录起始位置
    if (e.target.closest('.content-scroll-area')) {
      return;
    }
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    // 当卡片展开时，内容区域的滑动完全用于文字滚动，不更新3D效果
    if (isTextExpanded && e.target.closest('.content-scroll-area')) {
      return;
    }
    
    // 实时更新 3D 效果
    const touch = e.touches[0];
    setModalMousePos({ x: touch.clientX, y: touch.clientY });
  };

  const handleCardTouchEnd = (e) => {
    // 如果触摸结束于内容区域，不处理展开/收起逻辑
    if (e.target.closest('.content-scroll-area') || touchStartY.current === 0) {
      touchStartY.current = 0;
      return;
    }
    
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;

    // 向上滑动超过 50px 则展开
    if (deltaY > 50 && !isTextExpanded) {
      setIsTextExpanded(true);
    }
    // 向下滑动超过 50px 则收起
    else if (deltaY < -50 && isTextExpanded) {
      setIsTextExpanded(false);
    }
    
    touchStartY.current = 0;
  };

  if (!isOpen) return null;

  return (
    <div 
        className={`fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-500 overflow-hidden ${className}`}
        onMouseMove={(e) => setModalMousePos({ x: e.clientX, y: e.clientY })}
        onClick={onClose}
    >
        {/* Background Layer - Static image + deep mask to prevent flickering from discovery view */}
        <div 
          className="absolute inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(/background1.png)',
          }}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-3xl"></div>
        </div>

        <button 
            className="absolute top-6 right-6 md:top-8 md:right-8 text-white/40 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 z-[120]"
            onClick={onClose}
        >
            <X size={32} />
        </button>
        
        <div 
            className="max-w-7xl w-full h-full md:h-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-20 z-[110]"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Left: Image Section with 3D Effect */}
            <div 
              className={`flex-shrink-0 flex justify-center items-center perspective-[1000px] relative group/modal-img flex-1`}
              style={{ perspective: '1200px' }}
            >
                <div 
                  className="relative transition-transform duration-200 ease-out h-full flex items-center justify-center"
                  style={{ 
                    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div 
                    className="absolute inset-4 bg-black/40 blur-3xl rounded-3xl -z-10 transition-opacity duration-500"
                    style={{ transform: 'translateZ(-50px)' }}
                  />
                  
                  <img 
                      key={currentImageUrl}
                      src={currentImageUrl} 
                      alt="Preview" 
                      className={`max-w-full rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20 animate-in fade-in duration-300 max-h-[75vh] object-contain`}
                      style={{ transform: 'translateZ(20px)' }}
                  />
                </div>

                {/* Navigation & Indicator */}
                {allImages.length > 1 && (
                  <div className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-6 z-30 -bottom-12`}>
                    <button 
                      onClick={handlePrev}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-white/20 text-white/50 hover:text-white transition-all backdrop-blur-md border border-white/10"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Dots Indicator */}
                    <div className="flex gap-2">
                      {allImages.map((_, idx) => (
                        <div 
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-orange-500 w-3' : 'bg-white/20'}`}
                        />
                      ))}
                    </div>

                    <button 
                      onClick={handleNext}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-white/20 text-white/50 hover:text-white transition-all backdrop-blur-md border border-white/10"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
            </div>
            
            {/* Right: Info & Prompt Section */}
            {showTemplateInfo && template && (
              <div className={`flex flex-col items-start animate-in slide-in-from-right-10 duration-700 delay-150 overflow-hidden w-full md:w-[450px] mt-auto`}>
                  <div className={`mb-4 md:mb-8`}>
                      <h2 className={`font-bold text-white mb-2 md:mb-3 tracking-tight leading-tight text-4xl md:text-5xl`}>
                          {getLocalized(template.name, language)}
                      </h2>
                      {template.author && (
                        <div className="mb-4 opacity-70">
                          <span className="text-sm font-bold text-white/90 tracking-wide">{template.author}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 opacity-80">
                          {(template.tags || []).map(tag => (
                              <span key={tag} className={`px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[10px] md:text-[11px] font-bold tracking-wider uppercase border border-white/20 bg-white/5 text-white`}>
                                  {displayTag(tag)}
                              </span>
                          ))}
                      </div>
                  </div>

                  <div className={`w-full mb-6 md:mb-10 flex-1 overflow-hidden flex flex-col`}>
                      <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Content</h3>
                          <div className="h-px flex-1 bg-white/5"></div>
                      </div>
                      <div className={`text-white/80 leading-relaxed whitespace-pre-wrap font-medium overflow-y-auto custom-scrollbar-white pr-4 text-base md:text-lg max-h-[40vh]`}>
                          {getLocalized(template.content, language)}
                      </div>
                  </div>

                  {onUseTemplate && (
                    <div className={`w-full flex flex-col gap-4 mt-auto`}>
                        <Button
                            onClick={() => {
                                onUseTemplate(template);
                                onClose();
                            }}
                            variant="default"
                            className="w-full font-black shadow-2xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3 py-5 rounded-2xl text-lg hover:-translate-y-1"
                        >
                            <Sparkles className="h-4 w-4" />
                            {t('use_template') || '使用此模板'}
                        </Button>
                        
                        <div className="flex items-center justify-between px-2">
                          <p className="text-[10px] text-white/30 font-bold tracking-widest uppercase">
                              Prompt Fill Original
                          </p>
                          <div className="flex gap-4">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                          </div>
                        </div>
                    </div>
                  )}

                  {/* 自定义操作按钮 */}
                  {customActions && (
                    <div className={`w-full flex flex-col gap-4 mt-auto`}>
                        {customActions(currentImageUrl, currentIndex, allImages)}
                    </div>
                  )}
              </div>
            )}

            {/* Simple image view without template info */}
            {!showTemplateInfo && (
              <div className="flex flex-col items-center justify-center h-full text-white/20 gap-4 w-full">
                  <ImageIcon size={64} strokeWidth={1} />
                  <p className="text-lg font-bold tracking-widest uppercase">Image Preview</p>
              </div>
            )}
        </div>
    </div>
  );
});

ImagePopup.displayName = 'ImagePopup';

export default ImagePopup;