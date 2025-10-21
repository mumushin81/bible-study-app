import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { verses as staticVerses } from '../src/data/verses';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface OSHBVerse {
  id: string;
  chapter: number;
  verseNumber: number;
  hebrew: string;
  words: string[];
  morphology?: string[];
  lemmas?: string[];
}

interface Translation {
  chapter: number;
  verseNumber: number;
  english: string;
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
 * ID 변환: gen1-1 → genesis_1_1
 */
function convertIdToDbFormat(id: string): string {
  const match = id.match(/^gen(\d+)-(\d+)$/);
  if (!match) {
    throw new Error(`Invalid ID format: ${id}`);
  }

  const chapter = match[1];
  const verse = match[2];
  return `genesis_${chapter}_${verse}`;
}

/**
 * Reference 생성
 */
function createReference(chapter: number, verse: number): string {
  return `Genesis ${chapter}:${verse}`;
}

/**
 * 데이터 병합
 */
function mergeData(
  oshbVerses: OSHBVerse[],
  translations: Translation[]
): MergedVerse[] {
  console.log('\n🔀 데이터 병합 중 (OSHB + Sefaria + Static)...\n');

  // Translation 맵 생성 (빠른 조회)
  const translationMap: { [key: string]: string } = {};
  translations.forEach(t => {
    const key = `${t.chapter}-${t.verseNumber}`;
    translationMap[key] = t.english;
  });

  const mergedVerses: MergedVerse[] = [];

  oshbVerses.forEach((oshbVerse, index) => {
    const dbId = convertIdToDbFormat(oshbVerse.id);
    const reference = createReference(oshbVerse.chapter, oshbVerse.verseNumber);

    // 영어 번역 찾기
    const key = `${oshbVerse.chapter}-${oshbVerse.verseNumber}`;
    const translation = translationMap[key] || null;

    // Static data에서 한글 필드 찾기
    const staticVerse = staticVerses.find(v => v.id === oshbVerse.id);

    mergedVerses.push({
      id: dbId,
      book_id: 'genesis',
      chapter: oshbVerse.chapter,
      verse_number: oshbVerse.verseNumber,
      reference,
      hebrew: oshbVerse.hebrew,  // OSHB (100% 정확)
      ipa: staticVerse?.ipa || '[TODO: IPA]',
      korean_pronunciation: staticVerse?.koreanPronunciation || '[TODO: 한글 발음]',
      literal: staticVerse?.literal || null,
      translation,  // Sefaria 영어
      modern: staticVerse?.modern || '[TODO: 한글 현대어 의역]'  // Static 한글
    });

    if ((index + 1) % 100 === 0) {
      console.log(`   ✓ ${index + 1}/${oshbVerses.length} 구절 병합 완료`);
    }
  });

  console.log(`   ✓ ${mergedVerses.length}/${oshbVerses.length} 구절 병합 완료`);
  console.log(`\n✅ 총 ${mergedVerses.length}개 구절 병합 완료\n`);
  return mergedVerses;
}

/**
 * Supabase에 데이터 저장 (보호 구역 방식)
 * - Genesis 1-3장: UPSERT (Words & Commentaries 보존)
 * - Genesis 4-50장: DELETE 후 INSERT
 */
async function saveToSupabase(verses: MergedVerse[]) {
  console.log('💾 Supabase에 데이터 저장 중 (보호 구역 방식)...\n');

  // 1. Genesis book 확인
  console.log('1️⃣  "genesis" 북 확인 중...');
  const { data: existingBook } = await supabase
    .from('books')
    .select('id')
    .eq('id', 'genesis')
    .single();

  if (!existingBook) {
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

  // 2. 보호 구역 설정: Genesis 1-3장과 4-50장 분리
  const protectedVerses = verses.filter(v => v.chapter >= 1 && v.chapter <= 3);
  const unprotectedVerses = verses.filter(v => v.chapter >= 4 && v.chapter <= 50);

  console.log(`\n📦 데이터 분류:`);
  console.log(`   - 보호 구역 (1-3장): ${protectedVerses.length}개 구절 (UPSERT)`);
  console.log(`   - 일반 구역 (4-50장): ${unprotectedVerses.length}개 구절 (DELETE + INSERT)`);

  // 3. Genesis 4-50장만 삭제
  console.log('\n2️⃣  일반 구역 삭제 중 (Genesis 4-50장)...');
  const { error: deleteError } = await supabase
    .from('verses')
    .delete()
    .eq('book_id', 'genesis')
    .gte('chapter', 4)
    .lte('chapter', 50);

  if (deleteError) {
    console.error('   ❌ 기존 구절 삭제 실패:', deleteError.message);
    throw deleteError;
  }
  console.log('   ✅ Genesis 4-50장 삭제 완료');

  // 4. Genesis 1-3장 UPSERT (Words & Commentaries 보존)
  console.log('\n3️⃣  보호 구역 UPSERT 중 (Genesis 1-3장)...\n');
  const batchSize = 50;
  let upsertedCount = 0;

  for (let i = 0; i < protectedVerses.length; i += batchSize) {
    const batch = protectedVerses.slice(i, i + batchSize);

    const { error: upsertError } = await supabase
      .from('verses')
      .upsert(batch, { onConflict: 'id' });

    if (upsertError) {
      console.error(`   ❌ Batch ${Math.floor(i / batchSize) + 1} UPSERT 실패:`, upsertError.message);
      throw upsertError;
    }

    upsertedCount += batch.length;
    console.log(`   ✓ ${upsertedCount}/${protectedVerses.length} 구절 UPSERT 완료 (Words/Commentaries 보존)`);
  }

  // 5. Genesis 4-50장 INSERT
  console.log('\n4️⃣  일반 구역 삽입 중 (Genesis 4-50장)...\n');
  let insertedCount = 0;

  for (let i = 0; i < unprotectedVerses.length; i += batchSize) {
    const batch = unprotectedVerses.slice(i, i + batchSize);

    const { error: insertError } = await supabase
      .from('verses')
      .insert(batch);

    if (insertError) {
      console.error(`   ❌ Batch ${Math.floor(i / batchSize) + 1} 삽입 실패:`, insertError.message);
      throw insertError;
    }

    insertedCount += batch.length;
    console.log(`   ✓ ${insertedCount}/${unprotectedVerses.length} 구절 삽입 완료`);
  }

  console.log('\n✅ 모든 구절 저장 완료!');
  console.log(`   - 보호 구역 (1-3장): ${protectedVerses.length}개 UPSERT ✅`);
  console.log(`   - 일반 구역 (4-50장): ${unprotectedVerses.length}개 INSERT ✅\n`);
}

/**
 * 메인 실행
 */
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 창세기 전체 50장 마이그레이션');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. OSHB 데이터 로드
    const oshbPath = path.join(process.cwd(), 'data', 'genesis-full-oshb.json');
    console.log('📖 OSHB 데이터 로드 중...');
    const oshbVerses: OSHBVerse[] = JSON.parse(fs.readFileSync(oshbPath, 'utf-8'));
    console.log(`   ✅ ${oshbVerses.length}개 구절 로드\n`);

    // 2. Sefaria 번역 로드
    const translationsPath = path.join(process.cwd(), 'data', 'genesis-full-translations.json');
    console.log('🌐 Sefaria 번역 로드 중...');
    const translations: Translation[] = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));
    console.log(`   ✅ ${translations.length}개 번역 로드\n`);

    // 3. 데이터 병합
    const mergedVerses = mergeData(oshbVerses, translations);

    // 4. Supabase에 저장
    await saveToSupabase(mergedVerses);

    // 5. 병합 데이터 로컬 저장 (백업)
    const outputPath = path.join(process.cwd(), 'data', 'genesis-full-merged.json');
    fs.writeFileSync(outputPath, JSON.stringify(mergedVerses, null, 2), 'utf-8');
    console.log(`📄 병합 데이터 저장: ${outputPath}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 창세기 전체 마이그레이션 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 요약:');
    console.log(`   - OSHB 히브리 원문: ${oshbVerses.length}개 구절`);
    console.log(`   - Sefaria 영어 번역: ${translations.length}개 구절`);
    console.log(`   - Supabase 저장: ${mergedVerses.length}개 구절`);
    console.log(`   - 100% 정확한 니쿠드 보장 ✨\n`);

    // Static data 매칭 통계
    const staticMatches = mergedVerses.filter(v => !v.modern.includes('[TODO')).length;
    console.log(`   📝 Static 한글 매칭: ${staticMatches}/1533 (${(staticMatches/1533*100).toFixed(1)}%)`);
    console.log(`   🔜 TODO: ${1533 - staticMatches}개 구절 한글 컨텐츠 생성 필요\n`);

  } catch (error: any) {
    console.error('\n❌ 마이그레이션 실패:', error.message);
    process.exit(1);
  }
}

main();
