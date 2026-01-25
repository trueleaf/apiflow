import { test, expect } from '../../../../../../fixtures/electron.fixture'

test.describe('WebSocketQueryParamsUndo', () => {
  // 添加Query参数后点击撤销恢复
  test('添加Query参数后点击撤销恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache()
    await createProject()
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 })
    await contentPage.waitForTimeout(500)

    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'Query参数-撤销按钮' })

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
    await queryKeyInput.fill('testKey')
    await contentPage.waitForTimeout(200)

    const valueInputWrap = firstRow.locator('[data-testid="params-tree-value-input"]').first()
    const valueEditor = valueInputWrap.locator('[contenteditable], textarea, input').first()
    await expect(valueEditor).toBeVisible({ timeout: 5000 })
    await valueEditor.click()
    await contentPage.keyboard.type('testValue')
    await contentPage.waitForTimeout(300)

    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url')
    await expect(statusUrl).toContainText('testKey=testValue', { timeout: 5000 })

    // 点击空白区域让输入框失焦，避免撤销仅影响输入内容
    await paramsTab.click()
    await contentPage.waitForTimeout(200)

    // 撤销后应移除Query参数拼接
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]')
    await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 })
    await undoBtn.click()
    await contentPage.waitForTimeout(300)
    await expect(statusUrl).not.toContainText('testKey=testValue', { timeout: 5000 })
  })

  // 使用Ctrl+Z撤销Query参数编辑
  test('使用Ctrl+Z撤销Query参数编辑', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache()
    await createProject()
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 })
    await contentPage.waitForTimeout(500)

    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'Query参数-快捷键撤销' })

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
    await queryKeyInput.fill('paramKey')
    await contentPage.waitForTimeout(200)

    const valueInputWrap = firstRow.locator('[data-testid="params-tree-value-input"]').first()
    const valueEditor = valueInputWrap.locator('[contenteditable], textarea, input').first()
    await expect(valueEditor).toBeVisible({ timeout: 5000 })
    await valueEditor.click()
    await contentPage.keyboard.type('paramValue')
    await contentPage.waitForTimeout(300)

    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url')
    await expect(statusUrl).toContainText('paramKey=paramValue', { timeout: 5000 })

    // 点击空白区域让输入框失焦，避免撤销仅影响输入内容
    await paramsTab.click()
    await contentPage.waitForTimeout(200)

    // Ctrl+Z撤销后应移除Query参数拼接
    await contentPage.keyboard.press('Control+z')
    await contentPage.waitForTimeout(300)
    await expect(statusUrl).not.toContainText('paramKey=paramValue', { timeout: 5000 })
  })

  // 删除Query参数后撤销恢复
  test('删除Query参数后撤销恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache()
    await createProject()
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 })
    await contentPage.waitForTimeout(500)

    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: 'Query参数-删除撤销' })

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
    await queryKeyInput.fill('deleteKey')
    await contentPage.waitForTimeout(200)

    const valueInputWrap = firstRow.locator('[data-testid="params-tree-value-input"]').first()
    const valueEditor = valueInputWrap.locator('[contenteditable], textarea, input').first()
    await expect(valueEditor).toBeVisible({ timeout: 5000 })
    await valueEditor.click()
    await contentPage.keyboard.type('deleteValue')
    await contentPage.waitForTimeout(300)

    const statusUrl = contentPage.locator('.ws-operation .status-wrap .url')
    await expect(statusUrl).toContainText('deleteKey=deleteValue', { timeout: 5000 })

    // 删除该行
    const deleteRow = queryParamsPanel.locator('[data-testid="params-tree-row"][data-row-key="deleteKey"]').first()
    await expect(deleteRow).toBeVisible({ timeout: 5000 })
    const deleteBtn = deleteRow.locator('[data-testid="params-tree-delete-btn"]').first()
    await deleteBtn.click()
    await contentPage.waitForTimeout(300)
    await expect(statusUrl).not.toContainText('deleteKey=deleteValue', { timeout: 5000 })

    // 点击空白区域让输入框失焦，避免撤销仅影响输入内容
    await paramsTab.click()
    await contentPage.waitForTimeout(200)

    // 撤销删除后应恢复Query参数拼接
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]')
    await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 })
    await undoBtn.click()
    await contentPage.waitForTimeout(300)
    await expect(statusUrl).toContainText('deleteKey=deleteValue', { timeout: 5000 })
  })
})
