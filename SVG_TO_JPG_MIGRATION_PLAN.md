# 🔄 SVG → JPG 전환 마이그레이션 계획

**작성일**: 2025-10-25
**상태**: 📋 계획 단계
**목표**: Canvas API로 생성한 JPG 아이콘으로 전환

---

## 📊 현재 시스템 분석

### 현재 아키텍처 (SVG)

```
┌─────────────────────────────────────────┐
│ 1. SVG 생성                              │
│    Claude API → SVG 코드 (문자열)        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. 데이터베이스 저장                      │
│    words.icon_svg = "<svg>...</svg>"     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. 프론트엔드 렌더링                      │
│    <div dangerouslySetInnerHTML=.../>    │
└─────────────────────────────────────────┘
```

**장점**:
- ✅ 인라인 렌더링 (빠름)
- ✅ 별도 스토리지 불필요

**단점**:
- ❌ Claude API 비용 ($$$)
- ❌ Gradient ID 충돌
- ❌ 제한된 색상 표현
- ❌ DB 용량 증가 (1000자+ SVG 문자열)

### 목표 아키텍처 (JPG)

```
┌─────────────────────────────────────────┐
│ 1. JPG 생성                              │
│    Canvas API → JPG 파일 (바이너리)      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. 스토리지 업로드                       │
│    Supabase Storage → icons/word.jpg     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. URL 저장                              │
│    words.icon_url = "https://..."        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. 프론트엔드 렌더링                      │
│    <img src={iconUrl} />                 │
└─────────────────────────────────────────┘
```

**장점**:
- ✅ API 비용 $0
- ✅ 풍부한 색감 (파스텔)
- ✅ 화려한 그라디언트
- ✅ 작은 DB 용량 (URL만)

**단점**:
- ⚠️ 스토리지 필요
- ⚠️ 네트워크 요청 (캐싱 가능)

---

## 🎯 마이그레이션 전략

### 전략 A: 점진적 전환 (추천)

**개요**: SVG와 JPG를 병행하다가 완전 전환

```sql
-- words 테이블에 icon_url 필드 추가
ALTER TABLE words ADD COLUMN icon_url TEXT;

-- 기존 icon_svg는 유지 (백업)
-- icon_url 우선, 없으면 icon_svg fallback
```

**단계**:
1. ✅ `icon_url` 필드 추가
2. ✅ JPG 생성 및 업로드
3. ✅ 프론트엔드에서 `icon_url` 우선 사용
4. ✅ 모든 단어 전환 완료 후 `icon_svg` 제거

**장점**:
- 안전 (롤백 가능)
- 단계적 테스트 가능
- 기존 데이터 보존

**단점**:
- 일시적으로 두 필드 유지 (DB 용량)

### 전략 B: 빅뱅 전환

**개요**: 한 번에 전부 교체

```sql
-- icon_svg 삭제, icon_url 추가
ALTER TABLE words DROP COLUMN icon_svg;
ALTER TABLE words ADD COLUMN icon_url TEXT;
```

**단계**:
1. 모든 JPG 생성
2. 스토리지 업로드
3. 스키마 변경
4. 프론트엔드 배포

**장점**:
- 단순함
- 즉시 완료

**단점**:
- 위험 (롤백 어려움)
- 한 번에 모든 것 변경

### ✅ 선택: **전략 A (점진적 전환)**

안전하고 단계적으로 진행 가능

---

## 📝 Phase별 상세 계획

### Phase 1: 인프라 준비 (1일)

#### 1.1 Supabase Storage 설정

```bash
# Supabase Dashboard → Storage → Create Bucket
bucket_name: hebrew-icons
visibility: public
allowed_mime_types: image/jpeg
max_file_size: 100KB
```

**작업**:
- [ ] Bucket 생성
- [ ] Public access 설정
- [ ] CORS 설정

#### 1.2 데이터베이스 스키마 변경

```sql
-- SQL Editor에서 실행
ALTER TABLE words
ADD COLUMN icon_url TEXT;

-- 인덱스 추가 (선택)
CREATE INDEX idx_words_icon_url ON words(icon_url);

-- 코멘트 추가
COMMENT ON COLUMN words.icon_url IS 'JPG 아이콘 Supabase Storage URL';
```

**작업**:
- [ ] 스키마 변경 SQL 실행
- [ ] `database.types.ts` 재생성

#### 1.3 환경 변수 설정

```bash
# .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJyyy...  # 업로드용

# Vercel에도 동일하게 설정
```

---

### Phase 2: JPG 생성 및 업로드 (1-2일)

#### 2.1 JPG 생성 스크립트 확장

**파일**: `scripts/icons/generateAllJpgs.ts`

```typescript
import { generateDirectJpgBatch } from './generateDirectJpg'
import { supabase } from '../lib/supabase'

async function generateAllWordIcons() {
  // 1. 모든 단어 조회
  const { data: words } = await supabase
    .from('words')
    .select('id, hebrew, meaning, korean')
    .is('icon_url', null)  // JPG 없는 단어만

  console.log(`📊 총 ${words.length}개 단어 처리 예정`)

  // 2. JPG 생성
  const jpgPaths = await generateDirectJpgBatch(words, {
    outputDir: './output/all_words_jpg',
    size: 512,
    quality: 95
  })

  console.log(`✅ ${jpgPaths.length}개 JPG 생성 완료`)

  return { words, jpgPaths }
}
```

#### 2.2 Supabase Storage 업로드 스크립트

**파일**: `scripts/icons/uploadJpgsToStorage.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Admin 권한 필요
)

async function uploadJpgsToStorage() {
  const jpgDir = './output/all_words_jpg'
  const files = readdirSync(jpgDir).filter(f => f.endsWith('.jpg'))

  console.log(`📤 ${files.length}개 파일 업로드 시작`)

  for (let i = 0; i < files.length; i++) {
    const filename = files[i]
    const filepath = join(jpgDir, filename)
    const fileBuffer = readFileSync(filepath)

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('hebrew-icons')
      .upload(`icons/${filename}`, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true  // 덮어쓰기
      })

    if (error) {
      console.error(`❌ ${filename} 업로드 실패:`, error)
    } else {
      console.log(`✅ [${i + 1}/${files.length}] ${filename} 업로드 완료`)
    }

    // Rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`\n🎉 모든 파일 업로드 완료!`)
}

uploadJpgsToStorage()
```

#### 2.3 URL 업데이트 스크립트

**파일**: `scripts/icons/updateIconUrls.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function updateIconUrls() {
  // 1. 모든 단어 조회
  const { data: words } = await supabase
    .from('words')
    .select('id, hebrew')
    .is('icon_url', null)

  console.log(`🔄 ${words.length}개 단어 URL 업데이트 예정`)

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const filename = hebrewToFilename(word.hebrew) + '.jpg'

    // Public URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('hebrew-icons')
      .getPublicUrl(`icons/${filename}`)

    // DB 업데이트
    await supabase
      .from('words')
      .update({ icon_url: publicUrl })
      .eq('id', word.id)

    console.log(`✅ [${i + 1}/${words.length}] ${word.hebrew}: ${publicUrl}`)
  }

  console.log(`\n🎉 모든 URL 업데이트 완료!`)
}

function hebrewToFilename(hebrew: string): string {
  const mappings: Record<string, string> = {
    'בְּרֵאשִׁית': 'bereshit',
    'בָּרָא': 'bara',
    // ... 전체 매핑
  }

  const normalized = hebrew.replace(/[\u0591-\u05C7]/g, '')

  for (const [key, value] of Object.entries(mappings)) {
    const normalizedKey = key.replace(/[\u0591-\u05C7]/g, '')
    if (normalized === normalizedKey || hebrew === key) {
      return value
    }
  }

  return 'word_' + Math.random().toString(36).substring(2, 8)
}

updateIconUrls()
```

**작업**:
- [ ] 모든 단어의 JPG 생성
- [ ] Supabase Storage에 업로드
- [ ] `icon_url` 필드 업데이트

---

### Phase 3: 프론트엔드 수정 (1일)

#### 3.1 HebrewIcon 컴포넌트 수정

**파일**: `src/components/shared/HebrewIcon.tsx`

```typescript
import React from 'react';
import { FileText } from 'lucide-react';

interface HebrewIconProps {
  word: string;
  iconSvg?: string;   // 레거시 (fallback)
  iconUrl?: string;   // ✨ 새로 추가
  size?: number;
  className?: string;
  color?: string;
}

const HebrewIcon: React.FC<HebrewIconProps> = ({
  word,
  iconSvg,
  iconUrl,        // ✨ 새 prop
  size = 32,
  className = '',
  color = 'currentColor'
}) => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 우선순위 1: JPG 이미지 (iconUrl)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={word}
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'cover',
          borderRadius: '8px'  // 부드러운 모서리
        }}
        loading="lazy"  // 성능 최적화
      />
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 우선순위 2: SVG (레거시 fallback)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (iconSvg && iconSvg.trim().length > 0) {
    const reactId = useId();
    const uniqueId = `${word.replace(/[^a-zA-Z0-9]/g, '')}-${reactId.replace(/:/g, '-')}`;

    let processedSvg = iconSvg.replace(/id="([^"]+)"/g, `id="${uniqueId}-$1"`);
    processedSvg = processedSvg.replace(/url\(#([^)]+)\)/g, `url(#${uniqueId}-$1)`);

    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'inline-block',
        }}
        dangerouslySetInnerHTML={{ __html: processedSvg }}
      />
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 우선순위 3: 기본 아이콘
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <FileText
        size={size * 0.8}
        color={color}
        strokeWidth={1.5}
      />
    </div>
  );
};

export default HebrewIcon;
```

#### 3.2 데이터 타입 업데이트

**파일**: `src/types/index.ts`

```typescript
export interface Word {
  id: string;
  hebrew: string;
  meaning: string;
  korean: string;
  iconSvg?: string;  // 레거시
  iconUrl?: string;  // ✨ 새로 추가
  // ...
}
```

#### 3.3 useWords Hook 수정

**파일**: `src/hooks/useWords.ts`

```typescript
const { data, error } = await supabase
  .from('words')
  .select(`
    *,
    icon_url,   // ✨ 새로 추가
    icon_svg    // 레거시 fallback
  `)
  .eq('verse_id', verseId)

// 데이터 매핑
const words: Word[] = data.map(w => ({
  id: w.id,
  hebrew: w.hebrew,
  meaning: w.meaning,
  korean: w.korean,
  iconUrl: w.icon_url,    // ✨ 새로 추가
  iconSvg: w.icon_svg,    // fallback
  // ...
}))
```

**작업**:
- [ ] HebrewIcon 컴포넌트 수정
- [ ] 타입 정의 업데이트
- [ ] 모든 Hook에서 `icon_url` select 추가
- [ ] 로컬 테스트

---

### Phase 4: 테스트 및 검증 (1일)

#### 4.1 로컬 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
# - JPG 이미지 정상 표시?
# - SVG fallback 동작?
# - 로딩 속도 괜찮은가?
```

**체크리스트**:
- [ ] JPG 이미지 정상 표시
- [ ] 이미지 캐싱 동작
- [ ] 모바일 반응형
- [ ] 로딩 성능

#### 4.2 성능 측정

```javascript
// Chrome DevTools → Network
// - 이미지 로딩 시간 측정
// - 캐싱 확인 (200 → 304)

// Lighthouse 점수
// - Performance: 90+
// - Best Practices: 90+
```

#### 4.3 Vercel 배포

```bash
git add .
git commit -m "Migrate from SVG to JPG icons"
git push origin main

# Vercel 자동 배포
# - Production URL 확인
# - 환경변수 설정 확인
```

**작업**:
- [ ] 로컬 테스트 통과
- [ ] 성능 검증
- [ ] Vercel 배포
- [ ] Production 테스트

---

### Phase 5: 정리 및 최적화 (1일)

#### 5.1 icon_svg 필드 제거 (선택)

**모든 단어가 JPG로 전환된 후**:

```sql
-- 백업 먼저!
CREATE TABLE words_backup AS SELECT * FROM words;

-- icon_svg 필드 삭제
ALTER TABLE words DROP COLUMN icon_svg;

-- 타입 재생성
```

#### 5.2 CDN 최적화 (선택)

Supabase Storage는 자동 CDN 제공, 추가 설정 불필요

#### 5.3 문서 정리

- [ ] README 업데이트
- [ ] 가이드라인 문서 보관
- [ ] 마이그레이션 기록 문서화

---

## 📋 전체 일정

| Phase | 작업 | 소요 시간 | 담당 |
|-------|------|----------|------|
| **Phase 1** | 인프라 준비 | 1일 | 개발자 |
| **Phase 2** | JPG 생성 및 업로드 | 1-2일 | 스크립트 |
| **Phase 3** | 프론트엔드 수정 | 1일 | 개발자 |
| **Phase 4** | 테스트 및 검증 | 1일 | 개발자 |
| **Phase 5** | 정리 및 최적화 | 1일 | 개발자 |
| **총계** | | **5-6일** | |

---

## 💰 비용 분석

### 기존 방식 (SVG)

| 항목 | 비용 | 비고 |
|------|------|------|
| Claude API | $0.04/image | 1000개 = **$40** |
| DB Storage | ~$0.01/GB | 1MB SVG 문자열 |
| **총계** | **~$40+** | 매번 재생성 시 추가 |

### 새 방식 (JPG)

| 항목 | 비용 | 비고 |
|------|------|------|
| Canvas API | **$0** | 로컬 생성 |
| Supabase Storage | ~$0.021/GB | 1000개 × 30KB = **~$0.63/month** |
| DB Storage | ~$0.01/GB | URL만 (100자) |
| **총계** | **~$0.64/month** | **98% 절감!** |

---

## ⚠️ 리스크 및 대응

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|----------|
| **Storage 장애** | 중 | Supabase 백업, CloudFlare R2 대안 |
| **이미지 로딩 느림** | 중 | CDN 캐싱, lazy loading |
| **JPG 품질 저하** | 저 | Quality 95 사용, PNG 대안 |
| **마이그레이션 실패** | 고 | 점진적 전환 (icon_svg 유지) |

---

## ✅ 성공 기준

- [ ] 모든 단어 (1000개+)에 JPG 아이콘 적용
- [ ] 페이지 로딩 시간 < 2초
- [ ] 이미지 품질 만족 (파스텔, 화려함)
- [ ] 모바일 반응형 정상
- [ ] Lighthouse 점수 90+
- [ ] API 비용 $0
- [ ] Storage 비용 < $1/month

---

## 🎯 결론

### 장점 요약

1. **비용 절감**: API 비용 98% 절감 ($40 → $0.64/month)
2. **품질 향상**: 파스텔 색감, 화려한 그라디언트
3. **유지보수**: 프로그래밍 방식으로 일관성 있는 생성
4. **성능**: 적절한 파일 크기 (15-50 KB)

### 권장 사항

✅ **마이그레이션 진행 추천**

- 점진적 전환 (Phase 1-5)
- icon_url 우선, icon_svg fallback
- 완전 전환 후 icon_svg 제거

---

**최종 업데이트**: 2025-10-25
**작성자**: Claude Code
**검토 필요**: 개발팀 승인

**다음 단계**: Phase 1 인프라 준비 시작
