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
 * Get grammar-based border color with transparency (darker)
 */
export function getGrammarBorderColor(grammar: string, darkMode: boolean): string {
  const config = getGrammarColorConfig(grammar);
  const { color, lightShade, darkShade } = config;

  if (darkMode) {
    return `border-${color}-${darkShade}/80`;
  } else {
    return `border-${color}-${lightShade}/90`;
  }
}

/**
 * Get grammar-based background color with specified opacity
 */
export function getGrammarBackground(grammar: string, darkMode: boolean, opacity: number = 70): string {
  const config = getGrammarColorConfig(grammar);
  const { color, lightShade, darkShade } = config;

  if (darkMode) {
    return `bg-${color}-${darkShade}/${opacity}`;
  } else {
    return `bg-${color}-${lightShade}/${opacity}`;
  }
}

/**
 * Get grammar-based colors for flashcard box backgrounds
 */
export function getGrammarCardBackground(grammar: string, darkMode: boolean): string {
  const baseBackground = darkMode
    ? 'bg-gradient-to-br from-gray-800/20 to-gray-900/20'
    : 'bg-gradient-to-br from-white/20 to-gray-50/20';

  const borderColor = getGrammarBorderColor(grammar, darkMode);

  return `${baseBackground} ${borderColor}`;
}

/**
 * Get grammar-based bottom content background (50% opacity)
 */
export function getGrammarBottomBackground(grammar: string | undefined, darkMode: boolean): string {
  if (!grammar) {
    return darkMode ? 'bg-gray-900/50' : 'bg-white/50';
  }
  return getGrammarBackground(grammar, darkMode, 50);
}

/**
 * Get grammar-based top content background (70% opacity)
 */
export function getGrammarTopBackground(grammar: string | undefined, darkMode: boolean): string {
  if (!grammar) {
    return darkMode ? 'bg-gray-800/70' : 'bg-gray-50/70';
  }
  return getGrammarBackground(grammar, darkMode, 70);
}

/**
 * Get grammar-based top area border (for image area outline)
 */
export function getGrammarTopBorder(grammar: string | undefined, darkMode: boolean): string {
  if (!grammar) {
    return darkMode ? 'border-b-4 border-gray-700/80' : 'border-b-4 border-gray-200/90';
  }
  return `border-b-4 ${getGrammarBorderColor(grammar, darkMode)}`;
}
