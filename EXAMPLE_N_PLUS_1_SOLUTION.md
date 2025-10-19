# N+1 쿼리 개선 예시

## 현재 코드 (src/hooks/useVerses.ts)

```typescript
// ❌ N+1 문제 발생 (63번 쿼리)
const versesWithDetails = await Promise.all(
  versesData.map(async (verse) => {
    const { data: wordsData } = await supabase
      .from('words')
      .eq('verse_id', verse.id)  // 31번 실행

    const { data: commentaryData } = await supabase
      .from('commentaries')
      .eq('verse_id', verse.id)  // 31번 실행

    return { ...verse, words: wordsData, commentary: commentaryData }
  })
)
```

## 개선된 코드

```typescript
// ✅ 3번 쿼리로 축소
async function fetchVersesOptimized(bookId: string, chapter: number) {
  // 1. 모든 구절 가져오기
  const { data: verses, error: versesError } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', bookId)
    .eq('chapter', chapter)
    .order('verse_number', { ascending: true })

  if (versesError || !verses?.length) {
    return []
  }

  const verseIds = verses.map(v => v.id)

  // 2. 모든 단어 한 번에 가져오기 (IN 절 사용)
  const { data: allWords } = await supabase
    .from('words')
    .select('*')
    .in('verse_id', verseIds)
    .order('position', { ascending: true })

  // 3. 모든 주석 한 번에 가져오기
  const { data: allCommentaries } = await supabase
    .from('commentaries')
    .select(`
      id,
      verse_id,
      intro,
      commentary_sections!inner (*),
      why_questions (*),
      commentary_conclusions (*)
    `)
    .in('verse_id', verseIds)

  // 4. 메모리에서 조합 (DB 쿼리 없음)
  const versesWithDetails = verses.map(verse => {
    // JavaScript 배열 필터링 (매우 빠름)
    const words = (allWords || [])
      .filter(w => w.verse_id === verse.id)
      .map(w => ({
        hebrew: w.hebrew,
        meaning: w.meaning,
        ipa: w.ipa,
        korean: w.korean,
        root: w.root,
        grammar: w.grammar,
        structure: w.structure,
        emoji: w.emoji,
        category: w.category,
      }))

    // 주석 찾기 (O(n) 검색이지만 n=31이므로 빠름)
    const commentaryRaw = (allCommentaries || [])
      .find(c => c.verse_id === verse.id)

    let commentary: Commentary | undefined
    if (commentaryRaw) {
      const sections = (commentaryRaw.commentary_sections || [])
        .sort((a, b) => a.position - b.position)
        .map(s => ({
          emoji: s.emoji,
          title: s.title,
          description: s.description,
          points: s.points,
          color: s.color,
        }))

      const whyQuestion = commentaryRaw.why_questions?.[0]
      const conclusion = commentaryRaw.commentary_conclusions?.[0]

      commentary = {
        intro: commentaryRaw.intro,
        sections,
        whyQuestion: whyQuestion ? {
          question: whyQuestion.question,
          answer: whyQuestion.answer,
          bibleReferences: whyQuestion.bible_references,
        } : undefined,
        conclusion: conclusion ? {
          title: conclusion.title,
          content: conclusion.content,
        } : undefined,
      }
    }

    return {
      id: verse.id,
      reference: verse.reference,
      hebrew: verse.hebrew,
      ipa: verse.ipa,
      koreanPronunciation: verse.korean_pronunciation,
      modern: verse.modern,
      literal: verse.literal,
      translation: verse.translation,
      words,
      commentary,
    }
  })

  return versesWithDetails
}
```

## 성능 비교

### 쿼리 횟수
- 현재: 63번 (1 + 31 + 31)
- 개선: 3번 (1 + 1 + 1)
- **개선율: 95.2% 감소**

### 예상 실행 시간 (Supabase, RTT 50ms 기준)
- 현재: ~3,150ms (3.15초)
- 개선: ~150ms (0.15초)
- **속도: 21배 빠름**

### 네트워크 오버헤드
- 현재: 63KB (HTTP 헤더)
- 개선: 3KB
- **대역폭: 95% 절감**

## 추가 최적화

### 1. 인덱스 추가 (선택사항)
```sql
-- words 테이블 성능 향상
CREATE INDEX idx_words_verse_id ON words(verse_id);

-- commentaries 테이블 성능 향상
CREATE INDEX idx_commentaries_verse_id ON commentaries(verse_id);
```

### 2. 캐싱 추가
```typescript
import { useQuery } from '@tanstack/react-query'

export function useVerses(bookId: string, chapter: number) {
  return useQuery({
    queryKey: ['verses', bookId, chapter],
    queryFn: () => fetchVersesOptimized(bookId, chapter),
    staleTime: 5 * 60 * 1000, // 5분간 캐시
  })
}
```

### 3. Supabase의 관계 조회 활용
```typescript
// Supabase는 foreign key를 자동으로 JOIN 가능
const { data: verses } = await supabase
  .from('verses')
  .select(`
    *,
    words (*),
    commentaries (
      *,
      commentary_sections (*),
      why_questions (*),
      commentary_conclusions (*)
    )
  `)
  .eq('book_id', bookId)
  .eq('chapter', chapter)

// 이 방법도 내부적으로는 JOIN을 사용하므로 1번의 쿼리로 모든 데이터 획득!
```

## 결론

N+1 쿼리 문제는 ORM/데이터 접근 계층에서 매우 흔한 성능 문제입니다.
- **문제**: 루프 안에서 개별 쿼리 실행
- **해결**: IN 절 또는 JOIN을 사용한 일괄 조회
- **효과**: 21배 속도 향상, 95% 쿼리 감소
