/**
 * בָּרָא (창조하셨다) 발음 문제 확인
 */

console.log('🔍 בָּרָא (창조하셨다) 발음 분석\n');
console.log('='.repeat(100));

console.log('\n📖 단어 정보:');
console.log('   히브리어: בָּרָא');
console.log('   의미: 창조하셨다');
console.log('   전체 IPA: baˈra');

console.log('\n🔤 히브리어 글자별 분석:');
console.log('   1. ב (bet) - /b/ 자음');
console.log('   2. ר (resh) - /r/ 자음');
console.log('   3. א (alef) - 성문 파열음 /ʔ/ 또는 모음 담지자 (거의 무음)');

console.log('\n🎵 IPA 음소 분석:');
console.log('   baˈra = b + a + ˈr + a');
console.log('   ');
console.log('   b  → ב (bet) 자음');
console.log('   a  → 첫 번째 모음 (ָ 카메츠)');
console.log('   ˈr → ר (resh) 자음 + 강세');
console.log('   a  → 두 번째 모음 (ָ 카메츠, א가 담고 있음)');

console.log('\n⚠️  현재 음절 분리 문제:');
console.log('   음절: ba + ˈra (2음절)');
console.log('   글자 배분:');
console.log('      [ב ר] → ba   ❌ 틀림! (ר는 ba가 아님)');
console.log('      [א] → ˈra    ❌ 틀림! (א는 ˈra가 아님)');

console.log('\n✅ 올바른 매칭:');
console.log('   음절 1: ba');
console.log('      ב (bet) + -a 모음');
console.log('   ');
console.log('   음절 2: ˈra');
console.log('      ר (resh) + -a 모음 (א가 담고 있음)');

console.log('\n💡 문제 원인:');
console.log('   - 히브리어는 자음 문자 + 모음 기호 체계');
console.log('   - א (alef)는 모음을 "담는" 글자이지 자음으로 발음되지 않음');
console.log('   - 음절 분리와 글자 분리는 다른 개념');

console.log('\n📋 해결 방안:');
console.log('   옵션 A: 음절과 글자를 정확히 매칭 (복잡, 언어학 지식 필요)');
console.log('   옵션 B: 음절만 표시하고 글자별 매칭 제거');
console.log('   옵션 C: "이 음절에 포함된 글자들" 방식으로 표시');
console.log('');
console.log('   추천: 옵션 C');
console.log('   예시:');
console.log('   ┌─────────────────┬─────────────────┐');
console.log('   │  첫 번째 음절    │  두 번째 음절    │');
console.log('   │  [ba]           │  [ˈra]          │');
console.log('   │  포함 글자:      │  포함 글자:      │');
console.log('   │  ב              │  ר + א          │');
console.log('   └─────────────────┴─────────────────┘');

console.log('\n' + '='.repeat(100));
