/**
 * Genesis 1:1 단어들의 icon_url을 Supabase Storage의 기존 이미지로 업데이트
 *
 * 사용법: npx tsx scripts/utils/updateIconUrlsForGenesis1_1.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Genesis 1:1 word to file name mapping
const wordIconMapping: Record<string, string> = {
  'בְּרֵאשִׁית': 'bereshit.jpg',
  'בָּרָא': 'bara.jpg',
  'אֱלֹהִים': 'elohim.jpg',
  'אֵת': 'et.jpg',
  'הַשָּׁמַיִם': 'hashamayim.jpg',
  'וְאֵת': 'et.jpg', // Same as אֵת
  'הָאָרֶץ': 'haaretz.jpg',
};

async function updateIconUrls() {
  console.log('🔄 Updating icon URLs for Genesis 1:1...\n');

  // Get Genesis 1:1 words
  const { data: words, error: wordsError } = await supabase
    .from('words')
    .select('id, hebrew, meaning, icon_url')
    .eq('verse_id', 'genesis_1_1')
    .order('position', { ascending: true });

  if (wordsError) {
    console.error('❌ Error fetching words:', wordsError);
    return;
  }

  console.log(`📊 Found ${words?.length || 0} words\n`);

  let updated = 0;
  let skipped = 0;
  let alreadySet = 0;

  for (const word of words || []) {
    const fileName = wordIconMapping[word.hebrew];

    if (!fileName) {
      console.log(`⚠️  Skipping ${word.hebrew} - no mapping found`);
      skipped++;
      continue;
    }

    const iconUrl = `${supabaseUrl}/storage/v1/object/public/hebrew-icons/word_icons/${fileName}`;

    // Check if already set
    if (word.icon_url === iconUrl) {
      console.log(`✓ ${word.hebrew} - already set`);
      alreadySet++;
      continue;
    }

    // Update the word
    const { error: updateError } = await supabase
      .from('words')
      .update({ icon_url: iconUrl })
      .eq('id', word.id);

    if (updateError) {
      console.error(`❌ Failed to update ${word.hebrew}:`, updateError);
    } else {
      console.log(`✅ ${word.hebrew} (${word.meaning})`);
      console.log(`   → ${iconUrl}`);
      updated++;
    }
  }

  console.log('\n📈 Summary:');
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ✓ Already set: ${alreadySet}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
  console.log(`   📊 Total: ${words?.length || 0}`);
}

updateIconUrls();
