import { test, expect } from '../../../../fixtures/electron.fixture'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

test('Web 构建隐藏 AI 入口且不会发起模型请求', async ({ electronApp }) => {
  test.setTimeout(60000)
  const unexpectedRequests: string[] = []
  const root = path.resolve(process.env.APIFLOW_WEB_TEST_DIST || 'dist/web-test')
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url || '/', 'http://localhost').pathname
    const filePath = path.resolve(root, `.${pathname === '/' ? '/index.html' : decodeURIComponent(pathname)}`)
    if (!filePath.startsWith(`${root}${path.sep}`)) { response.writeHead(403); response.end(); return }
    try {
      const mime: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }
      response.writeHead(200, { 'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream' })
      response.end(await readFile(filePath))
    } catch {
      unexpectedRequests.push(pathname)
      response.writeHead(404)
      response.end()
    }
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('静态服务地址异常')
  await electronApp.evaluate(({ BrowserWindow }) => {
    const window = new BrowserWindow({ show: false, width: 1440, height: 960, webPreferences: { sandbox: true, contextIsolation: true } })
    void window.loadURL('about:blank#ai-web-boundary')
  })
  await expect.poll(async () => (await electronApp.windows()).some(window => window.url().includes('#ai-web-boundary'))).toBe(true)
  const page = (await electronApp.windows()).find(window => window.url().includes('#ai-web-boundary'))
  if (!page) throw new Error('Web boundary window was not created')
  const modelRequests: string[] = []
  page.on('request', request => { if (/chat\/completions|api\.deepseek\.com|ai\.test/.test(request.url())) modelRequests.push(new URL(request.url()).pathname) })
  try {
    await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 Chrome/128.0.0.0 Safari/537.36' })
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', { get: () => 'Mozilla/5.0 Chrome/128.0.0.0 Safari/537.36' })
      localStorage.setItem('runtime/networkMode', 'offline')
      localStorage.setItem('runtime/language', 'zh-cn')
      localStorage.setItem('runtime/hasCreatedExampleProject', 'true')
      localStorage.setItem('apiflow/ai/llmProvider', JSON.stringify({ apiKey: 'must-not-be-read' }))
      const original = Storage.prototype.getItem
      Storage.prototype.getItem = function(key: string) {
        if (key === 'apiflow/ai/llmProvider' || key === 'apiflow/ai/config') document.documentElement.dataset.aiKeyRead = 'true'
        return original.call(this, key)
      }
    })
    await page.goto(`http://127.0.0.1:${address.port}`)
    await expect(page.getByTestId('header-ai-btn')).toHaveCount(0)
    await page.getByTestId('header-settings-btn').click()
    await expect(page.getByTestId('settings-menu-ai-settings')).toHaveCount(0)
    expect(unexpectedRequests).toEqual([])
    expect(modelRequests).toEqual([])
    expect(await page.evaluate(() => document.documentElement.dataset.aiKeyRead)).toBeUndefined()
  } finally {
    await page.close()
    server.closeAllConnections()
    await new Promise<void>(resolve => server.close(() => resolve()))
  }
})
