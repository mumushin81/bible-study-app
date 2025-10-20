import React from 'react';

// 기존 단색 아이콘
export { default as BereshitIcon } from './BereshitIcon';
export { default as ElohimIcon } from './ElohimIcon';
export { default as BaraIcon } from './BaraIcon';
export { default as OrIcon } from './OrIcon';

// 화려한 컬러풀 아이콘 - import
import BereshitIconColorful from './BereshitIconColorful';
import ElohimIconColorful from './ElohimIconColorful';
import BaraIconColorful from './BaraIconColorful';
import NachashIconColorful from './NachashIconColorful';

// 화려한 컬러풀 아이콘 - export
export { BereshitIconColorful, ElohimIconColorful, BaraIconColorful, NachashIconColorful };

export interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

export interface ColorfulIconProps {
  size?: number;
  className?: string;
}

// 히브리어 단어 타입
export type HebrewWord = 'בְּרֵאשִׁית' | 'אֱלֹהִים' | 'בָּרָא' | 'אוֹר';

// 기존 단색 아이콘 매핑 (레거시 호환)
export const HebrewIcons: Record<string, string> = {
  'בְּרֵאשִׁית': 'BereshitIcon',
  'אֱלֹהִים': 'ElohimIcon',
  'בָּרָא': 'BaraIcon',
  'אוֹר': 'OrIcon',
} as const;

// 아이콘 매핑 객체 (컬러풀 버전)
export const HebrewIconsColorful = {
  'בְּרֵאשִׁית': BereshitIconColorful,
  'אֱלֹהִים': ElohimIconColorful,
  'בָּרָא': BaraIconColorful,
  'נָחָשׁ': NachashIconColorful,
} as const;

// 히브리어 단어에 따라 컬러풀 아이콘 컴포넌트를 반환하는 함수
export function getColorfulIconForWord(hebrew: string): React.FC<ColorfulIconProps> | null {
  // 정확한 매칭
  if (hebrew in HebrewIconsColorful) {
    return HebrewIconsColorful[hebrew as keyof typeof HebrewIconsColorful];
  }

  // 부분 매칭 (니쿠드나 마케프가 다를 수 있음)
  const normalizedHebrew = hebrew.replace(/[\u0591-\u05C7]/g, ''); // 니쿠드 제거

  for (const [key, icon] of Object.entries(HebrewIconsColorful)) {
    const normalizedKey = key.replace(/[\u0591-\u05C7]/g, '');
    if (normalizedHebrew.includes(normalizedKey) || normalizedKey.includes(normalizedHebrew)) {
      return icon as React.FC<ColorfulIconProps>;
    }
  }

  return null;
}