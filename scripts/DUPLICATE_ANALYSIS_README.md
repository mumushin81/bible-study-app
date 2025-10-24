# Duplicate Analysis Tools

This directory contains tools for analyzing and managing duplicate word records in the Bible Study App database.

## 📋 Analysis Tools

### 1. General Duplicate Detection

```bash
# Check all duplicates across the database
npx tsx scripts/checkDuplicates.ts
```

This script checks for duplicates in:
- Verses table (by book_id + chapter + verse_number)
- Words table (by verse_id + hebrew + position)
- Commentaries table (by verse_id)
- Hebrew roots table (by root_hebrew)
- Word metadata table (by word_hebrew)
- Word derivations table (by word_hebrew + root_hebrew)

### 2. Comprehensive Word Duplicate Analysis

```bash
# Deep analysis of all word duplicates
npx tsx scripts/analyzeAllWordDuplicates.ts
```

**Features:**
- Finds all duplicate words based on (verse_id, hebrew, position)
- Scores each duplicate based on quality metrics
- Generates SQL DELETE commands
- Shows detailed comparison of all versions

**Scoring System:**
- Newest record: +10 points
- Has SVG: +5 points
- Has viewBox: +3 points
- Has gradient: +3 points
- MD Script gradient ID: +5 points
- Detailed SVG (>500 chars): +2 points

### 3. Verse-Specific Analysis

```bash
# Analyze Genesis 1:6 specifically
npx tsx scripts/analyzeGenesis1_6Duplicates.ts
```

**Features:**
- Complete word list for the verse
- Position field analysis
- SVG quality assessment
- Decision matrix for duplicate resolution
- Checks for other duplicates in the same verse

### 4. Word Search

```bash
# Find all occurrences of יְהִי
npx tsx scripts/findAllYehi.ts
```

Searches for specific Hebrew words across all verses.

## 🗑️ Deletion Tools

### Execute Duplicate Deletion

```bash
# Test deletion in dry-run mode
npx tsx scripts/executeDuplicateDeletion.ts
```

**Safety Features:**
- DRY_RUN mode by default
- 5-second countdown before execution
- Batch processing (50 records at a time)
- Verification after deletion
- Transaction support

**Usage:**
1. Run `analyzeAllWordDuplicates.ts` to identify duplicates
2. Copy IDs from output to `IDS_TO_DELETE` array in `executeDuplicateDeletion.ts`
3. Review the records in dry-run mode
4. Set `DRY_RUN = false` to execute
5. Run the script

### Historical Cleanup Scripts

Located in `/scripts/migrations/`:
- `removeDuplicateWords.ts` - Removes duplicates from Genesis
- `removeDuplicatesSQL.ts` - SQL-based duplicate removal

## 📊 Analysis Results

### Current Database Status (2025-10-24)

```
Total Words: 1,000
Duplicate Groups: 0
Status: ✅ CLEAN
```

### Genesis 1:6 Analysis

```
Total Words: 9
יְהִי Occurrences: 1 (at position 3)
Duplicates: 0
Status: ✅ CLEAN
```

### יְהִי Distribution

The word יְהִי appears 3 times across different verses:
- Genesis 1:3 (position 3) - "Let there be light"
- Genesis 1:6 (position 3) - "Let there be an expanse"
- Genesis 1:14 (position 3) - "Let there be lights"

**This is correct** - these are legitimate occurrences in different verses, not duplicates.

## 🔍 Verification Queries

### Check Genesis 1:6 for duplicates:
```sql
SELECT id, hebrew, meaning, position, created_at
FROM words
WHERE verse_id = 'genesis_1_6'
ORDER BY position;
```

### Check for יְהִי duplicates:
```sql
SELECT verse_id, COUNT(*) as count
FROM words
WHERE hebrew = 'יְהִי'
GROUP BY verse_id
HAVING COUNT(*) > 1;
```

### Check database-wide duplicates:
```sql
SELECT verse_id, hebrew, position, COUNT(*) as count
FROM words
GROUP BY verse_id, hebrew, position
HAVING COUNT(*) > 1;
```

## 🛠️ Preventing Future Duplicates

### Add UNIQUE Constraint

```sql
-- Prevent duplicate words at the same position
ALTER TABLE words
ADD CONSTRAINT unique_word_per_position
UNIQUE (verse_id, position);

-- Or prevent duplicate (word + position) combinations
ALTER TABLE words
ADD CONSTRAINT unique_word_combination
UNIQUE (verse_id, hebrew, position);
```

### Insert with Conflict Handling

```typescript
// Upsert pattern
const { data, error } = await supabase
  .from('words')
  .upsert({
    verse_id: 'genesis_1_6',
    position: 3,
    hebrew: 'יְהִי',
    // ... other fields
  }, {
    onConflict: 'verse_id,position'
  });
```

## 📖 Decision Matrix

When multiple versions of a word exist, keep the record with:

1. **Highest Quality Score** (see scoring system above)
2. **Most Recent Creation Date** (if scores are equal)
3. **Best SVG Quality** (if dates are similar)

Delete the others.

## 🚨 Important Notes

1. **Always review before deleting** - Check the records carefully
2. **Use DRY_RUN mode first** - Test before executing
3. **Backup data** - Consider taking a database snapshot
4. **Verify after deletion** - Run verification queries
5. **Check affected verses** - Ensure no other issues were introduced

## 📝 Reporting

A comprehensive analysis report is available at:
`/Users/jinxin/dev/bible-study-app/GENESIS_1_6_DUPLICATE_ANALYSIS.md`

This includes:
- Complete analysis of Genesis 1:6
- יְהִי word distribution
- Database-wide duplicate status
- SVG quality assessment
- Recommendations

## 🔗 Related Scripts

- `/scripts/checkDuplicates.ts` - Quick duplicate check
- `/scripts/analyzeDuplicates.ts` - Detailed duplicate analysis
- `/scripts/deleteDuplicates.ts` - Simple deletion script
- `/scripts/migrations/removeDuplicateWords.ts` - Genesis cleanup
- `/scripts/debug/analyzeDuplicateRootCause.ts` - Root cause analysis

## 📞 Support

If you need to:
- Analyze a specific verse: Modify `analyzeGenesis1_6Duplicates.ts`
- Search for a specific word: Modify `findAllYehi.ts`
- Delete specific records: Use `executeDuplicateDeletion.ts`

For questions or issues, review the main analysis report first.

---

**Last Updated:** 2025-10-24
**Status:** All tools tested and working
**Database Status:** Clean, no duplicates
