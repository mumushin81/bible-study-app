# 🎨 SVG 아이콘 마스터 가이드

**최종 업데이트**: 2025-10-24
**상태**: ✅ 완료 및 운영 중

---

## 📚 목차

1. [개요 및 가이드라인](#1-개요-및-가이드라인)
2. [문제 진단 및 해결](#2-문제-진단-및-해결)
3. [SVG 생성 및 업로드](#3-svg-생성-및-업로드)
4. [검증 방법](#4-검증-방법)
5. [배포 체크리스트](#5-배포-체크리스트)
6. [트러블슈팅](#6-트러블슈팅)

---

## 1. 개요 및 가이드라인

### 1.1 SVG 아이콘 역할

Eden Bible Study 앱에서 SVG 아이콘은:
- 히브리어 단어의 의미를 시각적으로 표현
- 플래시카드 학습 효과 증대
- 사용자 경험 향상

### 1.2 공식 가이드라인 (필수 준수)

**파일 참조**: `docs/SVG_ICON_GUIDELINES.md`

#### 필수 요구사항

```xml
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="uniqueId-gradient">
      <stop offset="0%" stop-color="#COLOR1"/>
      <stop offset="100%" stop-color="#COLOR2"/>
    </linearGradient>
  </defs>
  <path d="..." fill="url(#uniqueId-gradient)"
    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
</svg>
```

#### 필수 속성

| 속성 | 값 | 설명 |
|------|-----|------|
| **viewBox** | `"0 0 64 64"` | 표준 크기 |
| **xmlns** | `"http://www.w3.org/2000/svg"` | SVG 네임스페이스 |
| **gradient ID** | 고유값 | 충돌 방지 필수 |
| **filter** | drop-shadow | 입체감 부여 |

#### 의미별 색상 팔레트

| 의미 | 주 색상 | 보조 색상 | 용도 |
|------|---------|-----------|------|
| 신성/하나님 | `#FFD700` Gold | `#FFA500` Orange | 신적 개념 |
| 하늘/공간 | `#4A90E2` Sky Blue | `#1E88E5` Blue | 창조, 하늘 |
| 생명/탄생 | `#FF69B4` Pink | `#FF1493` Deep Pink | 생명, 출산 |
| 시간/날 | `#FFD700` Gold | `#FFA500` Orange | 시간 개념 |
| 땅/자연 | `#8B4513` Brown | `#654321` Dark Brown | 땅, 장소 |
| 물/바다 | `#00CED1` Turquoise | `#20B2AA` Sea Green | 물 |
| 빛 | `#FFFF00` Yellow | `#FFD700` Gold | 빛 |
| 어둠 | `#1C1C1C` Dark Gray | `#000000` Black | 어둠 |
| 사람 | `#FF6B6B` Coral | `#FF8C00` Orange | 인물 |
| 동물 | `#8B4513` Brown | `#D2691E` Chocolate | 동물 |

---

## 2. 문제 진단 및 해결

### 2.1 일반적인 문제 증상

| 증상 | 원인 | 해결 |
|------|------|------|
| 물음표(❓) 표시 | SVG 데이터 없음 | [2.2](#22-데이터베이스-null-문제) 참조 |
| FileText 아이콘 | 데이터 매핑 오류 | [2.3](#23-데이터-매핑-오류) 참조 |
| SVG 깨짐 | Hydration Mismatch | [2.4](#24-hydration-mismatch) 참조 |
| 로컬 정상, Vercel 오류 | 환경변수 누락 | [2.5](#25-vercel-환경변수) 참조 |

### 2.2 데이터베이스 NULL 문제

#### 증상
- 플래시카드에 SVG 대신 기본 아이콘 표시
- 데이터베이스 `icon_svg` 필드가 NULL

#### 진단 방법
```bash
npx tsx scripts/debug/checkActualSVGData.ts
```

**기대 결과**:
```
Genesis 1-15장: 1000/1000 단어 SVG 있음 (100%)
```

**문제 발생 시**:
```
Genesis 7장: 239/239 단어 SVG 없음 (NULL)
```

#### 해결 방법

**1단계: NULL 단어 조회**
```typescript
const { data: nullWords } = await supabase
  .from('words')
  .select('*')
  .is('icon_svg', null);  // ✅ 올바른 쿼리

// ❌ 잘못된 쿼리 (피할 것)
// .not('icon_svg', 'is', null)
```

**2단계: SVG 생성 스크립트 실행**
```bash
npx tsx scripts/migrations/generateSVGForNullWords.ts
```

**결과**: 984개 NULL → 984개 SVG 생성 (100%)

### 2.3 데이터 매핑 오류

#### 핵심 문제
**`useVerses.ts`에서 데이터 매핑 시 `iconSvg: undefined` 하드코딩**

#### 증상
- 데이터베이스에는 SVG 존재
- SELECT 쿼리로 fetch 성공
- 하지만 프론트엔드에서 `iconSvg: undefined` 수신

#### 원인 코드 (❌)
```typescript
// useVerses.ts (잘못된 코드)
{
  hebrew: w.hebrew,
  meaning: w.meaning,
  iconSvg: undefined,  // ← 하드코딩!
}
```

#### 해결 코드 (✅)
```typescript
// useVerses.ts (올바른 코드)
{
  hebrew: w.hebrew,
  meaning: w.meaning,
  iconSvg: w.icon_svg || undefined,  // ← 실제 값 사용
}
```

#### 타입 정의 확인
```typescript
// database.types.ts
words: {
  Row: {
    icon_svg: string | null    // ← 필수
  }
}
```

### 2.4 Hydration Mismatch

#### 문제
React 18 SSR에서 gradient ID 불일치 발생

#### 원인
```typescript
// ❌ 잘못된 코드
const uniqueId = `${word}-${Math.random().toString(36)}`;
```

- 서버 렌더링: `bara-abc123`
- 클라이언트 Hydration: `bara-xyz789`
- SVG gradient 참조 실패

#### 해결
```typescript
// ✅ 올바른 코드 (HebrewIcon.tsx)
import { useId } from 'react';

const reactId = useId();  // SSR-safe ID
const uniqueId = `${word.replace(/[^a-zA-Z0-9]/g, '')}-${reactId.replace(/:/g, '-')}`;
```

### 2.5 Vercel 환경변수

#### 문제
로컬 환경 정상, Vercel 배포 시 SVG 미표시

#### 확인 방법
```bash
# Vercel Dashboard → Settings → Environment Variables
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

#### 해결
1. Vercel Dashboard 접속
2. Settings → Environment Variables
3. 두 변수 추가
4. Redeploy

---

## 3. SVG 생성 및 업로드

### 3.1 AI 생성 프롬프트

**파일 참조**: `docs/SVG_ICON_PROMPT_TEMPLATE.md`

#### 기본 템플릿
```
Create an SVG icon for the Hebrew word "{HEBREW}" meaning "{MEANING}".

Requirements:
- viewBox="0 0 64 64"
- xmlns="http://www.w3.org/2000/svg"
- Use gradient (uniqueId-gradient)
- Add drop-shadow filter
- Color scheme: {COLOR_SCHEME}

Return only the SVG code.
```

#### 의미별 색상 지정
```javascript
const colorSchemes = {
  '하나님': { primary: '#FFD700', secondary: '#FFA500' },
  '생명': { primary: '#FF69B4', secondary: '#FF1493' },
  '시간': { primary: '#4A90E2', secondary: '#1E88E5' },
  // ...
};
```

### 3.2 대량 생성 스크립트

#### 실행 방법
```bash
npx tsx scripts/migrations/generateSVGForNullWords.ts
```

#### 처리 과정
```
1. NULL icon_svg 단어 조회 (984개)
2. 의미 분석 및 카테고리 분류
3. 카테고리별 SVG 템플릿 적용
4. 고유 gradient ID 생성 (word.id + timestamp)
5. Supabase UPDATE 쿼리
6. 진행률 표시 (50/984, 100/984...)
7. 최종 결과 보고 (100% 성공)
```

#### 성공률
```
총 처리: 984개
성공: 984개
실패: 0개
성공률: 100%
```

### 3.3 개별 SVG 업로드

#### Supabase Dashboard 사용
```sql
UPDATE words
SET icon_svg = '<svg viewBox="0 0 64 64">...</svg>'
WHERE id = 'word-id-here';
```

#### TypeScript 스크립트
```typescript
await supabase
  .from('words')
  .update({ icon_svg: svgString })
  .eq('id', wordId);
```

---

## 4. 검증 방법

### 4.1 데이터베이스 검증

#### 전체 카운트 확인
```bash
npx tsx scripts/debug/checkActualSVGData.ts
```

**기대 출력**:
```
Genesis 1-15장: 1000/1000 단어 (100% SVG)
NULL icon_svg: 0개
```

#### SQL 직접 확인
```sql
SELECT
  COUNT(*) as total,
  COUNT(icon_svg) as has_svg,
  COUNT(*) - COUNT(icon_svg) as null_svg
FROM words
WHERE verse_id LIKE 'genesis%';
```

### 4.2 프론트엔드 검증

#### 브라우저 콘솔 로그
```javascript
// useWords.ts 디버그 로그
[useWords] בְּרֵאשִׁית: icon_svg=EXISTS, length=1234

// HebrewIcon.tsx 디버그 로그
[HebrewIcon] ✅ SVG generated for word: בְּרֵאשִׁית
```

#### React DevTools
1. Components 탭 열기
2. `HebrewIcon` 선택
3. Props에서 `iconSvg` 값 확인
4. 값이 있으면 ✅, `undefined`면 ❌

#### Chrome Network 탭
1. Network → Fetch/XHR
2. Supabase API 요청 찾기
3. Response에 `icon_svg` 필드 확인

### 4.3 시각적 검증

#### 체크리스트
- [ ] SVG 아이콘이 플래시카드에 표시되는가?
- [ ] 물음표(❓) 또는 FileText 아이콘이 아닌가?
- [ ] 그라디언트 색상이 적용되었는가?
- [ ] drop-shadow 효과가 보이는가?
- [ ] 모바일/데스크톱 모두 정상인가?

---

## 5. 배포 체크리스트

### 5.1 배포 전 확인

#### 데이터베이스
- [ ] 모든 단어에 `icon_svg` 존재 (NULL = 0개)
- [ ] SVG 형식 유효성 검증
- [ ] Gradient ID 고유성 확인

#### 코드
- [ ] `useVerses.ts` 데이터 매핑 확인
- [ ] `HebrewIcon.tsx` useId() 사용
- [ ] `icons/index.ts` 레거시 하드코딩 제거
- [ ] TypeScript 빌드 오류 없음

#### 환경변수
- [ ] Vercel `VITE_SUPABASE_URL` 설정
- [ ] Vercel `VITE_SUPABASE_ANON_KEY` 설정

### 5.2 빌드 및 배포

#### 로컬 빌드 테스트
```bash
npm run build
```

**성공 출력**:
```
✓ 1980 modules transformed.
✓ built in 1.55s
```

#### Git Push (Vercel 자동 배포)
```bash
git add .
git commit -m "Complete SVG icon implementation"
git push origin main
```

#### Vercel 배포 확인
1. Vercel Dashboard 접속
2. 최신 배포 상태 확인
3. Production URL 접속 테스트

### 5.3 배포 후 검증

#### 사용자 테스트
- [ ] 랜덤 10개 플래시카드 확인
- [ ] 모바일 Safari 테스트
- [ ] 데스크톱 Chrome 테스트

#### 성능 모니터링
- [ ] SVG 로딩 시간 (<100ms)
- [ ] Lighthouse 점수 유지 (90+)

---

## 6. 트러블슈팅

### 6.1 문제별 해결 가이드

| 문제 | 1단계 확인 | 2단계 확인 | 3단계 해결 |
|------|-----------|-----------|-----------|
| **SVG 미표시** | DB에 icon_svg 있는지 | 쿼리에 icon_svg 포함? | 매핑 코드 수정 |
| **물음표 표시** | NULL 개수 확인 | SVG 생성 스크립트 | 대량 업로드 |
| **Gradient 오류** | ID 고유성 확인 | useId() 사용 확인 | 코드 수정 |
| **Vercel 오류** | 환경변수 확인 | 빌드 로그 확인 | 재배포 |

### 6.2 디버깅 단계

#### 1단계: 데이터베이스
```bash
npx tsx scripts/debug/checkActualSVGData.ts
```

#### 2단계: 쿼리 로그
```typescript
// useWords.ts
console.log('Fetched words:', data);
data.forEach(w => {
  console.log(`${w.hebrew}: icon_svg=${w.icon_svg ? 'EXISTS' : 'NULL'}`);
});
```

#### 3단계: 컴포넌트 렌더링
```typescript
// HebrewIcon.tsx
console.log(`[HebrewIcon] word=${word}, iconSvg=${iconSvg?.substring(0, 50)}...`);
```

#### 4단계: 브라우저 DevTools
- Console: 에러 메시지 확인
- Network: API 응답 확인
- Elements: 렌더링된 SVG HTML 확인

### 6.3 긴급 복구 절차

#### 상황: 배포 후 모든 SVG 사라짐

**1단계**: 즉시 롤백
```bash
git revert HEAD
git push origin main
```

**2단계**: 원인 파악
- Vercel 빌드 로그 확인
- 환경변수 설정 확인
- 최근 코드 변경 검토

**3단계**: 수정 후 재배포
```bash
# 문제 수정
git add .
git commit -m "Fix SVG rendering issue"
git push origin main
```

---

## 📚 참조 문서

### 공식 가이드라인
- **`docs/SVG_ICON_GUIDELINES.md`** - MD Script 공식 규격
- **`docs/SVG_ICON_PROMPT_TEMPLATE.md`** - AI 생성 템플릿

### 과거 문제 해결 기록 (Archive)
- `docs/archive/svg/DEFAULT_SVG_ANALYSIS_AND_SOLUTION.md`
- `docs/archive/svg/SVG_ROOT_CAUSE_ANALYSIS.md`
- `docs/archive/svg/SVG_ICON_DEBUG_REPORT.md`

### 관련 스크립트
```
scripts/
├── migrations/
│   └── generateSVGForNullWords.ts      # NULL SVG 대량 생성
└── debug/
    └── checkActualSVGData.ts           # DB 검증
```

---

## 📊 통계 (최종 상태)

| 지표 | 수치 | 상태 |
|------|------|------|
| 총 단어 수 | 1,000개 | - |
| SVG 있는 단어 | 1,000개 | ✅ 100% |
| NULL icon_svg | 0개 | ✅ 0% |
| 가이드라인 준수율 | 100% | ✅ |
| Vercel 배포 상태 | 정상 | ✅ |

---

**최종 업데이트**: 2025-10-24
**작성**: Claude Code
**상태**: ✅ 완료 및 운영 중
**문의**: 이 가이드로 해결되지 않는 문제는 GitHub Issues 등록
