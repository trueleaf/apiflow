import { test, expect } from '../../../../fixtures/electron.fixture'

test.describe('PreloadBridgeContract', () => {
  // 离线设置页触发 preload bridge 契约校验：websocket/mock/websocketMock/updateManager
  test('离线设置-bridge 暴露的核心 API 具备可调用契约', async ({ contentPage, clearCache, jumpToSettings }) => {
    await clearCache()
    await jumpToSettings()
    // 先通过用户操作进入“关于”页面，再执行 bridge 调用契约断言
    const aboutMenu = contentPage.locator('[data-testid="settings-menu-about"]')
    await aboutMenu.click()
    await expect(aboutMenu).toHaveClass(/active/, { timeout: 5000 })
    await expect(contentPage.locator('.about-container .page-header')).toContainText('关于', { timeout: 5000 })
    const bridgeContractResult = await contentPage.evaluate(async () => {
      const bridge = (window as unknown as {
        electronAPI?: {
          websocket?: {
            getConnectionIds: () => Promise<string[]>
            clearAllConnections: () => Promise<{ code: number; msg: string; data: { closedCount: number } }>
            disconnectByNode: (nodeId: string) => Promise<{ code: number; msg: string; data: null }>
          }
          mock?: {
            getAllStates: (projectId: string) => Promise<unknown[]>
          }
          websocketMock?: {
            getAllStates: (projectId: string) => Promise<unknown[]>
          }
          updateManager?: {
            getDownloadState: () => Promise<{ code: number; msg: string; data: unknown }>
            setAutoCheck: (autoCheck: boolean) => Promise<{ code: number; msg: string; data: null }>
            setUpdateSource: (source: 'github' | 'custom', customUrl?: string) => Promise<{ code: number; msg: string; data: null }>
            isAppStore: () => Promise<boolean>
          }
        }
      }).electronAPI
      const hasBridge =
        !!bridge
        && !!bridge.websocket
        && !!bridge.mock
        && !!bridge.websocketMock
        && !!bridge.updateManager
      if (!hasBridge) {
        return {
          hasBridge: false,
          connectionIds: [] as string[],
          clearAllConnections: { code: -1, msg: 'missing bridge', data: { closedCount: -1 } },
          disconnectByNode: { code: -1, msg: 'missing bridge', data: null },
          mockStatesCount: -1,
          websocketMockStatesCount: -1,
          downloadStateCode: -1,
          setAutoCheckCode: -1,
          setUpdateSourceCode: -1,
          isAppStore: false,
        }
      }
      const connectionIds = await bridge.websocket.getConnectionIds()
      const clearAllConnections = await bridge.websocket.clearAllConnections()
      const disconnectByNode = await bridge.websocket.disconnectByNode('bridge-contract-node')
      const mockStates = await bridge.mock.getAllStates('bridge-contract-project')
      const websocketMockStates = await bridge.websocketMock.getAllStates('bridge-contract-project')
      const downloadState = await bridge.updateManager.getDownloadState()
      const setAutoCheck = await bridge.updateManager.setAutoCheck(false)
      const setUpdateSource = await bridge.updateManager.setUpdateSource('github')
      const isAppStore = await bridge.updateManager.isAppStore()
      return {
        hasBridge: true,
        connectionIds,
        clearAllConnections,
        disconnectByNode,
        mockStatesCount: mockStates.length,
        websocketMockStatesCount: websocketMockStates.length,
        downloadStateCode: downloadState.code,
        setAutoCheckCode: setAutoCheck.code,
        setUpdateSourceCode: setUpdateSource.code,
        isAppStore,
      }
    })
    expect(bridgeContractResult.hasBridge).toBeTruthy()
    expect(Array.isArray(bridgeContractResult.connectionIds)).toBeTruthy()
    expect(bridgeContractResult.clearAllConnections.code).toBe(0)
    expect(bridgeContractResult.disconnectByNode.code).toBe(1)
    expect(bridgeContractResult.mockStatesCount).toBeGreaterThanOrEqual(0)
    expect(bridgeContractResult.websocketMockStatesCount).toBeGreaterThanOrEqual(0)
    expect(bridgeContractResult.downloadStateCode).toBe(0)
    expect(bridgeContractResult.setAutoCheckCode).toBe(0)
    expect(bridgeContractResult.setUpdateSourceCode).toBe(0)
    expect(typeof bridgeContractResult.isAppStore).toBe('boolean')
  })
})
