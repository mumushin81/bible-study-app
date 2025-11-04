/**
 * בְּרֵאשִׁית 실제 DB 데이터 확인
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

async function checkActualData() {
  console.log('🔍 בְּרֵאשִׁית (태초에) 실제 DB 데이터\n');

  const { data: words } = await supabase
    .from('words')
    .select('hebrew, meaning, root, ipa, root_ipa')
    .eq('hebrew', 'בְּרֵאשִׁית')
    .single();

  if (!words) {
    console.error('❌ 단어를 찾을 수 없습니다');
    return;
  }

  console.log('='.repeat(100));
  console.log('\n📖 DB 실제 데이터:\n');
  console.log(`전체 히브리어: ${words.hebrew}`);
  console.log(`의미: ${words.meaning}`);
  console.log(`root 필드: ${words.root}`);
  console.log(`ipa 필드 (전체 단어): ${words.ipa}`);
  console.log(`root_ipa 필드 (어근만): ${words.root_ipa}`);

  console.log('\n\n❌ 문제 지적:\n');
  console.log('전체 단어: בְּרֵאשִׁית');
  console.log('  └─ ב (bet) = 접두사 "~에"');
  console.log('  └─ רֵאשִׁית = 어근 "시작, 처음"');

  console.log('\n어근 스토리에서 표시해야 할 것:');
  console.log('  ✅ 어근 히브리어: רֵאשִׁית (reshit)');
  console.log('  ✅ 어근 IPA: reˈʃit');
  console.log('  ❌ 전체 단어 IPA: bəreʃit (X)');

  console.log('\n현재 코드 로직:');
  const rootHebrew = words.root.split('(')[0].trim();
  console.log(`root 필드에서 추출: "${rootHebrew}"`);

  const cleanRoot = rootHebrew.replace(/[\u0591-\u05C7]/g, '');
  console.log(`모음 기호 제거: "${cleanRoot}"`);
  console.log(`글자 수: ${cleanRoot.length}개`);
  console.log(`글자들: ${cleanRoot.split('').join(', ')}`);

  const rootPronunciation = words.root_ipa || words.ipa || '';
  console.log(`\n사용할 발음: ${rootPronunciation}`);

  if (rootPronunciation === words.root_ipa) {
    console.log('✅ root_ipa 사용 (정확함)');
  } else if (rootPronunciation === words.ipa) {
    console.log('❌ 전체 IPA 사용 (잘못됨!)');
  }

  console.log('\n' + '='.repeat(100));
}

checkActualData().catch(console.error);
