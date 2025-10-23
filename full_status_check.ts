import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fullCheck() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║   정확한 개발 진행상황 분석 (실제 상태 기반)      ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  // 1. 테이블 존재 및 데이터 확인
  console.log('📊 1. 데이터베이스 테이블 상태\n');

  console.log('   [CORE]');
  const coreTables = ['books', 'verses', 'words'];
  for (const table of coreTables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`   ❌ ${table}: 없음`);
    } else {
      console.log(`   ✅ ${table}: ${count}개`);
    }
  }

  console.log('\n   [PHASE 1]');
  const phase1Tables = ['user_book_progress', 'hebrew_roots', 'word_derivations', 'word_metadata', 'user_word_progress_v2'];
  for (const table of phase1Tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`   ❌ ${table}: 없음`);
    } else {
      console.log(`   ✅ ${table}: ${count}개`);
    }
  }

  // 2. 어근 데이터 샘플
  console.log('\n🌳 2. Hebrew Roots 샘플 (빈도 Top 10)\n');
  const { data: roots } = await supabase
    .from('hebrew_roots')
    .select('root, core_meaning_korean, emoji, frequency')
    .order('frequency', { ascending: false })
    .limit(10);

  if (roots) {
    roots.forEach((r, i) => {
      console.log(`   ${i+1}. ${r.emoji} ${r.root} - ${r.core_meaning_korean} (${r.frequency}회)`);
    });
  }

  // 3. 파생어 통계
  console.log('\n📈 3. Word Derivations 통계\n');
  const { count: derivCount } = await supabase
    .from('word_derivations')
    .select('*', { count: 'exact', head: true });

  console.log(`   총 매핑: ${derivCount}개 (어근↔단어 관계)`);

  // 4. Books 데이터
  console.log('\n📚 4. Books 데이터\n');
  const { data: booksData, count: booksCount } = await supabase
    .from('books')
    .select('id', { count: 'exact' });

  console.log(`   총 ${booksCount}권`);
  if (booksData && booksData.length > 0) {
    console.log(`   예시: ${booksData.slice(0, 5).map(b => b.id).join(', ')}...`);
  }

  // 5. Words 샘플
  console.log('\n📖 5. Words 샘플 (최근 추가 5개)\n');
  const { data: wordsData } = await supabase
    .from('words')
    .select('hebrew, meaning, emoji')
    .order('created_at', { ascending: false })
    .limit(5);

  if (wordsData) {
    wordsData.forEach((w, i) => {
      console.log(`   ${i+1}. ${w.emoji || '❓'} ${w.hebrew} - ${w.meaning}`);
    });
  }

  // 6. Verses 통계
  console.log('\n📜 6. Verses 통계\n');
  const { count: versesCount } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true });

  const { data: genesisVerses } = await supabase
    .from('verses')
    .select('chapter', { count: 'exact', head: true })
    .eq('book_id', 'genesis');

  console.log(`   총 구절: ${versesCount}개`);
  console.log(`   창세기 구절: ${genesisVerses?.length || 0}개`);

  console.log('\n╚════════════════════════════════════════════════════╝\n');
}

fullCheck();
