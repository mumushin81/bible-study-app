import React, { useId, useMemo } from 'react';
import { BereshitIcon, ElohimIcon, BaraIcon, OrIcon, HebrewIcons, type HebrewWord, type IconProps } from '../icons';

interface HebrewIconProps extends IconProps {
  word: string;
  iconSvg?: string; // 커스텀 SVG 코드
  fallback?: string; // fallback emoji
}

const HebrewIcon: React.FC<HebrewIconProps> = ({
  word,
  iconSvg,
  size = 32,
  className = '',
  color = 'currentColor',
  fallback = '📜'
}) => {
  // React 18 useId: SSR/Hydration safe, deterministic
  const reactId = useId();

  // Generate unique SVG with namespaced IDs to prevent gradient collisions
  const uniqueSvg = useMemo(() => {
    if (!iconSvg || iconSvg.trim().length === 0) return null;

    // Generate unique prefix based on word + React stable ID (not Math.random()!)
    const uniqueId = `${word.replace(/[^a-zA-Z0-9]/g, '')}-${reactId.replace(/:/g, '-')}`;

    // Replace all id="..." with id="uniqueId-..."
    let processedSvg = iconSvg.replace(/id="([^"]+)"/g, `id="${uniqueId}-$1"`);

    // Replace all url(#...) with url(#uniqueId-...)
    processedSvg = processedSvg.replace(/url\(#([^)]+)\)/g, `url(#${uniqueId}-$1)`);

    return processedSvg;
  }, [iconSvg, word, reactId]);

  // 1. iconSvg가 있으면 SVG 렌더링 (최우선)
  if (uniqueSvg) {
    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'inline-block',
        }}
        dangerouslySetInnerHTML={{ __html: uniqueSvg }}
      />
    );
  }

  // 2. 커스텀 아이콘이 있는지 확인 (레거시 지원)
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