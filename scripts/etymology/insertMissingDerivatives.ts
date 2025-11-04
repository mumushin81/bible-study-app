/**
 * Insert manually created derivatives for 6 roots
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
  derivatives: DerivativeWord[];
}

async function insertMissingDerivatives() {
  console.log('🚀 누락된 6개 어근 파생어 삽입 시작\n');
  console.log('━'.repeat(80) + '\n');

  // 1. JSON 파일 읽기
  const jsonPath = path.join(__dirname, 'missing_derivatives.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data: { roots: RootData[] } = JSON.parse(rawData);

  console.log(`📂 ${data.roots.length}개 어근 데이터 로드 완료\n`);

  let successCount = 0;
  let failCount = 0;

  // 2. 각 어근 처리
  for (const rootData of data.roots) {
    console.log(`\n📝 처리 중: ${rootData.root} (${rootData.root_hebrew}) - ${rootData.strong_number}`);

    // hebrew_roots 테이블의 derivatives만 업데이트
    const { error: updateError } = await supabase
      .from('hebrew_roots')
      .update({
        derivatives: rootData.derivatives
      })
      .eq('root', rootData.root);

    if (updateError) {
      console.error(`   ❌ 업데이트 실패:`, updateError.message);
      failCount++;
      continue;
    }

    console.log(`   ✅ derivatives ${rootData.derivatives.length}개 업데이트 완료`);

    // 파생어 미리보기
    console.log(`   📖 파생어:`);
    rootData.derivatives.forEach((d, idx) => {
      console.log(`      ${idx + 1}. ${d.hebrew} (${d.korean}) - ${d.meaning}`);
    });

    successCount++;
  }

  console.log('\n' + '━'.repeat(80));
  console.log(`\n✅ 완료! (성공: ${successCount}개, 실패: ${failCount}개)\n`);

  // 3. 결과 확인
  console.log('📊 업데이트 결과 확인:\n');
  for (const rootData of data.roots) {
    const { data: root, error } = await supabase
      .from('hebrew_roots')
      .select('root, root_hebrew, derivatives')
      .eq('root', rootData.root)
      .single();

    if (error) {
      console.log(`   ❌ ${rootData.root}: 조회 실패`);
    } else if (root) {
      const derivCount = root.derivatives?.length || 0;
      console.log(`   ✅ ${root.root.padEnd(10)} | ${root.root_hebrew.padEnd(6)} | 파생어: ${derivCount}개`);
    }
  }

  console.log('\n' + '━'.repeat(80));
  console.log('🎉 누락된 파생어 삽입 완료!\n');
}

insertMissingDerivatives().catch(console.error);
