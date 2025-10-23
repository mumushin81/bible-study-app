import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

(async () => {
  console.log('🔍 word_derivations 테이블 상세 분석\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 전체 개수
  const { count: totalCount } = await supabase
    .from('word_derivations')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 전체 파생어 매핑: ${totalCount}개\n`);

  // 1. Binyan/Pattern 정보가 있는 파생어 (기존 하드코딩)
  const { count: withBinyanCount } = await supabase
    .from('word_derivations')
    .select('*', { count: 'exact', head: true })
    .not('binyan', 'is', null);

  const { data: withBinyan } = await supabase
    .from('word_derivations')
    .select(`
      id,
      binyan,
      pattern,
      derivation_note,
      word:word_id (hebrew, meaning)
    `)
    .not('binyan', 'is', null)
    .limit(5);

  console.log('1️⃣  Binyan/Pattern 정보가 있는 파생어 (기존 하드코딩):');
  console.log(`   총 개수: ${withBinyanCount}개`);
  if (withBinyan && withBinyan.length > 0) {
    console.log('   예시:');
    withBinyan.forEach((d: any) => {
      console.log(`   • ${d.word.hebrew} - ${d.word.meaning}`);
      console.log(`     Binyan: ${d.binyan}, Pattern: ${d.pattern}`);
      console.log(`     Note: ${d.derivation_note || '없음'}`);
      console.log('');
    });
  } else {
    console.log('   ❌ 없음 - 모든 하드코딩 데이터가 삭제되었습니다.\n');
  }

  // 2. Binyan/Pattern 정보가 없는 파생어 (자동 매핑)
  const { count: withoutBinyanCount } = await supabase
    .from('word_derivations')
    .select('*', { count: 'exact', head: true })
    .is('binyan', null);

  const { data: withoutBinyan } = await supabase
    .from('word_derivations')
    .select(`
      id,
      binyan,
      pattern,
      derivation_note,
      word:word_id (hebrew, meaning)
    `)
    .is('binyan', null)
    .limit(5);

  console.log('\n2️⃣  자동 매핑된 파생어:');
  console.log(`   총 개수: ${withoutBinyanCount}개`);
  if (withoutBinyan && withoutBinyan.length > 0) {
    console.log('   예시:');
    withoutBinyan.forEach((d: any) => {
      console.log(`   • ${d.word.hebrew} - ${d.word.meaning}`);
      console.log(`     Binyan: ${d.binyan || 'null'}`);
      console.log(`     Pattern: ${d.pattern || 'null'}`);
      console.log(`     Note: ${d.derivation_note}`);
      console.log('');
    });
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 요약:');
  console.log(`   전체: ${totalCount}개`);
  console.log(`   하드코딩 (Binyan 있음): ${withBinyanCount}개`);
  console.log(`   자동 매핑 (Binyan 없음): ${withoutBinyanCount}개`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(0);
})();
