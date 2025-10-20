/**
 * Firecrawl 응답 디버깅
 */

import axios from 'axios'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config({ path: '.env.local' })

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-650c644774d3424fa7e1c49fdfdbd444'

async function testFirecrawl() {
  const url = 'https://mechon-mamre.org/p/pt/pt0101.htm'

  console.log(`🔍 Firecrawl 테스트: ${url}\n`)

  try {
    const response = await axios.post(
      'https://api.firecrawl.dev/v1/scrape',
      {
        url: url,
        formats: ['markdown']
      },
      {
        headers: {
          'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data?.data?.markdown) {
      const markdown = response.data.data.markdown

      console.log(`✅ 크롤링 성공: ${markdown.length} 바이트\n`)

      // 파일로 저장
      fs.writeFileSync('debug-markdown.txt', markdown, 'utf-8')
      console.log('✅ debug-markdown.txt 파일로 저장됨\n')

      // 처음 50줄 출력
      const lines = markdown.split('\n')
      console.log('📝 처음 50줄 미리보기:\n')
      console.log('=' .repeat(80))
      lines.slice(0, 50).forEach((line, i) => {
        console.log(`${i + 1}: ${line}`)
      })
      console.log('=' .repeat(80))

      console.log(`\n총 줄 수: ${lines.length}`)
    } else {
      console.log('❌ markdown이 응답에 없습니다.')
    }
  } catch (error: any) {
    console.error(`❌ 에러: ${error.message}`)
  }
}

testFirecrawl()
