import { test, expect } from '../../../../fixtures/desktop.fixture'
import fs from 'node:fs/promises'
import path from 'node:path'

test.describe('McpSourceContract', () => {
  test('原生 MCP 服务拒绝缺失认证与外部来源，合法请求可读取工具', async ({ contentPage }) => {
    const status = await contentPage.evaluate(() => window.desktopAPI!.mcpManager.updateSettings({ enabled: true, port: 43201 }));
    const unauthorized = await fetch(status.endpoint, { method: 'POST' });
    expect(unauthorized.status).toBe(401);
    const forbidden = await fetch(status.endpoint, { method: 'POST', headers: { Authorization: 'Bearer ' + status.authToken, Origin: 'https://example.com' } });
    expect(forbidden.status).toBe(403);
    const valid = await fetch(status.endpoint, { method: 'POST', headers: { Authorization: 'Bearer ' + status.authToken, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }) });
    expect(valid.status).toBe(200);
    const body = await valid.json();
    expect(body.result.tools.map((tool: { name: string }) => tool.name)).toContain('getProjectList');
  })
  test('后台执行页独立常驻，主页面刷新后 MCP 仍可用', async ({ contentPage, desktopApp }) => {
    const before = await contentPage.evaluate(() => window.desktopAPI!.mcpManager.getStatus());
    expect(before.executorState).toBe('ready');
    const executor = desktopApp.contexts().flatMap(context => context.pages()).find(page => page.url().includes('mcp.html'));
    expect(executor).toBeDefined();
    await contentPage.reload();
    await contentPage.waitForFunction(() => !!window.desktopAPI);
    const after = await contentPage.evaluate(() => window.desktopAPI!.mcpManager.getStatus());
    expect(after.executorState).toBe('ready');
    expect(executor?.isClosed()).toBe(false);
  })

  test('MCP tool registry 只暴露核心离线工具并要求显式 projectId', async () => {
    const registrySource = await fs.readFile(path.resolve('src/renderer/mcp/toolRegistry.ts'), 'utf8')
    expect(registrySource).toContain("'getProjectList'")
    expect(registrySource).toContain("'createProject'")
    expect(registrySource).toContain("'createHttpNode'")
    expect(registrySource).toContain("'createWebsocketNode'")
    expect(registrySource).toContain("'createHttpMockNode'")
    expect(registrySource).toContain("'createWebsocketMockNode'")
    expect(registrySource).toContain("'getVariables'")
    expect(registrySource).toContain("'createGlobalCommonHeader'")
    expect(registrySource).toContain("'createFolder'")
    expect(registrySource).toContain("'moveNode'")
    expect(registrySource).toContain("'restoreNode'")
    expect(registrySource).toContain("runtimeStore.networkMode = 'offline'")
    expect(registrySource).toContain("...(needsProject ? ['projectId'] : [])")
    expect(registrySource).toContain('prepareProjectContext(projectId)')
    expect(registrySource).toContain('TOOL_NOT_FOUND')
    expect(registrySource).toContain('INVALID_PARAMS')
    expect(registrySource).not.toContain("'navigateToProject'")
    expect(registrySource).not.toContain("'sendRequest'")
    expect(registrySource).not.toContain("'connectWebsocket'")
    expect(registrySource).not.toContain("'startHttpMockServer'")
    expect(registrySource).not.toContain('localStorage.setItem')
  })

  test('MCP resources 只读取 apiflow URI 且拒绝路径穿透', async () => {
    const resourceSource = await fs.readFile(path.resolve('src/renderer/mcp/resourceRegistry.ts'), 'utf8')
    expect(resourceSource).toContain("uri.startsWith('apiflow://')")
    expect(resourceSource).toContain("part === '..'")
    expect(resourceSource).toContain("part.includes('\\\\')")
    expect(resourceSource).toContain("part.includes('/')")
    expect(resourceSource).toContain("parsed.host === 'projects'")
    expect(resourceSource).toContain("parsed.host === 'nodes'")
    expect(resourceSource).toContain('projectCache.getProjectList()')
    expect(resourceSource).toContain('apiNodesCache.getApiNodesAsTree(projectId)')
    expect(resourceSource).toContain('nodeVariableCache.getVariableByProjectId(projectId)')
    expect(resourceSource).toContain('commonHeaderCache.getCommonHeaders()')
    expect(resourceSource).toContain('apiNodesCache.getNodeById(parts[0])')
    expect(resourceSource).toContain('INVALID_RESOURCE_URI')
    expect(resourceSource).toContain('RESOURCE_NOT_FOUND')
    expect(resourceSource).not.toContain('readFile')
  })

  test('设置页、preload 和构建入口暴露 MCP 管理入口', async () => {
    const settingsSource = await fs.readFile(path.resolve('src/renderer/pages/settings/Settings.vue'), 'utf8')
    const mcpSettingsSource = await fs.readFile(path.resolve('src/renderer/pages/settings/mcpSettings/McpSettings.vue'), 'utf8')
    const preloadSource = await fs.readFile(path.resolve('src/renderer/platform/tauri/api.ts'), 'utf8')
    const typeSource = await fs.readFile(path.resolve('src/types/main/index.ts'), 'utf8')
    const viteSource = await fs.readFile(path.resolve('vite.config.ts'), 'utf8')
    expect(settingsSource).toContain("action: 'mcp-settings'")
    expect(settingsSource).toContain('Cable')
    expect(mcpSettingsSource).toContain('window.desktopAPI?.mcpManager.getStatus()')
    expect(mcpSettingsSource).toContain('window.desktopAPI?.mcpManager.updateSettings')
    expect(mcpSettingsSource).toContain('window.desktopAPI?.mcpManager.restart()')
    expect(mcpSettingsSource).toContain("t('MCP 服务')")
    expect(mcpSettingsSource).not.toContain('$t(')
    expect(preloadSource).toContain('mcpManager')
    expect(typeSource).toContain('mcpManager: {')
    expect(viteSource).toContain("mcp: resolve(import.meta.dirname, './mcp.html')")
  })
})
