/**
 * 음절 분리 로직 테스트
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

// FlashCard.tsx 로직 복제
function separateSyllables(rootPronunciation: string): string[] {
  const syllables: string[] = [];
  const vowels = /[aeiouəɔɛʊɪæɑʌɒ]/i;

  // 강세 기호로 먼저 분리
  const stressSplit = rootPronunciation.split('ˈ');

  if (stressSplit.length > 1) {
    // 강세가 있는 경우
    syllables.push(stressSplit[0]); // 첫 음절 (강세 없음)
    for (let i = 1; i < stressSplit.length; i++) {
      syllables.push('ˈ' + stressSplit[i]); // 강세 포함
    }
  } else {
    // 강세가 없으면 모음 기준으로 음절 분리
    let current = '';
    let hasVowel = false;

    for (let i = 0; i < rootPronunciation.length; i++) {
      const char = rootPronunciation[i];
      current += char;

      if (vowels.test(char)) {
        hasVowel = true;
      } else if (hasVowel && i < rootPronunciation.length - 1) {
        // 모음 다음에 자음이 오면 새 음절 시작 가능성
        const nextChar = rootPronunciation[i + 1];
        if (vowels.test(nextChar)) {
          syllables.push(current);
          current = '';
          hasVowel = false;
        }
      }
    }

    if (current) syllables.push(current);
  }

  return syllables;
}

async function testSyllableSeparation() {
  console.log('🎵 음절 분리 로직 테스트\n');

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
    .select('hebrew, meaning, root, root_ipa, ipa')
    .eq('verse_id', verses.id)
    .order('position', { ascending: true });

  if (!words) {
    console.error('❌ 단어를 가져올 수 없습니다');
    return;
  }

  console.log('='.repeat(120));

  words.forEach((word, idx) => {
    const rootHebrew = word.root.split('(')[0].trim();
    const cleanRoot = rootHebrew.replace(/[\u0591-\u05C7]/g, '');
    const letters = cleanRoot.split('');
    const rootPronunciation = word.root_ipa || word.ipa || '';

    console.log(`\n${idx + 1}. ${word.hebrew} (${word.meaning})`);
    console.log(`   어근 히브리어: ${rootHebrew} (${letters.length}글자)`);
    console.log(`   어근 IPA: ${rootPronunciation}`);

    // 음절 분리
    const syllables = separateSyllables(rootPronunciation);
    console.log(`   음절 분리: ${syllables.join(' + ')} (${syllables.length}음절)`);

    // 글자 그룹화
    const letterGroups: string[][] = [];
    if (syllables.length > 0) {
      const lettersPerSyllable = Math.ceil(letters.length / syllables.length);
      for (let i = 0; i < syllables.length; i++) {
        const start = i * lettersPerSyllable;
        const end = Math.min(start + lettersPerSyllable, letters.length);
        letterGroups.push(letters.slice(start, end));
      }
    }

    console.log(`   글자 그룹화:`);
    letterGroups.forEach((group, i) => {
      console.log(`      음절 ${i + 1}: [${group.join(', ')}] → ${syllables[i]}`);
    });

    // 시각적 표현
    console.log(`   플래시카드 표시:`);
    const display = letterGroups.map((group, i) => {
      return `${group.join('')}\n      ↓\n      ${syllables[i]}`;
    }).join('   ');
    console.log(`      ${display}`);
  });

  console.log('\n' + '='.repeat(120));
}

testSyllableSeparation().catch(console.error);
