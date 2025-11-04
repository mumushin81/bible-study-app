/**
 * Verify all 42 roots have etymology_simple and derivatives
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function verifyAllRoots() {
  console.log('🔍 전체 42개 어근 데이터 검증\n');
  console.log('━'.repeat(80) + '\n');

  const { data: roots, error } = await supabase
    .from('hebrew_roots')
    .select('root, root_hebrew, etymology_simple, derivatives')
    .order('root');

  if (error) {
    console.error('❌ 조회 실패:', error.message);
    process.exit(1);
  }

  if (!roots || roots.length === 0) {
    console.error('❌ 어근 데이터를 찾을 수 없습니다');
    process.exit(1);
  }

  console.log(`📊 총 ${roots.length}개 어근 발견\n`);

  let withEtymologyCount = 0;
  let withDerivativesCount = 0;
  let totalDerivatives = 0;
  const rootsWithoutEtymology: string[] = [];
  const rootsWithoutDerivatives: string[] = [];

  console.log('📋 어근별 상태:\n');
  console.log('─'.repeat(80));
  console.log('어근        | 히브리어 | 어원      | 파생어');
  console.log('─'.repeat(80));

  roots.forEach((root: any) => {
    const hasEtym = !!root.etymology_simple;
    const derivCount = root.derivatives?.length || 0;

    if (hasEtym) withEtymologyCount++;
    else rootsWithoutEtymology.push(root.root);

    if (derivCount > 0) {
      withDerivativesCount++;
      totalDerivatives += derivCount;
    } else {
      rootsWithoutDerivatives.push(root.root);
    }

    const etymStatus = hasEtym ? '✅ 있음' : '❌ 없음';
    const derivStatus = derivCount > 0 ? `✅ ${derivCount}개` : '⚠️  없음';

    console.log(
      `${root.root.padEnd(11)} | ${root.root_hebrew.padEnd(8)} | ${etymStatus.padEnd(9)} | ${derivStatus}`
    );
  });

  console.log('─'.repeat(80));
  console.log('\n━'.repeat(80));
  console.log('\n📈 최종 통계:\n');
  console.log(`✅ 전체 어근: ${roots.length}개`);
  console.log(`✅ 어원 설명 있음: ${withEtymologyCount}개 (${Math.round(withEtymologyCount / roots.length * 100)}%)`);
  console.log(`✅ 파생어 있음: ${withDerivativesCount}개 (${Math.round(withDerivativesCount / roots.length * 100)}%)`);
  console.log(`📖 총 파생어: ${totalDerivatives}개`);
  console.log(`📊 평균 파생어: ${(totalDerivatives / roots.length).toFixed(1)}개/어근`);

  if (rootsWithoutEtymology.length > 0) {
    console.log(`\n⚠️  어원 설명 없는 어근 (${rootsWithoutEtymology.length}개):`, rootsWithoutEtymology.join(', '));
  }

  if (rootsWithoutDerivatives.length > 0) {
    console.log(`\n⚠️  파생어 없는 어근 (${rootsWithoutDerivatives.length}개):`, rootsWithoutDerivatives.join(', '));
  }

  console.log('\n━'.repeat(80));

  if (withEtymologyCount === roots.length) {
    console.log('\n🎉 완벽합니다! 모든 어근에 어원 설명이 있습니다! (100%)');
  }

  if (withDerivativesCount === roots.length) {
    console.log('🎉 완벽합니다! 모든 어근에 파생어가 있습니다! (100%)');
  }

  console.log('\n✨ 검증 완료!\n');
}

verifyAllRoots().catch(console.error);
