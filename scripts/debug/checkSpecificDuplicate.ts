/**
 * CHECK SPECIFIC DUPLICATE
 *
 * Check the specific duplicate that failed the UNIQUE constraint
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('======================================================================');
  console.log('🔍 CHECKING SPECIFIC DUPLICATE FROM ERROR');
  console.log('======================================================================\n');

  // The error said: Key (hebrew, verse_id)=(בֵּינְךָ וּבֵין הָאִשָּׁה, genesis_3_15) is duplicated

  const targetHebrew = 'בֵּינְךָ וּבֵין הָאִשָּׁה';
  const targetVerse = 'genesis_3_15';

  console.log(`Hebrew: ${targetHebrew}`);
  console.log(`Verse: ${targetVerse}\n`);

  const { data: words, error } = await supabase
    .from('words')
    .select('*')
    .eq('hebrew', targetHebrew)
    .eq('verse_id', targetVerse);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Found ${words?.length || 0} records\n`);

  if (words && words.length > 1) {
    console.log('📋 ALL COPIES:');
    console.log('----------------------------------------------------------------------');
    words.forEach((w, i) => {
      console.log(`\n${i + 1})`);
      console.log(`   ID: ${w.id}`);
      console.log(`   Hebrew: ${w.hebrew}`);
      console.log(`   Verse ID: ${w.verse_id}`);
      console.log(`   Position: ${w.position}`);
      console.log(`   Meaning: ${w.meaning}`);
      console.log(`   Created: ${w.created_at}`);
    });

    console.log('\n----------------------------------------------------------------------');
    console.log(`\n❌ DUPLICATE CONFIRMED - ${words.length} copies exist`);
    console.log('\n💡 Action: Delete all but the earliest record');

    // Sort by created_at
    const sorted = [...words].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    console.log(`\n✅ KEEP: ${sorted[0].id} (created: ${sorted[0].created_at})`);
    console.log(`\n🗑️  DELETE:`);
    sorted.slice(1).forEach((w, i) => {
      console.log(`   ${i + 1}) ${w.id} (created: ${w.created_at})`);
    });
  } else if (words && words.length === 1) {
    console.log('✅ Only 1 record found - no duplicate');
    console.log(JSON.stringify(words[0], null, 2));
  } else {
    console.log('⚠️  No records found');
  }

  console.log('\n======================================================================');
  console.log('CHECKING ALL genesis_3_15 WORDS');
  console.log('======================================================================\n');

  const { data: allVerseWords, error: verseError } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, position, created_at')
    .eq('verse_id', targetVerse);

  if (verseError) {
    console.error('❌ Error:', verseError);
    return;
  }

  console.log(`Total words in Genesis 3:15: ${allVerseWords?.length || 0}\n`);

  // Group by hebrew
  const byHebrew = new Map<string, any[]>();
  allVerseWords?.forEach(w => {
    if (!byHebrew.has(w.hebrew)) {
      byHebrew.set(w.hebrew, []);
    }
    byHebrew.get(w.hebrew)!.push(w);
  });

  const duplicatesInVerse = Array.from(byHebrew.entries())
    .filter(([_, list]) => list.length > 1);

  if (duplicatesInVerse.length > 0) {
    console.log(`❌ Found ${duplicatesInVerse.length} duplicate Hebrew words in this verse:\n`);
    duplicatesInVerse.forEach(([hebrew, list]) => {
      console.log(`   "${hebrew}": ${list.length} copies`);
    });
  } else {
    console.log('✅ No duplicates in this verse');
  }

  console.log('\n======================================================================');
}

main().catch(console.error);
