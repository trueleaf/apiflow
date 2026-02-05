import { test, expect } from '../../../fixtures/electron.fixture'

test.describe('ProjectRecoveryDocNum', () => {
  test('恢复项目后接口数量正确展示，folder节点不计入接口总数', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    await clearCache()
    const networkBtn = topBarPage.locator('[data-testid="header-network-toggle"]')
    const networkText = await networkBtn.textContent()
    const isOnline = networkText?.includes('联网') || networkText?.includes('Online')
    if (isOnline) {
      await networkBtn.click()
      await topBarPage.waitForTimeout(500)
    }
    const projectName = await createProject(`离线项目-${Date.now()}`)
    const homeBtn = topBarPage.locator('[data-testid="header-home-btn"]')
    await homeBtn.click()
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 })
    await contentPage.waitForTimeout(500)
    const confirmBtn = contentPage.locator('.cl-confirm-footer-right .el-button--primary')
    const confirmBtnVisible = await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)
    if (confirmBtnVisible) {
      await confirmBtn.click()
      await contentPage.waitForTimeout(300)
    }
    const projectId = await contentPage.evaluate(async ({ name }) => {
      const projectDb = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open('projectCache')
        req.onerror = () => reject(req.error)
        req.onsuccess = () => resolve(req.result)
      })
      const projectList = await new Promise<Array<Record<string, unknown>>>((resolve, reject) => {
        const tx = projectDb.transaction('projects', 'readonly')
        tx.onerror = () => reject(tx.error)
        const store = tx.objectStore('projects')
        const getAllReq = store.getAll()
        getAllReq.onerror = () => reject(getAllReq.error)
        getAllReq.onsuccess = () => resolve((getAllReq.result || []) as Array<Record<string, unknown>>)
      })
      projectDb.close()
      const target = projectList.find(p => p && p['projectName'] === name)
      const id = target ? String(target['_id'] || '') : ''
      if (!id) {
        throw new Error('未在IndexedDB中找到目标项目')
      }
      return id
    }, { name: projectName })
    const projectTab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectName }).first()
    await expect(projectTab).toBeVisible({ timeout: 5000 })
    await projectTab.click()
    const bannerTree = contentPage.locator('[data-testid="banner-doc-tree"]')
    await expect(bannerTree).toBeVisible({ timeout: 5000 })
    await createNode(contentPage, { nodeType: 'folder', name: `Folder-${Date.now()}` })
    await createNode(contentPage, { nodeType: 'http', name: `HTTP-${Date.now()}` })
    await createNode(contentPage, { nodeType: 'websocket', name: `WebSocket-${Date.now()}` })
    await createNode(contentPage, { nodeType: 'httpMock', name: `HTTPMock-${Date.now()}` })
    await createNode(contentPage, { nodeType: 'websocketMock', name: `WebSocketMock-${Date.now()}` })
    await homeBtn.click()
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 })
    await contentPage.waitForTimeout(500)
    const projectCard = contentPage.locator('[data-testid^="home-project-card-"]').filter({ hasText: projectName }).first()
    await expect(projectCard).toBeVisible({ timeout: 5000 })
    await expect(projectCard.locator('.project-api-count .teal')).toContainText('4')
    await projectCard.locator('[data-testid="home-project-delete-btn"]').click()
    const confirmDialog = contentPage.locator('.cl-confirm-container')
    await expect(confirmDialog).toBeVisible({ timeout: 5000 })
    await confirmDialog.locator('.el-button--primary').click()
    await expect(confirmDialog).toBeHidden({ timeout: 5000 })
    const undoNotification = contentPage.locator('.undo-notification')
    await expect(undoNotification).toBeVisible({ timeout: 5000 })
    await undoNotification.locator('.btn-close').click()
    await expect(undoNotification).toBeHidden({ timeout: 5000 })
    await contentPage.evaluate(async ({ projectId: pid }) => {
      const now = new Date().toISOString()
      const nodesDb = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open('apiNodesCache')
        req.onerror = () => reject(req.error)
        req.onsuccess = () => resolve(req.result)
      })
      await new Promise<void>((resolve, reject) => {
        const tx = nodesDb.transaction('httpNodeList', 'readwrite')
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
        const store = tx.objectStore('httpNodeList')
        const getAllReq = store.getAll()
        getAllReq.onerror = () => reject(getAllReq.error)
        getAllReq.onsuccess = () => {
          const allNodes = (getAllReq.result || []) as Array<Record<string, unknown>>
          const targetNodes = allNodes.filter((node) => node && node['projectId'] === pid)
          for (const node of targetNodes) {
            const nodeId = String(node['_id'])
            const putReq = store.put({ ...node, isDeleted: true, updatedAt: now }, nodeId)
            putReq.onerror = () => reject(putReq.error)
          }
        }
      })
      nodesDb.close()
      const projectDb = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open('projectCache')
        req.onerror = () => reject(req.error)
        req.onsuccess = () => resolve(req.result)
      })
      await new Promise<void>((resolve, reject) => {
        const tx = projectDb.transaction('projects', 'readwrite')
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
        const store = tx.objectStore('projects')
        const getReq = store.get(pid)
        getReq.onerror = () => reject(getReq.error)
        getReq.onsuccess = () => {
          const project = getReq.result as Record<string, unknown> | undefined
          if (!project) {
            return
          }
          const putReq = store.put({ ...project, docNum: 0 }, pid)
          putReq.onerror = () => reject(putReq.error)
        }
      })
      projectDb.close()
    }, { projectId })
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]')
    await settingsBtn.click()
    await expect(contentPage.locator('[data-testid="settings-menu-project-recovery"]')).toBeVisible({ timeout: 5000 })
    await contentPage.locator('[data-testid="settings-menu-project-recovery"]').click()
    const recoveryPage = contentPage.locator('.project-recovery')
    await expect(recoveryPage).toBeVisible({ timeout: 5000 })
    const projectCardInRecovery = recoveryPage.locator('.project-card').filter({ hasText: projectName }).first()
    await expect(projectCardInRecovery).toBeVisible({ timeout: 5000 })
    await projectCardInRecovery.locator('.el-button').filter({ hasText: '恢复' }).click()
    await expect(projectCardInRecovery).toBeHidden({ timeout: 5000 })
    await homeBtn.click()
    await contentPage.waitForURL(/.*?#?\/home/, { timeout: 5000 })
    await contentPage.waitForTimeout(500)
    const restoredProjectCard = contentPage.locator('[data-testid^="home-project-card-"]').filter({ hasText: projectName }).first()
    await expect(restoredProjectCard).toBeVisible({ timeout: 5000 })
    await expect(restoredProjectCard.locator('.project-api-count .teal')).toContainText('4')
  })
})


