/**
 * Insert collected etymology data into the database
 * Applies migration and inserts etymology + derivative words
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
  etymology: {
    summary: string;
    theological_significance: string;
    strong_data: any;
    bdb_data: any;
  };
  derivatives: DerivativeWord[];
}

async function insertEtymologyData() {
  console.log('🚀 어원 데이터 삽입 시작\n');
  console.log('━'.repeat(80) + '\n');

  // 1. JSON 파일 읽기
  const jsonPath = path.join(__dirname, 'collected_etymology_data.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data: { roots: RootData[] } = JSON.parse(rawData);

  console.log(`📂 ${data.roots.length}개 어근 데이터 로드 완료\n`);

  // 2. 각 어근 처리
  for (const rootData of data.roots) {
    console.log(`\n📝 처리 중: ${rootData.root} (${rootData.root_hebrew}) - ${rootData.strong_number}`);

    // 2.1 hebrew_roots 테이블 업데이트 (story + derivatives)
    const updatedStory = `${rootData.etymology.summary}\n\n신학적 의미: ${rootData.etymology.theological_significance}`;

    const { error: updateError } = await supabase
      .from('hebrew_roots')
      .update({
        story: updatedStory,
        derivatives: rootData.derivatives // ✨ 파생어 데이터 추가
      })
      .eq('root', rootData.root);

    if (updateError) {
      console.error(`   ❌ hebrew_roots 업데이트 실패:`, updateError.message);
      continue;
    }

    console.log(`   ✅ hebrew_roots 업데이트 완료`);

    // 2.2 어근 ID 가져오기
    const { data: rootRecord, error: rootError } = await supabase
      .from('hebrew_roots')
      .select('id')
      .eq('root', rootData.root)
      .single();

    if (rootError || !rootRecord) {
      console.error(`   ❌ 어근 ID 조회 실패`);
      continue;
    }

    const rootId = rootRecord.id;

    // 2.3 derivative_words 삽입 (최대 5개)
    let insertedCount = 0;
    for (const derivative of rootData.derivatives.slice(0, 5)) {
      const { error: insertError } = await supabase
        .from('derivative_words')
        .insert({
          root_id: rootId,
          hebrew: derivative.hebrew,
          ipa: derivative.ipa,
          korean: derivative.korean,
          meaning: derivative.meaning,
          grammar: derivative.grammar,
          importance: 4,
          bible_frequency: 0 // 추후 업데이트 가능
        });

      if (insertError) {
        // 중복 에러는 무시 (UNIQUE constraint)
        if (!insertError.message.includes('duplicate')) {
          console.error(`   ⚠️  파생어 삽입 실패 (${derivative.hebrew}):`, insertError.message);
        }
      } else {
        insertedCount++;
      }
    }

    console.log(`   ✅ 파생어 ${insertedCount}개 삽입 완료`);
  }

  console.log('\n' + '━'.repeat(80));
  console.log('\n✅ 모든 어원 데이터 삽입 완료!\n');

  // 3. 결과 확인
  console.log('📊 삽입 결과 확인:\n');
  for (const rootData of data.roots) {
    const { data: root } = await supabase
      .from('hebrew_roots')
      .select('root, root_hebrew, strong_number, etymology')
      .eq('root', rootData.root)
      .single();

    const { count } = await supabase
      .from('derivative_words')
      .select('*', { count: 'exact', head: true })
      .eq('root_id', (await supabase
        .from('hebrew_roots')
        .select('id')
        .eq('root', rootData.root)
        .single()).data?.id || '');

    console.log(`   ${root?.root.padEnd(10)} | Strong's: ${root?.strong_number || 'N/A'} | 파생어: ${count}개`);
  }

  console.log('\n━'.repeat(80));
  console.log('✨ 완료!\n');
}

insertEtymologyData().catch(console.error);
