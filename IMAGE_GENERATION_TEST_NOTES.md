# 히브리어 단어 이미지 생성 테스트 가이드

## 테스트 목적
- Replicate API를 통한 히브리어 단어 이미지 생성 검증
- 데이터베이스 이미지 URL 저장 기능 확인

## 테스트 시나리오
1. 다양한 히브리어 단어에 대한 이미지 생성
2. 각 단어별 이미지 생성 성공 여부 확인
3. 데이터베이스 URL 저장 검증

## 테스트 단어 목록
- בראשית (Bereshit, Genesis)
- אלהים (Elohim, God)
- שמים (Shamayim, Heavens)
- ארץ (Eretz, Earth)
- אור (Or, Light)
- חושך (Choshech, Darkness)

## 실행 방법
```bash
npm run test:image-gen
```

## 예상 결과
- 모든 단어에 대해 고유한 이미지 생성
- 데이터베이스에 정확한 이미지 URL 저장

## 주의사항
- Replicate API 토큰 필요
- 인터넷 연결 필수
- API 호출 제한에 유의

## 문제 해결
- 이미지 생성 실패 시
  1. API 토큰 확인
  2. 네트워크 연결 확인
  3. Replicate API 상태 확인