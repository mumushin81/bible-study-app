const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGenesis11to15() {
  console.log('🔍 Genesis 11-15장 데이터베이스 확인...\n');

  // 모든 책 확인
  const { data: allBooks } = await supabase
    .from('books')
    .select('id, name');

  console.log('📚 Available books:');
  allBooks?.forEach(book => console.log(`   - ${book.name} (${book.id})`));
  console.log();

  // Genesis book_id 확인 (한국어 이름 가능성)
  const { data: books } = await supabase
    .from('books')
    .select('id, name')
    .or('name.eq.Genesis,name.eq.창세기');

  if (!books || books.length === 0) {
    console.error('❌ Genesis book not found!');
    return;
  }

  const genesisBookId = books[0].id;
  console.log(`✅ Genesis book_id: ${genesisBookId}\n`);

  // 11-15장별로 구절 수 확인
  for (let chapter = 11; chapter <= 15; chapter++) {
    const { data: verses, error } = await supabase
      .from('verses')
      .select('id, chapter, verse_number, reference')
      .eq('book_id', genesisBookId)
      .eq('chapter', chapter)
      .order('verse_number');

    if (error) {
      console.error(`❌ Chapter ${chapter} error:`, error);
      continue;
    }

    if (!verses || verses.length === 0) {
      console.log(`❌ Chapter ${chapter}: No verses found`);
    } else {
      console.log(`✅ Chapter ${chapter}: ${verses.length} verses`);
      console.log(`   First verse: ${verses[0].reference}`);
      console.log(`   Last verse: ${verses[verses.length - 1].reference}`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 전체 통계');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const { data: allVerses, count } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true })
    .eq('book_id', genesisBookId)
    .gte('chapter', 11)
    .lte('chapter', 15);

  console.log(`총 구절 수 (11-15장): ${count || 0}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

checkGenesis11to15().catch(console.error);
