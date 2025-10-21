# Manual UI Verification Checklist
**Date**: 2025-10-21
**Purpose**: Verify Genesis 6-10 content display and test Hebrew text selector fix
**URL**: http://localhost:5177

---

## ✅ 1. Genesis 6 - Noah's Flood Preparation

### Genesis 6:8 - Noah Found Grace
- [ ] Hebrew text displays: `וְנֹחַ מָצָא חֵן בְּעֵינֵי יְהוָה`
- [ ] IPA pronunciation visible
- [ ] Korean pronunciation (한글 발음) visible
- [ ] Modern Korean translation: "노아는 여호와께 은혜를 입었습니다"
- [ ] Word emojis display (no ❓ fallback)
  - Expected emojis: 🕊️ (Noah), 🎁 (grace), 👀 (eyes), 👑 (LORD)
- [ ] Commentary sections visible with colors
- [ ] "Why" question visible: "왜 하나님은 노아만 선택하셨나요?"
- [ ] Conclusion section visible

### Genesis 6:14 - Build the Ark
- [ ] Hebrew text displays correctly
- [ ] Custom SVG icons visible (not just emojis)
- [ ] Ark (תֵּבָה) has appropriate icon
- [ ] Gopher wood (עֵץ־גֹּפֶר) has tree emoji 🌲
- [ ] Commentary explains ark construction

---

## ✅ 2. Genesis 7 - The Flood Begins

### Genesis 7:16 - The LORD Shut Him In
- [ ] Hebrew: `וַיִּסְגֹּר יְהוָה בַּעֲדוֹ`
- [ ] Key word "shut" (סָגַר) has lock emoji 🔒
- [ ] Modern translation clear
- [ ] Commentary explains God's protection
- [ ] Why question about God closing the door

### Genesis 7:11 - Fountains of the Deep
- [ ] Hebrew displays with nikud (vowel points)
- [ ] "Fountains" (מַעְיְנֹת) has water emoji 💧
- [ ] "Deep" (תְּהוֹם) has depth/abyss imagery
- [ ] Commentary section about cosmic waters

---

## ✅ 3. Genesis 8 - God Remembered Noah

### Genesis 8:1 - God Remembered Noah
- [ ] Hebrew: `וַיִּזְכֹּר אֱלֹהִים אֶת־נֹחַ`
- [ ] "Remembered" (זָכַר) has brain/memory emoji 🧠
- [ ] Noah (נֹחַ) has dove emoji 🕊️
- [ ] Modern translation: "하나님께서 노아를 기억하셨습니다"
- [ ] Commentary explains covenant faithfulness
- [ ] Why question about God's memory

### Genesis 8:20 - Noah Built an Altar
- [ ] Altar (מִזְבֵּחַ) has appropriate icon ⛪
- [ ] Burnt offering words visible
- [ ] Commentary on worship after deliverance

---

## ✅ 4. Genesis 9 - Rainbow Covenant

### Genesis 9:13 - Rainbow Sign
- [ ] Hebrew: `אֶת־קַשְׁתִּי נָתַתִּי בֶּעָנָן`
- [ ] Rainbow (קֶשֶׁת) has rainbow emoji 🌈
- [ ] Cloud (עָנָן) has cloud emoji ☁️
- [ ] Custom rainbow SVG icon visible
- [ ] Modern translation clear
- [ ] Commentary section about covenant sign (color: purple)
- [ ] Why question: "왜 하나님은 무지개를 선택하셨나요?"
- [ ] Conclusion about God's promises

### Genesis 9:1 - Be Fruitful and Multiply
- [ ] Blessing words visible
- [ ] Commentary connects to Genesis 1:28
- [ ] Fruitfulness imagery in emojis

---

## ✅ 5. Genesis 10 - Table of Nations

### Genesis 10:8 - Nimrod the Mighty Hunter
- [ ] Hebrew: `וְכוּשׁ יָלַד אֶת־נִמְרֹד`
- [ ] Nimrod (נִמְרֹד) has appropriate icon
- [ ] "Mighty" (גִּבֹּר) has strength emoji 💪
- [ ] Hunter imagery visible
- [ ] Commentary on Nimrod's significance
- [ ] Why question about Nimrod's role

### Genesis 10:32 - Nations Spread
- [ ] Family/nations words clear
- [ ] "Spread" (נִפְרְדוּ) has dispersal imagery
- [ ] Commentary connects to Babel (Genesis 11)

---

## ✅ 6. UI Component Verification

### Hebrew Text Display
- [ ] `data-testid="hebrew-text"` attribute present (check DevTools)
- [ ] RTL (right-to-left) direction working
- [ ] Nikud (vowel points) rendering correctly
- [ ] Font size responsive (clamp 1rem-1.5rem)
- [ ] Dark mode toggle works for Hebrew text

### Navigation
- [ ] Chapter selector opens
- [ ] Can jump to Genesis 6
- [ ] Can jump to Genesis 7, 8, 9, 10
- [ ] "Next verse" button works
- [ ] "Previous verse" button works
- [ ] Progress indicator shows correct verse count

### Content Sections
- [ ] Verse tab displays all content
- [ ] Vocabulary tab (if exists) shows word list
- [ ] Commentary sections have colored backgrounds:
  - 🌊 Cosmic Waters → Purple
  - 🕊️ Grace & Mercy → Blue
  - 🌈 Covenant → Purple
  - 💪 Mighty Hunter → Orange

### Emojis & Icons
- [ ] No ❓ fallback emojis in Genesis 6-10
- [ ] SVG icons render properly
- [ ] Icons have gradient fills
- [ ] Icons are 64x64 size

---

## ✅ 7. Test Cases to Fix

Based on Playwright test failures, verify:

### Test: "히브리어 성경 구절 표시 확인"
- [ ] Open DevTools → Elements
- [ ] Find Hebrew text `<p>` element
- [ ] Verify `data-testid="hebrew-text"` attribute exists
- [ ] Selector `page.getByTestId('hebrew-text')` should find element

### Test: "탭 전환 기능 테스트"
- [ ] Vocabulary tab button exists with name "단어장"
- [ ] Quiz tab button exists
- [ ] Verse tab button exists with name "본문"

### Test: "스와이프 기능 테스트"
- [ ] Swipe left → next verse
- [ ] Swipe right → previous verse
- [ ] Content changes after swipe

---

## ✅ 8. Performance Check

- [ ] Page loads in < 3 seconds
- [ ] Chapter switching < 1 second
- [ ] No console errors
- [ ] No missing resource warnings
- [ ] Database queries < 500ms (check Network tab)

---

## 🐛 Issues Found

### Issue 1: [Title]
**Description**:

**Expected**:

**Actual**:

**Screenshot**:

---

### Issue 2: [Title]
**Description**:

**Expected**:

**Actual**:

**Screenshot**:

---

## 📊 Summary

**Total Checks**: 60+
**Passed**: ___ / ___
**Failed**: ___ / ___
**Pass Rate**: ___%

**Critical Issues**: ___
**Minor Issues**: ___
**Notes**: ___

---

## 🔧 Next Steps

1. [ ] Fix identified issues
2. [ ] Update test selectors for failed tests
3. [ ] Re-run Playwright tests
4. [ ] Document any changes needed
5. [ ] Create git commit with fixes

---

**Verified By**: Claude Code
**Date**: 2025-10-21
**Status**: ⏳ In Progress
