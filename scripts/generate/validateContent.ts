import type { GeneratedContent, ValidationResult } from './types.js'

/**
 * 생성된 컨텐츠를 검증
 */
export function validateContent(content: GeneratedContent): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 1. 필수 필드 존재 확인
  if (!content.verseId) errors.push('verseId가 없습니다')
  if (!content.ipa) errors.push('ipa가 없습니다')
  if (!content.koreanPronunciation) errors.push('koreanPronunciation이 없습니다')
  if (!content.modern) errors.push('modern이 없습니다')

  // 2. Words 검증
  if (!content.words || content.words.length === 0) {
    errors.push('words 배열이 비어있습니다')
  } else {
    content.words.forEach((word, idx) => {
      const prefix = `words[${idx}]`

      // 필수 필드
      if (!word.hebrew) errors.push(`${prefix}: hebrew가 없습니다`)
      if (!word.meaning) errors.push(`${prefix}: meaning이 없습니다`)
      if (!word.ipa) errors.push(`${prefix}: ipa가 없습니다`)
      if (!word.korean) errors.push(`${prefix}: korean이 없습니다`)
      if (!word.root) errors.push(`${prefix}: root가 없습니다`)
      if (!word.grammar) errors.push(`${prefix}: grammar가 없습니다`)
      if (!word.emoji) errors.push(`${prefix}: emoji가 없습니다`)

      // root 형식 검증: "히브리어 (한글)" 형식인지 확인
      if (word.root && !word.root.includes('(') && !word.root.includes(')')) {
        warnings.push(`${prefix}: root가 "히브리어 (한글)" 형식이 아닐 수 있습니다`)
      }

      // category 값 검증
      if (word.category) {
        const validCategories = ['noun', 'verb', 'adjective', 'preposition', 'particle']
        if (!validCategories.includes(word.category)) {
          errors.push(`${prefix}: category가 유효하지 않습니다 (${word.category})`)
        }
      }
    })

    // 단어 수 합리성 체크
    if (content.words.length < 2) {
      warnings.push(`단어 수가 너무 적습니다 (${content.words.length}개)`)
    } else if (content.words.length > 20) {
      warnings.push(`단어 수가 너무 많습니다 (${content.words.length}개)`)
    }
  }

  // 3. Commentary 검증
  if (!content.commentary) {
    errors.push('commentary가 없습니다')
  } else {
    const { commentary } = content

    // intro
    if (!commentary.intro) {
      errors.push('commentary.intro가 없습니다')
    } else if (commentary.intro.length < 20) {
      warnings.push('commentary.intro가 너무 짧습니다')
    }

    // sections
    if (!commentary.sections || commentary.sections.length === 0) {
      errors.push('commentary.sections가 비어있습니다')
    } else {
      // 섹션 수 검증
      if (commentary.sections.length < 2) {
        warnings.push(`섹션 수가 너무 적습니다 (${commentary.sections.length}개, 권장: 2-4개)`)
      } else if (commentary.sections.length > 4) {
        warnings.push(`섹션 수가 너무 많습니다 (${commentary.sections.length}개, 권장: 2-4개)`)
      }

      commentary.sections.forEach((section, idx) => {
        const prefix = `sections[${idx}]`

        // 필수 필드
        if (!section.emoji) errors.push(`${prefix}: emoji가 없습니다`)
        if (!section.title) errors.push(`${prefix}: title이 없습니다`)
        if (!section.description) errors.push(`${prefix}: description이 없습니다`)
        if (!section.points || section.points.length === 0) {
          errors.push(`${prefix}: points가 비어있습니다`)
        }
        if (!section.color) errors.push(`${prefix}: color가 없습니다`)

        // 제목 형식 검증: "히브리어 (한글) - 설명" 형식
        if (section.title) {
          const hasHebrew = /[\u0590-\u05FF]/.test(section.title)
          const hasParens = section.title.includes('(') && section.title.includes(')')
          const hasDash = section.title.includes(' - ')

          if (!hasHebrew) {
            errors.push(`${prefix}: title에 히브리어가 없습니다`)
          }
          if (!hasParens) {
            errors.push(`${prefix}: title에 괄호 (한글 발음)이 없습니다`)
          }
          if (!hasDash) {
            errors.push(`${prefix}: title에 " - "가 없습니다`)
          }
        }

        // points 개수 검증
        if (section.points && (section.points.length < 2 || section.points.length > 5)) {
          warnings.push(`${prefix}: points 개수가 적절하지 않습니다 (${section.points.length}개, 권장: 3-4개)`)
        }

        // color 값 검증
        const validColors = ['purple', 'blue', 'green', 'pink', 'orange', 'yellow']
        if (section.color && !validColors.includes(section.color)) {
          errors.push(`${prefix}: color가 유효하지 않습니다 (${section.color})`)
        }
      })

      // 색상 중복 검증
      const colors = commentary.sections.map(s => s.color)
      const uniqueColors = new Set(colors)
      if (colors.length !== uniqueColors.size) {
        warnings.push('섹션 색상이 중복됩니다. 각 섹션은 다른 색상을 사용하는 것이 좋습니다')
      }
    }

    // whyQuestion
    if (!commentary.whyQuestion) {
      errors.push('commentary.whyQuestion이 없습니다')
    } else {
      const { whyQuestion } = commentary

      if (!whyQuestion.question) errors.push('whyQuestion.question이 없습니다')
      if (!whyQuestion.answer) errors.push('whyQuestion.answer이 없습니다')
      if (!whyQuestion.bibleReferences || whyQuestion.bibleReferences.length === 0) {
        errors.push('whyQuestion.bibleReferences가 비어있습니다')
      } else {
        // bibleReferences 형식 검증: "책 장:절 - '인용문'" 형식
        whyQuestion.bibleReferences.forEach((ref, idx) => {
          if (!ref.includes(' - ')) {
            warnings.push(`bibleReferences[${idx}]: " - " 구분자가 없습니다`)
          }
          if (!ref.includes(':')) {
            warnings.push(`bibleReferences[${idx}]: 장:절 형식이 아닙니다`)
          }
        })

        // 개수 검증
        if (whyQuestion.bibleReferences.length < 2) {
          warnings.push(`bibleReferences 개수가 적습니다 (${whyQuestion.bibleReferences.length}개, 권장: 2-4개)`)
        } else if (whyQuestion.bibleReferences.length > 5) {
          warnings.push(`bibleReferences 개수가 많습니다 (${whyQuestion.bibleReferences.length}개, 권장: 2-4개)`)
        }
      }
    }

    // conclusion
    if (!commentary.conclusion) {
      errors.push('commentary.conclusion이 없습니다')
    } else {
      const { conclusion } = commentary

      if (!conclusion.title) {
        errors.push('conclusion.title이 없습니다')
      } else if (conclusion.title !== '💡 신학적 의미') {
        warnings.push(`conclusion.title이 "💡 신학적 의미"가 아닙니다 (현재: "${conclusion.title}")`)
      }

      if (!conclusion.content) {
        errors.push('conclusion.content가 없습니다')
      } else if (conclusion.content.length < 20) {
        warnings.push('conclusion.content가 너무 짧습니다')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * 검증 결과를 출력
 */
export function printValidationResult(verseId: string, result: ValidationResult): void {
  if (result.isValid) {
    console.log(`✅ ${verseId}: 검증 통과`)
  } else {
    console.log(`❌ ${verseId}: 검증 실패`)
  }

  if (result.errors.length > 0) {
    console.log('\n  오류:')
    result.errors.forEach(err => console.log(`    - ${err}`))
  }

  if (result.warnings.length > 0) {
    console.log('\n  경고:')
    result.warnings.forEach(warn => console.log(`    - ${warn}`))
  }

  if (result.errors.length > 0 || result.warnings.length > 0) {
    console.log('')
  }
}
