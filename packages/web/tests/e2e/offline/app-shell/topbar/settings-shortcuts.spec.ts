import { test, expect } from '../../../../fixtures/electron.fixture'

test.describe('SettingsShortcuts', () => {
  // 快捷键设置覆盖取消录制、保存持久化与重置默认全链路
  test('离线设置-快捷键保存持久化与重置默认', async ({ contentPage, clearCache, jumpToSettings, reload }) => {
    test.setTimeout(70000)
    await clearCache()
    await jumpToSettings()
    // 进入快捷键页面并定位 AI 助手行
    const shortcutsMenu = contentPage.locator('[data-testid="settings-menu-shortcuts"]')
    await shortcutsMenu.click()
    await expect(shortcutsMenu).toHaveClass(/active/, { timeout: 5000 })
    const shortcutsPage = contentPage.locator('.shortcuts-settings')
    await expect(shortcutsPage).toBeVisible({ timeout: 5000 })
    const aiShortcutRow = shortcutsPage.locator('.shortcut-row').filter({ hasText: /AI助手/ }).first()
    await expect(aiShortcutRow).toBeVisible({ timeout: 5000 })
    // 进入录制后按 Esc 取消，验证录制可取消且不进入保存态
    await aiShortcutRow.locator('.action-btn.edit-btn').click()
    const recorder = aiShortcutRow.locator('.key-recorder').first()
    await recorder.click()
    await contentPage.keyboard.press('Escape')
    await expect(aiShortcutRow.locator('.action-btn.save-btn')).toBeVisible({ timeout: 5000 })
    await aiShortcutRow.locator('.action-btn.cancel-btn').click()
    await expect(aiShortcutRow.locator('.keys-label').filter({ hasText: '自定义' })).toHaveCount(0)
    // 编辑为新快捷键并保存，验证进入自定义态
    await aiShortcutRow.locator('.action-btn.edit-btn').click()
    const recorderForSave = aiShortcutRow.locator('.key-recorder').first()
    await recorderForSave.click()
    await contentPage.keyboard.press('k')
    await aiShortcutRow.locator('.action-btn.save-btn').click()
    await expect(aiShortcutRow.locator('.keys-label').filter({ hasText: '自定义' })).toBeVisible({ timeout: 5000 })
    // 刷新后验证自定义快捷键仍然存在（持久化）
    await reload()
    await expect(contentPage).toHaveURL(/.*#\/settings/, { timeout: 10000 })
    await expect(contentPage.locator('[data-testid="settings-menu-shortcuts"]')).toHaveClass(/active/, { timeout: 5000 })
    const aiShortcutRowAfterReload = contentPage.locator('.shortcuts-settings .shortcut-row').filter({ hasText: /AI助手/ }).first()
    await expect(aiShortcutRowAfterReload.locator('.keys-label').filter({ hasText: '自定义' })).toBeVisible({ timeout: 5000 })
    await expect(aiShortcutRowAfterReload.locator('.keys-display.custom .keys-list')).toContainText(/K/, { timeout: 5000 })
    // 点击重置为默认并确认，验证自定义态消失且本地缓存移除
    await aiShortcutRowAfterReload.locator('.action-btn.reset-btn').click()
    const confirmDialog = contentPage.locator('.cl-confirm-wrapper:visible').first()
    await expect(confirmDialog).toContainText(/确认重置|确定要重置该快捷键为默认值吗/, { timeout: 5000 })
    await confirmDialog.locator('.el-button--primary').click()
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const raw = localStorage.getItem('settings/shortcuts')
        if (!raw) {
          return ''
        }
        try {
          const parsed = JSON.parse(raw) as Record<string, string>
          return parsed['ai-assistant'] || ''
        } catch {
          return 'parse-error'
        }
      })
    }, { timeout: 10000 }).toBe('')
  })
})
