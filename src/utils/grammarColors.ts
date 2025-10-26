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
    if (g.includes('명사')) return 'bg-blue-500 border-4 border-blue-600';
    if (g.includes('동사')) return 'bg-green-500 border-4 border-green-600';
    if (g.includes('형용사')) return 'bg-amber-500 border-4 border-amber-600';
    if (g.includes('부사')) return 'bg-orange-500 border-4 border-orange-600';
    if (g.includes('전치사')) return 'bg-cyan-500 border-4 border-cyan-600';
    if (g.includes('접속사')) return 'bg-pink-500 border-4 border-pink-600';
    if (g.includes('대명사')) return 'bg-indigo-500 border-4 border-indigo-600';
    if (g.includes('관사')) return 'bg-teal-500 border-4 border-teal-600';
    if (g.includes('감탄사')) return 'bg-rose-500 border-4 border-rose-600';
    return 'bg-gray-700 border-4 border-gray-800';
  } else {
    // Light mode: -400 shade background, -600 shade border
    if (g.includes('명사')) return 'bg-blue-400 border-4 border-blue-600';
    if (g.includes('동사')) return 'bg-green-400 border-4 border-green-600';
    if (g.includes('형용사')) return 'bg-amber-400 border-4 border-amber-600';
    if (g.includes('부사')) return 'bg-orange-400 border-4 border-orange-600';
    if (g.includes('전치사')) return 'bg-cyan-400 border-4 border-cyan-600';
    if (g.includes('접속사')) return 'bg-pink-400 border-4 border-pink-600';
    if (g.includes('대명사')) return 'bg-indigo-400 border-4 border-indigo-600';
    if (g.includes('관사')) return 'bg-teal-400 border-4 border-teal-600';
    if (g.includes('감탄사')) return 'bg-rose-400 border-4 border-rose-600';
    return 'bg-gray-200 border-4 border-gray-400';
  }
}
