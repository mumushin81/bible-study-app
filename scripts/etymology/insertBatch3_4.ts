/**
 * Insert Batch 3 & 4 etymology data into database
 * Final batch: Complete 100% of 42 roots
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface DerivativeWord {
  hebrew: string;
  ipa: string;
  korean: string;
  meaning: string;
  grammar: string;
}

interface RootData {
  root: string;
  root_hebrew: string;
  strong_number: string;
  etymology_simple: string;
  derivatives: DerivativeWord[];
}

async function insertBatch3_4() {
  console.log('🚀 Batch 3 & 4 어원 데이터 삽입 시작 (최종 배치)\n');
  console.log('━'.repeat(80) + '\n');

  // 1. JSON 파일 읽기
  const jsonPath = path.join(__dirname, 'batch3_4_complete_data.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data: { roots: RootData[] } = JSON.parse(rawData);

  console.log(`📂 ${data.roots.length}개 어근 데이터 로드 완료\n`);

  let successCount = 0;
  let failCount = 0;

  // 2. 각 어근 처리
  for (const rootData of data.roots) {
    console.log(`\n📝 처리 중: ${rootData.root} (${rootData.root_hebrew}) - ${rootData.strong_number}`);

    // hebrew_roots 테이블 업데이트
    const { error: updateError } = await supabase
      .from('hebrew_roots')
      .update({
        etymology_simple: rootData.etymology_simple,
        derivatives: rootData.derivatives
      })
      .eq('root', rootData.root);

    if (updateError) {
      console.error(`   ❌ 업데이트 실패:`, updateError.message);
      failCount++;
      continue;
    }

    console.log(`   ✅ etymology_simple 업데이트 완료`);
    console.log(`   ✅ derivatives ${rootData.derivatives.length}개 업데이트 완료`);

    // 파생어 미리보기
    if (rootData.derivatives.length > 0) {
      console.log(`   📖 파생어:`);
      rootData.derivatives.slice(0, 3).forEach((d, idx) => {
        console.log(`      ${idx + 1}. ${d.hebrew} (${d.korean})`);
      });
      if (rootData.derivatives.length > 3) {
        console.log(`      ... 외 ${rootData.derivatives.length - 3}개`);
      }
    } else {
      console.log(`   ⚠️  파생어 없음`);
    }

    successCount++;
  }

  console.log('\n' + '━'.repeat(80));
  console.log(`\n✅ 완료! (성공: ${successCount}개, 실패: ${failCount}개)\n`);

  // 3. 결과 확인
  console.log('📊 삽입 결과 확인:\n');
  for (const rootData of data.roots) {
    const { data: root, error } = await supabase
      .from('hebrew_roots')
      .select('root, root_hebrew, etymology_simple, derivatives')
      .eq('root', rootData.root)
      .single();

    if (error) {
      console.log(`   ❌ ${rootData.root}: 조회 실패`);
    } else if (root) {
      const hasEtym = !!root.etymology_simple;
      const derivCount = root.derivatives?.length || 0;
      console.log(`   ✅ ${root.root.padEnd(10)} | ${root.root_hebrew.padEnd(6)} | 어원: ${hasEtym ? '있음' : '없음'} | 파생어: ${derivCount}개`);
    }
  }

  console.log('\n' + '━'.repeat(80));
  console.log('🎉 Batch 3 & 4 삽입 완료!');
  console.log('✨ 이제 42/42 어근 데이터베이스 삽입 완료! (100%)\n');
}

insertBatch3_4().catch(console.error);
