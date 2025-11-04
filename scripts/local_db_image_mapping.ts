#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface WordMapping {
  hebrew: string
  meaning: string
  id: string
}

class LocalDatabaseImageMapper {
  private localImages: string[] = []
  private words: WordMapping[] = []
  private mappingLog: {
    [localFileName: string]: {
      databaseMatch?: {
        word: WordMapping
        publicUrl: string
      }
      status: 'matched' | 'unmatched'
    }
  } = {}

  constructor(private localImageDir: string) {}

  async initialize() {
    // 1. 로컬 이미지 파일명 로드
    this.localImages = fs.readdirSync(this.localImageDir)
      .filter(file => file.endsWith('.jpg') && file !== 'default_word_icon.jpg')

    // 2. 데이터베이스 단어 조회
    const { data: wordData, error: wordError } = await supabase
      .from('words')
      .select('id, hebrew, meaning')

    if (wordError) {
      console.error('단어 조회 실패:', wordError)
      return false
    }

    this.words = wordData || []
    return true
  }

  performMapping() {
    console.log('🔍 로컬 이미지와 데이터베이스 이미지 매핑 시작')
    console.log(`📸 로컬 이미지 수: ${this.localImages.length}`)
    console.log(`📝 데이터베이스 단어 수: ${this.words.length}`)

    this.localImages.forEach(localImageName => {
      // 파일명에서 히브리어 단어 추출 (디코딩)
      const hebrewWord = decodeURIComponent(localImageName.replace('.jpg', ''))

      // 데이터베이스에서 매칭되는 단어 찾기
      const matchedWord = this.words.find(word =>
        word.hebrew === hebrewWord ||
        hebrewWord.includes(word.hebrew)
      )

      if (matchedWord) {
        // 매칭된 단어의 공개 URL 생성
        const { data: { publicUrl } } = supabase.storage
          .from('hebrew-icons')
          .getPublicUrl(`icons/word_${matchedWord.id}.jpg`)

        this.mappingLog[localImageName] = {
          databaseMatch: {
            word: matchedWord,
            publicUrl
          },
          status: 'matched'
        }
      } else {
        this.mappingLog[localImageName] = {
          status: 'unmatched'
        }
      }
    })

    this.generateMappingReport()
    this.updateDatabaseWithMatches()
  }

  private generateMappingReport() {
    const matchedImages = Object.values(this.mappingLog)
      .filter(mapping => mapping.status === 'matched')

    const unmatchedImages = Object.values(this.mappingLog)
      .filter(mapping => mapping.status === 'unmatched')

    console.log('\n📊 매핑 결과 보고서:')
    console.log(`✅ 매칭된 이미지: ${matchedImages.length}`)
    console.log(`❌ 매칭 실패한 이미지: ${unmatchedImages.length}`)

    console.log('\n🔗 매칭된 이미지 상세:')
    matchedImages.forEach(mapping => {
      const localFileName = Object.keys(this.mappingLog).find(
        key => this.mappingLog[key] === mapping
      )
      console.log(`
- 로컬 이미지: ${localFileName}
  히브리어 단어: ${mapping.databaseMatch?.word.hebrew}
  의미: ${mapping.databaseMatch?.word.meaning}
  데이터베이스 URL: ${mapping.databaseMatch?.publicUrl}
      `)
    })

    console.log('\n❓ 매칭 실패한 이미지:')
    unmatchedImages.forEach(mapping => {
      const localFileName = Object.keys(this.mappingLog).find(
        key => this.mappingLog[key] === mapping
      )
      console.log(`- ${localFileName}`)
    })
  }

  private async updateDatabaseWithMatches() {
    const updatePromises = Object.entries(this.mappingLog)
      .filter(([_, mapping]) => mapping.status === 'matched')
      .map(async ([localImageName, mapping]) => {
        if (!mapping.databaseMatch) return

        const { error } = await supabase
          .from('words')
          .update({
            icon_url: mapping.databaseMatch.publicUrl
          })
          .eq('id', mapping.databaseMatch.word.id)

        if (error) {
          console.error(`URL 업데이트 실패: ${localImageName}`, error)
        } else {
          console.log(`✅ 업데이트 성공: ${localImageName}`)
        }
      })

    await Promise.all(updatePromises)
  }
}

async function runLocalDatabaseImageMapper() {
  const localImageDir = path.join(process.cwd(), 'public', 'images', 'words')
  const mapper = new LocalDatabaseImageMapper(localImageDir)

  const initialized = await mapper.initialize()
  if (initialized) {
    mapper.performMapping()
  }
}

runLocalDatabaseImageMapper().catch(console.error)