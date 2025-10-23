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

async function checkEmptyContent() {
  console.log('🔍 Genesis 11-15 빈 콘텐츠 확인 중...\n');

  for (let chapter = 11; chapter <= 15; chapter++) {
    const { data, error } = await supabase
      .from('verses')
      .select('id, reference, ipa, modern')
      .like('id', `genesis_${chapter}_%`)
      .order('id');

    if (error) {
      console.error(`❌ Chapter ${chapter} 조회 실패:`, error);
      continue;
    }

    const empty = data?.filter(v => !v.ipa || v.ipa.trim() === '' || !v.modern || v.modern.trim() === '') || [];
    const total = data?.length || 0;

    console.log(`📖 Genesis ${chapter}:`);
    console.log(`   전체: ${total}개`);
    console.log(`   빈 콘텐츠: ${empty.length}개`);

    if (empty.length > 0) {
      console.log(`   빈 구절: ${empty.map(v => v.reference || v.id).join(', ')}`);
    }
    console.log('');
  }
}

checkEmptyContent().catch(console.error);
