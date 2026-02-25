import { test, expect } from '../../../../../../fixtures/electron.fixture'

test.describe('MockIpcPayload', () => {
  // HTTP Mock 启停与请求日志通过 mainToRenderer 推送，载荷结构符合契约
  test('离线-HTTPMock logsBatch/statusChanged 事件载荷结构正确', async ({ contentPage, clearCache, createProject, createNode }) => {
    test.setTimeout(60000)
    await clearCache()
    await createProject()
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 })
    const mockNodeName = `离线-HTTPMock-IPC-${Date.now()}`
    const mockNodeId = await createNode(contentPage, { nodeType: 'httpMock', name: mockNodeName })
    const bannerTree = contentPage.locator('[data-testid="banner-doc-tree"]')
    const mockNode = bannerTree.locator('.el-tree-node__content', { hasText: mockNodeName }).first()
    await expect(mockNode).toBeVisible({ timeout: 5000 })
    await mockNode.click()
    const mockConfig = contentPage.locator('.mock-config-content')
    await expect(mockConfig).toBeVisible({ timeout: 5000 })
    const mockPort = 19191
    const mockPath = '/mock/offline-ipc-payload'
    // 配置并保存 HTTP Mock，确保后续启停和请求可以触发日志事件
    await mockConfig.locator('.condition-content .port-input input').first().fill(String(mockPort))
    await mockConfig.locator('.condition-content .url-input input').first().fill(mockPath)
    await mockConfig.getByRole('button', { name: /保存配置/ }).click()
    await contentPage.evaluate(() => {
      const bridge = (window as unknown as {
        electronAPI?: {
          ipcManager?: {
            onMain: (channel: string, callback: (payload: unknown) => void) => void
          }
        }
      }).electronAPI
      const runtime = window as unknown as {
        __mockStatusPayloads?: unknown[]
        __mockLogBatchPayloads?: unknown[]
      }
      runtime.__mockStatusPayloads = []
      runtime.__mockLogBatchPayloads = []
      bridge?.ipcManager?.onMain('mock:main:to:renderer:status-changed', (payload: unknown) => {
        runtime.__mockStatusPayloads?.push(payload)
      })
      bridge?.ipcManager?.onMain('mock:main:to:renderer:logs-batch', (payload: unknown) => {
        runtime.__mockLogBatchPayloads?.push(payload)
      })
    })
    // 通过用户操作启动 Mock，并发起一次请求触发日志推送
    await mockNode.click({ button: 'right' })
    await contentPage.locator('.s-contextmenu .s-contextmenu-item').filter({ hasText: /启动mock/ }).first().click()
    await expect(mockNode.locator('.mock-status .status-dot.running')).toBeVisible({ timeout: 30000 })
    const response = await contentPage.request.get(`http://127.0.0.1:${mockPort}${mockPath}?source=ipc-payload`)
    expect(response.status()).toBe(200)
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const runtime = window as unknown as {
          __mockStatusPayloads?: Array<Record<string, unknown>>
          __mockLogBatchPayloads?: Array<unknown>
        }
        const statusList = runtime.__mockStatusPayloads || []
        const latestStatus = statusList.length > 0 ? statusList[statusList.length - 1] : null
        const batchList = runtime.__mockLogBatchPayloads || []
        const nonEmptyBatch = batchList.find((item) => Array.isArray(item) && item.length > 0)
        const firstLog = Array.isArray(nonEmptyBatch) ? (nonEmptyBatch[0] as Record<string, unknown>) : null
        return {
          statusCount: statusList.length,
          latestStatusNodeId: latestStatus ? String(latestStatus['nodeId'] || '') : '',
          latestStatusState: latestStatus ? String(latestStatus['state'] || '') : '',
          logBatchCount: batchList.length,
          firstLogNodeId: firstLog ? String(firstLog['nodeId'] || '') : '',
          firstLogType: firstLog ? String(firstLog['type'] || '') : '',
          firstLogHasTimestamp: firstLog ? typeof firstLog['timestamp'] === 'number' : false,
          firstLogHasId: firstLog ? typeof firstLog['id'] === 'string' && firstLog['id'].length > 0 : false,
        }
      })
    }, { timeout: 15000 }).toMatchObject({
      statusCount: expect.any(Number),
      logBatchCount: expect.any(Number),
    })
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const runtime = window as unknown as {
          __mockLogBatchPayloads?: Array<unknown>
        }
        return (runtime.__mockLogBatchPayloads || []).length
      })
    }, { timeout: 15000 }).toBeGreaterThan(0)
    const payloadShape = await contentPage.evaluate(() => {
      const runtime = window as unknown as {
        __mockStatusPayloads?: Array<Record<string, unknown>>
        __mockLogBatchPayloads?: Array<unknown>
      }
      const statusList = runtime.__mockStatusPayloads || []
      const latestStatus = statusList.length > 0 ? statusList[statusList.length - 1] : null
      const batchList = runtime.__mockLogBatchPayloads || []
      const nonEmptyBatch = batchList.find((item) => Array.isArray(item) && item.length > 0)
      const firstLog = Array.isArray(nonEmptyBatch) ? (nonEmptyBatch[0] as Record<string, unknown>) : null
      return {
        statusCount: statusList.length,
        latestStatusNodeId: latestStatus ? String(latestStatus['nodeId'] || '') : '',
        latestStatusState: latestStatus ? String(latestStatus['state'] || '') : '',
        logBatchCount: batchList.length,
        firstLogNodeId: firstLog ? String(firstLog['nodeId'] || '') : '',
        firstLogType: firstLog ? String(firstLog['type'] || '') : '',
        firstLogHasTimestamp: firstLog ? typeof firstLog['timestamp'] === 'number' : false,
        firstLogHasId: firstLog ? typeof firstLog['id'] === 'string' && firstLog['id'].length > 0 : false,
      }
    })
    expect(payloadShape.statusCount).toBeGreaterThan(0)
    expect(payloadShape.latestStatusNodeId).toBe(mockNodeId)
    expect(['starting', 'running', 'stopping', 'stopped', 'error']).toContain(payloadShape.latestStatusState)
    expect(payloadShape.logBatchCount).toBeGreaterThan(0)
    expect(payloadShape.firstLogNodeId).toBe(mockNodeId)
    expect(payloadShape.firstLogType.length).toBeGreaterThan(0)
    expect(payloadShape.firstLogHasTimestamp).toBeTruthy()
    expect(payloadShape.firstLogHasId).toBeTruthy()
  })
  // WebSocket Mock 启停与连接日志通过 mainToRenderer 推送，载荷结构符合契约
  test('离线-WebSocketMock logsBatch/statusChanged 事件载荷结构正确', async ({ contentPage, clearCache, createProject, createNode }) => {
    test.setTimeout(60000)
    await clearCache()
    await createProject()
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 })
    const wsMockNodeName = `离线-WSMock-IPC-${Date.now()}`
    const wsMockNodeId = await createNode(contentPage, { nodeType: 'websocketMock', name: wsMockNodeName })
    const bannerTree = contentPage.locator('[data-testid="banner-doc-tree"]')
    const wsMockNode = bannerTree.locator('.el-tree-node__content', { hasText: wsMockNodeName }).first()
    await expect(wsMockNode).toBeVisible({ timeout: 5000 })
    await wsMockNode.click()
    const wsMockConfig = contentPage.locator('.mock-config-content')
    await expect(wsMockConfig).toBeVisible({ timeout: 5000 })
    const wsMockPort = 19192
    const wsMockPath = '/ws-mock/offline-ipc-payload'
    // 配置并保存 WebSocket Mock
    await wsMockConfig.locator('.condition-content .port-input input').first().fill(String(wsMockPort))
    await wsMockConfig.locator('.condition-content .path-input input').first().fill(wsMockPath)
    await wsMockConfig.getByRole('button', { name: /保存配置/ }).click()
    await contentPage.evaluate(() => {
      const bridge = (window as unknown as {
        electronAPI?: {
          ipcManager?: {
            onMain: (channel: string, callback: (payload: unknown) => void) => void
          }
        }
      }).electronAPI
      const runtime = window as unknown as {
        __wsMockStatusPayloads?: unknown[]
        __wsMockLogBatchPayloads?: unknown[]
      }
      runtime.__wsMockStatusPayloads = []
      runtime.__wsMockLogBatchPayloads = []
      bridge?.ipcManager?.onMain('websocket-mock:main:to:renderer:status-changed', (payload: unknown) => {
        runtime.__wsMockStatusPayloads?.push(payload)
      })
      bridge?.ipcManager?.onMain('websocket-mock:main:to:renderer:logs-batch', (payload: unknown) => {
        runtime.__wsMockLogBatchPayloads?.push(payload)
      })
    })
    // 通过“启用Mock服务”开关触发启停，确保状态变更事件必然触发
    const wsRunningDot = wsMockNode.locator('.mock-status .status-dot.running')
    const enableSwitch = wsMockConfig.locator('.condition-content .el-switch').first()
    await expect(enableSwitch).toBeVisible({ timeout: 5000 })
    const switchChecked = await enableSwitch.evaluate((element) => element.classList.contains('is-checked'))
    if (switchChecked) {
      await enableSwitch.click()
      await expect(wsRunningDot).toBeHidden({ timeout: 30000 })
    }
    await enableSwitch.click()
    await expect(wsRunningDot).toBeVisible({ timeout: 30000 })
    await contentPage.evaluate(async ({ port, path }) => {
      await new Promise<void>((resolve) => {
        const ws = new WebSocket(`ws://127.0.0.1:${port}${path}`)
        const timer = window.setTimeout(() => {
          ws.close()
          resolve()
        }, 2000)
        ws.onopen = () => {
          ws.send('ipc-payload-message')
          window.setTimeout(() => ws.close(), 300)
        }
        ws.onclose = () => {
          window.clearTimeout(timer)
          resolve()
        }
        ws.onerror = () => {
          window.clearTimeout(timer)
          resolve()
        }
      })
    }, { port: wsMockPort, path: wsMockPath })
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const runtime = window as unknown as {
          __wsMockStatusPayloads?: Array<Record<string, unknown>>
          __wsMockLogBatchPayloads?: Array<unknown>
        }
        const statusList = runtime.__wsMockStatusPayloads || []
        const latestStatus = statusList.length > 0 ? statusList[statusList.length - 1] : null
        const batchList = runtime.__wsMockLogBatchPayloads || []
        const nonEmptyBatch = batchList.find((item) => Array.isArray(item) && item.length > 0)
        const firstLog = Array.isArray(nonEmptyBatch) ? (nonEmptyBatch[0] as Record<string, unknown>) : null
        return {
          statusCount: statusList.length,
          latestStatusNodeId: latestStatus ? String(latestStatus['nodeId'] || '') : '',
          latestStatusState: latestStatus ? String(latestStatus['state'] || '') : '',
          logBatchCount: batchList.length,
          firstLogNodeId: firstLog ? String(firstLog['nodeId'] || '') : '',
          firstLogType: firstLog ? String(firstLog['type'] || '') : '',
          firstLogHasTimestamp: firstLog ? typeof firstLog['timestamp'] === 'number' : false,
          firstLogHasId: firstLog ? typeof firstLog['id'] === 'string' && firstLog['id'].length > 0 : false,
        }
      })
    }, { timeout: 15000 }).toMatchObject({
      statusCount: expect.any(Number),
      logBatchCount: expect.any(Number),
    })
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const runtime = window as unknown as {
          __wsMockLogBatchPayloads?: Array<unknown>
        }
        return (runtime.__wsMockLogBatchPayloads || []).length
      })
    }, { timeout: 15000 }).toBeGreaterThan(0)
    const payloadShape = await contentPage.evaluate(() => {
      const runtime = window as unknown as {
        __wsMockStatusPayloads?: Array<Record<string, unknown>>
        __wsMockLogBatchPayloads?: Array<unknown>
      }
      const statusList = runtime.__wsMockStatusPayloads || []
      const latestStatus = statusList.length > 0 ? statusList[statusList.length - 1] : null
      const batchList = runtime.__wsMockLogBatchPayloads || []
      const nonEmptyBatch = batchList.find((item) => Array.isArray(item) && item.length > 0)
      const firstLog = Array.isArray(nonEmptyBatch) ? (nonEmptyBatch[0] as Record<string, unknown>) : null
      return {
        statusCount: statusList.length,
        latestStatusNodeId: latestStatus ? String(latestStatus['nodeId'] || '') : '',
        latestStatusState: latestStatus ? String(latestStatus['state'] || '') : '',
        logBatchCount: batchList.length,
        firstLogNodeId: firstLog ? String(firstLog['nodeId'] || '') : '',
        firstLogType: firstLog ? String(firstLog['type'] || '') : '',
        firstLogHasTimestamp: firstLog ? typeof firstLog['timestamp'] === 'number' : false,
        firstLogHasId: firstLog ? typeof firstLog['id'] === 'string' && firstLog['id'].length > 0 : false,
      }
    })
    expect(payloadShape.statusCount).toBeGreaterThan(0)
    expect(payloadShape.latestStatusNodeId).toBe(wsMockNodeId)
    expect(['starting', 'running', 'stopping', 'stopped', 'error']).toContain(payloadShape.latestStatusState)
    expect(payloadShape.logBatchCount).toBeGreaterThan(0)
    expect(payloadShape.firstLogNodeId).toBe(wsMockNodeId)
    expect(payloadShape.firstLogType.length).toBeGreaterThan(0)
    expect(payloadShape.firstLogHasTimestamp).toBeTruthy()
    expect(payloadShape.firstLogHasId).toBeTruthy()
  })
})
