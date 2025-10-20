# 🛡️ 데이터 무결성 문제 근본 해결 방안

## 🔴 발생한 문제

### 증상
- Genesis 3장: Words 0개, Commentaries 0개
- Genesis 2장: Words 12개만 (예상 75개 이상)
- 번역 테스트는 통과했지만 데이터 무결성 문제는 감지하지 못함

### 근본 원인
1. **테스트 범위 부족**: 번역 필드만 검증, Words/Commentaries는 미검증
2. **수동 데이터 관리**: 데이터 마이그레이션 시 일부 누락
3. **검증 자동화 부재**: PR/Push 전 데이터 무결성 자동 검증 없음

---

## ✅ 근본적인 해결 방안

### 1단계: 자동화된 데이터 무결성 테스트 (완료)

#### 파일: `tests/data-integrity.spec.ts`

**검증 항목:**
- ✅ Words & Commentaries 존재 여부
- ✅ 최소 개수 충족 (구절당 평균 3개 단어)
- ✅ Foreign Key 유효성
- ✅ 번역 필드 완성도 (TODO 없음)

**실행:**
```bash
npx playwright test tests/data-integrity.spec.ts
```

---

### 2단계: Pre-commit Hook 설정

#### 파일: `.husky/pre-commit` (설치 필요)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 데이터 무결성 검증 중..."

# 데이터 무결성 테스트 실행
npx playwright test tests/data-integrity.spec.ts --reporter=list

if [ $? -ne 0 ]; then
  echo "❌ 데이터 무결성 테스트 실패!"
  echo "커밋 전에 데이터 문제를 해결하세요."
  exit 1
fi

echo "✅ 데이터 무결성 검증 통과"
```

**설치:**
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit
```

---

### 3단계: GitHub Actions CI/CD

#### 파일: `.github/workflows/data-integrity.yml`

```yaml
name: Data Integrity Check

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

jobs:
  data-integrity:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run data integrity tests
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: npx playwright test tests/data-integrity.spec.ts --reporter=list

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: data-integrity-results
          path: test-results/
```

---

### 4단계: 정기 데이터 검증 스크립트

#### 파일: `scripts/dailyDataCheck.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function dailyCheck() {
  console.log('🔍 일일 데이터 무결성 검증 시작\\n');

  const issues: string[] = [];

  // 1. 구절별 필수 컨텐츠 확인
  const { data: verses } = await supabase
    .from('verses')
    .select('id, reference, chapter')
    .eq('book_id', 'genesis')
    .lte('chapter', 3);

  for (const verse of verses!) {
    const { count: wordsCount } = await supabase
      .from('words')
      .select('id', { count: 'exact' })
      .eq('verse_id', verse.id);

    if (wordsCount === 0) {
      issues.push(`❌ ${verse.reference}: Words 없음`);
    }
  }

  // 2. Foreign Key 유효성
  const { data: orphanWords } = await supabase
    .from('words')
    .select('id, verse_id')
    .not('verse_id', 'in',
      `(SELECT id FROM verses WHERE book_id = 'genesis')`
    );

  if (orphanWords && orphanWords.length > 0) {
    issues.push(`❌ ${orphanWords.length}개의 고아 Words 발견`);
  }

  // 3. 결과 보고
  if (issues.length > 0) {
    console.error('🔴 데이터 무결성 문제 발견:\\n');
    issues.forEach(issue => console.error(issue));
    process.exit(1);
  }

  console.log('✅ 데이터 무결성 검증 통과\\n');
}

dailyCheck();
```

**Cron Job 설정 (GitHub Actions):**
```yaml
name: Daily Data Integrity Check

on:
  schedule:
    - cron: '0 9 * * *'  # 매일 오전 9시 (UTC)

jobs:
  daily-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npx tsx scripts/dailyDataCheck.ts
```

---

### 5단계: 데이터 마이그레이션 체크리스트

#### 마이그레이션 전 필수 확인 사항:

```markdown
## 📋 데이터 마이그레이션 체크리스트

### Before 마이그레이션
- [ ] 백업 완료 (`supabase db dump`)
- [ ] Protected Zone 확인 (Words/Commentaries 있는 챕터)
- [ ] Foreign Key 관계 확인

### During 마이그레이션
- [ ] Verses UPSERT (Protected Zone)
- [ ] Verses INSERT (나머지)
- [ ] Words 보존 확인
- [ ] Commentaries 보존 확인

### After 마이그레이션
- [ ] `npx tsx scripts/checkDataRelations.ts` 실행
- [ ] `npx playwright test tests/data-integrity.spec.ts` 실행
- [ ] 앱에서 수동 확인 (Genesis 1:1, 2:7, 3:1)
- [ ] TODO 검색 (`grep -r "\\[TODO\\]" src/`)
```

---

### 6단계: 문서화 및 프로세스

#### 파일: `CONTRIBUTING.md`

```markdown
# Contributing Guide

## 데이터 추가/수정 시 필수 절차

### 1. 로컬 검증
\`\`\`bash
# 데이터 무결성 테스트
npx playwright test tests/data-integrity.spec.ts

# 전체 테스트
npx playwright test
\`\`\`

### 2. 커밋 전 확인
- [ ] 모든 테스트 통과
- [ ] TODO 없음
- [ ] 데이터 무결성 검증 통과

### 3. PR 전 확인
- [ ] CI/CD 테스트 통과
- [ ] 코드 리뷰 요청
- [ ] 변경 사항 문서화
```

---

## 📊 적용 효과

### Before (문제 상황)
```
번역 테스트: ✅ 통과
실제 앱: ❌ Genesis 3장 Words/Commentaries 없음
→ 사용자 발견 후 수정
```

### After (해결 후)
```
데이터 무결성 테스트: ❌ 실패 감지
커밋 차단: Git hook이 자동 차단
개발자 수정 → 재테스트 → ✅ 통과
→ 문제가 production에 도달하지 않음
```

---

## 🚀 즉시 실행 가능한 조치

### 1. 현재 문제 해결 (즉시)
```bash
# Genesis 2-3장 Words & Commentaries 생성
# (별도 스크립트 필요)
```

### 2. 테스트 통합 (10분)
```bash
# package.json에 스크립트 추가
npm pkg set scripts.test:integrity="playwright test tests/data-integrity.spec.ts"
npm pkg set scripts.test:all="playwright test"
```

### 3. Pre-commit Hook 설치 (5분)
```bash
npm install --save-dev husky
npx husky install
echo "npx playwright test tests/data-integrity.spec.ts" > .husky/pre-commit
chmod +x .husky/pre-commit
```

### 4. CI/CD 설정 (10분)
```bash
mkdir -p .github/workflows
# data-integrity.yml 파일 생성 (위 내용 참고)
```

---

## 🎓 교훈

### 1. "테스트 통과 ≠ 완전성"
- 번역 필드 테스트만으로는 부족
- 관계 데이터(Words, Commentaries) 검증 필수

### 2. "자동화 없으면 반복됨"
- 수동 검증은 실수 가능
- 자동화된 검증이 유일한 답

### 3. "예방이 치료보다 낫다"
- Pre-commit Hook으로 조기 차단
- CI/CD로 이중 안전장치

---

## ✅ 최종 권장사항

### 단기 (오늘)
1. ✅ 데이터 무결성 테스트 작성 (완료)
2. ⏳ Genesis 2-3장 Words/Commentaries 추가
3. ⏳ Pre-commit Hook 설치

### 중기 (이번 주)
1. ⏳ GitHub Actions CI/CD 설정
2. ⏳ 정기 검증 Cron Job 설정
3. ⏳ Contributing 가이드 작성

### 장기 (지속적)
1. ⏳ 매 PR마다 자동 검증
2. ⏳ 매일 자동 검증
3. ⏳ 문제 발생 시 Slack/이메일 알림

---

**작성일**: 2025-10-19
**문제**: Genesis 3장 Words/Commentaries 누락
**해결**: 자동화된 데이터 무결성 검증 시스템
**상태**: ✅ 테스트 완료, ⏳ 데이터 수정 대기
