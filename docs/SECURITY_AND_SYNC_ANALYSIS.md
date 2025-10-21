# 보안 및 동기화 아키텍처 분석 및 개선 방안

## 📊 현재 아키텍처 분석

### 데이터베이스 구조
```
┌─────────────────────────────────────────────────────────┐
│                   Supabase PostgreSQL                    │
├─────────────────────────┬───────────────────────────────┤
│   컨텐츠 데이터 (읽기전용)  │   사용자 데이터 (RLS 보호)      │
├─────────────────────────┼───────────────────────────────┤
│ - books                 │ - user_profiles               │
│ - verses                │ - user_progress               │
│ - words                 │ - user_favorites              │
│ - commentaries          │ - quiz_results                │
│ - commentary_sections   │ - user_notes                  │
│ - why_questions         │ - user_word_bookmarks         │
│ - commentary_conclusions│ - user_word_progress (SRS)    │
│ - word_relations        │                               │
└─────────────────────────┴───────────────────────────────┘
```

### 데이터 흐름
```
사용자 기기
    ↓
Supabase Auth (JWT)
    ↓
Row Level Security (RLS)
    ↓
PostgreSQL Database
    ↓
React Hooks (useVerses, useUserProgress 등)
    ↓
UI Components
```

---

## 🔐 보안 분석

### ✅ 현재 잘 구현된 보안 기능

#### 1. Row Level Security (RLS)
**장점:**
- 모든 사용자 데이터 테이블에 RLS 활성화
- 사용자는 자신의 데이터만 조회/수정 가능
- 컨텐츠 데이터는 서비스 롤만 수정 가능

**구현 예시:**
```sql
-- 사용자 진행도 RLS
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

-- 컨텐츠는 읽기전용
CREATE POLICY "Verses are viewable by everyone"
  ON verses FOR SELECT
  USING (true);

CREATE POLICY "Only service role can insert verses"
  ON verses FOR INSERT
  WITH CHECK (false);
```

#### 2. 인증 시스템
**장점:**
- Supabase Auth 사용 (JWT 기반)
- 자동 토큰 갱신 (autoRefreshToken: true)
- 세션 지속성 (persistSession: true)
- CASCADE 삭제로 데이터 정합성 유지

#### 3. 데이터베이스 제약조건
**장점:**
- UNIQUE 제약으로 중복 방지
- CHECK 제약으로 데이터 검증
- NOT NULL 제약으로 필수 데이터 보장
- Foreign Key로 참조 무결성 유지

---

### ⚠️ 보안 취약점 및 개선 방안

#### 1. 환경변수 노출 위험 (중요도: 높음)

**문제:**
```typescript
// src/lib/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```
- `VITE_` 접두사가 있는 환경변수는 클라이언트에 노출됨
- anon key는 공개되어도 괜찮지만, 소스코드에 포함되면 위험

**해결방안:**
```typescript
// ✅ 권장: 환경변수는 빌드타임에만 주입
// .env.local (Git 제외)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

// .env.example (Git 포함)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**추가 보안:**
- Supabase 대시보드에서 API 키 로테이션 주기적 실행
- IP 화이트리스트 설정 (프로덕션 환경)

---

#### 2. XSS (Cross-Site Scripting) 위험 (중요도: 높음)

**문제:**
```typescript
// src/components/shared/HebrewIcon.tsx
<div
  dangerouslySetInnerHTML={{ __html: iconSvg }}
/>
```
- `dangerouslySetInnerHTML` 사용으로 XSS 공격 가능
- SVG 아이콘이 악의적인 스크립트를 포함할 수 있음

**해결방안:**

**옵션 1: SVG Sanitizer (권장)**
```typescript
import DOMPurify from 'dompurify';

// SVG 정리
const sanitizedSvg = DOMPurify.sanitize(iconSvg, {
  USE_PROFILES: { svg: true }
});

<div
  dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
/>
```

**옵션 2: SVG를 컴포넌트로 변환**
```typescript
// 빌드타임에 SVG를 React 컴포넌트로 변환
import BereshitIcon from './icons/BereshitIcon';

<BereshitIcon className={className} />
```

**옵션 3: CSP (Content Security Policy) 헤더 추가**
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
```

---

#### 3. localStorage 보안 (중요도: 중간)

**문제:**
```typescript
// App.tsx
const [showHebrewHint, setShowHebrewHint] = useState(true);
// localStorage에 힌트 표시 여부 저장 추정
```
- localStorage는 XSS 공격에 취약
- 민감한 정보 저장 시 암호화 없이 평문 저장

**해결방안:**

**민감하지 않은 데이터만 localStorage 사용:**
```typescript
// ✅ 괜찮음: UI 설정
localStorage.setItem('darkMode', 'true');
localStorage.setItem('showHebrewHint', 'true');

// ❌ 위험: 토큰은 저장하지 말 것
// Supabase는 자동으로 토큰을 secure하게 저장함
```

**민감한 데이터는 데이터베이스 저장:**
```typescript
// 사용자 설정도 DB에 저장
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  dark_mode BOOLEAN DEFAULT false,
  show_hebrew_hint BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

#### 4. SQL Injection 방지 (중요도: 낮음)

**현재 상태: 안전함**
- Supabase 클라이언트가 자동으로 파라미터화된 쿼리 사용
- 직접 SQL 작성하지 않으므로 SQL Injection 위험 없음

**주의사항:**
```typescript
// ✅ 안전: Supabase 클라이언트 사용
const { data } = await supabase
  .from('verses')
  .select('*')
  .eq('id', verseId);

// ❌ 위험: 직접 SQL 작성 금지 (사용 안함)
// const { data } = await supabase.rpc('exec_sql', {
//   sql_query: `SELECT * FROM verses WHERE id = '${verseId}'`
// });
```

---

#### 5. CORS 설정 (중요도: 중간)

**권장사항:**
```typescript
// Supabase 대시보드 설정
// Settings > API > CORS
// Allowed origins:
// - https://your-domain.com
// - http://localhost:5173 (개발 환경)
```

---

## 🔄 디바이스 동기화 분석

### 현재 동기화 상태

**문제점:**
1. ❌ 실시간 동기화 없음 (폴링 방식)
2. ❌ 여러 기기 간 동기화 지연
3. ❌ 오프라인 모드 미지원
4. ❌ 충돌 해결 메커니즘 없음
5. ❌ 낙관적 업데이트(Optimistic Update) 없음

**현재 구현:**
```typescript
// useUserProgress.ts
useEffect(() => {
  // 매번 컴포넌트 마운트 시 데이터 가져옴
  fetchProgress()
}, [user, verseId])

// 업데이트 시 서버 응답 대기
const markAsCompleted = async () => {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({ ... })
    .select()
    .single()

  setProgress(data) // 서버 응답 후 UI 업데이트
}
```

---

### 🎯 동기화 개선 방안

#### 해결방안 1: Supabase Realtime 구독 (권장)

**장점:**
- 실시간 동기화 (WebSocket)
- 여러 기기 간 즉시 반영
- Supabase 기본 기능 활용

**구현:**
```typescript
// hooks/useUserProgressRealtime.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export function useUserProgressRealtime(verseId: string) {
  const { user } = useAuth()
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    if (!user) return

    // 초기 데이터 로드
    fetchProgress()

    // 실시간 구독
    const channel: RealtimeChannel = supabase
      .channel(`user_progress:${user.id}:${verseId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${user.id},verse_id=eq.${verseId}`
        },
        (payload) => {
          console.log('Progress updated:', payload)
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setProgress(payload.new)
          } else if (payload.eventType === 'DELETE') {
            setProgress(null)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, verseId])

  return { progress }
}
```

**활성화 방법:**
```sql
-- Supabase 대시보드 또는 SQL Editor
ALTER TABLE user_progress REPLICA IDENTITY FULL;
ALTER TABLE user_favorites REPLICA IDENTITY FULL;
ALTER TABLE user_word_progress REPLICA IDENTITY FULL;
```

---

#### 해결방안 2: 낙관적 업데이트 (Optimistic Update)

**장점:**
- 즉각적인 UI 반응
- 네트워크 지연 체감 감소
- 사용자 경험 향상

**구현:**
```typescript
// hooks/useOptimisticProgress.ts
export function useOptimisticProgress(verseId: string) {
  const { user } = useAuth()
  const [progress, setProgress] = useState(null)
  const [isPending, setIsPending] = useState(false)

  const markAsCompletedOptimistic = async () => {
    if (!user) return

    // 1. 즉시 UI 업데이트 (낙관적)
    const optimisticData = {
      ...progress,
      completed: true,
      completed_at: new Date().toISOString(),
    }
    setProgress(optimisticData)
    setIsPending(true)

    try {
      // 2. 서버에 요청
      const { data, error } = await supabase
        .from('user_progress')
        .upsert(optimisticData)
        .select()
        .single()

      if (error) throw error

      // 3. 서버 응답으로 최종 업데이트
      setProgress(data)
    } catch (error) {
      // 4. 실패 시 롤백
      console.error('Failed to update:', error)
      setProgress(progress) // 이전 상태로 복원
      alert('업데이트 실패. 다시 시도해주세요.')
    } finally {
      setIsPending(false)
    }
  }

  return { progress, markAsCompletedOptimistic, isPending }
}
```

---

#### 해결방안 3: 오프라인 지원 (Progressive Web App)

**단계 1: Service Worker 등록**
```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Bible Study App',
        short_name: 'BibleStudy',
        theme_color: '#7c3aed',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7일
              }
            }
          }
        ]
      }
    })
  ]
})
```

**단계 2: IndexedDB로 로컬 캐시**
```typescript
// lib/offlineStorage.ts
import Dexie, { Table } from 'dexie';

interface CachedVerse {
  id: string;
  data: any;
  cachedAt: number;
}

class OfflineDatabase extends Dexie {
  verses!: Table<CachedVerse>;
  userProgress!: Table<any>;

  constructor() {
    super('BibleStudyDB');
    this.version(1).stores({
      verses: 'id, cachedAt',
      userProgress: 'id, user_id, verse_id, synced'
    });
  }
}

export const db = new OfflineDatabase();

// 오프라인 저장
export async function cacheVerse(verse: any) {
  await db.verses.put({
    id: verse.id,
    data: verse,
    cachedAt: Date.now()
  });
}

// 오프라인 조회
export async function getCachedVerse(id: string) {
  return await db.verses.get(id);
}
```

**단계 3: 동기화 큐**
```typescript
// lib/syncQueue.ts
interface SyncItem {
  id: string;
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
}

class SyncQueue {
  private queue: SyncItem[] = [];

  async add(item: Omit<SyncItem, 'id' | 'timestamp'>) {
    const syncItem: SyncItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    this.queue.push(syncItem);

    // IndexedDB에 저장
    await db.table('sync_queue').add(syncItem);

    // 온라인이면 즉시 동기화 시도
    if (navigator.onLine) {
      await this.sync();
    }
  }

  async sync() {
    if (!navigator.onLine) return;

    for (const item of this.queue) {
      try {
        await this.syncItem(item);
        // 성공 시 큐에서 제거
        this.queue = this.queue.filter(i => i.id !== item.id);
        await db.table('sync_queue').delete(item.id);
      } catch (error) {
        console.error('Sync failed:', error);
        // 실패한 항목은 큐에 유지
      }
    }
  }

  private async syncItem(item: SyncItem) {
    const { table, operation, data } = item;

    if (operation === 'INSERT' || operation === 'UPDATE') {
      await supabase.from(table).upsert(data);
    } else if (operation === 'DELETE') {
      await supabase.from(table).delete().eq('id', data.id);
    }
  }
}

export const syncQueue = new SyncQueue();

// 온라인 감지
window.addEventListener('online', () => {
  console.log('Back online, syncing...');
  syncQueue.sync();
});
```

---

#### 해결방안 4: 충돌 해결 (Conflict Resolution)

**Last Write Wins (LWW) 전략:**
```typescript
// lib/conflictResolution.ts
export async function resolveConflict(
  localData: any,
  serverData: any
): Promise<any> {
  // updated_at 타임스탬프 비교
  const localTime = new Date(localData.updated_at).getTime();
  const serverTime = new Date(serverData.updated_at).getTime();

  if (localTime > serverTime) {
    // 로컬이 더 최신: 서버에 업로드
    await supabase
      .from('user_progress')
      .upsert(localData);
    return localData;
  } else {
    // 서버가 더 최신: 로컬 업데이트
    return serverData;
  }
}
```

**CRDTs (Conflict-free Replicated Data Types) 전략:**
```typescript
// 복잡하지만 더 정교한 충돌 해결
// 예: review_count는 항상 증가만 하므로 max() 사용
export function mergeProgress(local: any, server: any) {
  return {
    completed: local.completed || server.completed,
    review_count: Math.max(local.review_count, server.review_count),
    last_reviewed_at: new Date(
      Math.max(
        new Date(local.last_reviewed_at).getTime(),
        new Date(server.last_reviewed_at).getTime()
      )
    ).toISOString()
  };
}
```

---

## 🗂️ 데이터베이스 스키마 개선 권장사항

### 1. TypeScript 타입 동기화

**문제:**
`database.types.ts`에 `letters`, `icon_svg` 컬럼이 없음

**해결:**
```bash
# Supabase CLI로 타입 재생성
npx supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts
```

**수동 추가:**
```typescript
// src/lib/database.types.ts
words: {
  Row: {
    // ... 기존 필드
    letters: string | null      // 추가
    icon_svg: string | null     // 추가
  }
}
```

---

### 2. 사용자 설정 테이블 추가

**마이그레이션:**
```sql
-- supabase/migrations/004_user_preferences.sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dark_mode BOOLEAN DEFAULT false,
  show_hebrew_hint BOOLEAN DEFAULT true,
  font_size INTEGER DEFAULT 16 CHECK (font_size >= 12 AND font_size <= 24),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

### 3. 동기화 메타데이터 컬럼 추가

```sql
-- 모든 사용자 데이터 테이블에 추가
ALTER TABLE user_progress
  ADD COLUMN device_id TEXT,
  ADD COLUMN sync_version INTEGER DEFAULT 1,
  ADD COLUMN last_synced_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE user_favorites
  ADD COLUMN device_id TEXT,
  ADD COLUMN sync_version INTEGER DEFAULT 1,
  ADD COLUMN last_synced_at TIMESTAMPTZ DEFAULT NOW();
```

---

## 📋 구현 우선순위

### Phase 1: 즉시 적용 (1-2주)
1. ✅ **DOMPurify 적용** (XSS 방지)
2. ✅ **CSP 헤더 추가**
3. ✅ **환경변수 검증 강화**
4. ✅ **database.types.ts 동기화**

### Phase 2: 단기 개선 (2-4주)
1. ✅ **Realtime 구독 구현**
2. ✅ **낙관적 업데이트 적용**
3. ✅ **사용자 설정 테이블 추가**
4. ✅ **에러 핸들링 개선**

### Phase 3: 중장기 개선 (1-2개월)
1. ✅ **오프라인 지원 (PWA)**
2. ✅ **IndexedDB 캐싱**
3. ✅ **동기화 큐 구현**
4. ✅ **충돌 해결 로직**

---

## 📦 필요한 패키지

```bash
# Phase 1
npm install dompurify
npm install @types/dompurify --save-dev

# Phase 3
npm install dexie
npm install dexie-react-hooks
npm install vite-plugin-pwa --save-dev
npm install workbox-window
```

---

## 🧪 테스트 전략

### 보안 테스트
```typescript
// tests/security/xss.spec.ts
test('SVG 아이콘에 스크립트 삽입 방지', async () => {
  const maliciousSvg = '<svg><script>alert("XSS")</script></svg>';
  const sanitized = DOMPurify.sanitize(maliciousSvg, { USE_PROFILES: { svg: true } });
  expect(sanitized).not.toContain('<script>');
});
```

### 동기화 테스트
```typescript
// tests/sync/realtime.spec.ts
test('여러 기기 간 실시간 동기화', async () => {
  // Device 1: 진행도 업데이트
  await device1.markAsCompleted(verseId);

  // Device 2: 자동 반영 확인
  await waitFor(() => {
    expect(device2.getProgress(verseId).completed).toBe(true);
  });
});
```

---

## 📚 참고 자료

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [PWA Best Practices](https://web.dev/pwa/)
- [IndexedDB Guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## ✅ 체크리스트

### 보안
- [ ] DOMPurify 설치 및 적용
- [ ] CSP 헤더 설정
- [ ] 환경변수 .gitignore 확인
- [ ] RLS 정책 검토
- [ ] API 키 로테이션 스케줄 설정

### 동기화
- [ ] Realtime 구독 구현
- [ ] 낙관적 업데이트 적용
- [ ] 오프라인 감지 로직
- [ ] 동기화 큐 구현
- [ ] 충돌 해결 전략 선택

### 데이터베이스
- [ ] database.types.ts 업데이트
- [ ] user_preferences 테이블 생성
- [ ] 동기화 메타데이터 컬럼 추가
- [ ] 인덱스 최적화

---

생성일: 2025-10-21
최종 수정: 2025-10-21
