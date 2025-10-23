# 올바른 개발 진행상황 분석 프로세스

## 문제점
- 문서만 읽고 실제 상태 확인 안함
- 커밋 메시지를 읽고도 의미 파악 못함
- DB 상태를 나중에 확인함

## 올바른 순서

### 1️⃣ Git 최신화
```bash
git pull origin main
```

### 2️⃣ 실제 상태 확인 (가장 중요!)

#### A. 데이터베이스 상태
```bash
npx tsx check_db_status.ts
```
- 어떤 테이블이 있나?
- 데이터가 몇 개나 있나?
- 샘플 데이터는?

#### B. 파일 시스템 상태
```bash
# 새로 추가된 파일
git diff HEAD~10 HEAD --name-status | grep "^A"

# 최근 변경된 파일
git diff HEAD~10 HEAD --name-only
```

#### C. 실행 중인 서비스
```bash
# Dev 서버가 돌아가나?
# 어떤 포트인가?
# 에러는 없나?
```

### 3️⃣ 최근 커밋 분석
```bash
git log --oneline -10
git show [commit-hash] --stat
```
- 무엇이 변경되었나?
- 스크립트가 실행되었나?
- 마이그레이션이 완료되었나?

### 4️⃣ 문서 읽기
```bash
# 문서는 참고용, 실제 상태가 정답!
- README.md
- MIGRATION_GUIDE.md
- PHASE_COMPLETION_SUMMARY.md
```

### 5️⃣ 실제와 문서 대조
```
실제: hebrew_roots 테이블에 42개 행
문서: "샘플 4개 어근"

→ 문서가 outdated! 실제 상태가 맞음!
```

### 6️⃣ 결론 도출
```
Phase 1: ✅ 완료 (5개 테이블)
Phase 2: 🟡 50% (42개 어근, 152개 매핑 완료)
Phase 3: 🟡 40% (UI 구현됨, word_metadata 필요)
Phase 4: 🔴 0% (미시작)
```

---

## 체크리스트

개발 진행상황 파악 시 반드시:

- [ ] 1. DB 실제 상태 확인
- [ ] 2. 파일 시스템 변경사항 확인
- [ ] 3. 최근 커밋 상세 분석
- [ ] 4. 문서 읽기 (참고용)
- [ ] 5. 실제와 문서 대조
- [ ] 6. 불일치 시 실제 상태를 정답으로

---

## 교훈

**"Trust, but verify"**
- 문서를 읽되, 맹신하지 말 것
- 항상 실제 상태를 확인할 것
- DB 상태 > 파일 상태 > 문서 순으로 신뢰

**"Source of truth"**
- 데이터베이스 = 현재 상태의 진실
- 코드 = 기능의 진실
- 문서 = 의도의 참고자료 (outdated 가능)
