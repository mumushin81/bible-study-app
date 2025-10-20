#!/usr/bin/env node

/**
 * 컨텐츠 제작 에이전트 - 수동 워크플로우
 *
 * 이 스크립트는 사용자가 Supabase에서 히브리어 원문을 조회하고,
 * 직접 컨텐츠를 작성하여 저장하는 수동 워크플로우를 안내합니다.
 *
 * 자동화된 API 사용 없이 Claude Code와 함께 작업합니다.
 */

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 컨텐츠 제작 에이전트 (수동 워크플로우)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 워크플로우

1️⃣  프롬프트 생성
    npm run generate:prompt <bookId> [chapter] [limit]

    예시:
    npm run generate:prompt genesis 2 4    # Genesis 2장, 4개 구절
    npm run generate:prompt genesis 2      # Genesis 2장 전체

2️⃣  프롬프트 복사
    출력된 프롬프트를 복사합니다.

3️⃣  Claude Code에 붙여넣기
    프롬프트를 Claude Code에 붙여넣어 컨텐츠를 생성합니다.

4️⃣  JSON 저장
    생성된 JSON을 data/generated/ 폴더에 저장합니다.
    예: data/generated/genesis_2_1234567890.json

5️⃣  Supabase에 저장
    npm run save:content -- data/generated/<파일명>.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 빠른 시작

# 1. Genesis 2장 4-7절 생성 (4개 구절, 테스트용)
npm run generate:prompt genesis 2 4

# 2. 출력된 프롬프트를 복사하여 Claude Code에 붙여넣기

# 3. 생성된 JSON을 저장
# 예: data/generated/genesis_2_4to7.json

# 4. Supabase에 저장
npm run save:content -- data/generated/genesis_2_4to7.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 생성되는 컨텐츠

✅ IPA 발음
✅ 한글 발음
✅ 현대어 의역
✅ 단어 분석 (words 테이블)
✅ 주석 (commentaries 관련 테이블)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 사용 가능한 명령어

npm run generate:prompt <bookId> [chapter] [limit]
    → Supabase에서 빈 구절 조회 및 프롬프트 생성

npm run save:content -- <json_file> [--force]
    → 생성된 JSON을 Supabase에 저장

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 참고 문서

📖 docs/CONTENT_GENERATION_AGENT.md
📖 VERSE_CREATION_GUIDELINES.md
📖 docs/AGENT_WORKFLOW.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 특징

💰 완전 무료 - API 비용 없음 (Claude Code 구독에 포함)
📊 품질 검증 - 자동 검증 및 경고 시스템
🎯 정확성 - 사용자가 직접 검토하고 수정 가능
🔄 재생성 안전 - 기존 컨텐츠 보호 (--force 옵션으로 덮어쓰기)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

시작하려면 위의 빠른 시작 가이드를 따라하세요! 🚀
`)

process.exit(0)
