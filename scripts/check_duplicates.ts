#!/usr/bin/env tsx

import { createHash } from 'crypto'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const JPG_DIR = join(process.cwd(), 'output', 'all_words_jpg')

interface FileInfo {
  filename: string
  size: number
  hash: string
}

function getFileHash(filepath: string): string {
  const content = readFileSync(filepath)
  return createHash('md5').update(content).digest('hex')
}

function analyzeDuplicates() {
  console.log('🔍 중복 이미지 분석 시작\n')

  const files = readdirSync(JPG_DIR).filter(f => f.endsWith('.jpg'))
  console.log(`📁 총 ${files.length}개 JPG 파일 발견\n`)

  // 파일 정보 수집
  const fileInfos: FileInfo[] = []
  for (const filename of files) {
    const filepath = join(JPG_DIR, filename)
    const size = readFileSync(filepath).length
    const hash = getFileHash(filepath)
    fileInfos.push({ filename, size, hash })
  }

  // 크기별 그룹화
  const sizeGroups = new Map<number, FileInfo[]>()
  for (const info of fileInfos) {
    if (!sizeGroups.has(info.size)) {
      sizeGroups.set(info.size, [])
    }
    sizeGroups.get(info.size)!.push(info)
  }

  // 해시별 그룹화
  const hashGroups = new Map<string, FileInfo[]>()
  for (const info of fileInfos) {
    if (!hashGroups.has(info.hash)) {
      hashGroups.set(info.hash, [])
    }
    hashGroups.get(info.hash)!.push(info)
  }

  // 중복 찾기 (동일한 해시)
  const duplicates: Array<{ hash: string; files: FileInfo[] }> = []
  for (const [hash, files] of hashGroups.entries()) {
    if (files.length > 1) {
      duplicates.push({ hash, files })
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 중복 분석 결과\n')

  console.log(`총 파일: ${files.length}개`)
  console.log(`고유 해시: ${hashGroups.size}개`)
  console.log(`중복 그룹: ${duplicates.length}개\n`)

  if (duplicates.length > 0) {
    console.log('❌ 중복된 이미지 발견:\n')

    let totalDuplicateFiles = 0
    for (let i = 0; i < Math.min(duplicates.length, 10); i++) {
      const dup = duplicates[i]
      totalDuplicateFiles += dup.files.length - 1
      console.log(`[${i + 1}] 중복 그룹 (${dup.files.length}개 파일):`)
      console.log(`    해시: ${dup.hash}`)
      console.log(`    크기: ${Math.round(dup.files[0].size / 1024)} KB`)
      dup.files.forEach(f => {
        console.log(`    - ${f.filename}`)
      })
      console.log('')
    }

    if (duplicates.length > 10) {
      console.log(`... 그 외 ${duplicates.length - 10}개 중복 그룹 더 있음\n`)
    }

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`⚠️  총 ${totalDuplicateFiles}개 중복 파일 발견`)
    console.log(`💾 중복 제거 시 절약 가능: ~${Math.round((totalDuplicateFiles * dup.files[0].size) / 1024 / 1024 * 100) / 100} MB`)
  } else {
    console.log('✅ 중복된 이미지 없음')
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 크기 분포 분석
  const sizeDistribution = new Map<number, number>()
  for (const info of fileInfos) {
    const sizeKB = Math.round(info.size / 1024)
    sizeDistribution.set(sizeKB, (sizeDistribution.get(sizeKB) || 0) + 1)
  }

  console.log('📊 파일 크기 분포:')
  const sortedSizes = Array.from(sizeDistribution.entries()).sort((a, b) => b[1] - a[1])
  for (let i = 0; i < Math.min(sortedSizes.length, 10); i++) {
    const [sizeKB, count] = sortedSizes[i]
    console.log(`  ${sizeKB} KB: ${count}개`)
  }
  console.log('')

  return { duplicates, totalFiles: files.length, uniqueHashes: hashGroups.size }
}

analyzeDuplicates()
