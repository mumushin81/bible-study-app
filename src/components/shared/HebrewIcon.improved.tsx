import React, { useMemo, useId } from 'react';
import { BereshitIcon, ElohimIcon, BaraIcon, OrIcon, HebrewIcons, type HebrewWord, type IconProps } from '../icons';

interface HebrewIconProps extends IconProps {
  word: string;
  iconSvg?: string; // 커스텀 SVG 코드
  fallback?: string; // fallback emoji
}

/**
 * HebrewIcon 컴포넌트 (개선 버전)
 *
 * 개선 사항:
 * 1. Math.random() → useId() 사용 (SSR-safe)
 * 2. url() 정규식에 공백 처리 추가
 * 3. 더 명확한 주석 추가
 */
const HebrewIcon: React.FC<HebrewIconProps> = ({
  word,
  iconSvg,
  size = 32,
  className = '',
  color = 'currentColor',
  fallback = '📜'
}) => {
  // React 18의 useId 훅 사용 (SSR-safe, hydration mismatch 방지)
  const reactId = useId();

  // Generate unique SVG with namespaced IDs to prevent gradient collisions
  const uniqueSvg = useMemo(() => {
    if (!iconSvg || iconSvg.trim().length === 0) return null;

    // React의 useId는 ":r1:", ":r2:" 같은 형식
    // 콜론(:)을 제거하여 유효한 CSS ID로 변환
    const uniqueId = reactId.replace(/:/g, '');

    // Replace all id="..." with id="uniqueId-..."
    // 모든 SVG 요소의 id 속성을 고유하게 변경
    let processedSvg = iconSvg.replace(/id="([^"]+)"/g, `id="${uniqueId}-$1"`);

    // Replace all url(#...) with url(#uniqueId-...)
    // gradient, filter 등의 참조도 함께 업데이트
    // 개선: \s*를 추가하여 공백이 있는 경우도 처리
    processedSvg = processedSvg.replace(/url\(\s*#([^)]+?)\s*\)/g, `url(#${uniqueId}-$1)`);

    return processedSvg;
  }, [iconSvg, reactId]); // reactId는 컴포넌트 생명주기 동안 일정하므로 안전

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
