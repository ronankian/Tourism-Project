import React from 'react';
import { SmartTickerDraggable } from 'react-smart-ticker';

const TextTicker = ({ 
  children, 
  speed = 60, 
  loop = true, 
  bounce = false,
  duration = null,
  marqueeDelay = 0,
  onMarqueeComplete = null,
  style = {},
  className = ""
}) => {
  return (
    <SmartTickerDraggable
      speed={speed}
      delay={marqueeDelay}
      iterations={loop ? "infinite" : 1}
      infiniteScrollView={true}
      autoFill={true}
      direction="left"
      pauseOnHover={true}
      disableDragging={false}
      disableSelect={false}
      style={style}
      containerStyle={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}
      className={`smart-ticker-container ${className}`}
    >
      {children}
    </SmartTickerDraggable>
  );
};

export default TextTicker;
