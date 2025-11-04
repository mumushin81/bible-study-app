/**
 * Genesis 1:1 단어들만 상세 확인
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

async function checkGenesis1_1() {
  console.log('🔍 Genesis 1:1 단어 상세 확인\n');

  // Genesis 1:1 구절 찾기
  const { data: verse, error: verseError } = await supabase
    .from('verses')
    .select('id, reference')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 1)
    .single();

  if (verseError || !verse) {
    console.error('❌ Genesis 1:1을 찾을 수 없습니다:', verseError);
    return;
  }

  console.log(`✅ 구절: ${verse.reference} (ID: ${verse.id})\n`);

  // 해당 구절의 모든 단어 가져오기
  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select('id, hebrew, meaning, root, ipa, root_ipa, is_combined_form, position')
    .eq('verse_id', verse.id)
    .order('position', { ascending: true });

  if (wordsError || !words) {
    console.error('❌ 단어를 가져올 수 없습니다:', wordsError);
    return;
  }

  console.log(`총 ${words.length}개 단어:\n`);
  console.log('='.repeat(120));

  words.forEach((word, idx) => {
    console.log(`\n${idx + 1}. ${word.hebrew} (${word.meaning})`);
    console.log(`   어근: ${word.root}`);
    console.log(`   전체 IPA: ${word.ipa || 'NULL'}`);
    console.log(`   어근 IPA: ${word.root_ipa || 'NULL'}`);
    console.log(`   결합형: ${word.is_combined_form ? 'YES' : 'NO'}`);

    // 정확성 체크
    if (!word.root_ipa) {
      console.log(`   ❌ root_ipa가 NULL`);
    } else if (word.is_combined_form && word.root_ipa === word.ipa) {
      console.log(`   ⚠️  결합형인데 root_ipa가 전체 IPA와 동일`);
    } else {
      console.log(`   ✅ 정상`);
    }
  });

  console.log('\n' + '='.repeat(120));

  // 예상 결과와 비교
  console.log('\n📋 예상되는 정확한 root_ipa:\n');
  const expected = [
    { hebrew: 'בְּרֵאשִׁית', expected_root_ipa: 'reˈʃit', note: '접두사 ב 제거' },
    { hebrew: 'בָּרָא', expected_root_ipa: 'baˈra', note: '단독형, 전체 IPA와 동일' },
    { hebrew: 'אֱלֹהִים', expected_root_ipa: 'ʔɛloˈhim', note: '단독형' },
    { hebrew: 'אֵת', expected_root_ipa: 'ʔet', note: '단독형' },
    { hebrew: 'הַשָּׁמַיִם', expected_root_ipa: 'ʃaˈmajim', note: '접두사 ה 제거' },
    { hebrew: 'וְאֵת', expected_root_ipa: 'ʔet', note: '접두사 ו 제거' },
    { hebrew: 'הָאָרֶץ', expected_root_ipa: 'ʔeˈrets', note: '접두사 ה 제거, 정확한 어근 발음' }
  ];

  expected.forEach((exp, idx) => {
    const actual = words.find(w => w.hebrew === exp.hebrew);
    if (actual) {
      const match = actual.root_ipa === exp.expected_root_ipa;
      console.log(`${idx + 1}. ${exp.hebrew.padEnd(15)} | 예상: ${exp.expected_root_ipa.padEnd(15)} | 실제: ${(actual.root_ipa || 'NULL').padEnd(15)} | ${match ? '✅' : '❌'} | ${exp.note}`);
    } else {
      console.log(`${idx + 1}. ${exp.hebrew.padEnd(15)} | ❌ 단어를 찾을 수 없음`);
    }
  });

  console.log('\n');
}

checkGenesis1_1().catch(console.error);
