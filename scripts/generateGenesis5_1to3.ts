/**
 * Genesis 5:1-3 컨텐츠 생성 스크립트
 */

import { createSupabaseClient } from './utils/supabase.js'
import fs from 'fs'
import path from 'path'

const supabase = createSupabaseClient()

async function generateGenesis5_1to3() {
  console.log('📖 Genesis 5:1-3 히브리어 원문 조회 중...\n')

  // Supabase에서 Genesis 5:1-3 조회
  const { data, error } = await supabase
    .from('verses')
    .select('id, reference, hebrew, verse_number')
    .eq('book_id', 'genesis')
    .eq('chapter', 5)
    .in('verse_number', [1, 2, 3])
    .order('verse_number')

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (!data || data.length === 0) {
    console.error('❌ Genesis 5:1-3 데이터를 찾을 수 없습니다.')
    return
  }

  console.log('✅ 히브리어 원문 조회 완료\n')

  // 각 구절의 히브리어 원문 출력
  data.forEach(verse => {
    console.log(`${verse.reference}:`)
    console.log(`ID: ${verse.id}`)
    console.log(`Hebrew: ${verse.hebrew}`)
    console.log()
  })

  // 이제 각 구절에 대한 컨텐츠 생성
  await generateVerse5_1(data[0])
  await generateVerse5_2(data[1])
  await generateVerse5_3(data[2])

  console.log('\n✅ 모든 구절 생성 완료!')
}

async function generateVerse5_1(verse: any) {
  console.log(`\n📝 ${verse.reference} 생성 중...`)

  const content = {
    id: verse.id,
    reference: verse.reference,
    hebrew: verse.hebrew,
    ipa: "zɛ ˈsefɛr toləˈdot ʔaˈdam bəˈjom bəˈro ʔɛloˈhim ʔaˈdam bidˈmut ʔɛloˈhim ʔaˈsa ʔoˈto",
    koreanPronunciation: "제 세페르 톨도트 아담 베욤 베로 엘로힘 아담 비드무트 엘로힘 아사 오토",
    modern: "이것은 아담의 계보에 관한 기록입니다. 하나님께서 사람을 창조하실 때, 하나님의 형상대로 그를 만드셨습니다",
    words: [
      {
        hebrew: "זֶה",
        meaning: "이것은",
        ipa: "zɛ",
        korean: "제",
        letters: "ז(z) + ֶ(e) + ה(h)",
        root: "זֶה (제)",
        grammar: "대명사",
        emoji: "👉",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pointer_zeh" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#667EEA" />
      <stop offset="50%" stop-color="#764BA2" />
      <stop offset="100%" stop-color="#F093FB" />
    </linearGradient>
    <radialGradient id="glow_zeh">
      <stop offset="0%" stop-color="#FFFFFF" opacity="0.8" />
      <stop offset="100%" stop-color="#667EEA" opacity="0" />
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="28" fill="url(#glow_zeh)" />
  <path d="M 12 32 L 40 32 L 40 24 L 52 32 L 40 40 L 40 32 Z"
    fill="url(#pointer_zeh)"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <circle cx="16" cy="32" r="4" fill="url(#pointer_zeh)" opacity="0.7" />
</svg>`
      },
      {
        hebrew: "סֵפֶר",
        meaning: "책, 기록",
        ipa: "ˈsefɛr",
        korean: "세페르",
        letters: "ס(s) + ֵ(e) + פֶ(fe) + ר(r)",
        root: "ס-פ-ר (사파르)",
        grammar: "명사",
        emoji: "📖",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="book_sefer" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8B4513" />
      <stop offset="50%" stop-color="#A0522D" />
      <stop offset="100%" stop-color="#6B3410" />
    </linearGradient>
    <linearGradient id="pages_sefer" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFF8DC" />
      <stop offset="100%" stop-color="#F5DEB3" />
    </linearGradient>
    <linearGradient id="text_sefer" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4A4A4A" />
      <stop offset="100%" stop-color="#2A2A2A" />
    </linearGradient>
  </defs>
  <rect x="14" y="10" width="36" height="44" rx="2" fill="url(#book_sefer)"
    filter="drop-shadow(4px 4px 6px rgba(0, 0, 0, 0.4))" />
  <rect x="18" y="12" width="28" height="40" rx="1" fill="url(#pages_sefer)" />
  <line x1="20" y1="20" x2="40" y2="20" stroke="url(#text_sefer)" stroke-width="1.5" />
  <line x1="20" y1="26" x2="44" y2="26" stroke="url(#text_sefer)" stroke-width="1.5" />
  <line x1="20" y1="32" x2="38" y2="32" stroke="url(#text_sefer)" stroke-width="1.5" />
  <line x1="20" y1="38" x2="42" y2="38" stroke="url(#text_sefer)" stroke-width="1.5" />
  <line x1="20" y1="44" x2="36" y2="44" stroke="url(#text_sefer)" stroke-width="1.5" />
  <line x1="32" y1="12" x2="32" y2="52" stroke="#8B4513" stroke-width="1" opacity="0.3" />
</svg>`
      },
      {
        hebrew: "תּוֹלְדֹת",
        meaning: "계보, 역사, 세대",
        ipa: "toləˈdot",
        korean: "톨도트",
        letters: "תּ(to) + וֹ(o) + לְ(le) + דֹת(dot)",
        root: "י-ל-ד (얄라드)",
        grammar: "명사",
        emoji: "👨‍👩‍👧‍👦",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tree_toledot" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#8B4513" />
      <stop offset="50%" stop-color="#A0522D" />
      <stop offset="100%" stop-color="#6B3410" />
    </linearGradient>
    <radialGradient id="gen1_toledot">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="100%" stop-color="#FFA500" />
    </radialGradient>
    <radialGradient id="gen2_toledot">
      <stop offset="0%" stop-color="#87CEEB" />
      <stop offset="100%" stop-color="#4682B4" />
    </radialGradient>
    <radialGradient id="gen3_toledot">
      <stop offset="0%" stop-color="#98FB98" />
      <stop offset="100%" stop-color="#3CB371" />
    </radialGradient>
  </defs>
  <rect x="28" y="36" width="8" height="20" rx="1" fill="url(#tree_toledot)" />
  <circle cx="32" cy="16" r="6" fill="url(#gen1_toledot)"
    filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" />
  <circle cx="20" cy="28" r="5" fill="url(#gen2_toledot)"
    filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" />
  <circle cx="44" cy="28" r="5" fill="url(#gen2_toledot)"
    filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" />
  <circle cx="14" cy="40" r="4" fill="url(#gen3_toledot)"
    filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" />
  <circle cx="26" cy="40" r="4" fill="url(#gen3_toledot)"
    filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" />
  <circle cx="38" cy="40" r="4" fill="url(#gen3_toledot)"
    filter="drop-shadow(0 2px 4px rgba 0, 0, 0, 0.3))" />
  <circle cx="50" cy="40" r="4" fill="url(#gen3_toledot)"
    filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" />
  <line x1="32" y1="22" x2="20" y2="23" stroke="#8B4513" stroke-width="2" opacity="0.6" />
  <line x1="32" y1="22" x2="44" y2="23" stroke="#8B4513" stroke-width="2" opacity="0.6" />
  <line x1="20" y1="33" x2="14" y2="36" stroke="#8B4513" stroke-width="1.5" opacity="0.6" />
  <line x1="20" y1="33" x2="26" y2="36" stroke="#8B4513" stroke-width="1.5" opacity="0.6" />
  <line x1="44" y1="33" x2="38" y2="36" stroke="#8B4513" stroke-width="1.5" opacity="0.6" />
  <line x1="44" y1="33" x2="50" y2="36" stroke="#8B4513" stroke-width="1.5" opacity="0.6" />
</svg>`
      },
      {
        hebrew: "אָדָם",
        meaning: "아담, 사람",
        ipa: "ʔaˈdam",
        korean: "아담",
        letters: "אָ(a) + דָ(da) + ם(m)",
        root: "א-ד-ם (아담)",
        grammar: "명사",
        emoji: "👤",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="body_adam" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#D2691E" />
      <stop offset="50%" stop-color="#A0522D" />
      <stop offset="100%" stop-color="#8B4513" />
    </linearGradient>
    <radialGradient id="glow_adam">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="50%" stop-color="#FFA500" opacity="0.3" />
      <stop offset="100%" stop-color="#FF8C00" opacity="0" />
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="30" fill="url(#glow_adam)" />
  <circle cx="32" cy="22" r="10" fill="url(#body_adam)"
    filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))" />
  <ellipse cx="32" cy="48" rx="14" ry="12" fill="url(#body_adam)"
    filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))" />
  <circle cx="28" cy="20" r="2" fill="#FFF" />
  <circle cx="36" cy="20" r="2" fill="#FFF" />
  <circle cx="28.5" cy="20.5" r="1" fill="#000" />
  <circle cx="36.5" cy="20.5" r="1" fill="#000" />
  <path d="M 28 26 Q 32 28 36 26" stroke="#8B4513" stroke-width="1.5" fill="none" opacity="0.7" />
</svg>`,
        relatedWords: [
          "אֲדָמָה (아다마 - 흙, 땅)",
          "אָדֹם (아돔 - 붉은)"
        ]
      },
      {
        hebrew: "בְּרֹא",
        meaning: "창조하실 때",
        ipa: "bəˈro",
        korean: "베로",
        letters: "בְּ(be) + רֹ(ro) + א(silent)",
        root: "ב-ר-א (bara)",
        grammar: "동사",
        emoji: "✨",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="center_bero">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="40%" stop-color="#FFD700" />
      <stop offset="100%" stop-color="#FF1493" />
    </radialGradient>
    <linearGradient id="ray1_bero" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F5FF" />
      <stop offset="100%" stop-color="#FF00FF" />
    </linearGradient>
    <linearGradient id="ray2_bero" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="100%" stop-color="#FF6347" />
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="30" fill="rgba(255, 215, 0, 0.1)" />
  <path d="M 32 8 L 36 28 L 32 32 L 28 28 Z" fill="url(#ray1_bero)" opacity="0.8"
    filter="drop-shadow(0 0 4px rgba(0, 245, 255, 0.6))" />
  <path d="M 56 32 L 36 36 L 32 32 L 36 28 Z" fill="url(#ray2_bero)" opacity="0.8"
    filter="drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))" />
  <path d="M 32 56 L 28 36 L 32 32 L 36 36 Z" fill="url(#ray1_bero)" opacity="0.8"
    filter="drop-shadow(0 0 4px rgba(0, 255, 127, 0.6))" />
  <path d="M 8 32 L 28 28 L 32 32 L 28 36 Z" fill="url(#ray2_bero)" opacity="0.8"
    filter="drop-shadow(0 0 4px rgba(255, 0, 255, 0.6))" />
  <circle cx="32" cy="32" r="8" fill="url(#center_bero)"
    filter="drop-shadow(0 0 8px rgba(255, 215, 0, 0.9))" />
</svg>`
      },
      {
        hebrew: "בִּדְמוּת",
        meaning: "~의 형상으로",
        ipa: "bidˈmut",
        korean: "비드무트",
        letters: "בִּ(bi) + דְ(de) + מוּת(mut)",
        root: "ד-מ-ה (다마)",
        grammar: "명사",
        emoji: "🪞",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mirror_dmut" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E0F7FA" />
      <stop offset="50%" stop-color="#B2EBF2" />
      <stop offset="100%" stop-color="#80DEEA" />
    </linearGradient>
    <linearGradient id="frame_dmut" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="50%" stop-color="#FFA500" />
      <stop offset="100%" stop-color="#FF8C00" />
    </linearGradient>
    <radialGradient id="shine_dmut">
      <stop offset="0%" stop-color="#FFFFFF" opacity="0.9" />
      <stop offset="100%" stop-color="#FFFFFF" opacity="0" />
    </radialGradient>
  </defs>
  <rect x="12" y="8" width="40" height="48" rx="4" fill="url(#frame_dmut)"
    filter="drop-shadow(4px 4px 6px rgba(0, 0, 0, 0.4))" />
  <rect x="16" y="12" width="32" height="40" rx="2" fill="url(#mirror_dmut)" />
  <ellipse cx="24" cy="20" rx="8" ry="6" fill="url(#shine_dmut)" />
  <circle cx="32" cy="28" r="6" fill="#4A90E2" opacity="0.3" />
  <path d="M 26 28 Q 32 34 38 28" stroke="#4A90E2" stroke-width="2" fill="none" opacity="0.4" />
  <line x1="28" y1="36" x2="28" y2="42" stroke="#4A90E2" stroke-width="1.5" opacity="0.4" />
  <line x1="36" y1="36" x2="36" y2="42" stroke="#4A90E2" stroke-width="1.5" opacity="0.4" />
</svg>`
      },
      {
        hebrew: "עָשָׂה",
        meaning: "만드셨다",
        ipa: "ʔaˈsa",
        korean: "아사",
        letters: "עָ(a) + שָׂ(sa) + ה(h)",
        root: "ע-שׂ-ה (아사)",
        grammar: "동사",
        emoji: "🛠️",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hand_asah" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFA07A" />
      <stop offset="50%" stop-color="#FA8072" />
      <stop offset="100%" stop-color="#E9967A" />
    </linearGradient>
    <linearGradient id="work_asah" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4169E1" />
      <stop offset="50%" stop-color="#1E90FF" />
      <stop offset="100%" stop-color="#00BFFF" />
    </linearGradient>
    <radialGradient id="spark_asah">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="100%" stop-color="#FFA500" />
    </radialGradient>
  </defs>
  <path d="M 20 40 L 20 28 L 28 24 L 36 24 L 44 28 L 44 40 L 36 44 L 28 44 Z"
    fill="url(#work_asah)" opacity="0.6"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <path d="M 16 32 L 16 20 Q 16 16 20 16 L 24 16 L 24 24 L 20 28 Z"
    fill="url(#hand_asah)"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <circle cx="12" cy="36" r="3" fill="url(#spark_asah)"
    filter="drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))" />
  <circle cx="48" cy="24" r="2.5" fill="url(#spark_asah)"
    filter="drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))" />
  <circle cx="36" cy="12" r="2" fill="url(#spark_asah)"
    filter="drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))" />
</svg>`
      }
    ],
    commentary: {
      intro: "창세기 5장은 아담의 계보를 기록한 중요한 장으로 시작합니다. 이 구절은 단순한 족보 이상의 의미를 담고 있으며, 창조 이야기를 상기시키고 하나님의 형상대로 지음 받은 인간의 존엄성을 재확인합니다.",
      sections: [
        {
          emoji: "1️⃣",
          title: "סֵפֶר תּוֹלְדֹת (세페르 톨도트) - 계보의 책",
          description: "'세페르'는 '책' 또는 '기록'을 의미하고, '톨도트'는 '세대', '계보', '역사'를 뜻합니다. 이 표현은 창세기에서 주요 구조적 표지로 사용되며, 새로운 단락의 시작을 알립니다. 여기서는 아담부터 노아까지 10대의 족보를 소개합니다.",
          points: [
            "족보는 단순한 이름 나열이 아니라 하나님의 구속 역사를 보여줍니다",
            "각 세대마다 하나님의 약속이 전달되고 있음을 나타냅니다",
            "인류 역사가 무작위가 아니라 하나님의 계획 안에 있음을 보여줍니다"
          ],
          color: "purple" as const
        },
        {
          emoji: "2️⃣",
          title: "בִּדְמוּת אֱלֹהִים (비드무트 엘로힘) - 하나님의 형상으로",
          description: "'드무트'는 '형상', '모양', '유사성'을 의미합니다. 창세기 1:26-27을 직접 인용하여, 인간이 하나님의 형상대로 창조되었다는 근본적 진리를 재확인합니다. 이는 타락 이후에도 여전히 유효한 인간의 존엄성을 보여줍니다.",
          points: [
            "타락 후에도 하나님의 형상은 완전히 사라지지 않았습니다",
            "모든 인간은 하나님의 형상을 지닌 존귀한 존재입니다",
            "이 형상은 도덕성, 이성, 관계성, 창조성 등을 포함합니다"
          ],
          color: "blue" as const
        },
        {
          emoji: "3️⃣",
          title: "בָּרָא...עָשָׂה (바라...아사) - 창조하다와 만들다",
          description: "이 구절은 '바라'(창조하다)와 '아사'(만들다) 두 동사를 모두 사용합니다. '바라'는 무에서 유를 창조하는 신적 행위를, '아사'는 형성하고 만드는 과정을 강조합니다. 두 동사가 함께 쓰여 창조의 완전성을 표현합니다.",
          points: [
            "하나님은 창조하시고(bara) 또한 세심하게 만드셨습니다(asah)",
            "인간 창조는 무작위적이지 않고 의도적이고 목적이 있습니다",
            "창조와 형성 모두 하나님의 사랑과 지혜를 나타냅니다"
          ],
          color: "green" as const
        }
      ],
      whyQuestion: {
        question: "왜 성경에는 긴 족보가 나올까요?",
        answer: "성경의 족보는 마치 우리 가족 앨범과 같아요. 할아버지, 할머니, 엄마, 아빠를 거쳐 우리에게 이어진 것처럼, 하나님의 약속도 아담부터 시작해서 대대로 이어져 왔답니다. 그리고 이 긴 족보는 결국 예수님까지 연결되어요. 하나님은 수천 년 동안 약속을 지키시며 우리를 구원할 예수님을 보내주셨어요. 족보는 하나님이 약속을 반드시 지키신다는 증거랍니다!",
        bibleReferences: [
          "마태복음 1:1 - '아브라함과 다윗의 자손 예수 그리스도의 계보라'",
          "누가복음 3:38 - '그 이상은 에노스요 그 이상은 셋이요 그 이상은 아담이요 그 이상은 하나님이시니라'",
          "야고보서 5:11 - '보라 인내하는 자를 우리가 복되다 하나니 너희가 욥의 인내를 들었고 주께서 주신 결말을 보았거니와'",
          "히브리서 11:39-40 - '이 사람들은 다 믿음으로 말미암아 증거를 받았으나 약속을 받지 못하였으니 이는 하나님이 우리를 위하여 더 좋은 것을 예비하셨은즉'"
        ]
      },
      conclusion: {
        title: "💡 신학적 의미",
        content: "창세기 5:1은 족보의 시작이지만, 동시에 복음의 예표입니다. 아담으로부터 시작된 인류의 계보는 결국 '마지막 아담'이신 예수 그리스도로 이어집니다(고린도전서 15:45). 첫 아담이 하나님의 형상으로 창조되었듯이, 그리스도 안에서 우리는 그 형상을 회복하고 완성하게 됩니다. 이 구절은 타락 이후에도 하나님의 구속 계획이 계속되었음을 보여주며, 각 세대를 통해 약속의 씨가 보존되었음을 증언합니다."
      }
    }
  }

  const outputPath = path.join(process.cwd(), 'data', 'generated_v2', `${verse.id}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), 'utf-8')
  console.log(`✅ ${outputPath} 생성 완료`)
}

async function generateVerse5_2(verse: any) {
  console.log(`\n📝 ${verse.reference} 생성 중...`)

  const content = {
    id: verse.id,
    reference: verse.reference,
    hebrew: verse.hebrew,
    ipa: "zaˈxar uneqeˈva bəraˈʔam vajeˈvarex ʔoˈtam vajiqˈra ʔɛt ʃəˈmam ʔaˈdam bəˈjom hibareˈʔam",
    koreanPronunciation: "자카르 우네케바 베라암 바예바렉 오탐 바이크라 에트 셰맘 아담 베욤 히바레암",
    modern: "그분께서 그들을 남자와 여자로 창조하시고, 그들을 축복하시며, 그들이 창조된 날에 그들의 이름을 '사람'이라 부르셨습니다",
    words: [
      {
        hebrew: "זָכָר",
        meaning: "남자",
        ipa: "zaˈxar",
        korean: "자카르",
        letters: "ז(z) + ָ(a) + כָר(khar)",
        root: "ז-כ-ר (자카르)",
        grammar: "명사",
        emoji: "👨",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="male_zakhar" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4A90E2" />
      <stop offset="50%" stop-color="#357ABD" />
      <stop offset="100%" stop-color="#2E5C8A" />
    </linearGradient>
    <radialGradient id="glow_zakhar">
      <stop offset="0%" stop-color="#87CEEB" opacity="0.8" />
      <stop offset="100%" stop-color="#4A90E2" opacity="0" />
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="28" fill="url(#glow_zakhar)" />
  <circle cx="32" cy="28" r="18" fill="none" stroke="url(#male_zakhar)" stroke-width="4"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <path d="M 44 16 L 52 8 M 52 8 L 52 16 M 52 8 L 44 8"
    stroke="url(#male_zakhar)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
</svg>`
      },
      {
        hebrew: "וּנְקֵבָה",
        meaning: "그리고 여자",
        ipa: "uneqeˈva",
        korean: "우네케바",
        letters: "וּ(u) + נְ(ne) + קֵבָה(kevah)",
        root: "נ-ק-ב (나카브)",
        grammar: "명사",
        emoji: "👩",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="female_nekevah" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF69B4" />
      <stop offset="50%" stop-color="#FF1493" />
      <stop offset="100%" stop-color="#C71585" />
    </linearGradient>
    <radialGradient id="glow_nekevah">
      <stop offset="0%" stop-color="#FFB6C1" opacity="0.8" />
      <stop offset="100%" stop-color="#FF69B4" opacity="0" />
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="28" fill="url(#glow_nekevah)" />
  <circle cx="32" cy="24" r="12" fill="none" stroke="url(#female_nekevah)" stroke-width="4"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <line x1="32" y1="36" x2="32" y2="48" stroke="url(#female_nekevah)" stroke-width="4"
    stroke-linecap="round"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <line x1="24" y1="52" x2="40" y2="52" stroke="url(#female_nekevah)" stroke-width="4"
    stroke-linecap="round"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
</svg>`
      },
      {
        hebrew: "בְּרָאָם",
        meaning: "그들을 창조하셨다",
        ipa: "bəraˈʔam",
        korean: "베라암",
        letters: "בְּ(be) + רָ(ra) + אָם(am)",
        root: "ב-ר-א (bara)",
        grammar: "동사",
        emoji: "✨",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="center_beram">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="40%" stop-color="#FFD700" />
      <stop offset="100%" stop-color="#FF1493" />
    </radialGradient>
    <linearGradient id="couple_beram" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4A90E2" />
      <stop offset="50%" stop-color="#9C27B0" />
      <stop offset="100%" stop-color="#FF69B4" />
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="30" fill="rgba(255, 215, 0, 0.1)" />
  <circle cx="24" cy="32" r="10" fill="none" stroke="#4A90E2" stroke-width="3" opacity="0.7" />
  <circle cx="40" cy="32" r="10" fill="none" stroke="#FF69B4" stroke-width="3" opacity="0.7" />
  <path d="M 32 16 L 36 28 L 32 32 L 28 28 Z" fill="url(#couple_beram)" opacity="0.8"
    filter="drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))" />
  <path d="M 32 48 L 28 36 L 32 32 L 36 36 Z" fill="url(#couple_beram)" opacity="0.8"
    filter="drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))" />
  <circle cx="32" cy="32" r="6" fill="url(#center_beram)"
    filter="drop-shadow(0 0 8px rgba(255, 215, 0, 0.9))" />
</svg>`
      },
      {
        hebrew: "וַיְבָרֶךְ",
        meaning: "축복하셨다",
        ipa: "vajeˈvarex",
        korean: "바예바렉",
        letters: "וַ(va) + יְ(ye) + בָרֶךְ(varech)",
        root: "ב-ר-ך (바라크)",
        grammar: "동사",
        emoji: "🙏",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hands_barech" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFE4B5" />
      <stop offset="50%" stop-color="#F4A460" />
      <stop offset="100%" stop-color="#CD853F" />
    </linearGradient>
    <radialGradient id="light_barech">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="50%" stop-color="#FFA500" opacity="0.6" />
      <stop offset="100%" stop-color="#FF8C00" opacity="0" />
    </radialGradient>
  </defs>
  <circle cx="32" cy="20" r="25" fill="url(#light_barech)" />
  <path d="M 20 36 Q 18 30 20 24 L 24 24 L 26 36 Z" fill="url(#hands_barech)"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <path d="M 44 36 Q 46 30 44 24 L 40 24 L 38 36 Z" fill="url(#hands_barech)"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <path d="M 26 36 L 32 28 L 38 36 L 36 40 L 28 40 Z" fill="url(#hands_barech)"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <circle cx="32" cy="16" r="3" fill="#FFD700" opacity="0.8"
    filter="drop-shadow(0 0 6px rgba(255, 215, 0, 0.9))" />
  <circle cx="26" cy="14" r="2" fill="#FFA500" opacity="0.7" />
  <circle cx="38" cy="14" r="2" fill="#FFA500" opacity="0.7" />
</svg>`
      },
      {
        hebrew: "וַיִּקְרָא",
        meaning: "부르셨다",
        ipa: "vajiqˈra",
        korean: "바이크라",
        letters: "וַ(va) + יִּ(yi) + קְרָא(kra)",
        root: "ק-ר-א (카라)",
        grammar: "동사",
        emoji: "📢",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mouth_kara" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B6B" />
      <stop offset="50%" stop-color="#EE5A6F" />
      <stop offset="100%" stop-color="#C44569" />
    </linearGradient>
    <linearGradient id="sound_kara" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4FACFE" />
      <stop offset="100%" stop-color="#00F2FE" />
    </linearGradient>
  </defs>
  <ellipse cx="24" cy="32" rx="12" ry="16" fill="url(#mouth_kara)"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <path d="M 36 24 Q 44 24 48 28" stroke="url(#sound_kara)" stroke-width="3"
    fill="none" stroke-linecap="round" opacity="0.7" />
  <path d="M 36 32 Q 46 32 52 36" stroke="url(#sound_kara)" stroke-width="3"
    fill="none" stroke-linecap="round" opacity="0.7" />
  <path d="M 36 40 Q 44 40 48 44" stroke="url(#sound_kara)" stroke-width="3"
    fill="none" stroke-linecap="round" opacity="0.7" />
  <ellipse cx="24" cy="32" rx="6" ry="8" fill="#8B0000" opacity="0.5" />
</svg>`
      },
      {
        hebrew: "שְׁמָם",
        meaning: "그들의 이름",
        ipa: "ʃəˈmam",
        korean: "셰맘",
        letters: "שְׁ(she) + מָם(mam)",
        root: "שֵׁם (셈)",
        grammar: "명사",
        emoji: "🏷️",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tag_shem" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDB99B" />
      <stop offset="50%" stop-color="#F6876A" />
      <stop offset="100%" stop-color="#EA5455" />
    </linearGradient>
    <linearGradient id="text_shem" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2C3E50" />
      <stop offset="100%" stop-color="#34495E" />
    </linearGradient>
  </defs>
  <path d="M 12 16 L 44 16 L 52 32 L 44 48 L 12 48 Z" fill="url(#tag_shem)"
    filter="drop-shadow(4px 4px 6px rgba(0, 0, 0, 0.3))" />
  <circle cx="20" cy="32" r="4" fill="#FFF" opacity="0.8" />
  <text x="32" y="26" font-family="Arial, sans-serif" font-size="10"
    font-weight="bold" fill="url(#text_shem)" text-anchor="middle">אדם</text>
  <text x="32" y="38" font-family="Arial, sans-serif" font-size="8"
    fill="url(#text_shem)" text-anchor="middle" opacity="0.7">ADAM</text>
</svg>`
      }
    ],
    commentary: {
      intro: "이 구절은 남자와 여자의 창조, 하나님의 축복, 그리고 인간에게 부여된 공통의 이름에 대해 말합니다. 성별의 차이와 함께 근본적인 평등을, 그리고 하나님 앞에서의 연합을 강조합니다.",
      sections: [
        {
          emoji: "1️⃣",
          title: "זָכָר וּנְקֵבָה (자카르 우네케바) - 남자와 여자",
          description: "'자카르'(남자)와 '네케바'(여자)는 생물학적 성별을 나타내는 히브리어 단어입니다. 창세기 1:27을 재확인하며, 남성과 여성 모두 하나님의 형상으로 창조되었음을 강조합니다. 성별의 구별은 하나님의 창조 목적의 일부입니다.",
          points: [
            "남성과 여성은 동등하게 하나님의 형상을 반영합니다",
            "성별의 차이는 열등함이 아니라 상호보완을 위한 것입니다",
            "두 성별 모두 하나님의 창조 계획에 필수적입니다"
          ],
          color: "purple" as const
        },
        {
          emoji: "2️⃣",
          title: "וַיְבָרֶךְ אֹתָם (바예바렉 오탐) - 그들을 축복하셨다",
          description: "'바라크'는 '축복하다', '무릎 꿇다'를 의미하는 동사입니다. 하나님께서 남자와 여자 둘 다를 축복하셨다는 것은, 두 성별이 모두 하나님의 은혜와 사명을 받았음을 의미합니다. 이 축복은 '생육하고 번성하라'는 명령과 연결됩니다.",
          points: [
            "하나님의 축복은 남녀 모두에게 동등하게 주어집니다",
            "축복에는 번성, 충만, 다스림의 사명이 포함됩니다",
            "하나님의 축복은 세대를 이어가는 능력을 부여합니다"
          ],
          color: "blue" as const
        },
        {
          emoji: "3️⃣",
          title: "וַיִּקְרָא אֶת שְׁמָם אָדָם (바이크라 에트 셰맘 아담) - 그들의 이름을 사람이라 부르셨다",
          description: "놀랍게도 하나님은 남자와 여자 둘 다에게 '아담'(사람)이라는 이름을 주셨습니다. 이는 성별을 초월한 공통의 인간성과 정체성을 강조합니다. 남자 개인의 이름이 아니라, 인류 전체를 가리키는 집합적 이름입니다.",
          points: [
            "남자와 여자는 함께 '아담'(인류)을 구성합니다",
            "성별보다 더 근본적인 것은 하나님의 형상을 지닌 인간성입니다",
            "부부는 하나님 앞에서 하나의 단위로 간주됩니다"
          ],
          color: "green" as const
        }
      ],
      whyQuestion: {
        question: "왜 하나님은 남자와 여자를 다르게 만드셨을까요?",
        answer: "하나님은 남자와 여자가 서로 도우며 함께 살도록 만드셨어요. 마치 퍼즐 조각처럼 남자와 여자는 서로 다르지만 함께 맞춰지면 아름다운 그림이 완성돼요. 엄마와 아빠가 서로 다른 것처럼, 남자와 여자도 다르지만 둘 다 하나님의 특별한 형상으로 만들어졌어요. 그리고 하나님은 남자와 여자 모두를 똑같이 사랑하시고 축복하세요!",
        bibleReferences: [
          "창세기 2:18 - '여호와 하나님이 이르시되 사람이 혼자 사는 것이 좋지 아니하니 내가 그를 위하여 돕는 배필을 지으리라'",
          "갈라디아서 3:28 - '너희는 유대인이나 헬라인이나 종이나 자유인이나 남자나 여자나 다 그리스도 예수 안에서 하나이니라'",
          "고린도전서 11:11-12 - '그러나 주 안에는 남자 없이 여자만 있지 않고 여자 없이 남자만 있지 아니하니라 여자가 남자에게서 난 것 같이 남자도 여자로 말미암아 났으나'",
          "베드로전서 3:7 - '남편 된 자들아 이와 같이 지식을 따라 너희 아내와 동거하고 그를 더 연약한 그릇이라 알아 귀히 여기라 생명의 은혜를 함께 이어받을 자로 알아'"
        ]
      },
      conclusion: {
        title: "💡 신학적 의미",
        content: "이 구절은 성경의 평등주의적 비전을 보여줍니다. 남자와 여자는 창조, 축복, 명명에서 동등하게 취급됩니다. 타락 이전의 원래 창조 질서에서는 위계나 지배가 아니라 상호보완과 연합이 있었습니다. '아담'이라는 공통의 이름은 그리스도 안에서 '새 사람'(에베소서 2:15)이 되는 것을 예표합니다. 남자든 여자든, 그리스도 안에서 우리는 모두 하나님의 형상을 회복하고 하나의 새로운 인류가 됩니다."
      }
    }
  }

  const outputPath = path.join(process.cwd(), 'data', 'generated_v2', `${verse.id}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), 'utf-8')
  console.log(`✅ ${outputPath} 생성 완료`)
}

async function generateVerse5_3(verse: any) {
  console.log(`\n📝 ${verse.reference} 생성 중...`)

  const content = {
    id: verse.id,
    reference: verse.reference,
    hebrew: verse.hebrew,
    ipa: "vajeˈxi ʔaˈdam ʃəloˈʃim umeˈʔat ʃaˈna vajjoˈlɛd bidˈmuto kətsalˈmo vajiqˈra ʔɛt ʃəˈmo ʃet",
    koreanPronunciation: "바예히 아담 셸로쉼 우메아트 샤나 바욜레드 비드무토 케첼모 바이크라 에트 셰모 셋",
    modern: "아담은 백삼십 세에 자기 모양 곧 자기 형상과 같은 아들을 낳아 이름을 셋이라 하였습니다",
    words: [
      {
        hebrew: "וַיְחִי",
        meaning: "그리고 살았다",
        ipa: "vajeˈxi",
        korean: "바예히",
        letters: "וַ(va) + יְ(ye) + חִי(chi)",
        root: "ח-י-ה (하야)",
        grammar: "동사",
        emoji: "⏳",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="glass_yechi" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E0F7FA" />
      <stop offset="50%" stop-color="#B2EBF2" />
      <stop offset="100%" stop-color="#80DEEA" />
    </linearGradient>
    <linearGradient id="sand_yechi" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFE082" />
      <stop offset="50%" stop-color="#FFD54F" />
      <stop offset="100%" stop-color="#FFCA28" />
    </linearGradient>
  </defs>
  <path d="M 22 12 L 42 12 L 38 28 L 26 28 Z" fill="url(#glass_yechi)" opacity="0.6"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <path d="M 26 28 L 32 34 L 38 28 Z" fill="url(#sand_yechi)" />
  <path d="M 26 36 L 38 36 L 42 52 L 22 52 Z" fill="url(#glass_yechi)" opacity="0.6"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <ellipse cx="32" cy="46" rx="8" ry="4" fill="url(#sand_yechi)" />
  <circle cx="32" cy="20" r="1.5" fill="url(#sand_yechi)" opacity="0.7" />
  <circle cx="28" cy="22" r="1" fill="url(#sand_yechi)" opacity="0.6" />
  <circle cx="36" cy="22" r="1" fill="url(#sand_yechi)" opacity="0.6" />
</svg>`
      },
      {
        hebrew: "שְׁלֹשִׁים",
        meaning: "삼십",
        ipa: "ʃəloˈʃim",
        korean: "셸로쉼",
        letters: "שְׁ(she) + לֹ(lo) + שִׁים(shim)",
        root: "שָׁלֹשׁ (샬로쉬)",
        grammar: "명사",
        emoji: "3️⃣0️⃣",
        iconSv: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="num_sheloshim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#667EEA" />
      <stop offset="50%" stop-color="#764BA2" />
      <stop offset="100%" stop-color="#F093FB" />
    </linearGradient>
  </defs>
  <text x="32" y="40" font-family="Arial, sans-serif" font-size="32" font-weight="bold"
    fill="url(#num_sheloshim)" text-anchor="middle"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))">30</text>
  <circle cx="32" cy="32" r="26" fill="none" stroke="url(#num_sheloshim)"
    stroke-width="3" opacity="0.4" />
</svg>`
      },
      {
        hebrew: "וּמְאַת",
        meaning: "그리고 백",
        ipa: "umeˈʔat",
        korean: "우메아트",
        letters: "וּ(u) + מְ(me) + אַת(at)",
        root: "מֵאָה (메아)",
        grammar: "명사",
        emoji: "💯",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hundred_meat" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B6B" />
      <stop offset="50%" stop-color="#EE5A6F" />
      <stop offset="100%" stop-color="#C44569" />
    </linearGradient>
    <radialGradient id="glow_hundred">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="100%" stop-color="#FFA500" opacity="0" />
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="28" fill="url(#glow_hundred)" opacity="0.3" />
  <circle cx="32" cy="32" r="24" fill="url(#hundred_meat)"
    filter="drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.4))" />
  <text x="32" y="38" font-family="Arial, sans-serif" font-size="20" font-weight="bold"
    fill="#FFF" text-anchor="middle">100</text>
</svg>`
      },
      {
        hebrew: "שָׁנָה",
        meaning: "년, 해",
        ipa: "ʃaˈna",
        korean: "샤나",
        letters: "שָׁ(sha) + נָה(nah)",
        root: "שָׁנָה (샤나)",
        grammar: "명사",
        emoji: "📅",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="calendar_shanah" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF6B6B" />
      <stop offset="50%" stop-color="#EE5A6F" />
      <stop offset="100%" stop-color="#C44569" />
    </linearGradient>
    <linearGradient id="page_shanah" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F5F5F5" />
    </linearGradient>
  </defs>
  <rect x="12" y="16" width="40" height="40" rx="4" fill="url(#page_shanah)"
    filter="drop-shadow(4px 4px 6px rgba(0, 0, 0, 0.3))" />
  <rect x="12" y="10" width="40" height="10" rx="4" fill="url(#calendar_shanah)" />
  <circle cx="20" cy="15" r="2" fill="#8B0000" />
  <circle cx="44" cy="15" r="2" fill="#8B0000" />
  <rect x="16" y="24" width="6" height="6" rx="1" fill="#E0E0E0" />
  <rect x="25" y="24" width="6" height="6" rx="1" fill="#E0E0E0" />
  <rect x="34" y="24" width="6" height="6" rx="1" fill="#E0E0E0" />
  <rect x="43" y="24" width="6" height="6" rx="1" fill="#E0E0E0" />
  <rect x="16" y="33" width="6" height="6" rx="1" fill="#E0E0E0" />
  <rect x="25" y="33" width="6" height="6" rx="1" fill="url(#calendar_shanah)" opacity="0.7" />
  <rect x="34" y="33" width="6" height="6" rx="1" fill="#E0E0E0" />
  <rect x="43" y="33" width="6" height="6" rx="1" fill="#E0E0E0" />
</svg>`
      },
      {
        hebrew: "וַיּוֹלֶד",
        meaning: "낳았다",
        ipa: "vajjoˈlɛd",
        korean: "바욜레드",
        letters: "וַ(va) + יּ(yyo) + וֹלֶד(led)",
        root: "י-ל-ד (얄라드)",
        grammar: "동사",
        emoji: "👶",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="baby_yoled" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFB6C1" />
      <stop offset="50%" stop-color="#FFB6D9" />
      <stop offset="100%" stop-color="#FFA0C9" />
    </linearGradient>
    <radialGradient id="glow_baby">
      <stop offset="0%" stop-color="#FFD700" opacity="0.5" />
      <stop offset="100%" stop-color="#FFA500" opacity="0" />
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="28" fill="url(#glow_baby)" />
  <circle cx="32" cy="28" r="12" fill="url(#baby_yoled)"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <ellipse cx="32" cy="46" rx="10" ry="8" fill="url(#baby_yoled)"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <circle cx="28" cy="26" r="2" fill="#4A4A4A" />
  <circle cx="36" cy="26" r="2" fill="#4A4A4A" />
  <path d="M 28 32 Q 32 34 36 32" stroke="#FF69B4" stroke-width="1.5"
    fill="none" stroke-linecap="round" />
  <circle cx="22" cy="24" r="3" fill="#FFB6C1" opacity="0.7" />
  <circle cx="42" cy="24" r="3" fill="#FFB6C1" opacity="0.7" />
</svg>`
      },
      {
        hebrew: "בִּדְמוּתוֹ",
        meaning: "그의 형상으로",
        ipa: "bidˈmuto",
        korean: "비드무토",
        letters: "בִּ(bi) + דְ(de) + מוּתוֹ(muto)",
        root: "ד-מ-ה (다마)",
        grammar: "명사",
        emoji: "🪞",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mirror_dmuto" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E0F7FA" />
      <stop offset="50%" stop-color="#B2EBF2" />
      <stop offset="100%" stop-color="#80DEEA" />
    </linearGradient>
    <linearGradient id="frame2_dmuto" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8B4513" />
      <stop offset="50%" stop-color="#A0522D" />
      <stop offset="100%" stop-color="#6B3410" />
    </linearGradient>
  </defs>
  <rect x="16" y="12" width="32" height="40" rx="4" fill="url(#frame2_dmuto)"
    filter="drop-shadow(4px 4px 6px rgba(0, 0, 0, 0.4))" />
  <rect x="20" y="16" width="24" height="32" rx="2" fill="url(#mirror_dmuto)" />
  <circle cx="28" cy="28" r="4" fill="#FFB6C1" opacity="0.5" />
  <circle cx="36" cy="28" r="4" fill="#FFB6C1" opacity="0.5" />
  <path d="M 26 36 Q 32 38 38 36" stroke="#FFB6C1" stroke-width="2"
    fill="none" opacity="0.5" />
  <ellipse cx="28" cy="20" rx="6" ry="4" fill="#FFFFFF" opacity="0.7" />
</svg>`
      },
      {
        hebrew: "כְּצַלְמוֹ",
        meaning: "그의 모습대로",
        ipa: "kətsalˈmo",
        korean: "케첼모",
        letters: "כְּ(ke) + צַלְמוֹ(tsalmo)",
        root: "צ-ל-ם (첼렘)",
        grammar: "명사",
        emoji: "👥",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="person1_tselem" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4A90E2" />
      <stop offset="100%" stop-color="#2E5C8A" />
    </linearGradient>
    <linearGradient id="person2_tselem" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#87CEEB" />
      <stop offset="100%" stop-color="#4682B4" />
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="8" fill="url(#person1_tselem)" opacity="0.8"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <ellipse cx="24" cy="42" rx="10" ry="12" fill="url(#person1_tselem)" opacity="0.8"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <circle cx="40" cy="28" r="7" fill="url(#person2_tselem)" opacity="0.7"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
  <ellipse cx="40" cy="44" rx="9" ry="10" fill="url(#person2_tselem)" opacity="0.7"
    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))" />
</svg>`
      },
      {
        hebrew: "שֵׁת",
        meaning: "셋 (아담의 아들)",
        ipa: "ʃet",
        korean: "셋",
        letters: "שֵׁ(she) + ת(t)",
        root: "שׁ-י-ת (쉬트)",
        grammar: "명사",
        emoji: "👨‍🦱",
        iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="seth_shet" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#A0522D" />
      <stop offset="50%" stop-color="#8B4513" />
      <stop offset="100%" stop-color="#654321" />
    </linearGradient>
    <radialGradient id="halo_seth">
      <stop offset="0%" stop-color="#FFD700" opacity="0.6" />
      <stop offset="100%" stop-color="#FFA500" opacity="0" />
    </radialGradient>
  </defs>
  <circle cx="32" cy="28" r="26" fill="url(#halo_seth)" />
  <circle cx="32" cy="28" r="12" fill="url(#seth_shet)"
    filter="drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.4))" />
  <ellipse cx="32" cy="48" rx="14" ry="12" fill="url(#seth_shet)"
    filter="drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.4))" />
  <circle cx="28" cy="26" r="2" fill="#FFF" />
  <circle cx="36" cy="26" r="2" fill="#FFF" />
  <circle cx="28.5" cy="26.5" r="1" fill="#000" />
  <circle cx="36.5" cy="26.5" r="1" fill="#000" />
  <path d="M 28 32 Q 32 34 36 32" stroke="#654321" stroke-width="1.5"
    fill="none" opacity="0.7" />
  <circle cx="32" cy="18" r="8" fill="none" stroke="#FFD700" stroke-width="2"
    opacity="0.5" />
</svg>`,
        relatedWords: [
          "שִׁית (쉬트 - 놓다, 두다)",
          "אֱנוֹשׁ (에노쉬 - 셋의 아들)"
        ]
      }
    ],
    commentary: {
      intro: "창세기 5:3은 아담이 130세에 아들 셋을 낳았다는 기록입니다. 이 구절은 '형상과 모양대로'라는 표현을 사용하여, 하나님의 형상이 세대를 통해 전달됨을 보여줍니다. 셋은 가인에게 죽임 당한 아벨을 대신하여 하나님의 언약을 이어가는 중요한 인물입니다.",
      sections: [
        {
          emoji: "1️⃣",
          title: "שְׁלֹשִׁים וּמְאַת שָׁנָה (셸로쉼 우메아트 샤나) - 백삼십 년",
          description: "아담이 셋을 낳은 나이가 130세라는 것은 가인의 범죄와 아벨의 죽음 이후 상당한 시간이 흘렀음을 의미합니다. 이 긴 세월 동안 아담은 죄의 결과와 슬픔을 경험했을 것입니다. 그러나 하나님은 셋을 통해 새로운 희망을 주셨습니다.",
          points: [
            "창세기 5장의 장수는 타락 이전 축복의 잔재를 보여줍니다",
            "아담의 130년은 가인의 범죄 이후 긴 슬픔의 기간이었을 것입니다",
            "하나님은 오래 기다리신 후에도 약속을 이루십니다"
          ],
          color: "purple" as const
        },
        {
          emoji: "2️⃣",
          title: "בִּדְמוּתוֹ כְּצַלְמוֹ (비드무토 케첼모) - 그의 형상대로 그의 모습대로",
          description: "놀랍게도 이 구절은 창세기 1:26의 '하나님의 형상대로'라는 표현을 그대로 사용합니다. 다만 여기서는 아담이 자기 형상대로 셋을 낳았다고 말합니다. 이는 하나님의 형상이 생물학적으로도 전달됨을 암시합니다.",
          points: [
            "하나님의 형상은 단지 영적인 것이 아니라 세대를 통해 전달됩니다",
            "부모와 자녀의 유사성은 하나님의 창조 질서의 일부입니다",
            "타락 후에도 하나님의 형상은 인류 안에 보존됩니다"
          ],
          color: "blue" as const
        },
        {
          emoji: "3️⃣",
          title: "שֵׁת (셋) - 대속자의 등장",
          description: "'셋'이라는 이름은 '두다', '놓다', '임명하다'를 의미하는 히브리어 동사 '쉬트'에서 유래합니다. 창세기 4:25에서 하와는 '하나님이 내게 가인이 죽인 아벨 대신 다른 씨를 주셨다'고 말하며 셋의 이름을 지었습니다. 셋은 의로운 계보의 시작입니다.",
          points: [
            "셋은 아벨을 대신하여 주어진 '대속자'입니다",
            "셋의 후손들은 '여호와의 이름을 부르기 시작했습니다'(창 4:26)",
            "노아, 아브라함, 예수 그리스도로 이어지는 구속사의 계보가 셋에서 시작됩니다"
          ],
          color: "green" as const
        }
      ],
      whyQuestion: {
        question: "왜 아담은 130살이나 되어서 셋을 낳았나요?",
        answer: "성경 시대 사람들은 지금보다 훨씬 오래 살았어요. 아담은 930살까지 살았거든요! 130살은 아담에게는 아직 젊은 나이였답니다. 하나님께서 아담에게 셋을 주신 것은 특별한 의미가 있어요. 가인이 동생 아벨을 죽인 후 아담과 하와는 무척 슬펐을 거예요. 하지만 하나님은 셋을 통해 다시 희망을 주셨어요. 셋은 아벨처럼 하나님을 사랑하는 사람이 되었고, 셋의 후손 중에서 나중에 예수님이 태어나셨답니다!",
        bibleReferences: [
          "창세기 4:25 - '아담이 다시 자기 아내와 동침하매 그가 아들을 낳아 그의 이름을 셋이라 하였으니 이는 하나님이 내게 가인이 죽인 아벨 대신에 다른 씨를 주셨다 함이며'",
          "창세기 4:26 - '셋도 아들을 낳고 그의 이름을 에노스라 하였으며 그 때에 사람들이 비로소 여호와의 이름을 불렀더라'",
          "누가복음 3:38 - '그 이상은 에노스요 그 이상은 셋이요 그 이상은 아담이요 그 이상은 하나님이시니라'",
          "창세기 5:5 - '아담의 살던 날이 구백삼십 년이라 그가 죽으니라'"
        ]
      },
      conclusion: {
        title: "💡 신학적 의미",
        content: "창세기 5:3은 구속사의 중요한 전환점을 나타냅니다. 가인의 계보(창 4:17-24)가 폭력과 세속성으로 특징지어진 반면, 셋의 계보는 하나님을 경외하는 신앙의 계보입니다. '형상과 모양대로'라는 표현은 타락 이후에도 하나님의 형상이 보존되어 전달됨을 보여줍니다. 궁극적으로 셋의 계보는 '마지막 아담'이신 예수 그리스도로 이어지며(눅 3:23-38), 그분 안에서 손상된 하나님의 형상이 완전히 회복됩니다. 셋은 그리스도의 예표로서, 죽음을 통과한 후에 주어진 새로운 생명을 상징합니다."
      }
    }
  }

  const outputPath = path.join(process.cwd(), 'data', 'generated_v2', `${verse.id}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), 'utf-8')
  console.log(`✅ ${outputPath} 생성 완료`)
}

generateGenesis5_1to3()
