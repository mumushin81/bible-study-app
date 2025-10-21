import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary 컴포넌트
 *
 * React 컴포넌트 트리에서 발생하는 에러를 캐치하고
 * 사용자에게 친절한 에러 메시지를 표시합니다.
 *
 * 사용 예:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)

    // 프로덕션에서는 에러 로깅 서비스로 전송
    // 예: Sentry, LogRocket 등
    if (process.env.NODE_ENV === 'production') {
      // reportErrorToService(error, errorInfo)
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">😥</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                문제가 발생했습니다
              </h1>
              <p className="text-gray-600 mb-6">
                앱에서 예상치 못한 오류가 발생했습니다.
                <br />
                잠시 후 다시 시도해주세요.
              </p>

              {/* 에러 상세 정보 (개발 환경에서만) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                    에러 상세 정보 (개발 전용)
                  </summary>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={this.handleReload}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
                >
                  페이지 새로고침
                </button>
                <button
                  onClick={this.handleReset}
                  className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors"
                >
                  홈으로 이동
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-6">
                문제가 계속되면{' '}
                <a
                  href="https://github.com/anthropics/claude-code/issues"
                  className="text-purple-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  문의하기
                </a>
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
