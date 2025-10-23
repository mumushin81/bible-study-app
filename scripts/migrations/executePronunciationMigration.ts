import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  console.log('🔄 어근 발음기호 필드 추가 시작...\n');

  try {
    // 1. 먼저 pronunciation 컬럼이 있는지 확인
    console.log('🔍 pronunciation 컬럼 확인 중...');

    const { data: testData, error: testError } = await supabase
      .from('hebrew_roots')
      .select('pronunciation')
      .limit(1);

    if (testError && testError.code === '42703') {
      console.log('❌ pronunciation 컬럼이 없습니다. 추가가 필요합니다.\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Supabase Dashboard → SQL Editor에서 다음 SQL을 실행하세요:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      const sqlContent = `-- Add pronunciation field to hebrew_roots table
ALTER TABLE hebrew_roots
ADD COLUMN IF NOT EXISTS pronunciation TEXT;

-- Add comment
COMMENT ON COLUMN hebrew_roots.pronunciation IS 'IPA or Korean pronunciation guide for the root';

-- Update existing roots with pronunciation
UPDATE hebrew_roots SET pronunciation = 'ba-ra' WHERE root = 'ב-ר-א';
UPDATE hebrew_roots SET pronunciation = 'a-sa' WHERE root = 'ע-ש-ה';
UPDATE hebrew_roots SET pronunciation = 'a-mar' WHERE root = 'א-מ-ר';
UPDATE hebrew_roots SET pronunciation = 'ha-ya' WHERE root = 'ה-י-ה';
UPDATE hebrew_roots SET pronunciation = 'ra-a' WHERE root = 'ר-א-ה';
UPDATE hebrew_roots SET pronunciation = 'ya-da' WHERE root = 'י-ד-ע';
UPDATE hebrew_roots SET pronunciation = 'na-tan' WHERE root = 'נ-ת-ן';
UPDATE hebrew_roots SET pronunciation = 'la-kach' WHERE root = 'ל-ק-ח';
UPDATE hebrew_roots SET pronunciation = 'ha-lach' WHERE root = 'ה-ל-ך';
UPDATE hebrew_roots SET pronunciation = 'bo' WHERE root = 'ב-ו-א';
UPDATE hebrew_roots SET pronunciation = 'ya-tsa' WHERE root = 'י-צ-א';
UPDATE hebrew_roots SET pronunciation = 'cha-ya' WHERE root = 'ח-י-ה';
UPDATE hebrew_roots SET pronunciation = 'mut' WHERE root = 'מ-ו-ת';
UPDATE hebrew_roots SET pronunciation = 'ka-ra' WHERE root = 'ק-ר-א';
UPDATE hebrew_roots SET pronunciation = 'da-bar' WHERE root = 'ד-ב-ר';
UPDATE hebrew_roots SET pronunciation = 'ba-rach' WHERE root = 'ב-ר-ך';
UPDATE hebrew_roots SET pronunciation = 'a-rar' WHERE root = 'א-ר-ר';
UPDATE hebrew_roots SET pronunciation = 'sha-ma' WHERE root = 'ש-מ-ע';
UPDATE hebrew_roots SET pronunciation = 'a-hav' WHERE root = 'א-ה-ב';
UPDATE hebrew_roots SET pronunciation = 'sa-ne' WHERE root = 'ש-נ-א';
UPDATE hebrew_roots SET pronunciation = 'za-char' WHERE root = 'ז-כ-ר';
UPDATE hebrew_roots SET pronunciation = 'sha-chach' WHERE root = 'ש-כ-ח';
UPDATE hebrew_roots SET pronunciation = 'ya-shav' WHERE root = 'י-ש-ב';
UPDATE hebrew_roots SET pronunciation = 'a-la' WHERE root = 'ע-ל-ה';
UPDATE hebrew_roots SET pronunciation = 'ya-rad' WHERE root = 'י-ר-ד';
UPDATE hebrew_roots SET pronunciation = 'a-chal' WHERE root = 'א-כ-ל';
UPDATE hebrew_roots SET pronunciation = 'sha-ta' WHERE root = 'ש-ת-ה';
UPDATE hebrew_roots SET pronunciation = 'tov' WHERE root = 'ט-ו-ב';
UPDATE hebrew_roots SET pronunciation = 'ra-a' WHERE root = 'ר-ע-ע';
UPDATE hebrew_roots SET pronunciation = 'a-vad' WHERE root = 'ע-ב-ד';
UPDATE hebrew_roots SET pronunciation = 'sha-vat' WHERE root = 'ש-ב-ת';
UPDATE hebrew_roots SET pronunciation = 'bi-kesh' WHERE root = 'ב-ק-ש';
UPDATE hebrew_roots SET pronunciation = 'ma-tsa' WHERE root = 'מ-צ-א';
UPDATE hebrew_roots SET pronunciation = 'ya-re' WHERE root = 'י-ר-א';
UPDATE hebrew_roots SET pronunciation = 'a-men' WHERE root = 'א-מ-ן';
UPDATE hebrew_roots SET pronunciation = 'ba-char' WHERE root = 'ב-ח-ר';
UPDATE hebrew_roots SET pronunciation = 'ma-as' WHERE root = 'מ-א-ס';
UPDATE hebrew_roots SET pronunciation = 'sha-mar' WHERE root = 'ש-מ-ר';
UPDATE hebrew_roots SET pronunciation = 'ra-va' WHERE root = 'ר-ב-ה';
UPDATE hebrew_roots SET pronunciation = 'pa-ra' WHERE root = 'פ-ר-ה';
UPDATE hebrew_roots SET pronunciation = 'ma-lach' WHERE root = 'מ-ל-ך';
UPDATE hebrew_roots SET pronunciation = 'ra-da' WHERE root = 'ר-ד-ה';`;

      console.log(sqlContent);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n📌 실행 단계:');
      console.log('   1. https://supabase.com/dashboard 접속');
      console.log('   2. 프로젝트 선택');
      console.log('   3. 왼쪽 메뉴에서 "SQL Editor" 클릭');
      console.log('   4. 위 SQL 전체 복사하여 붙여넣기');
      console.log('   5. "Run" 버튼 클릭');
      console.log('   6. 완료 후 이 스크립트를 다시 실행하세요\n');

      process.exit(1);
    } else if (testError) {
      throw testError;
    }

    console.log('✅ pronunciation 컬럼이 이미 존재합니다.\n');

    // 2. 발음기호 데이터 확인
    const { data: roots, error: rootsError } = await supabase
      .from('hebrew_roots')
      .select('root, pronunciation')
      .order('importance', { ascending: false });

    if (rootsError) throw rootsError;

    const withPronunciation = roots.filter(r => r.pronunciation).length;
    const total = roots.length;

    console.log('📊 발음기호 현황:');
    console.log(`   총 어근: ${total}개`);
    console.log(`   발음 있음: ${withPronunciation}개`);
    console.log(`   발음 없음: ${total - withPronunciation}개`);
    console.log(`   완성도: ${((withPronunciation / total) * 100).toFixed(1)}%`);

    if (withPronunciation === 0) {
      console.log('\n⚠️  발음기호 데이터가 없습니다.');
      console.log('   위의 SQL을 실행하여 발음기호를 추가하세요.');
    }

  } catch (err) {
    console.error('❌ 오류 발생:', err);
    process.exit(1);
  }

  console.log('\n✅ 완료!');
  process.exit(0);
}

executeMigration();
