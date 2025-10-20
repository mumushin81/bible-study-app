━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 구절 컨텐츠 생성 테스트 - iconSvg 필드 테스트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 작업 정보
- **장**: 창세기 1장
- **구절**: 1절
- **목적**: 각 단어마다 화려한 SVG 아이콘 직접 생성 테스트

## 히브리어 원문

**1절**: בְּרֵאשִׁית, בָּרָא אֱלֹהִים, אֵת הַשָּׁמַיִם, וְאֵת הָאָרֶץ

## 작업 지시

위 구절에 대해 **VERSE_CREATION_GUIDELINES.md**의 **모든** 지침을 따라 컨텐츠를 생성해주세요.

### ⚠️ 가장 중요: iconSvg 필드!

각 단어마다 **화려하고 웅장한 커스텀 SVG 아이콘**을 직접 생성해야 합니다!

**필수 요구사항:**
- 🎨 최소 3-4가지 그라디언트 사용
- 💎 임팩트 있고 기억에 남는 디자인
- 🎯 단어 의미를 직관적으로 표현
- 🌈 4-6가지 색상으로 다채롭게
- 🚫 **API 사용 금지** - 직접 SVG 코드를 작성!

**SVG 예시 (참고만 하세요):**

בְּרֵאשִׁית (처음):
```typescript
iconSvg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="sun_bereshit">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="100%" stop-color="#FF6B35" />
    </radialGradient>
  </defs>
  <rect width="64" height="64" fill="#FFF0F5" opacity="0.3" rx="8" />
  <circle cx="32" cy="28" r="12" fill="url(#sun_bereshit)"
    filter="drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))" />
  <g stroke="#FFD700" stroke-width="2">
    <line x1="32" y1="12" x2="32" y2="18" />
    <line x1="44" y1="16" x2="40" y2="20" />
  </g>
</svg>`
```

### 단어 목록 (6개)

1. **בְּרֵאשִׁית** - 처음, 태초
2. **בָּרָא** - 창조하다
3. **אֱלֹהִים** - 하나님
4. **אֵת הַשָּׁמַיִם** - 하늘들을
5. **וְאֵת** - 그리고 ~을
6. **הָאָרֶץ** - 땅

각 단어마다:
- emoji: fallback용 이모지
- iconSvg: 화려한 커스텀 SVG 코드 (필수!)

### 출력 형식

결과를 **data/generated/test_icon_svg.json** 파일로 저장해주세요.

```json
{
  "verseId": "genesis_1_1",
  "ipa": "...",
  "koreanPronunciation": "...",
  "modern": "...",
  "words": [
    {
      "hebrew": "בְּרֵאשִׁית",
      "meaning": "처음에, 태초에",
      "ipa": "...",
      "korean": "베레쉬트",
      "letters": "בְּ(be) + רֵא(re) + שִׁ(shi) + ית(t)",
      "root": "רֵאשִׁית (레쉬트)",
      "grammar": "명사",
      "emoji": "🌅",
      "iconSvg": "<svg viewBox=\"0 0 64 64\" xmlns=\"http://www.w3.org/2000/svg\">...</svg>",
      "relatedWords": ["רֹאשׁ (로쉬 - 머리)"]
    }
  ],
  "commentary": { ... }
}
```

### 중요 주의사항

✅ **각 단어마다 고유한 SVG 디자인 생성**
✅ **그라디언트 ID 충돌 방지** (예: `sun_bereshit`, `crown_elohim`)
✅ **화려한 색상과 특수 효과 사용**
✅ **API 호출 금지 - 직접 작성!**

---
**테스트 목적**: 에이전트가 직접 화려한 SVG 아이콘을 생성하는지 확인
