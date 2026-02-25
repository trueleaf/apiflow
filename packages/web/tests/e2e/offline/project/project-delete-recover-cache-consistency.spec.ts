import { test, expect } from '../../../fixtures/electron.fixture'

test.describe('ProjectDeleteRecoverCacheConsistency', () => {
  // 删除项目后再恢复，校验 docNum 与节点缓存一致性（无重复、删除态正确）
  test('离线项目删除恢复后 docNum 与节点缓存保持一致', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    test.setTimeout(70000)
    await clearCache()
    const projectName = await createProject(`离线删除恢复一致性-${Date.now()}`)
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 })
    // 创建 3 个节点，其中 folder 不计入 docNum
    await createNode(contentPage, { nodeType: 'folder', name: `Folder-${Date.now()}` })
    await createNode(contentPage, { nodeType: 'http', name: `HTTP-${Date.now()}` })
    await createNode(contentPage, { nodeType: 'websocket', name: `WS-${Date.now()}` })
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]')
    await homeBtn.click()
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 })
    const projectCard = contentPage.locator('[data-testid^="home-project-card-"]').filter({ hasText: projectName }).first()
    await expect(projectCard).toBeVisible({ timeout: 5000 })
    await expect(projectCard.locator('.project-api-count .teal')).toContainText('2')
    // 删除项目并关闭撤回通知，进入“已删除项目”常规路径
    await projectCard.locator('[data-testid="home-project-delete-btn"]').click()
    const confirmDialog = contentPage.locator('.cl-confirm-container')
    await expect(confirmDialog).toBeVisible({ timeout: 5000 })
    await confirmDialog.locator('.el-button--primary').click()
    await expect(confirmDialog).toBeHidden({ timeout: 5000 })
    const undoNotification = contentPage.locator('.undo-notification')
    await expect(undoNotification).toBeVisible({ timeout: 5000 })
    await undoNotification.locator('.btn-close').click()
    await expect(undoNotification).toBeHidden({ timeout: 5000 })
    // 从设置页项目回收站恢复项目
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]')
    await settingsBtn.click()
    await contentPage.waitForURL(/.*?#?\/settings/, { timeout: 10000 })
    const recoveryMenu = contentPage.locator('[data-testid="settings-menu-project-recovery"]')
    await recoveryMenu.click()
    await expect(recoveryMenu).toHaveClass(/active/, { timeout: 5000 })
    const recoveryPage = contentPage.locator('.project-recovery')
    await expect(recoveryPage).toBeVisible({ timeout: 5000 })
    const deletedProjectCard = recoveryPage.locator('.project-card').filter({ hasText: projectName }).first()
    await expect(deletedProjectCard).toBeVisible({ timeout: 5000 })
    await deletedProjectCard.locator('.el-button').filter({ hasText: /恢复/ }).click()
    await expect(deletedProjectCard).toBeHidden({ timeout: 5000 })
    // 恢复后校验首页 docNum 与缓存中的节点状态一致
    await homeBtn.click()
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 })
    const restoredProjectCard = contentPage.locator('[data-testid^="home-project-card-"]').filter({ hasText: projectName }).first()
    await expect(restoredProjectCard).toBeVisible({ timeout: 5000 })
    await expect(restoredProjectCard.locator('.project-api-count .teal')).toContainText('2')
    const cacheConsistency = await contentPage.evaluate(async ({ name }) => {
      const projectDb = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('projectCache')
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      const projects = await new Promise<Array<Record<string, unknown>>>((resolve, reject) => {
        const tx = projectDb.transaction('projects', 'readonly')
        const store = tx.objectStore('projects')
        const request = store.getAll()
        request.onsuccess = () => resolve((request.result || []) as Array<Record<string, unknown>>)
        request.onerror = () => reject(request.error)
      })
      projectDb.close()
      const targetProject = projects.find((item) => item && item['projectName'] === name)
      const projectId = targetProject ? String(targetProject['_id'] || '') : ''
      if (!projectId) {
        throw new Error('未找到目标项目ID')
      }
      const nodesDb = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('apiNodesCache')
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      const nodes = await new Promise<Array<Record<string, unknown>>>((resolve, reject) => {
        const tx = nodesDb.transaction('httpNodeList', 'readonly')
        const store = tx.objectStore('httpNodeList')
        const request = store.getAll()
        request.onsuccess = () => resolve((request.result || []) as Array<Record<string, unknown>>)
        request.onerror = () => reject(request.error)
      })
      nodesDb.close()
      const projectNodes = nodes.filter((item) => item && item['projectId'] === projectId)
      const deletedCount = projectNodes.filter((item) => Boolean(item['isDeleted'])).length
      const nodeIds = projectNodes.map((item) => String(item['_id'] || ''))
      const uniqueIdCount = new Set(nodeIds).size
      return {
        totalCount: projectNodes.length,
        deletedCount,
        uniqueIdCount,
      }
    }, { name: projectName })
    expect(cacheConsistency.totalCount).toBe(3)
    expect(cacheConsistency.deletedCount).toBe(0)
    expect(cacheConsistency.uniqueIdCount).toBe(3)
  })
})
