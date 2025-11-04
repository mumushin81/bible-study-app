/**
 * 어근 스토리 IPA 표시 테스트
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

async function testRootIpaDisplay() {
  console.log('🔍 어근 스토리 IPA 표시 시뮬레이션\n');

  // Genesis 1:1 단어들 가져오기
  const { data: verses } = await supabase
    .from('verses')
    .select('id')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 1)
    .single();

  if (!verses) {
    console.error('❌ Genesis 1:1을 찾을 수 없습니다');
    return;
  }

  const { data: words } = await supabase
    .from('words')
    .select('hebrew, meaning, root, ipa, is_combined_form')
    .eq('verse_id', verses.id)
    .order('position', { ascending: true });

  if (!words) {
    console.error('❌ 단어를 가져올 수 없습니다');
    return;
  }

  console.log('='.repeat(100));

  words.forEach((word, idx) => {
    console.log(`\n${idx + 1}. ${word.hebrew} (${word.meaning})`);
    console.log(`   전체 IPA: ${word.ipa}`);
    console.log(`   결합형: ${word.is_combined_form ? 'YES' : 'NO'}`);

    // 어근 발음 추출 (FlashCard.tsx 로직과 동일)
    let rootPronunciation = word.ipa || '';

    if (word.is_combined_form && word.ipa) {
      const hebrew = word.hebrew;
      const originalIpa = rootPronunciation;

      if (hebrew.startsWith('ו')) {
        rootPronunciation = rootPronunciation.replace(/^və/, '').replace(/^ve/, '');
      }
      if (hebrew.startsWith('ב')) {
        rootPronunciation = rootPronunciation.replace(/^bə/, '').replace(/^be/, '');
      }
      if (hebrew.startsWith('ל')) {
        rootPronunciation = rootPronunciation.replace(/^lə/, '').replace(/^le/, '');
      }
      if (hebrew.startsWith('מ')) {
        rootPronunciation = rootPronunciation.replace(/^mə/, '').replace(/^me/, '');
      }
      if (hebrew.startsWith('כ')) {
        rootPronunciation = rootPronunciation.replace(/^kə/, '').replace(/^ke/, '');
      }
      if (hebrew.startsWith('ה')) {
        rootPronunciation = rootPronunciation.replace(/^ha/, '').replace(/^he/, '');
      }

      console.log(`   접두사 제거: ${originalIpa} → ${rootPronunciation}`);
    }

    console.log(`   ✨ 어근 스토리 표시: [${rootPronunciation}]`);

    // 어근 텍스트
    const rootHebrew = word.root.split('(')[0].trim();
    const cleanRoot = rootHebrew.replace(/[\u0591-\u05C7]/g, '');
    console.log(`   어근 히브리어: ${cleanRoot}`);
  });

  console.log('\n' + '='.repeat(100));
}

testRootIpaDisplay().catch(console.error);
