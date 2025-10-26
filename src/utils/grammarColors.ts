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
 * Get grammar-based colors for flashcard box backgrounds (20% transparent outline)
 */
export function getGrammarCardBackground(grammar: string, darkMode: boolean): string {
  const g = grammar.toLowerCase();

  if (darkMode) {
    // Dark mode - 20% transparent background with colored border
    if (g.includes('명사')) return 'bg-gradient-to-br from-gray-800/20 to-gray-900/20 border-blue-500';
    if (g.includes('동사')) return 'bg-gradient-to-br from-gray-800/20 to-gray-900/20 border-green-500';
    if (g.includes('형용사')) return 'bg-gradient-to-br from-gray-800/20 to-gray-900/20 border-amber-500';
    if (g.includes('부사')) return 'bg-gradient-to-br from-gray-800/20 to-gray-900/20 border-orange-500';
    if (g.includes('전치사')) return 'bg-gradient-to-br from-gray-800/20 to-gray-900/20 border-cyan-500';
    if (g.includes('접속사')) return 'bg-gradient-to-br from-gray-800/20 to-gray-900/20 border-pink-500';
    if (g.includes('대명사')) return 'bg-gradient-to-br from-gray-800/20 to-gray-900/20 border-indigo-500';
    if (g.includes('관사')) return 'bg-gradient-to-br from-gray-800/20 to-gray-900/20 border-teal-500';
    if (g.includes('감탄사')) return 'bg-gradient-to-br from-gray-800/20 to-gray-900/20 border-rose-500';
    return 'bg-gradient-to-br from-gray-800/20 to-gray-900/20 border-gray-700';
  } else {
    // Light mode - 20% transparent background with colored border
    if (g.includes('명사')) return 'bg-gradient-to-br from-white/20 to-gray-50/20 border-blue-400';
    if (g.includes('동사')) return 'bg-gradient-to-br from-white/20 to-gray-50/20 border-green-400';
    if (g.includes('형용사')) return 'bg-gradient-to-br from-white/20 to-gray-50/20 border-amber-400';
    if (g.includes('부사')) return 'bg-gradient-to-br from-white/20 to-gray-50/20 border-orange-400';
    if (g.includes('전치사')) return 'bg-gradient-to-br from-white/20 to-gray-50/20 border-cyan-400';
    if (g.includes('접속사')) return 'bg-gradient-to-br from-white/20 to-gray-50/20 border-pink-400';
    if (g.includes('대명사')) return 'bg-gradient-to-br from-white/20 to-gray-50/20 border-indigo-400';
    if (g.includes('관사')) return 'bg-gradient-to-br from-white/20 to-gray-50/20 border-teal-400';
    if (g.includes('감탄사')) return 'bg-gradient-to-br from-white/20 to-gray-50/20 border-rose-400';
    return 'bg-gradient-to-br from-white/20 to-gray-50/20 border-gray-200';
  }
}
