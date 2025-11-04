/**
 * 음절 분리 로직만 단순 테스트 (DB 없이)
 */

// FlashCard.tsx 로직 복제
function separateSyllables(rootPronunciation: string): string[] {
  const syllables: string[] = [];
  const vowels = /[aeiouəɔɛʊɪæɑʌɒ]/i;

  // 강세 기호로 먼저 분리
  const stressSplit = rootPronunciation.split('ˈ');

  if (stressSplit.length > 1) {
    // 강세가 있는 경우
    if (stressSplit[0]) {
      syllables.push(stressSplit[0]); // 첫 음절 (강세 없음, 빈 문자열이 아닌 경우만)
    }
    for (let i = 1; i < stressSplit.length; i++) {
      syllables.push('ˈ' + stressSplit[i]); // 강세 포함
    }
  } else {
    // 강세가 없으면 모음 기준으로 음절 분리
    let current = '';
    let hasVowel = false;

    for (let i = 0; i < rootPronunciation.length; i++) {
      const char = rootPronunciation[i];
      current += char;

      if (vowels.test(char)) {
        hasVowel = true;
      } else if (hasVowel && i < rootPronunciation.length - 1) {
        // 모음 다음에 자음이 오면 새 음절 시작 가능성
        const nextChar = rootPronunciation[i + 1];
        if (vowels.test(nextChar)) {
          syllables.push(current);
          current = '';
          hasVowel = false;
        }
      }
    }

    if (current) syllables.push(current);
  }

  return syllables;
}

console.log('🎵 Genesis 1:1 음절 분리 테스트\n');
console.log('='.repeat(120));

const testCases = [
  { hebrew: 'בְּרֵאשִׁית', letters: ['ר', 'א', 'ש', 'י', 'ת'], ipa: 'reˈʃit', meaning: '태초에' },
  { hebrew: 'בָּרָא', letters: ['ב', 'ר', 'א'], ipa: 'baˈra', meaning: '창조하셨다' },
  { hebrew: 'אֱלֹהִים', letters: ['א', 'ל', 'ה', 'י', 'ם'], ipa: 'ʔɛloˈhim', meaning: '하나님' },
  { hebrew: 'אֵת', letters: ['א', 'ת'], ipa: 'ʔet', meaning: '~을/를' },
  { hebrew: 'הַשָּׁמַיִם', letters: ['ש', 'מ', 'י', 'ם'], ipa: 'ʃaˈmajim', meaning: '하늘들' },
  { hebrew: 'וְאֵת', letters: ['א', 'ת'], ipa: 'ʔet', meaning: '그리고 ~을/를' },
  { hebrew: 'הָאָרֶץ', letters: ['א', 'ר', 'ץ'], ipa: 'ˈʔarɛts', meaning: '땅' }
];

testCases.forEach((test, idx) => {
  console.log(`\n${idx + 1}. ${test.hebrew} (${test.meaning})`);
  console.log(`   글자: [${test.letters.join(', ')}] (${test.letters.length}개)`);
  console.log(`   IPA: ${test.ipa}`);

  // 음절 분리
  const syllables = separateSyllables(test.ipa);
  console.log(`   음절: ${syllables.join(' + ')} (${syllables.length}음절)`);

  // 글자 그룹화
  const letterGroups: string[][] = [];
  if (syllables.length > 0) {
    const lettersPerSyllable = Math.ceil(test.letters.length / syllables.length);
    for (let i = 0; i < syllables.length; i++) {
      const start = i * lettersPerSyllable;
      const end = Math.min(start + lettersPerSyllable, test.letters.length);
      letterGroups.push(test.letters.slice(start, end));
    }
  }

  console.log(`   매칭:`);
  letterGroups.forEach((group, i) => {
    console.log(`      ${group.join(' + ')} → [${syllables[i]}]`);
  });

  // 시각화
  console.log(`   플래시카드:`);
  const visual = letterGroups.map((group, i) => {
    return `[${group.join('')}]\n        ↓\n       ${syllables[i]}`;
  }).join('     ');
  console.log(`      ${visual}`);
});

console.log('\n' + '='.repeat(120));
console.log('\n✅ בְּרֵאשִׁית (태초에) 상세:\n');

const bereshit = testCases[0];
const syllables = separateSyllables(bereshit.ipa);
const letterGroups: string[][] = [];
const lettersPerSyllable = Math.ceil(bereshit.letters.length / syllables.length);
for (let i = 0; i < syllables.length; i++) {
  const start = i * lettersPerSyllable;
  const end = Math.min(start + lettersPerSyllable, bereshit.letters.length);
  letterGroups.push(bereshit.letters.slice(start, end));
}

console.log('어근: רֵאשִׁית (reshit)');
console.log(`IPA: ${bereshit.ipa}`);
console.log(`음절 수: ${syllables.length}`);
console.log('');
console.log('음절 1: re (강세 없음)');
console.log('  └─ 히브리어 글자: ר (resh) + א (alef)');
console.log('  └─ 발음: [re]');
console.log('');
console.log('음절 2: ˈʃit (강세 있음)');
console.log('  └─ 히브리어 글자: ש (shin) + י (yod) + ת (tav)');
console.log('  └─ 발음: [ˈʃit]');
console.log('');
console.log('플래시카드 표시:');
console.log('┌────────┬────────────┐');
console.log('│  ר א   │  ש י ת     │');
console.log('│   ↓    │     ↓      │');
console.log('│  [re]  │  [ˈʃit]    │');
console.log('└────────┴────────────┘');
console.log('전체 발음: [reˈʃit]');
console.log('');
