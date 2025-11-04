/**
 * hebrew_roots 테이블 구조 및 데이터 확인
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

async function checkHebrewRoots() {
  console.log('🔍 hebrew_roots 테이블 확인\n');

  // 전체 데이터 조회
  const { data: roots, error } = await supabase
    .from('hebrew_roots')
    .select('*')
    .limit(20);

  if (error) {
    console.error('❌ 조회 실패:', error.message);
    return;
  }

  if (!roots || roots.length === 0) {
    console.log('⚠️  hebrew_roots 테이블이 비어있습니다.');
    return;
  }

  console.log(`✅ ${roots.length}개 어근 데이터 발견\n`);
  console.log('컬럼:', Object.keys(roots[0]).join(', '));
  console.log('\n' + '='.repeat(100) + '\n');

  // root_ipa가 있는 데이터와 없는 데이터 구분
  const withIpa = roots.filter(r => r.root_ipa);
  const withoutIpa = roots.filter(r => !r.root_ipa);

  console.log(`📊 통계:`);
  console.log(`   root_ipa 있음: ${withIpa.length}개`);
  console.log(`   root_ipa 없음: ${withoutIpa.length}개\n`);

  if (withIpa.length > 0) {
    console.log('✅ root_ipa가 있는 데이터:\n');
    withIpa.forEach(r => {
      console.log(`${r.root?.padEnd(15) || ''} | IPA: ${r.root_ipa}`);
    });
    console.log('');
  }

  if (withoutIpa.length > 0) {
    console.log(`⚠️  root_ipa가 없는 데이터 (첫 10개):\n`);
    withoutIpa.slice(0, 10).forEach(r => {
      console.log(`${r.root?.padEnd(15) || ''} | IPA: NULL`);
    });
  }

  // Genesis 1:1에 사용된 어근들 확인
  console.log('\n\n🎯 Genesis 1:1 단어들의 어근과 매칭:\n');

  const genesis1_1Roots = [
    'ב-ר-א',     // bara
    'אֱלֹהַּ',    // eloha
    'ש-מ-י',     // shamayim
    'א-ר-ץ'      // aretz
  ];

  for (const rootText of genesis1_1Roots) {
    const found = roots.find(r => r.root === rootText);
    if (found) {
      console.log(`✅ ${rootText.padEnd(15)} → IPA: ${found.root_ipa || 'NULL'}`);
    } else {
      console.log(`❌ ${rootText.padEnd(15)} → 테이블에 없음`);
    }
  }
}

checkHebrewRoots().catch(console.error);
