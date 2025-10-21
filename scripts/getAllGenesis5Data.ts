/**
 * Get complete data for all Genesis 5 verses
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

async function main() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🔍 Querying all Genesis 5 data...\n');

  // Try different approaches to find Genesis 5 verses

  // 1. Pattern match on reference
  const { data: patternData, error: patternError } = await supabase
    .from('verses')
    .select('id, reference, hebrew')
    .ilike('reference', '창세기 5:%')
    .order('id');

  console.log('1️⃣  Using pattern "창세기 5:%":');
  console.log(`   Found ${patternData?.length || 0} verses`);
  if (patternData && patternData.length > 0) {
    patternData.forEach(v => console.log(`   - ${v.id}: ${v.reference}`));
  }
  console.log('');

  // 2. Pattern match on ID
  const { data: idPatternData, error: idError } = await supabase
    .from('verses')
    .select('id, reference, hebrew')
    .ilike('id', 'gen%5%')
    .order('id');

  console.log('2️⃣  Using ID pattern "gen%5%":');
  console.log(`   Found ${idPatternData?.length || 0} verses`);
  if (idPatternData && idPatternData.length > 0) {
    const uniqueRefs = new Set(idPatternData.map(v => v.reference));
    console.log(`   Unique references: ${uniqueRefs.size}`);
    idPatternData.slice(0, 10).forEach(v => console.log(`   - ${v.id}: ${v.reference}`));
    if (idPatternData.length > 10) {
      console.log(`   ... and ${idPatternData.length - 10} more`);
    }
  }
  console.log('');

  // 3. Check for specific verse numbers
  const testVerses = [1, 5, 10, 15, 20, 25, 30, 32];
  console.log('3️⃣  Testing specific verse numbers:');
  for (const num of testVerses) {
    const ref = `창세기 5:${num}`;
    const { data } = await supabase
      .from('verses')
      .select('id, reference')
      .eq('reference', ref);

    if (data && data.length > 0) {
      console.log(`   ✅ ${ref}: found ${data.length} match(es)`);
      data.forEach(v => console.log(`      - ID: ${v.id}`));
    } else {
      console.log(`   ❌ ${ref}: not found`);
    }
  }
  console.log('');

  // 4. Count total verses in database
  const { count } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total verses in database: ${count}`);

  // Save comprehensive data
  const outputData = {
    generated_at: new Date().toISOString(),
    total_database_verses: count,
    genesis_5_pattern_match: patternData,
    genesis_5_id_pattern: idPatternData,
  };

  const outputPath = path.join(process.cwd(), 'data', 'generated', 'genesis_5_comprehensive_check.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`\n💾 Saved comprehensive data to: ${outputPath}`);
}

main();
