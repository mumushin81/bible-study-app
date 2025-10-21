import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkIconSvgColumn() {
  console.log('🔍 Checking icon_svg column in database...\n');

  // 1. Check if icon_svg column exists by trying to select it
  console.log('1️⃣ Testing if icon_svg column exists...');
  try {
    const { data, error } = await supabase
      .from('words')
      .select('id, icon_svg')
      .limit(1);

    if (error) {
      console.log('❌ icon_svg column does NOT exist or there was an error:');
      console.log(error);
      return;
    }
    console.log('✅ icon_svg column EXISTS in the database\n');
  } catch (err) {
    console.log('❌ Error checking column:', err);
    return;
  }

  // 2. Count total words
  console.log('2️⃣ Counting total words...');
  const { count: totalCount, error: countError } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.log('❌ Error counting words:', countError);
    return;
  }
  console.log(`   Total words in DB: ${totalCount}\n`);

  // 3. Count words WITH icon_svg data (not null and not empty)
  console.log('3️⃣ Counting words WITH icon_svg data...');
  const { count: withIconCount, error: withIconError } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .not('icon_svg', 'is', null)
    .neq('icon_svg', '');

  if (withIconError) {
    console.log('❌ Error counting words with icon_svg:', withIconError);
    return;
  }
  console.log(`   Words with icon_svg: ${withIconCount}`);
  console.log(`   Words without icon_svg: ${(totalCount || 0) - (withIconCount || 0)}\n`);

  // 4. Sample verses to check
  const versesToCheck = [
    'genesis_1_1',
    'genesis_2_4',
    'genesis_3_1',
    'genesis_5_1',
    'genesis_5_22',
  ];

  console.log('4️⃣ Checking specific verses for icon_svg data...\n');

  for (const verseId of versesToCheck) {
    const { data: words, error } = await supabase
      .from('words')
      .select('hebrew, meaning, emoji, icon_svg')
      .eq('verse_id', verseId)
      .order('position');

    if (error) {
      console.log(`   ❌ Error fetching ${verseId}:`, error.message);
      continue;
    }

    if (!words || words.length === 0) {
      console.log(`   ⚠️  ${verseId}: No words found`);
      continue;
    }

    const wordsWithIcon = words.filter(w => w.icon_svg && w.icon_svg.trim() !== '');
    const percentage = ((wordsWithIcon.length / words.length) * 100).toFixed(1);

    console.log(`   📖 ${verseId}:`);
    console.log(`      Total words: ${words.length}`);
    console.log(`      Words with icon_svg: ${wordsWithIcon.length} (${percentage}%)`);

    if (wordsWithIcon.length > 0) {
      console.log(`      ✅ Examples with icon_svg:`);
      wordsWithIcon.slice(0, 2).forEach(w => {
        const svgPreview = w.icon_svg.substring(0, 50) + '...';
        console.log(`         - ${w.hebrew} (${w.meaning}): ${svgPreview}`);
      });
    } else {
      console.log(`      ❌ No words have icon_svg data`);
    }
    console.log('');
  }

  // 5. Find ANY verses that DO have icon_svg data
  console.log('5️⃣ Finding verses that DO have icon_svg data...\n');
  const { data: wordsWithIcons, error: searchError } = await supabase
    .from('words')
    .select('verse_id, hebrew, meaning, icon_svg')
    .not('icon_svg', 'is', null)
    .neq('icon_svg', '')
    .limit(5);

  if (searchError) {
    console.log('❌ Error searching for words with icons:', searchError);
  } else if (wordsWithIcons && wordsWithIcons.length > 0) {
    console.log(`   ✅ Found ${wordsWithIcons.length} words with icon_svg data:`);
    wordsWithIcons.forEach(w => {
      const svgPreview = w.icon_svg.substring(0, 60) + '...';
      console.log(`      ${w.verse_id}: ${w.hebrew} (${w.meaning})`);
      console.log(`         SVG: ${svgPreview}\n`);
    });
  } else {
    console.log('   ❌ NO words found with icon_svg data in the database');
  }

  // 6. Check letters column too
  console.log('\n6️⃣ Checking letters column...\n');
  const { count: withLettersCount, error: lettersError } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .not('letters', 'is', null)
    .neq('letters', '');

  if (!lettersError) {
    console.log(`   Words with letters data: ${withLettersCount}\n`);
  }
}

checkIconSvgColumn().catch(console.error);
