/**
 * 환경변수 유틸리티
 *
 * 모든 스크립트에서 안전하게 환경변수를 가져오는 공통 함수
 * 타입 단언(!)을 제거하고 런타임에 검증
 */

/**
 * 환경변수를 안전하게 가져옵니다.
 * 환경변수가 없으면 명확한 에러 메시지와 함께 프로세스를 종료합니다.
 *
 * @param key - 환경변수 키
 * @returns 환경변수 값
 * @throws 환경변수가 없으면 Error
 */
export function getEnv(key: string): string {
  const value = process.env[key]

  if (!value || value.trim() === '') {
    console.error(`❌ Missing required environment variable: ${key}`)
    console.error(`\n💡 Please add ${key} to your .env.local file`)
    console.error(`   You can use .env.example as a template\n`)
    throw new Error(`Environment variable ${key} is required but not set`)
  }

  return value
}

/**
 * 환경변수를 가져오되, 기본값을 제공합니다.
 *
 * @param key - 환경변수 키
 * @param defaultValue - 기본값
 * @returns 환경변수 값 또는 기본값
 */
export function getEnvWithDefault(key: string, defaultValue: string): string {
  const value = process.env[key]
  return value && value.trim() !== '' ? value : defaultValue
}

/**
 * 여러 환경변수를 한번에 검증합니다.
 * 하나라도 없으면 모든 누락된 변수를 표시하고 프로세스를 종료합니다.
 *
 * @param keys - 환경변수 키 배열
 */
export function validateEnv(keys: string[]): void {
  const missing: string[] = []

  keys.forEach(key => {
    const value = process.env[key]
    if (!value || value.trim() === '') {
      missing.push(key)
    }
  })

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(key => console.error(`   - ${key}`))
    console.error(`\n💡 Please add these variables to your .env.local file`)
    console.error(`   You can use .env.example as a template\n`)
    process.exit(1)
  }
}

/**
 * 부울 환경변수를 가져옵니다.
 * 'true', '1', 'yes'는 true로, 그 외는 false로 변환됩니다.
 *
 * @param key - 환경변수 키
 * @param defaultValue - 기본값
 * @returns 부울 값
 */
export function getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key]?.toLowerCase()
  if (!value) return defaultValue
  return value === 'true' || value === '1' || value === 'yes'
}

/**
 * 숫자 환경변수를 가져옵니다.
 *
 * @param key - 환경변수 키
 * @param defaultValue - 기본값
 * @returns 숫자 값
 */
export function getNumberEnv(key: string, defaultValue: number): number {
  const value = process.env[key]
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}
