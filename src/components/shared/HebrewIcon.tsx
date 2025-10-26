import React, { useId, useMemo, useState } from 'react';
import { BereshitIcon, ElohimIcon, BaraIcon, OrIcon, HebrewIcons, type HebrewWord, type IconProps } from '../icons';
import { FileText } from 'lucide-react';

interface HebrewIconProps extends IconProps {
  word: string;
  iconSvg?: string; // 레거시 SVG 코드 (fallback)
  iconUrl?: string; // ✨ JPG 이미지 URL (우선순위 1)
}

const HebrewIcon: React.FC<HebrewIconProps> = ({
  word,
  iconSvg,
  iconUrl,  // ✨ 새 prop 추가
  size = 32,
  className = '',
  color = 'currentColor'
}) => {
  const [imageError, setImageError] = useState(false);
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 우선순위 1: JPG 이미지 (iconUrl)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (iconUrl && !imageError) {
    return (
      <img
        src={iconUrl}
        alt={word}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
        loading="lazy"
        onError={() => {
          console.warn(`[HebrewIcon] Image load failed for ${word}, using SVG fallback`);
          setImageError(true);
        }}
      />
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 우선순위 2: SVG (레거시 fallback)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // React 18 useId: SSR/Hydration safe, deterministic
  const reactId = useId();

  // Generate unique SVG with namespaced IDs to prevent gradient collisions
  const uniqueSvg = useMemo(() => {
    if (!iconSvg || iconSvg.trim().length === 0) {
      console.log(`[HebrewIcon] No SVG for word: ${word}, iconSvg:`, iconSvg);
      return null;
    }

    // Generate unique prefix based on word + React stable ID (not Math.random()!)
    const uniqueId = `${word.replace(/[^a-zA-Z0-9]/g, '')}-${reactId.replace(/:/g, '-')}`;

    // Replace all id="..." with id="uniqueId-..."
    let processedSvg = iconSvg.replace(/id="([^"]+)"/g, `id="${uniqueId}-$1"`);

    // Replace all url(#...) with url(#uniqueId-...)
    processedSvg = processedSvg.replace(/url\(#([^)]+)\)/g, `url(#${uniqueId}-$1)`);

    console.log(`[HebrewIcon] ✅ SVG generated for word: ${word}, length: ${processedSvg.length}`);
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
          imageRendering: '-webkit-optimize-contrast',
          shapeRendering: 'geometricPrecision',
          textRendering: 'geometricPrecision',
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

  // 기본 SVG 아이콘 사용 (이모지 대신)
  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <FileText
        size={size * 0.8}
        color={color}
        strokeWidth={1.5}
      />
    </div>
  );
};

export default HebrewIcon;