import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Word {
  hebrew: string;
  meaning: string;
  ipa: string;
  korean: string;
  letters: string;
  root: string;
  grammar: string;
  emoji?: string; // This field will be removed
  iconSvg: string;
  relatedWords?: string[];
}

interface VerseData {
  id: string;
  reference: string;
  hebrew: string;
  ipa: string;
  koreanPronunciation: string;
  modern: string;
  words: Word[];
  commentary: any;
}

interface ProcessingStats {
  filesProcessed: number;
  wordsModified: number;
  errors: string[];
  filesWithEmoji: string[];
}

/**
 * Remove emoji field from all words in a single JSON file
 */
function processFile(filePath: string): { wordsModified: number; hadEmoji: boolean; error?: string } {
  try {
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: VerseData = JSON.parse(fileContent);

    // Count words with emoji field before modification
    let wordsModified = 0;
    let hadEmoji = false;

    // Process each word
    if (data.words && Array.isArray(data.words)) {
      data.words = data.words.map(word => {
        if ('emoji' in word) {
          hadEmoji = true;
          wordsModified++;
          // Create a new object without the emoji field
          const { emoji, ...wordWithoutEmoji } = word;
          return wordWithoutEmoji;
        }
        return word;
      });
    }

    // Write back to file with proper formatting
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');

    return { wordsModified, hadEmoji };
  } catch (error) {
    return {
      wordsModified: 0,
      hadEmoji: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Verify that emoji field was removed and iconSvg is intact
 */
function verifyFile(filePath: string): { isValid: boolean; hasEmoji: boolean; hasIconSvg: boolean } {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: VerseData = JSON.parse(fileContent);

    let hasEmoji = false;
    let hasIconSvg = true;

    if (data.words && Array.isArray(data.words)) {
      for (const word of data.words) {
        if ('emoji' in word) {
          hasEmoji = true;
        }
        if (!word.iconSvg) {
          hasIconSvg = false;
        }
      }
    }

    return { isValid: !hasEmoji && hasIconSvg, hasEmoji, hasIconSvg };
  } catch {
    return { isValid: false, hasEmoji: false, hasIconSvg: false };
  }
}

/**
 * Main function to process all JSON files in the directory
 */
function removeEmojiFromAllFiles() {
  const generatedV2Dir = path.join(__dirname, '..', 'data', 'generated_v2');

  console.log('========================================');
  console.log('Removing emoji field from generated_v2 files');
  console.log('========================================\n');
  console.log(`Directory: ${generatedV2Dir}\n`);

  // Check if directory exists
  if (!fs.existsSync(generatedV2Dir)) {
    console.error(`❌ Error: Directory not found: ${generatedV2Dir}`);
    process.exit(1);
  }

  // Get all JSON files
  const files = fs.readdirSync(generatedV2Dir)
    .filter(file => file.endsWith('.json'))
    .sort();

  console.log(`Found ${files.length} JSON files\n`);

  const stats: ProcessingStats = {
    filesProcessed: 0,
    wordsModified: 0,
    errors: [],
    filesWithEmoji: []
  };

  // Process each file
  files.forEach((file, index) => {
    const filePath = path.join(generatedV2Dir, file);
    console.log(`[${index + 1}/${files.length}] Processing ${file}...`);

    const result = processFile(filePath);

    if (result.error) {
      console.log(`  ❌ Error: ${result.error}`);
      stats.errors.push(`${file}: ${result.error}`);
    } else {
      stats.filesProcessed++;
      stats.wordsModified += result.wordsModified;

      if (result.hadEmoji) {
        stats.filesWithEmoji.push(file);
        console.log(`  ✓ Removed emoji from ${result.wordsModified} word(s)`);
      } else {
        console.log(`  - No emoji field found`);
      }
    }
  });

  console.log('\n========================================');
  console.log('Verifying files...');
  console.log('========================================\n');

  // Verify all files
  let verificationPassed = true;
  let filesWithIssues: string[] = [];

  files.forEach((file, index) => {
    const filePath = path.join(generatedV2Dir, file);
    const verification = verifyFile(filePath);

    if (!verification.isValid) {
      verificationPassed = false;
      filesWithIssues.push(file);

      if (verification.hasEmoji) {
        console.log(`❌ ${file}: Still has emoji field!`);
      }
      if (!verification.hasIconSvg) {
        console.log(`❌ ${file}: Missing iconSvg field!`);
      }
    }
  });

  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================\n');

  console.log(`Files processed: ${stats.filesProcessed}/${files.length}`);
  console.log(`Files with emoji removed: ${stats.filesWithEmoji.length}`);
  console.log(`Total words modified: ${stats.wordsModified}`);
  console.log(`Errors encountered: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ Errors:');
    stats.errors.forEach(error => console.log(`  - ${error}`));
  }

  if (verificationPassed) {
    console.log('\n✅ Verification: All files verified successfully!');
    console.log('✅ No emoji fields remaining');
    console.log('✅ All iconSvg fields intact');
  } else {
    console.log('\n❌ Verification: Issues found in files:');
    filesWithIssues.forEach(file => console.log(`  - ${file}`));
  }

  console.log('\n========================================');
  console.log('COMPLETED');
  console.log('========================================\n');

  // Exit with error code if there were issues
  if (stats.errors.length > 0 || !verificationPassed) {
    process.exit(1);
  }
}

// Run the script
removeEmojiFromAllFiles();
