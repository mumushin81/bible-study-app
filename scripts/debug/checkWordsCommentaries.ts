import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from project root
dotenv.config({ path: join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWordsCommentaries() {
  console.log('🔍 Genesis 11-15 Words & Commentaries 확인 중...\n');

  for (let chapter = 11; chapter <= 15; chapter++) {
    // Get all verses for this chapter
    const { data: verses, error: versesError } = await supabase
      .from('verses')
      .select('id, reference')
      .like('id', `genesis_${chapter}_%`)
      .order('id');

    if (versesError) {
      console.error(`❌ Chapter ${chapter} verses 조회 실패:`, versesError);
      continue;
    }

    let versesWithoutWords = 0;
    let versesWithoutCommentaries = 0;

    for (const verse of verses || []) {
      // Check words
      const { data: words } = await supabase
        .from('words')
        .select('id')
        .eq('verse_id', verse.id);

      if (!words || words.length === 0) {
        versesWithoutWords++;
      }

      // Check commentaries
      const { data: commentary } = await supabase
        .from('commentaries')
        .select('id')
        .eq('verse_id', verse.id)
        .single();

      if (!commentary) {
        versesWithoutCommentaries++;
      }
    }

    console.log(`📖 Genesis ${chapter}:`);
    console.log(`   전체 구절: ${verses?.length || 0}개`);
    console.log(`   Words 없는 구절: ${versesWithoutWords}개`);
    console.log(`   Commentary 없는 구절: ${versesWithoutCommentaries}개`);
    console.log('');
  }
}

checkWordsCommentaries().catch(console.error);
