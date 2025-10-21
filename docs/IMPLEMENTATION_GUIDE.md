# 보안 및 동기화 구현 가이드

## ✅ 완료된 작업

### Phase 1: 보안 강화
- [x] DOMPurify 설치 및 적용
- [x] CSP 헤더 추가
- [x] .env.example 생성
- [x] XSS 방지 (HebrewIcon)

### Phase 2: 실시간 동기화
- [x] Realtime 구독 구현 (`useUserProgressRealtime.ts`)
- [x] 낙관적 업데이트 적용
- [x] user_preferences 테이블 마이그레이션 작성
- [x] useUserPreferences 훅 생성

### Phase 3: 오프라인 지원
- [x] PWA 설정 (vite.config.ts)
- [x] IndexedDB 구현 (offlineStorage.ts)
- [x] 동기화 큐 (syncQueue.ts)
- [x] useOfflineSync 훅

---

## 📋 다음 단계 (수동 작업 필요)

### 1. Supabase 대시보드 설정

#### 1.1 Realtime 활성화
Supabase 대시보드 → Database → Replication 탭에서 다음 테이블 활성화:

```sql
-- SQL Editor에서 실행
ALTER TABLE user_progress REPLICA IDENTITY FULL;
ALTER TABLE user_favorites REPLICA IDENTITY FULL;
ALTER TABLE user_word_progress REPLICA IDENTITY FULL;
ALTER TABLE user_preferences REPLICA IDENTITY FULL;
```

#### 1.2 마이그레이션 실행
Supabase 대시보드 → SQL Editor에서 실행:

```bash
# 로컬에서 파일 읽고 수동 복사
cat supabase/migrations/004_user_preferences.sql
```

또는 Supabase CLI 사용:
```bash
# Supabase CLI 설치 (아직 안 했다면)
npm install -g supabase

# 프로젝트 링크
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

---

### 2. 기존 코드 업데이트

#### 2.1 App.tsx에서 useUserProgressRealtime 사용

**변경 전:**
```typescript
import { useUserProgress } from './hooks/useUserProgress'

const { progress, markAsCompleted } = useUserProgress(verseData?.id || '');
```

**변경 후:**
```typescript
import { useUserProgressRealtime } from './hooks/useUserProgressRealtime'

const { progress, isPending, markAsCompleted } = useUserProgressRealtime(verseData?.id || '');
```

#### 2.2 오프라인 동기화 UI 추가

App.tsx에 동기화 상태 표시:

```typescript
import { useOfflineSync } from './hooks/useOfflineSync'

function App() {
  const { isOnline, isSyncing, stats, manualSync } = useOfflineSync();

  return (
    <div>
      {/* 오프라인 배너 */}
      {!isOnline && (
        <div className="bg-yellow-500 text-white p-2 text-center">
          📴 오프라인 모드 (데이터가 자동으로 저장됩니다)
        </div>
      )}

      {/* 동기화 버튼 */}
      {isOnline && stats.syncQueue > 0 && (
        <button onClick={manualSync} disabled={isSyncing}>
          {isSyncing ? '동기화 중...' : `${stats.syncQueue}개 항목 동기화`}
        </button>
      )}

      {/* 기존 컴포넌트 */}
    </div>
  );
}
```

#### 2.3 사용자 설정 사용

```typescript
import { useUserPreferences } from './hooks/useUserPreferences'

function SettingsTab() {
  const { preferences, updatePreferences } = useUserPreferences();

  const toggleDarkMode = () => {
    updatePreferences({ dark_mode: !preferences?.dark_mode });
  };

  return (
    <div>
      <button onClick={toggleDarkMode}>
        {preferences?.dark_mode ? '라이트 모드' : '다크 모드'}
      </button>
    </div>
  );
}
```

---

### 3. 빌드 및 배포

#### 3.1 프로덕션 빌드
```bash
npm run build
```

PWA 파일이 자동 생성됩니다:
- `dist/sw.js` - Service Worker
- `dist/manifest.webmanifest` - PWA Manifest

#### 3.2 Vercel 배포 설정

`vercel.json` 생성:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'none'; object-src 'none';"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

---

## 🧪 테스트 방법

### 1. 보안 테스트

```typescript
// tests/security/xss.spec.ts
import { test, expect } from '@playwright/test';
import DOMPurify from 'dompurify';

test('SVG XSS 방지', () => {
  const maliciousSvg = '<svg><script>alert("XSS")</script></svg>';
  const sanitized = DOMPurify.sanitize(maliciousSvg, { USE_PROFILES: { svg: true } });
  expect(sanitized).not.toContain('<script>');
});
```

### 2. Realtime 테스트

Chrome DevTools → Application → Local Storage에서:
1. 탭 2개 열기
2. 같은 계정으로 로그인
3. 탭 1에서 구절 완료 표시
4. 탭 2에서 자동 반영 확인

### 3. 오프라인 테스트

Chrome DevTools → Network → Offline 체크:
1. 오프라인 상태에서 구절 학습
2. 온라인 복귀
3. 자동 동기화 확인

---

## 📊 모니터링

### IndexedDB 확인
Chrome DevTools → Application → IndexedDB → BibleStudyDB

- verses: 캐시된 구절
- userProgress: 오프라인 진행도
- syncQueue: 동기화 대기 항목

### Service Worker 확인
Chrome DevTools → Application → Service Workers

- Status: activated
- Update on reload: 체크

---

## 🔧 트러블슈팅

### 문제 1: Realtime이 작동하지 않음
**해결:**
1. Supabase 대시보드에서 REPLICA IDENTITY 확인
2. 브라우저 콘솔에서 WebSocket 연결 확인
3. RLS 정책 확인

### 문제 2: PWA가 설치되지 않음
**해결:**
1. HTTPS 환경인지 확인 (localhost는 예외)
2. manifest.json 유효성 검사
3. Service Worker 등록 확인

### 문제 3: 동기화가 안 됨
**해결:**
```typescript
// 콘솔에서 수동 동기화
import { syncQueue } from './lib/syncQueue'
await syncQueue.sync()
```

---

## 📚 참고 자료

- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [Vite PWA](https://vite-pwa-org.netlify.app/)
- [Dexie.js](https://dexie.org/)

---

## 🎉 완료 체크리스트

### 필수
- [ ] Supabase Realtime 활성화
- [ ] 004_user_preferences.sql 마이그레이션 실행
- [ ] App.tsx에서 useUserProgressRealtime 사용
- [ ] 빌드 테스트 (`npm run build`)

### 권장
- [ ] 오프라인 UI 추가
- [ ] 사용자 설정 UI 구현
- [ ] PWA 아이콘 교체 (vite.svg → custom icon)
- [ ] Vercel 헤더 설정

### 선택
- [ ] E2E 테스트 작성
- [ ] 성능 모니터링 추가
- [ ] 에러 리포팅 (Sentry 등)
