#!/usr/bin/env tsx

/**
 * 창세기 1:1 핵심 단어 이미지 생성
 */

import 'dotenv/config'
import { generateWordImagesBatch } from './generateImage.js'
import type { WordInfo } from './generateImagePrompt.js'

// 창세기 1:1 히브리어 원문
// בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ
// 태초에 하나님이 천지를 창조하시니라

const genesis1_1Words: WordInfo[] = [
  {
    hebrew: 'בְּרֵאשִׁית',
    meaning: '시작, 태초, 처음',
    korean: '베레쉬트',
    ipa: 'bereʃiːt',
    root: 'ראש (머리, 시작)',
    grammar: '명사',
    context: '창세기의 첫 단어. 시간의 절대적인 시작점을 의미하며, 우주와 모든 창조의 기원을 나타냄'
  },
  {
    hebrew: 'בָּרָא',
    meaning: '창조하다 (무에서 유를 창조)',
    korean: '바라',
    ipa: 'baːraː',
    root: 'ברא',
    grammar: '동사 (칼 완료형 3인칭 남성 단수)',
    context: '오직 하나님만이 하실 수 있는 창조. 무(nothing)에서 유(something)를 만드는 유일한 창조 행위'
  },
  {
    hebrew: 'אֱלֹהִים',
    meaning: '하나님 (전능하신 창조주)',
    korean: '엘로힘',
    ipa: 'eloːhiːm',
    root: 'אל (신)',
    grammar: '명사 (복수형, 단수 취급)',
    context: '복수 형태이지만 단수로 사용되어 하나님의 장엄함과 삼위일체를 암시. 창조주이자 전능자'
  },
  {
    hebrew: 'הַשָּׁמַיִם',
    meaning: '하늘, 천국 (복수: 하늘들)',
    korean: '하샤마임',
    ipa: 'haʃaːmajim',
    root: 'שמה (높이 있다)',
    grammar: '명사 (복수형 + 정관사)',
    context: '물리적 하늘과 영적 하늘을 포함. 하늘의 광대함과 다층적 구조를 나타내는 히브리어 복수형'
  },
  {
    hebrew: 'הָאָרֶץ',
    meaning: '땅, 지구 (물리적 세계)',
    korean: '하아레츠',
    ipa: 'haːʔaːrets',
    root: 'ארץ',
    grammar: '명사 (단수형 + 정관사)',
    context: '물리적 지구와 인간이 살아가는 땅. 하늘과 대조되는 물질적 영역이자 약속의 땅'
  },
  {
    hebrew: 'אֵת',
    meaning: '~을/를 (목적격 표지)',
    korean: '에트',
    ipa: 'ʔeːt',
    root: 'את',
    grammar: '조사 (목적격 표지)',
    context: '히브리어의 독특한 문법 요소로, 명확한 목적어 앞에 위치하여 문장 구조를 명확히 함'
  },
  {
    hebrew: 'וְאֵת',
    meaning: '그리고 ~을/를',
    korean: '베에트',
    ipa: 'veʔeːt',
    root: 'ו + את',
    grammar: '접속사 + 목적격 표지',
    context: '접속사 ו(그리고)와 목적격 표지 את의 결합. 두 번째 목적어를 연결하며 창조의 완전성을 나타냄'
  },
]

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 창세기 1:1 핵심 단어 이미지 생성
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

원문: בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ
번역: 태초에 하나님이 천지를 창조하시니라

생성할 단어:
1. בְּרֵאשִׁית (베레쉬트) - 시작, 태초
2. בָּרָא (바라) - 창조하다
3. אֱלֹהִים (엘로힘) - 하나님
4. אֵת (에트) - 목적격 조사
5. הַשָּׁמַיִם (하샤마임) - 하늘
6. וְאֵת (베에트) - 접속사 + 목적격 조사
7. הָאָרֶץ (하아레츠) - 땅

설정:
- 비율: 9:16 (플래시카드 모바일)
- 형식: JPG
- 품질: 90
- 예상 비용: $0.021 (약 28원)
- 예상 시간: 약 40초 (각 5-7초)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)

if (!process.env.REPLICATE_API_TOKEN) {
  console.error('❌ REPLICATE_API_TOKEN 환경 변수가 설정되지 않았습니다')
  console.error('📖 .env.local 파일에 다음을 추가하세요:')
  console.error('   REPLICATE_API_TOKEN=your_token_here\n')
  process.exit(1)
}

// 이미지 생성 시작
generateWordImagesBatch(genesis1_1Words, {
  aspectRatio: '9:16',
  outputFormat: 'jpg',
  outputQuality: 90,
})
  .then((results) => {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 창세기 1:1 이미지 생성 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

생성된 파일:
`)
    results.forEach((paths, index) => {
      if (paths.length > 0) {
        const word = genesis1_1Words[index]
        console.log(`${index + 1}. ${word.hebrew} (${word.korean})`)
        paths.forEach(path => console.log(`   📄 ${path}`))
      }
    })

    console.log(`
다음 단계:
1. 생성된 이미지 확인: open public/images/words/
2. 플래시카드에 적용하기
3. Supabase Storage에 업로드 (선택)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
  })
  .catch((error) => {
    console.error('\n❌ 오류 발생:', error)
    process.exit(1)
  })
