import { test, expect } from '../../../../fixtures/electron.fixture'

test.describe('UpdateManagerStateMachine', () => {
  // 关于页更新服务覆盖检查/下载/暂停/恢复/取消/状态读取的失败分支状态机
  test('离线设置-更新服务状态机在无可下载版本时返回稳定结果', async ({ contentPage, clearCache, jumpToSettings }) => {
    test.setTimeout(70000)
    await clearCache()
    await jumpToSettings()
    // 进入关于页并确认更新卡片可见
    const aboutMenu = contentPage.locator('[data-testid="settings-menu-about"]')
    await aboutMenu.click()
    await expect(aboutMenu).toHaveClass(/active/, { timeout: 5000 })
    const updateCard = contentPage.locator('.update-card')
    await expect(updateCard).toBeVisible({ timeout: 5000 })
    await expect(updateCard.getByRole('button', { name: /检查更新/ })).toBeVisible({ timeout: 5000 })
    // 设置不可达更新源，触发更新状态机失败链路
    const updateResult = await contentPage.evaluate(async () => {
      const bridge = (window as unknown as {
        electronAPI?: {
          updateManager?: {
            setUpdateSource: (source: 'github' | 'custom', customUrl?: string) => Promise<{ code: number; msg: string; data: null }>
            testConnection: (url: string) => Promise<{ code: number; msg: string; data: null }>
            checkForUpdates: () => Promise<{ code: number; msg: string; data: unknown }>
            downloadUpdate: () => Promise<{ code: number; msg: string; data: null }>
            pauseDownload: () => Promise<{ code: number; msg: string; data: null }>
            resumeDownload: () => Promise<{ code: number; msg: string; data: null }>
            cancelDownload: () => Promise<{ code: number; msg: string; data: null }>
            getDownloadState: () => Promise<{ code: number; msg: string; data: unknown }>
          }
        }
      }).electronAPI
      if (!bridge?.updateManager) {
        return {
          hasBridge: false,
          setSourceCode: -1,
          testConnectionCode: -1,
          checkCode: -1,
          downloadCode: -1,
          preCancelCode: -1,
          pauseCode: -1,
          resumeCode: -1,
          cancelCode: -1,
          getStateCode: -1,
          getStateDataIsNull: false,
        }
      }
      const unreachableUrl = 'http://127.0.0.1:1/apiflow-update'
      const setSource = await bridge.updateManager.setUpdateSource('custom', unreachableUrl)
      const testConnection = await bridge.updateManager.testConnection(unreachableUrl)
      const checkForUpdates = await bridge.updateManager.checkForUpdates()
      const downloadUpdate = await bridge.updateManager.downloadUpdate()
      const preCancelDownload = await bridge.updateManager.cancelDownload()
      const pauseDownload = await bridge.updateManager.pauseDownload()
      const resumeDownload = await bridge.updateManager.resumeDownload()
      const cancelDownloadAgain = await bridge.updateManager.cancelDownload()
      const getDownloadState = await bridge.updateManager.getDownloadState()
      return {
        hasBridge: true,
        setSourceCode: setSource.code,
        testConnectionCode: testConnection.code,
        checkCode: checkForUpdates.code,
        downloadCode: downloadUpdate.code,
        preCancelCode: preCancelDownload.code,
        pauseCode: pauseDownload.code,
        resumeCode: resumeDownload.code,
        cancelCode: cancelDownloadAgain.code,
        getStateCode: getDownloadState.code,
        getStateDataIsNull: getDownloadState.data === null,
      }
    })
    expect(updateResult.hasBridge).toBeTruthy()
    expect(updateResult.setSourceCode).toBe(0)
    expect(updateResult.testConnectionCode).toBe(1)
    expect(updateResult.checkCode).toBe(1)
    expect(updateResult.downloadCode).toBe(1)
    expect([0, 1]).toContain(updateResult.preCancelCode)
    expect(updateResult.pauseCode).toBe(1)
    expect(updateResult.resumeCode).toBe(1)
    expect(updateResult.cancelCode).toBe(1)
    expect(updateResult.getStateCode).toBe(0)
    expect(updateResult.getStateDataIsNull).toBeTruthy()
    // 无下载完成态时不应出现“立即安装”入口，避免误触发安装动作
    await expect(updateCard.getByRole('button', { name: /立即安装/ })).toHaveCount(0)
  })
})
