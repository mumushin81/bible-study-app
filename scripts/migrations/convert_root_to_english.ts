/**
 * word.root 필드의 괄호 안 한국어 발음을 영어 발음으로 변경
 * 예: "ב-ר-א (바라)" → "ב-ר-א (bara)"
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 한글 → 로마자 변환 매핑 (히브리어 발음용)
const koreanToRoman: Record<string, string> = {
  'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt',
  'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp', 'ㅅ': 's',
  'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch',
  'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
  'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo',
  'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye', 'ㅗ': 'o', 'ㅘ': 'wa',
  'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo',
  'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui',
  'ㅣ': 'i'
};

function koreanToEnglish(korean: string): string {
  // 완전한 한글 분해 및 로마자 변환
  let result = '';

  for (const char of korean) {
    const code = char.charCodeAt(0);

    // 한글 범위 (가-힣: 0xAC00-0xD7A3)
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const index = code - 0xAC00;
      const cho = Math.floor(index / 588); // 초성
      const jung = Math.floor((index % 588) / 28); // 중성
      const jong = index % 28; // 종성

      const choList = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
      const jungList = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
      const jongList = ['','ㄱ','ㄲ','ㄱㅆ','ㄴ','ㄴㅈ','ㄴㅎ','ㄷ','ㄹ','ㄹㄱ','ㄹㅁ','ㄹㅂ','ㄹㅅ','ㄹㅌ','ㄹㅍ','ㄹㅎ','ㅁ','ㅂ','ㅂㅅ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

      result += koreanToRoman[choList[cho]] || '';
      result += koreanToRoman[jungList[jung]] || '';
      if (jong > 0) {
        const jongChar = jongList[jong];
        if (jongChar.length === 1) {
          result += koreanToRoman[jongChar] || '';
        } else {
          // 복합 종성 처리
          for (const c of jongChar) {
            result += koreanToRoman[c] || '';
          }
        }
      }
    } else {
      result += char;
    }
  }

  return result;
}

function ipaToEnglish(ipa: string): string {
  // IPA 특수 기호 제거 및 간단한 영어 발음으로 변환
  return ipa
    .replace(/ʔ/g, '') // glottal stop 제거
    .replace(/ʕ/g, '') // pharyngeal 제거
    .replace(/χ/g, 'kh') // voiceless velar fricative
    .replace(/ʃ/g, 'sh') // sh sound
    .replace(/ɛ/g, 'e') // epsilon
    .replace(/ə/g, 'e') // schwa
    .replace(/ɑ/g, 'a') // open back
    .replace(/ʰ/g, '') // aspirated 제거
    .replace(/ˈ/g, '') // primary stress 제거
    .replace(/ˌ/g, '') // secondary stress 제거
    .replace(/ː/g, ''); // long vowel 제거
}

async function convertRootsToEnglish() {
  console.log('🔄 word.root 필드의 한국어 → 영어 발음 변환 시작\n');

  // 1. 모든 단어 로드 (페이지네이션으로 전체 로드)
  let allWords: any[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('words')
      .select('id, hebrew, root, root_ipa')
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('id');

    if (error) {
      console.error('❌ 단어 로드 실패:', error);
      return;
    }

    if (!data || data.length === 0) break;

    allWords = allWords.concat(data);
    console.log(`   로드 중... ${allWords.length}개`);

    if (data.length < pageSize) break; // 마지막 페이지
    page++;
  }

  const words = allWords;
  console.log(`\n📊 총 ${words.length}개 단어 로드 완료\n`);

  let updatedCount = 0;
  let skippedCount = 0;
  const updates: Array<{ id: string; oldRoot: string; newRoot: string }> = [];

  // 2. 각 단어 처리
  for (const word of words) {
    const match = word.root.match(/^(.+?)\s*\((.+?)\)$/);
    if (!match) {
      skippedCount++;
      if (skippedCount <= 3) {
        console.log(`[SKIP 1] ${word.hebrew} | ${word.root} | 패턴 매치 실패`);
      }
      continue;
    }

    const [, hebrewPart, koreanPart] = match;

    // 이미 영어인지 확인 (한글이 없으면 스킵)
    const hasKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(koreanPart);
    if (!hasKorean) {
      skippedCount++;
      if (skippedCount <= 3) {
        console.log(`[SKIP 2] ${word.hebrew} | ${word.root} | 이미 영어: ${koreanPart}`);
      }
      continue;
    }

    // 디버그: 처음 3개 한글 감지
    if (updatedCount === 0) {
      console.log(`[FOUND KOREAN] ${word.hebrew} | ${word.root} | 한글: ${koreanPart}`);
    }

    // 영어 발음 생성
    let englishPronunciation: string;

    if (word.root_ipa) {
      // root_ipa가 있으면 그것을 영어로 변환
      englishPronunciation = ipaToEnglish(word.root_ipa);
    } else {
      // root_ipa가 없으면 한국어를 로마자로 변환
      englishPronunciation = koreanToEnglish(koreanPart);
    }

    const newRoot = `${hebrewPart.trim()} (${englishPronunciation})`;

    updates.push({
      id: word.id,
      oldRoot: word.root,
      newRoot: newRoot
    });

    updatedCount++;

    // 처음 10개만 미리보기
    if (updatedCount <= 10) {
      console.log(`${word.hebrew.padEnd(15)} | ${word.root.padEnd(30)} → ${newRoot}`);
    }
  }

  console.log(`\n📈 변환 통계:`);
  console.log(`   - 변환 대상: ${updatedCount}개`);
  console.log(`   - 스킵: ${skippedCount}개 (이미 영어 또는 괄호 없음)`);

  // 3. 확인 후 업데이트 (Promise.all로 병렬 처리)
  console.log('\n⚠️  이제 데이터베이스를 업데이트합니다...');

  const batchSize = 50;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);

    // 병렬 업데이트
    const results = await Promise.allSettled(
      batch.map(update =>
        supabase
          .from('words')
          .update({ root: update.newRoot })
          .eq('id', update.id)
      )
    );

    // 결과 집계
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled' && !result.value.error) {
        successCount++;
      } else {
        errorCount++;
        if (result.status === 'rejected') {
          console.error(`❌ 업데이트 실패:`, result.reason);
        }
      }
    });

    console.log(`   진행중... ${Math.min(i + batchSize, updates.length)}/${updates.length}`);
  }

  console.log(`\n✅ 완료!`);
  console.log(`   - 성공: ${successCount}개`);
  console.log(`   - 실패: ${errorCount}개`);
}

convertRootsToEnglish().catch(console.error);
