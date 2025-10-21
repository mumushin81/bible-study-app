import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { verses as staticVerses } from '../src/data/verses';

// .env.local 파일 로드
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수 누락: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.log('   .env.local 파일에 다음을 추가하세요:');
  console.log('   VITE_SUPABASE_URL=your-project-url');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface OSHBVerse {
  id: string;
  chapter: number;
  verseNumber: number;
  hebrew: string;
  words: string[];
  morphology?: string[];
}

interface SefariaVerse {
  id: string;
  chapter: number;
  verseNumber: number;
  hebrew: string;
  reference: string;
  hebrewReference: string;
  source: string;
}

interface SefariaAPIResponse {
  he: string[];
  text: string[];  // English translations
  ref: string;
  heRef: string;
}

interface MergedVerse {
  id: string;
  book_id: string;
  chapter: number;
  verse_number: number;
  reference: string;
  hebrew: string;
  ipa: string;
  korean_pronunciation: string;
  literal: string | null;
  translation: string | null;
  modern: string;
}

/**
 * Sefaria API에서 영어 번역을 가져옵니다.
 */
async function fetchEnglishTranslations(book: string, chapter: number): Promise<string[]> {
  const url = `https://www.sefaria.org/api/texts/${book}.${chapter}`;

  console.log(`   📖 Fetching English translations for ${book} ${chapter}...`);

  try {
    const response = await axios.get<SefariaAPIResponse>(url, {
      params: { lang: 'en' },
      timeout: 10000
    });

    if (!response.data.text || response.data.text.length === 0) {
      console.warn(`   ⚠️  No English text found for ${book} ${chapter}`);
      return [];
    }

    console.log(`   ✅ Fetched ${response.data.text.length} English translations`);
    return response.data.text.map(text =>
      text
        .replace(/<[^>]+>/g, '')  // HTML 태그 제거
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    );

  } catch (error: any) {
    console.error(`   ❌ Error fetching English: ${error.message}`);
    return [];
  }
}

/**
 * ID 형식 변환 (gen1-1 → genesis_1_1)
 */
function convertIdToDbFormat(id: string): string {
  // gen1-1 → genesis_1_1
  const match = id.match(/^gen(\d+)-(\d+)$/);
  if (!match) {
    throw new Error(`Invalid ID format: ${id}`);
  }

  const chapter = match[1];
  const verse = match[2];
  return `genesis_${chapter}_${verse}`;
}

/**
 * Reference 생성 (Genesis 1:1)
 */
function createReference(chapter: number, verse: number): string {
  return `Genesis ${chapter}:${verse}`;
}

/**
 * OSHB 데이터와 Sefaria 번역 + Static 한글 병합
 */
async function mergeData(
  oshbVerses: OSHBVerse[],
  startChapter: number,
  endChapter: number
): Promise<MergedVerse[]> {
  console.log('\n🔀 데이터 병합 시작...\n');

  const mergedVerses: MergedVerse[] = [];

  // 챕터별로 영어 번역 가져오기
  const translationsByChapter: { [key: number]: string[] } = {};

  for (let ch = startChapter; ch <= endChapter; ch++) {
    const translations = await fetchEnglishTranslations('Genesis', ch);
    translationsByChapter[ch] = translations;

    // API rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📝 구절 데이터 병합 중 (OSHB 히브리 + Sefaria 영어 + Static 한글)...\n');

  // OSHB 데이터를 순회하며 병합
  for (const oshbVerse of oshbVerses) {
    const dbId = convertIdToDbFormat(oshbVerse.id);
    const reference = createReference(oshbVerse.chapter, oshbVerse.verseNumber);

    // 해당 챕터의 영어 번역에서 구절 번호로 찾기
    const chapterTranslations = translationsByChapter[oshbVerse.chapter] || [];
    const translation = chapterTranslations[oshbVerse.verseNumber - 1] || null;

    // Static data에서 한글 필드 찾기 (oshbVerse.id = "gen1-1")
    const staticVerse = staticVerses.find(v => v.id === oshbVerse.id);

    mergedVerses.push({
      id: dbId,
      book_id: 'genesis',
      chapter: oshbVerse.chapter,
      verse_number: oshbVerse.verseNumber,
      reference,
      hebrew: oshbVerse.hebrew,  // OSHB (100% 정확)
      ipa: staticVerse?.ipa || '[TODO: IPA pronunciation]',
      korean_pronunciation: staticVerse?.koreanPronunciation || '[TODO: 한글 발음]',
      literal: staticVerse?.literal || null,
      translation,  // Sefaria 영어 번역
      modern: staticVerse?.modern || '[TODO: 한글 현대어 의역]'  // Static 한글
    });

    if (mergedVerses.length % 10 === 0) {
      console.log(`   ✓ ${mergedVerses.length}/${oshbVerses.length} 구절 병합 완료`);
    }
  }

  console.log(`\n✅ 총 ${mergedVerses.length}개 구절 병합 완료\n`);
  return mergedVerses;
}

/**
 * Supabase에 데이터 저장
 */
async function saveToSupabase(verses: MergedVerse[]) {
  console.log('💾 Supabase에 데이터 저장 중...\n');

  // 1. Genesis book이 있는지 확인
  console.log('1️⃣  "genesis" 북 확인 중...');
  const { data: existingBook } = await supabase
    .from('books')
    .select('id')
    .eq('id', 'genesis')
    .single();

  if (!existingBook) {
    console.log('   📚 "genesis" 북 생성 중...');
    const { error: bookError } = await supabase
      .from('books')
      .insert({
        id: 'genesis',
        name: 'בְּרֵאשִׁית',
        english_name: 'Genesis',
        total_chapters: 50,
        testament: 'old',
        category: 'Torah',
        category_emoji: '📜'
      });

    if (bookError) {
      console.error('   ❌ Genesis book 생성 실패:', bookError.message);
      throw bookError;
    }
    console.log('   ✅ "genesis" 북 생성 완료');
  } else {
    console.log('   ✅ "genesis" 북 이미 존재');
  }

  // 2. 기존 구절 삭제 (1-3장만)
  console.log('\n2️⃣  기존 구절 삭제 중 (Genesis 1-3)...');
  const { error: deleteError } = await supabase
    .from('verses')
    .delete()
    .eq('book_id', 'genesis')
    .gte('chapter', 1)
    .lte('chapter', 3);

  if (deleteError) {
    console.error('   ❌ 기존 구절 삭제 실패:', deleteError.message);
    throw deleteError;
  }
  console.log('   ✅ 기존 구절 삭제 완료');

  // 3. 새 구절 삽입 (배치 처리)
  console.log('\n3️⃣  새 구절 삽입 중...');
  const batchSize = 20;
  let insertedCount = 0;

  for (let i = 0; i < verses.length; i += batchSize) {
    const batch = verses.slice(i, i + batchSize);

    const { error: insertError } = await supabase
      .from('verses')
      .insert(batch);

    if (insertError) {
      console.error(`   ❌ 배치 ${Math.floor(i / batchSize) + 1} 삽입 실패:`, insertError.message);
      throw insertError;
    }

    insertedCount += batch.length;
    console.log(`   ✓ ${insertedCount}/${verses.length} 구절 삽입 완료`);
  }

  console.log('\n✅ 모든 구절 저장 완료!\n');
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 OSHB → Supabase 마이그레이션');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. OSHB 데이터 로드
    const oshbPath = path.join(process.cwd(), 'data', 'genesis-1-3-oshb.json');

    if (!fs.existsSync(oshbPath)) {
      console.error('❌ OSHB 데이터 파일을 찾을 수 없습니다.');
      console.log('먼저 verifyWithOSHB.ts를 실행하세요.');
      process.exit(1);
    }

    console.log('📖 OSHB 데이터 로드 중...');
    const oshbVerses: OSHBVerse[] = JSON.parse(fs.readFileSync(oshbPath, 'utf-8'));
    console.log(`   ✅ ${oshbVerses.length}개 구절 로드\n`);

    // 2. 데이터 병합 (OSHB + Sefaria 번역)
    const mergedVerses = await mergeData(oshbVerses, 1, 3);

    // 3. Supabase에 저장
    await saveToSupabase(mergedVerses);

    // 4. 병합된 데이터 로컬 저장 (백업용)
    const outputPath = path.join(process.cwd(), 'data', 'genesis-1-3-merged.json');
    fs.writeFileSync(outputPath, JSON.stringify(mergedVerses, null, 2), 'utf-8');
    console.log(`📄 병합 데이터 저장: ${outputPath}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 마이그레이션 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 요약:');
    console.log(`   - OSHB 히브리 원문: ${oshbVerses.length}개 구절`);
    console.log(`   - Sefaria 영어 번역: ${mergedVerses.filter(v => v.translation).length}개 구절`);
    console.log(`   - Supabase 저장: ${mergedVerses.length}개 구절`);
    console.log(`   - 100% 정확한 니쿠드 보장 ✨\n`);

    console.log('📝 TODO:');
    console.log('   - IPA 발음 생성');
    console.log('   - 한글 발음 생성');
    console.log('   - Literal translation 추가');
    console.log('   - Modern translation 개선\n');

  } catch (error: any) {
    console.error('\n❌ 마이그레이션 실패:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
main();
