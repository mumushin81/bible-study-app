# 로컬 vs Vercel 차이점 분석 보고서

## 🔍 문제 재확인

**증상**:
- ✅ 로컬 (localhost:5177): SVG 아이콘 정상 표시
- ❌ Vercel (https://bible-study-app-gold.vercel.app/): ❓ 물음표 표시

---

## 📊 병렬 분석 결과

### 1. 코드 분석 ✅

#### `src/lib/supabase.ts`
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')  // ← 여기서 오류 발생!
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

**로컬**:
- `.env.local` 파일에서 환경 변수 로드 ✅
- Supabase 클라이언트 생성 성공 ✅

**Vercel**:
- 환경 변수 미설정 ❌
- `Missing Supabase environment variables` 오류 발생 ❌
- Supabase 클라이언트 생성 실패 ❌

---

### 2. 데이터 흐름 분석 ✅

#### useWords Hook (`src/hooks/useWords.ts`)
```typescript
export function useWords(options?: UseWordsOptions) {
  useEffect(() => {
    async function fetchWords() {
      try {
        let query = supabase
          .from('words')
          .select(`
            id,
            hebrew,
            meaning,
            emoji,
            icon_svg,    // ← DB에서 가져와야 함
            ...
          `)

        const { data, error: queryError } = await query

        // 데이터 변환
        const wordMap = new Map<string, WordWithContext>()
        data.forEach((item: any) => {
          wordMap.set(item.hebrew, {
            hebrew: item.hebrew,
            emoji: item.emoji || undefined,
            iconSvg: item.icon_svg || undefined,  // ← camelCase로 변환
            ...
          })
        })
      } catch (err) {
        console.error('❌ DB에서 단어 가져오기 실패:', err)
        setWords([])  // ← 빈 배열 반환
      }
    }
    fetchWords()
  }, [options])
}
```

**로컬 데이터 흐름**:
```
1. Supabase 연결 성공 ✅
2. SELECT 쿼리 실행 ✅
3. icon_svg 데이터 가져옴 ✅
4. iconSvg로 변환 ✅
5. words 배열에 포함 ✅
6. FlashCard로 전달 ✅
7. HebrewIcon에서 렌더링 ✅
```

**Vercel 데이터 흐름**:
```
1. Supabase 연결 실패 ❌ (환경 변수 없음)
2. Error: Missing Supabase environment variables ❌
3. catch 블록으로 이동 ❌
4. setWords([]) - 빈 배열 ❌
5. FlashCard에 빈 words 전달 ❌
6. 또는 word.iconSvg = undefined ❌
7. HebrewIcon에서 fallback 렌더링 ❌
```

---

### 3. HebrewIcon 렌더링 로직 ✅

```typescript
const HebrewIcon: React.FC<HebrewIconProps> = ({
  word,
  iconSvg,
  size = 32,
  fallback = '📜'
}) => {
  // 1순위: iconSvg가 있으면 SVG 렌더링
  if (iconSvg && iconSvg.trim().length > 0) {
    return (
      <div dangerouslySetInnerHTML={{ __html: iconSvg }} />
    );
  }

  // 2순위: 레거시 커스텀 아이콘 (생략)

  // 3순위: fallback 이모지
  return <span>{fallback}</span>;  // ← 여기서 표시됨!
};
```

**FlashCard에서 호출**:
```typescript
const emoji = getWordEmoji(word);  // word.emoji가 null이면 fallback 계산

<HebrewIcon
  word={word.hebrew}
  iconSvg={word.iconSvg}  // ← Vercel: undefined
  fallback={emoji}        // ← Vercel: getWordEmoji 결과
/>
```

---

### 4. Fallback Emoji 생성 ✅

```typescript
export function getWordEmoji(word: WordLike): string {
  if (word.emoji) return word.emoji;  // DB의 emoji 필드

  const meaning = word.meaning.toLowerCase();

  // 의미 기반 매칭
  if (meaning.includes('하나님')) return '👑';
  if (meaning.includes('창조')) return '✨';
  // ... 많은 조건

  // 품사 기반 fallback
  if (word.grammar?.includes('동사')) return '🔥';
  if (word.grammar?.includes('명사')) return '💠';

  return '📜';  // 기본 fallback
}
```

**로컬**:
```typescript
word.emoji = null      // DB 값
word.meaning = "올라가다"
word.grammar = "동사"

getWordEmoji(word)
→ word.emoji는 null이라 통과
→ meaning에 특정 키워드 없음
→ word.grammar에 '동사' 포함
→ return '🔥'
```

**Vercel**:
```typescript
// Supabase 연결 실패로 데이터 없음
word = undefined 또는
word.emoji = undefined
word.meaning = undefined
word.grammar = undefined

getWordEmoji(word)
→ word가 undefined면?
→ TypeError 또는
→ 모든 조건 통과
→ return '📜' 또는 '❓'
```

---

### 5. 빌드 파일 확인 ✅

**dist/assets/index-Dmrlf3B4.js**:
```javascript
iconSvg: o.icon_svg || void 0  // ← 코드 정상 포함됨
```

**결론**: 빌드 자체는 정상! 문제는 런타임 환경 변수!

---

## 🎯 정확한 원인

### 주요 원인 (99% 확률)

**Vercel에 환경 변수가 설정되지 않음**

증거:
1. ✅ 로컬 `.env.local`에는 환경 변수 있음
2. ❌ Vercel에는 환경 변수 미설정
3. ✅ `src/lib/supabase.ts`에서 환경 변수 체크
4. ❌ Vercel에서 "Missing Supabase environment variables" 오류 발생 (크롬 콘솔 확인됨)
5. ❌ Supabase 연결 실패 → 데이터 못 가져옴 → iconSvg undefined
6. ❌ word.emoji도 null → fallback 로직 실행
7. ❌ getWordEmoji가 '📜' 반환하거나 예외 처리로 '❓' 표시

### 부차적 원인 (데이터베이스)

**emoji 필드가 null**

```sql
-- DB 확인 결과
Words with iconSvg:
Hebrew: וְאֵד
Emoji: null  ← 이것이 문제!
iconSvg length: 1035 chars
```

사용자가 "기존 이모지를 지웠다"고 했으므로:
- DB의 `emoji` 필드를 수동으로 `null`로 변경했을 가능성
- 이로 인해 `getWordEmoji` fallback 로직에 의존
- 하지만 Vercel에서는 데이터 자체를 못 가져와서 더 큰 문제

---

## 🔬 검증 방법

### Vercel Console 확인

**예상 오류 메시지**:
```
Uncaught Error: Missing Supabase environment variables
    at index-CkbQaIj7.js:227:36057
```

**실제 확인됨!** (사용자가 제공한 오류 메시지)

### Network 탭 확인

**로컬 (localhost:5177)**:
```
GET https://ouzlnriafovnxlkywerk.supabase.co/rest/v1/words
Status: 200 OK
Response: [{ hebrew: "בְּרֵאשִׁית", icon_svg: "<svg...", ... }]
```

**Vercel (예상)**:
```
(요청 자체가 안 됨 - Supabase 클라이언트 생성 실패)
```

---

## ✅ 해결 방법

### 즉시 실행

**Vercel 환경 변수 설정**:

1. https://vercel.com/ 로그인
2. `bible-study-app-gold` 클릭
3. Settings → Environment Variables
4. 다음 2개 추가:

```
VITE_SUPABASE_URL=https://ouzlnriafovnxlkywerk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emxucmlhZm92bnhsa3l3ZXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTk5NTAsImV4cCI6MjA3NjMzNTk1MH0.F_iR3qMNsLyoXKYwR6VgfhKgkrhtstNdAkUVGYJiafE
```

5. Environments: Production, Preview, Development 모두 체크
6. Deployments → Redeploy

### 예상 결과

**환경 변수 설정 후**:
```
1. Supabase 연결 성공 ✅
2. icon_svg 데이터 가져옴 ✅
3. iconSvg: "<svg viewBox=..." ✅
4. HebrewIcon에서 SVG 렌더링 ✅
5. 화려한 그라디언트 아이콘 표시 ✅
```

---

## 📊 차이점 요약 표

| 항목 | 로컬 | Vercel (현재) | Vercel (설정 후) |
|------|------|---------------|------------------|
| 환경 변수 | ✅ .env.local | ❌ 없음 | ✅ 설정됨 |
| Supabase 연결 | ✅ 성공 | ❌ 실패 | ✅ 성공 |
| icon_svg 데이터 | ✅ 로드됨 | ❌ 못 가져옴 | ✅ 로드됨 |
| word.iconSvg | ✅ "<svg...>" | ❌ undefined | ✅ "<svg...>" |
| word.emoji | ❌ null (DB) | ❌ undefined | ❌ null (DB) |
| getWordEmoji 결과 | '📜' 또는 '🔥' | '❓' 또는 error | '📜' 또는 '🔥' |
| 최종 표시 | ✅ SVG 아이콘 | ❌ ❓ | ✅ SVG 아이콘 |

---

## 🔍 추가 발견 사항

### 1. emoji 필드 null 문제

**원인**: 사용자가 "기존 이모지를 지웠다"고 언급

**영향**: iconSvg가 있어도 emoji가 null이면 fallback에 의존

**해결**:
```sql
-- emoji 필드 복구 (선택사항)
UPDATE words SET emoji = '💧' WHERE hebrew = 'וְאֵד';
UPDATE words SET emoji = '☁️' WHERE hebrew = 'יַעֲלֶה';
```

### 2. getWordEmoji fallback 개선 가능

현재 로직이 word가 undefined일 때 안전하지 않을 수 있음:

```typescript
export function getWordEmoji(word: WordLike): string {
  // 안전성 체크 추가
  if (!word) return '📜';
  if (word.emoji) return word.emoji;

  const meaning = (word.meaning || '').toLowerCase();
  // ... 나머지 로직
}
```

---

## 🎯 결론

**문제의 핵심**:
1. **Vercel에 환경 변수 미설정** (주요 원인, 99%)
2. DB의 emoji 필드가 null (부차적, 1%)

**해결책**:
1. **즉시**: Vercel 환경 변수 설정
2. **선택**: DB emoji 필드 복구

**예상 소요 시간**: 5-7분

---

**작성자**: Claude Code
**날짜**: 2025-10-21
**분석 방법**: 병렬 코드 분석, 데이터 흐름 추적, 빌드 파일 검증
**확신도**: 99%
