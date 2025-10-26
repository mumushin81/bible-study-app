/**
 * Grammar-based colors unified configuration
 */

export interface GrammarColors {
  light: {
    bg: string;
    text: string;
  };
  dark: {
    bg: string;
    text: string;
  };
}

// Unified grammar color configuration
const GRAMMAR_COLOR_MAP: Record<string, { color: string; lightShade: string; darkShade: string }> = {
  '명사': { color: 'blue', lightShade: '400', darkShade: '500' },
  '동사': { color: 'green', lightShade: '400', darkShade: '500' },
  '형용사': { color: 'amber', lightShade: '400', darkShade: '500' },
  '부사': { color: 'orange', lightShade: '400', darkShade: '500' },
  '전치사': { color: 'cyan', lightShade: '400', darkShade: '500' },
  '접속사': { color: 'pink', lightShade: '400', darkShade: '500' },
  '대명사': { color: 'indigo', lightShade: '400', darkShade: '500' },
  '관사': { color: 'teal', lightShade: '400', darkShade: '500' },
  '감탄사': { color: 'rose', lightShade: '400', darkShade: '500' },
};

const DEFAULT_COLOR = { color: 'gray', lightShade: '200', darkShade: '700' };

/**
 * Get grammar color configuration
 */
function getGrammarColorConfig(grammar: string) {
  const g = grammar.toLowerCase();
  for (const [key, value] of Object.entries(GRAMMAR_COLOR_MAP)) {
    if (g.includes(key)) return value;
  }
  return DEFAULT_COLOR;
}

/**
 * Get grammar-based colors for flashcard badges
 */
export function getGrammarColors(grammar: string): GrammarColors {
  const config = getGrammarColorConfig(grammar);
  const { color } = config;

  return {
    light: { bg: `bg-${color}-100`, text: `text-${color}-700` },
    dark: { bg: `bg-${color}-900/30`, text: `text-${color}-300` }
  };
}

/**
 * Get grammar-based card background (full card, solid color)
 * Using hardcoded class names for Tailwind CSS build-time detection
 */
export function getGrammarCardBackground(grammar: string, darkMode: boolean): string {
  const g = grammar.toLowerCase();

  if (darkMode) {
    // Dark mode: -500 shade
    if (g.includes('명사')) return 'bg-blue-500';
    if (g.includes('동사')) return 'bg-green-500';
    if (g.includes('형용사')) return 'bg-amber-500';
    if (g.includes('부사')) return 'bg-orange-500';
    if (g.includes('전치사')) return 'bg-cyan-500';
    if (g.includes('접속사')) return 'bg-pink-500';
    if (g.includes('대명사')) return 'bg-indigo-500';
    if (g.includes('관사')) return 'bg-teal-500';
    if (g.includes('감탄사')) return 'bg-rose-500';
    return 'bg-gray-700';
  } else {
    // Light mode: -400 shade
    if (g.includes('명사')) return 'bg-blue-400';
    if (g.includes('동사')) return 'bg-green-400';
    if (g.includes('형용사')) return 'bg-amber-400';
    if (g.includes('부사')) return 'bg-orange-400';
    if (g.includes('전치사')) return 'bg-cyan-400';
    if (g.includes('접속사')) return 'bg-pink-400';
    if (g.includes('대명사')) return 'bg-indigo-400';
    if (g.includes('관사')) return 'bg-teal-400';
    if (g.includes('감탄사')) return 'bg-rose-400';
    return 'bg-gray-200';
  }
}

/**
 * Get grammar-based glowing border effect (box-shadow)
 */
export function getGrammarGlowEffect(grammar: string, darkMode: boolean): string {
  const g = grammar.toLowerCase();

  if (darkMode) {
    // Dark mode: glowing effect with -300 shade (brighter)
    if (g.includes('명사')) return '0 0 0 1px rgb(147, 197, 253), 0 0 8px rgba(147, 197, 253, 0.5)';
    if (g.includes('동사')) return '0 0 0 1px rgb(134, 239, 172), 0 0 8px rgba(134, 239, 172, 0.5)';
    if (g.includes('형용사')) return '0 0 0 1px rgb(252, 211, 77), 0 0 8px rgba(252, 211, 77, 0.5)';
    if (g.includes('부사')) return '0 0 0 1px rgb(253, 186, 116), 0 0 8px rgba(253, 186, 116, 0.5)';
    if (g.includes('전치사')) return '0 0 0 1px rgb(103, 232, 249), 0 0 8px rgba(103, 232, 249, 0.5)';
    if (g.includes('접속사')) return '0 0 0 1px rgb(249, 168, 212), 0 0 8px rgba(249, 168, 212, 0.5)';
    if (g.includes('대명사')) return '0 0 0 1px rgb(165, 180, 252), 0 0 8px rgba(165, 180, 252, 0.5)';
    if (g.includes('관사')) return '0 0 0 1px rgb(94, 234, 212), 0 0 8px rgba(94, 234, 212, 0.5)';
    if (g.includes('감탄사')) return '0 0 0 1px rgb(253, 164, 175), 0 0 8px rgba(253, 164, 175, 0.5)';
    return '0 0 0 1px rgb(229, 231, 235), 0 0 8px rgba(229, 231, 235, 0.5)';
  } else {
    // Light mode: subtle glow with -600 shade (darker for contrast)
    if (g.includes('명사')) return '0 0 0 1px rgb(37, 99, 235), 0 0 8px rgba(37, 99, 235, 0.3)';
    if (g.includes('동사')) return '0 0 0 1px rgb(22, 163, 74), 0 0 8px rgba(22, 163, 74, 0.3)';
    if (g.includes('형용사')) return '0 0 0 1px rgb(217, 119, 6), 0 0 8px rgba(217, 119, 6, 0.3)';
    if (g.includes('부사')) return '0 0 0 1px rgb(234, 88, 12), 0 0 8px rgba(234, 88, 12, 0.3)';
    if (g.includes('전치사')) return '0 0 0 1px rgb(8, 145, 178), 0 0 8px rgba(8, 145, 178, 0.3)';
    if (g.includes('접속사')) return '0 0 0 1px rgb(219, 39, 119), 0 0 8px rgba(219, 39, 119, 0.3)';
    if (g.includes('대명사')) return '0 0 0 1px rgb(79, 70, 229), 0 0 8px rgba(79, 70, 229, 0.3)';
    if (g.includes('관사')) return '0 0 0 1px rgb(13, 148, 136), 0 0 8px rgba(13, 148, 136, 0.3)';
    if (g.includes('감탄사')) return '0 0 0 1px rgb(225, 29, 72), 0 0 8px rgba(225, 29, 72, 0.3)';
    return '0 0 0 1px rgb(156, 163, 175), 0 0 8px rgba(156, 163, 175, 0.3)';
  }
}
