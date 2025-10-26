# 브라우저 렌더링 분석

## 🎨 예상되는 브라우저 동작

### 시나리오 1: 이미지 파일이 없는 현재 상황

**렌더링 순서**:
1. FlashCard 컴포넌트 마운트
2. HebrewIcon 컴포넌트에 `iconUrl` prop 전달
3. HebrewIcon이 `if (iconUrl)` 조건 통과
4. `<img src={iconUrl} />` 렌더링 시도
5. 브라우저가 HTTP GET 요청 발송
6. Supabase Storage가 404 응답
7. 브라우저가 broken image 아이콘 표시

**예상 브라우저 콘솔 에러**:
```
GET https://ouzlnriafovnxlkywerk.supabase.co/storage/v1/object/public/hebrew-icons/icons/word_d6e86cd7efdb332a3edcbe2ed9e18293.jpg 400 (Bad Request)
```

**예상 Network 탭**:
```
Request URL: https://...word_d6e86cd7efdb332a3edcbe2ed9e18293.jpg
Status Code: 400 Bad Request
Response: {"statusCode":"404","error":"not_found","message":"Object not found"}
```

**예상 화면**:
- 깨진 이미지 아이콘 (🖼️❌)
- 또는 alt 텍스트 (히브리어 단어)
- **SVG fallback이 동작하지 않음** ← 문제!

---

## ⚠️ 발견된 로직 문제

### 현재 코드의 문제점

`/Users/jinxin/dev/bible-study-app/src/components/shared/HebrewIcon.tsx` Line 22:

```typescript
if (iconUrl) {
  return (
    <img
      src={iconUrl}
      alt={word}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
      loading="lazy"
    />
  );
}

// ← 이 코드는 iconUrl이 존재하면 무조건 img 태그를 반환
// ← 404 에러가 발생해도 fallback으로 이동하지 않음!
```

**문제**:
- `iconUrl`이 DB에 존재하면 `if (iconUrl)` 조건이 true
- 하지만 실제 파일이 없어도 `<img>` 태그는 렌더링됨
- 브라우저가 404 에러를 받으면 깨진 이미지 표시
- **iconSvg fallback이 절대 실행되지 않음**

---

## 🧪 실제 테스트 필요

### 브라우저에서 확인해야 할 사항

1. **개발자 도구 콘솔**:
   - 404 에러 메시지 확인
   - React 에러 없는지 확인

2. **Network 탭**:
   - icon_url에 대한 HTTP 요청 확인
   - 응답 상태 코드 확인
   - 응답 본문 확인

3. **Elements 탭**:
   - `<img>` 태그가 실제로 렌더링되는지
   - src 속성 값 확인
   - className과 style 속성 확인

4. **화면 표시**:
   - 깨진 이미지 아이콘이 보이는가?
   - SVG가 보이는가?
   - 아무것도 안 보이는가?

---

## 💡 권장 해결책

### Option 1: img 태그의 onError 핸들러 추가 (권장)

```typescript
const HebrewIcon: React.FC<HebrewIconProps> = ({
  word,
  iconSvg,
  iconUrl,
  size = 32,
  className = '',
  color = 'currentColor'
}) => {
  const [imageError, setImageError] = useState(false);

  // 우선순위 1: JPG 이미지 (iconUrl) - 에러 처리 추가
  if (iconUrl && !imageError) {
    return (
      <img
        src={iconUrl}
        alt={word}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
        loading="lazy"
        onError={() => {
          console.warn(`[HebrewIcon] 이미지 로드 실패: ${word}, fallback to SVG`);
          setImageError(true);  // 에러 발생 시 SVG fallback으로
        }}
      />
    );
  }

  // 우선순위 2: SVG fallback
  // ... (기존 코드)
}
```

**장점**:
- 404 에러 시 자동으로 SVG fallback 동작
- 코드 변경 없이 이미지 업로드 시 자동 전환
- 사용자 경험 향상 (깨진 이미지 없음)

**단점**:
- useState 추가로 컴포넌트 복잡도 증가
- 이미지 로드 실패 시 한 번만 재시도 가능

---

### Option 2: 조건부 렌더링 개선

```typescript
// 우선순위 1: iconSvg가 있으면 SVG 우선 (임시 조치)
if (iconSvg && iconSvg.trim().length > 0) {
  // ... SVG 렌더링
}

// 우선순위 2: JPG 이미지
if (iconUrl) {
  // ... img 태그 렌더링
}
```

**장점**:
- 간단한 수정
- 현재 상황에서 즉시 SVG 표시

**단점**:
- 이미지 업로드 후에도 SVG가 우선 표시됨
- iconUrl의 의미가 없어짐

---

### Option 3: Storage 파일 확인 후 렌더링 (과도한 최적화)

```typescript
const [fileExists, setFileExists] = useState<boolean | null>(null);

useEffect(() => {
  if (iconUrl) {
    fetch(iconUrl, { method: 'HEAD' })
      .then(res => setFileExists(res.ok))
      .catch(() => setFileExists(false));
  }
}, [iconUrl]);

if (iconUrl && fileExists) {
  return <img src={iconUrl} ... />;
}
```

**장점**:
- 파일 존재 여부를 사전에 확인
- 불필요한 404 에러 방지

**단점**:
- 추가 HTTP 요청 발생 (성능 저하)
- 로딩 상태 관리 복잡
- 과도한 최적화

---

## 🎯 최종 권장 사항

**Option 1 (onError 핸들러)을 권장합니다**:

**이유**:
1. 이미지 업로드 전: SVG fallback으로 정상 표시
2. 이미지 업로드 후: JPG 우선 표시
3. 깨진 이미지 아이콘 절대 표시 안 됨
4. 사용자 경험 최적화
5. 코드 복잡도 최소화

**적용 파일**: `/Users/jinxin/dev/bible-study-app/src/components/shared/HebrewIcon.tsx`

---

## 📋 검증 체크리스트

### 이미지 업로드 전 (현재)
- [ ] 브라우저 콘솔에서 404 에러 확인
- [ ] 화면에 무엇이 표시되는지 확인 (깨진 이미지? SVG? 아무것도?)
- [ ] Network 탭에서 icon_url 요청 확인

### onError 핸들러 추가 후
- [ ] 404 에러 발생 시 SVG fallback 동작 확인
- [ ] 콘솔에 warning 메시지 출력 확인
- [ ] 화면에 SVG 정상 표시 확인

### 이미지 업로드 후
- [ ] JPG 이미지 정상 로드 확인
- [ ] Network 탭에서 200 OK 확인
- [ ] SVG 대신 JPG 표시 확인

---

**생성 일시**: 2025-10-26
**다음 단계**: 브라우저에서 실제 렌더링 확인 후 Option 1 적용
