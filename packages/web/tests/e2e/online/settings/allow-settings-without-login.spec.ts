import { test, expect } from '../../../fixtures/electron-online.fixture.ts'

test.describe('OnlineAnonymousSettings', () => {
  test('在线模式未登录也允许进入设置页', async ({ topBarPage, contentPage, clearCache }) => {
    await clearCache()

    await contentPage.evaluate(() => {
      localStorage.setItem('runtime/networkMode', 'online')
      localStorage.removeItem('runtime/userInfo')
    })

    await contentPage.reload()
    await contentPage.waitForLoadState('domcontentloaded')

    await contentPage.waitForURL(/.*#\/login.*/, { timeout: 5000 })

    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]')
    await settingsBtn.click()

    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 })
    await expect(contentPage.locator('[data-testid="settings-menu-common-settings"]')).toBeVisible({ timeout: 5000 })
    await expect(contentPage).not.toHaveURL(/.*#\/login.*/)
  })
})
