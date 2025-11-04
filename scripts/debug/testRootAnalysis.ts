/**
 * 어근 분석 테스트 스크립트
 * 실제 데이터가 어떻게 처리되는지 확인
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Utility functions (복사)
const HEBREW_ROMANIZATION: Record<string, string> = {
  'א': 'ʾ', 'בּ': 'b', 'ב': 'v', 'ג': 'g', 'ד': 'd', 'ה': 'h',
  'ו': 'w', 'ז': 'z', 'ח': 'ḥ', 'ט': 'ṭ', 'י': 'y',
  'כּ': 'k', 'כ': 'kh', 'ך': 'kh', 'ל': 'l', 'מ': 'm', 'ם': 'm',
  'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': 'ʿ',
  'פּ': 'p', 'פ': 'f', 'ף': 'f', 'צ': 'ṣ', 'ץ': 'ṣ',
  'ק': 'q', 'ר': 'r', 'שׁ': 'sh', 'שׂ': 's', 'ש': 'sh', 'ת': 't',
};

function extractHebrewConsonants(text: string): string[] {
  return text.split('').filter((char) => {
    const code = char.charCodeAt(0);
    return code >= 0x05d0 && code <= 0x05ea;
  });
}

function romanizeHebrewConsonant(consonant: string): string {
  return HEBREW_ROMANIZATION[consonant] || consonant;
}

function isKorean(text: string): boolean {
  const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF]/;
  return koreanRegex.test(text);
}

function isLatin(text: string): boolean {
  const latinRegex = /^[a-zA-Zʾʿḥṣṭḇḏḡḵṯāēīōūâêîôûäëïöüǎěǐǒǔ\s\-]+$/;
  return latinRegex.test(text);
}

function cleanIPA(ipa: string): string {
  return ipa.replace(/[ˈˌ]/g, '');
}

function splitRootPronunciation(pronunciation: string, rootLetters: string[]): string[] {
  const syllables = pronunciation.split(/[\s\-/ˈˌ.·]+/).filter(s => s.length > 0);

  if (syllables.length < rootLetters.length) {
    return [];
  } else if (syllables.length > rootLetters.length) {
    const combined = [...syllables.slice(0, rootLetters.length - 1), syllables.slice(rootLetters.length - 1).join('')];
    return combined;
  }

  return syllables;
}

// Main test
const filePath = join(process.cwd(), 'data/generated_v2/genesis_1_1.json');
const data = JSON.parse(readFileSync(filePath, 'utf-8'));

console.log('\n📊 Genesis 1:1 어근 분석 테스트\n');
console.log('='.repeat(80));

data.words.forEach((word: any, index: number) => {
  console.log(`\n${index + 1}. ${word.hebrew} (${word.korean})`);
  console.log('-'.repeat(80));

  if (!word.root) {
    console.log('   ⚠️  root 필드 없음');
    return;
  }

  // 1️⃣ 어근 히브리어 추출
  const hebrewRoot = word.root.split(' ')[0];
  console.log(`   어근 원본: "${word.root}"`);
  console.log(`   히브리어: "${hebrewRoot}"`);

  // 2️⃣ 글자 추출
  let rootLetters: string[] = [];
  if (hebrewRoot.includes('-')) {
    rootLetters = hebrewRoot.split('-');
    console.log(`   분리 방식: 하이픈 split`);
  } else {
    rootLetters = extractHebrewConsonants(hebrewRoot);
    console.log(`   분리 방식: 자음 추출`);
  }
  console.log(`   어근 글자: [${rootLetters.join(', ')}]`);

  // 3️⃣ 발음 추출
  let fullPronunciation = '';
  let pronunciationSource = 'none';

  const match = word.root.match(/\((.+?)\)$/);
  if (match) {
    const extracted = match[1];
    console.log(`   괄호 안: "${extracted}"`);

    if (isKorean(extracted)) {
      console.log(`   ❌ 한글 감지 → 제외`);
    } else if (isLatin(extracted)) {
      fullPronunciation = extracted;
      pronunciationSource = 'romanization';
      console.log(`   ✅ 라틴 감지 → 사용`);
    } else {
      console.log(`   ⚠️  기타 문자`);
    }
  }

  console.log(`   전체 발음: "${fullPronunciation}"`);

  // 4️⃣ 음절 분리
  let letterPronunciations: any[] = [];

  if (fullPronunciation && pronunciationSource !== 'none') {
    const syllables = splitRootPronunciation(fullPronunciation, rootLetters);
    console.log(`   음절 분리: [${syllables.join(', ')}]`);

    if (syllables.length === 0) {
      console.log(`   ⚠️  음절 분리 실패 → per-letter fallback`);
      letterPronunciations = rootLetters.map((letter) => ({
        letter,
        pronunciation: romanizeHebrewConsonant(letter),
      }));
    } else {
      letterPronunciations = rootLetters.map((letter, idx) => ({
        letter,
        pronunciation: syllables[idx] || '',
      }));
    }
  } else {
    console.log(`   ℹ️  발음 없음 → per-letter romanization`);
    letterPronunciations = rootLetters.map((letter) => ({
      letter,
      pronunciation: romanizeHebrewConsonant(letter),
    }));
  }

  // 결과 출력
  console.log('\n   📌 최종 결과:');
  letterPronunciations.forEach((item, idx) => {
    console.log(`      ${item.letter} → ${item.pronunciation}`);
  });
});

console.log('\n' + '='.repeat(80) + '\n');
