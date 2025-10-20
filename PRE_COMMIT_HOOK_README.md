# 🛡️ Pre-commit Hook: 자동 데이터 무결성 검증

## ✅ 설치 완료!

Pre-commit hook이 성공적으로 설치되었습니다. 이제 **모든 커밋 전에 자동으로 데이터 무결성을 검증**합니다.

---

## 🔍 동작 방식

### 커밋 시도 시:
```bash
git add .
git commit -m "메시지"
```

### Pre-commit Hook 자동 실행:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Pre-commit: 데이터 무결성 검증 중...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[테스트 실행 중...]
```

### 결과:

#### ✅ 데이터 무결성 통과 시:
```
✅ 데이터 무결성 검증 통과!

→ 커밋 진행 ✅
```

#### ❌ 데이터 무결성 실패 시:
```
❌ 데이터 무결성 테스트 실패!

다음 명령으로 문제를 확인하세요:
  npm run test:integrity
  npm run check:data

커밋 전에 데이터 문제를 해결하세요.

→ 커밋 차단 ❌
```

---

## 📊 현재 검증 항목

### 1. Words & Commentaries 존재 검증
- Genesis 1-3장 각 구절에 충분한 Words 존재
- Commentaries 존재 여부

### 2. 번역 필드 완성도
- Hebrew, IPA, Korean Pronunciation 완성
- Modern, Translation 완성
- TODO 없음

### 3. Foreign Key 무결성
- Words의 verse_id 유효성
- Commentaries의 verse_id 유효성

---

## 🛠️ 수동 테스트 명령어

### 데이터 무결성 테스트
```bash
npm run test:integrity
```

### 챕터별 데이터 확인
```bash
npm run check:data
```

### 전체 테스트
```bash
npm test
```

---

## 🚨 문제 발생 시

### 1. 데이터 무결성 실패
```bash
# 문제 확인
npm run check:data

# 상세 테스트
npm run test:integrity
```

### 2. Hook 비활성화 (긴급 시만)
```bash
git commit --no-verify -m "메시지"
```
⚠️ 권장하지 않음! 데이터 무결성 문제가 production으로 갈 수 있습니다.

### 3. Hook 재설치
```bash
npx husky install
chmod +x .husky/pre-commit
```

---

## 📝 현재 알려진 문제

### Genesis 2-3장 Words/Commentaries 부족
```
❌ Genesis 2장: Words 12개 (예상 75개 이상)
❌ Genesis 3장: Words 0개, Commentaries 0개
```

**해결 방법**: Genesis 2-3장에 Words와 Commentaries 추가

---

## 🎯 장점

### Before (Pre-commit Hook 없이)
```
커밋 → Push → Production → 사용자 발견 → 긴급 수정 😱
```

### After (Pre-commit Hook 설치 후)
```
커밋 시도 → Hook 검증 → 실패 감지 → 수정 → 재검증 → ✅ 커밋
→ 문제가 production에 절대 도달하지 않음! 🎉
```

---

## 📚 관련 파일

- `.husky/pre-commit` - Pre-commit hook 스크립트
- `tests/data-integrity.spec.ts` - 데이터 무결성 테스트
- `PREVENTION_SOLUTION.md` - 근본 해결방법 전체 문서
- `package.json` - npm 스크립트 정의

---

## 🔧 Troubleshooting

### Hook이 실행되지 않는 경우
```bash
# 1. 실행 권한 확인
ls -la .husky/pre-commit

# 2. 권한 부여
chmod +x .husky/pre-commit

# 3. Git hooks 경로 확인
git config core.hooksPath

# 4. Husky 재설치
rm -rf .husky
npx husky install
```

### 테스트가 너무 느린 경우
Playwright 테스트는 실제 브라우저를 실행하므로 2-3초 소요됩니다.
이는 정상이며, 데이터 무결성을 보장하기 위해 필요합니다.

---

## ✨ 추가 개선 사항 (선택)

### 1. GitHub Actions CI/CD
커밋뿐만 아니라 PR/Push 시에도 자동 검증
→ `PREVENTION_SOLUTION.md` 참고

### 2. 정기 검증 Cron Job
매일 자동으로 데이터 무결성 검증
→ `PREVENTION_SOLUTION.md` 참고

### 3. Slack/Email 알림
문제 발생 시 자동 알림
→ `PREVENTION_SOLUTION.md` 참고

---

**설치일**: 2025-10-19
**상태**: ✅ 활성화됨
**다음 단계**: Genesis 2-3장 Words/Commentaries 추가
