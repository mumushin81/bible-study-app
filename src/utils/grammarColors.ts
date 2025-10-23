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
