import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from project root
dotenv.config({ path: join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVerses() {
  console.log('🔍 Genesis 11-15 구절 확인 중...\n');

  for (let chapter = 11; chapter <= 15; chapter++) {
    const { data, error } = await supabase
      .from('verses')
      .select('verse_id')
      .like('verse_id', `genesis_${chapter}_%`)
      .order('verse_id');

    if (error) {
      console.error(`❌ Chapter ${chapter} 조회 실패:`, error);
      continue;
    }

    console.log(`\n📖 Genesis ${chapter}: ${data?.length || 0}개 구절`);
    if (data && data.length > 0) {
      console.log('   구절:', data.map(v => v.verse_id.replace('genesis_', '')).join(', '));
    }
  }

  // Check missing verses
  console.log('\n\n🔍 비어있는 구절 확인...\n');

  const expectedVerses = {
    11: 32,
    12: 20,
    13: 18,
    14: 24,
    15: 21
  };

  for (const [chapter, totalVerses] of Object.entries(expectedVerses)) {
    const { data } = await supabase
      .from('verses')
      .select('verse_id')
      .like('verse_id', `genesis_${chapter}_%`)
      .order('verse_id');

    const existingVerses = new Set(data?.map(v => {
      const match = v.verse_id.match(/_(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    }) || []);

    const missing = [];
    for (let i = 1; i <= totalVerses; i++) {
      if (!existingVerses.has(i)) {
        missing.push(i);
      }
    }

    if (missing.length > 0) {
      console.log(`❌ Genesis ${chapter}: ${missing.length}개 누락`);
      console.log(`   누락 구절: ${missing.join(', ')}`);
    } else {
      console.log(`✅ Genesis ${chapter}: 모두 완료 (${totalVerses}/${totalVerses})`);
    }
  }
}

checkVerses().catch(console.error);
