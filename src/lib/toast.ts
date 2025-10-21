/**
 * 간단한 토스트 알림 시스템
 *
 * 별도 라이브러리 없이 네이티브 JavaScript로 구현
 * 필요시 react-hot-toast 등으로 교체 가능
 */

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
  duration?: number
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left'
}

class ToastManager {
  private container: HTMLElement | null = null

  private getContainer(): HTMLElement {
    if (!this.container) {
      this.container = document.createElement('div')
      this.container.id = 'toast-container'
      this.container.style.cssText = `
        position: fixed;
        z-index: 9999;
        pointer-events: none;
      `
      document.body.appendChild(this.container)
    }
    return this.container
  }

  private getPositionStyles(position: ToastOptions['position'] = 'top-right'): string {
    const positions = {
      'top-right': 'top: 1rem; right: 1rem;',
      'top-center': 'top: 1rem; left: 50%; transform: translateX(-50%);',
      'top-left': 'top: 1rem; left: 1rem;',
      'bottom-right': 'bottom: 1rem; right: 1rem;',
      'bottom-center': 'bottom: 1rem; left: 50%; transform: translateX(-50%);',
      'bottom-left': 'bottom: 1rem; left: 1rem;',
    }
    return positions[position]
  }

  private getTypeStyles(type: ToastType): { bg: string; icon: string } {
    const styles = {
      success: { bg: '#10b981', icon: '✅' },
      error: { bg: '#ef4444', icon: '❌' },
      warning: { bg: '#f59e0b', icon: '⚠️' },
      info: { bg: '#3b82f6', icon: 'ℹ️' },
    }
    return styles[type]
  }

  public show(message: string, type: ToastType = 'info', options: ToastOptions = {}) {
    const { duration = 3000, position = 'top-right' } = options
    const container = this.getContainer()
    container.style.cssText += this.getPositionStyles(position)

    const { bg, icon } = this.getTypeStyles(type)

    const toast = document.createElement('div')
    toast.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background-color: ${bg};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      margin-bottom: 0.75rem;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-in ${duration - 300}ms;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.875rem;
      font-weight: 500;
      max-width: 20rem;
    `

    toast.innerHTML = `
      <span style="font-size: 1.25rem;">${icon}</span>
      <span>${message}</span>
    `

    // 애니메이션 CSS 추가
    if (!document.getElementById('toast-animations')) {
      const style = document.createElement('style')
      style.id = 'toast-animations'
      style.textContent = `
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `
      document.head.appendChild(style)
    }

    container.appendChild(toast)

    // 자동 제거
    setTimeout(() => {
      toast.remove()
      if (container.childElementCount === 0) {
        container.remove()
        this.container = null
      }
    }, duration)

    // 클릭 시 즉시 제거
    toast.addEventListener('click', () => {
      toast.remove()
    })

    return toast
  }

  public success(message: string, options?: ToastOptions) {
    return this.show(message, 'success', options)
  }

  public error(message: string, options?: ToastOptions) {
    return this.show(message, 'error', options)
  }

  public warning(message: string, options?: ToastOptions) {
    return this.show(message, 'warning', options)
  }

  public info(message: string, options?: ToastOptions) {
    return this.show(message, 'info', options)
  }
}

export const toast = new ToastManager()
