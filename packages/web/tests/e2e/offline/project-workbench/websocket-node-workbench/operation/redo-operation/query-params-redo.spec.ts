import { test, expect } from '../../../../../../fixtures/electron.fixture'

test.describe('WebSocketQueryParamsRedo', () => {
  // 撤销Query参数后点击重做恢复
  test('撤销Query参数后点击重做恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
    test.setTimeout(60000)
    await clearCache()
    await createProject()
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 })
    await contentPage.waitForTimeout(500)

    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'Query参数-重做按钮' })

    // 点击节点，确保 currentSelectNav 已同步（影响撤销/重做记录）
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first()
    await expect(createdNode).toBeVisible({ timeout: 5000 })
    await createdNode.click()
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 })

    // 输入连接地址，用于通过状态栏验证Query拼接
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first()
    await urlEditor.fill('ws://127.0.0.1:8080/ws')
    await contentPage.keyboard.press('Enter')
    await contentPage.waitForTimeout(300)

    // 切换到Params标签页
    const paramsTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /Params/ })
    await paramsTab.click()
    await contentPage.waitForTimeout(300)

    // 添加Query参数
    const queryParamsPanel = contentPage.locator('.ws-query-params')
    await expect(queryParamsPanel).toBeVisible({ timeout: 5000 })
    const firstRow = queryParamsPanel.locator('[data-testid="params-tree-row"]').first()
    await expect(firstRow).toBeVisible({ timeout: 5000 })

    // 确保该行已勾选，否则不会拼接到URL上
    const rowCheckbox = firstRow.locator('.el-checkbox').first()
    const checkboxClass = (await rowCheckbox.getAttribute('class')) || ''
    if (!checkboxClass.includes('is-checked')) {
      await rowCheckbox.click()
      await contentPage.waitForTimeout(200)
    }

    const queryKeyInput = firstRow.getByPlaceholder(/参数名称/).first()
    await expect(queryKeyInput).toBeVisible({ timeout: 5000 })
    await queryKeyInput.click()
    await queryKeyInput.fill('redoKey')
    await contentPage.waitForTimeout(200)

    const valueInputWrap = firstRow.locator('[data-testid="params-tree-value-input"]').first()
    const valueEditor = valueInputWrap.locator('[contenteditable], textarea, input').first()
    await expect(valueEditor).toBeVisible({ timeout: 5000 })
    await valueEditor.click()
    await contentPage.keyboard.type('redoValue')
    await contentPage.waitForTimeout(300)

    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url')
    await expect(statusUrl).toContainText('redoKey=redoValue', { timeout: 5000 })

    // 点击空白区域让输入框失焦，避免撤销/重做仅影响输入内容
    await paramsTab.click()
    await contentPage.waitForTimeout(200)

    // 撤销后应移除Query参数拼接
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]')
    await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 })
    await undoBtn.click()
    await expect(statusUrl).not.toContainText('redoKey=redoValue', { timeout: 5000 })

    // 重做后应恢复Query参数拼接
    const redoBtn = contentPage.locator('[data-testid="ws-params-redo-btn"]')
    await expect(redoBtn).not.toHaveClass(/disabled/, { timeout: 5000 })
    await redoBtn.click()
    await expect(statusUrl).toContainText('redoKey=redoValue', { timeout: 5000 })
  })

  // 使用快捷键重做Query参数
  test('使用快捷键重做Query参数', async ({ contentPage, clearCache, createProject, createNode }) => {
    test.setTimeout(60000)
    await clearCache()
    await createProject()
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 })
    await contentPage.waitForTimeout(500)

    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'Query参数-快捷键重做' })

    // 点击节点，确保 currentSelectNav 已同步（影响撤销/重做记录）
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first()
    await expect(createdNode).toBeVisible({ timeout: 5000 })
    await createdNode.click()
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 })

    // 输入连接地址，用于通过状态栏验证Query拼接
    const urlEditor = contentPage.locator('.ws-operation .url-rich-input [contenteditable]').first()
    await urlEditor.fill('ws://127.0.0.1:8080/ws')
    await contentPage.keyboard.press('Enter')
    await contentPage.waitForTimeout(300)

    // 切换到Params标签页
    const paramsTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /Params/ })
    await paramsTab.click()
    await contentPage.waitForTimeout(300)

    // 添加Query参数
    const queryParamsPanel = contentPage.locator('.ws-query-params')
    await expect(queryParamsPanel).toBeVisible({ timeout: 5000 })
    const firstRow = queryParamsPanel.locator('[data-testid="params-tree-row"]').first()
    await expect(firstRow).toBeVisible({ timeout: 5000 })

    // 确保该行已勾选，否则不会拼接到URL上
    const rowCheckbox = firstRow.locator('.el-checkbox').first()
    const checkboxClass = (await rowCheckbox.getAttribute('class')) || ''
    if (!checkboxClass.includes('is-checked')) {
      await rowCheckbox.click()
      await contentPage.waitForTimeout(200)
    }

    const queryKeyInput = firstRow.getByPlaceholder(/参数名称/).first()
    await expect(queryKeyInput).toBeVisible({ timeout: 5000 })
    await queryKeyInput.click()
    await queryKeyInput.fill('shortcutKey')
    await contentPage.waitForTimeout(200)

    const valueInputWrap = firstRow.locator('[data-testid="params-tree-value-input"]').first()
    const valueEditor = valueInputWrap.locator('[contenteditable], textarea, input').first()
    await expect(valueEditor).toBeVisible({ timeout: 5000 })
    await valueEditor.click()
    await contentPage.keyboard.type('shortcutValue')
    await contentPage.waitForTimeout(300)

    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url')
    await expect(statusUrl).toContainText('shortcutKey=shortcutValue', { timeout: 5000 })

    // 点击空白区域让输入框失焦，避免快捷键仅影响输入内容
    await contentPage.locator('.ws-operation .status-wrap').click()
    await contentPage.waitForTimeout(200)
    await expect(valueEditor).not.toBeFocused({ timeout: 5000 })

    // Ctrl+Z撤销后应移除Query参数拼接，再Ctrl+Y重做恢复
    await contentPage.keyboard.press('Control+z')
    await expect(contentPage.locator('[data-testid="ws-params-redo-btn"]')).not.toHaveClass(/disabled/, { timeout: 5000 })
    await expect(statusUrl).not.toContainText('shortcutKey=shortcutValue', { timeout: 5000 })
    await contentPage.keyboard.press('Control+y')
    await expect(statusUrl).toContainText('shortcutKey=shortcutValue', { timeout: 5000 })
  })
})
