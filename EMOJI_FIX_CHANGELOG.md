# Emoji 누락 문제 수정 완료

## 📅 날짜
2025-10-21

## 🎯 문제 설명
구절 컨텐츠 업데이트 시 emoji가 제대로 표시되지 않는 문제:
- DB의 `words` 테이블에서 `emoji` 필드가 `NULL`인 경우
- 모든 단어가 똑같은 기본값 `'📜'` (두루마리)로 표시됨
- 어떤 단어의 emoji가 누락되었는지 파악하기 어려움

## ✅ 해결 방법

### 1. 기본값 변경: `'📜'` → `'❓'`

**파일**: `src/hooks/useVerses.ts:167`

**변경 전**:
```typescript
emoji: w.emoji || '📜',  // 모든 누락된 emoji가 📜로 표시
```

**변경 후**:
```typescript
emoji: w.emoji || '❓',  // ❓ = emoji 누락 (DB에 추가 필요)
```

**효과**:
- 누락된 emoji를 명확히 시각적으로 표시
- 사용자가 어떤 단어에 emoji가 없는지 즉시 확인 가능

---

### 2. 콘솔 경고 추가

**파일**: `src/hooks/useVerses.ts:161-163`

**추가된 코드**:
```typescript
// Emoji 누락 감지 및 경고
if (!w.emoji) {
  console.warn(`⚠️  Emoji 누락: ${verse.reference} - ${w.hebrew} (${w.meaning})`)
}
```

**효과**:
- 개발자 도구 콘솔에서 emoji 누락 단어 즉시 확인 가능
- 어떤 구절의 어떤 단어인지 정확히 알 수 있음
- 디버깅 및 데이터 품질 관리 향상

---

## 🔍 예시

### 기존 동작 (문제)
```
창세기 5:1 - 단어 분석
📜 תּוֹלְדֹת (tolədot) - 족보
📜 אָדָם (adam) - 아담
📜 בָּרָא (bara) - 창조하셨다
```
→ 모든 단어가 같은 이모지로 구분 불가

### 수정 후 동작 (해결)
```
창세기 5:1 - 단어 분석
❓ תּוֹלְדֹת (tolədot) - 족보
❓ אָדָם (adam) - 아담
✨ בָּרָא (bara) - 창조하셨다
```
→ 누락된 emoji가 ❓로 표시되어 명확함

**콘솔 경고**:
```
⚠️  Emoji 누락: 창세기 5:1 - תּוֹלְדֹת (족보)
⚠️  Emoji 누락: 창세기 5:1 - אָדָם (아담)
```

---

## 📊 영향 범위

### 긍정적 영향
1. **사용자 경험**:
   - emoji 누락 문제를 즉시 시각적으로 인지
   - 데이터 품질 문제를 명확히 표시

2. **개발자 경험**:
   - 콘솔 경고로 누락 단어 즉시 파악
   - 디버깅 시간 단축
   - 데이터 마이그레이션 검증 용이

3. **데이터 품질 관리**:
   - emoji 누락을 사전에 방지
   - 자동 검증 가능

### 부정적 영향
- 없음 (기존 기능에 영향 없음)

---

## 🚀 다음 단계 권장사항

### 1. DB의 NULL emoji 수정
```sql
-- emoji가 NULL인 단어 찾기
SELECT verse_id, hebrew, meaning, emoji
FROM words
WHERE emoji IS NULL
LIMIT 10;

-- 임시로 기본 emoji 설정 (선택사항)
UPDATE words
SET emoji = '❓'
WHERE emoji IS NULL;
```

### 2. 마이그레이션 스크립트 개선

**모든 마이그레이션 스크립트에서 emoji 검증 추가**:

```typescript
// scripts/saveVerseContent.ts 등
function validateWord(word: Word): string[] {
  const errors: string[] = [];

  if (!word.emoji) {
    errors.push(`${word.hebrew}: emoji 필드 누락`);
  }
  if (!word.meaning) {
    errors.push(`${word.hebrew}: meaning 필드 누락`);
  }
  if (!word.root) {
    errors.push(`${word.hebrew}: root 필드 누락`);
  }

  return errors;
}

// 사용 예시
for (const word of verse.words) {
  const errors = validateWord(word);
  if (errors.length > 0) {
    console.error(`❌ ${verse.reference} 단어 검증 실패:`);
    errors.forEach(e => console.error(`   - ${e}`));
    throw new Error('단어 데이터 검증 실패');
  }
}
```

### 3. AI 컨텐츠 생성 시 emoji 필수 포함

**프롬프트에 명시적으로 추가**:
```typescript
const prompt = `
다음 히브리어 단어를 분석해주세요.

단어: ${word.hebrew}

반환 형식 (JSON):
{
  "hebrew": "${word.hebrew}",
  "meaning": "...",
  "ipa": "...",
  "korean": "...",
  "root": "...",
  "grammar": "...",
  "emoji": "..."  // ← 필수! 단어의 의미를 표현하는 이모지
}

⚠️ emoji 필드는 반드시 포함해야 합니다.
`;
```

---

## 🧪 테스트 방법

### 1. 브라우저 콘솔 확인
1. `http://localhost:5177` 접속
2. Genesis 5장으로 이동
3. 개발자 도구 (F12) → Console 탭
4. emoji 누락 경고 메시지 확인

### 2. UI 확인
1. 단어 분석 섹션 열기
2. ❓ 이모지가 있는지 확인
3. 해당 단어의 emoji를 DB에 추가 필요

### 3. 자동 검증
```bash
# 테스트 실행
npm run test

# 특정 챕터 확인
npm run check:data -- --chapter 5
```

---

## 📝 관련 문서

- `docs/CONTENT_UPDATE_TROUBLESHOOTING.md` - 전체 문제 해결 가이드
- `VERSE_CREATION_GUIDELINES.md` - 컨텐츠 작성 가이드
- `src/hooks/useVerses.ts:161-177` - 수정된 코드

---

## 📌 체크리스트

향후 구절 컨텐츠 추가 시 확인사항:

- [ ] 모든 단어에 `emoji` 필드 포함
- [ ] emoji가 단어의 의미를 적절히 표현
- [ ] 마이그레이션 전 검증 스크립트 실행
- [ ] 브라우저 콘솔에서 경고 메시지 없는지 확인
- [ ] UI에서 ❓ 이모지 없는지 확인

---

**작성자**: Claude Code Agent
**버전**: 1.0
**상태**: ✅ 완료
