import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeIconCoverage() {
  console.log('📊 Analyzing icon_svg coverage by chapter...\n');

  // Get all verses with word counts
  const { data: verses, error } = await supabase
    .from('verses')
    .select('id, reference, chapter')
    .eq('book_id', 'genesis')
    .order('chapter')
    .order('verse_number');

  if (error || !verses) {
    console.log('❌ Error fetching verses:', error);
    return;
  }

  console.log(`Found ${verses.length} verses in Genesis\n`);

  // Group by chapter
  const chapterMap = new Map<number, {
    total: number,
    withIcon: number,
    withoutIcon: number,
    verses: string[]
  }>();

  for (const verse of verses) {
    const chapter = verse.chapter;

    if (!chapterMap.has(chapter)) {
      chapterMap.set(chapter, { total: 0, withIcon: 0, withoutIcon: 0, verses: [] });
    }

    // Get word counts for this verse
    const { data: words } = await supabase
      .from('words')
      .select('icon_svg')
      .eq('verse_id', verse.id);

    if (words && words.length > 0) {
      const wordsWithIcon = words.filter(w => w.icon_svg && w.icon_svg.trim() !== '').length;
      const chapter_data = chapterMap.get(chapter)!;

      if (wordsWithIcon > 0) {
        chapter_data.withIcon++;
        chapter_data.verses.push(`${verse.reference} (${wordsWithIcon}/${words.length})`);
      } else {
        chapter_data.withoutIcon++;
      }
      chapter_data.total++;
    }
  }

  // Print results
  console.log('📊 Icon Coverage by Chapter:\n');
  console.log('Chapter │ Total Verses │ With Icons │ Without Icons │ Coverage');
  console.log('────────┼──────────────┼────────────┼───────────────┼──────────');

  for (let i = 1; i <= 10; i++) {
    const data = chapterMap.get(i);
    if (data) {
      const coverage = ((data.withIcon / data.total) * 100).toFixed(1);
      const status = data.withIcon === data.total ? '✅' :
                     data.withIcon > 0 ? '⚠️ ' : '❌';

      console.log(
        `   ${i.toString().padStart(2)}   │     ${data.total.toString().padStart(2)}       │     ${data.withIcon.toString().padStart(2)}     │      ${data.withoutIcon.toString().padStart(2)}       │ ${coverage.padStart(5)}% ${status}`
      );
    }
  }

  console.log('\n📝 Verses WITH icon_svg data:\n');
  for (let i = 1; i <= 3; i++) {
    const data = chapterMap.get(i);
    if (data && data.withIcon > 0) {
      console.log(`Genesis ${i}:`);
      data.verses.forEach(v => console.log(`  ✅ ${v}`));
      console.log('');
    }
  }

  console.log('\n📝 Verses WITHOUT icon_svg data:\n');
  for (let i = 4; i <= 10; i++) {
    const data = chapterMap.get(i);
    if (data && data.withoutIcon > 0) {
      console.log(`Genesis ${i}: ${data.withoutIcon} verses missing icon_svg data`);
    }
  }
}

analyzeIconCoverage().catch(console.error);
