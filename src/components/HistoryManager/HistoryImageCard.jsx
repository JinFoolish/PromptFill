import React, { useState, useEffect } from 'react';
import { Trash2, Eye } from 'lucide-react';
import storageAdapter from '../../utils/storage';

/**
 * 历史记录图片卡片组件
 */
export const HistoryImageCard = ({ record, onClick, onDelete, isDarkMode }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let url = null;
    const loadImage = async () => {
      try {
        const { blob } = await storageAdapter.getImage(record.id);
        url = URL.createObjectURL(blob);
        setImageUrl(url);
      } catch (err) {
        setImageError(true);
      }
    };
    loadImage();
    return () => { 
      if (url) URL.revokeObjectURL(url); 
    };
  }, [record.id]);

  return (
    <div 
      className="relative group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      onClick={onClick}
    >
      {/* Image */}
      <div className="w-full aspect-auto relative bg-gray-100 dark:bg-gray-700">
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl} 
            alt="" 
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" 
            onError={() => setImageError(true)} 
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center">
            <Eye size={24} className="text-gray-400" />
          </div>
        )}
        
        {/* Delete Button - Top Right Corner */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-3 right-3 p-1 text-white/80 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 hover:scale-110"
          title="删除"
        >
          <Trash2 size={18} />
        </button>
        
        {/* Hover Overlay with Model Name */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end pointer-events-none z-20">
          <div className="w-full p-3">
            <div className="text-white text-sm font-medium">
              {record.provider && record.model ? `${record.provider} / ${record.model}` : record.model || record.provider || 'Unknown Model'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

