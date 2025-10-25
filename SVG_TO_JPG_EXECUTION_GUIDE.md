# 🚀 SVG → JPG 전환 실행 가이드

**작성일**: 2025-10-25
**상태**: ✅ 준비 완료
**예상 소요 시간**: 30-60분

---

## 📋 준비 상황

### ✅ 완료된 작업

1. **Supabase Storage**
   - ✅ hebrew-icons bucket 생성 완료
   - ✅ Public access 설정 완료

2. **스크립트 작성**
   - ✅ JPG 생성 스크립트 (`scripts/migrations/04_generate_all_jpgs.ts`)
   - ✅ 업로드 및 URL 업데이트 스크립트 (`scripts/migrations/05_upload_and_update_urls.ts`)

3. **프론트엔드 수정**
   - ✅ HebrewIcon 컴포넌트 수정 (iconUrl prop 추가)
   - ✅ database.types.ts 수정 (icon_url 필드 추가)
   - ✅ useWords hook 수정 (icon_url select 추가)
   - ✅ FlashCard 컴포넌트 수정 (iconUrl 전달)

---

## 🎯 실행 순서

### Step 1: DB 스키마 변경 (수동)

**Supabase Dashboard → SQL Editor에서 실행**:

```sql
ALTER TABLE words ADD COLUMN IF NOT EXISTS icon_url TEXT;

COMMENT ON COLUMN words.icon_url IS 'JPG 아이콘 Supabase Storage URL';
```

**실행 방법**:
1. Supabase Dashboard 접속: https://supabase.com/dashboard
2. 프로젝트 선택
3. 왼쪽 메뉴 → SQL Editor
4. "New Query" 클릭
5. 위 SQL 붙여넣기
6. "RUN" 버튼 클릭

**확인**:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'words' AND column_name = 'icon_url';
```

결과:
```
 column_name | data_type
-------------+-----------
 icon_url    | text
```

---

### Step 2: JPG 생성

```bash
npx tsx scripts/migrations/04_generate_all_jpgs.ts
```

**예상 결과**:
```
🎨 모든 단어의 JPG 아이콘 생성 시작

📊 총 1234개 단어 발견

✅ [1/1234] בְּרֵאשִׁית (divine) → word_xxx.jpg (29 KB)
✅ [2/1234] בָּרָא (creation) → word_yyy.jpg (35 KB)
✅ [3/1234] אֱלֹהִים (divine) → word_zzz.jpg (15 KB)
...

🎉 JPG 생성 완료!
📁 출력 위치: /path/to/output/all_words_jpg
```

**소요 시간**: 5-10분 (1234개 단어)

**확인**:
```bash
ls -lh output/all_words_jpg/ | head -10
```

---

### Step 3: Supabase Storage 업로드 & DB 업데이트

```bash
npx tsx scripts/migrations/05_upload_and_update_urls.ts
```

**예상 결과**:
```
📤 JPG 업로드 및 URL 업데이트 시작

📁 1234개 JPG 파일 발견

✅ [1/1234] word_xxx.jpg (29 KB) → https://xxx.supabase.co/storage/v1/object/public/hebrew-icons/icons/word_xxx.jpg
✅ [2/1234] word_yyy.jpg (35 KB) → https://yyy.supabase.co/storage/v1/object/public/hebrew-icons/icons/word_yyy.jpg
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 업로드 성공: 1234/1234
❌ 실패: 0/1234
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 모든 파일 업로드 및 DB 업데이트 완료!
```

**소요 시간**: 10-20분 (네트워크 속도에 따라)

**확인**:
```bash
# Supabase Dashboard → Storage → hebrew-icons
# icons 폴더에 1234개 JPG 파일이 있는지 확인
```

---

### Step 4: 프론트엔드 테스트

```bash
npm run dev
```

브라우저에서 http://localhost:5173 접속

**확인 사항**:
1. ✅ 플래시카드에 JPG 이미지가 표시되는가?
2. ✅ 이미지가 파스텔 색감인가?
3. ✅ 이미지가 화려한가?
4. ✅ 로딩 속도가 괜찮은가?

**Chrome DevTools → Network 탭 확인**:
- JPG 파일들이 `hebrew-icons` storage에서 로드되는지 확인
- 200 OK (첫 로드), 304 Not Modified (캐시) 응답

---

### Step 5: 빌드 및 배포

#### 로컬 빌드 테스트

```bash
npm run build
```

**기대 결과**:
```
✓ 1980 modules transformed.
✓ built in 1.55s
```

#### Git commit & push

```bash
git add .
git commit -m "Migrate from SVG to JPG icons with Canvas API

- Add icon_url field to words table
- Generate JPG icons with Canvas API (pastel colors)
- Upload to Supabase Storage
- Update frontend to prioritize JPG over SVG
- Reduce API costs from $40 to $0.64/month (98% savings)
"
git push origin main
```

#### Vercel 자동 배포 확인

1. Vercel Dashboard 접속
2. 최신 배포 상태 "Building..." → "Ready" 확인
3. Production URL 클릭
4. 플래시카드에서 JPG 이미지 정상 표시 확인

---

## 🔍 검증 체크리스트

### DB 검증

```bash
# SQL Editor에서 실행
SELECT
  COUNT(*) as total_words,
  COUNT(icon_url) as has_icon_url,
  COUNT(icon_svg) as has_icon_svg,
  COUNT(*) - COUNT(icon_url) as null_icon_url
FROM words;
```

**기대 결과**:
```
 total_words | has_icon_url | has_icon_svg | null_icon_url
-------------+--------------+--------------+---------------
        1234 |         1234 |         1000 |             0
```

### Storage 검증

```bash
# Supabase Dashboard → Storage → hebrew-icons
# 파일 수: 1234개
# 총 용량: ~30-40 MB
```

### 프론트엔드 검증

**브라우저 콘솔 로그 확인**:
```javascript
// 정상: iconUrl 우선 사용
[HebrewIcon] Using JPG: word_xxx.jpg

// Fallback: iconSvg 사용 (icon_url이 없는 경우)
[HebrewIcon] Using SVG for word: xyz
```

---

## ⚠️ 문제 해결

### 문제 1: JPG 생성 실패

**증상**:
```
❌ [123/1234] word_abc.jpg 실패: Canvas error
```

**해결**:
```bash
# Canvas 재설치
npm install canvas

# macOS 의존성 설치
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

### 문제 2: 업로드 실패

**증상**:
```
❌ word_abc.jpg 업로드 실패: Storage error
```

**원인**:
- Supabase Storage quota 초과
- 네트워크 오류

**해결**:
```bash
# 실패한 파일만 재시도
# scripts/migrations/05_upload_and_update_urls.ts 재실행
npx tsx scripts/migrations/05_upload_and_update_urls.ts
```

### 문제 3: 이미지가 표시되지 않음

**증상**:
- 플래시카드에 기본 아이콘 (FileText) 표시

**확인**:
1. DB에 icon_url 있는지 확인
2. URL이 유효한지 브라우저에서 직접 접속
3. CORS 오류 없는지 콘솔 확인

**해결**:
```sql
-- URL 확인
SELECT id, hebrew, icon_url
FROM words
WHERE icon_url IS NOT NULL
LIMIT 5;

-- URL이 비어있으면 재업로드
```

---

## 📊 성능 비교

| 항목 | SVG (이전) | JPG (새로운) | 개선 |
|------|-----------|-------------|------|
| **API 비용** | $40 (1000개) | $0 | **100% 절감** |
| **Storage 비용** | ~$0 (DB 내) | ~$0.64/month | +$0.64 |
| **총 비용** | **$40** | **$0.64** | **98% 절감** |
| **파일 크기** | 1-3 KB (SVG 문자열) | 15-50 KB (JPG) | - |
| **로딩 방식** | 인라인 | 네트워크 (캐시 가능) | - |
| **색상 표현** | 제한적 | 풍부 (파스텔) | ✅ 향상 |
| **화려함** | 보통 | 매우 화려 | ✅ 향상 |

---

## 🎉 완료 후 정리

### 선택사항: icon_svg 필드 제거

**모든 단어가 JPG로 전환된 후**:

```sql
-- ⚠️ 주의: 백업 먼저!
CREATE TABLE words_backup AS SELECT * FROM words;

-- icon_svg 필드 삭제
ALTER TABLE words DROP COLUMN icon_svg;

-- 타입 재생성 (Supabase Dashboard)
```

### 문서 업데이트

- [ ] README.md 업데이트
- [ ] 가이드라인 문서 보관
- [ ] 마이그레이션 완료 기록

---

## ✅ 완료 확인

모든 단계를 완료한 후:

- [ ] DB에 icon_url 필드 존재
- [ ] 모든 단어에 icon_url 값 존재 (NULL = 0)
- [ ] Supabase Storage에 1234개 JPG 파일 존재
- [ ] 로컬에서 JPG 이미지 정상 표시
- [ ] Vercel Production에서 JPG 이미지 정상 표시
- [ ] 파스텔 색감 확인
- [ ] 화려한 디자인 확인
- [ ] 로딩 성능 만족 (< 2초)

---

**다음 단계**: 완료 후 사용자 피드백 수집 및 디자인 개선

**문의**: 문제 발생 시 이 가이드 참조 또는 GitHub Issues 등록
