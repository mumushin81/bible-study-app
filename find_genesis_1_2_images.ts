import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readdirSync, existsSync } from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const STORAGE_BASE_URL = `${supabaseUrl}/storage/v1/object/public/hebrew-icons/icons`;
const LOCAL_DIR = 'output/all_words_jpg';

async function findGenesis1_2Images() {
  console.log('🔍 Finding images for Genesis 1:2 words...\n');

  // Get Genesis 1:2 words
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning')
    .eq('verse_id', 'genesis_1_2')
    .order('position', { ascending: true });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Genesis 1:2: ${words?.length || 0} words\n`);

  // Check local files
  let localFiles: string[] = [];
  if (existsSync(LOCAL_DIR)) {
    localFiles = readdirSync(LOCAL_DIR).filter(f => f.endsWith('.jpg'));
    console.log(`📁 Local files: ${localFiles.length}\n`);
  }

  // Build UUID map
  const uuidMap = new Map<string, string>();
  localFiles.forEach(filename => {
    const match = filename.match(/word_(.+)\.jpg/);
    if (match) {
      const uuid = match[1].replace(/_/g, '-');
      uuidMap.set(uuid, filename);
    }
  });

  // Check Storage word_icons folder for name-based files
  const { data: wordIconFiles } = await supabase.storage
    .from('hebrew-icons')
    .list('word_icons', { limit: 100 });

  console.log(`📦 Storage word_icons: ${wordIconFiles?.length || 0} files\n`);

  // Check each word
  console.log('🔎 Checking matches:\n');

  let matchCount = 0;
  const updates: Array<{ id: string; hebrew: string; iconUrl: string }> = [];

  for (const word of words || []) {
    console.log(`${word.hebrew} (${word.meaning})`);

    // Check UUID match (local)
    if (uuidMap.has(word.id)) {
      const filename = uuidMap.get(word.id)!;
      const iconUrl = `${STORAGE_BASE_URL}/${filename}`;
      console.log(`   ✅ Found in local: ${filename}`);
      updates.push({ id: word.id, hebrew: word.hebrew, iconUrl });
      matchCount++;
    } else {
      console.log(`   ❌ Not found`);
    }
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Match Summary: ${matchCount}/${words?.length || 0} words`);

  if (updates.length > 0) {
    console.log('\n💡 Ready to update these words:');
    updates.forEach((u, idx) => {
      console.log(`   ${idx + 1}. ${u.hebrew}`);
      console.log(`      → ${u.iconUrl}`);
    });

    return updates;
  } else {
    console.log('\n⚠️  No matches found. These words may need new images.');
  }
}

findGenesis1_2Images();
