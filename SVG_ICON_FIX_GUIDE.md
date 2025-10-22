# SVG 아이콘 표시 문제 해결 가이드

## 문제 증상

- **로컬 개발 환경**: SVG 아이콘 정상 표시
- **Vercel 프로덕션**: 물음표(❓) 또는 이모지 표시, SVG 미표시

## 근본 원인

### 핵심 문제: useVerses.ts의 데이터 매핑 오류

```typescript
// ❌ 문제 코드 (커밋 1b64ea6 이전)
{
  hebrew: w.hebrew,
  meaning: w.meaning,
  // ...
  iconSvg: undefined,  // ← 하드코딩으로 항상 undefined
  // ...
}
```

**원인 분석**:
1. 데이터베이스 SELECT 쿼리에서는 `icon_svg` 정상 fetch ✅
2. **BUT** Word 객체로 매핑 시 `iconSvg: undefined`로 하드코딩 ❌
3. 프론트엔드 컴포넌트는 항상 `iconSvg: undefined` 수신
4. HebrewIcon 컴포넌트에서 fallback 처리 → 물음표(❓) 표시

### 부가적 문제들

#### 1. React Hydration Mismatch (커밋 1b64ea6에서 수정)
```typescript
// ❌ 문제: Math.random()으로 ID 생성
const uniqueId = `${word}-${Math.random().toString(36).substr(2, 9)}`;

// ✅ 해결: React 18 useId() 사용
const reactId = useId();
const uniqueId = `${word}-${reactId.replace(/:/g, '-')}`;
```

**문제점**: 
- 서버 렌더링 시 ID: `bara-abc123`
- 클라이언트 Hydration 시 ID: `bara-xyz789`
- SVG gradient 참조 불일치 → 렌더링 실패

#### 2. Legacy 하드코딩 아이콘 우선순위 (커밋 95887f2에서 수정)
```typescript
// ❌ 문제: 4개 단어가 하드코딩되어 DB SVG 무시
export const HebrewIcons: Record<string, string> = {
  'בְּרֵאשִׁית': 'BereshitIcon',
  'אֱלֹהִים': 'ElohimIcon',
  'בָּרָא': 'BaraIcon',
  'אוֹר': 'OrIcon',
}

// ✅ 해결: 하드코딩 제거, DB SVG 우선
export const HebrewIcons: Record<string, string> = {
  // 모두 주석 처리
}
```

## 최종 수정 사항

### 1. useVerses.ts - 데이터 매핑 수정 (커밋 d27d797)

```typescript
// ✅ 수정 후
{
  hebrew: w.hebrew,
  meaning: w.meaning,
  ipa: w.ipa,
  korean: w.korean,
  letters: w.letters || undefined,          // ← DB에서 가져온 값 사용
  root: w.root,
  grammar: w.grammar,
  emoji: w.emoji || '❓',
  iconSvg: w.icon_svg || undefined,         // ← DB에서 가져온 값 사용
  structure: w.structure || undefined,
  category: (w.category as any) || undefined,
}
```

**핵심**: 
- SELECT 쿼리에 `icon_svg, letters` 포함 ✅
- 매핑 시 `w.icon_svg` 실제 값 사용 ✅

### 2. database.types.ts - 타입 정의 추가

```typescript
words: {
  Row: {
    // ...
    icon_svg: string | null    // ← 추가
    letters: string | null     // ← 추가
    // ...
  }
}
```

### 3. HebrewIcon.tsx - useId() 사용

```typescript
const reactId = useId();  // React 18 SSR-safe ID

const uniqueSvg = useMemo(() => {
  const uniqueId = `${word.replace(/[^a-zA-Z0-9]/g, '')}-${reactId.replace(/:/g, '-')}`;
  // SVG ID 충돌 방지
}, [iconSvg, word, reactId]);
```

### 4. icons/index.ts - 레거시 아이콘 제거

```typescript
export const HebrewIcons: Record<string, string> = {
  // 'בְּרֵאשִׁית': 'BereshitIcon',  // 제거
  // 'אֱלֹהִים': 'ElohimIcon',        // 제거
  // 'בָּרָא': 'BaraIcon',            // 제거
  // 'אוֹר': 'OrIcon',                // 제거
} as const;
```

## 검증 방법

### 1. 데이터베이스 확인
```bash
npx tsx scripts/checkIconSvgInDB.ts
```

**기대 결과**:
```
Genesis 1:1: 7개 단어 모두 icon_svg 존재 (100%)
전체: 816/1516 단어가 SVG 보유 (53.8%)
```

### 2. 브라우저 콘솔 확인 (디버그 로그)

```javascript
// useWords.ts 로그
[useWords] בְּרֵאשִׁית (태초에, 처음에): icon_svg=EXISTS, emoji=NULL

// HebrewIcon.tsx 로그
[HebrewIcon] ✅ SVG generated for word: בְּרֵאשִׁית, length: 1234
```

### 3. 로컬 vs Vercel 비교

| 항목 | 로컬 (npm run dev) | Vercel 프로덕션 |
|------|-------------------|----------------|
| SVG 표시 | ✅ 정상 | ✅ 정상 (수정 후) |
| icon_svg 데이터 | ✅ 로드됨 | ✅ 로드됨 (수정 후) |
| Hydration | ✅ 일치 | ✅ 일치 (useId 적용 후) |

## 문제 해결 체크리스트

SVG 아이콘이 표시되지 않을 때 다음을 확인하세요:

### 1단계: 데이터베이스 확인
- [ ] `words` 테이블에 `icon_svg` 컬럼이 존재하는가?
- [ ] 해당 단어에 `icon_svg` 데이터가 NULL이 아닌가?
- [ ] SVG 형식이 유효한가? (`<svg viewBox="0 0 64 64" ...`)

### 2단계: 백엔드 쿼리 확인 (useVerses.ts, useWords.ts)
- [ ] SELECT 쿼리에 `icon_svg` 필드가 포함되어 있는가?
- [ ] 매핑 시 `iconSvg: w.icon_svg`로 실제 값을 사용하는가?
- [ ] **하드코딩으로 `iconSvg: undefined`를 쓰지 않았는가?** ⚠️

### 3단계: 타입 정의 확인 (database.types.ts)
- [ ] `words` 테이블 타입에 `icon_svg: string | null` 추가?
- [ ] Supabase 타입 재생성 필요? (`npx supabase gen types`)

### 4단계: 프론트엔드 컴포넌트 확인 (HebrewIcon.tsx)
- [ ] `useId()` 사용하여 SSR-safe ID 생성?
- [ ] `Math.random()` 사용하지 않는가? ⚠️
- [ ] SVG ID replacement 로직이 올바른가?

### 5단계: 레거시 아이콘 확인 (icons/index.ts)
- [ ] `HebrewIcons` 맵에 하드코딩된 단어가 없는가?
- [ ] DB SVG 우선순위가 최상위인가?

### 6단계: 환경변수 확인
- [ ] Vercel에 `VITE_SUPABASE_URL` 설정됨?
- [ ] Vercel에 `VITE_SUPABASE_ANON_KEY` 설정됨?

### 7단계: 캐싱 확인
- [ ] 브라우저 캐시 강제 새로고침? (Ctrl+Shift+R)
- [ ] Vercel 배포가 최신 커밋인가?

## 디버깅 팁

### 콘솔 로그 추가

**useWords.ts**:
```typescript
const hasIconSvg = !!item.icon_svg;
console.log(`[useWords] ${item.hebrew}: icon_svg=${hasIconSvg ? 'EXISTS' : 'NULL'}`);
```

**HebrewIcon.tsx**:
```typescript
if (!iconSvg || iconSvg.trim().length === 0) {
  console.log(`[HebrewIcon] No SVG for word: ${word}, iconSvg:`, iconSvg);
  return null;
}
console.log(`[HebrewIcon] ✅ SVG generated for word: ${word}, length: ${processedSvg.length}`);
```

### Chrome DevTools Network 탭

1. Network 탭 열기
2. Fetch/XHR 필터
3. Supabase API 요청 확인
4. Response에 `icon_svg` 필드가 포함되어 있는지 확인

### React DevTools

1. Components 탭 열기
2. `HebrewIcon` 컴포넌트 선택
3. Props에서 `iconSvg` 값 확인
4. `undefined` 또는 `null`이면 **데이터 매핑 문제**

## 관련 커밋

- `95887f2`: Legacy 하드코딩 아이콘 제거
- `1b64ea6`: useId() 적용으로 Hydration Mismatch 해결
- `d27d797`: **useVerses.ts 데이터 매핑 수정 (핵심 수정)**

## 결론

**가장 흔한 실수**: 
데이터베이스에서 `icon_svg`를 fetch했지만, 객체 매핑 시 하드코딩으로 `undefined`를 설정하는 실수.

**해결 방법**:
모든 데이터 fetch 후 매핑 시 **실제 값을 사용**하도록 수정.

```typescript
// ❌ 절대 이렇게 하지 말 것
iconSvg: undefined

// ✅ 항상 이렇게
iconSvg: w.icon_svg || undefined
```

---

**작성일**: 2025-10-22  
**작성자**: Claude Code  
**최종 수정**: 커밋 d27d797
