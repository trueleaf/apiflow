import { test, expect } from '../../../../../fixtures/electron-online.fixture';

test.describe('ImportSource', () => {
  test('导入页面提供4种数据来源并包含AI智能识别', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档|Import/ });
    await expect(importItem).toBeVisible({ timeout: 5000 });
    await importItem.click();

    const importPage = contentPage.locator('.doc-import');
    await expect(importPage).toBeVisible({ timeout: 5000 });

    const sourceItems = importPage.locator('.source-item');
    await expect(sourceItems).toHaveCount(4);
    await expect(importPage.locator('.source-item').filter({ hasText: /本地文件|Local File/ })).toBeVisible();
    await expect(importPage.locator('.source-item').filter({ hasText: /URL导入|URL/ })).toBeVisible();
    await expect(importPage.locator('.source-item').filter({ hasText: /粘贴内容|Paste/ })).toBeVisible();
    await expect(importPage.locator('.source-item').filter({ hasText: /AI智能识别|AI/ })).toBeVisible();
  });

  test('切换到AI智能识别后显示对应输入区域或不可用提示', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档|Import/ });
    await importItem.click();

    const importPage = contentPage.locator('.doc-import');
    await expect(importPage).toBeVisible({ timeout: 5000 });

    const aiSource = importPage.locator('.source-item').filter({ hasText: /AI智能识别|AI/ });
    await aiSource.click();
    await expect(aiSource).toHaveClass(/active/);

    const aiUnavailable = importPage.locator('.ai-unavailable');
    const aiInputArea = importPage.locator('.ai-input-area');
    const unavailableVisible = await aiUnavailable.isVisible().catch(() => false);
    if (unavailableVisible) {
      await expect(aiUnavailable).toBeVisible();
      await expect(aiUnavailable).toContainText(/API Key|配置/);
    } else {
      await expect(aiInputArea).toBeVisible();
      await expect(aiInputArea.locator('textarea')).toBeVisible();
    }
  });

  test('导入页面可在四种数据来源间切换激活状态', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const importItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导入文档|Import/ });
    await importItem.click();

    const importPage = contentPage.locator('.doc-import');
    await expect(importPage).toBeVisible({ timeout: 5000 });

    const sourceItems = importPage.locator('.source-item');
    await expect(sourceItems).toHaveCount(4);

    const fileSource = sourceItems.nth(0);
    const urlSource = sourceItems.nth(1);
    const pasteSource = sourceItems.nth(2);
    const aiSource = sourceItems.nth(3);

    await fileSource.click();
    await expect(fileSource).toHaveClass(/active/);

    await urlSource.click();
    await expect(urlSource).toHaveClass(/active/);
    await expect(fileSource).not.toHaveClass(/active/);

    await pasteSource.click();
    await expect(pasteSource).toHaveClass(/active/);
    await expect(urlSource).not.toHaveClass(/active/);

    await aiSource.click();
    await expect(aiSource).toHaveClass(/active/);
    await expect(pasteSource).not.toHaveClass(/active/);
  });
});
