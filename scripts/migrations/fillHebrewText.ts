import fs from 'fs';
import path from 'path';

interface Word {
  hebrew: string;
  meaning: string;
  ipa: string;
  korean: string;
  letters: string;
  root: string;
  grammar: string;
  emoji?: string;
  iconSvg?: string;
  relatedWords?: string[];
}

interface Verse {
  id: string;
  reference: string;
  hebrew: string;
  ipa: string;
  koreanPronunciation: string;
  modern: string;
  words: Word[];
  commentary?: any;
}

const UNIFIED_DIR = path.join(process.cwd(), 'data', 'unified_verses');

async function fillHebrewText() {
  console.log('🔍 Scanning for verses with missing Hebrew text...\n');

  const files = fs.readdirSync(UNIFIED_DIR).filter(f => f.endsWith('.json'));
  let processedCount = 0;
  let filledCount = 0;
  const filledVerses: string[] = [];

  for (const file of files) {
    const filePath = path.join(UNIFIED_DIR, file);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const verse: Verse = JSON.parse(content);

      // Check if hebrew field is missing or empty
      if (!verse.hebrew || verse.hebrew.trim() === '') {
        // Generate Hebrew text from words
        const hebrewText = verse.words
          .map(word => word.hebrew)
          .filter(h => h && h.trim() !== '')
          .join(' ');

        if (hebrewText) {
          verse.hebrew = hebrewText;

          // Write back to file with proper formatting
          fs.writeFileSync(
            filePath,
            JSON.stringify(verse, null, 2),
            'utf-8'
          );

          filledCount++;
          filledVerses.push(verse.reference);
          console.log(`✅ Filled: ${verse.reference} (${file})`);
        } else {
          console.log(`⚠️  No Hebrew words found: ${verse.reference} (${file})`);
        }
      }

      processedCount++;
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Fill Hebrew Text Summary');
  console.log('='.repeat(60));
  console.log(`Total files processed: ${processedCount}`);
  console.log(`Hebrew text filled: ${filledCount}`);
  console.log(`Success rate: ${((filledCount / processedCount) * 100).toFixed(1)}%`);

  if (filledVerses.length > 0) {
    console.log('\n✅ Filled verses:');
    filledVerses.forEach(ref => console.log(`   - ${ref}`));
  }

  console.log('\n✨ Hebrew text fill completed!\n');
}

fillHebrewText().catch(console.error);
