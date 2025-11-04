/**
 * rootAnalysis 필드 추가 마이그레이션 스크립트
 *
 * Codex + Gemini 컨설팅 결과:
 * - 복잡한 프론트엔드 추론 로직 대신 명시적 데이터 저장
 * - rootAnalysis: [{letter: "ב", pronunciation: "b"}]
 *
 * 사용법:
 *   npx tsx scripts/migrations/addRootAnalysis.ts data/generated_v2/genesis_1_1.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface RootLetterAnalysis {
  letter: string;
  pronunciation: string;
}

interface Word {
  hebrew: string;
  root: string;
  rootAnalysis?: RootLetterAnalysis[];
  [key: string]: any;
}

interface VerseData {
  words: Word[];
  [key: string]: any;
}

/**
 * Gemini API를 사용하여 어근 분석 생성
 *
 * 프롬프트 전략:
 * - 히브리어 단어와 어근 정보 제공
 * - JSON 형식으로 {letter, pronunciation} 배열 요청
 * - 학술적 로마자 표기법 사용 (SBL/academic style)
 */
/**
 * 발음 문자열을 글자에 매핑
 * "bara" + ["ב", "ר", "א"] → [{"ב", "ba"}, {"ר", "ra"}, {"א", ""}]
 */
function mapPronunciationToLetters(pronunciation: string, letters: string[]): RootLetterAnalysis[] {
  // 모음 제거하여 자음만 추출
  const vowels = /[aeiouāēīōūâêîôûäëïöüǎěǐǒǔ]/gi;

  // 발음을 음절로 분리 (자음-모음 그룹)
  const syllables: string[] = [];
  let current = '';

  for (let i = 0; i < pronunciation.length; i++) {
    const char = pronunciation[i];
    current += char;

    // 모음을 만나면 음절 완성
    if (vowels.test(char)) {
      syllables.push(current);
      current = '';
    }
  }

  // 남은 자음 추가
  if (current) {
    syllables.push(current);
  }

  // 글자 수에 맞춰 매핑
  const result: RootLetterAnalysis[] = [];
  for (let i = 0; i < letters.length; i++) {
    result.push({
      letter: letters[i],
      pronunciation: syllables[i] || '',
    });
  }

  return result;
}

async function generateRootAnalysis(hebrew: string, root: string): Promise<RootLetterAnalysis[]> {
  // 어근에서 히브리어와 발음 추출
  const match = root.match(/^(.+?)\s*\((.+?)\)$/);

  if (!match) {
    console.warn(`⚠️  root 형식 오류: "${root}"`);
    return [];
  }

  const rootHebrew = match[1].trim();
  const pronunciation = match[2].trim();

  // 한글이면 스킵
  if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(pronunciation)) {
    console.warn(`⚠️  한글 발음 감지, 스킵: "${pronunciation}"`);
    return [];
  }

  // 하이픈으로 분리된 경우 글자 추출
  let letters: string[] = [];
  if (rootHebrew.includes('-')) {
    letters = rootHebrew.split('-').map(l => l.trim());
  } else {
    // 자음만 추출
    letters = rootHebrew.split('').filter(char => {
      const code = char.charCodeAt(0);
      return code >= 0x05d0 && code <= 0x05ea;
    });
  }

  // 발음을 글자에 매핑 (히브리어 읽기 방식)
  return mapPronunciationToLetters(pronunciation, letters);
}

async function migrateFile(filePath: string, force: boolean = false) {
  console.log(`\n📝 마이그레이션 시작: ${filePath}\n`);

  // 파일 읽기
  const data: VerseData = JSON.parse(readFileSync(filePath, 'utf-8'));

  let updatedCount = 0;
  let skippedCount = 0;

  // 각 단어 처리
  for (const word of data.words) {
    if (word.rootAnalysis && !force) {
      console.log(`⏭️  ${word.hebrew}: rootAnalysis 이미 존재, 스킵 (--force로 덮어쓰기 가능)`);
      skippedCount++;
      continue;
    }

    if (!word.root) {
      console.log(`⚠️  ${word.hebrew}: root 필드 없음, 스킵`);
      skippedCount++;
      continue;
    }

    // rootAnalysis 생성
    const analysis = await generateRootAnalysis(word.hebrew, word.root);
    word.rootAnalysis = analysis;

    console.log(`✅ ${word.hebrew} (${word.root})`);
    console.log(`   → [${analysis.map(a => `${a.letter}(${a.pronunciation})`).join(', ')}]`);

    updatedCount++;
  }

  // 파일 저장
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`\n✨ 마이그레이션 완료!`);
  console.log(`   - 업데이트: ${updatedCount}개`);
  console.log(`   - 스킵: ${skippedCount}개`);
}

// CLI 실행
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('사용법: npx tsx scripts/migrations/addRootAnalysis.ts <file-path> [--force]');
  process.exit(1);
}

const filePath = args[0];
const force = args.includes('--force');

if (force) {
  console.log('🔄 강제 덮어쓰기 모드');
}

migrateFile(filePath, force).catch(console.error);
