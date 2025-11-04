/**
 * Root IPA 데이터 확인 스크립트
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

async function checkRootIpa() {
  console.log('🔍 Root IPA 데이터 확인\n');

  // 1. hebrew_roots 테이블 확인
  const { data: roots, error: rootsError } = await supabase
    .from('hebrew_roots')
    .select('root, meaning, root_ipa')
    .limit(10);

  if (rootsError) {
    console.error('❌ hebrew_roots 테이블 조회 실패:', rootsError);
  } else if (roots) {
    console.log('📚 hebrew_roots 테이블 샘플:\n');
    roots.forEach(r => {
      console.log(`${r.root.padEnd(15)} | ${(r.meaning || '').padEnd(20)} | IPA: ${r.root_ipa || 'NULL'}`);
    });
  }

  // 2. Genesis 1:1 단어들의 root 필드 확인
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
    .select('hebrew, meaning, root')
    .eq('verse_id', verses.id)
    .order('position', { ascending: true });

  if (words) {
    console.log('\n\n📖 Genesis 1:1 단어들의 root 필드:\n');
    words.forEach(w => {
      const rootText = w.root.split('(')[0].trim();
      const pronunciation = w.root.match(/\(([^)]+)\)/)?.[1] || '';
      console.log(`${w.hebrew.padEnd(15)} | ${w.meaning.padEnd(20)} | Root: ${rootText.padEnd(15)} | 현재 발음: ${pronunciation}`);
    });
  }

  // 3. 데이터 매칭 가능성 확인
  console.log('\n\n💡 해결 방안:\n');
  console.log('현재 상황:');
  console.log('- words.root 필드: "ב-ר-א (bara)" 형식 (영어 로마자)');
  console.log('- hebrew_roots.root_ipa 필드: IPA 발음 (예: /baˈʁa/)');
  console.log('\n옵션 1: useWords.ts에서 hebrew_roots 테이블 조인');
  console.log('옵션 2: words.root 패턴을 IPA로 변환하는 매핑 함수');
}

checkRootIpa().catch(console.error);
