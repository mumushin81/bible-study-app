import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Vocabulary Improvement v2.0 - Database Migration            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const migrationPath = path.join(__dirname, '../../supabase/migrations/20251022_vocabulary_improvement_v2.sql');

  console.log('📂 Reading SQL file...');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  // Split by individual statements (simple approach)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

  console.log(`   Found ${statements.length} SQL statements\n`);

  console.log('🚀 Executing statements...\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 60).replace(/\s+/g, ' ');

    process.stdout.write(`   [${i + 1}/${statements.length}] ${preview}...`);

    try {
      // For CREATE TABLE, CREATE INDEX, etc., we need to use raw SQL
      // Supabase client doesn't have a direct way, so we'll use fetch
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ query: statement + ';' }),
      });

      if (response.ok || response.status === 201) {
        console.log(' ✅');
        successCount++;
      } else {
        const error = await response.text();
        console.log(` ⚠️  (${response.status})`);
        if (error && !error.includes('already exists')) {
          console.log(`      Error: ${error.substring(0, 100)}`);
        }
        failCount++;
      }
    } catch (err: any) {
      console.log(` ⚠️`);
      console.log(`      ${err.message.substring(0, 100)}`);
      failCount++;
    }
  }

  console.log(`\n📊 Results: ${successCount} succeeded, ${failCount} failed/skipped\n`);

  console.log('🔍 Verifying tables...\n');

  const tables = [
    'user_book_progress',
    'hebrew_roots',
    'word_derivations',
    'word_metadata',
    'user_word_progress_v2',
  ];

  for (const table of tables) {
    try {
      const { error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: ${count || 0} rows`);
      }
    } catch (err: any) {
      console.log(`   ❌ ${table}: ${err.message}`);
    }
  }

  console.log('\n✅ Migration complete!');
  console.log('\n📝 IMPORTANT: You need to run these SQL statements manually in Supabase SQL Editor:');
  console.log('   1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new');
  console.log('   2. Copy the contents of:');
  console.log('      supabase/migrations/20251022_vocabulary_improvement_v2.sql');
  console.log('   3. Paste and execute\n');
}

main();
