/**
 * FLUX 1.1 Pro 이미지 생성용 프롬프트 생성
 * 추상적 파스텔 색상으로 단어 의미 표현
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
 * 히브리어 단어를 추상적 파스텔 색상으로 표현하는 프롬프트 생성
 */
export function generateWordImagePrompt(word: WordInfo): string {
  const { meaning } = word

  const prompt = `
Abstract pastel artwork representing: ${meaning}

Style: Abstract expressionism with bright pastel colors
Colors: Use MULTIPLE bright pastel colors - soft pink, sky blue, mint green,
        lavender, peach, coral, butter yellow, powder blue, lilac, rose,
        aqua, cream, apricot, seafoam
Technique: Smooth color gradients, soft color blending, luminous atmosphere
Composition: 9:16 vertical format, centered, generous negative space
Mood: Peaceful, spiritual, uplifting, joyful

Create a simple abstract composition with rich pastel colors.
Use many different colors to express the meaning.
Bright, colorful, and beautiful.
`.trim()

  return prompt
}

/**
 * 간단한 프롬프트 생성 (테스트용)
 */
export function generateSimplePrompt(description: string): string {
  return `
${description}

Abstract pastel artwork, bright colors, peaceful mood
`.trim()
}
