import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/lib/database.types';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function verify() {
  console.log('\n📊 Genesis 5:19-21 Verification\n');

  for (const verseNum of [19, 20, 21]) {
    const verseId = `genesis_5_${verseNum}`;

    // Get verse basic info
    const { data: verse } = await supabase
      .from('verses')
      .select('id, reference, hebrew, ipa, korean_pronunciation, modern')
      .eq('id', verseId)
      .single();

    if (!verse) {
      console.log(`❌ ${verseId} not found`);
      continue;
    }

    // Get words count
    const { data: words } = await supabase
      .from('words')
      .select('id')
      .eq('verse_id', verseId);

    // Get commentary
    const { data: commentary } = await supabase
      .from('commentaries')
      .select('id, intro')
      .eq('verse_id', verseId)
      .single();

    // Get sections count
    const { data: sections } = await supabase
      .from('commentary_sections')
      .select('id')
      .eq('commentary_id', commentary?.id || '');

    // Get why question
    const { data: question } = await supabase
      .from('why_questions')
      .select('id')
      .eq('commentary_id', commentary?.id || '')
      .single();

    // Get conclusion
    const { data: conclusion } = await supabase
      .from('commentary_conclusions')
      .select('id')
      .eq('commentary_id', commentary?.id || '')
      .single();

    console.log(`✅ ${verse.reference} (${verseId})`);
    console.log(`   Hebrew: ${verse.hebrew?.substring(0, 40)}...`);
    console.log(`   IPA: ${verse.ipa?.substring(0, 60)}...`);
    console.log(`   Korean Pronunciation: ${verse.korean_pronunciation?.substring(0, 60)}...`);
    console.log(`   Modern: ${verse.modern}`);
    console.log(`   Words: ${words?.length || 0}`);
    console.log(`   Commentary: ${commentary ? '✓' : '✗'}`);
    console.log(`   Sections: ${sections?.length || 0}`);
    console.log(`   Why Question: ${question ? '✓' : '✗'}`);
    console.log(`   Conclusion: ${conclusion ? '✓' : '✗'}`);
    console.log('');
  }
}

verify();
