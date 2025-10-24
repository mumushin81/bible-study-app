# UNIQUE Constraint Quick Start Guide

**Objective**: Add UNIQUE constraint to prevent duplicate words

---

## TL;DR

**Constraint**: `UNIQUE (hebrew, verse_id, position)` on `words` table

**Why 3 columns?** The same Hebrew word CAN appear multiple times in one verse at different positions (e.g., emphasis, repetition).

---

## Quick Implementation (30 minutes)

### Step 1: Cleanup Duplicates (10 min)

```bash
cd /Users/jinxin/dev/bible-study-app
npx tsx scripts/migrations/cleanupDuplicatesBeforeConstraint.ts
```

**Expected output**: "Database is clean and ready for UNIQUE constraint"

---

### Step 2: Add Constraint (5 min)

**Via Supabase Dashboard:**

1. Login to [Supabase Dashboard](https://app.supabase.com)
2. Go to SQL Editor
3. Open: `supabase/migrations/20251024_add_words_unique_constraint.sql`
4. Copy contents
5. Paste into SQL Editor
6. Click "Run"

**Expected output**: "UNIQUE constraint added successfully"

---

### Step 3: Verify (5 min)

```bash
npx tsx scripts/verifyUniqueConstraint.ts
```

**Expected output**: "All tests PASSED"

---

### Step 4: Update Scripts (10 min)

**Change INSERT to UPSERT** in these files:

1. `scripts/generate/saveToDatabase.ts` (line 50)
2. `scripts/uploadWordsCommentaries.ts` (line 91)

**Before:**
```typescript
const { error } = await supabase
  .from('words')
  .insert(wordsData)
```

**After:**
```typescript
const { error } = await supabase
  .from('words')
  .upsert(wordsData, {
    onConflict: 'hebrew,verse_id,position'
  })
```

---

## If Something Goes Wrong

### Rollback:

**Via Supabase Dashboard SQL Editor:**

```sql
ALTER TABLE words
DROP CONSTRAINT IF EXISTS words_hebrew_verse_id_position_unique;
```

**Or run:**
```
Open: supabase/migrations/20251024_rollback_words_unique_constraint.sql
```

---

## Testing

**Manual test:**

```sql
-- This should succeed (first time)
INSERT INTO words (hebrew, verse_id, position, meaning, ipa, korean, root, grammar)
VALUES ('בְּרֵאשִׁית', 'genesis_1_1', 0, 'test', 'test', 'test', 'test', 'test');

-- This should FAIL (duplicate)
INSERT INTO words (hebrew, verse_id, position, meaning, ipa, korean, root, grammar)
VALUES ('בְּרֵאשִׁית', 'genesis_1_1', 0, 'test2', 'test2', 'test2', 'test2', 'test2');

-- This should succeed (different position)
INSERT INTO words (hebrew, verse_id, position, meaning, ipa, korean, root, grammar)
VALUES ('בְּרֵאשִׁית', 'genesis_1_1', 1, 'test3', 'test3', 'test3', 'test3', 'test3');
```

---

## Files Created

**SQL Migrations:**
- ✅ `supabase/migrations/20251024_add_words_unique_constraint.sql`
- ✅ `supabase/migrations/20251024_rollback_words_unique_constraint.sql`

**Scripts:**
- ✅ `scripts/migrations/cleanupDuplicatesBeforeConstraint.ts`
- ✅ `scripts/verifyUniqueConstraint.ts`

**Documentation:**
- ✅ `UNIQUE_CONSTRAINT_IMPLEMENTATION_PLAN.md` (full plan)
- ✅ `UNIQUE_CONSTRAINT_QUICK_START.md` (this file)

---

## Success Criteria

- ✅ Cleanup script reports 0 duplicates
- ✅ Migration runs without errors
- ✅ Verification script shows "All tests PASSED"
- ✅ Duplicate inserts are rejected
- ✅ Valid inserts continue to work
- ✅ No application errors

---

## Need More Details?

Read: `/Users/jinxin/dev/bible-study-app/UNIQUE_CONSTRAINT_IMPLEMENTATION_PLAN.md`

**Sections:**
- Edge case analysis (why 3 columns?)
- Root cause of duplicates
- Complete testing plan
- Rollback procedures
- Code update examples

---

**Status**: Ready to implement
**Risk**: Low
**Time**: 30 minutes
