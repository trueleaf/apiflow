import { test, expect } from '../../../../fixtures/desktop.fixture'

test.describe('ContentViewLifecycleRetryFallback', () => {
  test.use({ remoteContentUrl: 'http://127.0.0.1:1/index.html' })
  test('远程工作区失败后可重试并切换到本地版本', async ({ contentPage }) => {
    test.setTimeout(120000)
    const retryButton = contentPage.getByRole('button', { name: /重试|Retry/ })
    const fallbackButton = contentPage.getByRole('button', { name: /使用本地版本|Use local version/ })
    await expect(retryButton).toBeVisible()
    await expect(fallbackButton).toBeVisible()
    const failedState = await contentPage.evaluate(async () => {
      const internals = (window as unknown as { __TAURI_INTERNALS__: { invoke: (command: string, payload: { action: string }) => Promise<{ state: string; currentUrl: string; failureInfo: { validatedURL: string; timestamp: number } | null }> } }).__TAURI_INTERNALS__
      return internals.invoke('content_load', { action: 'state' })
    })
    expect(failedState.state).toBe('failed')
    expect(failedState.failureInfo?.validatedURL).toContain('http://127.0.0.1:1/index.html')
    await retryButton.click()
    await expect.poll(async () => {
      try {
        return await contentPage.evaluate(async () => {
          const internals = (window as unknown as { __TAURI_INTERNALS__: { invoke: (command: string, payload: { action: string }) => Promise<{ state: string; failureInfo: { timestamp: number } | null }> } }).__TAURI_INTERNALS__
          const state = await internals.invoke('content_load', { action: 'state' })
          return state.state === 'failed' ? state.failureInfo?.timestamp ?? 0 : 0
        })
      } catch { return 0 }
    }, { timeout: 45000 }).toBeGreaterThan(failedState.failureInfo?.timestamp ?? 0)
    await fallbackButton.click()
    await contentPage.waitForURL(/tauri\.localhost\/index\.html/, { timeout: 20000 })
    await contentPage.waitForFunction(() => !!window.desktopAPI)
    await expect.poll(async () => contentPage.evaluate(async () => {
      const internals = (window as unknown as { __TAURI_INTERNALS__: { invoke: (command: string, payload: { action: string }) => Promise<{ state: string }> } }).__TAURI_INTERNALS__
      return (await internals.invoke('content_load', { action: 'state' })).state
    })).toBe('loaded')
  })
})
