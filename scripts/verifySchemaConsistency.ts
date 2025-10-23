/**
 * Verify Schema Consistency
 *
 * Purpose: Verify that all Genesis 1-15 files have consistent schema
 */

import fs from 'fs';
import path from 'path';

const UNIFIED_DIR = path.join(process.cwd(), 'data', 'unified_verses');

interface ValidationResult {
  filename: string;
  valid: boolean;
  missingFields: string[];
  errors: string[];
}

const results: ValidationResult[] = [];

/**
 * Required fields for verse
 */
const REQUIRED_VERSE_FIELDS = [
  'id',
  'reference',
  'hebrew',
  'ipa',
  'koreanPronunciation',
  'modern',
  'words',
];

/**
 * Required fields for word
 */
const REQUIRED_WORD_FIELDS = [
  'hebrew',
  'meaning',
  'ipa',
  'korean',
  'letters',
  'root',
  'grammar',
];

/**
 * Validate word object
 */
function validateWord(word: any, wordIndex: number): string[] {
  const missing: string[] = [];

  for (const field of REQUIRED_WORD_FIELDS) {
    if (word[field] === undefined || word[field] === null) {
      missing.push(`words[${wordIndex}].${field}`);
    }
  }

  return missing;
}

/**
 * Validate verse object
 */
function validateVerse(verse: any): string[] {
  const missing: string[] = [];

  // Check verse-level fields
  for (const field of REQUIRED_VERSE_FIELDS) {
    if (verse[field] === undefined || verse[field] === null) {
      missing.push(field);
    }
  }

  // Check words array
  if (Array.isArray(verse.words)) {
    verse.words.forEach((word: any, index: number) => {
      const wordMissing = validateWord(word, index);
      missing.push(...wordMissing);
    });
  }

  return missing;
}

/**
 * Process a single file
 */
function validateFile(filename: string): ValidationResult {
  const result: ValidationResult = {
    filename,
    valid: true,
    missingFields: [],
    errors: [],
  };

  try {
    const filePath = path.join(UNIFIED_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    const verse = JSON.parse(content);

    const missing = validateVerse(verse);

    if (missing.length > 0) {
      result.valid = false;
      result.missingFields = missing;
    }
  } catch (error) {
    result.valid = false;
    result.errors.push(`${error}`);
  }

  return result;
}

/**
 * Check if file is Genesis 1-15
 */
function isGenesis1to15(filename: string): boolean {
  const match = filename.match(/genesis_(\d+)_\d+\.json/);
  if (!match) return false;

  const chapter = parseInt(match[1], 10);
  return chapter >= 1 && chapter <= 15;
}

/**
 * Main function
 */
async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 SCHEMA CONSISTENCY VERIFICATION - Genesis 1-15`);
  console.log(`${'='.repeat(60)}\n`);

  const allFiles = fs.readdirSync(UNIFIED_DIR).filter(f => f.endsWith('.json'));
  const genesis1to15Files = allFiles.filter(isGenesis1to15);

  console.log(`📂 Checking ${genesis1to15Files.length} files...`);

  // Validate all files
  for (const file of genesis1to15Files) {
    const result = validateFile(file);
    results.push(result);
  }

  // Generate report
  const validFiles = results.filter(r => r.valid);
  const invalidFiles = results.filter(r => !r.valid);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 VALIDATION RESULTS`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n✅ Valid files: ${validFiles.length}/${results.length}`);

  if (invalidFiles.length > 0) {
    console.log(`\n❌ Invalid files: ${invalidFiles.length}`);
    console.log(`\nDetails:`);

    invalidFiles.slice(0, 10).forEach(result => {
      console.log(`\n   File: ${result.filename}`);
      if (result.missingFields.length > 0) {
        console.log(`   Missing fields: ${result.missingFields.join(', ')}`);
      }
      if (result.errors.length > 0) {
        console.log(`   Errors: ${result.errors.join(', ')}`);
      }
    });

    if (invalidFiles.length > 10) {
      console.log(`\n   ... and ${invalidFiles.length - 10} more invalid files`);
    }
  } else {
    console.log(`\n🎉 All files are valid!`);
  }

  console.log(`\n${'='.repeat(60)}\n`);

  // Sample valid file
  if (validFiles.length > 0) {
    const sampleFile = validFiles[0].filename;
    const samplePath = path.join(UNIFIED_DIR, sampleFile);
    const sample = JSON.parse(fs.readFileSync(samplePath, 'utf-8'));

    console.log(`📄 Sample structure (${sampleFile}):`);
    console.log(`\nVerse fields:`);
    console.log(`   - id: ${sample.id}`);
    console.log(`   - reference: ${sample.reference}`);
    console.log(`   - hebrew: ${sample.hebrew.substring(0, 30)}...`);
    console.log(`   - words: ${sample.words.length} words`);
    if (sample.commentary) {
      console.log(`   - commentary: ${sample.commentary.sections?.length || 0} sections`);
    }

    if (sample.words.length > 0) {
      console.log(`\nFirst word structure:`);
      const word = sample.words[0];
      console.log(`   - hebrew: ${word.hebrew}`);
      console.log(`   - meaning: ${word.meaning}`);
      console.log(`   - letters: ${word.letters ? 'present' : 'MISSING'}`);
      console.log(`   - root: ${word.root}`);
      console.log(`   - iconSvg: ${word.iconSvg ? 'present' : 'not present'}`);
      console.log(`   - emoji: ${word.emoji || 'not present'}`);
    }

    console.log(`\n${'='.repeat(60)}\n`);
  }

  // Exit with error if any files are invalid
  if (invalidFiles.length > 0) {
    process.exit(1);
  }
}

main();
