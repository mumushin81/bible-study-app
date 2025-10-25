/**
 * FLUX Schnell 이미지 생성용 프롬프트 생성
 * 플래시카드 단어 중심으로 깊이있는 이미지 생성
 */

export interface WordInfo {
  hebrew: string
  meaning: string
  korean: string
  ipa?: string
  root?: string
  grammar?: string
  context?: string
}

/**
 * 히브리어 단어의 깊이있는 의미를 시각적으로 표현하는 프롬프트 생성
 */
export function generateWordImagePrompt(word: WordInfo): string {
  const { hebrew, meaning, korean, root, grammar, context } = word

  // 기본 스타일 설정 (9:16 모바일 플래시카드 - 예술성 + 동화 느낌)
  const baseStyle = `
Art style: CHILDREN'S STORYBOOK ILLUSTRATION meets FINE ART
          Sophisticated watercolor artistry with heartwarming charm
          Museum-quality spiritual illustration with playful wonder
          Like beloved children's Bible storybooks - magical and inviting
Medium: Professional watercolor and soft pastel
       Luminous translucent washes, gentle color bleeding
       Delicate layering, ethereal transparency
       Hand-painted artistic quality with warm friendly texture
       Storybook charm with gallery-worthy execution
Technique: SOPHISTICATED MINIMALISM with PLAYFUL WARMTH
          Masterful color harmony creating joyful emotional connection
          Flowing organic shapes with elegant simplicity and friendly appeal
          Advanced watercolor techniques: wet-on-wet, gradients, soft edges
          Rich color relationships create wonder and delight
          Poetic visual language that speaks to children's hearts
          Refined artistic expression with innocent magical quality
Composition: Vertical 9:16 mobile format
            Centered focal composition with artistic balance
            Generous negative space - elegant breathing room
            Sophisticated visual hierarchy and flow
            Professional artistic layout principles
Lighting: Luminous atmospheric light
         Soft ethereal glow with subtle color transitions
         Warm radiant ambiance, spiritually uplifting
         Delicate light effects enhancing depth
Quality: MUSEUM-QUALITY CHILDREN'S STORYBOOK ART
        Professional artistic sophistication with heartwarming charm
        Refined aesthetic sensibility that delights young hearts
        Timeless spiritual beauty meets playful wonder
        Gallery-worthy execution with beloved storybook appeal
        Like classic children's Bible illustrations - warm, magical, inviting
Colors: RICH DIVERSE BRIGHT PASTEL PALETTE - USE MANY COLORS
       Harmonious color theory: baby pink, sky blue, sunny yellow, mint green,
       soft lavender, peach, cream, warm coral, light turquoise, rose, aqua,
       butter yellow, powder blue, lilac, apricot, seafoam, blush
       DIVERSE COLOR VARIETY - incorporate multiple colors in each composition
       Advanced color relationships creating vibrant visual poetry
       Luminous glowing quality with professional color mixing
       Rich chromatic diversity with emotional resonance
       Bright yet refined, vibrant yet elegant
       Celebrate color abundance and joyful variety
Mood: PROFOUND SPIRITUAL WONDER with CHILDLIKE JOY
     Pure joy, deep peace, transcendent beauty
     Divine presence through artistic excellence and warm invitation
     Emotional depth through refined visual poetry
     Timeless sacred atmosphere meets playful magical delight
     Heartwarming, uplifting, full of innocent wonder
     Like opening a beloved children's Bible storybook - safe, magical, loving
Visual language: Sophisticated abstract forms
               Elegant organic shapes with artistic refinement
               Minimal elements with maximum expressive power
               Professional artistic symbolism
               Refined visual metaphors
               Pure forms conveying deep meaning
Overall feel: Fine art children's storybook illustration
            Profound yet accessible, refined yet warm and inviting
            Sophisticated artistic beauty with heartwarming charm
            Sacred wonder through masterful execution and playful magic
            Professional gallery-quality artwork that children adore
            Like classic beloved Bible storybooks - timeless, magical, comforting
            Artistic excellence meets innocent delight
  `.trim()

  // 단어의 의미를 깊이있게 표현하는 장면 설명 생성
  const sceneDescription = generateDeepMeaningDescription(word)

  // 문화적/신학적 맥락 추가
  const culturalContext = context
    ? `\n\nBiblical context: ${context}`
    : `\n\nThis word carries deep theological and cultural significance in Hebrew scripture.`

  // 최종 프롬프트 조합
  const prompt = `
Create a museum-quality children's storybook watercolor illustration representing: ${meaning}

VISUAL CONCEPT:
${sceneDescription}

${baseStyle}

ESSENTIAL ARTISTIC REQUIREMENTS:
- SOPHISTICATED MINIMALISM with PLAYFUL WARMTH - refined forms that delight children
- MASTERFUL WATERCOLOR TECHNIQUE - luminous washes, elegant color bleeding
- RICH COLOR DIVERSITY - use MANY DIFFERENT vibrant pastel colors creating joy
- DIVERSE COLOR PALETTE - incorporate multiple hues with storybook charm
- PROFESSIONAL COLOR HARMONY - advanced pastel relationships creating wonder
- GENEROUS NEGATIVE SPACE - elegant breathing room, friendly composition
- CENTERED ARTISTIC BALANCE - refined symmetry with welcoming appeal
- GALLERY-WORTHY STORYBOOK EXECUTION - museum-quality children's illustration
- PURE ABSTRACT FORMS - shapes and colors only, magical visual poetry
- HEARTWARMING CHARM - like beloved children's Bible storybooks
- Vertical 9:16 mobile format

SPIRITUAL AND ARTISTIC DEPTH:
This represents a sacred Hebrew concept from Genesis creation.
Convey profound biblical meaning through sophisticated artistic expression.
Pure innocent vision elevated through professional watercolor mastery.
Refined yet accessible. Simple yet profound. Elegant yet warm and inviting.
Maximum emotional and spiritual impact through artistic excellence.
Like classic children's Bible storybooks - timeless, magical, comforting.

Create SOPHISTICATED artistry, LUMINOUS beauty, PROFOUND spiritual depth.
Use DIVERSE VIBRANT COLORS - celebrate chromatic richness and variety.
Add STORYBOOK MAGIC - heartwarming, playful, delightful for children.
Pure visual art - shapes and colors only.
  `.trim()

  return prompt
}

/**
 * 단어의 의미를 깊이있게 분석하여 시각적 설명 생성
 */
function generateDeepMeaningDescription(word: WordInfo): string {
  const { meaning, hebrew, context } = word

  // 단어 의미에 따른 시각적 컨셉 생성
  const meaningLower = meaning.toLowerCase()

  // 키워드 기반 시각적 컨셉 매핑 (어린이 시점 + 밝은 파스텔)
  if (meaningLower.includes('하나님') || meaningLower.includes('god') || meaningLower.includes('elohim')) {
    return `Sophisticated centered luminous orb
DIVERSE WARM COLORS: golden yellow, peachy cream, soft apricot, butter yellow,
warm coral, gentle rose, light amber radiating with ethereal glow
Professional watercolor technique: soft radiant center bleeding into multiple warm hues
Elegant circular form symbolizing divine presence with rich color variation
Masterful multi-color gradients creating depth and warmth
Refined abstract representation of sacred light through chromatic richness
Pure minimalist beauty with profound meaning and color diversity
Gallery-quality spiritual symbolism celebrating warm color abundance`
  }

  if (meaningLower.includes('시작') || meaningLower.includes('beginning') || meaningLower.includes('창조')) {
    return `Sophisticated radial composition - luminous energy emanating from center
Professional watercolor technique: DIVERSE COLORS - baby pink, sunny yellow, mint green,
soft lavender, coral, aqua, peach, powder blue, rose bursting outward
Masterful color blending creating dynamic rainbow movement
Elegant radiating forms symbolizing cosmic genesis with rich chromatic variety
Advanced gradient work with abundant pastel harmonies
Refined abstract expression of primordial creative force through color diversity
Poetic visual metaphor through sophisticated multi-color relationships
Museum-quality spiritual artistry celebrating color abundance`
  }

  if (meaningLower.includes('빛') || meaningLower.includes('light')) {
    return `Elegant radiant composition - luminous rays in warm sunny yellow
Professional technique: soft peachy-gold beams with refined edges
Masterful use of light and color creating ethereal atmosphere
Sophisticated linear forms conveying divine illumination
Advanced watercolor glow effects with subtle gradients
Refined abstract representation of sacred light
Poetic minimalism with profound visual impact
Gallery-worthy luminous artistry`
  }

  if (meaningLower.includes('땅') || meaningLower.includes('earth') || meaningLower.includes('지구')) {
    return `Sophisticated landscape composition - gentle rolling forms
Professional watercolor: DIVERSE EARTH TONES - warm cream, sage green, soft ochre,
peach, mint, butter yellow, warm beige, apricot with elegant transitions
Masterful use of organic curves suggesting earthly solidity through color variety
Refined abstract hills with subtle textural depth and multiple color layers
Advanced multi-color harmony creating peaceful grounding
Generous negative space above enhancing contemplative mood
Poetic minimalism conveying fertile earth through chromatic richness
Museum-quality pastoral artistry with abundant color diversity`
  }

  if (meaningLower.includes('하늘') || meaningLower.includes('heaven') || meaningLower.includes('천국')) {
    return `Sophisticated atmospheric composition - ethereal cloud forms
Professional watercolor: DIVERSE SOFT COLORS - peachy-pink, cream, soft lavender,
powder blue, gentle aqua, blush, lilac creating celestial richness
Masterful soft edges with delicate translucency and multiple color layers
Refined abstract representation of celestial realm with chromatic variety
Advanced wet-on-wet technique creating dreamy multi-colored quality
Generous open space enhancing spiritual lightness through color diversity
Poetic visual metaphor for divine transcendence with abundant hues
Gallery-quality heavenly artistry celebrating color richness`
  }

  if (meaningLower.includes('물') || meaningLower.includes('water')) {
    return `Sophisticated flowing composition - elegant undulating forms
Professional watercolor: aqua and mint blue with luminous transparency
Masterful curved lines suggesting liquid movement
Refined abstract waves with graceful rhythm
Advanced layering technique creating depth and flow
Poetic minimalism conveying fluid serenity
Cool pastel harmony with emotional resonance
Museum-quality aquatic artistry`
  }

  if (meaningLower.includes('사람') || meaningLower.includes('man') || meaningLower.includes('인간') || meaningLower.includes('아담')) {
    return `Sophisticated horizon composition - earth meeting sky
Professional watercolor: warm cream below, soft blue above
Masterful color transition at meeting point
Refined abstract symbolism of earthly and divine union
Advanced gradient technique creating harmonious balance
Elegant horizontal division with profound meaning
Poetic representation of human dignity
Gallery-quality metaphorical artistry`
  }

  if (meaningLower.includes('생명') || meaningLower.includes('life')) {
    return `Sophisticated organic composition - elegant upward growth
Professional watercolor: soft green stem, pink or lavender bloom
Masterful botanical abstraction with refined simplicity
Elegant vertical form symbolizing vital force
Advanced color harmony creating sense of flourishing
Poetic minimalism conveying essence of living energy
Refined symbolic representation of divine vitality
Museum-quality botanical artistry`
  }

  if (meaningLower.includes('말씀') || meaningLower.includes('언어')) {
    return `Sophisticated radiating composition - flowing golden-peach waves
Professional watercolor: warm luminous curves emanating outward
Masterful representation of divine communication
Elegant concentric forms with rhythmic harmony
Advanced gradient technique creating sense of sacred speech
Poetic visual metaphor for spiritual transmission
Refined abstract symbolism of divine expression
Gallery-quality metaphysical artistry`
  }

  // 기본 설명 (특정 키워드 매칭 안될 경우)
  return `Sophisticated minimalist composition representing ${meaning}
Professional watercolor: refined essential forms
Advanced pastel palette - pink, blue, yellow, mint, lavender, cream
${context ? context + ', ' : ''}
Masterful color harmony with artistic depth
Elegant abstract symbolism with profound meaning
Generous negative space enhancing contemplation
Centered refined composition
Museum-quality poetic artistry`
}

/**
 * 간단한 프롬프트 생성 (테스트용)
 */
export function generateSimplePrompt(description: string): string {
  return `
${description}

Art style: watercolor painting, spiritual, biblical illustration
Lighting: divine golden rays, soft ethereal glow
Quality: highly detailed, 4k, professional artwork
Mood: peaceful, sacred, contemplative
  `.trim()
}
