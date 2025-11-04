/**
 * 옵션 C 레이아웃 시각화
 */

console.log('🎨 옵션 C: 음절별 포함 글자 표시 방식\n');
console.log('='.repeat(100));

const testCases = [
  {
    hebrew: 'בָּרָא',
    meaning: '창조하셨다',
    letters: ['ב', 'ר', 'א'],
    ipa: 'baˈra',
    syllables: ['ba', 'ˈra'],
    groups: [['ב'], ['ר', 'א']]
  },
  {
    hebrew: 'בְּרֵאשִׁית',
    meaning: '태초에',
    letters: ['ר', 'א', 'ש', 'י', 'ת'],
    ipa: 'reˈʃit',
    syllables: ['re', 'ˈʃit'],
    groups: [['ר', 'א', 'ש'], ['י', 'ת']]
  }
];

testCases.forEach((test, idx) => {
  console.log(`\n${idx + 1}. ${test.hebrew} (${test.meaning})`);
  console.log('─'.repeat(80));

  console.log('\n📖 어근 정보:');
  console.log(`   전체 IPA: ${test.ipa}`);
  console.log(`   음절 수: ${test.syllables.length}`);

  console.log('\n🎨 플래시카드 표시 (옵션 C):');
  console.log('');

  // 음절 박스 그리기
  const boxWidth = 18;
  const boxes = test.syllables.map(s => {
    const padding = Math.max(0, boxWidth - s.length - 2);
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    return {
      top: '┌' + '─'.repeat(boxWidth) + '┐',
      content: '│' + ' '.repeat(leftPad) + s + ' '.repeat(rightPad) + '│',
      bottom: '└' + '─'.repeat(boxWidth) + '┘'
    };
  });

  // 상단 (음절 발음 박스)
  console.log('   ' + boxes.map(b => b.top).join('    '));
  console.log('   ' + boxes.map(b => b.content).join('    '));
  console.log('   ' + boxes.map(b => b.bottom).join('    '));

  // 연결선
  const connections = test.syllables.map(() => {
    return ' '.repeat(Math.floor(boxWidth / 2)) + '↓';
  });
  console.log('   ' + connections.join(' '.repeat(Math.floor(boxWidth / 2) + 4)));

  // 포함 글자 라벨
  const labels = test.syllables.map(() => {
    const label = '포함 글자:';
    const padding = Math.max(0, boxWidth - label.length);
    const leftPad = Math.floor(padding / 2);
    return ' '.repeat(leftPad) + label;
  });
  console.log('   ' + labels.join(' '.repeat(6)));

  // 히브리어 글자들
  const letterDisplays = test.groups.map(group => {
    const display = group.map(l => `[${l}]`).join(' ');
    const padding = Math.max(0, boxWidth - display.length);
    const leftPad = Math.floor(padding / 2);
    return ' '.repeat(leftPad) + display;
  });
  console.log('   ' + letterDisplays.join(' '.repeat(6)));

  console.log('');
  console.log(`   전체 발음: [${test.ipa}]`);
  console.log(`   ${test.syllables.length}음절 구조 • 각 음절에 포함된 히브리어 글자 표시`);
  console.log(`   "${test.meaning}"`);

  // 설명
  console.log('\n💡 설명:');
  test.groups.forEach((group, i) => {
    console.log(`   음절 ${i + 1} [${test.syllables[i]}]: ${group.join(', ')} 포함`);
  });
});

console.log('\n' + '='.repeat(100));
console.log('\n✅ 옵션 C의 장점:\n');
console.log('1. 정확한 글자별 발음 매칭을 시도하지 않음');
console.log('2. "이 음절에는 이런 글자들이 포함됨"이라는 명확한 관계 표시');
console.log('3. א (alef) 같은 무음/모음 담지자도 자연스럽게 표현 가능');
console.log('4. 히브리어의 자음+모음 구조를 존중');
console.log('');
console.log('예시: בָּרָא (bara)');
console.log('   - 음절 1 [ba]: ב 포함');
console.log('   - 음절 2 [ˈra]: ר + א 포함 (א는 모음을 담는 역할)');
console.log('');
