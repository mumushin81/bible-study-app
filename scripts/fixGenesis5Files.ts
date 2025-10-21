#!/usr/bin/env tsx
/**
 * Fix Genesis 5 files by adding missing 'id' field and renaming fields
 *
 * Usage: tsx scripts/fixGenesis5Files.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToFix = [
  'genesis_5_4.json',
  'genesis_5_5.json',
  'genesis_5_6.json',
  'genesis_5_7.json',
  'genesis_5_8.json',
  'genesis_5_9.json',
  'genesis_5_25.json',
  'genesis_5_26.json',
  'genesis_5_27.json',
  'genesis_5_28.json',
];

// Hebrew text mapping for each verse (you'll need to add these)
const hebrewTexts: Record<string, string> = {
  'genesis_5_4': 'וַיִּֽהְי֣וּ יְמֵי אָדָ֗ם אַֽחֲרֵי֙ הוֹלִיד֣וֹ אֶת שֵׁ֔ת שְׁמֹנֶ֥ה מֵאֹ֖ת שָׁנָ֑ה וַיּ֥וֹלֶד בָּנִ֖ים וּבָנֽוֹת',
  'genesis_5_5': 'וַיִּֽהְי֞וּ כָּל יְמֵ֤י אָדָם֙ אֲשֶׁר חַ֔י תְּשַׁ֤ע מֵאוֹת֙ שָׁנָ֔ה וּשְׁלֹשִׁ֖ים שָׁנָ֑ה וַיָּמֹֽת',
  'genesis_5_6': 'וַֽיְחִי שֵׁ֕ת חָמֵ֥שׁ שָׁנִ֖ים וּמְאַ֣ת שָׁנָ֑ה וַיּ֖וֹלֶד אֶת אֱנֽוֹשׁ',
  'genesis_5_7': 'וַֽיְחִי שֵׁ֗ת אַֽחֲרֵי֙ הוֹלִיד֣וֹ אֶת אֱנ֔וֹשׁ שֶׁ֣בַע שָׁנִ֔ים וּשְׁמֹנֶ֥ה מֵא֖וֹת שָׁנָ֑ה וַיּ֥וֹלֶד בָּנִ֖ים וּבָנֽוֹת',
  'genesis_5_8': 'וַיִּֽהְיוּ֙ כָּל יְמֵי שֵׁ֔ת שְׁתֵּ֤ים עֶשְׂרֵה֙ שָׁנָ֔ה וּתְשַׁ֥ע מֵא֖וֹת שָׁנָ֑ה וַיָּמֹֽת',
  'genesis_5_9': 'וַֽיְחִ֥י אֱנ֖וֹשׁ תִּשְׁעִ֣ים שָׁנָ֑ה וַיּ֖וֹלֶד אֶת קֵינָֽן',
  'genesis_5_25': 'וַֽיְחִ֣י מְתוּשֶׁ֔לַח שֶׁ֧בַע וּשְׁמֹנִ֛ים שָׁנָ֖ה וּמְאַ֣ת שָׁנָ֑ה וַיּ֖וֹלֶד אֶת לָֽמֶךְ',
  'genesis_5_26': 'וַֽיְחִ֣י מְתוּשֶׁ֗לַח אַֽחֲרֵי֙ הוֹלִיד֣וֹ אֶת לֶ֔מֶךְ שְׁתַּ֤יִם וּשְׁמוֹנִים֙ שָׁנָ֔ה וּשְׁבַ֥ע מֵא֖וֹת שָׁנָ֑ה וַיּ֥וֹלֶד בָּנִ֖ים וּבָנֽוֹת',
  'genesis_5_27': 'וַיִּֽהְיוּ֙ כָּל יְמֵ֣י מְתוּשֶׁ֔לַח תֵּ֤שַׁע וְשִׁשִּׁים֙ שָׁנָ֔ה וּתְשַׁ֥ע מֵא֖וֹת שָׁנָ֑ה וַיָּמֹֽת',
  'genesis_5_28': 'וַֽיְחִי לֶ֕מֶךְ שְׁתַּ֧יִם וּשְׁמֹנִ֛ים שָׁנָ֖ה וּמְאַ֣ת שָׁנָ֑ה וַיּ֖וֹלֶד בֵּֽן',
};

function fixFile(fileName: string) {
  const filePath = path.join(__dirname, '../data/generated_v2', fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${fileName}`);
    return false;
  }

  try {
    // Read the file
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Extract verse_id to create the id
    const verseId = content.verse_id;
    if (!verseId) {
      console.log(`❌ ${fileName}: No verse_id found`);
      return false;
    }

    // Parse verse number from verse_id (e.g., "genesis_5_25" -> 25)
    const verseNumber = parseInt(verseId.split('_')[2]);

    // Create the fixed structure
    const fixed = {
      id: verseId,  // Add the missing 'id' field
      reference: `Genesis 5:${verseNumber}`,  // Add reference
      hebrew: hebrewTexts[verseId] || '',  // Add Hebrew text
      ipa: content.ipa || '',
      koreanPronunciation: content.korean_pronunciation || '',  // Rename to camelCase
      modern: content.modern || '',
      words: content.words || [],
      commentary: content.commentary || {}
    };

    // Write the fixed content back
    fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf-8');
    console.log(`✅ Fixed ${fileName}`);
    return true;

  } catch (error: any) {
    console.log(`❌ ${fileName}: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing Genesis 5 files...\n');

  let successCount = 0;
  let failCount = 0;

  for (const file of filesToFix) {
    if (fixFile(file)) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n📊 Results:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
}

main();
