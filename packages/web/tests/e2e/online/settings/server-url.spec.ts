import { test, expect } from '../../../fixtures/electron-online.fixture.ts';

test.describe('OnlineServerUrl', () => {
  test('通过设置页 UI 设置 serverUrl（来自 .env.test）', async ({ topBarPage, contentPage, clearCache }) => {
    const serverUrl = process.env.TEST_SERVER_URL;

    await clearCache();

    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await settingsBtn.click();
    await contentPage.waitForURL(/.*#\/settings.*/, { timeout: 5000 });

    const commonSettingsMenu = contentPage.locator('[data-testid="settings-menu-common-settings"]');
    await commonSettingsMenu.click();

    await expect(contentPage.getByText(/应用配置|App Config/i)).toBeVisible({ timeout: 5000 });

    const serverUrlInput = contentPage.getByPlaceholder(/请输入接口调用地址|Please enter.*address/i);
    await expect(serverUrlInput).toBeVisible({ timeout: 5000 });
    await serverUrlInput.fill(serverUrl);

    const saveBtn = contentPage.getByRole('button', { name: /保存|Save/i });
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await expect(contentPage.getByText(/保存成功|Saved successfully/i)).toBeVisible({ timeout: 5000 });
    }

    const savedServerUrl = await contentPage.evaluate(() => {
      return localStorage.getItem('settings/app/serverUrl');
    });
    expect(savedServerUrl).toBe(serverUrl);
  });
});
