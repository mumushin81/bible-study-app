const fs = require('fs');
const path = require('path');

const filesToValidate = [
  'genesis_11_10-13.json',
  'genesis_11_14-17.json',
  'genesis_11_18-21.json',
  'genesis_11_22-25.json',
  'genesis_11_26-29.json',
  'genesis_11_30-32.json',
  'genesis_12_11-14.json',
  'genesis_12_15-18.json',
  'genesis_12_19-20.json',
  'genesis_13_5-9.json',
  'genesis_13_10-14.json',
  'genesis_13_15-18.json',
  'genesis_14_10-13.json',
  'genesis_14_14-17.json',
  'genesis_14_22-24.json',
  'genesis_15_1-4.json',
  'genesis_15_5-8.json',
  'genesis_15_9-12.json',
  'genesis_15_13-16.json',
  'genesis_15_17-21.json',
];

const errors = [];
const warnings = [];
let totalVerses = 0;
let totalWords = 0;

console.log('🔍 Validating Genesis 11-15 JSON files...\n');

filesToValidate.forEach((filename) => {
  const filePath = path.join(__dirname, '../data/generated', filename);

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      errors.push(`❌ ${filename}: File not found`);
      return;
    }

    // Read and parse JSON
    const content = fs.readFileSync(filePath, 'utf-8');
    let data;

    try {
      data = JSON.parse(content);
    } catch (parseError) {
      errors.push(`❌ ${filename}: Invalid JSON - ${parseError.message}`);
      return;
    }

    // Validate structure
    if (!Array.isArray(data)) {
      errors.push(`❌ ${filename}: Root must be an array`);
      return;
    }

    console.log(`📖 ${filename}: ${data.length} verse(s)`);
    totalVerses += data.length;

    data.forEach((verse, index) => {
      const verseNum = index + 1;

      // Check required fields
      const requiredFields = ['verseId', 'ipa', 'koreanPronunciation', 'modern', 'words', 'commentary'];
      requiredFields.forEach((field) => {
        if (!verse[field]) {
          errors.push(`❌ ${filename} verse ${verseNum}: Missing field '${field}'`);
        }
      });

      // Validate words array
      if (verse.words && Array.isArray(verse.words)) {
        totalWords += verse.words.length;
        verse.words.forEach((word, wordIndex) => {
          const requiredWordFields = ['hebrew', 'meaning', 'ipa', 'korean', 'letters', 'root', 'grammar', 'emoji'];
          requiredWordFields.forEach((field) => {
            if (!word[field]) {
              warnings.push(`⚠️  ${filename} verse ${verseNum} word ${wordIndex + 1}: Missing '${field}'`);
            }
          });

          // Check if iconSvg exists and is valid SVG
          if (!word.iconSvg) {
            warnings.push(`⚠️  ${filename} verse ${verseNum} word ${wordIndex + 1}: Missing 'iconSvg'`);
          } else if (!word.iconSvg.includes('<svg')) {
            errors.push(`❌ ${filename} verse ${verseNum} word ${wordIndex + 1}: Invalid SVG format`);
          }
        });
      } else {
        errors.push(`❌ ${filename} verse ${verseNum}: 'words' must be an array`);
      }

      // Validate commentary structure
      if (verse.commentary) {
        if (!verse.commentary.intro) {
          warnings.push(`⚠️  ${filename} verse ${verseNum}: Missing commentary.intro`);
        }
        if (!verse.commentary.sections || !Array.isArray(verse.commentary.sections)) {
          warnings.push(`⚠️  ${filename} verse ${verseNum}: Missing or invalid commentary.sections`);
        } else {
          verse.commentary.sections.forEach((section, sectionIndex) => {
            if (!section.emoji || !section.title || !section.description || !section.color) {
              warnings.push(`⚠️  ${filename} verse ${verseNum} section ${sectionIndex + 1}: Missing required section fields`);
            }
          });
        }
        if (!verse.commentary.whyQuestion) {
          warnings.push(`⚠️  ${filename} verse ${verseNum}: Missing commentary.whyQuestion`);
        }
        if (!verse.commentary.conclusion) {
          warnings.push(`⚠️  ${filename} verse ${verseNum}: Missing commentary.conclusion`);
        }
      }
    });

  } catch (error) {
    errors.push(`❌ ${filename}: Unexpected error - ${error.message}`);
  }
});

// Print summary
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`Total files checked: ${filesToValidate.length}`);
console.log(`Total verses: ${totalVerses}`);
console.log(`Total words: ${totalWords}`);
console.log(`Average words per verse: ${(totalWords / totalVerses).toFixed(1)}`);
console.log('');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All files are valid! No errors or warnings found.');
} else {
  if (errors.length > 0) {
    console.log(`\n🚨 ERRORS (${errors.length}):`);
    errors.forEach((err) => console.log(err));
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach((warn) => console.log(warn));
  }
}

console.log('\n' + '='.repeat(60));

// Exit with error code if there are errors
process.exit(errors.length > 0 ? 1 : 0);
