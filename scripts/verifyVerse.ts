import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/lib/database.types';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  // Fetch verse with all related data
  const { data: verse, error: verseError } = await supabase
    .from('verses')
    .select('*')
    .eq('id', 'gen5-24')
    .single();

  if (verseError) {
    console.error('Error fetching verse:', verseError);
    return;
  }

  console.log('\n=== Genesis 5:24 Verse ===');
  console.log('Reference:', verse.reference);
  console.log('Hebrew:', verse.hebrew);
  console.log('IPA:', verse.ipa);
  console.log('Korean Pronunciation:', verse.korean_pronunciation);
  console.log('Modern:', verse.modern);

  // Fetch words
  const { data: words } = await supabase
    .from('words')
    .select('*')
    .eq('verse_id', 'gen5-24')
    .order('position');

  console.log('\n=== Words ===');
  console.log(`Total: ${words?.length}`);
  words?.forEach((w, i) => {
    console.log(`${i + 1}. ${w.hebrew} (${w.korean}) - ${w.meaning}`);
  });

  // Fetch commentary
  const { data: commentary } = await supabase
    .from('commentaries')
    .select('*, commentary_sections(*), why_questions(*), commentary_conclusions(*)')
    .eq('verse_id', 'gen5-24')
    .single();

  console.log('\n=== Commentary ===');
  console.log('Intro:', commentary?.intro.substring(0, 100) + '...');
  console.log('Sections:', commentary?.commentary_sections?.length);
  console.log('Has Why Question:', !!commentary?.why_questions);
  console.log('Has Conclusion:', !!commentary?.commentary_conclusions);
}

main();
