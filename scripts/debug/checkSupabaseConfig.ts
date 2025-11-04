#!/usr/bin/env tsx

/**
 * Supabase 스토리지 및 환경 설정 종합 점검
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

// 환경 변수 로드
config({ path: '.env.local' })

async function checkSupabaseConfiguration() {
  console.log('🔍 Supabase 구성 점검')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 환경 변수 확인
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]

  console.log('🔑 환경 변수 점검:')
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName]
    console.log(`   - ${varName}: ${value ? '✅ 존재' : '❌ 누락'}`)
  })

  // Supabase 클라이언트 생성
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
  )

  try {
    // 스토리지 버킷 확인
    console.log('\n📦 스토리지 버킷 점검:')
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()

    if (bucketError) {
      console.error('❌ 버킷 목록 조회 실패:', bucketError)
      return
    }

    console.log('   발견된 버킷:')
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name}`)
    })

    // hebrew-icons 버킷 상세 점검
    console.log('\n🖼️ hebrew-icons 버킷 상세:')
    const { data, error } = await supabase.storage
      .from('hebrew-icons')
      .list('icons', {
        limit: 10,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (error) {
      console.error('❌ 버킷 내용 조회 실패:', error)
      return
    }

    console.log(`   총 파일 수: ${data.length}`)
    data.forEach((file, index) => {
      console.log(`   [${index + 1}] ${file.name}`)
    })

    // 데이터베이스 단어 상태 점검
    console.log('\n📊 데이터베이스 단어 상태:')
    const { data: words, error: wordError } = await supabase
      .from('words')
      .select('hebrew, icon_url')
      .not('icon_url', 'is', null)
      .limit(10)

    if (wordError) {
      console.error('❌ 단어 조회 실패:', wordError)
      return
    }

    console.log(`   icon_url이 있는 단어 수: ${words.length}`)
    words.forEach((word, index) => {
      console.log(`   [${index + 1}] ${word.hebrew}: ${word.icon_url}`)
    })

  } catch (err) {
    console.error('🚨 전체 점검 중 오류 발생:', err)
  }
}

checkSupabaseConfiguration().catch(console.error)