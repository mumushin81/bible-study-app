import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWordDuplicates() {
  console.log('🔍 Checking for word duplicates in database...\n');
  console.log('='.repeat(70));

  // Get all words without JOIN
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, position, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching words:', error.message);
    return;
  }

  if (!words || words.length === 0) {
    console.log('No words found in database.');
    return;
  }

  console.log(`\n📊 Total words in database: ${words.length}\n`);

  // Group by (hebrew, verse_id) to find duplicates
  const groupMap = new Map<string, any[]>();

  words.forEach((word) => {
    const key = `${word.hebrew}::${word.verse_id}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(word);
  });

  // Find duplicates
  const duplicates = Array.from(groupMap.entries())
    .filter(([_, wordList]) => wordList.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

  console.log(`📊 Analysis Results:`);
  console.log(`   Unique (hebrew, verse_id) combinations: ${groupMap.size}`);
  console.log(`   Duplicate combinations: ${duplicates.length}`);
  console.log(`   Total duplicate records: ${duplicates.reduce((sum, [_, list]) => sum + list.length - 1, 0)}\n`);

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found! Database is clean.\n');
    console.log('='.repeat(70));
    return;
  }

  console.log('⚠️  Duplicates found!\n');
  console.log('='.repeat(70));
  console.log('\n📋 Top 10 duplicates (by count):\n');

  duplicates.slice(0, 10).forEach(([key, wordList], index) => {
    const [hebrew, verseId] = key.split('::');
    console.log(`${index + 1}. Hebrew: "${hebrew}" | Verse: ${verseId}`);
    console.log(`   Count: ${wordList.length} duplicates`);
    console.log(`   IDs: ${wordList.map(w => w.id.substring(0, 8)).join(', ')}...`);
    console.log(`   Positions: ${wordList.map(w => w.position).join(', ')}`);
    console.log('');
  });

  // Analyze by verse_id
  console.log('='.repeat(70));
  console.log('\n📖 Duplicates by verse:\n');

  const verseMap = new Map<string, number>();
  duplicates.forEach(([key, wordList]) => {
    const [_, verseId] = key.split('::');
    verseMap.set(verseId, (verseMap.get(verseId) || 0) + (wordList.length - 1));
  });

  const topVerses = Array.from(verseMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  topVerses.forEach(([verseId, count], index) => {
    console.log(`${index + 1}. Verse: ${verseId} - ${count} duplicate records`);
  });

  console.log('\n' + '='.repeat(70));
}

checkWordDuplicates().catch(console.error);
