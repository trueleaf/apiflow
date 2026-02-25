import fs from 'node:fs'
import path from 'node:path'
import { test, expect } from '../../../../fixtures/electron.fixture'

test.describe('SettingsBackupRestore', () => {
  // 本地数据管理覆盖备份导出与恢复导入核心流程，确保导出可执行、非法备份可拦截
  test('离线设置-本地数据 backup/restore 关键路径可用', async ({ contentPage, clearCache, jumpToSettings }) => {
    test.setTimeout(70000)
    await clearCache()
    const invalidBackupPath = path.resolve(process.cwd(), 'tests/e2e/offline/app-shell/topbar/invalid-backup.zip')
    fs.writeFileSync(invalidBackupPath, 'invalid-backup-content', 'utf-8')
    try {
      // 预置少量本地数据，保证备份页存在可导出项
      await contentPage.evaluate(() => {
        localStorage.setItem('backup/test-key', JSON.stringify({ value: 'backup-case', timestamp: Date.now() }))
      })
      await jumpToSettings()
      const localDataMenu = contentPage.locator('[data-testid="settings-menu-local-data"]')
      await localDataMenu.click()
      await expect(localDataMenu).toHaveClass(/active/, { timeout: 5000 })
      // 切换到“数据备份/导出”，执行一次导出并确认进入成功态
      const backupCard = contentPage.locator('.cache-card', { hasText: /数据备份\/导出/ }).first()
      await backupCard.click()
      await expect(backupCard).toHaveClass(/selected/, { timeout: 5000 })
      const exportBtn = contentPage.locator('.data-backup .actions .el-button').filter({ hasText: /开始导出|再次导出/ }).first()
      await expect(exportBtn).toBeEnabled({ timeout: 5000 })
      await exportBtn.click()
      await expect(contentPage.locator('.data-backup .actions .el-button').filter({ hasText: /再次导出/ }).first()).toBeVisible({ timeout: 20000 })
      // 切换到“数据恢复/导入”，上传非法 zip 并验证错误提示与禁用态
      const restoreCard = contentPage.locator('.cache-card', { hasText: /数据恢复\/导入/ }).first()
      await restoreCard.click()
      await expect(restoreCard).toHaveClass(/selected/, { timeout: 5000 })
      const uploadInput = contentPage.locator('.data-restore .el-upload input[type="file"]')
      await uploadInput.setInputFiles(invalidBackupPath)
      await expect(contentPage.locator('.el-message--error .el-message__content').last()).toContainText(/导入失败/, { timeout: 10000 })
      const importBtn = contentPage.locator('.data-restore .actions .el-button').filter({ hasText: /开始导入|再次导入/ }).first()
      await expect(importBtn).toBeDisabled()
    } finally {
      if (fs.existsSync(invalidBackupPath)) {
        fs.unlinkSync(invalidBackupPath)
      }
    }
  })
})
