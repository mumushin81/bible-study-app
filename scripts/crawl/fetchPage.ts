/**
 * Firecrawl API를 사용하여 웹 페이지 가져오기
 */

import axios from 'axios'
import * as dotenv from 'dotenv'
import { log } from '../utils/logger'

dotenv.config({ path: '.env.local' })

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-650c644774d3424fa7e1c49fdfdbd444'

export interface FetchResult {
  success: boolean
  markdown?: string
  error?: string
}

/**
 * Firecrawl API로 페이지 가져오기
 */
export async function fetchPageWithFirecrawl(url: string): Promise<FetchResult> {
  try {
    log.info(`Firecrawl API로 크롤링: ${url}`)

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
      log.success(`크롤링 성공: ${markdown.length} 바이트`)
      return {
        success: true,
        markdown
      }
    } else {
      log.error('Firecrawl 응답에 markdown이 없습니다.')
      return {
        success: false,
        error: 'No markdown in response'
      }
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message
    log.error(`Firecrawl API 에러: ${errorMsg}`)
    return {
      success: false,
      error: errorMsg
    }
  }
}
