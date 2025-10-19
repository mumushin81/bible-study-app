/**
 * Genesis 2-3장 Words와 Commentaries AI 생성 스크립트
 *
 * Genesis 1장의 스타일을 참고하여 Claude API로 자동 생성
 */

import * as fs from 'fs';
import * as path from 'path';

// Genesis 1-3장 OSHB 데이터
const oshbPath = path.join(process.cwd(), 'data/genesis-full-oshb.json');
const oshbData = JSON.parse(fs.readFileSync(oshbPath, 'utf-8'));

// Genesis 1-3장 merged 데이터 (기본 정보)
const mergedPath = path.join(process.cwd(), 'data/genesis-full-merged.json');
const mergedData = JSON.parse(fs.readFileSync(mergedPath, 'utf-8'));

// Genesis 1장 참고 예시 (src/data/verses.ts에서)
const gen1SamplePath = path.join(process.cwd(), 'src/data/verses.ts');
const gen1Sample = fs.readFileSync(gen1SamplePath, 'utf-8');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🤖 Genesis 2-3장 AI 컨텐츠 생성');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Genesis 2-3장 구절만 필터
const gen2and3Verses = mergedData.filter((v: any) => {
  const match = v.id?.match(/^genesis_([23])_/);
  return match !== null;
});

console.log(`📊 대상 구절: ${gen2and3Verses.length}개`);
console.log(`   - Genesis 2장: ${gen2and3Verses.filter((v: any) => v.id.startsWith('genesis_2_')).length}개`);
console.log(`   - Genesis 3장: ${gen2and3Verses.filter((v: any) => v.id.startsWith('genesis_3_')).length}개`);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 생성 가이드');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('다음 단계:');
console.log('1. Anthropic Claude API 키 설정 필요');
console.log('2. 각 구절마다 다음을 생성:');
console.log('   - words: 히브리 단어 분석 (형태소, 문법, 의미)');
console.log('   - commentary: 말씀 속으로 (신학적 해설)');
console.log('3. Genesis 1장 스타일 참고');
console.log('4. 예상 시간: ~10분');
console.log('5. 예상 비용: ~$2-3\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📦 Genesis 2:1 샘플 데이터');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const gen2_1 = gen2and3Verses.find((v: any) => v.id === 'genesis_2_1');
if (gen2_1) {
  console.log('ID:', gen2_1.id);
  console.log('Reference:', gen2_1.reference);
  console.log('Hebrew:', gen2_1.hebrew);
  console.log('Modern:', gen2_1.modern);
  console.log('Translation:', gen2_1.translation?.substring(0, 50) + '...');
}

// OSHB 형태소 데이터
const gen2_1_oshb = oshbData.find((v: any) =>
  v.chapter === 2 && v.verseNumber === 1
);

if (gen2_1_oshb) {
  console.log('\nOSHB 형태소 데이터:');
  console.log('Words:', gen2_1_oshb.words.slice(0, 5));
  console.log('Morphology:', gen2_1_oshb.morphology.slice(0, 5));
  console.log('Lemmas:', gen2_1_oshb.lemmas.slice(0, 5));
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('💡 다음 단계 안내');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Claude API를 사용하려면:');
console.log('1. ANTHROPIC_API_KEY 환경 변수 설정');
console.log('2. @anthropic-ai/sdk 패키지 설치');
console.log('3. 생성 스크립트 실행\n');

console.log('또는:');
console.log('사용자가 직접 Claude에게 요청하여 생성할 수 있습니다!\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 출력 파일 준비
const outputPath = path.join(process.cwd(), 'data/genesis-2-3-ai-generated.json');
console.log(`📁 생성 결과 저장 경로: ${outputPath}`);
console.log('   (생성 후 이 파일로 저장됩니다)\n');

// 생성 템플릿 샘플
const sampleTemplate = {
  id: gen2_1?.id,
  reference: gen2_1?.reference,
  hebrew: gen2_1?.hebrew,
  modern: gen2_1?.modern,
  words: [
    {
      hebrew: "(히브리 단어)",
      meaning: "(의미)",
      ipa: "(IPA 발음)",
      korean: "(한글 발음)",
      root: "(어근)",
      grammar: "(문법 설명)",
      structure: "(구조 분석)",
      emoji: "(이모지)"
    }
  ],
  commentary: {
    intro: "(서론)",
    sections: [
      {
        emoji: "1️⃣",
        title: "(제목)",
        description: "(설명)",
        points: ["(포인트1)", "(포인트2)"],
        color: "purple"
      }
    ],
    whyQuestion: {
      question: "(질문)",
      answer: "(답변)",
      bibleReferences: ["(참고 구절)"]
    },
    conclusion: {
      title: "💡 신학적 의미",
      content: "(결론)"
    }
  }
};

fs.writeFileSync(
  path.join(process.cwd(), 'data/genesis-2-3-template.json'),
  JSON.stringify([sampleTemplate], null, 2)
);

console.log('✅ 템플릿 저장 완료: data/genesis-2-3-template.json\n');
console.log('이제 Claude에게 생성을 요청하세요! 😊\n');
