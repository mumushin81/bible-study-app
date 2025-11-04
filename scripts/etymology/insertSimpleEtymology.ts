/**
 * Insert simple etymology data into hebrew_roots.etymology_simple column
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

interface SimpleEtymologyData {
  root: string;
  root_hebrew: string;
  etymology_simple: string;
}

async function insertSimpleEtymology() {
  console.log('🚀 간단한 어원 데이터 삽입 시작\n');
  console.log('━'.repeat(80) + '\n');

  // 1. JSON 파일 읽기
  const jsonPath = path.join(__dirname, 'simple_etymology_data.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data: { roots: SimpleEtymologyData[] } = JSON.parse(rawData);

  console.log(`📂 ${data.roots.length}개 어근 데이터 로드 완료\n`);

  // 2. 각 어근 처리
  let successCount = 0;
  let failCount = 0;

  for (const rootData of data.roots) {
    console.log(`📝 처리 중: ${rootData.root} (${rootData.root_hebrew})`);

    const { error } = await supabase
      .from('hebrew_roots')
      .update({
        etymology_simple: rootData.etymology_simple
      })
      .eq('root', rootData.root);

    if (error) {
      console.error(`   ❌ 업데이트 실패:`, error.message);
      failCount++;
    } else {
      console.log(`   ✅ etymology_simple 업데이트 완료`);
      console.log(`   📝 "${rootData.etymology_simple.substring(0, 60)}..."\n`);
      successCount++;
    }
  }

  console.log('\n' + '━'.repeat(80));
  console.log(`\n✅ 완료! (성공: ${successCount}개, 실패: ${failCount}개)\n`);

  // 3. 결과 확인
  console.log('📊 삽입 결과 확인:\n');
  for (const rootData of data.roots) {
    const { data: root, error } = await supabase
      .from('hebrew_roots')
      .select('root, root_hebrew, etymology_simple')
      .eq('root', rootData.root)
      .single();

    if (error) {
      console.log(`   ❌ ${rootData.root}: 조회 실패`);
    } else if (root) {
      console.log(`   ✅ ${root.root.padEnd(10)} | ${root.root_hebrew.padEnd(6)} | ${root.etymology_simple ? '있음' : '없음'}`);
      if (root.etymology_simple) {
        console.log(`      "${root.etymology_simple.substring(0, 80)}..."\n`);
      }
    }
  }

  console.log('━'.repeat(80));
  console.log('✨ 완료!\n');
}

insertSimpleEtymology().catch(console.error);
