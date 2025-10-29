# Icon URL Update Log

## 날짜: 2025-10-29

### 📊 업데이트 요약

Genesis 단어들의 icon_url 필드를 Supabase Storage의 기존 이미지와 매칭하여 업데이트했습니다.

### 🎯 결과

#### Before
- **Total Genesis words**: 2,793
- **With icon_url**: 7 (0.3%)
- **Without icon_url**: 2,786 (99.7%)

#### After
- **Total Genesis words**: 2,793
- **With icon_url**: 257 (9.2%)
- **Without icon_url**: 2,536 (90.8%)
- **Improvement**: +250 words (36.7x increase)

### 📈 챕터별 커버리지

| Chapter | Total Words | With Icon | Coverage |
|---------|-------------|-----------|----------|
| 1       | 274         | 7         | 2.6%     |
| 2-9     | 1,681       | 0         | 0.0%     |
| 10      | 173         | 66        | 38.2%    |
| 11      | 171         | 41        | 24.0%    |
| 12      | 180         | 70        | 38.9%    |
| 13      | 110         | 29        | 26.4%    |
| 14      | 87          | 39        | 44.8% ⭐ |
| 15      | 117         | 5         | 4.3%     |

### 🔍 매핑 방법

1. **UUID 기반 파일 확인**
   - Supabase Storage: `hebrew-icons/icons/` 버킷에 974개 UUID 파일
   - 로컬 파일: `output/all_words_jpg/` 폴더에 1,000개 파일

2. **word ID와 UUID 매칭**
   - `match_uuid_images.ts` 스크립트 사용
   - word table의 id (UUID)와 파일명의 UUID 매칭
   - 250개 성공적 매칭

3. **데이터베이스 업데이트**
   - `update_to_uuid_urls.ts` 스크립트 실행
   - 250개 단어의 icon_url 필드 업데이트
   - 에러 없이 100% 성공

### 📝 특이사항

- **Genesis 1:1**: 별도로 `word_icons/` 폴더의 이름 기반 파일 사용
  - bereshit.jpg, bara.jpg, elohim.jpg 등
  - 이미 이전에 수동 업데이트 완료

- **Chapters 10-14**: 가장 높은 이미지 커버리지
  - 이 구절들의 단어에 집중적으로 이미지 생성됨
  - Chapter 14가 최고 44.8% 커버리지

- **Chapters 2-9**: 이미지 없음
  - 향후 이미지 생성 필요

### 🛠️ 사용된 스크립트

1. `match_uuid_images.ts` - UUID 파일과 word ID 매칭
2. `update_to_uuid_urls.ts` - 데이터베이스 icon_url 업데이트
3. `scripts/utils/updateIconUrlsForGenesis1_1.ts` - Genesis 1:1 전용 업데이트

### 📦 Storage 구조

```
hebrew-icons/
├── icons/           # 974 files (UUID-based)
│   └── word_{UUID}.jpg
└── word_icons/      # 14 files (name-based)
    ├── bereshit.jpg
    ├── bara.jpg
    └── ...
```

### 🚀 다음 단계

- [ ] Genesis 2-9장 단어들에 대한 이미지 생성
- [ ] 나머지 2,536개 단어에 대한 이미지 생성 계획
- [ ] 전체 Genesis 100% 커버리지 달성
