import { useMemo } from 'react';
import { Word, WordWithContext } from './useWords';

export interface RootLetterAnalysis {
  letter: string;
  pronunciation: string;
}

export interface WordAnalysisResult {
  rootLetters: string[];
  letterPronunciations: RootLetterAnalysis[];
}

/**
 * 단어 분석 로직을 분리한 커스텀 훅
 * 어근 분석, 발음 분석 등을 메모이제이션하여 성능 최적화
 */
export function useWordAnalysis(
  word: Word | WordWithContext
): WordAnalysisResult {
  const analysis = useMemo(() => {
    if (!word.root) {
      return { rootLetters: [], letterPronunciations: [] };
    }

    const hebrewRoot = word.root.split(' ')[0]; // "ב-ר-א" 추출

    // 히브리어 글자 추출 (하이픈이 있으면 split, 없으면 자음만 추출)
    let rootLetters: string[] = [];
    if (hebrewRoot.includes('-')) {
      // "ב-ר-א" → ["ב", "ר", "א"]
      rootLetters = hebrewRoot.split('-');
    } else {
      // "רֵאשִׁית" → 히브리어 자음만 추출 (모음 기호 제외)
      // 히브리어 자음 범위: א-ת (U+05D0 - U+05EA)
      rootLetters = hebrewRoot.split('').filter((char) => {
        const code = char.charCodeAt(0);
        return code >= 0x05d0 && code <= 0x05ea;
      });
    }

    const englishPronunciation = word.root.match(/\((.+?)\)$/)?.[1] || '';

    // 각 글자의 발음 (rootIpa 우선, 없으면 word.root 괄호 안 영어 발음 사용)
    let letterPronunciations: RootLetterAnalysis[] = [];
    if ('rootIpa' in word && word.rootIpa) {
      // IPA를 단순화하여 분할
      const simplified = word.rootIpa.replace(/[ˈˌʰʔʕχ]/g, '');
      const avgLen = Math.ceil(simplified.length / rootLetters.length);
      letterPronunciations = rootLetters.map((letter, idx) => ({
        letter,
        pronunciation: simplified.slice(idx * avgLen, (idx + 1) * avgLen),
      }));
    } else if (englishPronunciation) {
      // 영어 발음을 균등 분할
      const avgLen = Math.ceil(englishPronunciation.length / rootLetters.length);
      letterPronunciations = rootLetters.map((letter, idx) => ({
        letter,
        pronunciation: englishPronunciation.slice(idx * avgLen, (idx + 1) * avgLen),
      }));
    } else {
      letterPronunciations = rootLetters.map((letter) => ({
        letter,
        pronunciation: '',
      }));
    }

    return { rootLetters, letterPronunciations };
  }, [word.root, 'rootIpa' in word ? word.rootIpa : null]);

  return analysis;
}
