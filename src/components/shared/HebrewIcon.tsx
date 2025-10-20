import React from 'react';
import { BereshitIcon, ElohimIcon, BaraIcon, OrIcon, HebrewIcons, type HebrewWord, type IconProps } from '../icons';

interface HebrewIconProps extends IconProps {
  word: string;
  fallback?: string; // fallback emoji
}

const HebrewIcon: React.FC<HebrewIconProps> = ({ 
  word, 
  size = 32, 
  className = '', 
  color = 'currentColor',
  fallback = '📜'
}) => {
  // 커스텀 아이콘이 있는지 확인
  const hasCustomIcon = word in HebrewIcons;
  
  if (hasCustomIcon) {
    const iconName = HebrewIcons[word as HebrewWord];
    
    // 동적으로 컴포넌트 렌더링
    switch (iconName) {
      case 'BereshitIcon':
        return (
          <BereshitIcon 
            size={size} 
            className={className} 
            color={color} 
          />
        );
      case 'ElohimIcon':
        return (
          <ElohimIcon 
            size={size} 
            className={className} 
            color={color} 
          />
        );
      case 'BaraIcon':
        return (
          <BaraIcon 
            size={size} 
            className={className} 
            color={color} 
          />
        );
      case 'OrIcon':
        return (
          <OrIcon 
            size={size} 
            className={className} 
            color={color} 
          />
        );
      default:
        break;
    }
  }
  
  // 커스텀 아이콘이 없으면 fallback 이모지 사용
  return (
    <span 
      style={{
        fontSize: `${size}px`,
        lineHeight: 1,
        display: 'inline-block',
        fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji',
      }}
      className={className}
      role="img"
      aria-label={word}
    >
      {fallback}
    </span>
  );
};

export default HebrewIcon;