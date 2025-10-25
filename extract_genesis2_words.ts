import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function extractGenesis2Words() {
  console.log('📖 창세기 2장 단어 추출 중...\n');

  // Get all words from Genesis chapter 2
  const { data, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, korean, grammar, root, verse_id')
    .like('verse_id', 'genesis_2_%')
    .order('position', { ascending: true });

  if (error) {
    console.error('오류:', error);
    return;
  }

  console.log(`총 ${data?.length || 0}개 레코드\n`);

  // Get unique by meaning
  const uniqueByMeaning = new Map();
  data?.forEach(word => {
    if (!uniqueByMeaning.has(word.meaning)) {
      uniqueByMeaning.set(word.meaning, {
        id: word.id,
        hebrew: word.hebrew,
        meaning: word.meaning,
        korean: word.korean,
        grammar: word.grammar,
        root: word.root,
        verse_reference: word.verse_id
      });
    }
  });

  const uniqueWords = Array.from(uniqueByMeaning.values());

  console.log(`고유 의미: ${uniqueWords.length}개\n`);

  // Save to file
  const output = {
    summary: {
      total_records: data?.length || 0,
      unique_by_meaning: uniqueWords.length,
      chapter: 2,
      book: "genesis"
    },
    words: uniqueWords
  };

  writeFileSync('genesis2_words.json', JSON.stringify(output, null, 2));
  console.log('✅ genesis2_words.json 파일에 저장 완료\n');

  // Show first 10
  console.log('처음 10개 단어:\n');
  uniqueWords.slice(0, 10).forEach((w, i) => {
    console.log(`${i + 1}. "${w.meaning}" (${w.hebrew}) - ${w.korean}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 총 고유 단어: ${uniqueWords.length}개`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

extractGenesis2Words().catch(console.error);
