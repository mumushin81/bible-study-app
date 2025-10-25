#!/usr/bin/env tsx

/**
 * 생성된 히브리어 단어 이미지 압축
 */

import sharp from 'sharp'
import { readdirSync } from 'fs'
import { join } from 'path'

const IMAGES_DIR = join(process.cwd(), 'public', 'images', 'words')

async function compressImages() {
  console.log('🗜️  히브리어 단어 이미지 압축 시작\n')

  const files = readdirSync(IMAGES_DIR).filter(f => f.endsWith('.jpg'))
  console.log(`📁 ${files.length}개 이미지 파일 발견\n`)

  let compressed = 0

  for (let i = 0; i < files.length; i++) {
    const filename = files[i]
    const filepath = join(IMAGES_DIR, filename)

    try {
      // 원본 크기 확인
      const { size: originalSize } = await sharp(filepath).metadata()
      const originalKB = Math.round(originalSize! / 1024)

      // 품질 75로 재압축
      await sharp(filepath)
        .jpeg({ quality: 75, mozjpeg: true })
        .toFile(filepath + '.tmp')

      // 임시 파일로 교체
      const { size: newSize } = await sharp(filepath + '.tmp').metadata()
      const newKB = Math.round(newSize! / 1024)

      // 원본 파일 교체
      await sharp(filepath + '.tmp').toFile(filepath)

      // 임시 파일 삭제
      const fs = await import('fs/promises')
      await fs.unlink(filepath + '.tmp')

      compressed++
      const reduction = Math.round(((originalSize! - newSize!) / originalSize!) * 100)

      console.log(`✅ [${i + 1}/${files.length}] ${filename}`)
      console.log(`   ${originalKB} KB → ${newKB} KB (${reduction}% 감소)`)

    } catch (err: any) {
      console.error(`❌ [${i + 1}/${files.length}] ${filename} 오류:`, err.message)
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ 압축 완료: ${compressed}/${files.length}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  console.log('🎉 모든 이미지 압축 완료!')
}

compressImages().catch(console.error)
