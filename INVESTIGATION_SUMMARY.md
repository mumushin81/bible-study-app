# Verse_ID Investigation Summary

**Date:** 2025-10-24
**Status:** ✅ Complete
**Result:** 7/8 verification tests passed

---

## Quick Facts

### ✅ CONFIRMED: verse_id IS UNIQUE

- **`verse_id`** refers to **`verses.id`**, which is the **PRIMARY KEY**
- **Format:** `book_chapter_verse` (e.g., `genesis_1_6`)
- **Uniqueness:** Guaranteed by PRIMARY KEY constraint
- **No separate verse_id column** - `id` serves as the verse identifier

### Database Statistics

| Metric | Count |
|--------|-------|
| Total Genesis verses | 1,000 |
| Unique verse IDs | 1,000 |
| Duplicate verses | 0 ✅ |
| Total Genesis words | 1,000 |
| Unique (hebrew, verse_id) combos | 764 |
| Duplicate word combos | 234 ⚠️ |

---

## Schema Relationship

```
verses table:
┌─────────────────────────────────────┐
│ id (TEXT PRIMARY KEY)               │ ← "genesis_1_6"
│ book_id, chapter, verse_number      │
│ reference, hebrew, ipa, korean...   │
└─────────────────────────────────────┘
         ↑
         │ FOREIGN KEY (1:many)
         │
┌─────────────────────────────────────┐
│ words table:                        │
│ verse_id (TEXT FK → verses.id)     │ ← Can reference same verse multiple times
│ hebrew, meaning, position...        │
└─────────────────────────────────────┘
```

---

## Key Finding: Duplicate Words, NOT Verses

### The Issue

- ❌ **NOT**: Multiple verse records with same verse_id
- ✅ **ACTUAL**: Multiple word records with same (hebrew, verse_id)

### Example

**Genesis 5:4** has 2 word records for "אֶת שֵׁ֔ת":
```
Record 1: ID: 9abab556..., verse_id: genesis_5_4, position: 4
Record 2: ID: 248dea13..., verse_id: genesis_5_4, position: 3
                           └─ Same verse_id, different positions
```

### Root Cause

1. Multiple data imports without deduplication
2. No UNIQUE constraint on `(hebrew, verse_id)` or `(verse_id, position)`
3. Position numbering inconsistencies (0-indexed vs 1-indexed)

---

## Corrected Understanding

### ❌ Previous Assumption
> "verse_id might not be unique, multiple verse records could exist"

### ✅ Correct Understanding
> "verse_id (verses.id) IS unique. The duplicates are in the words table, where the same word appears multiple times in the same verse due to multiple imports."

---

## Sample Queries

### Query a verse (always returns 1 record)
```typescript
const { data: verse } = await supabase
  .from('verses')
  .select('*')
  .eq('id', 'genesis_1_6')
  .single(); // Safe - id is unique
```

### Query words for a verse (returns multiple records)
```typescript
const { data: words } = await supabase
  .from('words')
  .select('*')
  .eq('verse_id', 'genesis_1_6')  // Multiple words per verse is normal
  .order('position');
```

### Check for duplicate words
```typescript
const { data: allWords } = await supabase
  .from('words')
  .select('id, hebrew, verse_id, position');

// Group by (hebrew, verse_id) to find duplicates
const map = new Map();
allWords.forEach(w => {
  const key = `${w.hebrew}::${w.verse_id}`;
  map.set(key, (map.get(key) || 0) + 1);
});

const duplicates = Array.from(map.entries())
  .filter(([_, count]) => count > 1);
// Result: 234 duplicates found
```

---

## Action Items

### ✅ Immediate (Data Cleanup)
```bash
# Remove duplicate word records
npx tsx scripts/migrations/removeDuplicateWords.ts
```

### ⚠️ Required (Prevent Future Duplicates)
```sql
-- Add unique constraint after cleanup
ALTER TABLE words
ADD CONSTRAINT unique_word_position
UNIQUE (verse_id, position);
```

### 📝 Recommended (Code Updates)
1. Use UPSERT instead of INSERT for word imports
2. Validate position uniqueness before import
3. Standardize on 0-indexed or 1-indexed positions

---

## Verification Test Results

| Test | Status | Details |
|------|--------|---------|
| verses.id is unique | ✅ | 1000/1000 unique |
| verse_id format | ✅ | 100% correct format |
| FK integrity | ✅ | 0 orphan words |
| No duplicate words | ❌ | 234 duplicates found |
| Genesis 1:6 query | ✅ | Works correctly |
| Words query | ✅ | 9 words found |
| No verse_id column | ✅ | Correct: uses id |
| Expected schema | ✅ | All columns present |

**Final Score:** 7/8 passed

---

## Files Generated

1. `/Users/jinxin/dev/bible-study-app/investigate-verse-id.ts` - Main investigation
2. `/Users/jinxin/dev/bible-study-app/analyze-duplicate-words.ts` - Duplicate analysis
3. `/Users/jinxin/dev/bible-study-app/final-verification.ts` - Verification tests
4. `/Users/jinxin/dev/bible-study-app/VERSE_ID_INVESTIGATION_REPORT.md` - Full report
5. `/Users/jinxin/dev/bible-study-app/INVESTIGATION_SUMMARY.md` - This summary

---

## Conclusion

### Question: Is verse_id truly a unique identifier?
**Answer:** ✅ **YES**

`verse_id` (which is `verses.id`) is the PRIMARY KEY and is guaranteed unique. There is exactly **one record per verse** in the database.

### Question: Are there multiple records per verse?
**Answer:** ❌ **NO** for verses, ⚠️ **YES** for words (but that's a different issue)

The confusion arose because:
- Multiple **word** records exist with the same `verse_id` (expected - verses have multiple words)
- Some words have duplicate records (unexpected - data import issue)

The issue is **not** with verse uniqueness, but with duplicate word records in the words table.

---

**Investigation Complete**
**Confidence:** High
**Next Step:** Run duplicate cleanup script
