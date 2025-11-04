/**
 * 형태소 분석 데이터 테스트 스크립트
 * Genesis 1:1의 단어들을 확인하여 is_combined_form 필드가 제대로 설정되었는지 검증
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMorphology() {
  console.log('🔍 형태소 분석 데이터 테스트 시작\n');

  // Genesis 1:1의 단어들 가져오기
  const { data: verses, error: verseError } = await supabase
    .from('verses')
    .select('id')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 1)
    .single();

  if (verseError || !verses) {
    console.error('❌ Genesis 1:1을 찾을 수 없습니다:', verseError);
    return;
  }

  const { data: words, error: wordError } = await supabase
    .from('words')
    .select('hebrew, meaning, grammar, is_combined_form, ipa, root')
    .eq('verse_id', verses.id)
    .order('position', { ascending: true });

  if (wordError || !words) {
    console.error('❌ 단어를 가져올 수 없습니다:', wordError);
    return;
  }

  console.log(`✅ Genesis 1:1 단어 ${words.length}개 로드 완료\n`);
  console.log('=' .repeat(80));

  words.forEach((word, idx) => {
    const isCombined = word.is_combined_form;
    const prefix = detectPrefix(word.hebrew);

    console.log(`\n${idx + 1}. ${word.hebrew} (${word.meaning})`);
    console.log(`   품사: ${word.grammar}`);
    console.log(`   IPA: ${word.ipa}`);
    console.log(`   어근: ${word.root}`);
    console.log(`   DB is_combined_form: ${isCombined ? '✅ TRUE (결합형)' : '❌ FALSE (단독형)'}`);

    if (prefix) {
      console.log(`   감지된 접두사: ${prefix.char} (${prefix.meaning})`);
      if (!isCombined) {
        console.log(`   ⚠️  접두사가 있는데 is_combined_form이 false입니다!`);
      }
    } else {
      if (isCombined) {
        console.log(`   ⚠️  접두사가 없는데 is_combined_form이 true입니다!`);
      }
    }

    // 형태소 분석 표시 여부
    if (isCombined) {
      console.log(`   → 플래시카드: 형태소 분석 섹션 표시됨 ✨`);
    } else {
      console.log(`   → 플래시카드: 형태소 분석 섹션 숨김`);
    }
  });

  console.log('\n' + '='.repeat(80));

  // 통계
  const combinedCount = words.filter(w => w.is_combined_form).length;
  const standaloneCount = words.filter(w => !w.is_combined_form).length;

  console.log(`\n📊 통계:`);
  console.log(`   결합형 (형태소 분석 표시): ${combinedCount}개`);
  console.log(`   단독형 (형태소 분석 숨김): ${standaloneCount}개`);
  console.log(`   총 단어: ${words.length}개\n`);
}

function detectPrefix(hebrew: string): { char: string; meaning: string } | null {
  const prefixes = {
    'ו': '그리고 (접속사)',
    'ב': '~에 (전치사)',
    'ל': '~을 위해 (전치사)',
    'מ': '~로부터 (전치사)',
    'כ': '~처럼 (전치사)',
    'ה': '정관사'
  };

  const firstChar = hebrew[0];
  if (firstChar in prefixes) {
    return { char: firstChar, meaning: prefixes[firstChar as keyof typeof prefixes] };
  }

  return null;
}

testMorphology().catch(console.error);
