import React, { useId, useMemo, useState } from 'react';
import { BereshitIcon, ElohimIcon, BaraIcon, OrIcon, HebrewIcons, type HebrewWord, type IconProps } from '../icons';
import { FileText } from 'lucide-react';

interface HebrewIconProps extends IconProps {
  word: string;
  iconSvg?: string; // 레거시 SVG 코드 (fallback)
  iconUrl?: string; // ✨ JPG 이미지 URL (우선순위 1)
}

/**
 * FLUX 이미지 검증 함수
 * - Supabase Storage의 FLUX 이미지만 허용
 * - word_{32-char-md5-hash}.jpg 형식만 허용
 */
function isValidFluxImage(url: string): boolean {
  if (!url) return false;

  // Supabase Storage URL 패턴 확인
  const supabasePattern = /supabase\.co\/storage\/v1\/object\/public\/hebrew-icons\/icons\/word_[a-f0-9]{32}\.jpg$/;
  return supabasePattern.test(url);
}

const HebrewIcon: React.FC<HebrewIconProps> = ({
  word,
  iconSvg,
  iconUrl,  // ✨ 새 prop 추가
  size = 32,
  className = '',
  color = 'currentColor'
}) => {
  // ⚠️ Hooks는 항상 최상단에서 호출해야 함 (조건문 밖에서)
  const [imageError, setImageError] = useState(false);
  const [isInvalidFormat, setIsInvalidFormat] = useState(false);
  const reactId = useId();

  // FLUX 이미지 형식 검증
  React.useEffect(() => {
    if (iconUrl && !isValidFluxImage(iconUrl)) {
      console.warn(`[HebrewIcon] ⚠️ Invalid FLUX image format: ${iconUrl}`);
      setIsInvalidFormat(true);
    } else {
      setIsInvalidFormat(false);
    }
  }, [iconUrl]);

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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 검증: FLUX 이미지 형식만 허용
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (iconUrl && isInvalidFormat) {
    console.error(`[HebrewIcon] 🚫 Non-FLUX image rejected for ${word}: ${iconUrl}`);
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          padding: '16px',
          color: '#856404',
          fontSize: '14px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          🚫 FLUX 이미지 아님
        </div>
        <div style={{ fontSize: '12px', wordBreak: 'break-all' }}>
          {word}
        </div>
        <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.7 }}>
          FLUX 형식만 허용됩니다
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 우선순위 1: JPG 이미지 (iconUrl)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log(`[HebrewIcon] ${word}: iconUrl=${iconUrl ? 'EXISTS' : 'NULL'}, imageError=${imageError}`);

  if (iconUrl && !imageError) {
    console.log(`[HebrewIcon] 🎨 Rendering JPG for ${word}: ${iconUrl}`);
    return (
      <img
        src={iconUrl}
        alt={word}
        className={className}
        style={{
          width: '100%',
          height: 'auto',
          aspectRatio: '16/9',
          objectFit: 'contain',
        }}
        loading="lazy"
        onError={() => {
          console.warn(`[HebrewIcon] ❌ Image load failed for ${word}, using SVG fallback`);
          setImageError(true);
        }}
      />
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 에러 표시: JPG 로딩 실패
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (iconUrl && imageError) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fee',
          border: '2px solid #f88',
          borderRadius: '8px',
          padding: '16px',
          color: '#c00',
          fontSize: '14px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          ❌ 이미지 로딩 실패
        </div>
        <div style={{ fontSize: '12px', wordBreak: 'break-all' }}>
          {word}
        </div>
        <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.7 }}>
          URL: {iconUrl.substring(0, 50)}...
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 우선순위 2: SVG (레거시 fallback)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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