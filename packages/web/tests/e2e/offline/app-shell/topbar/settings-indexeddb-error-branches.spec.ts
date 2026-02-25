import { test, expect } from '../../../../fixtures/electron.fixture'

test.describe('SettingsIndexedDBErrorBranches', () => {
  // 本地数据页基于缓存脏数据触发 IndexedDB Worker 异常分支，覆盖详情和删除场景的错误处理
  test('离线设置-IndexedDB 不存在存储时可稳定提示错误', async ({ contentPage, clearCache, jumpToSettings }) => {
    test.setTimeout(60000)
    await clearCache()
    // 注入不存在的 db/store 缓存条目，模拟离线缓存与真实数据库不一致
    await contentPage.evaluate(() => {
      localStorage.setItem('settings/cacheManager/info', JSON.stringify({
        indexedDBSize: 1,
        indexedDBDetails: [
          {
            dbName: 'worker_error_case_db',
            storeName: 'worker_error_case_store',
            size: 1,
            description: '未知类型缓存',
          },
        ],
        timestamp: Date.now(),
      }))
    })
    await jumpToSettings()
    // 进入本地数据页并切换到 IndexedDB 视图
    const localDataMenu = contentPage.locator('[data-testid="settings-menu-local-data"]')
    await localDataMenu.click()
    await expect(localDataMenu).toHaveClass(/active/, { timeout: 5000 })
    const indexedCard = contentPage.locator('.cache-card', { hasText: /IndexedDB 本地数据/ }).first()
    await indexedCard.click()
    await expect(indexedCard).toHaveClass(/selected/, { timeout: 5000 })
    const staleRow = contentPage
      .locator('.indexeddb-detail .el-table__body-wrapper tbody tr', { hasText: /worker_error_case_db/ })
      .filter({ hasText: /worker_error_case_store/ })
      .first()
    await expect(staleRow).toBeVisible({ timeout: 10000 })
    // 打开详情触发 getStoreDetail 异常，验证错误提示
    await staleRow.locator('.el-button').filter({ hasText: /详情/ }).first().click()
    const detailDialog = contentPage.locator('.el-dialog').filter({ hasText: /数据详情/ }).first()
    await expect(detailDialog).toBeVisible({ timeout: 5000 })
    await expect(contentPage.locator('.el-message--error .el-message__content').last()).toContainText(/操作失败/, { timeout: 5000 })
    await detailDialog.locator('.el-dialog__headerbtn').click()
    await expect(detailDialog).toBeHidden({ timeout: 5000 })
    // 删除该条目触发 deleteStore 异常，验证错误提示仍可稳定展示
    await staleRow.locator('.el-button').filter({ hasText: /删除/ }).first().click()
    const deleteStoreConfirmDialog = contentPage.locator('.cl-confirm-wrapper:visible').first()
    await expect(deleteStoreConfirmDialog).toContainText(/删除确认/, { timeout: 5000 })
    await deleteStoreConfirmDialog.locator('.el-button--primary').focus()
    await contentPage.keyboard.press('Enter')
    await expect(deleteStoreConfirmDialog).toBeHidden({ timeout: 5000 })
    await expect(contentPage.locator('.el-message--error .el-message__content').last()).toContainText(/操作失败/, { timeout: 5000 })
  })
})
