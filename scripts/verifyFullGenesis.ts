import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function verifyData() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 창세기 전체 데이터 검증');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. 총 구절 수
  console.log('1️⃣  총 구절 수 확인...');
  const { data: allVerses, count } = await supabase
    .from('verses')
    .select('id', { count: 'exact', head: false })
    .eq('book_id', 'genesis');

  console.log(`   ✅ 총 ${count}개 구절 저장됨\n`);

  // 2. 챕터별 카운트
  console.log('2️⃣  챕터별 구절 수 확인...\n');

  const chapterCounts: { [key: number]: number } = {};

  for (let ch = 1; ch <= 50; ch++) {
    const { count: chCount } = await supabase
      .from('verses')
      .select('id', { count: 'exact', head: true })
      .eq('book_id', 'genesis')
      .eq('chapter', ch);

    chapterCounts[ch] = chCount || 0;

    if (ch % 10 === 0 || ch === 1 || ch === 50) {
      console.log(`   Chapter ${ch.toString().padStart(2, ' ')}: ${chCount} verses`);
    }
  }

  const totalVerses = Object.values(chapterCounts).reduce((sum, count) => sum + count, 0);
  console.log(`\n   📊 총 ${totalVerses}개 구절 (50개 챕터)\n`);

  // 3. 데이터 완성도 분석
  console.log('3️⃣  데이터 완성도 분석...\n');

  const { data: analysisData } = await supabase
    .from('verses')
    .select('hebrew, translation, modern, ipa, korean_pronunciation')
    .eq('book_id', 'genesis')
    .limit(1533);

  if (analysisData) {
    const total = analysisData.length;
    const withHebrew = analysisData.filter(v => v.hebrew && !v.hebrew.includes('[TODO')).length;
    const withTranslation = analysisData.filter(v => v.translation && !v.translation.includes('[TODO')).length;
    const withModern = analysisData.filter(v => v.modern && !v.modern.includes('[TODO')).length;
    const withIPA = analysisData.filter(v => v.ipa && !v.ipa.includes('[TODO')).length;
    const withKorean = analysisData.filter(v => v.korean_pronunciation && !v.korean_pronunciation.includes('[TODO')).length;

    console.log(`   총 구절: ${total}`);
    console.log(`   히브리 원문: ${withHebrew}/${total} (${(withHebrew / total * 100).toFixed(1)}%) ✨`);
    console.log(`   영어 번역: ${withTranslation}/${total} (${(withTranslation / total * 100).toFixed(1)}%)`);
    console.log(`   한글 현대어: ${withModern}/${total} (${(withModern / total * 100).toFixed(1)}%)`);
    console.log(`   IPA 발음: ${withIPA}/${total} (${(withIPA / total * 100).toFixed(1)}%)`);
    console.log(`   한글 발음: ${withKorean}/${total} (${(withKorean / total * 100).toFixed(1)}%)\n`);
  }

  // 4. 샘플 데이터 확인
  console.log('4️⃣  샘플 데이터 확인...\n');

  const samples = [
    { chapter: 1, verse: 1 },
    { chapter: 25, verse: 1 },
    { chapter: 50, verse: 26 }
  ];

  for (const sample of samples) {
    const { data } = await supabase
      .from('verses')
      .select('reference, hebrew, modern')
      .eq('book_id', 'genesis')
      .eq('chapter', sample.chapter)
      .eq('verse_number', sample.verse)
      .single();

    if (data) {
      console.log(`   📖 ${data.reference}`);
      console.log(`      Hebrew: ${data.hebrew.substring(0, 50)}...`);
      console.log(`      Modern: ${data.modern.substring(0, 50)}...\n`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 검증 완료!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📝 다음 단계:');
  console.log('   - 앱에서 챕터 네비게이션 테스트');
  console.log('   - 나머지 1499개 구절 한글 컨텐츠 생성 (AI)');
  console.log('   - Words & Commentaries 마이그레이션\n');
}

verifyData();
