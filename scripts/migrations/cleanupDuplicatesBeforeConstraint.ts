import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanupDuplicates() {
  console.log('🧹 Cleaning up duplicates before adding UNIQUE constraint...\n');
  console.log('=' .repeat(70));

  // 1. Fetch all words
  console.log('\n📊 Step 1: Fetching all words...\n');

  const { data: allWords, error } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, position, created_at')
    .order('created_at', { ascending: false });

  if (error || !allWords) {
    console.error('❌ Error fetching words:', error);
    return false;
  }

  console.log(`   Total words in database: ${allWords.length}\n`);

  // 2. Group by (hebrew, verse_id, position)
  console.log('🔍 Step 2: Analyzing duplicates...\n');

  const uniqueMap = new Map<string, typeof allWords[0]>();
  const duplicates: typeof allWords = [];

  allWords.forEach(word => {
    const key = `${word.hebrew}::${word.verse_id}::${word.position}`;

    if (!uniqueMap.has(key)) {
      // Keep the first one (most recent due to DESC order)
      uniqueMap.set(key, word);
    } else {
      // Mark as duplicate
      duplicates.push(word);
    }
  });

  console.log(`   Unique (hebrew, verse_id, position) combinations: ${uniqueMap.size}`);
  console.log(`   Duplicate records to remove: ${duplicates.length}\n`);

  if (duplicates.length === 0) {
    console.log('=' .repeat(70));
    console.log('✅ No duplicates found! Database is clean.');
    console.log('✅ Safe to proceed with adding UNIQUE constraint.');
    console.log('=' .repeat(70));
    return true;
  }

  // 3. Show sample duplicates
  console.log('=' .repeat(70));
  console.log('\n📋 Step 3: Sample duplicates (first 10):\n');

  duplicates.slice(0, 10).forEach((word, idx) => {
    console.log(`${idx + 1}. Hebrew: ${word.hebrew}`);
    console.log(`   Verse: ${word.verse_id}, Position: ${word.position}`);
    console.log(`   ID: ${word.id}`);
    console.log(`   Created: ${word.created_at}`);
    console.log('');
  });

  if (duplicates.length > 10) {
    console.log(`   ... and ${duplicates.length - 10} more duplicates\n`);
  }

  // 4. Show statistics by verse
  const verseStats = new Map<string, number>();
  duplicates.forEach(word => {
    verseStats.set(word.verse_id, (verseStats.get(word.verse_id) || 0) + 1);
  });

  console.log('📊 Duplicates by verse (top 10):\n');
  const topVerses = Array.from(verseStats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  topVerses.forEach(([verseId, count], idx) => {
    console.log(`   ${idx + 1}. ${verseId}: ${count} duplicates`);
  });
  console.log('');

  // 5. Confirm deletion
  console.log('=' .repeat(70));
  console.log('\n⚠️  WARNING: About to delete duplicates!\n');
  console.log(`   Records to delete: ${duplicates.length}`);
  console.log(`   Records to keep: ${uniqueMap.size}`);
  console.log('   Strategy: Keep most recent (by created_at DESC)\n');
  console.log('=' .repeat(70));

  // 6. Delete duplicates in batches
  console.log('\n🗑️  Step 4: Deleting duplicates...\n');

  const idsToDelete = duplicates.map(w => w.id);
  const batchSize = 100;
  let deletedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < idsToDelete.length; i += batchSize) {
    const batch = idsToDelete.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(idsToDelete.length / batchSize);

    const { error: deleteError } = await supabase
      .from('words')
      .delete()
      .in('id', batch);

    if (deleteError) {
      console.error(`   ❌ Batch ${batchNum}/${totalBatches} failed:`, deleteError.message);
      errorCount += batch.length;
    } else {
      deletedCount += batch.length;
      const progress = (deletedCount / idsToDelete.length * 100).toFixed(1);
      console.log(`   ✅ Batch ${batchNum}/${totalBatches}: ${deletedCount}/${idsToDelete.length} (${progress}%)`);
    }
  }

  // 7. Final verification
  console.log('\n=' .repeat(70));
  console.log('📊 Step 5: Verifying cleanup...\n');

  const { data: remainingWords } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, position');

  if (remainingWords) {
    const remainingMap = new Map<string, number>();
    remainingWords.forEach(word => {
      const key = `${word.hebrew}::${word.verse_id}::${word.position}`;
      remainingMap.set(key, (remainingMap.get(key) || 0) + 1);
    });

    const stillDuplicate = Array.from(remainingMap.values()).filter(count => count > 1);

    console.log(`   Total words remaining: ${remainingWords.length}`);
    console.log(`   Unique combinations: ${remainingMap.size}`);
    console.log(`   Duplicates remaining: ${stillDuplicate.length}\n`);

    if (stillDuplicate.length === 0) {
      console.log('=' .repeat(70));
      console.log('✅ Cleanup successful!');
      console.log(`   Deleted: ${deletedCount} duplicates`);
      console.log(`   Errors: ${errorCount}`);
      console.log(`   Success rate: ${(deletedCount / idsToDelete.length * 100).toFixed(1)}%`);
      console.log('=' .repeat(70));
      console.log('\n✅ Database is now clean and ready for UNIQUE constraint!');
      console.log('=' .repeat(70));
      return true;
    } else {
      console.log('=' .repeat(70));
      console.log(`⚠️  WARNING: ${stillDuplicate.length} duplicate combinations still exist!`);
      console.log('   You may need to run this script again or investigate manually.');
      console.log('=' .repeat(70));
      return false;
    }
  }

  return false;
}

cleanupDuplicates()
  .then(success => {
    if (success) {
      console.log('\n🎯 Next step: Run the migration SQL to add UNIQUE constraint');
      console.log('   File: supabase/migrations/20251024_add_words_unique_constraint.sql\n');
      process.exit(0);
    } else {
      console.log('\n❌ Cleanup failed or incomplete. Please investigate before adding constraint.\n');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });
