#!/usr/bin/env tsx

/**
 * Supabase Storage에 존재하는 JPG 아이콘과 DB words.icon_url을 동기화
 *
 * 주요 기능
 * 1. Storage `hebrew-icons/icons/` 경로의 전체 파일 목록 수집 (pagination 처리)
 * 2. 파일명 패턴 분석
 *    - word_<UUID>.jpg  → word.id 기준 매칭
 *    - word_<MD5>.jpg   → 니쿠드 제거 + 공백 → "_" 치환한 히브리어 해시 기반 매칭
 *    - <정규화된히브리어>.jpg → 레거시 파일명 직접 매칭
 * 3. words 테이블에서 icon_url이 NULL이거나 값이 다른 레코드만 업데이트
 * 4. 진행 로그 및 요약 통계 출력
 *
 * 실행 전 준비
 * - .env.local에 VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 설정 확인
 *
 * 실행 예시
 *   npx tsx scripts/images/syncStorageIconUrls.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { createHash } from 'crypto'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'hebrew-icons'
const FOLDER = 'icons'
const PAGE_SIZE = 1000

type StorageIndex = {
  allFilenames: Set<string>
  uuidToFilename: Map<string, string>
}

type WordRecord = {
  id: string
  hebrew: string
  meaning: string | null
  icon_url: string | null
}

type CandidateMatch = {
  filename: string
  reason: 'uuid' | 'hash' | 'plain'
  publicUrl: string
}

function removeNikkud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '')
}

function normalizeHebrewFilename(hebrew: string): string {
  return removeNikkud(hebrew)
    .replace(/\u05BE/g, '-')        // 히브리어 마케프(־) → 하이픈
    .replace(/\s+/g, '_')          // 공백 → 언더스코어
    .replace(/[()]/g, '')          // 흔한 잔여 괄호 제거
    .trim()
}

async function fetchStorageIndex(): Promise<StorageIndex> {
  console.log('📥 Storage 파일 목록 조회 중...')
  const allFilenames = new Set<string>()
  const uuidToFilename = new Map<string, string>()

  let page = 0

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(FOLDER, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        sortBy: { column: 'name', order: 'asc' },
      })

    if (error) {
      throw new Error(`Storage 목록 조회 실패 (page ${page + 1}): ${error.message}`)
    }

    if (!data || data.length === 0) {
      break
    }

    data
      .filter(item => item.name.endsWith('.jpg'))
      .forEach(item => {
        allFilenames.add(item.name)

        const uuidMatch = item.name.match(
          /^word_([0-9a-f]{8}_[0-9a-f]{4}_[0-9a-f]{4}_[0-9a-f]{4}_[0-9a-f]{12})\.jpg$/i
        )

        if (uuidMatch) {
          const uuid = uuidMatch[1].replace(/_/g, '-').toLowerCase()
          uuidToFilename.set(uuid, item.name)
        }
      })

    if (data.length < PAGE_SIZE) {
      break
    }

    page++
  }

  console.log(`📦 Storage JPG 파일 총 ${allFilenames.size}개 확인\n`)
  return { allFilenames, uuidToFilename }
}

const publicUrlCache = new Map<string, string>()

function getPublicUrl(filename: string): string {
  if (!publicUrlCache.has(filename)) {
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(`${FOLDER}/${filename}`)
    publicUrlCache.set(filename, publicUrl)
  }
  return publicUrlCache.get(filename)!
}

function buildCandidateFilenames(word: WordRecord): Array<{ filename: string; reason: CandidateMatch['reason'] }> {
  const candidates: Array<{ filename: string; reason: CandidateMatch['reason'] }> = []

  // 1) word_<uuid>.jpg 형태 (언더스코어 변환)
  const uuidFilename = `word_${word.id.replace(/-/g, '_')}.jpg`
  candidates.push({ filename: uuidFilename, reason: 'uuid' })

  // 2) word_<md5(normalizedHebrew)>.jpg
  const normalized = normalizeHebrewFilename(word.hebrew)
  if (normalized.length > 0) {
    const hash = createHash('md5').update(normalized).digest('hex')
    candidates.push({ filename: `word_${hash}.jpg`, reason: 'hash' })
    // 3) <normalized>.jpg (레거시 파일명)
    candidates.push({ filename: `${normalized}.jpg`, reason: 'plain' })
  }

  return candidates
}

function resolveMatch(
  word: WordRecord,
  storageIndex: StorageIndex
): CandidateMatch | null {
  const candidates = buildCandidateFilenames(word)

  for (const candidate of candidates) {
    if (candidate.reason === 'uuid') {
      const filename = storageIndex.uuidToFilename.get(word.id.toLowerCase())
      if (filename) {
        return {
          filename,
          reason: 'uuid',
          publicUrl: getPublicUrl(filename),
        }
      }
      // uuid 기반 파일을 찾지 못하면 fallback 계속 진행
      continue
    }

    if (storageIndex.allFilenames.has(candidate.filename)) {
      return {
        filename: candidate.filename,
        reason: candidate.reason,
        publicUrl: getPublicUrl(candidate.filename),
      }
    }
  }

  return null
}

async function fetchWords(): Promise<WordRecord[]> {
  const { data, error } = await supabase
    .from('words')
    .select('id, hebrew, meaning, icon_url')

  if (error) {
    throw new Error(`words 테이블 조회 실패: ${error.message}`)
  }

  console.log(`📚 words 레코드 ${data!.length}개 로드\n`)
  return data as WordRecord[]
}

async function syncIconUrls() {
  try {
    const storageIndex = await fetchStorageIndex()
    const words = await fetchWords()

    const updatesByUrl = new Map<string, { ids: string[]; reason: CandidateMatch['reason']; sampleHebrew: string }>()
    const alreadyCorrect: string[] = []
    const missing: WordRecord[] = []

    for (const word of words) {
      const match = resolveMatch(word, storageIndex)

      if (!match) {
        if (!word.icon_url) {
          missing.push(word)
        }
        continue
      }

      if (word.icon_url === match.publicUrl) {
        alreadyCorrect.push(word.id)
        continue
      }

      if (!updatesByUrl.has(match.publicUrl)) {
        updatesByUrl.set(match.publicUrl, {
          ids: [],
          reason: match.reason,
          sampleHebrew: word.hebrew,
        })
      }
      updatesByUrl.get(match.publicUrl)!.ids.push(word.id)
    }

    console.log(`📝 업데이트 대상 URL 그룹: ${updatesByUrl.size}개`)
    console.log(`✅ 이미 최신 상태: ${alreadyCorrect.length}개 레코드\n`)

    let totalUpdated = 0

    for (const [url, payload] of updatesByUrl.entries()) {
      const chunkSize = 100
      for (let i = 0; i < payload.ids.length; i += chunkSize) {
        const batch = payload.ids.slice(i, i + chunkSize)
        const { error } = await supabase
          .from('words')
          .update({ icon_url: url })
          .in('id', batch)

        if (error) {
          console.error(`❌ 업데이트 실패 (${payload.reason}) - sample ${payload.sampleHebrew}:`, error.message)
          continue
        }

        totalUpdated += batch.length
        console.log(
          `✅ icon_url 업데이트 완료 (${payload.reason}) - ${batch.length}개 (누적 ${totalUpdated})`
        )

        // rate limit 보호
        await new Promise(resolve => setTimeout(resolve, 80))
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 동기화 결과 요약')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ icon_url 업데이트: ${totalUpdated}개 레코드`)
    console.log(`🟢 이미 최신 상태: ${alreadyCorrect.length}개 레코드`)
    console.log(`⚠️ 매칭 실패: ${missing.length}개 레코드`)

    if (missing.length > 0) {
      console.log('\n⚠️ 매칭 실패 상위 10건:')
      missing.slice(0, 10).forEach((word, idx) => {
        const normalized = normalizeHebrewFilename(word.hebrew)
        console.log(
          `${idx + 1}. ${word.hebrew} (${word.meaning ?? '의미 없음'}) → 예상 파일명: ${normalized}`
        )
      })
      if (missing.length > 10) {
        console.log(`…외 ${missing.length - 10}건`)
      }
    }

    console.log('\n🎉 Storage ↔ DB icon_url 동기화 완료')
  } catch (error: any) {
    console.error('❌ 동기화 중 오류:', error.message)
    process.exit(1)
  }
}

syncIconUrls()
