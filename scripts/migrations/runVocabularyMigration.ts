import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Run SQL migration file
 */
async function runMigration(migrationPath: string) {
  console.log('\n📂 Reading migration file...');
  console.log(`   File: ${migrationPath}`);

  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log(`   Size: ${(sql.length / 1024).toFixed(2)} KB`);
  console.log('\n🚀 Executing migration...\n');

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      // Note: This requires service role key
      console.log('⚠️  exec_sql function not found, trying direct execution...');

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ sql_query: sql }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      console.log('✅ Migration executed successfully via REST API');
    } else {
      console.log('✅ Migration executed successfully via RPC');
    }

    return true;
  } catch (err: any) {
    console.error('\n❌ Migration failed!');
    console.error('   Error:', err.message);

    if (err.details) {
      console.error('   Details:', err.details);
    }
    if (err.hint) {
      console.error('   Hint:', err.hint);
    }

    return false;
  }
}

/**
 * Verify tables were created
 */
async function verifyTables() {
  console.log('\n🔍 Verifying tables...\n');

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
        console.log(`   ❌ ${table}: Not found or inaccessible`);
        console.log(`      Error: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: Exists (${count || 0} rows)`);
      }
    } catch (err: any) {
      console.log(`   ❌ ${table}: Error - ${err.message}`);
    }
  }
}

/**
 * Test sample data insertion
 */
async function testSampleData() {
  console.log('\n🧪 Testing sample data access...\n');

  try {
    // Test hebrew_roots
    const { data: roots, error: rootsError } = await supabase
      .from('hebrew_roots')
      .select('*');

    if (rootsError) {
      console.log('   ❌ hebrew_roots: Cannot read');
      console.log(`      Error: ${rootsError.message}`);
    } else {
      console.log(`   ✅ hebrew_roots: ${roots?.length || 0} sample roots loaded`);
      if (roots && roots.length > 0) {
        roots.forEach((root: any) => {
          console.log(`      • ${root.root} (${root.root_hebrew}) - ${root.core_meaning_korean}`);
        });
      }
    }
  } catch (err: any) {
    console.log(`   ❌ Error testing sample data: ${err.message}`);
  }
}

/**
 * Main migration runner
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Vocabulary Improvement v2.0 - Database Migration            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  const migrationPath = path.join(__dirname, '../../supabase/migrations/20251022_vocabulary_improvement_v2.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error(`\n❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  console.log('\n📋 This migration will create:');
  console.log('   1. user_book_progress (book-level learning tracking)');
  console.log('   2. hebrew_roots (triliteral root system)');
  console.log('   3. word_derivations (root → word relationships)');
  console.log('   4. word_metadata (difficulty, frequency, importance)');
  console.log('   5. user_word_progress_v2 (enhanced SRS with SM-2+)');
  console.log('   6. Helper functions and triggers');
  console.log('   7. Sample Hebrew roots (ב-ר-א, ע-ש-ה, א-מ-ר, ה-י-ה)');

  console.log('\n⚠️  WARNING: This will create new tables in your database.');
  console.log('   Make sure you have a backup if needed.');

  // In a real scenario, you might want to add a confirmation prompt here
  // For now, proceeding automatically

  const success = await runMigration(migrationPath);

  if (!success) {
    console.log('\n❌ Migration failed. Please check the errors above.');
    process.exit(1);
  }

  await verifyTables();
  await testSampleData();

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║   ✅ Migration Complete!                                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm run types:generate (to update TypeScript types)');
  console.log('   2. Populate word_metadata with existing words');
  console.log('   3. Map existing words to roots (word_derivations)');
  console.log('   4. Migrate user_word_progress → user_word_progress_v2');

  console.log('\n🎯 Ready to implement Phase 2: Book-based filtering UI!');
}

main();
