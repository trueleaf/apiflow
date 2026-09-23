import { test, expect } from '../../../../../../fixtures/desktop.fixture'

test.describe('HttpMockResponseContentTypePriority-Offline', () => {
  test('手动设置的返回头 Content-Type 优先于 json 数据结构默认类型', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache()
    await createProject()
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 })

    const bannerTree = contentPage.getByTestId('banner-doc-tree')
    await expect(bannerTree).toBeVisible({ timeout: 5000 })

    const mockNodeName = `离线-HTTPMock返回头优先级-${Date.now()}`
    await createNode(contentPage, { nodeType: 'httpMock', name: mockNodeName })
    const mockNode = bannerTree.locator('.el-tree-node__content', { hasText: mockNodeName }).first()
    await expect(mockNode).toBeVisible({ timeout: 5000 })
    await mockNode.click()

    const mockConfig = contentPage.locator('.mock-config-content')
    await expect(mockConfig).toBeVisible({ timeout: 5000 })

    const portInput = mockConfig.locator('.condition-content .port-input input').first()
    await portInput.click()
    await contentPage.keyboard.press('Control+a')
    await contentPage.keyboard.type('19195')

    const urlInput = mockConfig.locator('.condition-content .url-input input').first()
    await urlInput.fill('/mock/http-response-content-type-priority')

    const addResponseHeadersButton = mockConfig.locator('.response-content .condition .condition-btn').filter({ hasText: /添加返回头/ }).first()
    await addResponseHeadersButton.click()

    const responseHeadersSection = mockConfig.locator('.response-headers-section').first()
    await expect(responseHeadersSection).toBeVisible({ timeout: 5000 })

    const customHeadersTree = responseHeadersSection.locator('.cl-params-tree').first()
    const firstRow = customHeadersTree.locator('[data-testid="params-tree-row"]').first()
    await expect(firstRow).toBeVisible({ timeout: 5000 })

    const headerKeyInput = firstRow.getByPlaceholder(/参数名称/).first()
    await headerKeyInput.click()
    await headerKeyInput.fill('content-type')
    await contentPage.waitForTimeout(200)

    const valueInputWrap = firstRow.locator('[data-testid="params-tree-value-input"]').first()
    const valueEditor = valueInputWrap.locator('[contenteditable], textarea, input').first()
    await expect(valueEditor).toBeVisible({ timeout: 5000 })
    await valueEditor.click()
    await valueEditor.fill('text/plain')
    await contentPage.waitForTimeout(300)

    await mockConfig.locator('.response-content .main-title').first().click()
    await mockConfig.getByRole('button', { name: /保存配置/ }).click()
    await contentPage.waitForTimeout(500)

    const enableRow = mockConfig.locator('.form-item').filter({ hasText: /启用Mock API/ }).first()
    await enableRow.locator('.el-switch').first().click()
    await expect(mockNode.locator('.mock-status .status-dot.running')).toBeVisible({ timeout: 30000 })

    const response = await contentPage.request.get('http://127.0.0.1:19195/mock/http-response-content-type-priority')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type'] || '').toContain('text/plain')
    await expect(response.text()).resolves.toBe('{}')
  })
})
