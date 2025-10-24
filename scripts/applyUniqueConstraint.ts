/**
 * APPLY UNIQUE CONSTRAINT VIA SUPABASE CLIENT
 *
 * Apply the UNIQUE constraint directly using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('======================================================================');
  console.log('🔒 APPLYING UNIQUE CONSTRAINT');
  console.log('======================================================================\n');

  const constraintSQL = `
    ALTER TABLE words
    ADD CONSTRAINT words_hebrew_verse_unique
    UNIQUE (hebrew, verse_id);
  `;

  const indexSQL = `
    CREATE INDEX IF NOT EXISTS idx_words_verse_id ON words(verse_id);
    CREATE INDEX IF NOT EXISTS idx_words_hebrew ON words(hebrew);
    CREATE INDEX IF NOT EXISTS idx_words_hebrew_verse ON words(hebrew, verse_id);
  `;

  console.log('Applying UNIQUE constraint...\n');
  console.log(constraintSQL);

  try {
    const { error: constraintError } = await supabase.rpc('exec_sql', {
      sql: constraintSQL
    });

    if (constraintError) {
      console.error('\n❌ Failed to apply constraint:', constraintError.message);
      console.error('\nℹ️  You need to apply this SQL manually in Supabase Dashboard:');
      console.error('   1. Go to SQL Editor');
      console.error('   2. Paste the SQL above');
      console.error('   3. Click "Run"\n');
      return;
    }

    console.log('✅ Constraint applied successfully!\n');

    console.log('Applying indexes...\n');
    console.log(indexSQL);

    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: indexSQL
    });

    if (indexError) {
      console.error('\n❌ Failed to apply indexes:', indexError.message);
    } else {
      console.log('✅ Indexes applied successfully!\n');
    }

    console.log('======================================================================');
    console.log('🎉 SUCCESS!');
    console.log('======================================================================');
  } catch (err: any) {
    console.error('\n❌ Error:', err.message);
    console.error('\nℹ️  RPC method not available. Apply SQL manually in Supabase Dashboard:\n');
    console.error('SQL to run:');
    console.error('----------------------------------------------------------------------');
    console.error(constraintSQL);
    console.error(indexSQL);
    console.error('----------------------------------------------------------------------\n');
  }
}

main().catch(console.error);
