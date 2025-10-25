import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStructure() {
  console.log('🔍 데이터베이스 구조 확인\n');

  // Check words table sample
  const { data: words } = await supabase
    .from('words')
    .select('*')
    .limit(3);

  console.log('📋 Words 테이블 샘플:\n');
  console.log(JSON.stringify(words?.[0], null, 2));

  // Check verses table sample
  const { data: verses } = await supabase
    .from('verses')
    .select('*')
    .limit(3);

  console.log('\n\n📋 Verses 테이블 샘플:\n');
  console.log(JSON.stringify(verses?.[0], null, 2));

  // Count total
  const { count: wordCount } = await supabase
    .from('words')
    .select('id', { count: 'exact', head: true });

  const { count: verseCount } = await supabase
    .from('verses')
    .select('id', { count: 'exact', head: true });

  console.log('\n\n📊 테이블 카운트:');
  console.log(`   Words: ${wordCount}개`);
  console.log(`   Verses: ${verseCount}개`);
}

checkStructure().catch(console.error);
