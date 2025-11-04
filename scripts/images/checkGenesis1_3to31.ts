import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGenesis1_3to31() {
  console.log('\n🔍 Genesis 1:3-31 이미지 상태 확인\n');

  // Get all words from Genesis 1:3-31
  const { data: words, error } = await supabase
    .from('words')
    .select('id, verse_id, position, hebrew, meaning, icon_url')
    .like('verse_id', 'genesis_1_%')
    .order('verse_id')
    .order('position');

  if (error) {
    console.error('❌ Error fetching words:', error);
    return;
  }

  // Filter for verses 3-31 only
  const wordsV3to31 = words.filter(word => {
    const verseMatch = word.verse_id.match(/genesis_1_(\d+)/);
    if (verseMatch) {
      const verseNum = parseInt(verseMatch[1]);
      return verseNum >= 3 && verseNum <= 31;
    }
    return false;
  });

  console.log(`📊 총 단어 수: ${wordsV3to31.length}`);

  const withImages = wordsV3to31.filter(w => w.icon_url);
  const withoutImages = wordsV3to31.filter(w => !w.icon_url);

  console.log(`✅ 이미지 있음: ${withImages.length} (${(withImages.length / wordsV3to31.length * 100).toFixed(1)}%)`);
  console.log(`❌ 이미지 없음: ${withoutImages.length} (${(withoutImages.length / wordsV3to31.length * 100).toFixed(1)}%)\n`);

  // Group by verse
  const byVerse = new Map<string, { total: number; withImage: number; withoutImage: number }>();

  wordsV3to31.forEach(word => {
    if (!byVerse.has(word.verse_id)) {
      byVerse.set(word.verse_id, { total: 0, withImage: 0, withoutImage: 0 });
    }
    const verse = byVerse.get(word.verse_id)!;
    verse.total++;
    if (word.icon_url) {
      verse.withImage++;
    } else {
      verse.withoutImage++;
    }
  });

  console.log('📖 구절별 상태:\n');
  const sortedVerses = Array.from(byVerse.entries()).sort((a, b) => {
    const aNum = parseInt(a[0].match(/genesis_1_(\d+)/)![1]);
    const bNum = parseInt(b[0].match(/genesis_1_(\d+)/)![1]);
    return aNum - bNum;
  });

  sortedVerses.forEach(([verseId, stats]) => {
    const percentage = (stats.withImage / stats.total * 100).toFixed(1);
    const status = stats.withoutImage === 0 ? '✅' : '❌';
    console.log(`${status} ${verseId}: ${stats.withImage}/${stats.total} (${percentage}%)`);
  });

  // Show sample words without images
  console.log('\n📝 이미지 없는 단어 샘플 (처음 20개):\n');
  withoutImages.slice(0, 20).forEach(word => {
    console.log(`  ${word.verse_id} [${word.position}] ${word.hebrew} (${word.meaning})`);
  });

  // Export words without images for generation
  console.log(`\n💾 이미지 생성이 필요한 단어 목록을 내보냅니다...\n`);

  const wordsForGeneration = withoutImages.map(w => ({
    id: w.id,
    verse_id: w.verse_id,
    position: w.position,
    hebrew: w.hebrew,
    meaning: w.meaning
  }));

  return {
    total: wordsV3to31.length,
    withImages: withImages.length,
    withoutImages: withoutImages.length,
    wordsForGeneration
  };
}

checkGenesis1_3to31().then(result => {
  if (result) {
    console.log(`\n✅ 완료: ${result.withoutImages}개 단어에 대한 이미지 생성 필요`);
  }
});
