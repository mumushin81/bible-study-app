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

export interface GrammarColorValues {
  bg: string;
  text: string;
  border: string;
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
    // Dark mode: -500 shade with 90% opacity + thin border
    if (g.includes('명사')) return 'bg-blue-500/90 border border-blue-600';
    if (g.includes('동사')) return 'bg-green-500/90 border border-green-600';
    if (g.includes('형용사')) return 'bg-amber-500/90 border border-amber-600';
    if (g.includes('부사')) return 'bg-orange-500/90 border border-orange-600';
    if (g.includes('전치사')) return 'bg-cyan-500/90 border border-cyan-600';
    if (g.includes('접속사')) return 'bg-pink-500/90 border border-pink-600';
    if (g.includes('대명사')) return 'bg-indigo-500/90 border border-indigo-600';
    if (g.includes('관사')) return 'bg-teal-500/90 border border-teal-600';
    if (g.includes('감탄사')) return 'bg-rose-500/90 border border-rose-600';
    return 'bg-gray-700/90 border border-gray-800';
  } else {
    // Light mode: -400 shade with 90% opacity + thin border
    if (g.includes('명사')) return 'bg-blue-400/90 border border-blue-600';
    if (g.includes('동사')) return 'bg-green-400/90 border border-green-600';
    if (g.includes('형용사')) return 'bg-amber-400/90 border border-amber-600';
    if (g.includes('부사')) return 'bg-orange-400/90 border border-orange-600';
    if (g.includes('전치사')) return 'bg-cyan-400/90 border border-cyan-600';
    if (g.includes('접속사')) return 'bg-pink-400/90 border border-pink-600';
    if (g.includes('대명사')) return 'bg-indigo-400/90 border border-indigo-600';
    if (g.includes('관사')) return 'bg-teal-400/90 border border-teal-600';
    if (g.includes('감탄사')) return 'bg-rose-400/90 border border-rose-600';
    return 'bg-gray-200/90 border border-gray-400';
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

/**
 * Get grammar-based color values for inline styles
 * Returns actual hex color values instead of Tailwind classes
 */
export function getGrammarColorValues(grammar: string): GrammarColorValues {
  const g = grammar.toLowerCase();

  // Background colors (pastel shades)
  const bgColors: Record<string, string> = {
    '명사': '#DBEAFE',     // blue-100
    '동사': '#D1FAE5',     // green-100
    '형용사': '#FEF3C7',   // amber-100
    '부사': '#FFEDD5',     // orange-100
    '전치사': '#CFFAFE',   // cyan-100
    '접속사': '#FCE7F3',   // pink-100
    '대명사': '#E0E7FF',   // indigo-100
    '관사': '#CCFBF1',     // teal-100
    '감탄사': '#FFE4E6',   // rose-100
  };

  // Text colors (darker shades)
  const textColors: Record<string, string> = {
    '명사': '#1D4ED8',     // blue-700
    '동사': '#15803D',     // green-700
    '형용사': '#B45309',   // amber-700
    '부사': '#C2410C',     // orange-700
    '전치사': '#0E7490',   // cyan-700
    '접속사': '#BE185D',   // pink-700
    '대명사': '#4338CA',   // indigo-700
    '관사': '#0F766E',     // teal-700
    '감탄사': '#BE123C',   // rose-700
  };

  // Border colors (medium shades)
  const borderColors: Record<string, string> = {
    '명사': '#60A5FA',     // blue-400
    '동사': '#4ADE80',     // green-400
    '형용사': '#FBBF24',   // amber-400
    '부사': '#FB923C',     // orange-400
    '전치사': '#22D3EE',   // cyan-400
    '접속사': '#F472B6',   // pink-400
    '대명사': '#818CF8',   // indigo-400
    '관사': '#2DD4BF',     // teal-400
    '감탄사': '#FB7185',   // rose-400
  };

  for (const key of Object.keys(bgColors)) {
    if (g.includes(key)) {
      return {
        bg: bgColors[key],
        text: textColors[key],
        border: borderColors[key],
      };
    }
  }

  // Default gray colors
  return {
    bg: '#F3F4F6',     // gray-100
    text: '#374151',   // gray-700
    border: '#9CA3AF', // gray-400
  };
}
