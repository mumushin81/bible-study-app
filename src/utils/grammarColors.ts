/**
 * Get grammar-based colors for flashcard badges
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

export function getGrammarColors(grammar: string): GrammarColors {
  const g = grammar.toLowerCase();

  // 명사 - Blue
  if (g.includes('명사')) {
    return {
      light: { bg: 'bg-blue-100', text: 'text-blue-700' },
      dark: { bg: 'bg-blue-900/30', text: 'text-blue-300' }
    };
  }

  // 동사 - Green
  if (g.includes('동사')) {
    return {
      light: { bg: 'bg-green-100', text: 'text-green-700' },
      dark: { bg: 'bg-green-900/30', text: 'text-green-300' }
    };
  }

  // 형용사 - Yellow/Amber
  if (g.includes('형용사')) {
    return {
      light: { bg: 'bg-amber-100', text: 'text-amber-700' },
      dark: { bg: 'bg-amber-900/30', text: 'text-amber-300' }
    };
  }

  // 부사 - Orange
  if (g.includes('부사')) {
    return {
      light: { bg: 'bg-orange-100', text: 'text-orange-700' },
      dark: { bg: 'bg-orange-900/30', text: 'text-orange-300' }
    };
  }

  // 전치사 - Cyan
  if (g.includes('전치사')) {
    return {
      light: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
      dark: { bg: 'bg-cyan-900/30', text: 'text-cyan-300' }
    };
  }

  // 접속사 - Pink
  if (g.includes('접속사')) {
    return {
      light: { bg: 'bg-pink-100', text: 'text-pink-700' },
      dark: { bg: 'bg-pink-900/30', text: 'text-pink-300' }
    };
  }

  // 대명사 - Indigo
  if (g.includes('대명사')) {
    return {
      light: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
      dark: { bg: 'bg-indigo-900/30', text: 'text-indigo-300' }
    };
  }

  // 관사 - Teal
  if (g.includes('관사')) {
    return {
      light: { bg: 'bg-teal-100', text: 'text-teal-700' },
      dark: { bg: 'bg-teal-900/30', text: 'text-teal-300' }
    };
  }

  // 감탄사 - Rose
  if (g.includes('감탄사')) {
    return {
      light: { bg: 'bg-rose-100', text: 'text-rose-700' },
      dark: { bg: 'bg-rose-900/30', text: 'text-rose-300' }
    };
  }

  // Default - Purple
  return {
    light: { bg: 'bg-purple-100', text: 'text-purple-700' },
    dark: { bg: 'bg-purple-900/30', text: 'text-purple-300' }
  };
}

/**
 * Get grammar-based colors for flashcard box backgrounds
 */
export function getGrammarCardBackground(grammar: string, darkMode: boolean): string {
  const g = grammar.toLowerCase();

  if (darkMode) {
    // Dark mode - subtle colored gradients
    if (g.includes('명사')) return 'bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-700/50';
    if (g.includes('동사')) return 'bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-700/50';
    if (g.includes('형용사')) return 'bg-gradient-to-br from-amber-900/20 to-amber-800/10 border-amber-700/50';
    if (g.includes('부사')) return 'bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-700/50';
    if (g.includes('전치사')) return 'bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border-cyan-700/50';
    if (g.includes('접속사')) return 'bg-gradient-to-br from-pink-900/20 to-pink-800/10 border-pink-700/50';
    if (g.includes('대명사')) return 'bg-gradient-to-br from-indigo-900/20 to-indigo-800/10 border-indigo-700/50';
    if (g.includes('관사')) return 'bg-gradient-to-br from-teal-900/20 to-teal-800/10 border-teal-700/50';
    if (g.includes('감탄사')) return 'bg-gradient-to-br from-rose-900/20 to-rose-800/10 border-rose-700/50';
    return 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700';
  } else {
    // Light mode - soft colored gradients
    if (g.includes('명사')) return 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200';
    if (g.includes('동사')) return 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200';
    if (g.includes('형용사')) return 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200';
    if (g.includes('부사')) return 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200';
    if (g.includes('전치사')) return 'bg-gradient-to-br from-cyan-50 to-cyan-100/50 border-cyan-200';
    if (g.includes('접속사')) return 'bg-gradient-to-br from-pink-50 to-pink-100/50 border-pink-200';
    if (g.includes('대명사')) return 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200';
    if (g.includes('관사')) return 'bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-200';
    if (g.includes('감탄사')) return 'bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200';
    return 'bg-gradient-to-br from-white to-gray-50 border-gray-200';
  }
}
