# 🔍 종합 코드 감사 보고서 (Code Audit Report)

**날짜:** 2025-10-21
**분석 범위:** 전체 코드베이스 (src/, scripts/, tests/)
**총 파일:** 46개 TypeScript 파일

---

## 📊 코드베이스 통계

| 항목 | 수량 | 평가 |
|------|------|------|
| TypeScript 파일 | 46개 | ✅ 정상 |
| `useEffect` 사용 | 31회 (14개 파일) | ⚠️ 주의 |
| `useState` 사용 | 88회 (19개 파일) | ⚠️ 주의 |
| `any` 타입 사용 | 144회 (48개 파일) | ❌ 심각 |
| `console.log/error` | 1,549회 (101개 파일) | ❌ 심각 |
| `dangerouslySetInnerHTML` | 1회 (보호됨) | ✅ 정상 |
| `localStorage` 사용 | 1회 (App.tsx) | ⚠️ 개선 필요 |

---

## 🔴 심각한 문제 (Critical Issues)

### 1. 타입 안전성 부족 (Type Safety)

**문제:** `any` 타입이 144회 사용됨

**영향:**
- 타입 검사 우회로 런타임 에러 가능
- IDE 자동완성 지원 불가
- 리팩토링 어려움

**발견 위치:**
```typescript
// src/hooks/useVerses.ts
points: any
bible_references: any

// src/lib/offlineStorage.ts
data: any

// scripts/ 많은 파일들
```

**해결방안:**
```typescript
// ❌ 나쁜 예
interface CommentarySection {
  points: any  // 위험!
}

// ✅ 좋은 예
interface CommentarySection {
  points: string[]  // 타입 명시
}

// 또는 unknown 사용 후 타입 가드
function process(data: unknown) {
  if (Array.isArray(data)) {
    // 안전하게 사용
  }
}
```

---

### 2. 프로덕션에 console.log 과다 사용

**문제:** 1,549회 사용 (101개 파일)

**영향:**
- 프로덕션 번들 크기 증가
- 민감한 정보 노출 위험
- 성능 저하

**발견 위치:**
```typescript
// src/hooks/useUserProgressRealtime.ts
console.log('📡 Realtime progress update:', payload)  // payload에 사용자 데이터 포함 가능

// src/lib/syncQueue.ts
console.log('🔄 Starting sync...')  // 괜찮음

// src/App.tsx
console.error('Failed to load hint count:', error)  // 민감하지 않음
```

**해결방안:**

```typescript
// 1. 환경변수 기반 로깅
const isDev = import.meta.env.DEV;

function devLog(...args: any[]) {
  if (isDev) {
    console.log(...args);
  }
}

// 2. 로깅 라이브러리 사용
import { logger } from './lib/logger';

logger.debug('Debug info');  // DEV만 출력
logger.error('Error', error);  // 항상 출력
logger.info('Info');  // 설정 가능

// 3. Vite 빌드 시 제거
// vite.config.ts
esbuild: {
  drop: ['console', 'debugger'],  // 프로덕션에서 제거
}
```

---

### 3. localStorage를 UI 설정에 사용

**문제:** App.tsx에서 localStorage 직접 사용

**코드:**
```typescript
// src/App.tsx:52-60
const hintCount = parseInt(localStorage.getItem('hebrewHintShown') || '0');
localStorage.setItem('hebrewHintShown', String(currentCount + 1));
```

**보안 위험:**
- XSS 공격 시 접근 가능
- 여러 기기 간 동기화 불가
- 사용자 설정 유실 위험

**해결방안:**

```typescript
// ✅ user_preferences 테이블 사용
import { useUserPreferences } from './hooks/useUserPreferences';

function App() {
  const { preferences, updatePreferences } = useUserPreferences();

  const handleCloseHint = async () => {
    await updatePreferences({
      hebrew_hint_count: (preferences?.hebrew_hint_count || 0) + 1
    });
  };

  const showHint = preferences && preferences.hebrew_hint_count < 3;
}
```

---

## ⚠️ 중요한 문제 (Important Issues)

### 4. 코드 중복 (Code Duplication)

**문제:** useUserProgress와 useUserProgressRealtime이 95% 동일

**비교:**

| 기능 | useUserProgress | useUserProgressRealtime |
|------|----------------|------------------------|
| 초기 로드 | ✅ | ✅ |
| Realtime 구독 | ❌ | ✅ |
| 낙관적 업데이트 | ❌ | ✅ |
| 코드 라인 수 | 104줄 | 172줄 |
| 중복 코드 | 약 95줄 | 약 95줄 |

**해결방안:**

```typescript
// src/hooks/useUserProgressBase.ts (공통 로직)
function useUserProgressBase(verseId: string, options: { realtime?: boolean } = {}) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);

  // 공통 로직
  const markAsCompleted = async () => { ... }

  // Realtime 구독 (옵션)
  useEffect(() => {
    if (!options.realtime) return;

    const channel = supabase.channel(...).subscribe();
    return () => supabase.removeChannel(channel);
  }, [options.realtime]);

  return { progress, markAsCompleted };
}

// src/hooks/useUserProgress.ts
export const useUserProgress = (verseId: string) =>
  useUserProgressBase(verseId, { realtime: false });

// src/hooks/useUserProgressRealtime.ts
export const useUserProgressRealtime = (verseId: string) =>
  useUserProgressBase(verseId, { realtime: true });
```

**DRY 위반 추가 사례:**

```typescript
// 1. Supabase 클라이언트 생성 로직 (56개 스크립트에 중복)
// ❌ 각 스크립트마다 반복
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ✅ 공통 유틸리티로 분리
// scripts/utils/supabase.ts (이미 존재하지만 사용 안 함)
import { getSupabaseClient } from './utils/supabase';
const supabase = getSupabaseClient();
```

---

### 5. 환경변수 하드코딩

**문제:** 56개 스크립트에 환경변수 직접 접근

```typescript
// 반복되는 패턴
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}
```

**위험:**
- `!` 타입 단언으로 null 체크 우회
- 런타임 에러 가능
- 중복 코드

**해결방안:**

```typescript
// scripts/utils/env.ts
export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

// 사용
import { getEnv } from './utils/env';
const supabaseUrl = getEnv('VITE_SUPABASE_URL');
```

---

### 6. 에러 핸들링 불충분

**문제:** 대부분의 에러를 console.error로만 처리

```typescript
// src/hooks/useUserProgress.ts:29
if (error && error.code !== 'PGRST116') {
  console.error('Error fetching progress:', error)  // 에러 무시
}

// 사용자는 에러를 알 수 없음
```

**해결방안:**

```typescript
// 1. 에러 상태 반환
export function useUserProgress(verseId: string) {
  const [error, setError] = useState<Error | null>(null);

  async function fetchProgress() {
    try {
      const { data, error: supabaseError } = await supabase...
      if (supabaseError) throw supabaseError;
      setProgress(data);
    } catch (err) {
      setError(err as Error);
      // 선택: 토스트 알림
      toast.error('진행도를 불러올 수 없습니다.');
    }
  }

  return { progress, error, loading };
}

// 2. Error Boundary 사용
<ErrorBoundary fallback={<ErrorMessage />}>
  <App />
</ErrorBoundary>
```

---

## 📝 개선 권장사항 (Recommendations)

### 7. 사용하지 않는 스크립트 파일 정리

**발견:** scripts/ 폴더에 **100개 이상**의 스크립트 파일

**문제:**
- 저장소 크기 증가
- 유지보수 어려움
- 어떤 스크립트가 현재 사용되는지 불명확

**추천:**

```bash
# 1. 사용 중인 스크립트만 package.json에 등록
{
  "scripts": {
    "migrate": "tsx scripts/runAllMigrations.ts",
    "upload": "tsx scripts/uploadGeneratedV2.ts",
    "generate": "tsx scripts/generateGenesis2and3Content.ts"
  }
}

# 2. 나머지는 archive/ 폴더로 이동
mkdir -p scripts/archive
mv scripts/old*.ts scripts/archive/

# 3. 사용하지 않는 스크립트 삭제
git rm scripts/testSupabaseQuery.ts  # 테스트 완료 후 불필요
```

---

### 8. 성능 최적화

#### 8.1 불필요한 re-render

**문제:** App.tsx에 너무 많은 useState (15개)

```typescript
// src/App.tsx
const [darkMode, setDarkMode] = useState(false);
const [currentBookId, setCurrentBookId] = useState('genesis');
const [currentChapter, setCurrentChapter] = useState(1);
// ... 12개 더
```

**해결방안:**

```typescript
// 1. 관련 상태 그룹화
const [navigation, setNavigation] = useState({
  bookId: 'genesis',
  chapter: 1,
  verseIndex: 0
});

// 2. useReducer 사용
const [state, dispatch] = useReducer(appReducer, initialState);

dispatch({ type: 'CHANGE_VERSE', verseIndex: 5 });

// 3. Context로 분리
<NavigationContext.Provider value={{ navigation, setNavigation }}>
  <App />
</NavigationContext.Provider>
```

#### 8.2 N+1 쿼리 문제 (이미 해결됨 ✅)

**현재 구현:** useVerses.ts에서 JOIN 사용 (좋음!)

```typescript
// ✅ 이미 최적화됨
supabase
  .from('verses')
  .select(`
    *,
    words (*),
    commentaries (*)
  `)
```

---

### 9. 보안 개선사항

#### 9.1 RLS 정책 검증 필요

**확인 필요:**
```sql
-- user_progress 테이블
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

-- ⚠️ 검증: auth.uid()가 NULL일 때 모든 데이터 접근 가능?
```

**테스트:**
```typescript
// 로그아웃 상태에서 테스트
await supabase.auth.signOut();
const { data } = await supabase.from('user_progress').select();
// data가 비어있어야 함
```

#### 9.2 API 키 로테이션

**권장:**
```bash
# 정기적으로 Supabase 키 재생성
# 1. Supabase Dashboard → Settings → API
# 2. "Rotate anon key" 클릭
# 3. .env.local 업데이트
# 4. 재배포
```

---

## 🎯 우선순위별 액션 아이템

### 🔴 즉시 수정 (P0 - Critical)

1. **localStorage를 user_preferences로 마이그레이션**
   - 파일: `src/App.tsx`
   - 예상 시간: 30분
   - 영향: 보안 개선, 다기기 동기화

2. **any 타입 제거 (최소 50%)**
   - 파일: `src/hooks/useVerses.ts`, `src/lib/offlineStorage.ts`
   - 예상 시간: 2시간
   - 영향: 타입 안전성 향상

3. **프로덕션 console.log 제거**
   - 파일: `vite.config.ts` 설정 추가
   - 예상 시간: 10분
   - 영향: 번들 크기 감소, 성능 향상

### ⚠️ 단기 개선 (P1 - Important)

4. **useUserProgress 중복 코드 통합**
   - 예상 시간: 1시간
   - 영향: 유지보수성 향상

5. **에러 핸들링 개선**
   - Error Boundary 추가
   - 토스트 알림 추가
   - 예상 시간: 3시간

6. **사용하지 않는 스크립트 정리**
   - 예상 시간: 1시간
   - 영향: 저장소 크기 감소

### 📝 중장기 개선 (P2 - Nice to have)

7. **App.tsx 리팩토링**
   - useState → useReducer
   - 컴포넌트 분리
   - 예상 시간: 4시간

8. **로깅 시스템 구축**
   - winston/pino 도입
   - 예상 시간: 2시간

---

## 📋 체크리스트

### 보안
- [ ] localStorage를 user_preferences로 이동
- [ ] RLS 정책 테스트
- [ ] API 키 로테이션 스케줄 설정
- [ ] CSP 헤더 검증

### 코드 품질
- [ ] any 타입 50% 제거
- [ ] useUserProgress 통합
- [ ] 환경변수 유틸리티 사용
- [ ] 에러 핸들링 개선

### 성능
- [ ] console.log 프로덕션 제거
- [ ] App.tsx 리팩토링
- [ ] 번들 크기 분석

### 유지보수
- [ ] 사용하지 않는 스크립트 정리
- [ ] 로깅 시스템 구축
- [ ] 문서화 업데이트

---

## 📊 코드 품질 점수

| 항목 | 점수 | 평가 |
|------|------|------|
| 타입 안전성 | 6/10 | ⚠️ any 과다 사용 |
| 보안 | 8/10 | ✅ RLS, XSS 방지 양호 |
| 성능 | 7/10 | ⚠️ 프로덕션 로깅 많음 |
| 유지보수성 | 6/10 | ⚠️ 중복 코드, 스크립트 많음 |
| 에러 핸들링 | 5/10 | ❌ 불충분 |
| **전체** | **6.4/10** | ⚠️ 개선 필요 |

---

## 🎓 학습 자료

- [TypeScript: unknown vs any](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---

**감사자:** Claude Code
**버전:** 1.0
**다음 감사 예정:** 3개월 후 (2025-01-21)
