import React, { useState, useEffect, useMemo } from 'react';

/**
 * 通用瀑布流布局组件
 * @param {Array} items - 需要渲染的数据数组
 * @param {Function} renderItem - 渲染每个数据项的函数 (item, index) => ReactNode
 * @param {String} masonryStyleKey - 布局风格 ('poster', 'classic', 'compact', 'list')，默认 'classic'
 * @param {Number} gap - 自定义间距（可选，如果设置将覆盖风格默认值）
 * @param {String} className - 容器的类名
 */
export const MasonryGrid = ({ 
  items, 
  renderItem, 
  masonryStyleKey = 'classic',
  gap,
  className = ""
}) => {
  const [columnCount, setColumnCount] = useState(1);
  const [columnGap, setColumnGap] = useState(20);

  // 响应式逻辑：根据屏幕宽度和风格决定列数和间距
  useEffect(() => {
    const getColumnInfo = () => {
      const width = window.innerWidth;
      let count = 1;
      let defaultGap = 20;

      if (masonryStyleKey === 'poster') {
        count = width >= 1280 ? 3 : (width >= 640 ? 2 : 1);
        defaultGap = 20;
      } else if (masonryStyleKey === 'compact') {
        count = width >= 1280 ? 5 : (width >= 1024 ? 4 : (width >= 640 ? 3 : 2));
        defaultGap = 12;
      } else if (masonryStyleKey === 'list') {
        count = 1;
        defaultGap = 16;
      } else {
        // default 'classic' or 'minimal'
        // 调整了这里的大屏逻辑以适应历史记录页面的全屏展示
        count = width >= 1440 ? 5 : (width >= 1280 ? 4 : (width >= 1024 ? 3 : (width >= 640 ? 2 : 1)));
        defaultGap = width < 768 ? 16 : 24;
      }

      return { count, gap: gap !== undefined ? gap : defaultGap };
    };

    const handleResize = () => {
      const info = getColumnInfo();
      setColumnCount(info.count);
      setColumnGap(info.gap);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [masonryStyleKey, gap]);

  // 将 items 分配到各列中
  const columns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => []);
    items.forEach((item, index) => {
      cols[index % columnCount].push(item);
    });
    return cols;
  }, [items, columnCount]);

  // 如果是 List 模式，直接渲染单列
  if (masonryStyleKey === 'list') {
    return (
      <div className={`flex flex-col w-full ${className}`} style={{ gap: `${columnGap}px` }}>
        {items.map((item, index) => renderItem(item, index))}
      </div>
    );
  }

  return (
    <div className={`flex w-full ${className}`} style={{ gap: `${columnGap}px` }}>
      {columns.map((colItems, colIndex) => (
        <div 
          key={colIndex} 
          className="flex-1 flex flex-col" 
          style={{ gap: `${columnGap}px` }}
        >
          {colItems.map((item) => renderItem(item))}
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid