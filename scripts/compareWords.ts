import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dbvekynhkfxdepsvvawg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidmVreW5oa2Z4ZGVwc3Z2YXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5ODc3MDEsImV4cCI6MjA1MjU2MzcwMX0.TrZWQxILJhp9D1K0pUHH3Pj1n6V7VQb0mJmBDcl7Dds';

const supabase = createClient(supabaseUrl, supabaseKey);

async function compareWords() {
  console.log('=== 창세기 1:1 구절 정보 ===\n');

  // Genesis 1:1 verse
  const { data: verse1_1, error: verseError1 } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', 'genesis')
    .eq('chapter', 1)
    .eq('verse_number', 1)
    .single();

  if (verseError1) {
    console.error('Error fetching genesis 1:1:', verseError1);
  } else {
    console.log('Verse ID:', verse1_1?.id);
    console.log('Reference:', verse1_1?.reference);
    console.log('Hebrew:', verse1_1?.hebrew);
  }

  // Genesis 1:1 words
  console.log('\n=== 창세기 1:1 단어들 ===\n');
  const { data: words1_1, error: wordsError1 } = await supabase
    .from('words')
    .select('hebrew, meaning, ipa, korean, root, grammar, letters, structure, emoji, icon_svg, category')
    .eq('verse_id', verse1_1?.id || 'genesis_1_1')
    .order('position');

  if (wordsError1) {
    console.error('Error fetching words:', wordsError1);
  } else {
    words1_1?.forEach((word, index) => {
      console.log(`\n단어 ${index + 1}: ${word.hebrew} (${word.meaning})`);
      console.log('  - IPA:', word.ipa || 'NULL');
      console.log('  - Korean:', word.korean || 'NULL');
      console.log('  - Root:', word.root || 'NULL');
      console.log('  - Grammar:', word.grammar || 'NULL');
      console.log('  - Letters:', word.letters || 'NULL');
      console.log('  - Structure:', word.structure || 'NULL');
      console.log('  - Emoji:', word.emoji || 'NULL');
      console.log('  - Icon SVG:', word.icon_svg ? 'EXISTS' : 'NULL');
      console.log('  - Category:', word.category || 'NULL');
    });
  }

  console.log('\n\n=== 창세기 12:12 구절 정보 ===\n');

  // Genesis 12:12 verse
  const { data: verse12_12, error: verseError2 } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', 'genesis')
    .eq('chapter', 12)
    .eq('verse_number', 12)
    .single();

  if (verseError2) {
    console.error('Error fetching genesis 12:12:', verseError2);
  } else {
    console.log('Verse ID:', verse12_12?.id);
    console.log('Reference:', verse12_12?.reference);
    console.log('Hebrew:', verse12_12?.hebrew);
  }

  // Genesis 12:12 words
  console.log('\n=== 창세기 12:12 단어들 ===\n');
  const { data: words12_12, error: wordsError2 } = await supabase
    .from('words')
    .select('hebrew, meaning, ipa, korean, root, grammar, letters, structure, emoji, icon_svg, category')
    .eq('verse_id', verse12_12?.id || 'genesis_12_12')
    .order('position');

  if (wordsError2) {
    console.error('Error fetching words:', wordsError2);
  } else {
    words12_12?.forEach((word, index) => {
      console.log(`\n단어 ${index + 1}: ${word.hebrew} (${word.meaning})`);
      console.log('  - IPA:', word.ipa || 'NULL');
      console.log('  - Korean:', word.korean || 'NULL');
      console.log('  - Root:', word.root || 'NULL');
      console.log('  - Grammar:', word.grammar || 'NULL');
      console.log('  - Letters:', word.letters || 'NULL');
      console.log('  - Structure:', word.structure || 'NULL');
      console.log('  - Emoji:', word.emoji || 'NULL');
      console.log('  - Icon SVG:', word.icon_svg ? 'EXISTS' : 'NULL');
      console.log('  - Category:', word.category || 'NULL');
    });
  }

  console.log('\n\n=== 필드 비교 요약 ===\n');

  const checkFields = (words: any[], verseName: string) => {
    const hasLetters = words?.some(w => w.letters);
    const hasStructure = words?.some(w => w.structure);
    const hasIconSvg = words?.some(w => w.icon_svg);
    const hasEmoji = words?.every(w => w.emoji);
    const hasCategory = words?.some(w => w.category);

    console.log(`${verseName}:`);
    console.log('  - letters 필드:', hasLetters ? '있음 ✓' : '없음 ✗');
    console.log('  - structure 필드:', hasStructure ? '있음 ✓' : '없음 ✗');
    console.log('  - icon_svg 필드:', hasIconSvg ? '있음 ✓' : '없음 ✗');
    console.log('  - emoji 필드:', hasEmoji ? '모든 단어에 있음 ✓' : '일부 누락 ✗');
    console.log('  - category 필드:', hasCategory ? '있음 ✓' : '없음 ✗');
  };

  checkFields(words1_1, '창세기 1:1');
  console.log('');
  checkFields(words12_12, '창세기 12:12');

  process.exit(0);
}

compareWords().catch(console.error);
