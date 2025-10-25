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

async function checkMeanings() {
  // Test specific meaning
  const testMeaning = "그리고 땅의 모든 짐승에게";
  console.log(`테스트 의미: "${testMeaning}"\n`);

  const { data, error } = await supabase
    .from('words')
    .select('hebrew, meaning, icon_svg')
    .eq('meaning', testMeaning);

  if (error) {
    console.error('오류:', error);
  } else {
    console.log(`찾은 레코드 수: ${data?.length || 0}`);
    if (data && data.length > 0) {
      console.log('\n첫 번째 레코드:');
      console.log(JSON.stringify(data[0], null, 2));
    }
  }

  // Get sample Genesis 1 meanings
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('창세기 1장 샘플 의미들 (처음 10개):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const { data: genesis } = await supabase
    .from('words')
    .select('meaning')
    .eq('verses.book_id', 1)
    .eq('verses.chapter', 1)
    .limit(10);

  genesis?.forEach((row, i) => {
    console.log(`${i + 1}. "${row.meaning}"`);
  });
}

checkMeanings().catch(console.error);
