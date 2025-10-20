/**
 * 로깅 유틸리티
 */

export const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  warn: (msg: string) => console.log(`⚠️  ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`),
  progress: (current: number, total: number, msg: string) => {
    const percent = Math.round((current / total) * 100)
    console.log(`📊 [${current}/${total}] ${percent}% - ${msg}`)
  }
}
