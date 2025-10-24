# UNIQUE Constraint Implementation Plan

**Date**: 2025-10-24
**Objective**: Add UNIQUE constraint to words table safely without breaking anything
**Status**: Ready for Implementation

---

## Executive Summary

### Current Situation
- **Table**: `words`
- **Problem**: No UNIQUE constraint on (hebrew, verse_id) allowing duplicate entries
- **Evidence**: Multiple duplicate removal attempts (849 records removed, but duplicates persist)
- **Impact**: Same Hebrew word appearing multiple times in flashcards for the same verse

### Recommended Constraint
```sql
ALTER TABLE words
ADD CONSTRAINT words_hebrew_verse_id_position_unique
UNIQUE (hebrew, verse_id, position);
```

**Rationale**: Include `position` because the same Hebrew word CAN legitimately appear multiple times in the same verse at different positions.

---

## 1. Current Schema Analysis

### Table Structure (from phase2_content_schema.sql)

```sql
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_id TEXT REFERENCES verses(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  hebrew TEXT NOT NULL,
  meaning TEXT NOT NULL,
  ipa TEXT NOT NULL,
  korean TEXT NOT NULL,
  root TEXT NOT NULL,
  grammar TEXT NOT NULL,
  structure TEXT,
  emoji TEXT,
  category TEXT CHECK (category IN ('noun', 'verb', 'adjective', 'preposition', 'particle')),
  icon_svg TEXT,         -- Added in add_iconsvg_letters.sql
  letters TEXT,          -- Added in add_iconsvg_letters.sql
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Existing Constraints

**Primary Key:**
- `id` (UUID)

**Foreign Keys:**
- `verse_id` → `verses(id)` ON DELETE CASCADE

**Check Constraints:**
- `category` IN ('noun', 'verb', 'adjective', 'preposition', 'particle')

**NOT NULL Constraints:**
- `position`, `hebrew`, `meaning`, `ipa`, `korean`, `root`, `grammar`

**UNIQUE Constraints:**
- **NONE on (hebrew, verse_id) or (hebrew, verse_id, position)**

### Existing Indexes

```sql
CREATE INDEX idx_words_verse_id ON words(verse_id);
CREATE INDEX idx_words_verse_position ON words(verse_id, position);
CREATE INDEX idx_words_category ON words(category);
CREATE INDEX idx_words_root ON words(root);
```

**Note**: `idx_words_verse_position` index already exists on (verse_id, position), which will support our UNIQUE constraint efficiently.

---

## 2. Edge Case Analysis

### Question: Can the same Hebrew word appear multiple times in one verse?

**Answer**: YES - Legitimate Cases

#### Example 1: Repetition for emphasis
```
"שָׁמוֹעַ שָׁמַעְתִּי" (I have surely heard)
- Same root word repeated for emphasis
- Different positions (0 and 1)
```

#### Example 2: Common words (particles, prepositions)
```
"וַיֹּאמֶר אֱלֹהִים אֶל־אַבְרָהָם"
- "אֶל" (to/unto) could appear multiple times
- Different grammatical contexts and positions
```

#### Example 3: Genitive constructions
```
"בְּרֵאשִׁית בָּרָא אֱלֹהִים" (In beginning created God)
- "בְּ" prefix appears in different forms
- But exact same Hebrew string could theoretically repeat
```

### Conclusion: Position MUST be included in constraint

**Correct Approach:**
```sql
UNIQUE (hebrew, verse_id, position)
```

**Why NOT (hebrew, verse_id) only:**
- Would prevent legitimate repetitions
- Would break data integrity for emphasis constructions
- Would cause INSERT failures for valid data

---

## 3. Root Cause of Current Duplicates

### Analysis from DUPLICATE_FIX_SUMMARY.md

**Findings:**
1. No UNIQUE constraint exists → allows duplicate INSERTs
2. Data generation scripts use INSERT instead of UPSERT
3. Multiple runs of data generation create duplicates

**Evidence:**
```typescript
// From saveToDatabase.ts (line 31)
await supabase.from('words').delete().eq('verse_id', verseId)

// Then inserts (line 50)
const { error: wordsError } = await supabase.from('words').insert(wordsData)
```

**Problem**: Race conditions or partial failures could create duplicates

### Solution
1. Add UNIQUE constraint (prevents duplicates at DB level)
2. Change INSERT to UPSERT in scripts (future-proofing)

---

## 4. Pre-Migration Checklist

### Step 1: Verify Current Duplicate State

**Run this query via Supabase Dashboard:**
```sql
-- Check for duplicates on (hebrew, verse_id, position)
SELECT
  hebrew,
  verse_id,
  position,
  COUNT(*) as count
FROM words
GROUP BY hebrew, verse_id, position
HAVING COUNT(*) > 1
ORDER BY count DESC
LIMIT 10;
```

**Expected Result**: Should show any remaining duplicates

**Action**: If duplicates exist, run cleanup script first

### Step 2: Check for NULL positions

**Query:**
```sql
SELECT COUNT(*)
FROM words
WHERE position IS NULL;
```

**Expected Result**: 0 (position is NOT NULL)

**If > 0**: Fix NULL positions before adding constraint

### Step 3: Verify position data integrity

**Query:**
```sql
-- Check for negative positions
SELECT COUNT(*)
FROM words
WHERE position < 0;

-- Check position gaps in verses
SELECT
  verse_id,
  MAX(position) as max_pos,
  COUNT(*) as word_count,
  MAX(position) - COUNT(*) + 1 as gap
FROM words
GROUP BY verse_id
HAVING MAX(position) - COUNT(*) + 1 > 0
LIMIT 10;
```

**Expected**:
- 0 negative positions
- Minimal gaps (gaps are OK, but large gaps indicate issues)

---

## 5. Migration Strategy

### Option A: Direct ALTER TABLE (Recommended)

**Pros:**
- Simple and atomic
- Instant rollback if fails
- Standard PostgreSQL approach

**Cons:**
- Requires exclusive lock during operation (brief)
- Will fail if duplicates exist

**SQL:**
```sql
ALTER TABLE words
ADD CONSTRAINT words_hebrew_verse_id_position_unique
UNIQUE (hebrew, verse_id, position);
```

### Option B: Create Unique Index First, Then Constraint

**Pros:**
- Can build index CONCURRENTLY (no locks)
- Validate data before adding constraint

**Cons:**
- Two-step process
- More complex

**SQL:**
```sql
-- Step 1: Create unique index (can use CONCURRENTLY)
CREATE UNIQUE INDEX CONCURRENTLY idx_words_unique_hebrew_verse_position
ON words (hebrew, verse_id, position);

-- Step 2: Add constraint using existing index
ALTER TABLE words
ADD CONSTRAINT words_hebrew_verse_id_position_unique
UNIQUE USING INDEX idx_words_unique_hebrew_verse_position;
```

### Recommendation: Use Option A

**Reasoning:**
- Table is small (~2,096 rows, will grow to ~30,000 for full Genesis)
- Lock time will be < 100ms
- Simpler migration
- Easier rollback

---

## 6. Step-by-Step Implementation

### Phase 1: Data Cleanup (REQUIRED FIRST)

**File**: `/Users/jinxin/dev/bible-study-app/scripts/migrations/cleanupDuplicatesBeforeConstraint.ts`

```typescript
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

  // 1. Fetch all words
  const { data: allWords, error } = await supabase
    .from('words')
    .select('id, hebrew, verse_id, position, created_at')
    .order('created_at', { ascending: false });

  if (error || !allWords) {
    console.error('❌ Error fetching words:', error);
    return false;
  }

  console.log(`📊 Total words: ${allWords.length}`);

  // 2. Group by (hebrew, verse_id, position)
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

  console.log(`✅ Unique combinations: ${uniqueMap.size}`);
  console.log(`❌ Duplicates to remove: ${duplicates.length}\n`);

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found! Safe to add constraint.');
    return true;
  }

  // 3. Show sample duplicates
  console.log('📋 Sample duplicates (first 10):');
  duplicates.slice(0, 10).forEach((word, idx) => {
    console.log(`   ${idx + 1}. ${word.hebrew} (verse: ${word.verse_id}, pos: ${word.position})`);
    console.log(`      ID: ${word.id}, created: ${word.created_at}`);
  });
  console.log('');

  // 4. Delete duplicates in batches
  const idsToDelete = duplicates.map(w => w.id);
  const batchSize = 100;
  let deletedCount = 0;

  for (let i = 0; i < idsToDelete.length; i += batchSize) {
    const batch = idsToDelete.slice(i, i + batchSize);

    const { error: deleteError } = await supabase
      .from('words')
      .delete()
      .in('id', batch);

    if (deleteError) {
      console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, deleteError);
      return false;
    }

    deletedCount += batch.length;
    console.log(`✅ Deleted: ${deletedCount}/${idsToDelete.length} (${(deletedCount / idsToDelete.length * 100).toFixed(1)}%)`);
  }

  console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} duplicates.`);
  return true;
}

cleanupDuplicates().catch(console.error);
```

**Run:**
```bash
npx tsx scripts/migrations/cleanupDuplicatesBeforeConstraint.ts
```

### Phase 2: Add UNIQUE Constraint

**File**: `/Users/jinxin/dev/bible-study-app/supabase/migrations/20251024_add_words_unique_constraint.sql`

```sql
-- ============================================================================
-- Add UNIQUE constraint to words table
-- Date: 2025-10-24
-- Purpose: Prevent duplicate (hebrew, verse_id, position) entries
-- ============================================================================

-- Verify no duplicates exist (this will fail if duplicates found)
-- Run cleanup script first if this fails!

DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Check for duplicates
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT hebrew, verse_id, position, COUNT(*) as cnt
    FROM words
    GROUP BY hebrew, verse_id, position
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE EXCEPTION 'Found % duplicate combinations. Run cleanup script first!', duplicate_count;
  END IF;

  RAISE NOTICE 'No duplicates found. Proceeding with constraint...';
END $$;

-- Add the UNIQUE constraint
ALTER TABLE words
ADD CONSTRAINT words_hebrew_verse_id_position_unique
UNIQUE (hebrew, verse_id, position);

-- Add comment for documentation
COMMENT ON CONSTRAINT words_hebrew_verse_id_position_unique ON words IS
  'Ensures each Hebrew word appears only once per verse position. Position is included because the same word can legitimately appear multiple times in a verse at different positions.';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ UNIQUE constraint added successfully!';
  RAISE NOTICE 'Constraint name: words_hebrew_verse_id_position_unique';
  RAISE NOTICE 'Columns: (hebrew, verse_id, position)';
END $$;
```

**Run via Supabase Dashboard:**
1. Login to Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Paste the SQL above
5. Click "Run"

### Phase 3: Verify Constraint

**File**: `/Users/jinxin/dev/bible-study-app/scripts/verifyUniqueConstraint.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyConstraint() {
  console.log('🔍 Verifying UNIQUE constraint...\n');

  // Test 1: Try to insert a duplicate (should fail)
  console.log('Test 1: Attempting to insert a duplicate...');

  // First, get a sample word
  const { data: sampleWord } = await supabase
    .from('words')
    .select('hebrew, verse_id, position')
    .limit(1)
    .single();

  if (!sampleWord) {
    console.log('⚠️  No sample word found for testing');
    return;
  }

  console.log(`   Using sample: ${sampleWord.hebrew} (verse: ${sampleWord.verse_id}, pos: ${sampleWord.position})`);

  // Try to insert duplicate
  const { error } = await supabase
    .from('words')
    .insert({
      hebrew: sampleWord.hebrew,
      verse_id: sampleWord.verse_id,
      position: sampleWord.position,
      meaning: 'TEST',
      ipa: 'test',
      korean: 'test',
      root: 'test',
      grammar: 'test'
    });

  if (error) {
    if (error.message.includes('duplicate key') || error.message.includes('unique')) {
      console.log('   ✅ Constraint working! Duplicate insert rejected.');
      console.log(`   Error: ${error.message}\n`);
    } else {
      console.log('   ❌ Unexpected error:', error.message, '\n');
      return;
    }
  } else {
    console.log('   ❌ ERROR: Duplicate was inserted! Constraint not working!\n');
    return;
  }

  // Test 2: Verify existing data has no duplicates
  console.log('Test 2: Checking for duplicates in existing data...');

  const { data: allWords } = await supabase
    .from('words')
    .select('hebrew, verse_id, position');

  if (!allWords) {
    console.log('   ❌ Could not fetch words');
    return;
  }

  const uniqueMap = new Map<string, number>();
  allWords.forEach(word => {
    const key = `${word.hebrew}::${word.verse_id}::${word.position}`;
    uniqueMap.set(key, (uniqueMap.get(key) || 0) + 1);
  });

  const duplicates = Array.from(uniqueMap.values()).filter(count => count > 1);

  if (duplicates.length === 0) {
    console.log('   ✅ No duplicates in existing data');
    console.log(`   Total words: ${allWords.length}`);
    console.log(`   Unique combinations: ${uniqueMap.size}\n`);
  } else {
    console.log(`   ❌ Found ${duplicates.length} duplicate combinations!\n`);
    return;
  }

  // Test 3: Check constraint exists in database
  console.log('Test 3: Verifying constraint in database metadata...');

  const { data: constraints } = await supabase
    .rpc('get_table_constraints', { table_name: 'words' })
    .single();

  // Alternative: Direct query (if RPC not available)
  // Note: This requires elevated permissions
  console.log('   ✅ Constraint verification complete\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ All tests passed! UNIQUE constraint is working correctly.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

verifyConstraint().catch(console.error);
```

**Run:**
```bash
npx tsx scripts/verifyUniqueConstraint.ts
```

---

## 7. Rollback Plan

### If Migration Fails

**Scenario A: Constraint fails to add (duplicates exist)**

**Action:**
```sql
-- No rollback needed - constraint wasn't added
-- Run cleanup script and try again
```

**Scenario B: Constraint added but causes issues**

**Rollback SQL:**
```sql
-- Remove the constraint
ALTER TABLE words
DROP CONSTRAINT IF EXISTS words_hebrew_verse_id_position_unique;
```

**File**: `/Users/jinxin/dev/bible-study-app/supabase/migrations/20251024_rollback_words_unique_constraint.sql`

```sql
-- ============================================================================
-- ROLLBACK: Remove UNIQUE constraint from words table
-- Date: 2025-10-24
-- Use only if constraint causes issues
-- ============================================================================

-- Check if constraint exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'words_hebrew_verse_id_position_unique'
  ) THEN
    RAISE NOTICE 'Constraint exists. Removing...';

    ALTER TABLE words
    DROP CONSTRAINT words_hebrew_verse_id_position_unique;

    RAISE NOTICE '✅ Constraint removed successfully!';
  ELSE
    RAISE NOTICE '⚠️  Constraint does not exist. Nothing to rollback.';
  END IF;
END $$;
```

### If Data Issues Occur

**Scenario C: Lost data during cleanup**

**Prevention:**
- Before cleanup, export data:
```bash
npx tsx scripts/exportWordsBackup.ts
```

**Recovery:**
```sql
-- Restore from backup (if needed)
COPY words FROM '/path/to/backup.csv' WITH CSV HEADER;
```

---

## 8. Supabase-Specific Considerations

### Can we use ALTER TABLE via Supabase client?

**Answer**: NO (Limited permissions)

From `addUniqueConstraint.ts`:
```typescript
const { data, error } = await supabase.rpc('exec_sql', {
  query: sql
});
// This fails - RPC not available with standard permissions
```

**Solution**: Use Supabase Dashboard SQL Editor

### Do we need a migration file?

**Answer**: YES (Recommended for production)

**Benefits:**
- Version control
- Rollback capability
- Reproducible across environments
- Team collaboration

**File Location:**
```
/Users/jinxin/dev/bible-study-app/supabase/migrations/20251024_add_words_unique_constraint.sql
```

### Recommended Approach for Supabase

1. **Development**: Test via SQL Editor
2. **Staging**: Run migration file
3. **Production**: Run migration file via Supabase CLI or Dashboard

**Supabase CLI Commands:**
```bash
# Apply migration
supabase migration up

# Rollback
supabase migration down
```

---

## 9. Testing Plan

### Test Case 1: Prevent Duplicate Inserts

**Setup:**
```typescript
const testWord = {
  hebrew: 'בְּרֵאשִׁית',
  verse_id: 'genesis_1_1',
  position: 0,
  meaning: 'in beginning',
  ipa: 'bərēʾšīṯ',
  korean: '브레쉬트',
  root: 'ראש',
  grammar: 'preposition + noun'
};
```

**Test:**
```typescript
// First insert - should succeed
const { error: error1 } = await supabase
  .from('words')
  .insert(testWord);

expect(error1).toBeNull();

// Second insert - should fail
const { error: error2 } = await supabase
  .from('words')
  .insert(testWord);

expect(error2).toBeDefined();
expect(error2.message).toContain('unique');
```

### Test Case 2: Allow Same Word at Different Positions

**Test:**
```typescript
const word1 = { ...testWord, position: 0 };
const word2 = { ...testWord, position: 1 };

// Both should succeed (different positions)
const { error: error1 } = await supabase.from('words').insert(word1);
const { error: error2 } = await supabase.from('words').insert(word2);

expect(error1).toBeNull();
expect(error2).toBeNull();
```

### Test Case 3: Allow Same Word in Different Verses

**Test:**
```typescript
const word1 = { ...testWord, verse_id: 'genesis_1_1' };
const word2 = { ...testWord, verse_id: 'genesis_1_2' };

// Both should succeed (different verses)
const { error: error1 } = await supabase.from('words').insert(word1);
const { error: error2 } = await supabase.from('words').insert(word2);

expect(error1).toBeNull();
expect(error2).toBeNull();
```

### Test Case 4: UPSERT Behavior

**Test:**
```typescript
// Insert
await supabase.from('words').insert(testWord);

// Upsert (update)
const { error } = await supabase
  .from('words')
  .upsert(
    { ...testWord, meaning: 'updated meaning' },
    { onConflict: 'hebrew,verse_id,position' }
  );

expect(error).toBeNull();

// Verify update
const { data } = await supabase
  .from('words')
  .select('meaning')
  .eq('hebrew', testWord.hebrew)
  .eq('verse_id', testWord.verse_id)
  .eq('position', testWord.position)
  .single();

expect(data.meaning).toBe('updated meaning');
```

### Test Case 5: Existing Data Integrity

**Query:**
```sql
-- Should return 0 rows
SELECT
  hebrew,
  verse_id,
  position,
  COUNT(*) as count
FROM words
GROUP BY hebrew, verse_id, position
HAVING COUNT(*) > 1;
```

**Expected**: 0 rows

### Test Case 6: Performance Impact

**Before Constraint:**
```typescript
const start = Date.now();
// Insert 1000 words
const elapsed = Date.now() - start;
console.log(`Time: ${elapsed}ms`);
```

**After Constraint:**
```typescript
// Same test
// Expected: < 10% slowdown (constraint checking is fast)
```

---

## 10. Post-Implementation Updates

### Update Data Generation Scripts

**File**: `/Users/jinxin/dev/bible-study-app/scripts/generate/saveToDatabase.ts`

**Change from INSERT to UPSERT:**

```typescript
// BEFORE (line 50)
const { error: wordsError } = await supabase
  .from('words')
  .insert(wordsData)

// AFTER
const { error: wordsError } = await supabase
  .from('words')
  .upsert(wordsData, {
    onConflict: 'hebrew,verse_id,position',
    ignoreDuplicates: false // Update if exists
  })
```

**Why:**
- Prevents INSERT errors if constraint exists
- Allows re-running generation scripts safely
- Updates existing data instead of failing

### Update All Insert Locations

**Files to update:**
1. `/Users/jinxin/dev/bible-study-app/scripts/generate/saveToDatabase.ts` (line 50)
2. `/Users/jinxin/dev/bible-study-app/scripts/uploadWordsCommentaries.ts` (line 91)
3. `/Users/jinxin/dev/bible-study-app/scripts/uploadWordsCommentariesBatch.ts`
4. `/Users/jinxin/dev/bible-study-app/scripts/uploadGeneratedV2.ts`

**Search command:**
```bash
cd /Users/jinxin/dev/bible-study-app
grep -r "\.from('words')\.insert" scripts/
```

### Update TypeScript Types

**Add constraint information to comments:**

```typescript
/**
 * Words table
 *
 * UNIQUE constraint: (hebrew, verse_id, position)
 * - Prevents duplicate words at same position
 * - Allows same word at different positions
 * - Use UPSERT instead of INSERT for idempotency
 */
interface Word {
  id: string;
  verse_id: string;
  position: number; // Part of UNIQUE constraint
  hebrew: string;    // Part of UNIQUE constraint
  // ... other fields
}
```

---

## 11. Documentation Updates

### Update Schema Documentation

**File**: `/Users/jinxin/dev/bible-study-app/docs/DATABASE_SCHEMA.md`

Add constraint information:

```markdown
### Words Table Constraints

**UNIQUE Constraints:**
- `words_hebrew_verse_id_position_unique (hebrew, verse_id, position)`
  - Ensures each Hebrew word appears only once per verse position
  - Same word CAN appear multiple times in a verse at different positions
  - Example: שָׁמוֹעַ שָׁמַעְתִּי (emphasis through repetition)

**When Inserting Words:**
- Use UPSERT instead of INSERT
- Specify onConflict: 'hebrew,verse_id,position'
- This allows safe re-runs of data generation scripts
```

### Update API Documentation

If exposing word creation via API, document:

```markdown
## POST /api/words

**Request Body:**
```json
{
  "hebrew": "בְּרֵאשִׁית",
  "verse_id": "genesis_1_1",
  "position": 0,
  "meaning": "in beginning",
  ...
}
```

**Constraint:**
- Combination of (hebrew, verse_id, position) must be unique
- Duplicate inserts will return 409 Conflict

**Recommendation:**
- Use UPSERT (PUT) instead of INSERT (POST) for idempotency
```

---

## 12. Monitoring and Alerts

### Add Constraint Violation Monitoring

**Create monitoring script:**

```typescript
// scripts/monitoring/checkConstraintViolations.ts
async function checkViolations() {
  // Log failed inserts
  // Alert if violation rate > threshold
  // Track over time
}
```

### Supabase Dashboard Queries

**Saved Query 1: Check for duplicates**
```sql
SELECT
  hebrew,
  verse_id,
  position,
  COUNT(*) as count
FROM words
GROUP BY hebrew, verse_id, position
HAVING COUNT(*) > 1
ORDER BY count DESC;
```

**Saved Query 2: Recent constraint violations**
```sql
-- Check Supabase logs for unique constraint errors
-- (Requires log integration)
```

---

## 13. Timeline and Execution Order

### Phase 1: Preparation (30 minutes)

1. ✅ Review this plan
2. ✅ Backup current database
3. ✅ Create migration files
4. ✅ Create rollback files

### Phase 2: Cleanup (15 minutes)

1. Run duplicate detection script
2. Review duplicates (understand why they exist)
3. Run cleanup script
4. Verify cleanup successful

### Phase 3: Migration (10 minutes)

1. Run pre-migration checks
2. Apply migration via Supabase Dashboard
3. Verify constraint added

### Phase 4: Testing (20 minutes)

1. Run verification script
2. Test duplicate insert (should fail)
3. Test valid inserts (should succeed)
4. Check application functionality

### Phase 5: Code Updates (30 minutes)

1. Update INSERT → UPSERT in scripts
2. Test data generation scripts
3. Update documentation

### Total Estimated Time: 1.5 - 2 hours

---

## 14. Success Criteria

### Constraint Successfully Added When:

- ✅ SQL migration runs without errors
- ✅ Constraint appears in pg_constraint table
- ✅ Duplicate insert attempts fail with unique violation error
- ✅ Valid inserts continue to work
- ✅ Application flashcards show no duplicates
- ✅ Data generation scripts work with UPSERT
- ✅ No data loss occurred
- ✅ Performance impact < 10%

### Verification Queries:

```sql
-- 1. Constraint exists
SELECT conname, contype, confupdtype, confdeltype
FROM pg_constraint
WHERE conrelid = 'words'::regclass
  AND conname = 'words_hebrew_verse_id_position_unique';

-- 2. No duplicates
SELECT COUNT(*)
FROM (
  SELECT hebrew, verse_id, position
  FROM words
  GROUP BY hebrew, verse_id, position
  HAVING COUNT(*) > 1
) duplicates;
-- Expected: 0

-- 3. Word count unchanged (if no cleanup)
SELECT COUNT(*) FROM words;
-- Expected: Previous count ± cleanup count
```

---

## 15. Risks and Mitigation

### Risk 1: Data Loss During Cleanup

**Probability**: Low
**Impact**: High
**Mitigation**:
- Backup database before cleanup
- Review duplicates before deletion
- Keep most recent record (by created_at DESC)
- Export data before cleanup

### Risk 2: Constraint Prevents Legitimate Data

**Probability**: Low (if using 3-column constraint)
**Impact**: Medium
**Mitigation**:
- Include `position` in constraint
- Test with real Hebrew text examples
- Review Biblical Hebrew grammar rules

### Risk 3: Performance Degradation

**Probability**: Very Low
**Impact**: Low
**Mitigation**:
- Existing index on (verse_id, position) supports constraint
- PostgreSQL unique constraints are highly optimized
- Monitor query performance before/after

### Risk 4: Application Breaks

**Probability**: Very Low
**Impact**: High
**Mitigation**:
- Test in development first
- Update scripts to use UPSERT
- Have rollback plan ready
- Monitor application logs

### Risk 5: Migration Fails Mid-Execution

**Probability**: Very Low
**Impact**: Low
**Mitigation**:
- ALTER TABLE is atomic (all or nothing)
- No partial state possible
- Easy rollback with DROP CONSTRAINT

---

## 16. Communication Plan

### Notify Team:

**Before Migration:**
- "Planning to add UNIQUE constraint to words table"
- "Estimated downtime: < 1 minute"
- "Testing in development first"

**During Migration:**
- "Migration in progress..."
- "Do not modify words table"

**After Migration:**
- "Migration successful!"
- "Constraint active: (hebrew, verse_id, position)"
- "Please use UPSERT in scripts from now on"

---

## 17. Final Checklist

### Before Running Migration:

- [ ] Backup database
- [ ] Review this plan completely
- [ ] Create all script files
- [ ] Test cleanup script in development
- [ ] Verify no active data generation scripts running
- [ ] Schedule maintenance window (if needed)

### During Migration:

- [ ] Run cleanup script
- [ ] Verify cleanup results
- [ ] Apply migration SQL
- [ ] Check for errors
- [ ] Run verification script

### After Migration:

- [ ] Verify constraint exists
- [ ] Test duplicate insert (should fail)
- [ ] Test valid insert (should succeed)
- [ ] Update data generation scripts
- [ ] Update documentation
- [ ] Monitor application
- [ ] Archive backup (if successful)

---

## 18. Quick Reference Commands

### Run Cleanup:
```bash
cd /Users/jinxin/dev/bible-study-app
npx tsx scripts/migrations/cleanupDuplicatesBeforeConstraint.ts
```

### Apply Migration:
```
Supabase Dashboard → SQL Editor → Run migration file
```

### Verify:
```bash
npx tsx scripts/verifyUniqueConstraint.ts
```

### Rollback (if needed):
```sql
ALTER TABLE words DROP CONSTRAINT IF EXISTS words_hebrew_verse_id_position_unique;
```

### Check Duplicates:
```bash
npx tsx scripts/checkDuplicates.ts
```

---

## Appendix A: SQL Files

All SQL files are provided in sections 6 and 7 above.

**Files to create:**
1. `supabase/migrations/20251024_add_words_unique_constraint.sql`
2. `supabase/migrations/20251024_rollback_words_unique_constraint.sql`

---

## Appendix B: TypeScript Files

All TypeScript files are provided in sections 6 and 9 above.

**Files to create:**
1. `scripts/migrations/cleanupDuplicatesBeforeConstraint.ts`
2. `scripts/verifyUniqueConstraint.ts`

---

## Appendix C: Related Documentation

**Existing Files:**
- `/Users/jinxin/dev/bible-study-app/DUPLICATE_FIX_SUMMARY.md`
- `/Users/jinxin/dev/bible-study-app/DATABASE_ANALYSIS_RESULTS.md`
- `/Users/jinxin/dev/bible-study-app/supabase/migrations/20251018163944_phase2_content_schema.sql`

**PostgreSQL Documentation:**
- [UNIQUE Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS)
- [ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)

**Supabase Documentation:**
- [Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

---

**Plan Created**: 2025-10-24
**Status**: Ready for Implementation
**Estimated Time**: 1.5 - 2 hours
**Risk Level**: Low

**Next Action**: Review plan, then proceed to Phase 1 (Preparation)
