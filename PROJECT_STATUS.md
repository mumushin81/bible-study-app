# 프로젝트 진행 상황

> 마지막 업데이트: 2025-10-21

## 📋 전체 진행 상황 요약

| 단계 | 상태 | 진행률 | 비고 |
|------|------|--------|------|
| 원문 크롤링 | ✅ 완료 | 100% (50장) | genesis-full-oshb.json |
| 컨텐츠 생성 | 🟡 진행중 | 6% (3/50장) | generated_v2/ |
| DB 업로드 | ❌ 미시작 | 0% | verses 테이블 비어있음 |

---

## 1. 원문 크롤링 상태

### ✅ 완료
- **파일**: `data/genesis-full-oshb.json`
- **범위**: 창세기 1-50장 전체
- **총 절 수**: 1,533절
- **포함 데이터**:
  - 히브리어 원문
  - 단어별 형태론 (morphology)
  - Strong's 번호 (lemmas)
  - 절 번호, ID

---

## 2. 컨텐츠 생성 상태

### 📁 위치
`data/generated_v2/`

### 📊 장별 완료 현황

| 장 | 원문 절 수 | 생성 완료 | 상태 | 파일명 패턴 |
|:--:|:--------:|:--------:|:----:|------------|
| 1 | 31 | 31/31 | ✅ | genesis_1_1.json ~ genesis_1_31.json |
| 2 | 25 | 25/25 | ✅ | genesis_2_1.json ~ genesis_2_25.json |
| 3 | 24 | 24/24 | ✅ | genesis_3_1.json ~ genesis_3_24.json |
| 4 | 26 | 0/26 | ❌ | - |
| 5 | 32 | 0/32 | ❌ | - |
| 6 | 22 | 0/22 | ❌ | - |
| 7 | 24 | 0/24 | ❌ | - |
| 8 | 22 | 0/22 | ❌ | - |
| 9 | 29 | 0/29 | ❌ | - |
| 10 | 32 | 0/32 | ❌ | - |
| 11-50 | ... | 0/... | ❌ | - |

**총 진행률**: 80/1533 절 (5.2%)

### 📝 생성된 컨텐츠 구조
각 절 JSON 파일 포함:
- `hebrew`: 히브리어 원문
- `ipa`: 국제음성기호
- `koreanPronunciation`: 한글 발음
- `modern`: 현대어 번역
- `words[]`: 단어별 상세 정보
  - `hebrew`, `meaning`, `ipa`, `korean`
  - `letters`: 자모 분해
  - `root`: 어근
  - `grammar`: 문법 정보
  - `emoji`: 이모지 아이콘
  - `iconSvg`: SVG 아이콘
  - `relatedWords`: 관련 단어

---

## 3. 데이터베이스 상태

### ❌ 미완료
- **테이블**: `verses`
- **현재 데이터**: 0개
- **상태**: 생성된 컨텐츠(1-3장)도 아직 업로드 안 됨

### 필요한 작업
1. 1-3장 생성된 컨텐츠 DB 업로드
2. 4-50장 컨텐츠 생성 후 DB 업로드

---

## 📂 주요 파일 위치

```
data/
├── genesis-full-oshb.json          # ✅ 원문 크롤링 완료 (1-50장, 1533절)
├── genesis-full-merged.json        # 병합된 데이터
├── genesis-full-translations.json  # 번역 데이터
├── generated/                      # 구 버전 (batch 파일)
└── generated_v2/                   # ✅ 신 버전 (1-3장 완료, 80개 파일)
    ├── genesis_1_1.json ~ genesis_1_31.json   (31개)
    ├── genesis_2_1.json ~ genesis_2_25.json   (25개)
    └── genesis_3_1.json ~ genesis_3_24.json   (24개)
```

---

## 🎯 다음 단계

### Phase 1: 현재 완료된 컨텐츠 DB 업로드
- [ ] 1-3장 컨텐츠 DB 업로드 검증
- [ ] 업로드 스크립트 확인/수정

### Phase 2: 4-50장 컨텐츠 생성
- [ ] 4장 컨텐츠 생성 (26절)
- [ ] 5장 컨텐츠 생성 (32절)
- [ ] 6-10장 컨텐츠 생성
- [ ] 11-50장 컨텐츠 생성

### Phase 3: 전체 DB 업로드
- [ ] 생성된 모든 컨텐츠 DB 업로드
- [ ] 데이터 무결성 검증

---

## ⚠️ 중요 확인사항

**작업 시작 전 반드시 확인:**
1. 원문 크롤링 ≠ 컨텐츠 생성
2. 컨텐츠 생성 ≠ DB 업로드
3. `generated_v2/` 디렉토리의 파일 수로 진행률 확인
4. DB 상태는 `npx tsx scripts/checkDBStatus.ts`로 확인

**현재 상태 요약:**
- 원문: 50장 완료 ✅
- 컨텐츠: 3장 완료, 47장 남음 🟡
- DB: 비어있음 ❌

---

## 🔍 상태 확인 명령어

```bash
# 1. 원문 크롤링 확인
cat data/genesis-full-oshb.json | python3 -c "import json, sys; print(f'Total verses: {len(json.load(sys.stdin))}')"

# 2. 컨텐츠 생성 확인
ls data/generated_v2/genesis_*.json | wc -l

# 3. 장별 컨텐츠 확인
for ch in {1..10}; do
  count=$(ls data/generated_v2/genesis_${ch}_*.json 2>/dev/null | wc -l)
  [ $count -gt 0 ] && echo "Chapter $ch: $count files"
done

# 4. DB 상태 확인
npx tsx scripts/checkDBStatus.ts
```

---

## 📅 변경 이력

- 2025-10-21: 초기 상태 문서 작성
  - 원문 크롤링 완료 확인
  - 컨텐츠 생성 1-3장만 완료 확인
  - DB 비어있음 확인
