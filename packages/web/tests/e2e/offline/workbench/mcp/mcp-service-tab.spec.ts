import { test, expect } from '../../../../fixtures/desktop.fixture'

test.describe('McpServiceTab', () => {
  test('非项目页点击顶部 MCP 服务进入设置页 MCP 配置', async ({ topBarPage, contentPage, clearCache }) => {
    await clearCache()
    await topBarPage.locator('[data-testid="header-home-btn"]').click()
    await expect(contentPage).toHaveURL(/.*#\/home/, { timeout: 10000 })
    const mcpButton = topBarPage.locator('[data-testid="header-mcp-service-btn"]')
    await expect(mcpButton).toBeVisible({ timeout: 5000 })
    await mcpButton.click()
    await expect(contentPage).toHaveURL(/.*#\/settings/, { timeout: 10000 })
    const mcpMenu = contentPage.locator('[data-testid="settings-menu-mcp-settings"]')
    await expect(mcpMenu).toHaveClass(/active/, { timeout: 5000 })
    await expect(contentPage.locator('[data-testid="settings-mcp-panel"]')).toBeVisible()
    await mcpButton.click()
    await expect(topBarPage.locator('[data-test-id^="header-tab-item-settings-"]')).toHaveCount(1)
    await expect(mcpMenu).toHaveClass(/active/)
  })

  test('项目工作台可以从顶部打开唯一的 MCP 服务页', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache()
    await createProject(`MCP服务页-${Date.now()}`)
    const mcpButton = topBarPage.locator('[data-testid="header-mcp-service-btn"]')
    await expect(mcpButton).toBeVisible({ timeout: 5000 })
    await mcpButton.click()
    const mcpPanel = contentPage.locator('[data-testid="project-mcp-service-panel"]')
    await expect(mcpPanel).toBeVisible({ timeout: 5000 })
    await expect(contentPage.locator('[data-testid="project-nav-tab-mcp-service"]')).toBeVisible()
    await expect(mcpPanel.locator('[data-testid="mcp-endpoint"]')).toContainText(/http:\/\/127\.0\.0\.1:\d+\/mcp/)
    await mcpButton.click()
    await expect(contentPage.locator('[data-testid="project-nav-tab-mcp-service"]')).toHaveCount(1)
  })
})
