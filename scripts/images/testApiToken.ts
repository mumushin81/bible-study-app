#!/usr/bin/env tsx

import 'dotenv/config'
import Replicate from 'replicate'

console.log('환경 변수 확인:')
console.log('VITE_REPLICATE_API_TOKEN:', process.env.VITE_REPLICATE_API_TOKEN)
console.log('REPLICATE_API_TOKEN:', process.env.REPLICATE_API_TOKEN)

try {
  const replicate = new Replicate({
    auth: process.env.VITE_REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN || '',
  })

  console.log('Replicate 클라이언트 생성 성공')
} catch (error) {
  console.error('Replicate 클라이언트 생성 실패:', error)
}