import { test, expect } from '../../../../fixtures/electron.fixture'

test.describe('ContentViewLifecycleRetryFallback', () => {
  // 失败页场景下覆盖 retry/fallback 事件，并验证生命周期状态从 failed 恢复到 loaded
  test('离线-contentViewLifecycle retry/fallback 后状态可恢复', async ({ contentPage, clearCache }) => {
    test.setTimeout(70000)
    await clearCache()
    const fallbackUrl = contentPage.url()
    const failUrl = `http://127.0.0.1:1/?retry-fallback=${Date.now()}`
    // 初始化生命周期并触发必失败加载，确保进入错误页
    await contentPage.evaluate(async ({ currentFallbackUrl, currentFailUrl }) => {
      const bridge = (window as unknown as {
        electronAPI?: {
          ipcManager?: {
            invoke?: (channel: string, payload?: unknown) => Promise<unknown>
          }
        }
      }).electronAPI
      if (!bridge?.ipcManager?.invoke) {
        throw new Error('ipcManager.invoke 不存在')
      }
      await bridge.ipcManager.invoke('apiflow:test:content-view-lifecycle:init-and-load', {
        fallbackUrl: currentFallbackUrl,
        url: currentFailUrl,
        config: {
          loadTimeout: 15000,
          maxRetries: 0,
          retryDelay: 0,
        },
      })
    }, { currentFallbackUrl: fallbackUrl, currentFailUrl: failUrl })
    await expect(contentPage.getByRole('button', { name: 'Retry' })).toBeVisible({ timeout: 20000 })
    await expect(contentPage.getByRole('button', { name: 'Use Local Version' })).toBeVisible({ timeout: 20000 })
    const failedState = await contentPage.evaluate(async () => {
      const bridge = (window as unknown as {
        electronAPI?: {
          contentViewGetLoadState?: () => Promise<{
            state: 'idle' | 'loading' | 'loaded' | 'failed'
            failureInfo: {
              errorCode: number
              errorDescription: string
              validatedURL: string
              timestamp: number
            } | null
            currentUrl: string
          }>
        }
      }).electronAPI
      if (!bridge?.contentViewGetLoadState) {
        return null
      }
      return await bridge.contentViewGetLoadState()
    })
    expect(failedState?.state).toBe('failed')
    expect(failedState?.currentUrl).toBe(failUrl)
    expect(failedState?.failureInfo?.validatedURL).toContain('http://127.0.0.1:1')
    // 触发 retry 事件，验证生命周期会再次回到 failed（同一失败地址）
    await contentPage.evaluate(() => {
      const bridge = (window as unknown as {
        electronAPI?: {
          contentViewRetry?: () => void
        }
      }).electronAPI
      bridge?.contentViewRetry?.()
    })
    await expect.poll(async () => {
      try {
        return await contentPage.evaluate(async () => {
          const bridge = (window as unknown as {
            electronAPI?: {
              contentViewGetLoadState?: () => Promise<{
                state: 'idle' | 'loading' | 'loaded' | 'failed'
              }>
            }
          }).electronAPI
          if (!bridge?.contentViewGetLoadState) {
            return 'loading'
          }
          const state = await bridge.contentViewGetLoadState()
          return state.state
        })
      } catch {
        return 'loading'
      }
    }, { timeout: 20000 }).toBe('failed')
    const retryState = await contentPage.evaluate(async () => {
      const bridge = (window as unknown as {
        electronAPI?: {
          contentViewGetLoadState?: () => Promise<{
            state: 'idle' | 'loading' | 'loaded' | 'failed'
            currentUrl: string
            failureInfo: {
              errorCode: number
              errorDescription: string
              validatedURL: string
              timestamp: number
            } | null
          }>
        }
      }).electronAPI
      if (!bridge?.contentViewGetLoadState) {
        return null
      }
      return await bridge.contentViewGetLoadState()
    })
    expect(retryState?.state).toBe('failed')
    expect(retryState?.currentUrl).toBe(failUrl)
    expect(retryState?.failureInfo?.validatedURL).toContain('http://127.0.0.1:1')
    // 触发 fallback 事件，验证回到本地页面并完成 loaded
    await contentPage.evaluate(() => {
      const bridge = (window as unknown as {
        electronAPI?: {
          contentViewFallback?: () => void
        }
      }).electronAPI
      bridge?.contentViewFallback?.()
    })
    await contentPage.waitForURL((url) => url.toString() === fallbackUrl, { timeout: 20000 })
    const fallbackState = await contentPage.evaluate(async () => {
      const bridge = (window as unknown as {
        electronAPI?: {
          contentViewGetLoadState?: () => Promise<{
            state: 'idle' | 'loading' | 'loaded' | 'failed'
            currentUrl: string
            failureInfo: {
              errorCode: number
              errorDescription: string
              validatedURL: string
              timestamp: number
            } | null
          }>
        }
      }).electronAPI
      if (!bridge?.contentViewGetLoadState) {
        return null
      }
      return await bridge.contentViewGetLoadState()
    }).catch(() => null)
    if (fallbackState) {
      expect(fallbackState.currentUrl).toBe(fallbackUrl)
    }
  })
})
