import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { createServer, request } from 'node:http'
import type { AddressInfo } from 'node:net'
import { test, expect } from '../../../../fixtures/electron.fixture'

test.describe('McpService', () => {
  test('设置页展示 MCP 服务状态和 Codex 配置', async ({ contentPage, clearCache, jumpToSettings }) => {
    await clearCache()
    await jumpToSettings()
    const mcpMenu = contentPage.locator('[data-testid="settings-menu-mcp-settings"]')
    await expect(mcpMenu).toBeVisible({ timeout: 5000 })
    await mcpMenu.click()
    await expect(mcpMenu).toHaveClass(/active/, { timeout: 5000 })
    await expect(contentPage.locator('[data-testid="settings-mcp-panel"]')).toBeVisible({ timeout: 5000 })
    await expect(contentPage.locator('[data-testid="mcp-endpoint"]')).toContainText(/http:\/\/127\.0\.0\.1:\d+\/mcp/, { timeout: 10000 })
    await expect(contentPage.locator('[data-testid="mcp-codex-config"]')).toContainText('[mcp_servers.apiflow]')
    await expect(contentPage.locator('[data-testid="mcp-codex-config"]')).toContainText('enabled = true')
    await expect(contentPage.locator('[data-testid="mcp-server-status"]')).toContainText(/运行中|异常|已停止|启动中/)
    await expect(contentPage.locator('[data-testid="mcp-executor-status"]')).toContainText(/已就绪|加载中|未创建|异常/)
  })

  test('MCP 服务可切换到固定端口并通过桥接返回 running 状态', async ({ contentPage }) => {
    let originalSettings: { enabled: boolean; port: number } | null = null
    const targetPort = 38100 + Math.floor(Math.random() * 1000)
    try {
      originalSettings = await contentPage.evaluate(async () => {
        const status = await window.electronAPI?.mcpManager.getStatus()
        if (!status) {
          throw new Error('MCP bridge missing')
        }
        return {
          enabled: status.enabled,
          port: status.port,
        }
      })
      const updatedStatus = await contentPage.evaluate(async (settings: { enabled: boolean; port: number }) => {
        const status = await window.electronAPI?.mcpManager.updateSettings(settings)
        if (!status) {
          throw new Error('MCP bridge missing')
        }
        return status
      }, { enabled: true, port: targetPort })
      expect(updatedStatus.port).toBe(targetPort)
      expect(updatedStatus.endpoint).toBe(`http://127.0.0.1:${targetPort}/mcp`)
      await expect.poll(async () => {
        return await contentPage.evaluate(async () => {
          const status = await window.electronAPI?.mcpManager.getStatus()
          return `${status?.serverState ?? 'missing'}:${status?.executorState ?? 'missing'}`
        })
      }, { timeout: 15000 }).toBe('running:ready')
      const notFoundResponse = await fetch(`http://127.0.0.1:${targetPort}/not-found`)
      expect(notFoundResponse.status).toBe(404)
    } finally {
      if (originalSettings) {
        await contentPage.evaluate(async (settings: { enabled: boolean; port: number }) => {
          await window.electronAPI?.mcpManager.updateSettings(settings)
        }, originalSettings)
      }
    }
  })

  test('关闭主窗口后 MCP 服务继续在后台响应', async ({ electronApp, contentPage }) => {
    let originalSettings: { enabled: boolean; port: number } | null = null
    const targetPort = 38600 + Math.floor(Math.random() * 1000)
    try {
      originalSettings = await contentPage.evaluate(async () => {
        const status = await window.electronAPI?.mcpManager.getStatus()
        if (!status) {
          throw new Error('MCP bridge missing')
        }
        return {
          enabled: status.enabled,
          port: status.port,
        }
      })
      await contentPage.evaluate(async (settings: { enabled: boolean; port: number }) => {
        await window.electronAPI?.mcpManager.updateSettings(settings)
      }, { enabled: true, port: targetPort })
      await expect.poll(async () => {
        return await contentPage.evaluate(async () => {
          const status = await window.electronAPI?.mcpManager.getStatus()
          return `${status?.serverState ?? 'missing'}:${status?.executorState ?? 'missing'}`
        })
      }, { timeout: 15000 }).toBe('running:ready')
      const closeState = await electronApp.evaluate(async ({ BrowserWindow }) => {
        const targetWindow = BrowserWindow.getAllWindows().find(window => !window.webContents.getURL().includes('mcp.html'))
        if (!targetWindow) {
          return {
            found: false,
            visible: false,
            destroyed: true,
          }
        }
        targetWindow.close()
        await new Promise(resolve => setTimeout(resolve, 500))
        return {
          found: true,
          visible: targetWindow.isVisible(),
          destroyed: targetWindow.isDestroyed(),
        }
      })
      expect(closeState.found).toBeTruthy()
      expect(closeState.destroyed).toBeFalsy()
      expect(closeState.visible).toBeFalsy()
      const notFoundResponse = await fetch(`http://127.0.0.1:${targetPort}/not-found`)
      expect(notFoundResponse.status).toBe(404)
      const showState = await electronApp.evaluate(async ({ BrowserWindow }) => {
        const targetWindow = BrowserWindow.getAllWindows().find(window => !window.webContents.getURL().includes('mcp.html'))
        if (!targetWindow) {
          return false
        }
        targetWindow.show()
        targetWindow.focus()
        await new Promise(resolve => setTimeout(resolve, 300))
        return targetWindow.isVisible()
      })
      expect(showState).toBeTruthy()
    } finally {
      if (originalSettings) {
        await contentPage.evaluate(async (settings: { enabled: boolean; port: number }) => {
          await window.electronAPI?.mcpManager.updateSettings(settings)
        }, originalSettings)
      }
    }
  })

  test('MCP 协议暴露白名单 tools 和 resources', async ({ contentPage }) => {
    let originalSettings: { enabled: boolean; port: number } | null = null
    let client: Client | null = null
    const targetPort = 39100 + Math.floor(Math.random() * 1000)
    try {
      originalSettings = await contentPage.evaluate(async () => {
        const status = await window.electronAPI?.mcpManager.getStatus()
        if (!status) {
          throw new Error('MCP bridge missing')
        }
        return {
          enabled: status.enabled,
          port: status.port,
        }
      })
      await contentPage.evaluate(async (settings: { enabled: boolean; port: number }) => {
        await window.electronAPI?.mcpManager.updateSettings(settings)
      }, { enabled: true, port: targetPort })
      await expect.poll(async () => {
        return await contentPage.evaluate(async () => {
          const status = await window.electronAPI?.mcpManager.getStatus()
          return `${status?.serverState ?? 'missing'}:${status?.executorState ?? 'missing'}`
        })
      }, { timeout: 15000 }).toBe('running:ready')
      client = new Client({ name: 'apiflow-mcp-e2e', version: '1.0.0' })
      const transport = new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${targetPort}/mcp`))
      await client.connect(transport)
      const toolsResult = await client.listTools()
      const toolNames = toolsResult.tools.map(tool => tool.name)
      expect(toolNames).toContain('getProjectList')
      expect(toolNames).toContain('createProject')
      expect(toolNames).toContain('createHttpNode')
      expect(toolNames).toContain('getVariables')
      expect(toolNames).toContain('createGlobalCommonHeader')
      expect(toolNames).not.toContain('navigateToProject')
      expect(toolNames).not.toContain('sendHttpRequest')
      expect(toolNames).not.toContain('connectWebsocket')
      expect(new Set(toolNames).size).toBe(toolNames.length)
      const httpNodeTool = toolsResult.tools.find(tool => tool.name === 'createHttpNode')
      expect(httpNodeTool?.inputSchema.required).toContain('projectId')
      const resourcesResult = await client.listResources()
      expect(resourcesResult.resources.map(resource => resource.uri)).toContain('apiflow://projects')
      const templatesResult = await client.listResourceTemplates()
      const templates = templatesResult.resourceTemplates.map(template => template.uriTemplate)
      expect(templates).toContain('apiflow://projects/{projectId}')
      expect(templates).toContain('apiflow://projects/{projectId}/tree')
      expect(templates).toContain('apiflow://projects/{projectId}/variables')
      expect(templates).toContain('apiflow://projects/{projectId}/common-headers')
      expect(templates).toContain('apiflow://nodes/{nodeId}')
      const missingToolResult = await client.callTool({ name: '__missing_tool__', arguments: {} })
      expect(missingToolResult.isError).toBeTruthy()
      expect(missingToolResult.content[0].type).toBe('text')
      expect(missingToolResult.content[0].text).toContain('TOOL_NOT_FOUND')
      const invalidParamsResult = await client.callTool({ name: 'createHttpNode', arguments: {} })
      expect(invalidParamsResult.isError).toBeTruthy()
      expect(invalidParamsResult.content[0].type).toBe('text')
      expect(invalidParamsResult.content[0].text).toContain('INVALID_PARAMS')
      const invalidResourceResult = await client.readResource({ uri: 'apiflow://projects/%2E%2E' })
      expect(invalidResourceResult.contents[0].text).toContain('INVALID_RESOURCE_URI')
    } finally {
      if (client) {
        await client.close()
      }
      if (originalSettings) {
        await contentPage.evaluate(async (settings: { enabled: boolean; port: number }) => {
          await window.electronAPI?.mcpManager.updateSettings(settings)
        }, originalSettings)
      }
    }
  })

  test('MCP tools/call 写入离线项目后 resources/read 可读取同一份 IndexedDB 数据', async ({ contentPage }) => {
    let originalSettings: { enabled: boolean; port: number } | null = null
    let client: Client | null = null
    const targetPort = 41100 + Math.floor(Math.random() * 1000)
    const projectName = `MCP离线项目-${Date.now()}`
    try {
      originalSettings = await contentPage.evaluate(async () => {
        const status = await window.electronAPI?.mcpManager.getStatus()
        if (!status) {
          throw new Error('MCP bridge missing')
        }
        return {
          enabled: status.enabled,
          port: status.port,
        }
      })
      await contentPage.evaluate(async (settings: { enabled: boolean; port: number }) => {
        await window.electronAPI?.mcpManager.updateSettings(settings)
      }, { enabled: true, port: targetPort })
      await expect.poll(async () => {
        return await contentPage.evaluate(async () => {
          const status = await window.electronAPI?.mcpManager.getStatus()
          return `${status?.serverState ?? 'missing'}:${status?.executorState ?? 'missing'}`
        })
      }, { timeout: 15000 }).toBe('running:ready')
      client = new Client({ name: 'apiflow-mcp-data-e2e', version: '1.0.0' })
      const transport = new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${targetPort}/mcp`))
      await client.connect(transport)
      const createResult = await client.callTool({ name: 'createProject', arguments: { projectName } })
      expect(createResult.isError).not.toBeTruthy()
      expect(createResult.content[0].type).toBe('text')
      const createPayload = JSON.parse(createResult.content[0].text) as {
        code: number
        data?: {
          projectId?: unknown
          projectName?: unknown
        }
      }
      expect(createPayload.code).toBe(0)
      expect(createPayload.data?.projectName).toBe(projectName)
      const projectId = typeof createPayload.data?.projectId === 'string' ? createPayload.data.projectId : ''
      expect(projectId).not.toBe('')
      const listResult = await client.callTool({ name: 'getProjectList', arguments: {} })
      expect(listResult.isError).not.toBeTruthy()
      expect(listResult.content[0].type).toBe('text')
      expect(listResult.content[0].text).toContain(projectName)
      expect(listResult.content[0].text).toContain(projectId)
      const projectsResource = await client.readResource({ uri: 'apiflow://projects' })
      expect(projectsResource.contents[0].text).toContain(projectName)
      expect(projectsResource.contents[0].text).toContain(projectId)
      const projectResource = await client.readResource({ uri: `apiflow://projects/${encodeURIComponent(projectId)}` })
      expect(projectResource.contents[0].text).toContain(projectName)
      expect(projectResource.contents[0].text).toContain(projectId)
    } finally {
      if (client) {
        await client.close()
      }
      if (originalSettings) {
        await contentPage.evaluate(async (settings: { enabled: boolean; port: number }) => {
          await window.electronAPI?.mcpManager.updateSettings(settings)
        }, originalSettings)
      }
    }
  })

  test('MCP Host 和 Origin 防护拒绝非本机来源', async ({ contentPage }) => {
    let originalSettings: { enabled: boolean; port: number } | null = null
    const targetPort = 40100 + Math.floor(Math.random() * 1000)
    try {
      originalSettings = await contentPage.evaluate(async () => {
        const status = await window.electronAPI?.mcpManager.getStatus()
        if (!status) {
          throw new Error('MCP bridge missing')
        }
        return {
          enabled: status.enabled,
          port: status.port,
        }
      })
      await contentPage.evaluate(async (settings: { enabled: boolean; port: number }) => {
        await window.electronAPI?.mcpManager.updateSettings(settings)
      }, { enabled: true, port: targetPort })
      await expect.poll(async () => {
        return await contentPage.evaluate(async () => {
          const status = await window.electronAPI?.mcpManager.getStatus()
          return status?.serverState ?? 'missing'
        })
      }, { timeout: 15000 }).toBe('running')
      const forbiddenHost = await new Promise<{ statusCode: number; body: string }>((resolve, reject) => {
        const chunks: string[] = []
        const req = request({
          hostname: '127.0.0.1',
          port: targetPort,
          path: '/mcp',
          method: 'POST',
          headers: {
            Host: `example.com:${targetPort}`,
            'content-type': 'application/json',
          },
        }, response => {
          response.on('data', chunk => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk))
          })
          response.on('end', () => {
            resolve({
              statusCode: response.statusCode ?? 0,
              body: chunks.join(''),
            })
          })
        })
        req.on('error', reject)
        req.end(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }))
      })
      expect(forbiddenHost.statusCode).toBe(403)
      expect(forbiddenHost.body).toContain('Forbidden')
      const forbiddenOrigin = await new Promise<{ statusCode: number; body: string }>((resolve, reject) => {
        const chunks: string[] = []
        const req = request({
          hostname: '127.0.0.1',
          port: targetPort,
          path: '/mcp',
          method: 'POST',
          headers: {
            Host: `127.0.0.1:${targetPort}`,
            Origin: 'https://example.com',
            'content-type': 'application/json',
          },
        }, response => {
          response.on('data', chunk => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk))
          })
          response.on('end', () => {
            resolve({
              statusCode: response.statusCode ?? 0,
              body: chunks.join(''),
            })
          })
        })
        req.on('error', reject)
        req.end(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }))
      })
      expect(forbiddenOrigin.statusCode).toBe(403)
      expect(forbiddenOrigin.body).toContain('Forbidden')
    } finally {
      if (originalSettings) {
        await contentPage.evaluate(async (settings: { enabled: boolean; port: number }) => {
          await window.electronAPI?.mcpManager.updateSettings(settings)
        }, originalSettings)
      }
    }
  })

  test('端口占用时 MCP 保持固定端口并返回 PORT_IN_USE', async ({ contentPage }) => {
    let originalSettings: { enabled: boolean; port: number } | null = null
    const occupiedServer = createServer((_request, response) => {
      response.writeHead(200)
      response.end('occupied')
    })
    await new Promise<void>((resolve, reject) => {
      occupiedServer.once('error', reject)
      occupiedServer.listen(0, '127.0.0.1', () => {
        occupiedServer.off('error', reject)
        resolve()
      })
    })
    const address = occupiedServer.address() as AddressInfo
    try {
      originalSettings = await contentPage.evaluate(async () => {
        const status = await window.electronAPI?.mcpManager.getStatus()
        if (!status) {
          throw new Error('MCP bridge missing')
        }
        return {
          enabled: status.enabled,
          port: status.port,
        }
      })
      const failedStatus = await contentPage.evaluate(async (settings: { enabled: boolean; port: number }) => {
        const status = await window.electronAPI?.mcpManager.updateSettings(settings)
        if (!status) {
          throw new Error('MCP bridge missing')
        }
        return status
      }, { enabled: true, port: address.port })
      expect(failedStatus.port).toBe(address.port)
      expect(failedStatus.endpoint).toBe(`http://127.0.0.1:${address.port}/mcp`)
      expect(failedStatus.serverState).toBe('error')
      expect(failedStatus.errorCode).toBe('PORT_IN_USE')
    } finally {
      await new Promise<void>((resolve) => {
        occupiedServer.close(() => resolve())
      })
      if (originalSettings) {
        await contentPage.evaluate(async (settings: { enabled: boolean; port: number }) => {
          await window.electronAPI?.mcpManager.updateSettings(settings)
        }, originalSettings)
      }
    }
  })
})
