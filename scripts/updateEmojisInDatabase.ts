#!/usr/bin/env tsx
/**
 * 데이터베이스의 words 테이블에 이모지를 업데이트하는 스크립트
 * 개선된 이모지 매핑을 사용하여 창세기 1장의 모든 단어에 이모지 추가
 */

import 'dotenv/config'
import { createSupabaseClient } from './utils/supabase.js'
import { log } from './utils/logger.js'

const supabase = createSupabaseClient()

// 개선된 이모지 매핑 - 히브리어와 의미 기반
const emojiMapping: Record<string, string> = {
  // 핵심 신학 용어
  'אֱלֹהִים': '👑',  // 하나님
  'בְּרֵאשִׁית': '🌅',  // 태초
  'בָּרָא': '✨',  // 창조하다
  'וַיִּבְרָא': '✨',  // 그리고 창조했다

  // 말씀 관련
  'אָמַר': '💬',  // 말씀하다
  'וַיֹּאמֶר': '💬',  // 그리고 말씀하셨다
  'לֵאמֹר': '📣',  // 말하기를

  // 보다/인식
  'רָאָה': '👀',  // 보다
  'וַיַּרְא': '👁️',  // 그리고 보셨다

  // 좋다/축복
  'טוֹב': '💚',  // 좋은
  'בָּרַךְ': '🙏',  // 축복하다
  'כִּי': '✅',  // ~라는 것
  'מְאֹד': '💯',  // 매우

  // 자연 - 천체/빛
  'אוֹר': '💡',  // 빛
  'הָאוֹר': '⭐',  // 그 빛
  'חֹשֶׁךְ': '🌑',  // 어둠
  'הַחֹשֶׁךְ': '🌚',  // 그 어둠

  // 시간
  'יוֹם': '☀️',  // 낮/날
  'הַיּוֹם': '🌞',  // 그 낮
  'לַיְלָה': '🌙',  // 밤
  'הַלָּיְלָה': '🌜',  // 그 밤
  'עֶרֶב': '🌆',  // 저녁
  'בֹקֶר': '🌄',  // 아침

  // 천체
  'מָאוֹר': '💫',  // 광명체
  'מְאֹרֹת': '🌟',  // 광명체들
  'שֶׁמֶשׁ': '☀️',  // 해
  'יָרֵחַ': '🌙',  // 달
  'כּוֹכָב': '⭐',  // 별
  'כּוֹכָבִים': '✨',  // 별들

  // 하늘/궁창
  'שָׁמַיִם': '☁️',  // 하늘
  'הַשָּׁמַיִם': '🌥️',  // 그 하늘
  'רָקִיעַ': '🌈',  // 궁창
  'הָרָקִיעַ': '🌠',  // 그 궁창

  // 땅/육지
  'אֶרֶץ': '🌍',  // 땅
  'הָאָרֶץ': '🌎',  // 그 땅
  'הַיַּבָּשָׁה': '🏞️',  // 그 마른 땅

  // 물
  'מַיִם': '💧',  // 물
  'הַמַּיִם': '💦',  // 그 물들
  'תְהוֹם': '🌊',  // 심연
  'יַמִּים': '🏖️',  // 바다들
  'הַיָּם': '🌊',  // 그 바다

  // 혼돈과 질서
  'תֹהוּ': '🌀',  // 혼돈
  'בֹהוּ': '〰️',  // 공허
  'רוּחַ': '💨',  // 영/바람
  'מְרַחֶפֶת': '🕊️',  // 운행하다
  'בָּדַל': '✂️',  // 나누다

  // 식물
  'דֶּשֶׁא': '🌱',  // 풀
  'עֵשֶׂב': '🌿',  // 초목
  'עֵץ': '🌳',  // 나무
  'פְּרִי': '🍎',  // 열매
  'זֶרַע': '🌾',  // 씨앗
  'לְמִינוֹ': '🧬',  // 그 종류대로

  // 동물
  'תַּנִּין': '🐋',  // 큰 물고기
  'הַתַּנִּינִם': '🐳',  // 큰 바다 짐승들
  'נֶפֶשׁ': '🐟',  // 생명/혼
  'חַיָּה': '🦁',  // 짐승
  'עוֹף': '🦅',  // 새
  'הָעוֹף': '🐦',  // 그 새
  'דָּג': '🐟',  // 물고기
  'בְּהֵמָה': '🐄',  // 가축
  'רֶמֶשׂ': '🦎',  // 기는 것

  // 인간
  'אָדָם': '👤',  // 사람
  'הָאָדָם': '🧑',  // 그 사람
  'זָכָר': '👨',  // 남자
  'נְקֵבָה': '👩',  // 여자
  'צֶלֶם': '🎭',  // 형상
  'דְּמוּת': '🪞',  // 모양

  // 동사 - 행위
  'עָשָׂה': '🔨',  // 만들다
  'וַיַּעַשׂ': '⚒️',  // 그리고 만드셨다
  'נָתַן': '🎁',  // 주다
  'קָרָא': '📢',  // 부르다
  'שָׁרַץ': '🐣',  // 번성하다
  'רָבָה': '📈',  // 많아지다
  'פְּרוּ': '🌸',  // 생육하라
  'מָלֵא': '🌊',  // 가득하다
  'רָדָה': '👑',  // 다스리다
  'כָּבַשׁ': '⚔️',  // 정복하다

  // 문법 요소
  'אֵת': '🎯',  // 목적격 표지
  'וְאֵת': '➕',  // 그리고 (목적격)
  'וְ': '🔗',  // 그리고
  'עַל': '🔝',  // ~위에
  'בֵּין': '↔️',  // ~사이
  'לְ': '👉',  // ~에게
  'מִן': '⬅️',  // ~로부터
}

// 의미 기반 매핑 (히브리어로 찾을 수 없을 때)
const meaningMapping: Record<string, string> = {
  '하나님': '👑',
  '태초': '🌅',
  '처음': '🌅',
  '창조': '✨',
  '말씀': '💬',
  '좋': '💚',
  '하늘': '☁️',
  '땅': '🌍',
  '지구': '🌍',
  '빛': '💡',
  '어둠': '🌙',
  '물': '💧',
  '바다': '🌊',
  '낮': '☀️',
  '밤': '🌙',
  '저녁': '🌆',
  '아침': '🌅',
  '풀': '🌱',
  '나무': '🌳',
  '열매': '🍎',
  '씨': '🌾',
  '해': '☀️',
  '달': '🌙',
  '별': '⭐',
  '물고기': '🐟',
  '새': '🦅',
  '짐승': '🦁',
  '사람': '👤',
  '남자': '👨',
  '여자': '👩',
}

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
}

function getEmojiForWord(hebrew: string, meaning: string, grammar: string): string {
  // 1. 히브리어 직접 매칭
  if (emojiMapping[hebrew]) {
    return emojiMapping[hebrew]
  }

  // 2. 의미 기반 매칭
  const lowerMeaning = meaning.toLowerCase()
  for (const [key, emoji] of Object.entries(meaningMapping)) {
    if (lowerMeaning.includes(key)) {
      return emoji
    }
  }

  // 3. 품사 기반 기본 이모지
  const lowerGrammar = grammar.toLowerCase()
  for (const [key, emoji] of Object.entries(grammarDefaultEmoji)) {
    if (lowerGrammar.includes(key)) {
      return emoji
    }
  }

  // 4. 최종 기본값
  return '📜'
}

async function updateEmojisInDatabase() {
  log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  log.info('📝 데이터베이스 이모지 업데이트 시작')
  log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // 1. 모든 단어 가져오기 (창세기 1장)
    const { data: words, error: fetchError } = await supabase
      .from('words')
      .select(`
        id,
        hebrew,
        meaning,
        grammar,
        emoji,
        verses!inner (
          book_id,
          chapter
        )
      `)
      .eq('verses.book_id', 'genesis')
      .eq('verses.chapter', 1)

    if (fetchError) {
      log.error('단어 조회 실패:', fetchError.message)
      return
    }

    if (!words || words.length === 0) {
      log.warn('⚠️  업데이트할 단어가 없습니다.')
      return
    }

    log.info(`📊 총 ${words.length}개 단어 발견\n`)

    // 2. 각 단어의 이모지 결정 및 업데이트
    let updateCount = 0
    let skipCount = 0

    for (const word of words) {
      const newEmoji = getEmojiForWord(word.hebrew, word.meaning, word.grammar || '')

      // 이모지가 이미 동일하면 건너뛰기
      if (word.emoji === newEmoji) {
        skipCount++
        continue
      }

      // 업데이트
      const { error: updateError } = await supabase
        .from('words')
        .update({ emoji: newEmoji })
        .eq('id', word.id)

      if (updateError) {
        log.error(`❌ 업데이트 실패: ${word.hebrew} (${word.meaning})`, updateError.message)
        continue
      }

      updateCount++
      log.success(`✅ ${word.hebrew} (${word.meaning}): ${word.emoji || '없음'} → ${newEmoji}`)
    }

    log.info('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    log.success(`✅ 업데이트 완료!`)
    log.info(`📊 통계:`)
    log.info(`   - 총 단어: ${words.length}개`)
    log.info(`   - 업데이트: ${updateCount}개`)
    log.info(`   - 건너뜀: ${skipCount}개`)
    log.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  } catch (error: any) {
    log.error('오류 발생:', error.message)
    process.exit(1)
  }
}

// 실행
updateEmojisInDatabase()
