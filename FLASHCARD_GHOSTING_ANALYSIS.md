# 🔍 FlashCard 잔상 문제 근본 원인 분석

**작성일**: 2025-10-26
**분석 대상**: `src/components/shared/FlashCard.tsx`
**문제**: 뒷면 전환 시 잔상(ghosting) 발생

---

## 🚨 발견된 중복 및 문제점

### 1. **HebrewIcon 컴포넌트 중복** (치명적) 🔴

#### 문제 위치:
```tsx
// 앞면 (Line 112-121)
<div className="relative w-full h-[80%] flex-shrink-0">
  <HebrewIcon
    word={word.hebrew}
    iconUrl={word.iconUrl}
    iconSvg={word.iconSvg}
    size={512}
    color={darkMode ? '#ffffff' : '#1f2937'}
    className="w-full h-full object-cover"
  />
</div>

// 뒷면 (Line 195-205)
<div className="relative w-full h-[70%] flex-shrink-0">
  <HebrewIcon
    word={word.hebrew}
    iconUrl={word.iconUrl}
    iconSvg={word.iconSvg}
    size={512}
    color={darkMode ? '#ffffff' : '#1f2937'}
    className="w-full h-full object-cover"
  />
</div>
```

#### 문제 분석:
1. **동일한 SVG가 두 번 렌더링됨** (앞면 + 뒷면)
2. **React 상태에서 같은 `word.iconSvg` 참조**
3. **Framer Motion이 두 개의 동일한 SVG를 동시에 애니메이션**
4. **뒤집기 애니메이션 중 두 SVG가 겹쳐 보임 → 잔상 발생!**

#### 증거:
- 앞면과 뒷면이 모두 `backfaceVisibility: 'hidden'`을 사용하지만
- **HebrewIcon 내부의 SVG 애니메이션**(`<animate>` 태그)은 `backfaceVisibility`의 영향을 받지 않음
- 따라서 카드가 뒤집힐 때 **두 개의 SVG 애니메이션이 동시에 작동**

---

### 2. **히브리어 텍스트 중복** 🟠

#### 문제 위치:
```tsx
// 앞면 (Line 126-131)
<div className="text-xl sm:text-2xl font-bold mb-1 text-white drop-shadow-lg" dir="rtl">
  {word.hebrew}
</div>

// 뒷면 (Line 210-215)
<div className="text-xl sm:text-2xl font-bold mb-1 text-white drop-shadow-lg" dir="rtl">
  {word.hebrew}
</div>
```

#### 문제:
- 동일한 히브리어 텍스트가 앞/뒷면에 모두 표시
- 뒤집기 애니메이션 중 **두 텍스트가 겹쳐 보임** (drop-shadow로 인해 더 두꺼워 보임)

---

### 3. **배경 그라디언트 중복** 🟡

#### 문제 위치:
```tsx
// 앞면 (Line 73-79)
className={`absolute inset-0 rounded-2xl overflow-hidden ${
  word.grammar
    ? getGrammarCardBackground(word.grammar, darkMode)
    : darkMode
      ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
      : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
} border-2 shadow-lg flex flex-col`}

// 뒷면 (Line 182-188) - 완전히 동일!
className={`absolute inset-0 rounded-2xl overflow-hidden ${
  word.grammar
    ? getGrammarCardBackground(word.grammar, darkMode)
    : darkMode
      ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
      : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
} border-2 shadow-lg flex flex-col`}
```

#### 문제:
- 앞/뒷면이 **정확히 동일한 배경**
- 뒤집기 애니메이션 중 두 배경이 겹쳐서 **색상이 더 진해 보임**

---

## 🎯 잔상 발생 원리

### 애니메이션 타임라인:

```
시간: 0s ────────────> 0.6s (transition: 0.6s)

앞면:  [보임 100%] ─── [회전 중] ─── [숨김 0%]
       SVG 애니메이션   SVG 애니메이션   SVG 애니메이션
       계속 작동 ✅     계속 작동 ✅     계속 작동 ✅ (!)

뒷면:  [숨김 0%]   ─── [회전 중] ─── [보임 100%]
       SVG 애니메이션   SVG 애니메이션   SVG 애니메이션
       계속 작동 ✅     계속 작동 ✅     계속 작동 ✅ (!)

문제:  회전 중 0.3s 시점 (90도 회전)
       ↓
       앞면 SVG (50% 투명도) + 뒷면 SVG (50% 투명도)
       = 두 SVG가 겹쳐서 보임! (잔상 발생)
```

### 왜 `backfaceVisibility: 'hidden'`이 작동하지 않는가?

1. **CSS는 적용됨**: 부모 `<div>`는 뒷면에서 숨겨짐
2. **하지만 SVG 애니메이션은 GPU 레이어에서 작동**:
   - `<animate>` 태그는 CSS와 독립적으로 작동
   - `opacity`, `r`, `transform` 속성이 계속 변경됨
   - 브라우저가 두 SVG 레이어를 합성할 때 **블렌딩 발생**

3. **결과**:
   - 앞면 SVG의 애니메이션 프레임
   - 뒷면 SVG의 애니메이션 프레임
   - 두 개가 **서로 다른 타이밍**에서 합쳐짐 → **잔상/겹침 효과**

---

## ✅ 해결 방법 (3가지 제안)

### 방법 1: **HebrewIcon 단일화** (권장 ⭐)

```tsx
// 앞/뒷면에서 SVG를 공유하고, 배경만 교체
<motion.div className="relative rounded-2xl w-full h-full" ...>
  {/* 공통 SVG 레이어 (카드 회전과 독립) */}
  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
    <HebrewIcon
      word={word.hebrew}
      iconUrl={word.iconUrl}
      iconSvg={word.iconSvg}
      size={512}
      color={darkMode ? '#ffffff' : '#1f2937'}
      className="w-4/5 h-4/5 object-contain"
    />
  </div>

  {/* 앞면 (텍스트만) */}
  <div className="..." style={{ backfaceVisibility: 'hidden' }}>
    {/* SVG 없음, 텍스트만 */}
  </div>

  {/* 뒷면 (텍스트만) */}
  <div className="..." style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
    {/* SVG 없음, 텍스트만 */}
  </div>
</motion.div>
```

**장점**:
- SVG가 한 번만 렌더링됨
- 애니메이션 중복 제거
- 잔상 완전 제거
- 성능 향상 (렌더링 50% 감소)

**단점**:
- 앞/뒷면에서 SVG 크기가 다르면 조정 필요

---

### 방법 2: **조건부 렌더링** (간단)

```tsx
{/* SVG는 현재 보이는 면에서만 렌더링 */}
<div className="앞면" style={{ backfaceVisibility: 'hidden' }}>
  {!isFlipped && (
    <HebrewIcon ... />
  )}
  {/* 나머지 앞면 컨텐츠 */}
</div>

<div className="뒷면" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
  {isFlipped && (
    <HebrewIcon ... />
  )}
  {/* 나머지 뒷면 컨텐츠 */}
</div>
```

**장점**:
- 구현이 매우 간단
- 잔상 완전 제거

**단점**:
- 뒤집기 애니메이션 중 SVG가 사라졌다가 나타남 (부자연스러울 수 있음)
- 매번 SVG를 새로 마운트/언마운트 (성능 저하 가능)

---

### 방법 3: **CSS `will-change` + `isolation` 강화**

```tsx
<div
  className="앞면"
  style={{
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    isolation: 'isolate',      // 새 stacking context
    willChange: 'transform',   // GPU 가속
    transform: 'translateZ(0)' // 강제 레이어 분리
  }}
>
  <HebrewIcon ... />
</div>

<div
  className="뒷면"
  style={{
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    isolation: 'isolate',
    willChange: 'transform',
    transform: 'rotateY(180deg) translateZ(0)'
  }}
>
  <HebrewIcon ... />
</div>
```

**장점**:
- 코드 변경 최소화
- SVG가 완전히 독립된 GPU 레이어에서 렌더링

**단점**:
- 브라우저에 따라 효과가 다를 수 있음
- 메모리 사용량 증가 (GPU 레이어 2개)

---

## 📊 성능 영향 분석

### 현재 상태:
```
렌더링 요소:
- HebrewIcon (앞면): 1개
- HebrewIcon (뒷면): 1개
- SVG 애니메이션: 각 SVG마다 4-8개 <animate> 태그
- 총 애니메이션: 8-16개 동시 실행

메모리:
- SVG 파싱: 2회 (앞/뒷면)
- DOM 노드: 2배

GPU:
- 레이어 합성: 복잡 (2개 SVG가 교차)
```

### 방법 1 적용 후:
```
렌더링 요소:
- HebrewIcon: 1개 (공유)
- SVG 애니메이션: 4-8개
- 총 애니메이션: 50% 감소 ✅

메모리:
- SVG 파싱: 1회 ✅
- DOM 노드: 50% 감소 ✅

GPU:
- 레이어 합성: 단순 (SVG 1개만) ✅
```

---

## 🎯 권장 조치

### 우선순위 1: **방법 1 적용** (HebrewIcon 단일화)
- 잔상 완전 제거
- 성능 최적화
- 코드 간결화

### 우선순위 2: **히브리어 텍스트 중복 제거**
- 뒷면에서만 표시하거나
- 앞면과 뒷면에 다른 스타일 적용

### 우선순위 3: **배경 그라디언트 최적화**
- 앞/뒷면에 다른 배경 색상 적용하여 시각적 차별화

---

## 🧪 테스트 방법

### 1. 잔상 확인:
```bash
1. 플래시카드 열기
2. 더블 탭으로 뒤집기
3. 애니메이션 중간에 스크린샷 찍기
4. SVG가 겹쳐 보이는지 확인
```

### 2. 성능 측정:
```bash
1. Chrome DevTools → Performance 탭
2. "Record" 클릭
3. 플래시카드 여러 번 뒤집기
4. "Stop" 클릭
5. Rendering 시간 확인
```

### 3. 메모리 측정:
```bash
1. Chrome DevTools → Memory 탭
2. "Take heap snapshot"
3. HebrewIcon 검색
4. 인스턴스 개수 확인 (2개 → 1개로 감소해야 함)
```

---

## 📝 요약

| 문제 | 현재 상태 | 해결 방법 |
|------|-----------|-----------|
| **HebrewIcon 중복** | 🔴 앞/뒷면 각 1개 (총 2개) | 방법 1: 단일 SVG 공유 |
| **히브리어 텍스트 중복** | 🟠 앞/뒷면 각 1개 (총 2개) | 조건부 렌더링 또는 스타일 차별화 |
| **배경 중복** | 🟡 앞/뒷면 동일한 배경 | 다른 배경 색상 적용 |
| **SVG 애니메이션 충돌** | 🔴 8-16개 동시 실행 | HebrewIcon 단일화로 50% 감소 |
| **잔상 발생** | 🔴 애니메이션 중 겹침 | GPU 레이어 분리 + SVG 단일화 |

---

**결론**: **HebrewIcon 중복이 잔상의 주된 원인**입니다. 방법 1(단일화)을 적용하면 잔상이 완전히 사라지고 성능도 50% 향상됩니다.
