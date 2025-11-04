/**
 * Math.floor() 기반 글자 배분 테스트
 */

console.log('🎯 Math.floor() 글자 배분 테스트\n');
console.log('='.repeat(100));

const testCases = [
  {
    word: 'בָּרָא (창조하셨다)',
    letters: ['ב', 'ר', 'א'],
    ipa: 'baˈra',
    syllables: ['ba', 'ˈra']
  },
  {
    word: 'בְּרֵאשִׁית (태초에)',
    letters: ['ר', 'א', 'ש', 'י', 'ת'],
    ipa: 'reˈʃit',
    syllables: ['re', 'ˈʃit']
  }
];

testCases.forEach((test, idx) => {
  console.log(`\n${idx + 1}. ${test.word}`);
  console.log('─'.repeat(80));

  // 각 음절의 음소 개수 (강세 제거)
  const syllableLengths = test.syllables.map(s => s.replace('ˈ', '').length);
  const totalLength = syllableLengths.reduce((a, b) => a + b, 0);

  console.log(`\n음절 분석:`);
  test.syllables.forEach((s, i) => {
    console.log(`   ${i + 1}. [${s}] → ${syllableLengths[i]}음소`);
  });
  console.log(`   총 음소: ${totalLength}개`);
  console.log(`   총 글자: ${test.letters.length}개`);

  // Math.floor() 기반 비례 배분
  const letterGroups: string[][] = [];
  let usedLetters = 0;

  console.log(`\n글자 배분 (Math.floor 사용):`);
  for (let i = 0; i < test.syllables.length; i++) {
    const ratio = syllableLengths[i] / totalLength;
    const count = i === test.syllables.length - 1
      ? test.letters.length - usedLetters
      : Math.floor(test.letters.length * ratio);

    const group = test.letters.slice(usedLetters, usedLetters + count);
    letterGroups.push(group);

    console.log(`   음절 ${i + 1} [${test.syllables[i]}]:`);
    console.log(`      비율: ${syllableLengths[i]}/${totalLength} = ${ratio.toFixed(2)}`);
    console.log(`      계산: ${test.letters.length} × ${ratio.toFixed(2)} = ${(test.letters.length * ratio).toFixed(2)}`);
    console.log(`      Math.floor = ${Math.floor(test.letters.length * ratio)}`);
    console.log(`      배정 글자 수: ${count}개`);
    console.log(`      글자: [${group.join(', ')}]`);

    usedLetters += count;
  }

  console.log(`\n✅ 결과:`);
  letterGroups.forEach((group, i) => {
    console.log(`   [${test.syllables[i]}] ← ${group.join(', ')}`);
  });
});

console.log('\n' + '='.repeat(100));
console.log('\n📊 기대값:\n');
console.log('בָּרָא (bara):');
console.log('   음절 1 [ba]: ב → ✅ 정확!');
console.log('   음절 2 [ˈra]: ר, א → ✅ 정확!');
console.log('');
console.log('בְּרֵאשִׁית (reshit):');
console.log('   음절 1 [re]: ר, א → ✅ 정확!');
console.log('   음절 2 [ˈʃit]: ש, י, ת → ✅ 정확!');
console.log('');
