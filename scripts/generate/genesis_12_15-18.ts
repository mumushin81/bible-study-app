/**
 * Genesis 12:15-18 Content Generation
 * Pharaoh takes Sarai, God plagues his house, Pharaoh confronts Abram
 */

import { supabase } from '../utils/supabase.js'
import { log } from '../utils/logger.js'
import * as fs from 'fs/promises'
import * as path from 'path'

interface Word {
  hebrew: string
  meaning: string
  ipa: string
  korean: string
  letters: string
  root: string
  grammar: string
  emoji: string
  iconSvg: string
  relatedWords?: string[]
}

interface CommentarySection {
  emoji: string
  title: string
  description: string
  points: string[]
  color: 'purple' | 'blue' | 'green' | 'pink' | 'orange' | 'yellow'
}

interface WhyQuestion {
  question: string
  answer: string
  bibleReferences: string[]
}

interface Conclusion {
  title: string
  content: string
}

interface Commentary {
  intro: string
  sections: CommentarySection[]
  whyQuestion: WhyQuestion
  conclusion: Conclusion
}

interface VerseContent {
  verse_id: string
  reference: string
  hebrew: string
  ipa: string
  korean_pronunciation: string
  modern: string
  words: Word[]
  commentary: Commentary
}

async function fetchHebrewText(verseIds: string[]) {
  const { data, error } = await supabase
    .from('verses')
    .select('id, reference, hebrew')
    .in('id', verseIds)
    .order('verse_number', { ascending: true })

  if (error) {
    log.error(`Hebrew text fetch failed: ${error.message}`)
    throw error
  }

  return data
}

async function generateContent() {
  log.info('Generating content for Genesis 12:15-18...')

  const verseIds = ['genesis_12_15', 'genesis_12_16', 'genesis_12_17', 'genesis_12_18']

  // Fetch Hebrew text from Supabase
  const hebrewData = await fetchHebrewText(verseIds)

  if (!hebrewData || hebrewData.length !== 4) {
    log.error(`Expected 4 verses, got ${hebrewData?.length || 0}`)
    throw new Error('Failed to fetch all verses')
  }

  log.success('Hebrew text fetched successfully')

  // Generate content for each verse
  const verses: VerseContent[] = [
    // Genesis 12:15 - Pharaoh's officials see and praise Sarai
    {
      verse_id: 'genesis_12_15',
      reference: '창세기 12:15',
      hebrew: hebrewData[0].hebrew,
      ipa: 'vajirˈu ʔoˈta saˈre farˈo vajəhalˈlu ʔoˈta ʔɛl parˈo vatuˈqax haʔiˈʃa bet parˈo',
      korean_pronunciation: '바이루 오타 사레 파로 바예할루 오타 엘 파로 바투카흐 하이샤 베트 파로',
      modern: '바로의 신하들이 사래를 보고 바로 앞에서 그녀를 칭찬하니, 그 여인이 바로의 궁으로 끌려갔습니다',
      words: [
        {
          hebrew: 'וַיִּרְאוּ',
          meaning: '보았다',
          ipa: 'vajirˈu',
          korean: '바이루',
          letters: 'וַ(va) + יִּ(yi) + רְ(r) + אוּ(u)',
          root: 'ר-א-ה (라아)',
          grammar: '동사',
          emoji: '👀',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="pharaoh-see1"><stop offset="0%" stop-color="#87CEEB" /><stop offset="100%" stop-color="#4682B4" /></radialGradient><linearGradient id="pharaoh-iris1"><stop offset="0%" stop-color="#8B4513" /><stop offset="100%" stop-color="#654321" /></linearGradient></defs><circle cx="32" cy="32" r="28" fill="rgba(135, 206, 235, 0.2)" /><ellipse cx="32" cy="32" rx="18" ry="12" fill="white" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="32" cy="32" r="8" fill="url(#pharaoh-iris1)" /><circle cx="32" cy="32" r="4" fill="black" /><circle cx="34" cy="30" r="2" fill="white" opacity="0.8" /></svg>',
          relatedWords: [
            'רָאָה (라아 - 보다)',
            'מַרְאֶה (마레 - 외모)'
          ]
        },
        {
          hebrew: 'שָׂרֵי',
          meaning: '신하들, 고관들',
          ipa: 'saˈre',
          korean: '사레',
          letters: 'שָׂ(sa) + רֵ(re) + י(i)',
          root: 'שַׂר (사르)',
          grammar: '명사',
          emoji: '👑',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pharaoh-crown1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFD700" /><stop offset="100%" stop-color="#FF8C00" /></linearGradient><radialGradient id="pharaoh-jewel1"><stop offset="0%" stop-color="#FF1493" /><stop offset="100%" stop-color="#8B008B" /></radialGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(255, 215, 0, 0.15)" /><path d="M 12 42 L 16 28 L 22 32 L 28 22 L 32 18 L 36 22 L 42 32 L 48 28 L 52 42 Z" fill="url(#pharaoh-crown1)" stroke="#B8860B" stroke-width="1.5" filter="drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.4))" /><rect x="12" y="42" width="40" height="6" fill="url(#pharaoh-crown1)" stroke="#B8860B" stroke-width="1" /><circle cx="20" cy="35" r="3" fill="url(#pharaoh-jewel1)" filter="drop-shadow(0 0 4px rgba(255, 20, 147, 0.8))" /><circle cx="32" cy="28" r="3" fill="url(#pharaoh-jewel1)" filter="drop-shadow(0 0 4px rgba(255, 20, 147, 0.8))" /><circle cx="44" cy="35" r="3" fill="url(#pharaoh-jewel1)" filter="drop-shadow(0 0 4px rgba(255, 20, 147, 0.8))" /></svg>',
          relatedWords: [
            'שַׂר (사르 - 지도자)',
            'שָׂרָה (사라 - 공주)'
          ]
        },
        {
          hebrew: 'פַּרְעֹה',
          meaning: '바로 (이집트 왕)',
          ipa: 'parˈo',
          korean: '파로',
          letters: 'פַּ(pa) + רְ(r) + עֹ(o) + ה(h)',
          root: 'פַּרְעֹה (파로)',
          grammar: '명사',
          emoji: '🏛️',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pharaoh-palace1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFD700" /><stop offset="50%" stop-color="#F4A460" /><stop offset="100%" stop-color="#CD853F" /></linearGradient><linearGradient id="pharaoh-sky1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#87CEEB" /><stop offset="100%" stop-color="#DDA0DD" /></linearGradient></defs><rect width="64" height="32" fill="url(#pharaoh-sky1)" opacity="0.4" /><rect x="16" y="24" width="32" height="32" fill="url(#pharaoh-palace1)" filter="drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.4))" /><rect x="10" y="20" width="44" height="6" fill="url(#pharaoh-palace1)" /><rect x="28" y="36" width="8" height="20" fill="rgba(139, 69, 19, 0.6)" /><polygon points="32,8 8,20 56,20" fill="#B8860B" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="32" cy="14" r="4" fill="#FFD700" filter="drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))" /></svg>'
        },
        {
          hebrew: 'וַיְהַלְלוּ',
          meaning: '칭찬했다',
          ipa: 'vajəhalˈlu',
          korean: '바예할루',
          letters: 'וַ(va) + יְ(yə) + הַ(ha) + לְ(l) + לוּ(lu)',
          root: 'ה-ל-ל (할랄)',
          grammar: '동사',
          emoji: '👏',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pharaoh-praise1" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFD700" /><stop offset="50%" stop-color="#FFA500" /><stop offset="100%" stop-color="#FF6347" /></linearGradient><radialGradient id="pharaoh-spark1"><stop offset="0%" stop-color="#FFFF00" /><stop offset="100%" stop-color="#FFD700" stop-opacity="0" /></radialGradient></defs><circle cx="32" cy="32" r="28" fill="rgba(255, 215, 0, 0.15)" /><path d="M 18 40 Q 18 30 22 28 L 22 42 Z" fill="url(#pharaoh-praise1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><path d="M 46 40 Q 46 30 42 28 L 42 42 Z" fill="url(#pharaoh-praise1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="20" cy="24" r="3" fill="url(#pharaoh-spark1)" /><circle cx="32" cy="20" r="3" fill="url(#pharaoh-spark1)" /><circle cx="44" cy="24" r="3" fill="url(#pharaoh-spark1)" /><path d="M 28 32 Q 32 36 36 32" stroke="url(#pharaoh-praise1)" stroke-width="2" fill="none" stroke-linecap="round" /></svg>',
          relatedWords: [
            'הַלְלוּיָהּ (할렐루야 - 여호와를 찬양하라)',
            'תְּהִלָּה (테힐라 - 찬양)'
          ]
        },
        {
          hebrew: 'הָאִשָּׁה',
          meaning: '그 여인',
          ipa: 'haʔiˈʃa',
          korean: '하이샤',
          letters: 'הָ(ha) + אִ(i) + שָּׁ(sha) + ה(h)',
          root: 'אִשָּׁה (이샤)',
          grammar: '명사',
          emoji: '👸',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="pharaoh-woman1"><stop offset="0%" stop-color="#FFE4E1" /><stop offset="100%" stop-color="#FFC0CB" /></radialGradient><linearGradient id="pharaoh-beauty1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF69B4" /><stop offset="100%" stop-color="#FF1493" /></linearGradient></defs><circle cx="32" cy="32" r="28" fill="rgba(255, 105, 180, 0.15)" /><circle cx="32" cy="26" r="12" fill="url(#pharaoh-woman1)" filter="drop-shadow(2px 2px 6px rgba(0, 0, 0, 0.3))" /><path d="M 20 36 Q 32 50 44 36" fill="url(#pharaoh-woman1)" /><circle cx="28" cy="24" r="2" fill="#654321" /><circle cx="36" cy="24" r="2" fill="#654321" /><path d="M 28 30 Q 32 32 36 30" stroke="#FF1493" stroke-width="1.5" fill="none" /><circle cx="32" cy="16" r="8" fill="url(#pharaoh-beauty1)" opacity="0.4" filter="drop-shadow(0 0 8px rgba(255, 20, 147, 0.6))" /></svg>'
        },
        {
          hebrew: 'וַתֻּקַּח',
          meaning: '끌려갔다',
          ipa: 'vatuˈqax',
          korean: '바투카흐',
          letters: 'וַ(va) + תֻּ(tu) + קַּ(qa) + ח(x)',
          root: 'ל-ק-ח (라카흐)',
          grammar: '동사',
          emoji: '🚶‍♀️',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pharaoh-take1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#DC143C" /><stop offset="100%" stop-color="#8B0000" /></linearGradient><linearGradient id="pharaoh-path1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFD700" /><stop offset="100%" stop-color="#FF8C00" /></linearGradient></defs><path d="M 8 32 L 56 32" stroke="url(#pharaoh-path1)" stroke-width="3" stroke-dasharray="4 4" opacity="0.6" /><circle cx="48" cy="28" r="10" fill="url(#pharaoh-take1)" opacity="0.3" /><ellipse cx="48" cy="36" rx="8" ry="12" fill="url(#pharaoh-take1)" filter="drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.4))" /><circle cx="48" cy="28" r="6" fill="rgba(220, 20, 60, 0.8)" /><path d="M 40 32 L 48 32 L 44 28 M 48 32 L 44 36" stroke="#8B0000" stroke-width="2.5" stroke-linecap="round" fill="none" /></svg>'
        },
        {
          hebrew: 'בֵּית',
          meaning: '집, 궁전',
          ipa: 'bet',
          korean: '베트',
          letters: 'בֵּ(be) + י(i) + ת(t)',
          root: 'בַּיִת (바이트)',
          grammar: '명사',
          emoji: '🏰',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pharaoh-house1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#DAA520" /><stop offset="100%" stop-color="#B8860B" /></linearGradient></defs><polygon points="32,12 12,28 12,52 52,52 52,28" fill="url(#pharaoh-house1)" filter="drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.4))" /><rect x="26" y="36" width="12" height="16" fill="rgba(139, 69, 19, 0.7)" /><rect x="16" y="32" width="8" height="10" fill="rgba(64, 224, 208, 0.6)" /><rect x="40" y="32" width="8" height="10" fill="rgba(64, 224, 208, 0.6)" /><polygon points="32,8 8,26 56,26" fill="#FFD700" filter="drop-shadow(0 0 6px rgba(255, 215, 0, 0.6))" /></svg>',
          relatedWords: [
            'בַּיִת (바이트 - 집)',
            'בֵּית־אֵל (베트엘 - 하나님의 집)'
          ]
        }
      ],
      commentary: {
        intro: '창세기 12장 15절은 아브람의 계획이 예상치 못한 방향으로 전개되는 순간을 기록합니다. 사래의 아름다움이 바로의 신하들의 눈에 띄면서, 하나님의 약속이 위기에 처하게 됩니다.',
        sections: [
          {
            emoji: '1️⃣',
            title: 'שָׂרֵי פַּרְעֹה (사레 파로) - 바로의 신하들',
            description: '바로의 고관들은 이집트 궁정의 영향력 있는 인물들이었습니다. 그들이 사래를 보고 즉시 왕에게 보고한 것은 그녀의 뛰어난 아름다움과 함께, 왕을 기쁘게 하려는 신하들의 마음을 보여줍니다.',
            points: [
              '권력자의 신하들은 왕의 호의를 얻기 위해 끊임없이 노력했습니다',
              '사래의 아름다움은 단순한 외모가 아니라 하나님의 은혜였습니다',
              '인간의 계획과 행동이 하나님의 약속을 위협할 수 있습니다'
            ],
            color: 'purple'
          },
          {
            emoji: '2️⃣',
            title: 'וַיְהַלְלוּ אֹתָהּ (바예할루 오타) - 그녀를 칭찬하다',
            description: '히브리어 \'할랄\'은 찬양하다, 칭찬하다는 의미로, 후에 \'할렐루야\'의 어근이 됩니다. 신하들의 칭찬은 사래를 바로에게 추천하는 행위였으며, 이는 아브람의 거짓말이 초래한 직접적인 결과였습니다.',
            points: [
              '사람의 칭찬과 인정은 때로 위험한 상황을 초래할 수 있습니다',
              '아브람의 두려움과 거짓이 아내를 위험에 빠뜨렸습니다',
              '하나님의 약속은 인간의 실수에도 불구하고 보호됩니다'
            ],
            color: 'blue'
          },
          {
            emoji: '3️⃣',
            title: 'וַתֻּקַּח הָאִשָּׁה (바투카흐 하이샤) - 여인이 끌려가다',
            description: '수동형 동사 \'투카흐\'는 사래가 자신의 의지와 무관하게 강제로 바로의 궁으로 옮겨졌음을 나타냅니다. 이는 하나님께서 아브라함에게 약속하신 후손 계획이 심각한 위기에 처했음을 의미합니다.',
            points: [
              '죄의 결과는 무고한 사람들에게도 영향을 미칩니다',
              '하나님의 약속이 불가능해 보이는 상황에 처할 수 있습니다',
              '그러나 하나님은 자신의 약속을 지키기 위해 개입하십니다'
            ],
            color: 'green'
          }
        ],
        whyQuestion: {
          question: '왜 아브람은 사래가 자기 누이라고 거짓말했을까요?',
          answer: '아브람은 이집트 사람들이 자신을 죽이고 아내를 빼앗을까봐 두려워했어요. 하지만 이 거짓말 때문에 오히려 사래가 바로의 궁전으로 끌려가는 더 나쁜 상황이 되었답니다. 하나님을 믿지 못하고 자기 방법으로 문제를 해결하려 하면, 상황이 더 나빠질 수 있어요. 하지만 다행히도 하나님께서 개입하셔서 사래를 구해주셨답니다!',
          bibleReferences: [
            '창세기 12:12-13 - "그들이 그대를 보면 이르기를... 나는 살려 두리라"',
            '잠언 29:25 - "사람을 두려워하면 올무에 걸리거니와 여호와를 의지하는 자는 안전하리라"',
            '시편 56:3-4 - "내가 두려워하는 날에는 주를 의지하리이다"'
          ]
        },
        conclusion: {
          title: '💡 신학적 의미',
          content: '아브람의 두려움과 거짓은 하나님의 약속을 위험에 빠뜨렸지만, 하나님의 신실하심은 인간의 실수보다 크십니다. 사래가 바로의 궁으로 끌려간 이 위기의 순간조차 하나님의 주권 아래 있었으며, 하나님은 자신의 방법으로 약속을 지키실 것입니다. 이는 우리의 연약함에도 불구하고 하나님의 계획은 반드시 성취된다는 위로를 줍니다.'
        }
      }
    },

    // Genesis 12:16 - Pharaoh treats Abram well for Sarai's sake
    {
      verse_id: 'genesis_12_16',
      reference: '창세기 12:16',
      hebrew: hebrewData[1].hebrew,
      ipa: 'ulˈavram heˈtiv baʔaˈvura vajəˈhi lo tson uvaˈqar vaxamoˈrim vaʔavaˈdim uʃfaˈxot vaʔatoˈnot ugmalˈim',
      korean_pronunciation: '울아브람 헤티브 바아부라 바예히 로 촌 우바카르 바하모림 바아바딤 우쉬파호트 바아토노트 우그말림',
      modern: '바로가 사래 때문에 아브람을 후대하여, 그에게 양과 소와 나귀와 남종과 여종과 암나귀와 낙타를 주었습니다',
      words: [
        {
          hebrew: 'וּלְאַבְרָם',
          meaning: '아브람에게',
          ipa: 'ulˈavram',
          korean: '울아브람',
          letters: 'וּ(u) + לְ(lə) + אַבְ(av) + רָם(ram)',
          root: 'אַבְרָם (아브람)',
          grammar: '전치사',
          emoji: '👨',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="plague-abram1"><stop offset="0%" stop-color="#F5DEB3" /><stop offset="100%" stop-color="#DEB887" /></radialGradient><linearGradient id="plague-robe1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#8B4513" /><stop offset="100%" stop-color="#654321" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(222, 184, 135, 0.2)" /><circle cx="32" cy="24" r="10" fill="url(#plague-abram1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><ellipse cx="32" cy="44" rx="14" ry="18" fill="url(#plague-robe1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="28" cy="22" r="2" fill="#654321" /><circle cx="36" cy="22" r="2" fill="#654321" /><path d="M 28 28 Q 32 26 36 28" stroke="#654321" stroke-width="1.5" fill="none" /></svg>'
        },
        {
          hebrew: 'הֵיטִיב',
          meaning: '잘 대우하다, 후대하다',
          ipa: 'heˈtiv',
          korean: '헤티브',
          letters: 'הֵ(he) + יטִ(ti) + יב(v)',
          root: 'י-ט-ב (야타브)',
          grammar: '동사',
          emoji: '🎁',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="plague-gift1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FF69B4" /><stop offset="100%" stop-color="#FF1493" /></linearGradient><linearGradient id="plague-ribbon1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFD700" /><stop offset="100%" stop-color="#FFA500" /></linearGradient></defs><circle cx="32" cy="32" r="28" fill="rgba(255, 105, 180, 0.15)" /><rect x="16" y="24" width="32" height="28" rx="2" fill="url(#plague-gift1)" filter="drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.3))" /><rect x="28" y="20" width="8" height="36" fill="url(#plague-ribbon1)" /><rect x="12" y="30" width="40" height="8" fill="url(#plague-ribbon1)" /><path d="M 32 20 Q 28 16 24 20 Q 26 14 32 14 Q 38 14 40 20 Q 36 16 32 20" fill="url(#plague-ribbon1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /></svg>',
          relatedWords: [
            'טוֹב (토브 - 좋은)',
            'טוֹבָה (토바 - 선함, 은혜)'
          ]
        },
        {
          hebrew: 'בַּעֲבוּרָהּ',
          meaning: '그녀 때문에',
          ipa: 'baʔaˈvura',
          korean: '바아부라',
          letters: 'בַּ(ba) + עֲ(a) + ב(v) + וּ(u) + רָהּ(rah)',
          root: 'עָבַר (아바르)',
          grammar: '전치사',
          emoji: '↔️',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="plague-cause1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#9370DB" /><stop offset="100%" stop-color="#8A2BE2" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(147, 112, 219, 0.2)" /><circle cx="20" cy="32" r="8" fill="url(#plague-cause1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="44" cy="32" r="8" fill="rgba(138, 43, 226, 0.6)" /><path d="M 28 32 L 36 32 M 34 28 L 38 32 L 34 36" stroke="url(#plague-cause1)" stroke-width="3" stroke-linecap="round" fill="none" filter="drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3))" /></svg>'
        },
        {
          hebrew: 'צֹאן',
          meaning: '양 떼',
          ipa: 'tson',
          korean: '촌',
          letters: 'צֹ(tso) + אן(n)',
          root: 'צֹאן (촌)',
          grammar: '명사',
          emoji: '🐑',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="plague-sheep1"><stop offset="0%" stop-color="#FFFFFF" /><stop offset="100%" stop-color="#E0E0E0" /></radialGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(224, 224, 224, 0.2)" /><ellipse cx="32" cy="36" rx="16" ry="12" fill="url(#plague-sheep1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="32" cy="28" r="10" fill="url(#plague-sheep1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="28" cy="26" r="2" fill="#654321" /><circle cx="36" cy="26" r="2" fill="#654321" /><ellipse cx="24" cy="48" rx="3" ry="6" fill="#654321" /><ellipse cx="40" cy="48" rx="3" ry="6" fill="#654321" /></svg>',
          relatedWords: [
            'רֹעֶה (로에 - 목자)',
            'כֶּבֶשׂ (케베스 - 어린양)'
          ]
        },
        {
          hebrew: 'בָּקָר',
          meaning: '소 떼',
          ipa: 'vaˈqar',
          korean: '바카르',
          letters: 'בָּ(ba) + קָ(qa) + ר(r)',
          root: 'בָּקָר (바카르)',
          grammar: '명사',
          emoji: '🐄',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="plague-cattle1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#8B4513" /><stop offset="100%" stop-color="#654321" /></radialGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(139, 69, 19, 0.15)" /><ellipse cx="32" cy="38" rx="18" ry="14" fill="url(#plague-cattle1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="32" cy="26" r="12" fill="url(#plague-cattle1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><ellipse cx="24" cy="24" rx="4" ry="2" fill="#FFFFFF" /><ellipse cx="40" cy="24" rx="4" ry="2" fill="#FFFFFF" /><circle cx="24" cy="24" r="2" fill="#000000" /><circle cx="40" cy="24" r="2" fill="#000000" /><path d="M 20 18 Q 18 14 16 16" stroke="#654321" stroke-width="2" fill="none" /><path d="M 44 18 Q 46 14 48 16" stroke="#654321" stroke-width="2" fill="none" /></svg>'
        },
        {
          hebrew: 'חֲמֹרִים',
          meaning: '나귀들',
          ipa: 'xamoˈrim',
          korean: '하모림',
          letters: 'חֲ(xa) + מֹ(mo) + רִים(rim)',
          root: 'חֲמוֹר (하모르)',
          grammar: '명사',
          emoji: '🫏',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="plague-donkey1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#A0826D" /><stop offset="100%" stop-color="#6F5745" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(160, 130, 109, 0.15)" /><ellipse cx="32" cy="38" rx="14" ry="12" fill="url(#plague-donkey1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="32" cy="28" r="10" fill="url(#plague-donkey1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><ellipse cx="26" cy="20" rx="3" ry="6" fill="url(#plague-donkey1)" /><ellipse cx="38" cy="20" rx="3" ry="6" fill="url(#plague-donkey1)" /><circle cx="28" cy="28" r="2" fill="#000000" /><circle cx="36" cy="28" r="2" fill="#000000" /></svg>'
        },
        {
          hebrew: 'עֲבָדִים',
          meaning: '남종들',
          ipa: 'ʔavaˈdim',
          korean: '아바딤',
          letters: 'עֲ(a) + בָ(va) + דִים(dim)',
          root: 'ע-ב-ד (아바드)',
          grammar: '명사',
          emoji: '👨‍🌾',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="plague-servant1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#8B7355" /><stop offset="100%" stop-color="#654321" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(139, 115, 85, 0.15)" /><circle cx="32" cy="24" r="8" fill="url(#plague-servant1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><ellipse cx="32" cy="42" rx="10" ry="14" fill="url(#plague-servant1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><rect x="22" y="36" width="6" height="16" fill="rgba(101, 67, 33, 0.8)" rx="2" /><rect x="36" y="36" width="6" height="16" fill="rgba(101, 67, 33, 0.8)" rx="2" /><circle cx="28" cy="22" r="1.5" fill="#000000" /><circle cx="36" cy="22" r="1.5" fill="#000000" /></svg>',
          relatedWords: [
            'עֶבֶד (에베드 - 종)',
            'עֲבֹדָה (아보다 - 일, 노동)'
          ]
        },
        {
          hebrew: 'שְׁפָחוֹת',
          meaning: '여종들',
          ipa: 'ʃfaˈxot',
          korean: '쉬파호트',
          letters: 'שְׁ(shə) + פָ(fa) + ח(x) + וֹת(ot)',
          root: 'שִׁפְחָה (쉬프하)',
          grammar: '명사',
          emoji: '👩‍🌾',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="plague-maid1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#D2B48C" /><stop offset="100%" stop-color="#A0826D" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(210, 180, 140, 0.15)" /><circle cx="32" cy="24" r="8" fill="url(#plague-maid1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><path d="M 22 32 Q 32 50 42 32" fill="url(#plague-maid1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="28" cy="22" r="1.5" fill="#654321" /><circle cx="36" cy="22" r="1.5" fill="#654321" /><path d="M 28 28 Q 32 30 36 28" stroke="#654321" stroke-width="1" fill="none" /></svg>'
        },
        {
          hebrew: 'אֲתֹנֹת',
          meaning: '암나귀들',
          ipa: 'ʔatoˈnot',
          korean: '아토노트',
          letters: 'אֲ(a) + תֹ(to) + נֹת(not)',
          root: 'אָתוֹן (아톤)',
          grammar: '명사',
          emoji: '🐴',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="plague-femaledonkey1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#C8A882" /><stop offset="100%" stop-color="#9B7E5E" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(200, 168, 130, 0.15)" /><ellipse cx="32" cy="38" rx="14" ry="11" fill="url(#plague-femaledonkey1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="32" cy="26" r="9" fill="url(#plague-femaledonkey1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><ellipse cx="26" cy="19" rx="2.5" ry="5" fill="url(#plague-femaledonkey1)" /><ellipse cx="38" cy="19" rx="2.5" ry="5" fill="url(#plague-femaledonkey1)" /><circle cx="28" cy="26" r="2" fill="#654321" /><circle cx="36" cy="26" r="2" fill="#654321" /><path d="M 32 32 L 32 38" stroke="#8B4513" stroke-width="1.5" /></svg>'
        },
        {
          hebrew: 'גְּמַלִּים',
          meaning: '낙타들',
          ipa: 'gmalˈim',
          korean: '그말림',
          letters: 'גְּ(gə) + מַ(ma) + לִּים(lim)',
          root: 'גָּמָל (가말)',
          grammar: '명사',
          emoji: '🐪',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="plague-camel1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#C19A6B" /><stop offset="100%" stop-color="#967969" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(193, 154, 107, 0.15)" /><ellipse cx="32" cy="42" rx="16" ry="10" fill="url(#plague-camel1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><ellipse cx="28" cy="28" rx="8" ry="10" fill="url(#plague-camel1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><ellipse cx="38" cy="26" rx="6" ry="8" fill="url(#plague-camel1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="28" cy="22" r="6" fill="url(#plague-camel1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="26" cy="20" r="1.5" fill="#000000" /><circle cx="30" cy="20" r="1.5" fill="#000000" /></svg>',
          relatedWords: [
            'גָּמָל (가말 - 낙타)'
          ]
        }
      ],
      commentary: {
        intro: '창세기 12장 16절은 아브람이 사래를 누이라고 속인 결과로 얻은 물질적 축복을 나열합니다. 이 축복은 겉보기에는 하나님의 은혜처럼 보이지만, 실제로는 죄의 대가이자 영적 타협의 증거였습니다.',
        sections: [
          {
            emoji: '1️⃣',
            title: 'הֵיטִיב בַּעֲבוּרָהּ (헤티브 바아부라) - 그녀 때문에 잘 대우하다',
            description: '바로가 아브람을 후대한 이유는 사래 때문이었습니다. 이는 아브람의 거짓말이 일시적인 물질적 이득을 가져왔지만, 동시에 도덕적 타락과 영적 위기를 초래했음을 보여줍니다.',
            points: [
              '잘못된 방법으로 얻은 축복은 진정한 축복이 아닙니다',
              '물질적 풍요가 항상 하나님의 인정을 의미하지는 않습니다',
              '죄는 때로 즉각적인 이익을 가져오지만 장기적으로는 파괴적입니다'
            ],
            color: 'purple'
          },
          {
            emoji: '2️⃣',
            title: 'צֹאן וּבָקָר (촌 우바카르) - 양과 소',
            description: '가축은 고대 근동에서 부의 주요 척도였습니다. 바로가 준 양, 소, 나귀, 낙타는 아브람을 매우 부유하게 만들었지만, 이 재산은 아내를 파는 대가로 얻은 것이었습니다.',
            points: [
              '재물은 그 자체로 선하지도 악하지도 않지만, 얻는 방법이 중요합니다',
              '하나님의 약속보다 물질적 안정을 추구하는 것은 우상숭배입니다',
              '참된 축복은 정직과 신실함으로 얻어집니다'
            ],
            color: 'blue'
          },
          {
            emoji: '3️⃣',
            title: 'עֲבָדִים וּשְׁפָחוֹת (아바딤 우쉬파호트) - 남종과 여종',
            description: '종들은 고대 사회에서 중요한 재산이자 노동력이었습니다. 바로가 준 많은 종들은 아브람의 영향력을 크게 증가시켰지만, 이는 하나님의 계획이 아닌 인간적 타협의 결과였습니다.',
            points: [
              '사회적 지위와 영향력이 항상 하나님의 뜻과 일치하는 것은 아닙니다',
              '하나님은 우리의 실수에도 불구하고 당신의 목적을 이루십니다',
              '진정한 위대함은 정직과 겸손에서 나옵니다'
            ],
            color: 'green'
          }
        ],
        whyQuestion: {
          question: '왜 바로는 아브람에게 많은 선물을 주었을까요?',
          answer: '바로는 사래를 자기 아내로 삼고 싶어서 그녀의 "오빠"인 아브람에게 선물을 준 거예요. 옛날에는 결혼할 때 신부의 가족에게 선물을 주는 풍습이 있었거든요. 그런데 이건 사실 좋은 일이 아니었어요. 아브람이 거짓말을 해서 아내를 위험에 빠뜨리고 그 대가로 재물을 받은 거니까요. 하나님은 정직한 방법으로 축복하시는 분이세요!',
          bibleReferences: [
            '잠언 13:11 - "망령되이 얻은 재물은 줄어가고 손으로 모은 것은 늘어가느니라"',
            '잠언 10:2 - "불의의 재물은 무익하여도 공의는 죽음에서 건지느니라"',
            '마태복음 6:33 - "너희는 먼저 그의 나라와 그의 의를 구하라 그리하면 이 모든 것을 너희에게 더하시리라"'
          ]
        },
        conclusion: {
          title: '💡 신학적 의미',
          content: '아브람이 받은 물질적 축복은 하나님의 약속 성취가 아니라 인간적 타협의 결과였습니다. 이는 우리에게 중요한 교훈을 줍니다: 하나님의 축복은 정직과 신실함으로 얻어지며, 잘못된 방법으로 얻은 것은 진정한 축복이 될 수 없습니다. 하나님은 우리의 실수에도 불구하고 신실하시지만, 우리는 올바른 방법으로 그분의 뜻을 따라야 합니다.'
        }
      }
    },

    // Genesis 12:17 - God strikes Pharaoh's house with plagues
    {
      verse_id: 'genesis_12_17',
      reference: '창세기 12:17',
      hebrew: hebrewData[2].hebrew,
      ipa: 'vajnaˈga ʔadonˈai ʔɛt parˈo nəgaˈim gdoˈlim vəʔɛt beˈto ʔal dəˈvar saˈrai ʔeˈʃɛt ʔavˈram',
      korean_pronunciation: '바이나가 아도나이 엣 파로 느가임 그돌림 베엣 베토 알 드바르 사라이 에쉐트 아브람',
      modern: '여호와께서 아브람의 아내 사래 때문에 바로와 그의 집안에 큰 재앙을 내리셨습니다',
      words: [
        {
          hebrew: 'וַיְנַגַּע',
          meaning: '치셨다, 재앙을 내리셨다',
          ipa: 'vajnaˈga',
          korean: '바이나가',
          letters: 'וַ(va) + יְ(yə) + נַ(na) + גַּע(ga)',
          root: 'ן-ג-ע (나가)',
          grammar: '동사',
          emoji: '⚡',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="plague-strike1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFD700" /><stop offset="50%" stop-color="#FF8C00" /><stop offset="100%" stop-color="#FF4500" /></linearGradient><radialGradient id="plague-flash1"><stop offset="0%" stop-color="#FFFF00" /><stop offset="100%" stop-color="#FF4500" stop-opacity="0" /></radialGradient></defs><circle cx="32" cy="32" r="28" fill="url(#plague-flash1)" opacity="0.4" /><path d="M 32 8 L 28 32 L 36 32 L 32 56 L 42 32 L 34 32 Z" fill="url(#plague-strike1)" filter="drop-shadow(0 0 12px rgba(255, 215, 0, 0.9))" /><circle cx="32" cy="32" r="3" fill="#FFFFFF" filter="drop-shadow(0 0 8px rgba(255, 255, 255, 1))" /></svg>',
          relatedWords: [
            'נֶגַע (네가 - 재앙, 질병)',
            'מַגֵּפָה (마게파 - 전염병)'
          ]
        },
        {
          hebrew: 'יְהוָה',
          meaning: '여호와 (하나님의 이름)',
          ipa: 'ʔadonˈai',
          korean: '아도나이',
          letters: 'יְ(yə) + ה(h) + וָ(wa) + ה(h)',
          root: 'יהוה (야훼)',
          grammar: '명사',
          emoji: '✨',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="plague-yhwh1"><stop offset="0%" stop-color="#FFFFFF" /><stop offset="30%" stop-color="#FFD700" /><stop offset="100%" stop-color="#FF6347" /></radialGradient><linearGradient id="plague-glory1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" /><stop offset="100%" stop-color="#FFD700" stop-opacity="0.3" /></linearGradient></defs><circle cx="32" cy="32" r="28" fill="url(#plague-glory1)" opacity="0.5" /><circle cx="32" cy="32" r="16" fill="url(#plague-yhwh1)" filter="drop-shadow(0 0 16px rgba(255, 215, 0, 1))" /><g stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"><line x1="32" y1="8" x2="32" y2="18" /><line x1="50" y1="14" x2="44" y2="20" /><line x1="56" y1="32" x2="46" y2="32" /><line x1="50" y1="50" x2="44" y2="44" /><line x1="32" y1="56" x2="32" y2="46" /><line x1="14" y1="50" x2="20" y2="44" /><line x1="8" y1="32" x2="18" y2="32" /><line x1="14" y1="14" x2="20" y2="20" /></g></svg>',
          relatedWords: [
            'אֱלֹהִים (엘로힘 - 하나님)',
            'אֲדֹנָי (아도나이 - 주님)'
          ]
        },
        {
          hebrew: 'נְגָעִים',
          meaning: '재앙들',
          ipa: 'nəgaˈim',
          korean: '느가임',
          letters: 'נְ(nə) + גָ(ga) + עִים(im)',
          root: 'נֶגַע (네가)',
          grammar: '명사',
          emoji: '☠️',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="plague-disease1"><stop offset="0%" stop-color="#DC143C" /><stop offset="100%" stop-color="#8B0000" /></radialGradient><linearGradient id="plague-spread1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF6347" /><stop offset="50%" stop-color="#DC143C" /><stop offset="100%" stop-color="#8B0000" /></linearGradient></defs><circle cx="32" cy="32" r="28" fill="rgba(220, 20, 60, 0.2)" /><circle cx="32" cy="32" r="14" fill="url(#plague-disease1)" filter="drop-shadow(0 0 12px rgba(220, 20, 60, 0.8))" opacity="0.8" /><circle cx="20" cy="24" r="6" fill="url(#plague-spread1)" opacity="0.6" /><circle cx="44" cy="28" r="7" fill="url(#plague-spread1)" opacity="0.6" /><circle cx="24" cy="44" r="5" fill="url(#plague-spread1)" opacity="0.6" /><circle cx="42" cy="46" r="6" fill="url(#plague-spread1)" opacity="0.6" /></svg>'
        },
        {
          hebrew: 'גְּדֹלִים',
          meaning: '큰',
          ipa: 'gdoˈlim',
          korean: '그돌림',
          letters: 'גְּ(gə) + דֹ(do) + לִים(lim)',
          root: 'ג-ד-ל (가달)',
          grammar: '형용사',
          emoji: '⬆️',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="plague-great1" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#4169E1" /><stop offset="50%" stop-color="#6495ED" /><stop offset="100%" stop-color="#87CEEB" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(65, 105, 225, 0.15)" /><rect x="28" y="44" width="8" height="12" fill="url(#plague-great1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><rect x="24" y="32" width="16" height="12" fill="url(#plague-great1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><rect x="20" y="20" width="24" height="12" fill="url(#plague-great1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><rect x="16" y="8" width="32" height="12" fill="url(#plague-great1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /></svg>',
          relatedWords: [
            'גָּדוֹל (가돌 - 큰)',
            'גְּדֻלָּה (그둘라 - 위대함)'
          ]
        },
        {
          hebrew: 'בֵּיתוֹ',
          meaning: '그의 집',
          ipa: 'beˈto',
          korean: '베토',
          letters: 'בֵּ(be) + י(i) + תוֹ(to)',
          root: 'בַּיִת (바이트)',
          grammar: '명사',
          emoji: '🏠',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="plague-house1-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#8B4513" /><stop offset="100%" stop-color="#654321" /></linearGradient><radialGradient id="plague-darkness1"><stop offset="0%" stop-color="#000000" stop-opacity="0" /><stop offset="100%" stop-color="#000000" stop-opacity="0.6" /></radialGradient></defs><circle cx="32" cy="32" r="28" fill="url(#plague-darkness1)" /><polygon points="32,12 12,28 12,52 52,52 52,28" fill="url(#plague-house1-grad)" filter="drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.5))" opacity="0.7" /><rect x="26" y="36" width="12" height="16" fill="rgba(101, 67, 33, 0.5)" /><rect x="16" y="32" width="8" height="10" fill="rgba(139, 0, 0, 0.6)" /><rect x="40" y="32" width="8" height="10" fill="rgba(139, 0, 0, 0.6)" /><polygon points="32,8 8,26 56,26" fill="#654321" opacity="0.6" /></svg>'
        },
        {
          hebrew: 'עַל־דְּבַר',
          meaning: '~때문에',
          ipa: 'ʔal dəˈvar',
          korean: '알 드바르',
          letters: 'עַל(al) + ־ + דְּ(də) + בַר(var)',
          root: 'דָּבָר (다바르)',
          grammar: '전치사',
          emoji: '❓',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="plague-reason1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#9370DB" /><stop offset="100%" stop-color="#8A2BE2" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(147, 112, 219, 0.2)" /><circle cx="32" cy="38" r="3" fill="url(#plague-reason1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><path d="M 32 32 Q 32 28 28 24 Q 24 20 28 16 Q 32 12 36 16 Q 38 18 38 22 Q 38 26 34 28 L 32 32" stroke="url(#plague-reason1)" stroke-width="3" fill="none" stroke-linecap="round" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /></svg>'
        },
        {
          hebrew: 'שָׂרַי',
          meaning: '사래',
          ipa: 'saˈrai',
          korean: '사라이',
          letters: 'שָׂ(sa) + רַ(ra) + י(i)',
          root: 'שָׂרָה (사라)',
          grammar: '명사',
          emoji: '👰',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="confrontation-sarai1"><stop offset="0%" stop-color="#FFE4E1" /><stop offset="100%" stop-color="#FFC0CB" /></radialGradient><linearGradient id="confrontation-crown1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFD700" /><stop offset="100%" stop-color="#FF69B4" /></linearGradient></defs><circle cx="32" cy="32" r="28" fill="rgba(255, 228, 225, 0.3)" /><circle cx="32" cy="28" r="12" fill="url(#confrontation-sarai1)" filter="drop-shadow(2px 2px 6px rgba(0, 0, 0, 0.3))" /><path d="M 20 38 Q 32 52 44 38" fill="url(#confrontation-sarai1)" /><circle cx="28" cy="26" r="2" fill="#654321" /><circle cx="36" cy="26" r="2" fill="#654321" /><path d="M 28 32 Q 32 34 36 32" stroke="#FF1493" stroke-width="1.5" fill="none" /><path d="M 20 20 L 24 16 L 28 18 L 32 14 L 36 18 L 40 16 L 44 20" fill="url(#confrontation-crown1)" filter="drop-shadow(0 0 6px rgba(255, 215, 0, 0.6))" /></svg>'
        },
        {
          hebrew: 'אֵשֶׁת',
          meaning: '아내',
          ipa: 'ʔeˈʃɛt',
          korean: '에쉐트',
          letters: 'אֵ(e) + שֶׁ(she) + ת(t)',
          root: 'אִשָּׁה (이샤)',
          grammar: '명사',
          emoji: '💍',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="confrontation-ring1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700" /><stop offset="100%" stop-color="#FFA500" /></linearGradient><radialGradient id="confrontation-diamond1"><stop offset="0%" stop-color="#FFFFFF" /><stop offset="100%" stop-color="#87CEEB" /></radialGradient></defs><circle cx="32" cy="32" r="28" fill="rgba(255, 215, 0, 0.15)" /><circle cx="32" cy="32" r="16" stroke="url(#confrontation-ring1)" stroke-width="4" fill="none" filter="drop-shadow(2px 2px 6px rgba(255, 165, 0, 0.6))" /><circle cx="32" cy="16" r="8" fill="url(#confrontation-diamond1)" filter="drop-shadow(0 0 12px rgba(255, 255, 255, 0.9))" /><polygon points="32,12 28,16 32,20 36,16" fill="url(#confrontation-ring1)" /><circle cx="32" cy="32" r="3" fill="url(#confrontation-ring1)" /></svg>',
          relatedWords: [
            'אִישׁ (이쉬 - 남편)',
            'נָשִׁים (나쉼 - 여자들)'
          ]
        }
      ],
      commentary: {
        intro: '창세기 12장 17절은 하나님께서 직접 개입하셔서 당신의 약속을 지키시는 결정적 순간입니다. 바로의 궁전에 내린 재앙은 하나님의 주권과 사래를 보호하시는 신실하심을 보여줍니다.',
        sections: [
          {
            emoji: '1️⃣',
            title: 'וַיְנַגַּע יְהוָה (바이나가 아도나이) - 여호와께서 치셨다',
            description: '히브리어 \'나가\'는 재앙이나 질병으로 치다, 타격하다는 의미입니다. 하나님께서 직접 바로를 치신 것은 사래가 아브람의 아내임을 밝히시고 그녀를 보호하시기 위함이었습니다.',
            points: [
              '하나님은 당신의 약속을 지키기 위해 직접 개입하십니다',
              '재앙은 하나님의 공의와 보호의 도구가 될 수 있습니다',
              '하나님은 인간의 실수에도 불구하고 당신의 백성을 지키십니다'
            ],
            color: 'purple'
          },
          {
            emoji: '2️⃣',
            title: 'נְגָעִים גְּדֹלִים (느가임 그돌림) - 큰 재앙들',
            description: '"큰 재앙들"이라는 표현은 이것이 단순한 질병이 아니라 초자연적인 하나님의 심판이었음을 나타냅니다. 이는 후에 출애굽 때 이집트에 내린 열 가지 재앙의 예표가 됩니다.',
            points: [
              '하나님의 심판은 명확하고 강력합니다',
              '재앙의 근원과 이유가 분명히 드러납니다',
              '하나님은 자신의 백성을 해하려는 자들에게 경고하십니다'
            ],
            color: 'blue'
          },
          {
            emoji: '3️⃣',
            title: 'עַל־דְּבַר שָׂרַי (알 드바르 사라이) - 사래 때문에',
            description: '재앙의 원인이 사래와 관련되어 있다는 것이 분명히 밝혀집니다. 이는 바로에게 사래가 이미 결혼한 여인이라는 사실을 깨닫게 했으며, 하나님께서 그녀를 특별히 보호하신다는 것을 보여줍니다.',
            points: [
              '하나님은 당신의 언약의 사람들을 특별히 보호하십니다',
              '죄의 결과는 명백히 드러나 회개의 기회를 줍니다',
              '하나님의 개입은 상황을 바로잡고 진실을 드러냅니다'
            ],
            color: 'green'
          },
          {
            emoji: '4️⃣',
            title: 'אֵשֶׁת אַבְרָם (에쉐트 아브람) - 아브람의 아내',
            description: '하나님께서 사래를 "아브람의 아내"로 명확히 밝히신 것은 그녀의 진정한 정체성을 회복시키신 것입니다. 아브람의 거짓말로 가려졌던 진실이 하나님의 개입으로 드러났습니다.',
            points: [
              '하나님은 진실을 회복하시고 관계를 바로잡으십니다',
              '언약의 약속은 결혼 관계를 통해 이루어집니다',
              '하나님은 우리의 정체성과 관계를 지키십니다'
            ],
            color: 'pink'
          }
        ],
        whyQuestion: {
          question: '왜 하나님은 바로에게 재앙을 내리셨을까요?',
          answer: '하나님은 사래를 지키시기 위해서예요! 사래는 아브람의 아내였는데, 바로가 그녀를 자기 아내로 삼으려 했어요. 만약 사래가 바로의 아내가 되면, 하나님이 아브람에게 약속하신 자손이 태어날 수 없잖아요? 그래서 하나님은 바로의 궁전에 병을 보내서 "사래는 이미 결혼한 여인이야!"라고 알려주신 거예요. 하나님은 항상 당신의 약속을 지키시고, 당신의 사람들을 보호하세요!',
          bibleReferences: [
            '시편 105:14-15 - "사람이 그들을 압제하는 것을 용납하지 아니하시고... 나의 기름 부은 자를 상하지 말라"',
            '창세기 20:3 - "그러나 밤에 하나님이 꿈에 아비멜렉에게 임하여... 네가 취한 이 여인은 남편이 있는 여인이라"',
            '시편 121:7-8 - "여호와께서 너를 지켜 모든 환난을 면하게 하시며"'
          ]
        },
        conclusion: {
          title: '💡 신학적 의미',
          content: '하나님께서 바로에게 재앙을 내리신 사건은 하나님의 언약 신실하심을 보여주는 강력한 증거입니다. 아브람의 거짓과 두려움에도 불구하고, 하나님은 당신의 약속을 지키기 위해 직접 개입하셨습니다. 이는 우리의 연약함과 실수가 하나님의 계획을 좌절시킬 수 없음을 보여주며, 하나님께서 당신의 백성을 보호하시고 약속을 성취하신다는 확신을 줍니다. 출애굽의 재앙을 예표하는 이 사건은 하나님의 구원 역사가 일관되게 진행됨을 보여줍니다.'
        }
      }
    },

    // Genesis 12:18 - Pharaoh confronts Abram
    {
      verse_id: 'genesis_12_18',
      reference: '창세기 12:18',
      hebrew: hebrewData[3].hebrew,
      ipa: 'vajiqˈra farˈo ləʔavˈram vajˈomɛr ma zot ʔaˈsita li laˈma lo higˈadta li ki ʔiʃtəˈxa hi',
      korean_pronunciation: '바이크라 파로 르아브람 바요메르 마 조트 아시타 리 라마 로 히가드타 리 키 이쉬테하 히',
      modern: '바로가 아브람을 불러 말했습니다. "당신이 나에게 이게 무슨 짓입니까? 왜 그녀가 당신의 아내라고 내게 말하지 않았습니까?"',
      words: [
        {
          hebrew: 'וַיִּקְרָא',
          meaning: '불렀다',
          ipa: 'vajiqˈra',
          korean: '바이크라',
          letters: 'וַ(va) + יִּ(yi) + קְ(q) + רָא(ra)',
          root: 'ק-ר-א (카라)',
          grammar: '동사',
          emoji: '📢',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="confrontation-call1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FF6347" /><stop offset="100%" stop-color="#FF4500" /></linearGradient><radialGradient id="confrontation-sound1"><stop offset="0%" stop-color="#FFD700" /><stop offset="100%" stop-color="#FF6347" stop-opacity="0" /></radialGradient></defs><circle cx="32" cy="32" r="28" fill="url(#confrontation-sound1)" opacity="0.4" /><path d="M 20 28 L 28 28 L 36 20 L 36 44 L 28 36 L 20 36 Z" fill="url(#confrontation-call1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><path d="M 40 24 Q 46 28 46 32 Q 46 36 40 40" stroke="url(#confrontation-call1)" stroke-width="2.5" fill="none" stroke-linecap="round" /><path d="M 44 20 Q 52 26 52 32 Q 52 38 44 44" stroke="url(#confrontation-call1)" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7" /></svg>',
          relatedWords: [
            'קָרָא (카라 - 부르다)',
            'מִקְרָא (미크라 - 집회, 낭독)'
          ]
        },
        {
          hebrew: 'פַּרְעֹה',
          meaning: '바로',
          ipa: 'farˈo',
          korean: '파로',
          letters: 'פַּ(pa) + רְ(r) + עֹ(o) + ה(h)',
          root: 'פַּרְעֹה (파로)',
          grammar: '명사',
          emoji: '👑',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="confrontation-pharaoh1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFD700" /><stop offset="50%" stop-color="#FF8C00" /><stop offset="100%" stop-color="#DC143C" /></linearGradient><radialGradient id="confrontation-anger1"><stop offset="0%" stop-color="#FF4500" /><stop offset="100%" stop-color="#8B0000" stop-opacity="0.3" /></radialGradient></defs><circle cx="32" cy="32" r="28" fill="url(#confrontation-anger1)" opacity="0.5" /><circle cx="32" cy="32" r="18" fill="url(#confrontation-pharaoh1)" filter="drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.4))" /><path d="M 16 24 L 20 16 L 26 20 L 32 14 L 38 20 L 44 16 L 48 24 L 52 24 L 52 28 L 12 28 L 12 24 Z" fill="url(#confrontation-pharaoh1)" stroke="#B8860B" stroke-width="1" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="26" cy="30" r="2" fill="#000000" /><circle cx="38" cy="30" r="2" fill="#000000" /><path d="M 26 38 L 38 38" stroke="#8B0000" stroke-width="2" stroke-linecap="round" /></svg>'
        },
        {
          hebrew: 'וַיֹּאמֶר',
          meaning: '말했다',
          ipa: 'vajˈomɛr',
          korean: '바요메르',
          letters: 'וַ(va) + יֹּ(yo) + אמֶר(mer)',
          root: 'א-מ-ר (아마르)',
          grammar: '동사',
          emoji: '💬',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="confrontation-speak1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#87CEEB" /><stop offset="100%" stop-color="#4682B4" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(135, 206, 235, 0.2)" /><rect x="12" y="20" width="36" height="24" rx="4" fill="url(#confrontation-speak1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><polygon points="20,44 16,50 24,44" fill="url(#confrontation-speak1)" /><circle cx="20" cy="32" r="2" fill="white" /><circle cx="28" cy="32" r="2" fill="white" /><circle cx="36" cy="32" r="2" fill="white" /></svg>',
          relatedWords: [
            'אָמַר (아마르 - 말하다)',
            'דָּבָר (다바르 - 말씀)'
          ]
        },
        {
          hebrew: 'מַה־זֹּאת',
          meaning: '이게 무엇이냐',
          ipa: 'ma zot',
          korean: '마 조트',
          letters: 'מַה(ma) + ־ + זֹּאת(zot)',
          root: 'מָה (마)',
          grammar: '대명사',
          emoji: '❓',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="confrontation-what1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FF6347" /><stop offset="100%" stop-color="#DC143C" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(255, 99, 71, 0.2)" /><circle cx="32" cy="48" r="4" fill="url(#confrontation-what1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><path d="M 32 40 Q 32 36 28 32 Q 24 28 28 24 Q 32 20 36 24 Q 40 28 40 32 Q 40 36 36 38 L 32 40" stroke="url(#confrontation-what1)" stroke-width="4" fill="none" stroke-linecap="round" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /></svg>'
        },
        {
          hebrew: 'עָשִׂיתָ',
          meaning: '당신이 했다',
          ipa: 'ʔaˈsita',
          korean: '아시타',
          letters: 'עָ(a) + שִׂ(si) + יתָ(ta)',
          root: 'ע-שׂ-ה (아사)',
          grammar: '동사',
          emoji: '👉',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="confrontation-did1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FF4500" /><stop offset="100%" stop-color="#8B0000" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(255, 69, 0, 0.15)" /><path d="M 16 32 L 40 32 L 34 26 M 40 32 L 34 38" stroke="url(#confrontation-did1)" stroke-width="4" stroke-linecap="round" fill="none" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="48" cy="32" r="8" fill="url(#confrontation-did1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="48" cy="28" r="2" fill="white" /><circle cx="48" cy="36" r="2" fill="white" /></svg>',
          relatedWords: [
            'עָשָׂה (아사 - 만들다, 하다)',
            'מַעֲשֶׂה (마아세 - 행위)'
          ]
        },
        {
          hebrew: 'לָמָה',
          meaning: '왜',
          ipa: 'laˈma',
          korean: '라마',
          letters: 'לָ(la) + מָה(ma)',
          root: 'מָה (마)',
          grammar: '부사',
          emoji: '🤔',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="confrontation-why1"><stop offset="0%" stop-color="#FFA500" /><stop offset="100%" stop-color="#FF6347" /></radialGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(255, 165, 0, 0.2)" /><circle cx="32" cy="32" r="20" fill="url(#confrontation-why1)" filter="drop-shadow(2px 2px 6px rgba(0, 0, 0, 0.3))" /><circle cx="32" cy="46" r="3" fill="white" /><path d="M 32 38 Q 32 34 28 30 Q 26 28 28 26 Q 30 24 32 24 Q 34 24 36 26 Q 38 28 38 30 Q 38 32 36 34 L 32 38" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" /></svg>'
        },
        {
          hebrew: 'לֹא',
          meaning: '~하지 않다',
          ipa: 'lo',
          korean: '로',
          letters: 'לֹ(lo) + א()',
          root: 'לֹא (로)',
          grammar: '부사',
          emoji: '🚫',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="confrontation-not1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#DC143C" /><stop offset="100%" stop-color="#8B0000" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(220, 20, 60, 0.2)" /><circle cx="32" cy="32" r="18" stroke="url(#confrontation-not1)" stroke-width="4" fill="none" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><line x1="18" y1="18" x2="46" y2="46" stroke="url(#confrontation-not1)" stroke-width="4" stroke-linecap="round" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /></svg>'
        },
        {
          hebrew: 'הִגַּדְתָּ',
          meaning: '말했다, 알렸다',
          ipa: 'higˈadta',
          korean: '히가드타',
          letters: 'הִ(hi) + גַּ(ga) + דְתָּ(dta)',
          root: 'נ-ג-ד (나가드)',
          grammar: '동사',
          emoji: '🗣️',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="confrontation-tell1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#4169E1" /><stop offset="100%" stop-color="#1E90FF" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(65, 105, 225, 0.15)" /><circle cx="20" cy="32" r="10" fill="url(#confrontation-tell1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><path d="M 30 32 L 54 20 L 54 44 L 30 32" fill="url(#confrontation-tell1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="16" cy="30" r="2" fill="white" /><circle cx="20" cy="30" r="2" fill="white" /><circle cx="24" cy="30" r="2" fill="white" /></svg>',
          relatedWords: [
            'נָגַד (나가드 - 알리다)',
            'הַגָּדָה (하가다 - 이야기)'
          ]
        },
        {
          hebrew: 'כִּי',
          meaning: '~이라는 것을',
          ipa: 'ki',
          korean: '키',
          letters: 'כִּ(ki) + י()',
          root: 'כִּי (키)',
          grammar: '접속사',
          emoji: '➡️',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="confrontation-that1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#32CD32" /><stop offset="100%" stop-color="#228B22" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(50, 205, 50, 0.15)" /><path d="M 12 32 L 44 32 M 38 26 L 44 32 L 38 38" stroke="url(#confrontation-that1)" stroke-width="4" stroke-linecap="round" fill="none" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="50" cy="32" r="6" fill="url(#confrontation-that1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /></svg>'
        },
        {
          hebrew: 'אִשְׁתְּךָ',
          meaning: '당신의 아내',
          ipa: 'ʔiʃtəˈxa',
          korean: '이쉬테하',
          letters: 'אִ(i) + שְׁ(sh) + תְּ(tə) + ךָ(xa)',
          root: 'אִשָּׁה (이샤)',
          grammar: '명사',
          emoji: '👰‍♀️',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="confrontation-wife1"><stop offset="0%" stop-color="#FFE4E1" /><stop offset="100%" stop-color="#FFC0CB" /></radialGradient><linearGradient id="confrontation-bond1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700" /><stop offset="100%" stop-color="#FF69B4" /></linearGradient></defs><circle cx="32" cy="32" r="28" fill="rgba(255, 228, 225, 0.3)" /><circle cx="24" cy="28" r="10" fill="url(#confrontation-wife1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="40" cy="28" r="10" fill="rgba(135, 206, 235, 0.8)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><path d="M 24 38 Q 28 46 32 48 Q 36 46 40 38" stroke="url(#confrontation-bond1)" stroke-width="3" fill="none" stroke-linecap="round" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="32" cy="18" r="6" fill="url(#confrontation-bond1)" filter="drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))" /></svg>',
          relatedWords: [
            'אִשָּׁה (이샤 - 여자, 아내)',
            'אִישׁ (이쉬 - 남자, 남편)'
          ]
        },
        {
          hebrew: 'הִוא',
          meaning: '그녀는',
          ipa: 'hi',
          korean: '히',
          letters: 'הִ(hi) + וא()',
          root: 'הוּא (후)',
          grammar: '대명사',
          emoji: '👈',
          iconSvg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="confrontation-she1" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#FF69B4" /><stop offset="100%" stop-color="#FF1493" /></linearGradient></defs><circle cx="32" cy="32" r="26" fill="rgba(255, 105, 180, 0.2)" /><path d="M 52 32 L 20 32 L 26 26 M 20 32 L 26 38" stroke="url(#confrontation-she1)" stroke-width="4" stroke-linecap="round" fill="none" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /><circle cx="14" cy="32" r="6" fill="url(#confrontation-she1)" filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" /></svg>'
        }
      ],
      commentary: {
        intro: '창세기 12장 18절은 바로가 아브람을 책망하는 장면으로, 역설적으로 이교도 왕이 하나님의 사람을 도덕적으로 질책하는 상황을 보여줍니다. 이는 아브람의 실수가 얼마나 심각했는지를 드러냅니다.',
        sections: [
          {
            emoji: '1️⃣',
            title: 'וַיִּקְרָא פַרְעֹה (바이크라 파로) - 바로가 불렀다',
            description: '바로가 아브람을 소환한 것은 공식적인 대면을 의미합니다. 재앙의 원인을 깨달은 바로는 아브람에게 해명을 요구했으며, 이는 권력자가 진실을 밝히려는 정당한 행동이었습니다.',
            points: [
              '죄는 반드시 드러나고 책임을 물어야 합니다',
              '권력자도 도덕적 질문 앞에서는 정직을 요구합니다',
              '하나님의 개입은 진실을 밝히는 계기가 됩니다'
            ],
            color: 'purple'
          },
          {
            emoji: '2️⃣',
            title: 'מַה־זֹּאת עָשִׂיתָ לִּי (마 조트 아시타 리) - 이게 무슨 짓이냐',
            description: '바로의 질문은 깊은 배신감과 분노를 담고 있습니다. "이게 무슨 짓이냐"라는 표현은 아브람의 행동이 용납될 수 없는 것이었음을 나타내며, 이교도 왕조차 이를 비난했습니다.',
            points: [
              '거짓말은 관계를 파괴하고 신뢰를 무너뜨립니다',
              '도덕적 잘못은 신앙의 유무와 관계없이 명백합니다',
              '하나님의 사람도 이교도에게 질책받을 수 있습니다'
            ],
            color: 'blue'
          },
          {
            emoji: '3️⃣',
            title: 'לָמָה לֹא־הִגַּדְתָּ לִּי (라마 로 히가드타 리) - 왜 내게 말하지 않았느냐',
            description: '바로는 정보를 숨긴 아브람의 부정직함을 지적합니다. 만약 아브람이 처음부터 진실을 말했다면, 이 모든 재앙과 고통을 피할 수 있었을 것입니다.',
            points: [
              '침묵과 거짓말은 모두 부정직의 형태입니다',
              '진실을 숨기는 것은 다른 사람을 위험에 빠뜨립니다',
              '처음부터 정직한 것이 최선의 선택입니다'
            ],
            color: 'green'
          },
          {
            emoji: '4️⃣',
            title: 'כִּי אִשְׁתְּךָ הִוא (키 이쉬테하 히) - 그녀는 당신의 아내다',
            description: '바로는 사래의 진정한 정체성을 밝힙니다. "당신의 아내"라는 선언은 아브람이 숨기려 했던 진실을 명확히 드러내며, 관계의 회복과 책임을 요구합니다.',
            points: [
              '진실은 결국 드러나게 되어 있습니다',
              '관계의 정체성을 부인하는 것은 심각한 죄입니다',
              '하나님은 진실을 회복시키고 책임을 묻습니다'
            ],
            color: 'pink'
          }
        ],
        whyQuestion: {
          question: '왜 바로가 아브람을 혼냈을까요?',
          answer: '아브람이 거짓말을 했기 때문이에요! 아브람은 사래가 자기 아내인데 누이라고 말했어요. 그래서 바로는 사래를 자기 아내로 삼으려고 했고, 하나님이 화가 나셔서 바로의 가족에게 병을 보내셨죠. 바로는 "왜 진실을 말하지 않았어? 나도 피해를 입었잖아!"라고 화를 낸 거예요. 이상하게도 하나님의 사람인 아브람이 이집트 왕에게 혼나는 상황이 되었어요. 거짓말은 절대 좋은 결과를 가져오지 않아요!',
          bibleReferences: [
            '잠언 12:19 - "진실한 입술은 영원히 보존되거니와 거짓 혀는 눈 깜짝할 동안만 있을 뿐이니라"',
            '에베소서 4:25 - "거짓을 버리고 각각 그 이웃과 더불어 참된 것을 말하라"',
            '잠언 28:13 - "자기의 죄를 숨기는 자는 형통하지 못하나 죄를 자복하고 버리는 자는 불쌍히 여김을 받으리라"'
          ]
        },
        conclusion: {
          title: '💡 신학적 의미',
          content: '바로의 책망은 신앙인의 도덕적 책임을 강조합니다. 하나님을 믿는다는 것이 도덕적 잘못을 정당화하지 않으며, 오히려 더 높은 윤리적 기준을 요구합니다. 이교도 왕조차 아브람의 거짓을 비난했다는 사실은, 하나님의 백성이 세상에서 정직과 성실함의 모범이 되어야 함을 보여줍니다. 하나님은 아브람의 실수에도 불구하고 당신의 약속을 지키셨지만, 이 사건은 우리에게 두려움이 아닌 믿음으로, 거짓이 아닌 진실로 살아야 함을 가르칩니다.'
        }
      }
    }
  ]

  // Save to file
  const outputPath = '/Users/jinxin/dev/bible-study-app/data/generated/genesis_12_15-18.json'
  await fs.writeFile(outputPath, JSON.stringify(verses, null, 2), 'utf-8')

  log.success(`Content saved to ${outputPath}`)
  log.info(`Generated ${verses.length} verses:`)
  verses.forEach(v => {
    log.info(`  - ${v.reference}`)
  })

  return verses
}

// Run the script
generateContent()
  .then(() => {
    log.success('Generation completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    log.error(`Generation failed: ${error}`)
    process.exit(1)
  })
