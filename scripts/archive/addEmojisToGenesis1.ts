/**
 * 창세기 1장 모든 단어에 고급스러운 이모지를 추가하는 스크립트
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 이모지 매핑 테이블 - 히브리어 단어 또는 의미로 매칭
const emojiMapping: Record<string, string> = {
  // 핵심 신학 용어
  'אֱלֹהִים': '👑',  // 하나님
  'בְּרֵאשִׁית': '🌅',  // 태초
  'בָּרָא': '✨',  // 창조하다
  'אָמַר': '💬',  // 말씀하다
  'וַיֹּאמֶר': '💬',  // 그리고 말씀하셨다
  'רוּחַ': '💨',  // 영, 바람
  'טוֹב': '💚',  // 좋다
  'כִּי': '✓',  // ~라는 것
  'מְאֹד': '💯',  // 매우

  // 창조 요소 - 자연
  'שָׁמַיִם': '☁️',  // 하늘
  'הַשָּׁמַיִם': '☁️',  // 하늘 (정관사)
  'אֶרֶץ': '🌍',  // 땅
  'הָאָרֶץ': '🌍',  // 땅 (정관사)
  'אוֹר': '💡',  // 빛
  'הָאוֹר': '⭐',  // 빛 (정관사)
  'חֹשֶׁךְ': '🌑',  // 어둠
  'הַחֹשֶׁךְ': '🌙',  // 어둠 (정관사)
  'מַיִם': '💧',  // 물
  'הַמָּיִם': '💦',  // 물 (정관사)
  'תְהוֹם': '🌊',  // 심연
  'רָקִיעַ': '🌈',  // 궁창
  'יוֹם': '☀️',  // 낮, 날
  'לַיְלָה': '🌙',  // 밤
  'עֶרֶב': '🌆',  // 저녁
  'בֹּקֶר': '🌅',  // 아침

  // 혼돈과 질서
  'תֹהוּ': '🌀',  // 혼돈
  'בֹהוּ': '〰️',  // 공허
  'תֹהוּ וָבֹהוּ': '🌀',  // 혼돈하고 공허함
  'מְרַחֶפֶת': '🕊️',  // 운행하다
  'בָּדַל': '✂️',  // 나누다
  'קָבַץ': '🔄',  // 모으다
  'מִקְוֵה': '🏊',  // 모임

  // 식물
  'דֶּשֶׁא': '🌱',  // 풀
  'עֵשֶׂב': '🌿',  // 초목
  'עֵץ': '🌳',  // 나무
  'פְּרִי': '🍎',  // 열매
  'זֶרַע': '🌾',  // 씨앗

  // 천체
  'מָאוֹר': '💫',  // 광명체
  'שֶׁמֶשׁ': '☀️',  // 해
  'יָרֵחַ': '🌙',  // 달
  'כּוֹכָב': '⭐',  // 별
  'כּוֹכָבִים': '✨',  // 별들

  // 동물
  'תַּנִּין': '🐋',  // 큰 물고기
  'נֶפֶשׁ': '💫',  // 생물
  'חַיָּה': '🦁',  // 짐승
  'עוֹף': '🦅',  // 새
  'דָּג': '🐟',  // 물고기
  'בְּהֵמָה': '🐄',  // 가축
  'רֶמֶשׂ': '🦎',  // 기는 것

  // 인간
  'אָדָם': '👤',  // 사람
  'זָכָר': '👨',  // 남자
  'נְקֵבָה': '👩',  // 여자
  'צֶלֶם': '🎭',  // 형상
  'דְּמוּת': '🪞',  // 모양

  // 동사 - 행위
  'עָשָׂה': '🔨',  // 만들다
  'נָתַן': '🎁',  // 주다
  'רָאָה': '👁️',  // 보다
  'קָרָא': '📢',  // 부르다
  'יָצָא': '🚪',  // 나오다
  'שָׁרַץ': '🐣',  // 번성하다
  'רָבָה': '📈',  // 많아지다
  'מָלֵא': '🌊',  // 가득하다
  'רָדָה': '👑',  // 다스리다
  'כָּבַשׁ': '⚔️',  // 정복하다
  'בָּרַךְ': '🙏',  // 축복하다

  // 문법 요소
  'אֵת': '🎯',  // 목적격 표지
  'וְאֵת': '➕',  // 그리고 (목적격)
  'וְ': '➕',  // 그리고
  'עַל': '⬆️',  // ~위에
  'תַּחַת': '⬇️',  // ~아래
  'בֵּין': '↔️',  // ~사이
  'לְ': '👉',  // ~에게, ~을 위하여
  'מִן': '⬅️',  // ~로부터
};

// 의미 기반 매핑 (히브리어로 찾을 수 없을 때 의미로 찾기)
const meaningMapping: Record<string, string> = {
  '하나님': '👑',
  '태초': '🌅',
  '처음': '🌅',
  '창조': '✨',
  '말씀': '💬',
  '말하': '💬',
  '영': '💨',
  '바람': '💨',
  '숨': '💨',
  '좋': '💚',
  '선': '💚',

  '하늘': '☁️',
  '땅': '🌍',
  '지구': '🌍',
  '빛': '💡',
  '어둠': '🌙',
  '물': '💧',
  '바다': '🌊',
  '심연': '🌊',
  '깊': '🌊',
  '궁창': '🌈',
  '낮': '☀️',
  '날': '📅',
  '밤': '🌙',
  '저녁': '🌆',
  '아침': '🌅',

  '혼돈': '🌀',
  '공허': '〰️',
  '운행': '🕊️',
  '맴돌': '🕊️',
  '나누': '✂️',
  '분리': '✂️',
  '모으': '🔄',

  '풀': '🌱',
  '초목': '🌿',
  '식물': '🌿',
  '나무': '🌳',
  '열매': '🍎',
  '과일': '🍎',
  '씨': '🌾',

  '광명': '💫',
  '해': '☀️',
  '태양': '☀️',
  '달': '🌙',
  '별': '⭐',

  '물고기': '🐟',
  '새': '🦅',
  '날개': '🦅',
  '짐승': '🦁',
  '가축': '🐄',
  '기는': '🦎',
  '생물': '💫',

  '사람': '👤',
  '인간': '👤',
  '아담': '👤',
  '남자': '👨',
  '여자': '👩',
  '형상': '🎭',
  '모양': '🪞',

  '만들': '🔨',
  '주다': '🎁',
  '주': '🎁',
  '보': '👁️',
  '부르': '📢',
  '나오': '🚪',
  '번성': '📈',
  '많': '📈',
  '가득': '🌊',
  '채우': '🌊',
  '다스리': '👑',
  '정복': '⚔️',
  '축복': '🙏',

  '목적격': '🎯',
  '접속': '➕',
  '그리고': '➕',
};

// 품사별 기본 이모지
const grammarDefaultEmoji: Record<string, string> = {
  '명사': '💠',
  '동사': '🔥',
  '형용사': '🎨',
  '전치사': '🔗',
  '조사': '🔗',
  '접속사': '➕',
  '부사': '💫',
  '대명사': '👉',
  '수사': '🔢',
};

function getEmojiForWord(hebrew: string, meaning: string, grammar: string): string {
  // 1. 히브리어 직접 매칭
  if (emojiMapping[hebrew]) {
    return emojiMapping[hebrew];
  }

  // 2. 의미 기반 매칭 (부분 문자열 포함)
  const lowerMeaning = meaning.toLowerCase();
  for (const [key, emoji] of Object.entries(meaningMapping)) {
    if (lowerMeaning.includes(key)) {
      return emoji;
    }
  }

  // 3. 품사 기반 기본 이모지
  const lowerGrammar = grammar.toLowerCase();
  for (const [key, emoji] of Object.entries(grammarDefaultEmoji)) {
    if (lowerGrammar.includes(key)) {
      return emoji;
    }
  }

  // 4. 최종 기본값
  return '📜';
}

// verses.ts 파일을 읽어서 수정
const versesPath = path.join(__dirname, '../src/data/verses.ts');
let content = fs.readFileSync(versesPath, 'utf-8');

// 각 단어 객체를 찾아서 emoji 필드 추가
// 정규식으로 단어 객체 찾기
const wordRegex = /{\s*hebrew:\s*'([^']+)',\s*meaning:\s*'([^']+)',\s*ipa:\s*'([^']+)',\s*korean:\s*'([^']+)',\s*root:\s*'([^']+)',\s*grammar:\s*'([^']+)',\s*structure:\s*'([^']*)'(?:,\s*emoji:\s*'[^']*')?(?:,\s*relatedWords:\s*\[[^\]]*\])?\s*}/g;

content = content.replace(wordRegex, (match, hebrew, meaning, ipa, korean, root, grammar, structure) => {
  const emoji = getEmojiForWord(hebrew, meaning, grammar);

  // emoji 필드가 이미 있는지 확인
  if (match.includes('emoji:')) {
    // 기존 emoji 교체
    return match.replace(/emoji:\s*'[^']*'/, `emoji: '${emoji}'`);
  } else {
    // emoji 필드 추가
    const structurePart = structure ? `,\n        structure: '${structure}'` : '';
    const relatedWordsPart = match.includes('relatedWords') ? match.match(/,\s*relatedWords:\s*\[[^\]]*\]/)?.[0] || '' : '';

    return `{
        hebrew: '${hebrew}',
        meaning: '${meaning}',
        ipa: '${ipa}',
        korean: '${korean}',
        root: '${root}',
        grammar: '${grammar}'${structurePart},
        emoji: '${emoji}'${relatedWordsPart}
      }`;
  }
});

// 파일 쓰기
fs.writeFileSync(versesPath, content, 'utf-8');

console.log('✅ 창세기 1장 모든 단어에 이모지가 추가되었습니다!');
console.log('📊 이모지 매핑 통계:');
console.log(`   - 히브리어 직접 매핑: ${Object.keys(emojiMapping).length}개`);
console.log(`   - 의미 기반 매핑: ${Object.keys(meaningMapping).length}개`);
console.log(`   - 품사 기본 이모지: ${Object.keys(grammarDefaultEmoji).length}개`);
