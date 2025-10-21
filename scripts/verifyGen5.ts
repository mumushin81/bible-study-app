import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  console.log('\n=== Verifying Genesis 5:7-9 Content ===\n');

  for (const verseId of ['genesis_5_7', 'genesis_5_8', 'genesis_5_9']) {
    console.log(`\n📖 ${verseId}`);

    // Check verse basic info
    const { data: verse, error: verseError } = await supabase
      .from('verses')
      .select('id, reference, hebrew, ipa, korean_pronunciation, modern')
      .eq('id', verseId)
      .single();

    if (verseError || !verse) {
      console.log(`  ❌ Verse not found`);
      continue;
    }

    console.log(`  ✅ Reference: ${verse.reference}`);
    console.log(`  ✅ IPA: ${verse.ipa ? 'Yes' : 'No'}`);
    console.log(`  ✅ Korean: ${verse.korean_pronunciation ? 'Yes' : 'No'}`);
    console.log(`  ✅ Modern: ${verse.modern ? 'Yes' : 'No'}`);

    // Check words
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, hebrew, meaning, emoji')
      .eq('verse_id', verseId);

    console.log(`  ✅ Words: ${words?.length || 0} words`);

    // Check commentary
    const { data: commentary, error: commentaryError } = await supabase
      .from('commentaries')
      .select('id, intro')
      .eq('verse_id', verseId)
      .single();

    if (commentary) {
      console.log(`  ✅ Commentary: Yes`);

      // Check sections
      const { data: sections } = await supabase
        .from('commentary_sections')
        .select('id, title')
        .eq('commentary_id', commentary.id);

      console.log(`  ✅ Sections: ${sections?.length || 0} sections`);

      // Check why question
      const { data: question } = await supabase
        .from('why_questions')
        .select('id, question')
        .eq('commentary_id', commentary.id)
        .single();

      console.log(`  ✅ Why Question: ${question ? 'Yes' : 'No'}`);

      // Check conclusion
      const { data: conclusion } = await supabase
        .from('commentary_conclusions')
        .select('id, title')
        .eq('commentary_id', commentary.id)
        .single();

      console.log(`  ✅ Conclusion: ${conclusion ? 'Yes' : 'No'}`);
    } else {
      console.log(`  ❌ Commentary: No`);
    }
  }

  console.log('\n=== Verification Complete ===\n');
}

main();
