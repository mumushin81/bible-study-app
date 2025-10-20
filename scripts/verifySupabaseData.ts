import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local 파일 로드
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyData() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Supabase 데이터 검증');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. 총 구절 수 확인
  console.log('1️⃣  총 구절 수 확인...');
  const { data: allVerses, error: countError, count } = await supabase
    .from('verses')
    .select('id', { count: 'exact', head: false })
    .eq('book_id', 'genesis')
    .gte('chapter', 1)
    .lte('chapter', 3);

  if (countError) {
    console.error('   ❌ 오류:', countError.message);
    return;
  }

  console.log(`   ✅ 총 ${count || allVerses?.length || 0}개 구절 저장됨\n`);

  // 2. 첫 3개 구절 확인
  console.log('2️⃣  Genesis 1:1-3 샘플 확인...');
  const { data: sampleVerses, error: sampleError } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .lte('verse_number', 3)
    .order('verse_number');

  if (sampleError) {
    console.error('   ❌ 오류:', sampleError.message);
    return;
  }

  sampleVerses?.forEach((verse: any) => {
    console.log(`\n   📖 ${verse.reference}`);
    console.log(`   Hebrew: ${verse.hebrew.substring(0, 60)}...`);
    console.log(`   Translation: ${verse.translation?.substring(0, 60)}...`);
    console.log(`   IPA: ${verse.ipa}`);
  });

  // 3. 히브리 원문 니쿠드 확인
  console.log('\n\n3️⃣  니쿠드(vowel points) 검증...');
  const { data: verseWithNikud } = await supabase
    .from('verses')
    .select('hebrew')
    .eq('id', 'genesis_1_1')
    .single();

  if (verseWithNikud) {
    const hebrew = verseWithNikud.hebrew;
    const hasNikud = /[\u05B0-\u05BC\u05C1\u05C2\u05C7]/.test(hebrew);

    console.log(`   Original: ${hebrew}`);
    console.log(`   니쿠드 포함: ${hasNikud ? '✅ Yes' : '❌ No'}`);

    // 니쿠드 문자 카운트
    const nikudMatches = hebrew.match(/[\u05B0-\u05BC\u05C1\u05C2\u05C7]/g);
    console.log(`   니쿠드 개수: ${nikudMatches?.length || 0}`);
  }

  // 4. 챕터별 구절 수 확인
  console.log('\n\n4️⃣  챕터별 구절 수 확인...');
  for (let ch = 1; ch <= 3; ch++) {
    const { data, error, count: chCount } = await supabase
      .from('verses')
      .select('id', { count: 'exact', head: false })
      .eq('book_id', 'genesis')
      .eq('chapter', ch);

    if (!error) {
      console.log(`   Chapter ${ch}: ${chCount || data?.length || 0} verses`);
    }
  }

  // 5. 번역 데이터 완성도 확인
  console.log('\n\n5️⃣  데이터 완성도 분석...');

  const { data: analysisData } = await supabase
    .from('verses')
    .select('translation, ipa, korean_pronunciation')
    .eq('book_id', 'genesis')
    .gte('chapter', 1)
    .lte('chapter', 3);

  if (analysisData) {
    const total = analysisData.length;
    const withTranslation = analysisData.filter((v: any) => v.translation && !v.translation.includes('[TODO')).length;
    const withIPA = analysisData.filter((v: any) => v.ipa && !v.ipa.includes('[TODO')).length;
    const withKorean = analysisData.filter((v: any) => v.korean_pronunciation && !v.korean_pronunciation.includes('[TODO')).length;

    console.log(`   총 구절: ${total}`);
    console.log(`   영어 번역: ${withTranslation}/${total} (${(withTranslation / total * 100).toFixed(1)}%)`);
    console.log(`   IPA 발음: ${withIPA}/${total} (${(withIPA / total * 100).toFixed(1)}%)`);
    console.log(`   한글 발음: ${withKorean}/${total} (${(withKorean / total * 100).toFixed(1)}%)`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 검증 완료!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

verifyData();
