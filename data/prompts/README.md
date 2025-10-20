# 창세기 1장 병렬 작업 가이드

## 📊 작업 현황

- **전체 구절**: 31개
- **완료된 구절**: 6개 (1:5, 1:8, 1:13, 1:19, 1:23, 1:31)
- **남은 구절**: 25개
- **배치 수**: 5개 (각 5개 구절)

---

## 🚀 병렬 작업 방법

### 1. 5개의 Claude Code 창 열기

별도의 Claude Code 세션 5개를 동시에 열어주세요.

### 2. 각 창에 배치 프롬프트 붙여넣기

각 Claude Code 창에 아래 파일의 내용을 복사하여 붙여넣으세요:

| 창 번호 | 프롬프트 파일 | 구절 범위 | 저장 파일명 |
|---------|--------------|-----------|-------------|
| 1번 창 | `genesis_1_batch1.md` | 1:1, 1:2, 1:3, 1:4, 1:6 | `genesis_1_batch1.json` |
| 2번 창 | `genesis_1_batch2.md` | 1:7, 1:9, 1:10, 1:11, 1:12 | `genesis_1_batch2.json` |
| 3번 창 | `genesis_1_batch3.md` | 1:14, 1:15, 1:16, 1:17, 1:18 | `genesis_1_batch3.json` |
| 4번 창 | `genesis_1_batch4.md` | 1:20, 1:21, 1:22, 1:24, 1:25 | `genesis_1_batch4.json` |
| 5번 창 | `genesis_1_batch5.md` | 1:26, 1:27, 1:28, 1:29, 1:30 | `genesis_1_batch5.json` |

### 3. JSON 생성 대기

각 Claude Code가 JSON 배열을 생성할 때까지 기다립니다.

### 4. JSON 파일 저장

생성된 각 JSON을 `data/generated/` 폴더에 저장:

```bash
# 폴더가 없으면 생성
mkdir -p data/generated

# 각 배치 결과를 해당 파일명으로 저장
# - data/generated/genesis_1_batch1.json
# - data/generated/genesis_1_batch2.json
# - data/generated/genesis_1_batch3.json
# - data/generated/genesis_1_batch4.json
# - data/generated/genesis_1_batch5.json
```

### 5. Supabase에 저장

모든 JSON 파일 생성이 완료되면, 순차적으로 Supabase에 저장:

```bash
npm run save:content -- data/generated/genesis_1_batch1.json
npm run save:content -- data/generated/genesis_1_batch2.json
npm run save:content -- data/generated/genesis_1_batch3.json
npm run save:content -- data/generated/genesis_1_batch4.json
npm run save:content -- data/generated/genesis_1_batch5.json
```

또는 한 번에:

```bash
npm run save:content -- data/generated/genesis_1_batch1.json && \
npm run save:content -- data/generated/genesis_1_batch2.json && \
npm run save:content -- data/generated/genesis_1_batch3.json && \
npm run save:content -- data/generated/genesis_1_batch4.json && \
npm run save:content -- data/generated/genesis_1_batch5.json
```

---

## ✅ 완료 확인

모든 배치가 저장되면 Supabase에서 확인:

```sql
-- 창세기 1장 전체 구절 확인
SELECT id, ipa, korean_pronunciation, modern
FROM verses
WHERE book_id = 'genesis' AND chapter = 1
ORDER BY verse_number;

-- 단어 개수 확인
SELECT verse_id, COUNT(*) as word_count
FROM words
WHERE verse_id LIKE 'genesis_1_%'
GROUP BY verse_id
ORDER BY verse_id;

-- 주석 개수 확인
SELECT verse_id, COUNT(*) as commentary_count
FROM commentaries
WHERE verse_id LIKE 'genesis_1_%'
GROUP BY verse_id
ORDER BY verse_id;
```

---

## 📁 파일 구조

```
data/
├── prompts/
│   ├── genesis_1_batch1.md  ← 배치 1 프롬프트
│   ├── genesis_1_batch2.md  ← 배치 2 프롬프트
│   ├── genesis_1_batch3.md  ← 배치 3 프롬프트
│   ├── genesis_1_batch4.md  ← 배치 4 프롬프트
│   ├── genesis_1_batch5.md  ← 배치 5 프롬프트
│   └── README.md            ← 이 파일
└── generated/
    ├── genesis_1_batch1.json  ← 저장할 위치
    ├── genesis_1_batch2.json
    ├── genesis_1_batch3.json
    ├── genesis_1_batch4.json
    └── genesis_1_batch5.json
```

---

## 💡 팁

1. **병렬 작업 장점**: 5개 창을 동시에 사용하면 작업 시간을 1/5로 단축할 수 있습니다.
2. **검증 자동화**: `npm run save:content`는 자동으로 내용을 검증합니다.
3. **오류 처리**: 검증 실패 시 오류 메시지를 확인하고 JSON을 수정하세요.
4. **단계별 저장**: 한 배치씩 저장해도 괜찮습니다. 완료된 것부터 저장하세요.

---

**작업 시작일**: 2025-01-26
**예상 완료 시간**: 병렬 작업 시 약 1-2시간
