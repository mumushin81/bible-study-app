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
 */
export function getGrammarCardBackground(grammar: string, darkMode: boolean): string {
  const config = getGrammarColorConfig(grammar);
  const { color, lightShade, darkShade } = config;

  if (darkMode) {
    return `bg-${color}-${darkShade}`;
  } else {
    return `bg-${color}-${lightShade}`;
  }
}
