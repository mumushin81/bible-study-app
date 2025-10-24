# Verse_ID Format and Uniqueness Investigation Report

**Date**: 2025-10-24
**Database**: bible-study-app Supabase
**Scope**: Complete analysis of verse_id format, uniqueness, and relationship integrity

---

## Executive Summary

This investigation examined the `verse_id` format and uniqueness constraints in the bible-study-app database, with a focus on understanding duplicate word records.

### Key Findings

1. **`verse_id` is NOT a separate column** - it refers to `verses.id` (the primary key)
2. **No duplicate verse records exist** - all verses are unique
3. **234 duplicate word records found** - same (hebrew, verse_id) combinations
4. **All duplicates point to the same verse** - data integrity is maintained
5. **Main issue: Different positions** - 229 out of 234 duplicates have different position values

---

## Database Schema Structure

### Verses Table

```sql
CREATE TABLE verses (
  id TEXT PRIMARY KEY,                    -- Format: "book_chapter_verse" (e.g., "genesis_1_6")
  book_id TEXT REFERENCES books(id) ON DELETE CASCADE,
  chapter INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  reference TEXT NOT NULL,
  hebrew TEXT NOT NULL,
  ipa TEXT NOT NULL,
  korean_pronunciation TEXT NOT NULL,
  literal TEXT,
  translation TEXT,
  modern TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Points:**
- `verses.id` is the PRIMARY KEY (TEXT type)
- Format: `{book_id}_{chapter}_{verse_number}` (e.g., `genesis_1_6`)
- A UNIQUE constraint exists on `(book_id, chapter, verse_number)`
- There is NO separate `verse_id` column

### Words Table

```sql
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_id TEXT REFERENCES verses(id) ON DELETE CASCADE,  -- Foreign key to verses.id
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Points:**
- `words.verse_id` is a FOREIGN KEY referencing `verses.id`
- Relationship: `words.verse_id` → `verses.id` (NOT `verses.verse_id`)
- NO UNIQUE constraint on `(hebrew, verse_id)` - allows duplicates

---

## Investigation Results

### 1. Verse_ID Format Verification

**Test Query:**
```typescript
const { data } = await supabase
  .from('verses')
  .select('id, book_id, chapter, verse_number')
  .eq('book_id', 'genesis')
  .limit(20);
```

**Results:**
- ✅ All 20 sample verses follow the correct format
- Format: `{book_id}_{chapter}_{verse_number}`
- Examples:
  - `genesis_1_1` (Genesis 1:1)
  - `genesis_1_6` (Genesis 1:6)
  - `genesis_5_4` (Genesis 5:4)

### 2. Verse Uniqueness Check

**Test Query:**
```typescript
const { data } = await supabase
  .from('verses')
  .select('id, book_id, chapter, verse_number, reference')
  .eq('book_id', 'genesis');
```

**Results:**
- Total Genesis verses: **1,000**
- Unique verse IDs: **1,000**
- Duplicate verse IDs: **0**
- Duplicate (book_id, chapter, verse_number) combinations: **0**

**Conclusion:** ✅ **verse_id (verses.id) is truly unique - it is the primary key**

### 3. Querying Specific Verse (Genesis 1:6)

**Method 1: By ID**
```typescript
.eq('id', 'genesis_1_6')
```
**Result:** ✅ 1 record found

**Method 2: By Components**
```typescript
.eq('book_id', 'genesis')
.eq('chapter', 1)
.eq('verse_number', 6)
```
**Result:** ✅ 1 record found (same record)

**Conclusion:** Both methods return the same unique verse record.

### 4. Words Table Relationship Analysis

**Query:**
```typescript
const { data } = await supabase
  .from('words')
  .select('id, verse_id, hebrew, meaning, position')
  .eq('verse_id', 'genesis_1_6');
```

**Results for Genesis 1:6:**
- Total words: **9**
- Duplicate (hebrew, verse_id) combinations: **0**
- All words have unique positions

**Sample words:**
1. [1] וַיֹּאמֶר - "그리고 말씀하셨다"
2. [2] אֱלֹהִים - "하나님"
3. [3] יְהִי - "있으라, 되라"
4. [4] רָקִיעַ - "창공, 궁창"
5. [5] בְּתוֹךְ - "한가운데, 가운데"

### 5. Duplicate Words Analysis (Genesis-wide)

**Statistics:**
- Total Genesis words: **1,000**
- Unique (hebrew, verse_id) combinations: **764**
- Combinations with duplicates: **234**
- Total duplicate records to remove: **236**

#### Duplicate Categories

| Category | Count | Description |
|----------|-------|-------------|
| Truly identical | 2 | All fields exactly the same |
| Different meanings | 3 | Same Hebrew/verse but different translations |
| **Different positions** | **229** | Same Hebrew/verse but different position values |
| Other differences | 0 | Other attribute mismatches |

#### Top Verses with Duplicates

| Rank | Verse | Duplicate Records |
|------|-------|-------------------|
| 1 | 창세기 2:5 | 12 |
| 2 | 창세기 2:11 | 9 |
| 3 | 창세기 2:14 | 9 |
| 4 | 창세기 2:3 | 9 |
| 5 | 창세기 2:7 | 9 |

### 6. Example: Duplicate with Different Positions

**Verse:** Genesis 5:4
**Hebrew:** אֶת שֵׁ֔ת
**Meaning:** "셋을" (Seth - accusative)

**Duplicate Records:**
```
Record 1: ID: 9abab556..., Position: 4, Meaning: "셋을"
Record 2: ID: 248dea13..., Position: 3, Meaning: "셋을"
```

**Issue:** Same word in same verse, but with different position values. This indicates:
- Data was imported multiple times with slight variations
- Position numbering was inconsistent between imports
- Need to determine which position is correct

### 7. Example: Duplicate with Different Meanings

**Verse:** Genesis 12:8
**Hebrew:** וַיַּעְתֵּק

**Duplicate Records:**
```
Record 1:
  Position: 1
  Meaning: "그리고 그가 옮겼다" (and he moved)
  Root: ע-ת-ק (아타크 - 옮기다, 이동하다)

Record 2:
  Position: 0
  Meaning: "그리고 그가 옮겨갔다" (and he moved away)
  Root: ע-ת-ק (아타크)
```

**Issue:** Same word, but:
1. Different positions (0 vs 1)
2. Slightly different meanings (translation variations)

This suggests multiple content generation runs with different AI interpretations.

### 8. Relationship Integrity Check

**Critical Finding:**
- Duplicates pointing to SAME verse record: **234** ✅
- Duplicates pointing to DIFFERENT verse records: **0** ✅

**Conclusion:** All duplicate word records correctly reference the same verse record via `verse_id`. The foreign key relationship is intact.

---

## Root Cause Analysis

### Why Do Duplicates Exist?

Based on the evidence:

1. **Multiple data imports** - Words were uploaded multiple times for the same verses
2. **No UNIQUE constraint** - The schema allows duplicate (hebrew, verse_id) combinations
3. **Position inconsistencies** - Different imports used different position numbering (0-indexed vs 1-indexed?)
4. **AI variation** - Multiple AI content generation runs produced slightly different translations

### Evidence from Migration Scripts

From `/scripts/migrations/removeDuplicateWords.ts`:
```typescript
// Groups words by (hebrew, verse_id)
const key = `${word.hebrew}::${word.verse_id}`;

// Keeps most recent record (created_at DESC)
// Deletes older duplicates
```

This confirms that:
- The development team is aware of duplicates
- Duplicates are being actively managed
- Strategy: Keep newest record, delete older ones

---

## Schema Inconsistencies

### Current State

| Aspect | Expected | Actual | Status |
|--------|----------|--------|--------|
| `verses.id` uniqueness | Unique (Primary Key) | Unique | ✅ CORRECT |
| `verses` (book_id, chapter, verse_number) | Unique | Unique | ✅ CORRECT |
| `words.verse_id` FK | References verses.id | References verses.id | ✅ CORRECT |
| `words` (hebrew, verse_id) uniqueness | Should be unique | **NOT unique** | ⚠️ ISSUE |
| `words` (verse_id, position) uniqueness | Should be unique | **NOT unique** | ⚠️ ISSUE |

### Recommendations

1. **Add UNIQUE constraint on words table:**
   ```sql
   ALTER TABLE words
   ADD CONSTRAINT unique_word_position
   UNIQUE (verse_id, position);
   ```

2. **OR add composite unique constraint:**
   ```sql
   ALTER TABLE words
   ADD CONSTRAINT unique_word_in_verse
   UNIQUE (verse_id, hebrew, position);
   ```

3. **Before adding constraints, clean up existing duplicates:**
   - Run `/scripts/migrations/removeDuplicateWords.ts`
   - Keep the record with the highest position value (most likely correct)
   - Or keep the most recently created record

---

## Corrected Understanding

### Previous Assumptions (INCORRECT)

❌ `verse_id` is a separate column in the verses table
❌ Multiple verse records can exist with the same `verse_id`
❌ `words.verse_id` might reference a non-unique field

### Corrected Understanding (CORRECT)

✅ `verse_id` refers to `verses.id`, which is the PRIMARY KEY
✅ Each verse has exactly ONE record in the database
✅ `words.verse_id` is a FOREIGN KEY to `verses.id` (a unique field)
✅ Duplicate words exist because:
   - Multiple words with same (hebrew, verse_id) combination
   - No UNIQUE constraint prevents this
   - Data was imported multiple times

### The Real Relationship

```
verses table:
  id (PK) = "genesis_1_6"
     ↑
     │ (1:many relationship)
     │
words table:
  verse_id (FK) = "genesis_1_6"  ← Can appear multiple times
  hebrew = "אֱלֹהִים"              ← Can be duplicated with same verse_id
```

**Key Insight:** The issue is NOT with verses (which are unique), but with the words table allowing duplicate (hebrew, verse_id) combinations.

---

## Impact Assessment

### Low Impact (No Critical Issues)

1. ✅ Verse data integrity is intact
2. ✅ Foreign key relationships are correct
3. ✅ All duplicate words point to valid, existing verses
4. ✅ No orphan records (verse_id pointing to non-existent verses)

### Medium Impact (Data Quality Issues)

1. ⚠️ 236 duplicate word records exist
2. ⚠️ Inconsistent position numbering
3. ⚠️ Some words have different meanings (translation variations)
4. ⚠️ Database size is larger than necessary

### Recommendations

#### Immediate Actions

1. **Run duplicate removal script:**
   ```bash
   npx tsx scripts/migrations/removeDuplicateWords.ts
   ```

2. **Verify results:**
   ```bash
   npx tsx scripts/checkDuplicates.ts
   ```

3. **Add unique constraint:**
   ```sql
   -- After cleaning duplicates
   ALTER TABLE words
   ADD CONSTRAINT unique_word_position
   UNIQUE (verse_id, position);
   ```

#### Long-term Solutions

1. **Prevent future duplicates:**
   - Add unique constraints before data imports
   - Use UPSERT instead of INSERT for word data
   - Implement pre-import validation

2. **Standardize position numbering:**
   - Choose 0-indexed or 1-indexed (recommend 0-indexed)
   - Update all existing records consistently
   - Document in schema comments

3. **Content generation consistency:**
   - Use deterministic AI prompts
   - Version control prompts and models
   - Cache and reuse translations for identical Hebrew words

---

## SQL Query Reference

### Query verses by verse_id
```sql
-- Method 1: Direct ID query
SELECT * FROM verses WHERE id = 'genesis_1_6';

-- Method 2: Component query
SELECT * FROM verses
WHERE book_id = 'genesis'
  AND chapter = 1
  AND verse_number = 6;
```

### Query words for a specific verse
```sql
SELECT * FROM words
WHERE verse_id = 'genesis_1_6'
ORDER BY position;
```

### Find duplicate words
```sql
SELECT
  verse_id,
  hebrew,
  COUNT(*) as count
FROM words
GROUP BY verse_id, hebrew
HAVING COUNT(*) > 1
ORDER BY count DESC;
```

### Find words with duplicate positions in same verse
```sql
SELECT
  verse_id,
  position,
  COUNT(*) as count
FROM words
GROUP BY verse_id, position
HAVING COUNT(*) > 1
ORDER BY count DESC;
```

---

## Conclusion

**Is verse_id truly a unique identifier?**

✅ **YES** - `verse_id` (which is actually `verses.id`) is the PRIMARY KEY and is guaranteed unique.

**Are there multiple records per verse?**

❌ **NO** - Each verse has exactly one record in the `verses` table.

**What about the duplicate issue?**

⚠️ The duplicates are in the **`words` table**, not the `verses` table. Multiple word records can have the same `verse_id` because:
1. A verse naturally contains multiple words
2. The schema allows duplicate (hebrew, verse_id) combinations (no unique constraint)
3. Data was imported multiple times, creating true duplicates

**Recommended corrected query approach:**

```typescript
// To get a verse:
const { data: verse } = await supabase
  .from('verses')
  .select('*')
  .eq('id', 'genesis_1_6')
  .single(); // Safe to use .single() because id is unique

// To get words for a verse:
const { data: words } = await supabase
  .from('words')
  .select('*')
  .eq('verse_id', 'genesis_1_6')  // This will return multiple words (as expected)
  .order('position');
```

---

## Files Generated

1. `/Users/jinxin/dev/bible-study-app/investigate-verse-id.ts` - Comprehensive investigation script
2. `/Users/jinxin/dev/bible-study-app/analyze-duplicate-words.ts` - Detailed duplicate analysis
3. `/Users/jinxin/dev/bible-study-app/VERSE_ID_INVESTIGATION_REPORT.md` - This report

## Related Files

- `/Users/jinxin/dev/bible-study-app/supabase/migrations/20251018163944_phase2_content_schema.sql` - Schema definition
- `/Users/jinxin/dev/bible-study-app/scripts/migrations/removeDuplicateWords.ts` - Duplicate cleanup script
- `/Users/jinxin/dev/bible-study-app/add-unique-constraint.sql` - Constraint addition script

---

**Report Generated:** 2025-10-24
**Investigated By:** AI Assistant (Claude)
**Database:** Supabase (bible-study-app)
