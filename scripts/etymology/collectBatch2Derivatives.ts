/**
 * Collect derivatives for Batch 2 roots from words table
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

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

async function collectDerivatives() {
  console.log('🔍 Batch 2 파생어 수집 시작\n');
  console.log('━'.repeat(80) + '\n');

  // 1. etymology_simple 데이터 로드
  const etymologyPath = path.join(__dirname, 'batch2_etymology_simple.json');
  const etymologyData = JSON.parse(fs.readFileSync(etymologyPath, 'utf-8'));

  const results: RootData[] = [];

  // 2. 각 어근의 파생어 수집
  for (const root of etymologyData.roots) {
    console.log(`📝 ${root.root} (${root.root_hebrew}) 처리 중...`);

    // words 테이블에서 해당 어근을 가진 단어들 조회
    const { data: words, error } = await supabase
      .from('words')
      .select('hebrew, ipa, korean, meaning, grammar, root')
      .or(`root.ilike.%${root.root}%,root.ilike.%${root.root_hebrew}%`)
      .limit(10);

    if (error) {
      console.error(`   ❌ 조회 실패:`, error.message);
      continue;
    }

    if (!words || words.length === 0) {
      console.log(`   ⚠️  파생어 없음`);
      results.push({
        root: root.root,
        root_hebrew: root.root_hebrew,
        strong_number: root.strong_number,
        etymology_simple: root.etymology_simple,
        derivatives: []
      });
      continue;
    }

    // 중복 제거 (히브리어 기준)
    const uniqueWords = new Map<string, any>();
    words.forEach(w => {
      if (!uniqueWords.has(w.hebrew)) {
        uniqueWords.set(w.hebrew, w);
      }
    });

    // 최대 5개 선택
    const derivatives: DerivativeWord[] = Array.from(uniqueWords.values())
      .slice(0, 5)
      .map(w => ({
        hebrew: w.hebrew,
        ipa: w.ipa,
        korean: w.korean,
        meaning: w.meaning,
        grammar: w.grammar
      }));

    console.log(`   ✅ 파생어 ${derivatives.length}개 수집`);
    derivatives.forEach((d, idx) => {
      console.log(`      ${idx + 1}. ${d.hebrew} (${d.korean}) - ${d.meaning}`);
    });
    console.log('');

    results.push({
      root: root.root,
      root_hebrew: root.root_hebrew,
      strong_number: root.strong_number,
      etymology_simple: root.etymology_simple,
      derivatives
    });
  }

  // 3. JSON 파일로 저장
  const outputPath = path.join(__dirname, 'batch2_complete_data.json');
  const outputData = {
    collected_at: new Date().toISOString().split('T')[0],
    batch: 2,
    roots_count: results.length,
    roots: results
  };

  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

  console.log('━'.repeat(80));
  console.log(`\n✅ Batch 2 수집 완료!`);
  console.log(`📁 저장 위치: ${outputPath}`);
  console.log(`📊 총 ${results.length}개 어근`);
  console.log(`📖 총 ${results.reduce((sum, r) => sum + r.derivatives.length, 0)}개 파생어\n`);
}

collectDerivatives().catch(console.error);
