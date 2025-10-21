/**
 * Generate Genesis 5 Verse ID Mapping
 *
 * This script queries Supabase for existing Genesis 5 verses
 * and generates proper IDs for all verses (1-32) following the pattern.
 *
 * ID Pattern: genesis_5_1, genesis_5_2, ... genesis_5_32
 * Reference Pattern: 창세기 5:1, 창세기 5:2, ... 창세기 5:32
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

interface VerseMapping {
  verse_number: number;
  verse_id: string;
  reference: string;
  exists_in_db: boolean;
  existing_id?: string;
}

async function main() {
  console.log('🔍 Generating Genesis 5 verse ID mapping...\n');

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Query existing Genesis 5 verses
  const { data: existingVerses, error } = await supabase
    .from('verses')
    .select('id, reference')
    .ilike('reference', '창세기 5:%')
    .order('reference');

  if (error) {
    console.error('❌ Error querying Supabase:', error);
    process.exit(1);
  }

  console.log(`📊 Found ${existingVerses?.length || 0} existing Genesis 5 verses in database`);
  if (existingVerses && existingVerses.length > 0) {
    existingVerses.forEach(v => console.log(`   - ${v.id}: ${v.reference}`));
  }
  console.log('');

  // Generate complete mapping for verses 1-32
  const mapping: Record<number, VerseMapping> = {};
  const existingVerseMap = new Map<number, any>();

  // Parse existing verses
  existingVerses?.forEach(v => {
    const match = v.reference.match(/(\d+)$/);
    if (match) {
      const verseNum = parseInt(match[1]);
      // Prefer genesis_5_X format over gen5-X
      if (!existingVerseMap.has(verseNum) || v.id.startsWith('genesis_')) {
        existingVerseMap.set(verseNum, v);
      }
    }
  });

  // Create mapping for all 32 verses
  for (let i = 1; i <= 32; i++) {
    const standardId = `genesis_5_${i}`;
    const reference = `창세기 5:${i}`;
    const existingVerse = existingVerseMap.get(i);

    mapping[i] = {
      verse_number: i,
      verse_id: standardId,
      reference: reference,
      exists_in_db: !!existingVerse,
      existing_id: existingVerse?.id
    };
  }

  // Report results
  const existingCount = Object.values(mapping).filter(v => v.exists_in_db).length;
  const missingCount = 32 - existingCount;

  console.log('📋 Mapping Summary:');
  console.log(`   Total verses: 32`);
  console.log(`   Existing in DB: ${existingCount}`);
  console.log(`   Missing from DB: ${missingCount}\n`);

  // Show sample (first 5)
  console.log('📋 Sample mapping (first 5 entries):');
  for (let i = 1; i <= 5; i++) {
    const v = mapping[i];
    const status = v.exists_in_db ? `✅ exists (${v.existing_id})` : '❌ missing';
    console.log(`   ${i} -> ${v.verse_id} (${v.reference}) ${status}`);
  }
  console.log('');

  // Show existing verses
  if (existingCount > 0) {
    console.log('✅ Existing verses:');
    Object.values(mapping)
      .filter(v => v.exists_in_db)
      .forEach(v => {
        console.log(`   ${v.verse_number}: ${v.verse_id} (actual: ${v.existing_id})`);
      });
    console.log('');
  }

  // Show missing verses
  if (missingCount > 0) {
    console.log('❌ Missing verses (need to be created):');
    const missing = Object.values(mapping)
      .filter(v => !v.exists_in_db)
      .map(v => v.verse_number);
    console.log(`   ${missing.join(', ')}\n`);
  }

  // Save to JSON file
  const outputDir = path.join(process.cwd(), 'data', 'generated');
  const outputPath = path.join(outputDir, 'genesis_5_verse_id_mapping.json');

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputData = {
    generated_at: new Date().toISOString(),
    chapter: 'Genesis 5',
    total_verses: 32,
    existing_in_db: existingCount,
    missing_from_db: missingCount,
    id_pattern: 'genesis_5_N',
    reference_pattern: '창세기 5:N',
    mapping: mapping
  };

  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

  console.log('💾 Saved complete mapping to:');
  console.log(`   ${outputPath}\n`);

  // Also create a simple version (just verse_number -> verse_id)
  const simpleMapping: Record<number, string> = {};
  Object.entries(mapping).forEach(([verseNum, data]) => {
    simpleMapping[parseInt(verseNum)] = data.verse_id;
  });

  const simpleOutputPath = path.join(outputDir, 'genesis_5_verse_id_mapping_simple.json');
  fs.writeFileSync(simpleOutputPath, JSON.stringify(simpleMapping, null, 2));

  console.log('💾 Saved simple mapping (verse_num -> verse_id) to:');
  console.log(`   ${simpleOutputPath}\n`);

  console.log('✅ Complete!');
  console.log('\n📝 Note: Use these IDs when creating new Genesis 5 verse data.');
}

main().catch(console.error);
