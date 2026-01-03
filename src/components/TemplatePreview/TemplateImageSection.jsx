import React, { useState, useEffect, useMemo } from 'react';
import { ImageIcon, ArrowUpRight, Upload, Globe, RotateCcw, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * 模板图片区域组件
 * 负责显示和编辑模板图片
 */
export const TemplateImageSection = ({
  activeTemplate,
  currentImageEditIndex,
  setCurrentImageEditIndex,
  setImageUpdateMode,
  setShowImageUrlInput,
  setZoomedImage,
  handleResetImage,
  fileInputRef,
  t,
  isDarkMode
}) => {
  const [editImageIndex, setEditImageIndex] = useState(0);

  const allImages = useMemo(() => {
    if (activeTemplate?.imageUrls && Array.isArray(activeTemplate.imageUrls) && activeTemplate.imageUrls.length > 0) {
      return activeTemplate.imageUrls;
    }
    return activeTemplate?.imageUrl ? [activeTemplate.imageUrl] : [];
  }, [activeTemplate?.imageUrls, activeTemplate?.imageUrl]);

  const currentImageUrl = allImages[editImageIndex] || activeTemplate?.imageUrl;

  // 当模板切换或图片索引切换时，同步编辑索引给父组件
  useEffect(() => {
    setCurrentImageEditIndex(editImageIndex);
  }, [editImageIndex, setCurrentImageEditIndex]);

  useEffect(() => {
    setEditImageIndex(0);
  }, [activeTemplate?.id]);

  return (
    <div 
      className="w-full md:w-auto mt-4 md:mt-0 relative md:-mr-[80px] md:-mt-[50px] z-20 flex-shrink-0"
    >
      <div 
        className={`p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-md md:shadow-lg transform md:rotate-2 border transition-all duration-300 hover:rotate-0 hover:scale-105 group/image w-full md:w-auto ${isDarkMode ? 'bg-[#2A2726] border-white/5' : 'bg-white border-gray-100/50'}`}
      >
        <div className={`relative overflow-hidden rounded-md md:rounded-lg flex items-center justify-center min-w-[150px] min-h-[150px] ${!currentImageUrl ? 'w-full md:w-[400px] h-[400px]' : ''} ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'}`}>
          {currentImageUrl ? (
            <img 
              key={currentImageUrl}
              src={currentImageUrl} 
              referrerPolicy="no-referrer"
              alt="Template Preview" 
              className="w-full md:w-auto md:max-w-[400px] md:max-h-[400px] h-auto object-contain block animate-in fade-in duration-300" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.style.backgroundColor = isDarkMode ? '#1a1a1a' : '#f1f5f9';
                const span = document.createElement('span');
                span.innerText = 'Image Failed';
                span.style.color = isDarkMode ? '#333' : '#cbd5e1';
                span.style.fontSize = '12px';
                e.target.parentElement.appendChild(span);
              }}
            />
          ) : (
            <div 
              className={`flex flex-col items-center justify-center p-4 text-center w-full h-full relative group/empty ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ImageIcon size={48} strokeWidth={1.5} className={isDarkMode ? 'text-gray-700' : 'text-gray-300'} />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none group-hover/empty:opacity-100 group-hover/empty:pointer-events-auto transition-opacity">
                <div className={`border rounded-lg shadow-lg p-3 flex flex-col gap-2 min-w-[180px] ${isDarkMode ? 'bg-[#1a1a1a]/95 border-white/10' : 'bg-white/95 border border-gray-200'}`}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-2 text-sm text-left bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all flex items-center gap-2 justify-center"
                  >
                    <ImageIcon size={16} />
                    {t('upload_image')}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className={`absolute inset-0 bg-black/0 ${currentImageUrl ? 'group-hover/image:bg-black/20' : 'group-hover/image:bg-black/5'} transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover/image:opacity-100`}>
            {currentImageUrl && (
              <button 
                onClick={(e) => { e.stopPropagation(); setZoomedImage(currentImageUrl); }}
                className={`p-2.5 rounded-full transition-all shadow-lg ${isDarkMode ? 'bg-black/60 text-gray-300 hover:bg-black hover:text-orange-400' : 'bg-white/90 text-gray-700 hover:bg-white hover:text-orange-600'}`}
                title="查看大图"
              >
                <ArrowUpRight size={18} />
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); setImageUpdateMode('replace'); fileInputRef.current?.click(); }}
              className={`p-2.5 rounded-full transition-all shadow-lg ${isDarkMode ? 'bg-black/60 text-gray-300 hover:bg-black hover:text-orange-400' : 'bg-white/90 text-gray-700 hover:bg-white hover:text-orange-600'}`}
              title="更换当前图片(本地)"
            >
              <Upload size={18} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setImageUpdateMode('replace'); setShowImageUrlInput(true); }}
              className={`p-2.5 rounded-full transition-all shadow-lg ${isDarkMode ? 'bg-black/60 text-gray-300 hover:bg-black hover:text-orange-400' : 'bg-white/90 text-gray-700 hover:bg-white hover:text-orange-600'}`}
              title="更换当前图片(URL)"
            >
              <Globe size={18} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleResetImage(); }}
              className={`p-2.5 rounded-full transition-all shadow-lg ${isDarkMode ? 'bg-black/60 text-gray-300 hover:bg-black hover:text-orange-400' : 'bg-white/90 text-gray-700 hover:bg-white hover:text-orange-600'}`}
              title="恢复默认图片"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Navigation & Indicator for Edit Mode */}
          {allImages.length > 1 && (
            <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30 backdrop-blur-md px-2 py-1 rounded-full border ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-black/20 border-white/10'}`}>
              <button 
                onClick={(e) => { e.stopPropagation(); setEditImageIndex((editImageIndex - 1 + allImages.length) % allImages.length); }}
                className="text-white/60 hover:text-white transition-all"
              >
                <ChevronLeft size={12} />
              </button>
              
              {/* Dots Indicator */}
              <div className="flex gap-1">
                {allImages.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`w-1 h-1 rounded-full transition-all ${idx === editImageIndex ? 'bg-orange-500 w-2' : 'bg-white/40'}`}
                  />
                ))}
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); setEditImageIndex((editImageIndex + 1) % allImages.length); }}
                className="text-white/60 hover:text-white transition-all"
              >
                <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>
        
        {/* Add Image Button below the image box */}
        <div className="mt-2 flex gap-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setImageUpdateMode('add');
              fileInputRef.current?.click();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-500 hover:text-orange-400 border-white/5' : 'bg-gray-50 hover:bg-orange-50 text-gray-500 hover:text-orange-600 border-gray-100'}`}
          >
            <Plus size={14} />
            本地图片
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setImageUpdateMode('add');
              setShowImageUrlInput(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-500 hover:text-orange-400 border-white/5' : 'bg-gray-50 hover:bg-orange-50 text-gray-500 hover:text-orange-600 border-gray-100'}`}
          >
            <Globe size={14} />
            网络链接
          </button>
        </div>
      </div>
    </div>
  );
};

