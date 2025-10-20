/**
 * Supabase 클라이언트 유틸리티
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '../../src/lib/database.types'
import * as dotenv from 'dotenv'
import { log } from './logger'

// 환경변수 로드
dotenv.config({ path: '.env.local' })

/**
 * Supabase 클라이언트 생성
 */
export function createSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    log.error('VITE_SUPABASE_URL이 설정되지 않았습니다.')
    log.info('.env.local 파일을 확인해주세요.')
    process.exit(1)
  }

  // SERVICE_ROLE_KEY 우선, 없으면 ANON_KEY 사용
  const supabaseKey = supabaseServiceKey || supabaseAnonKey

  if (!supabaseKey) {
    log.error('SUPABASE_SERVICE_ROLE_KEY 또는 VITE_SUPABASE_ANON_KEY가 설정되지 않았습니다.')
    process.exit(1)
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * 기본 Supabase 클라이언트 인스턴스
 */
export const supabase = createSupabaseClient()
