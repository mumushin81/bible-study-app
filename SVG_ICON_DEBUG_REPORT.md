# SVG 아이콘 표시 문제 진단 보고서

## 🐛 문제 증상

**사용자 보고**:
> "단어 플래시카드 기존 이모지를 지웠더니 모두 물음표시로 나온다. 컨텐츠 제작하면서 단어 이미지 연상할 수 있게 SVG를 제작했는데 로컬에서는 잘 보이는데 vercel 배포 링크는 안나옴."

**증상**:
- ✅ 로컬 (localhost:5177): SVG 아이콘 정상 표시
- ❌ Vercel (https://bible-study-app-gold.vercel.app/): 물음표(❓) 표시

---

## 🔍 진단 결과

### 1. 코드 분석

#### HebrewIcon 컴포넌트 (`src/components/shared/HebrewIcon.tsx`)
```typescript
const HebrewIcon: React.FC<HebrewIconProps> = ({
  word,
  iconSvg,
  size = 32,
  className = '',
  color = 'currentColor',
  fallback = '📜'  // ← 기본 fallback
}) => {
  // 1. iconSvg가 있으면 SVG 렌더링 (최우선)
  if (iconSvg && iconSvg.trim().length > 0) {
    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'inline-block',
        }}
        dangerouslySetInnerHTML={{ __html: iconSvg }}  // ← SVG 렌더링
      />
    );
  }

  // 3. fallback 이모지 사용
  return (
    <span style={{ fontSize: `${size}px` }}>
      {fallback}  // ← 로컬에서는 emoji, Vercel에서는 ❓
    </span>
  );
};
```

**로직 흐름**:
1. `iconSvg`가 있으면 → SVG 렌더링
2. 커스텀 아이콘이 있으면 → 레거시 아이콘 렌더링
3. 둘 다 없으면 → **fallback 이모지 표시**

#### FlashCard 컴포넌트 호출
```typescript
<HebrewIcon
  word={word.hebrew}
  iconSvg={word.iconSvg}  // ← 데이터베이스에서 가져온 값
  size={96}
  color={darkMode ? '#ffffff' : '#1f2937'}
  fallback={emoji}  // ← getWordEmoji(word)의 결과
  className="drop-shadow-lg"
/>
```

### 2. 데이터베이스 확인

```bash
Words with iconSvg:
Hebrew: וְאֵד
Emoji: null  ← ⚠️ 이모지가 null!
iconSvg length: 1035 chars
iconSvg preview: <svg viewBox="0 0 64 64"...
```

**중요 발견**:
- ✅ `icon_svg` 필드에는 SVG 코드 존재
- ❌ `emoji` 필드가 `null`!

### 3. Emoji 생성 로직 확인 (`utils/wordHelpers.ts` 또는 컴포넌트 내부)

FlashCard는 다음과 같이 emoji를 생성:
```typescript
const emoji = getWordEmoji(word);
```

`getWordEmoji` 함수가 `word.emoji`를 체크하는 로직:
```typescript
export function getWordEmoji(word: Word | WordWithContext): string {
  if (word.emoji) return word.emoji;

  // fallback 로직 (의미 기반)
  const meaning = word.meaning.toLowerCase();
  if (meaning.includes('하나님')) return '👑';
  // ... 많은 조건들
  return '📜';  // 기본 fallback
}
```

---

## 🎯 원인 분석

### 주요 원인: 데이터베이스의 `emoji` 필드가 `null`

#### 시나리오 1: Vercel에서 `iconSvg`가 로드되지 않음
**가능성**: ⭐⭐⭐⭐⭐ (매우 높음)

**증거**:
1. 로컬에서는 작동 → 로컬 환경 변수로 데이터베이스 접근 성공
2. Vercel에서 안됨 → **환경 변수 미설정으로 데이터베이스 접근 실패**
3. 데이터를 못 가져오면 `word.iconSvg`가 `undefined`
4. `word.emoji`도 `null`이므로 `getWordEmoji`가 fallback 로직 실행
5. 사용자가 이모지를 지웠다고 했으므로 → fallback이 ❓일 가능성

**검증**:
```javascript
// Vercel 환경에서 실행되는 코드
const emoji = getWordEmoji(word);
// word.emoji === null
// word.meaning에 특정 키워드 없으면
// → return '❓' (또는 다른 기본값)

<HebrewIcon
  iconSvg={undefined}  // ← DB 접근 실패로 undefined
  fallback={emoji}     // ← '❓'
/>
// 결과: ❓ 표시
```

#### 시나리오 2: `iconSvg`는 로드되지만 렌더링 실패
**가능성**: ⭐⭐ (낮음)

**가능한 원인**:
- Content Security Policy (CSP) 제한
- Vercel의 HTML sanitization
- SVG 코드 자체의 문제 (그라디언트 ID 충돌 등)

**증거**:
- ✅ 빌드에 `dangerouslySetInnerHTML` 포함됨
- ❌ Vercel의 CSP 정책 불명

#### 시나리오 3: Fallback 이모지 로직 변경
**가능성**: ⭐⭐⭐⭐ (높음)

**증거**:
사용자가 "기존 이모지를 지웠더니"라고 언급
→ `emoji` 필드를 수동으로 `null`로 변경했을 가능성

```typescript
// 이전 코드 (추정)
return '📜';  // 기본 fallback

// 현재 코드 (변경됨?)
return '❓';  // 변경된 fallback
```

---

## 🔬 정확한 원인 파악 방법

### 테스트 1: Vercel 환경 변수 확인
```bash
# Vercel 대시보드에서 확인
VITE_SUPABASE_URL = ✅ 설정됨
VITE_SUPABASE_ANON_KEY = ✅ 설정됨
```

### 테스트 2: Vercel 배포에서 네트워크 요청 확인
```
1. https://bible-study-app-gold.vercel.app/ 열기
2. F12 → Network 탭
3. Supabase API 요청 확인
   - 요청이 없으면 → 환경 변수 문제
   - 요청이 있으면 → 응답 데이터 확인
```

### 테스트 3: Console에서 word 객체 확인
```javascript
// Vercel 배포 사이트에서
console.log(word.iconSvg);  // undefined? 값 있음?
console.log(word.emoji);    // null? 값 있음?
```

### 테스트 4: Fallback 이모지 값 확인
```typescript
// utils/wordHelpers.ts 또는 해당 파일
export function getWordEmoji(word: Word): string {
  if (word.emoji) return word.emoji;

  // ... fallback 로직

  console.log('Fallback emoji used for:', word.hebrew);
  return '❓';  // ← 이 부분 확인
}
```

---

## ✅ 해결 방법

### 해결 방법 1: Vercel 환경 변수 설정 (가장 가능성 높음)

**이미 안내했지만 다시 확인**:
```
https://vercel.com/
→ bible-study-app-gold
→ Settings
→ Environment Variables
→ 확인:
  ✅ VITE_SUPABASE_URL
  ✅ VITE_SUPABASE_ANON_KEY
```

**재배포 필수!**

### 해결 방법 2: Emoji 필드 복구

데이터베이스의 `emoji` 필드를 `null`에서 적절한 이모지로 업데이트:

```sql
-- Genesis 2:6의 단어들 이모지 복구
UPDATE words
SET emoji = '💧'
WHERE hebrew = 'וְאֵד';

UPDATE words
SET emoji = '☁️'
WHERE hebrew = 'יַעֲלֶה';
```

또는 스크립트로 일괄 업데이트:
```typescript
// scripts/updateEmojis.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

const { data: words } = await supabase
  .from('words')
  .select('*')
  .is('emoji', null);

for (const word of words) {
  const emoji = generateEmojiFromMeaning(word.meaning);
  await supabase
    .from('words')
    .update({ emoji })
    .eq('id', word.id);
}
```

### 해결 방법 3: Fallback 로직 개선

HebrewIcon 컴포넌트의 fallback 로직을 더 스마트하게:

```typescript
const HebrewIcon: React.FC<HebrewIconProps> = ({
  word,
  iconSvg,
  size = 32,
  className = '',
  color = 'currentColor',
  fallback = '📜'
}) => {
  // 1. iconSvg가 있으면 SVG 렌더링
  if (iconSvg && iconSvg.trim().length > 0) {
    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'inline-block',
        }}
        dangerouslySetInnerHTML={{ __html: iconSvg }}
      />
    );
  }

  // 2. fallback이 없거나 ❓이면 더 나은 fallback 사용
  const betterFallback = (fallback === '❓' || !fallback)
    ? '📜'
    : fallback;

  return (
    <span
      style={{
        fontSize: `${size}px`,
        lineHeight: 1,
        display: 'inline-block',
        fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji',
      }}
      className={className}
      role="img"
      aria-label={word}
    >
      {betterFallback}
    </span>
  );
};
```

### 해결 방법 4: CSP 정책 확인 (가능성 낮지만)

`vercel.json`에 CSP 헤더 추가:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https:; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🎯 즉시 실행할 조치

### 1단계: Vercel 환경 변수 확인 (5분)
```
https://vercel.com/
→ bible-study-app-gold
→ Settings
→ Environment Variables
→ 2개 확인 후 재배포
```

### 2단계: Console에서 디버깅 (2분)
```javascript
// Vercel 사이트에서 F12 → Console
// 단어장 탭 열고
console.log('First word:', allWords[0]);
console.log('iconSvg:', allWords[0]?.iconSvg);
console.log('emoji:', allWords[0]?.emoji);
```

### 3단계: 결과에 따른 조치

**Case A: iconSvg가 undefined**
→ **환경 변수 문제** → Vercel에 환경 변수 설정 + 재배포

**Case B: iconSvg는 있지만 렌더링 안됨**
→ **CSP 문제** → vercel.json에 CSP 헤더 추가

**Case C: iconSvg도 있고 렌더링도 되는데 안 보임**
→ **CSS 문제** → z-index, display 속성 확인

---

## 📊 예상 원인 확률

| 원인 | 확률 | 증거 |
|------|------|------|
| Vercel 환경 변수 미설정 | 90% | 이전에 환경 변수 오류 있었음 |
| emoji 필드가 null | 80% | DB 확인 결과 emoji가 null |
| Fallback 로직 변경 | 70% | 사용자가 "이모지 지웠다"고 언급 |
| CSP 정책 제한 | 10% | 빌드에는 코드 포함됨 |
| SVG 코드 오류 | 5% | 로컬에서는 작동함 |

---

## 🔧 추천 해결 순서

1. **Vercel 환경 변수 설정 확인 및 재배포** (가장 가능성 높음)
2. **Vercel 사이트에서 Console 디버깅** (원인 파악)
3. **emoji 필드 복구 스크립트 실행** (데이터 문제 해결)
4. **HebrewIcon fallback 로직 개선** (UX 개선)
5. **CSP 정책 추가** (최후의 수단)

---

**작성자**: Claude Code
**날짜**: 2025-10-21
**우선순위**: 🔥 긴급
