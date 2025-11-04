/**
 * 히브리어 학술적 로마자 표기법 유틸리티
 *
 * Gemini 컨설팅 기반:
 * - א (Alef) → ʾ (성문 파열음)
 * - ע (Ayin) → ʿ (유성 인두 마찰음)
 * - ח (Het) → ḥ (무성 인두 마찰음)
 *
 * Codex + Gemini 컨설팅 2차:
 * - rootAnalysis 필드 우선 사용으로 복잡한 추론 로직 제거
 * - 이 파일은 fallback 용도로만 사용 (레거시 데이터 지원)
 */

/**
 * 히브리어 자음 → 학술적 로마자 매핑
 */
export const HEBREW_ROMANIZATION: Record<string, string> = {
  // 알레프-베트 순서
  'א': 'ʾ',   // Alef (glottal stop)
  'בּ': 'b',  // Bet (with dagesh)
  'ב': 'b',   // Bet (기본값: 'b' - bara 같은 경우)
  'ג': 'g',   // Gimel
  'ד': 'd',   // Dalet
  'ה': 'h',   // He
  'ו': 'w',   // Vav (consonant)
  'ז': 'z',   // Zayin
  'ח': 'ḥ',   // Het (pharyngeal)
  'ט': 'ṭ',   // Tet (emphatic)
  'י': 'y',   // Yod (consonant)
  'כּ': 'k',  // Kaf (with dagesh)
  'כ': 'k',   // Kaf (기본값: 'k')
  'ך': 'k',   // Final Kaf
  'ל': 'l',   // Lamed
  'מ': 'm',   // Mem
  'ם': 'm',   // Final Mem
  'נ': 'n',   // Nun
  'ן': 'n',   // Final Nun
  'ס': 's',   // Samekh
  'ע': 'ʿ',   // Ayin (pharyngeal)
  'פּ': 'p',  // Pe (with dagesh)
  'פ': 'p',   // Pe (기본값: 'p')
  'ף': 'p',   // Final Pe
  'צ': 'ṣ',   // Tsadi (emphatic)
  'ץ': 'ṣ',   // Final Tsadi
  'ק': 'q',   // Qof
  'ר': 'r',   // Resh
  'שׁ': 'sh', // Shin (with dot on right)
  'שׂ': 's',  // Sin (with dot on left)
  'ש': 'sh',  // Shin/Sin base (default to shin)
  'ת': 't',   // Tav
};

/**
 * 히브리어 문자열에서 자음만 추출
 * - 모음 기호(니쿠드) 제거
 * - 자음 범위: U+05D0 - U+05EA
 * - Combining marks 보존 (shin/sin dots, dagesh)
 *
 * Codex 피드백: שׂ (sin) vs שׁ (shin) 구분을 위해 combining marks 그룹핑
 *
 * 용도: fallback 로직 (rootAnalysis 없는 레거시 데이터)
 */
export function extractHebrewConsonants(text: string): string[] {
  const consonants: string[] = [];
  const chars = text.split('');

  for (let i = 0; i < chars.length; i++) {
    const code = chars[i].charCodeAt(0);

    // 히브리어 자음인지 확인
    if (code >= 0x05d0 && code <= 0x05ea) {
      let consonant = chars[i];

      // 다음 글자가 combining mark인지 확인하고 추가
      // U+05B0-05BC: 니쿠드 (vowel points)
      // U+05C1: shin dot (right)
      // U+05C2: sin dot (left)
      // U+05BC: dagesh
      while (i + 1 < chars.length) {
        const nextCode = chars[i + 1].charCodeAt(0);
        // shin/sin dots와 dagesh만 보존
        if (nextCode === 0x05c1 || nextCode === 0x05c2 || nextCode === 0x05bc) {
          consonant += chars[i + 1];
          i++;
        } else {
          break;
        }
      }

      consonants.push(consonant);
    }
  }

  return consonants;
}

/**
 * 히브리어 자음을 학술적 로마자로 변환
 *
 * 용도: fallback 로직 (rootAnalysis 없는 레거시 데이터)
 */
export function romanizeHebrewConsonant(consonant: string): string {
  return HEBREW_ROMANIZATION[consonant] || consonant;
}
