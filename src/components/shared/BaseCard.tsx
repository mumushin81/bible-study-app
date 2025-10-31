import { ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';

export type CardColorScheme = 'blue' | 'emerald' | 'purple' | 'amber';

interface BaseCardProps extends Omit<MotionProps, 'children'> {
  children: ReactNode;
  colorScheme: CardColorScheme;
  testId?: string;
}

const colorSchemes: Record<CardColorScheme, { light: string; dark: string }> = {
  blue: {
    light: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-white border-blue-300',
    dark: 'dark:bg-gradient-to-br dark:from-blue-900/50 dark:to-cyan-900/30 dark:border-blue-400/30',
  },
  emerald: {
    light: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-emerald-300',
    dark: 'dark:bg-gradient-to-br dark:from-emerald-900/50 dark:to-teal-900/30 dark:border-emerald-400/30',
  },
  purple: {
    light: 'bg-gradient-to-br from-purple-50 via-pink-50 to-white border-purple-300',
    dark: 'dark:bg-gradient-to-br dark:from-purple-900/50 dark:to-pink-900/30 dark:border-purple-400/30',
  },
  amber: {
    light: 'bg-gradient-to-br from-amber-50 via-orange-50 to-white border-amber-300',
    dark: 'dark:bg-gradient-to-br dark:from-amber-900/50 dark:to-orange-900/30 dark:border-amber-400/30',
  },
};

/**
 * 카드의 기본 래퍼 컴포넌트
 * 그라데이션, 그림자, 호버 효과, 다크모드 스타일을 통일적으로 제공
 */
export function BaseCard({
  children,
  colorScheme,
  testId,
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 },
  transition = { duration: 0.5 },
  ...props
}: BaseCardProps) {
  const scheme = colorSchemes[colorScheme];

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      className={`
        rounded-3xl shadow-2xl p-8 mb-6 transition-all duration-300
        hover:-translate-y-2 hover:shadow-3xl border-2
        ${scheme.light} ${scheme.dark}
      `}
      data-testid={testId}
      {...props}
    >
      {children}
    </motion.div>
  );
}
