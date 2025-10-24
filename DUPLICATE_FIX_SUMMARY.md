# 🔧 중복 SVG 문제 해결 요약

**날짜**: 2025-10-23
**상태**: ⚠️ 부분 해결 (추가 조치 필요)

---

## 📊 발견된 문제

### 창세기 1:6 분석 결과
- **총 단어**: 27개
- **고유 SVG**: 14개
- **중복 패턴**: 7개 (13개 중복 레코드)

### 주요 중복 단어
- **יְהִי** (있으라, 되라): 3개 레코드
- **וִיהִי** (그리고 되게 하라): 3개 레코드
- רָקִיעַ, בְּתוֹךְ, הַמָּיִם: 각각 3개

---

## 🎯 근본 원인

### 1️⃣ 데이터베이스 중복 레코드
```
동일한 (hebrew, verse_id) 조합이 여러 번 저장됨
- 원인: UNIQUE 제약조건 부재
- 영향: 동일 단어가 플래시카드에 여러 번 표시
```

### 2️⃣ SVG 형식 혼재
```
이전 형식: star_g3_r5t (고정 ID)
최신 형식: 있으라8555f888mh3g6nwv (DB ID + timestamp)
```

---

## ✅ 해결 작업 수행

### 1. 중복 레코드 삭제 시도
```
1차 삭제: 567개 제거
2차 삭제: 213개 제거
3차 삭제: 69개 제거
총 제거: 849개 레코드
```

### 2. 현재 상태
```
Genesis 단어 수: 1000개 (여전히)
고유 조합 수: 764개
중복 조합 수: 234개 ⚠️
```

---

## ⚠️ 미해결 이슈

### 문제: 중복이 계속 나타남

**원인 가능성**:
1. **JOIN 이슈**: `verses!inner` 조인이 여러 결과 생성
2. **데이터 재생성**: 다른 프로세스가 계속 데이터 추가
3. **Supabase 캐시**: 쿼리 결과 캐싱
4. **Realtime 구독**: 실시간 데이터 변경

### 증거:
- 삭제 후에도 단어 수가 1000개로 동일
- 중복 조합 수가 감소하지 않음
- 매번 다른 중복 샘플 출력

---

## 🔧 권장 해결 방안

### 단기 (즉시)
1. **JOIN 없이 직접 삭제**
   ```sql
   DELETE FROM words w1
   USING words w2
   WHERE w1.hebrew = w2.hebrew
     AND w1.verse_id = w2.verse_id
     AND w1.id < w2.id;
   ```

2. **UNIQUE 제약조건 추가**
   ```sql
   ALTER TABLE words
   ADD CONSTRAINT words_hebrew_verse_unique
   UNIQUE (hebrew, verse_id);
   ```

3. **전체 SVG 재생성**
   ```bash
   npx tsx scripts/migrations/regenerateAllSVGsPerGuidelines.ts
   ```

### 중기 (1주일)
1. 데이터 생성 스크립트 수정 (UPSERT 사용)
2. 중복 방지 로직 추가
3. 정기적인 중복 검사 자동화

### 장기 (1개월)
1. 데이터 무결성 모니터링 시스템
2. 자동 검증 파이프라인
3. 데이터베이스 스키마 최적화

---

## 📋 생성된 파일

### 분석 스크립트
- `scripts/debug/findDuplicateSVGsInVerse.ts` - 구절별 중복 검사
- `scripts/debug/analyzeDuplicateRootCause.ts` - 근본 원인 분석
- `scripts/debug/checkGradientIDs.ts` - Gradient ID 확인

### 삭제 스크립트
- `scripts/migrations/removeDuplicateWords.ts` - 중복 레코드 삭제
- `scripts/migrations/removeDuplicatesSQL.ts` - SQL 방식 삭제

### 보고서
- `DUPLICATE_SVG_ANALYSIS_REPORT.md` - 상세 분석 보고서
- `DUPLICATE_FIX_SUMMARY.md` - 이 요약 문서

---

## 🎯 다음 조치사항

### 우선순위 1: 데이터 정합성 확보
- [ ] verses 테이블 구조 확인
- [ ] JOIN 없이 직접 words 테이블만 쿼리
- [ ] 중복 정확히 식별 및 삭제

### 우선순위 2: 재발 방지
- [ ] UNIQUE 제약조건 추가
- [ ] 데이터 생성 스크립트 수정
- [ ] 검증 자동화

### 우선순위 3: SVG 통일
- [ ] 모든 SVG를 최신 형식으로 재생성
- [ ] Gradient ID 고유성 100% 보장
- [ ] MD Script 가이드라인 준수

---

## 📞 추가 정보 필요

1. **verses 테이블 구조**
   - word_id와 verse_id 관계 확인
   - 1:N 관계 여부 확인

2. **words 테이블 제약조건**
   - 현재 제약조건 목록
   - 인덱스 구조

3. **데이터 생성 프로세스**
   - 어떤 스크립트가 데이터 생성하는지
   - UPSERT vs INSERT 사용 여부

---

**상태**: ⚠️ 추가 조사 및 조치 필요
**담당**: Claude AI Assistant
**업데이트**: 2025-10-23
