/**
 * Check Current Database Status
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/database.types';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function checkStatus() {
  console.log('\n📊 Current Database Status\n');
  console.log('='.repeat(60));

  // Check verses
  const { count: versesCount } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true });
  console.log(`Verses: ${versesCount}`);

  // Check words
  const { count: wordsCount } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });
  console.log(`Words: ${wordsCount}`);

  // Check commentaries
  const { count: commentariesCount } = await supabase
    .from('commentaries')
    .select('*', { count: 'exact', head: true });
  console.log(`Commentaries: ${commentariesCount}`);

  // Check commentary_sections
  const { count: sectionsCount } = await supabase
    .from('commentary_sections')
    .select('*', { count: 'exact', head: true });
  console.log(`Commentary sections: ${sectionsCount}`);

  // Check word_relations
  const { count: relationsCount } = await supabase
    .from('word_relations')
    .select('*', { count: 'exact', head: true });
  console.log(`Word relations: ${relationsCount}`);

  console.log('='.repeat(60));

  // Sample verses
  const { data: sampleVerses } = await supabase
    .from('verses')
    .select('id, reference')
    .limit(10);

  console.log('\n📖 Sample Verses:');
  sampleVerses?.forEach(v => console.log(`   - ${v.reference} (${v.id})`));

  console.log('\n');
}

checkStatus();
