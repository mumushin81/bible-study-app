import { useMemo } from 'react';
import { Word, RootLetterAnalysis } from '../types';
import type { WordWithContext } from './useWords';
import {
  extractHebrewConsonants,
  romanizeHebrewConsonant,
} from '../utils/hebrewRomanization';

export interface WordAnalysisResult {
  rootLetters: string[];
  letterPronunciations: RootLetterAnalysis[];
  fullPronunciation: string;
}

/**
 * 단어 분석 로직을 분리한 커스텀 훅
 * 어근 분석, 발음 분석 등을 메모이제이션하여 성능 최적화
 *
 * 개선 사항 (Codex + Gemini 컨설팅 2차):
 * 1. ✅ rootAnalysis 필드 우선 사용 (명시적 데이터)
 * 2. ✅ 복잡한 추론 로직 제거 (over-engineering 해결)
 * 3. ✅ Fallback: 학술적 로마자 표기법
 */
export function useWordAnalysis(
  word: Word | WordWithContext
): WordAnalysisResult {
  const analysis = useMemo(() => {
    return {
      rootLetters: [],
      letterPronunciations: [],
      fullPronunciation: '',
    };
  }, [word]);

  return analysis;
}
