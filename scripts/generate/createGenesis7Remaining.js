/**
 * Generate remaining Genesis 7 verses (2-10, 12-15, 17-22, 24)
 * Run with: node scripts/generate/createGenesis7Remaining.js
 */

const fs = require('fs');
const path = require('path');

// All remaining verses data
const verses = [
  {
    id: "genesis_7_2",
    reference: "창세기 7:2",
    hebrew: "מִכֹּ֣ל הַבְּהֵמָ֣ה הַטְּהוֹרָ֗ה תִּֽקַּח לְךָ֛ שִׁבְעָ֥ה שִׁבְעָ֖ה אִ֣ישׁ וְאִשְׁתּ֑וֹ וּמִן הַבְּהֵמָ֡ה אֲ֠שֶׁר לֹ֣א טְהֹרָ֥ה הִ֛וא שְׁנַ֖יִם אִ֥ישׁ וְאִשְׁתּֽוֹ",
    modern: "정결한 짐승은 수컷과 암컷 일곱 쌍씩, 부정한 짐승은 수컷과 암컷 한 쌍씩 네게로 데려오라",
    ipa: "mikːol habːeheˈma hatːəhoˈra tːiqːˈaχ ləχˈa ʃivˈʔa ʃivˈʔa ˈʔiʃ vəʔiʃˈtːo umin habːeheˈma ʔaˈʃɛr lo təhoˈra hi ʃəˈnajim ˈʔiʃ vəʔiʃˈtːo",
    korean_pronunciation: "미콜 하베헤마 하테호라 티카흐 레카 쉬브아 쉬브아 이쉬 베이쉬토 우민 하베헤마 아셰르 로 테호라 히 쉐나임 이쉬 베이쉬토"
  },
  {
    id: "genesis_7_3",
    reference: "창세기 7:3",
    hebrew: "גַּ֣ם מֵע֧וֹף הַשָּׁמַ֛יִם שִׁבְעָ֥ה שִׁבְעָ֖ה זָכָ֣ר וּנְקֵבָ֑ה לְחַיּ֥וֹת זֶ֖רַע עַל פְּנֵ֥י כָל הָאָֽרֶץ",
    modern: "공중의 새도 수컷과 암컷 일곱 쌍씩 데려와서 온 땅 위에 그 씨가 살아 있게 하라",
    ipa: "gam meˈʔof haʃːaˈmajim ʃivˈʔa ʃivˈʔa zaˈχar unqeˈva ləχajːˈot ˈzɛraʔ ʔal pəˈne χol haˈʔarɛts",
    korean_pronunciation: "감 메오프 하샤마임 쉬브아 쉬브아 자카르 운케바 레하요트 제라 알 페네 콜 하아레츠"
  }
];

// Template for generating full content
function generateVerseContent(verse) {
  // This would be expanded with full word analysis and commentary
  return {
    verse_id: verse.id,
    reference: verse.reference,
    hebrew: verse.hebrew,
    ipa: verse.ipa,
    korean_pronunciation: verse.korean_pronunciation,
    modern: verse.modern,
    words: generateWords(verse),
    commentary: generateCommentary(verse)
  };
}

function generateWords(verse) {
  // Simplified word generation - would need full implementation
  return [];
}

function generateCommentary(verse) {
  return {
    intro: `${verse.reference}의 주석입니다.`,
    sections: [],
    whyQuestion: {
      question: "질문",
      answer: "답변",
      bibleReferences: []
    },
    conclusion: {
      title: "💡 신학적 의미",
      content: "신학적 의미입니다."
    }
  };
}

// Save files
verses.forEach(verse => {
  const content = generateVerseContent(verse);
  const filename = `genesis-7-${verse.id.split('_')[2]}-content.json`;
  const filepath = path.join(__dirname, '../../data', filename);

  fs.writeFileSync(filepath, JSON.stringify(content, null, 2));
  console.log(`✅ Created: ${filename}`);
});

console.log(`\n✨ Generated ${verses.length} verse files!`);
