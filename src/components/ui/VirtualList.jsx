import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

const VirtualList = ({ 
  items, 
  height, 
  itemHeight, 
  renderItem, 
  className 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const totalHeight = items.length * itemHeight;
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 5); // Buffer top
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + height) / itemHeight) + 5 // Buffer bottom
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%',
      },
    }));
  }, [scrollTop, items, height, itemHeight]);

  const onScroll = (e) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-y-auto contain-strict", className)}
      style={{ height }}
      onScroll={onScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualList;