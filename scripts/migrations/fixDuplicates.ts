/**
 * Fix Duplicate Data in words Table
 *
 * Automatically finds and removes duplicate (verse_id, position) entries
 * Keeps the oldest record (first created), deletes the rest
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface DuplicateWord {
  verse_id: string
  position: number
  count: number
  ids: string[]
  created_ats: string[]
  hebrew_words: string[]
}

async function findDuplicates(): Promise<DuplicateWord[]> {
  console.log('\n🔍 1단계: 중복 데이터 찾는 중...\n')

  // Fetch all words
  const { data: words, error } = await supabase
    .from('words')
    .select('id, verse_id, position, hebrew, created_at')
    .order('verse_id')
    .order('position')

  if (error) {
    console.error('❌ Error fetching words:', error)
    throw error
  }

  if (!words || words.length === 0) {
    console.log('⚠️  No words found in database')
    return []
  }

  // Group by verse_id and position
  const grouped = new Map<string, typeof words>()

  for (const word of words) {
    const key = `${word.verse_id}:${word.position}`
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(word)
  }

  // Find duplicates
  const duplicates: DuplicateWord[] = []

  for (const [key, wordGroup] of grouped.entries()) {
    if (wordGroup.length > 1) {
      const [verse_id, position] = key.split(':')
      duplicates.push({
        verse_id,
        position: parseInt(position),
        count: wordGroup.length,
        ids: wordGroup.map(w => w.id),
        created_ats: wordGroup.map(w => w.created_at),
        hebrew_words: wordGroup.map(w => w.hebrew)
      })
    }
  }

  return duplicates
}

async function deleteDuplicates(duplicates: DuplicateWord[]): Promise<number> {
  console.log('\n🗑️  2단계: 중복 데이터 삭제 중...\n')

  let totalDeleted = 0

  for (const dup of duplicates) {
    // Sort by created_at to keep the oldest
    const sorted = dup.ids
      .map((id, idx) => ({ id, created_at: dup.created_ats[idx] }))
      .sort((a, b) => a.created_at.localeCompare(b.created_at))

    // Keep the first (oldest), delete the rest
    const toKeep = sorted[0].id
    const toDelete = sorted.slice(1).map(x => x.id)

    console.log(`📍 ${dup.verse_id} position ${dup.position}:`)
    console.log(`   유지: ${toKeep} (생성: ${sorted[0].created_at})`)
    console.log(`   삭제: ${toDelete.length}개`)

    // Delete duplicates
    for (const id of toDelete) {
      const { error } = await supabase
        .from('words')
        .delete()
        .eq('id', id)

      if (error) {
        console.error(`   ❌ Failed to delete ${id}:`, error.message)
      } else {
        totalDeleted++
        console.log(`   ✅ 삭제 성공: ${id}`)
      }
    }
  }

  return totalDeleted
}

async function verifyNoDuplicates(): Promise<boolean> {
  console.log('\n✅ 3단계: 중복 제거 확인 중...\n')

  const duplicates = await findDuplicates()

  if (duplicates.length === 0) {
    console.log('✅ 중복 데이터 없음 - 정리 완료!')
    return true
  } else {
    console.log(`❌ 아직 ${duplicates.length}개의 중복이 남아있습니다:`)
    for (const dup of duplicates) {
      console.log(`   - ${dup.verse_id} position ${dup.position} (${dup.count}개)`)
    }
    return false
  }
}

async function main() {
  console.log('🚀 중복 데이터 자동 수정 스크립트')
  console.log('=' .repeat(50))

  try {
    // Step 1: Find duplicates
    const duplicates = await findDuplicates()

    if (duplicates.length === 0) {
      console.log('\n✅ 중복 데이터가 없습니다!')
      console.log('👉 이제 unique constraint를 적용할 수 있습니다.\n')
      return
    }

    console.log(`📊 발견된 중복: ${duplicates.length}개\n`)
    for (const dup of duplicates) {
      console.log(`   - ${dup.verse_id} position ${dup.position}`)
      console.log(`     개수: ${dup.count}개`)
      console.log(`     단어: ${dup.hebrew_words.join(', ')}`)
    }

    // Step 2: Delete duplicates
    const deleted = await deleteDuplicates(duplicates)
    console.log(`\n📊 총 ${deleted}개의 중복 레코드 삭제됨`)

    // Step 3: Verify
    const success = await verifyNoDuplicates()

    if (success) {
      console.log('\n🎉 중복 데이터 정리 완료!')
      console.log('\n📝 다음 단계:')
      console.log('Supabase SQL Editor에서 다음 SQL을 실행하세요:')
      console.log('https://supabase.com/dashboard/project/ouzlnriafovnxlkywerk/sql/new\n')
      console.log('-- Unique 제약 조건 추가')
      console.log('ALTER TABLE words')
      console.log('  ADD CONSTRAINT unique_word_position')
      console.log('  UNIQUE (verse_id, position);')
      console.log('')
      console.log('ALTER TABLE verses')
      console.log('  ADD CONSTRAINT unique_verse_reference')
      console.log('  UNIQUE (book_id, chapter, verse_number);')
      console.log('')
    } else {
      console.log('\n⚠️  일부 중복이 남아있습니다. 스크립트를 다시 실행해보세요.')
    }

  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

main()
