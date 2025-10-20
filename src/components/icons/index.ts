export { default as BereshitIcon } from './BereshitIcon';
export { default as ElohimIcon } from './ElohimIcon';
export { default as BaraIcon } from './BaraIcon';
export { default as OrIcon } from './OrIcon';

export interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

// 아이콘 매핑 객체
export const HebrewIcons = {
  'בְּרֵאשִׁית': 'BereshitIcon',
  'אֱלֹהִים': 'ElohimIcon',
  'בָּרָא': 'BaraIcon',
  'אוֹר': 'OrIcon',
} as const;

export type HebrewWord = keyof typeof HebrewIcons;