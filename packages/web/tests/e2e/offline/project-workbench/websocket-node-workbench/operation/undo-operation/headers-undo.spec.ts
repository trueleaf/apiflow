import { test, expect } from '../../../../../../fixtures/electron.fixture'

test.describe('WebSocketHeadersUndo', () => {
  // 添加Header后点击撤销恢复
  test('添加Header后点击撤销恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache()
    await createProject()
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 })
    await contentPage.waitForTimeout(500)

    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: '请求头-撤销按钮' })

    // 点击节点，确保 currentSelectNav 已同步（影响撤销/重做记录）
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first()
    await expect(createdNode).toBeVisible({ timeout: 5000 })
    await createdNode.click()
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 })

    // 切换到请求头标签页
    const headersTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /请求头/ })
    await headersTab.click()
    await contentPage.waitForTimeout(300)

    // 在自定义Headers树中添加一条Header
    const headersPanel = contentPage.locator('.ws-headers')
    await expect(headersPanel).toBeVisible({ timeout: 5000 })
    const customHeadersTree = headersPanel.locator('.cl-params-tree').last()
    const firstRow = customHeadersTree.locator('[data-testid="params-tree-row"]').first()
    await expect(firstRow).toBeVisible({ timeout: 5000 })

    const headerKeyInput = firstRow.getByPlaceholder(/参数名称/).first()
    await expect(headerKeyInput).toBeVisible({ timeout: 5000 })
    await headerKeyInput.click()
    await headerKeyInput.fill('X-Custom-Header')
    await contentPage.waitForTimeout(200)

    // 点击空白区域让key输入失焦，确保撤销记录被正确保存
    await headersTab.click()
    await contentPage.waitForTimeout(200)

    // 验证key已正确输入
    await expect(headerKeyInput).toHaveValue('X-Custom-Header', { timeout: 5000 })

    const valueInputWrap = firstRow.locator('[data-testid="params-tree-value-input"]').first()
    const valueEditor = valueInputWrap.locator('[contenteditable], textarea, input').first()
    await expect(valueEditor).toBeVisible({ timeout: 5000 })
    await valueEditor.click()
    await valueEditor.fill('custom-value')
    await contentPage.waitForTimeout(300)

    // 验证value已正确输入
    await expect(valueInputWrap).toContainText('custom-value', { timeout: 5000 })

    const headerRow = customHeadersTree.locator('[data-testid="params-tree-row"][data-row-key="X-Custom-Header"]').first()
    await expect(headerRow).toBeVisible({ timeout: 5000 })

    // 点击空白区域让输入框失焦，避免撤销仅影响输入内容
    await headersTab.click()
    await contentPage.waitForTimeout(200)

    // 第一次撤销：撤销value的输入
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]')
    await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 })
    await undoBtn.click()
    await contentPage.waitForTimeout(300)

    // 验证value已被撤销
    await expect(valueInputWrap).not.toContainText('custom-value', { timeout: 5000 })

    // 继续撤销直到header行隐藏（key被清空）
    // 可能需要多次撤销，取决于输入过程中产生的撤销点数量
    const maxUndoAttempts = 10
    for (let i = 0; i < maxUndoAttempts; i++) {
      const isDisabled = await undoBtn.evaluate(el => el.classList.contains('disabled'))
      if (isDisabled) break
      
      await undoBtn.click()
      await contentPage.waitForTimeout(200)
      
      const isHidden = await headerRow.isHidden().catch(() => true)
      if (isHidden) break
    }
    
    await expect(headerRow).toBeHidden({ timeout: 5000 })
  })

  // 使用Ctrl+Z撤销Header编辑
  test('使用Ctrl+Z撤销Header编辑', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache()
    await createProject()
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 })
    await contentPage.waitForTimeout(500)

    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: '请求头-快捷键撤销' })

    // 点击节点，确保 currentSelectNav 已同步（影响撤销/重做记录）
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first()
    await expect(createdNode).toBeVisible({ timeout: 5000 })
    await createdNode.click()
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 })

    // 切换到请求头标签页
    const headersTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /请求头/ })
    await headersTab.click()
    await contentPage.waitForTimeout(300)

    // 在自定义Headers树中添加一条Header key
    const headersPanel = contentPage.locator('.ws-headers')
    await expect(headersPanel).toBeVisible({ timeout: 5000 })
    const customHeadersTree = headersPanel.locator('.cl-params-tree').last()
    const firstRow = customHeadersTree.locator('[data-testid="params-tree-row"]').first()
    await expect(firstRow).toBeVisible({ timeout: 5000 })

    const headerKeyInput = firstRow.getByPlaceholder(/参数名称/).first()
    await expect(headerKeyInput).toBeVisible({ timeout: 5000 })
    await headerKeyInput.click()
    await headerKeyInput.fill('Authorization')
    await contentPage.waitForTimeout(300)

    const headerRow = customHeadersTree.locator('[data-testid="params-tree-row"][data-row-key="Authorization"]').first()
    await expect(headerRow).toBeVisible({ timeout: 5000 })

    // 点击空白区域让输入框失焦，避免快捷键仅撤销输入内容
    await headersTab.click()
    await contentPage.waitForTimeout(200)

    // Ctrl+Z撤销后应清空该Header
    await contentPage.keyboard.press('Control+z')
    await contentPage.waitForTimeout(300)
    await expect(headerRow).toBeHidden({ timeout: 5000 })
  })

  // 修改Header值后撤销恢复
  test('修改Header值后撤销恢复', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache()
    await createProject()
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 })
    await contentPage.waitForTimeout(500)

    const nodeId = await createNode(contentPage, { nodeType: 'websocket', name: '请求头-值撤销' })

    // 点击节点，确保 currentSelectNav 已同步（影响撤销/重做记录）
    const createdNode = contentPage.locator(`[data-test-node-id="${nodeId}"]`).first()
    await expect(createdNode).toBeVisible({ timeout: 5000 })
    await createdNode.click()
    await expect(contentPage.locator('.ws-operation')).toBeVisible({ timeout: 5000 })

    // 切换到请求头标签页
    const headersTab = contentPage.locator('.ws-params .el-tabs__item').filter({ hasText: /请求头/ })
    await headersTab.click()
    await contentPage.waitForTimeout(300)

    // 先添加一个Header：Content-Type=application/json
    const headersPanel = contentPage.locator('.ws-headers')
    await expect(headersPanel).toBeVisible({ timeout: 5000 })
    const customHeadersTree = headersPanel.locator('.cl-params-tree').last()
    const firstRow = customHeadersTree.locator('[data-testid="params-tree-row"]').first()
    await expect(firstRow).toBeVisible({ timeout: 5000 })

    const headerKeyInput = firstRow.getByPlaceholder(/参数名称/).first()
    await expect(headerKeyInput).toBeVisible({ timeout: 5000 })
    await headerKeyInput.click()
    await headerKeyInput.fill('Content-Type')
    await contentPage.waitForTimeout(200)

    const valueInputWrap = firstRow.locator('[data-testid="params-tree-value-input"]').first()
    const valueEditor = valueInputWrap.locator('[contenteditable], textarea, input').first()
    await expect(valueEditor).toBeVisible({ timeout: 5000 })
    await valueEditor.click()
    await valueEditor.fill('application/json')
    await contentPage.waitForTimeout(300)
    await expect(valueInputWrap).toContainText('application/json', { timeout: 5000 })

    // 点击空白区域让输入框失焦
    await headersTab.click()
    await contentPage.waitForTimeout(200)

    // 修改Header值为 text/plain
    const headerRow = customHeadersTree.locator('[data-testid="params-tree-row"][data-row-key="Content-Type"]').first()
    await expect(headerRow).toBeVisible({ timeout: 5000 })
    const contentTypeValueInputWrap = headerRow.locator('[data-testid="params-tree-value-input"]').first()
    const contentTypeValueEditor = contentTypeValueInputWrap.locator('[contenteditable], textarea, input').first()
    await expect(contentTypeValueEditor).toBeVisible({ timeout: 5000 })
    await contentTypeValueEditor.click()
    await contentTypeValueEditor.fill('text/plain')
    await contentPage.waitForTimeout(300)
    await expect(contentTypeValueInputWrap).toContainText('text/plain', { timeout: 5000 })

    // 点击空白区域让输入框失焦，避免撤销仅影响输入内容
    await headersTab.click()
    await contentPage.waitForTimeout(200)

    // 撤销后应恢复为 application/json
    const undoBtn = contentPage.locator('[data-testid="ws-params-undo-btn"]')
    await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 })
    await undoBtn.click()
    await contentPage.waitForTimeout(300)
    await expect(contentTypeValueInputWrap).toContainText('application/json', { timeout: 5000 })
  })
})
