import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const LOCAL_DIR = 'output/genesis1_2';

// Word to filename mapping
const wordMapping: Record<string, string> = {
  'וְהָאָרֶץ': 'vehaaretz.jpg',
  'תֹהוּ וָבֹהוּ': 'tohu_vavohu.jpg',
  'וְחֹשֶׁךְ': 'vechoshech.jpg',
  'תְהוֹם': 'tehom.jpg',
  'רוּחַ אֱלֹהִים': 'ruach_elohim.jpg',
  'מְרַחֶפֶת': 'merachefet.jpg',
  'הַמָּיִם': 'hamayim.jpg',
};

async function uploadAndUpdateGenesis1_2() {
  console.log('🚀 Uploading Genesis 1:2 images and updating database...\n');

  // Get Genesis 1:2 words
  const { data: words, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning')
    .eq('verse_id', 'genesis_1_2')
    .order('position', { ascending: true });

  if (error) {
    console.error('❌ Error fetching words:', error);
    return;
  }

  console.log(`📊 Found ${words?.length || 0} words\n`);

  let uploadedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const word of words || []) {
    const filename = wordMapping[word.hebrew];

    if (!filename) {
      console.log(`⚠️  ${word.hebrew} - no mapping found, skipping`);
      skippedCount++;
      continue;
    }

    const localPath = join(LOCAL_DIR, filename);

    try {
      // Check if file already exists in Storage
      const storagePath = `word_icons/${filename}`;
      const { data: existingFile } = await supabase.storage
        .from('hebrew-icons')
        .list('word_icons', { search: filename });

      let shouldUpload = !existingFile || existingFile.length === 0;

      if (shouldUpload) {
        // Upload to Storage
        const fileBuffer = readFileSync(localPath);
        const { error: uploadError } = await supabase.storage
          .from('hebrew-icons')
          .upload(storagePath, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) {
          console.error(`❌ Upload failed for ${filename}:`, uploadError);
          continue;
        }

        console.log(`✅ Uploaded: ${filename}`);
        uploadedCount++;
      } else {
        console.log(`⏭️  Already exists: ${filename}`);
      }

      // Update database
      const iconUrl = `${supabaseUrl}/storage/v1/object/public/hebrew-icons/${storagePath}`;

      const { error: updateError } = await supabase
        .from('words')
        .update({ icon_url: iconUrl })
        .eq('id', word.id);

      if (updateError) {
        console.error(`❌ Database update failed for ${word.hebrew}:`, updateError);
      } else {
        console.log(`   → DB updated: ${word.hebrew}`);
        console.log(`   → ${iconUrl}`);
        updatedCount++;
      }

      console.log('');
    } catch (err) {
      console.error(`❌ Error processing ${word.hebrew}:`, err);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Uploaded: ${uploadedCount}`);
  console.log(`✅ DB updated: ${updatedCount}`);
  console.log(`⏭️  Skipped: ${skippedCount}`);
  console.log(`📊 Total: ${words?.length || 0}`);
}

uploadAndUpdateGenesis1_2();
