/**
 * 창세기 2장 JSON 파일 업데이트 및 데이터베이스 동기화
 *
 * 작업 순서:
 * 1. genesis2_image_mappings.json 로드 (업로드된 이미지 URL)
 * 2. genesis2_unique_words.json 로드 (히브리어-한글 매칭)
 * 3. 25개 genesis_2_*.json 파일 업데이트
 * 4. 데이터베이스 동기화 (verses + words 테이블)
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../src/lib/database.types';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local 로드
config({ path: path.join(__dirname, '../../.env.local') });

const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`)
};

// Supabase 클라이언트 생성
function createSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    log.error('환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// 니쿠드 제거
function removeNikkud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '').replace(/[\s\-_]/g, '').trim();
}

// 한글을 로마자로 변환 (파일명 매칭용)
function koreanToRomanized(korean: string): string {
  const map: { [key: string]: string } = {
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

  let result = '';
  for (let i = 0; i < korean.length; i++) {
    const char = korean[i];
    const code = char.charCodeAt(0);

    if (code >= 0xAC00 && code <= 0xD7A3) {
      const syllableIndex = code - 0xAC00;
      const initialIndex = Math.floor(syllableIndex / 588);
      const medialIndex = Math.floor((syllableIndex % 588) / 28);
      const finalIndex = syllableIndex % 28;

      const initials = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
      const medials = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
      const finals = ['', 'k', 'kk', 'ks', 'n', 'nj', 'nh', 'd', 'l', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh', 'm', 'b', 'bs', 's', 'ss', 'ng', 'j', 'ch', 'k', 't', 'p', 'h'];

      result += initials[initialIndex] + medials[medialIndex] + finals[finalIndex];
    } else {
      result += char;
    }
  }

  return result.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

async function uploadVerse(supabase: any, verseNum: number, imageUrlMap: Map<string, string>): Promise<boolean> {
  const filePath = path.join(__dirname, `../../data/generated_v2/genesis_2_${verseNum}.json`);

  if (!fs.existsSync(filePath)) {
    log.error(`파일 없음: genesis_2_${verseNum}.json`);
    return false;
  }

  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const { id: verseId, reference, hebrew, ipa, koreanPronunciation, modern, words } = content;

    // Verse 업로드
    const { error: verseError } = await supabase
      .from('verses')
      .upsert({
        id: verseId,
        book_id: 'genesis',
        chapter: 2,
        verse_number: verseNum,
        reference: reference,
        hebrew: hebrew,
        ipa: ipa,
        korean_pronunciation: koreanPronunciation,
        modern: modern,
      }, {
        onConflict: 'id'
      });

    if (verseError) {
      log.error(`${verseNum}절 Verse 업로드 실패: ${verseError.message}`);
      return false;
    }

    // 기존 단어 삭제
    await supabase.from('words').delete().eq('verse_id', verseId);

    // Words 업로드 (flashcardImgUrl 포함)
    let wordsWithImages = 0;
    const wordsToInsert = words.map((word: any, index: number) => {
      // 이미지 URL 매칭
      const normalized = removeNikkud(word.hebrew);
      const romanized = koreanToRomanized(word.korean);
      const flashcardImgUrl = imageUrlMap.get(normalized) || imageUrlMap.get(romanized) || null;

      if (flashcardImgUrl) {
        wordsWithImages++;
      }

      return {
        verse_id: verseId,
        hebrew: word.hebrew,
        meaning: word.meaning,
        ipa: word.ipa,
        korean: word.korean,
        letters: word.letters || null,
        root: word.root,
        grammar: word.grammar,
        flashcard_img_url: flashcardImgUrl,
        icon_svg: word.iconSvg || null,
        root_analysis: word.rootAnalysis || null,
        position: index,
      };
    });

    const { error: wordsError } = await supabase
      .from('words')
      .insert(wordsToInsert);

    if (wordsError) {
      log.error(`${verseNum}절 Words 업로드 실패: ${wordsError.message}`);
      return false;
    }

    // JSON 파일 업데이트 (flashcardImgUrl 추가)
    const updatedWords = words.map((word: any) => {
      const normalized = removeNikkud(word.hebrew);
      const romanized = koreanToRomanized(word.korean);
      const flashcardImgUrl = imageUrlMap.get(normalized) || imageUrlMap.get(romanized) || null;

      return {
        ...word,
        flashcardImgUrl: flashcardImgUrl || word.flashcardImgUrl
      };
    });

    const updatedContent = {
      ...content,
      words: updatedWords
    };

    fs.writeFileSync(filePath, JSON.stringify(updatedContent, null, 2), 'utf-8');

    log.success(`2:${verseNum} - ${wordsToInsert.length}개 단어 (이미지: ${wordsWithImages}개)`);

    return true;

  } catch (error: any) {
    log.error(`${verseNum}절 처리 실패: ${error.message}`);
    return false;
  }
}

async function main() {
  log.step('창세기 2장 JSON 업데이트 및 데이터베이스 동기화 시작');

  const supabase = createSupabaseClient();

  // 1. 이미지 매핑 로드
  const mappingPath = path.join(__dirname, 'genesis2_image_mappings.json');
  if (!fs.existsSync(mappingPath)) {
    log.error('genesis2_image_mappings.json 파일이 없습니다.');
    log.info('먼저 npx tsx scripts/images/uploadGenesis2Images.ts를 실행하세요.');
    process.exit(1);
  }

  const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
  log.info(`이미지 매핑: ${mappingData.mappings.length}개`);

  // 2. 이미지 URL 맵 생성 (한글 romanized → URL)
  const imageUrlMap = new Map<string, string>();
  mappingData.mappings.forEach((m: any) => {
    if (m.publicUrl && m.korean) {
      imageUrlMap.set(m.korean, m.publicUrl);
    }
  });

  log.info(`URL 맵: ${imageUrlMap.size}개`);

  // 3. 25개 절 처리
  let successCount = 0;
  let failCount = 0;

  for (let verseNum = 1; verseNum <= 25; verseNum++) {
    const success = await uploadVerse(supabase, verseNum, imageUrlMap);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  log.step('완료');
  log.success(`성공: ${successCount}절`);
  if (failCount > 0) {
    log.error(`실패: ${failCount}절`);
  }

  // 최종 통계
  log.step('📊 최종 통계');
  const { data: totalWords } = await supabase
    .from('words')
    .select('hebrew, flashcard_img_url', { count: 'exact' })
    .like('verse_id', 'genesis_2_%');

  if (totalWords) {
    const wordsWithImages = totalWords.filter((w: any) => w.flashcard_img_url).length;
    log.info(`전체 단어: ${totalWords.length}개`);
    log.success(`이미지 있음: ${wordsWithImages}개 (${((wordsWithImages/totalWords.length)*100).toFixed(1)}%)`);
    log.info(`이미지 없음: ${totalWords.length - wordsWithImages}개`);
  }

  log.step('🎉 창세기 2장 플래시카드 이미지 동기화 완료!');
}

main().catch(console.error);
