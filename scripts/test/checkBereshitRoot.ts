/**
 * בְּרֵאשִׁית 어근 필드 확인
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

async function checkRoot() {
  console.log('🔍 בְּרֵאשִׁית root 필드 확인\n');

  const { data: word } = await supabase
    .from('words')
    .select('hebrew, meaning, root, root_ipa')
    .eq('hebrew', 'בְּרֵאשִׁית')
    .single();

  if (!word) {
    console.error('❌ 단어를 찾을 수 없습니다');
    return;
  }

  console.log('='.repeat(100));
  console.log('\n📖 DB 데이터:\n');
  console.log(`전체 히브리어: ${word.hebrew}`);
  console.log(`의미: ${word.meaning}`);
  console.log(`root 필드: ${word.root}`);
  console.log(`root_ipa: ${word.root_ipa}`);

  console.log('\n\n🔤 글자 추출 테스트:\n');

  const rootHebrew = word.root.split('(')[0].trim();
  console.log(`1. 괄호 앞부분: "${rootHebrew}"`);

  const cleanRoot = rootHebrew.replace(/[\u0591-\u05C7]/g, '');
  console.log(`2. 모음 제거: "${cleanRoot}"`);

  const letters = cleanRoot.split('');
  console.log(`3. 글자 배열: [${letters.join(', ')}]`);
  console.log(`4. 글자 개수: ${letters.length}개`);

  console.log('\n\n✅ 기대값:\n');
  console.log('어근만 표시해야 함:');
  console.log('  רֵאשִׁית (레쉬트)');
  console.log('  모음 제거: ראשית');
  console.log('  글자: [ר, א, ש, י, ת]');
  console.log('  5글자');
  console.log('');
  console.log('❌ 잘못된 경우:');
  console.log('  בְּרֵאשִׁית (전체 단어)');
  console.log('  모음 제거: בראשית');
  console.log('  글자: [ב, ר, א, ש, י, ת]');
  console.log('  6글자');
  console.log('');

  if (letters.length === 5 && letters[0] === 'ר') {
    console.log('✅ 정상: 어근만 추출됨 (ב 접두사 제외됨)');
  } else if (letters.length === 6 && letters[0] === 'ב') {
    console.log('❌ 오류: 전체 단어가 추출됨 (ב 접두사 포함됨)');
    console.log('\n해결 방법: root 필드를 "רֵאשִׁית (레쉬트)"로 수정 필요');
  } else {
    console.log(`⚠️  예상치 못한 결과: ${letters.length}글자`);
  }

  console.log('\n' + '='.repeat(100));
}

checkRoot().catch(console.error);
