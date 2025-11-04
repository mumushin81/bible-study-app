// 텍스트 유사도 계산 유틸리티
export function similarityScore(str1: string, str2: string): number {
  // 레벤슈타인 거리 기반 유사도 계산
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  // 초기화
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  // 레벤슈타인 거리 계산
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,       // 삭제
        dp[i][j - 1] + 1,       // 삽입
        dp[i - 1][j - 1] + cost // 대체
      )
    }
  }

  // 유사도 점수로 변환 (0-1 사이)
  const distance = dp[m][n]
  const maxLength = Math.max(m, n)
  const similarityScore = 1 - distance / maxLength

  return similarityScore
}