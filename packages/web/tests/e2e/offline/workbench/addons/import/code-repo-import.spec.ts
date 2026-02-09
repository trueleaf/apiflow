import { test, expect } from '../../../../../fixtures/electron.fixture';

test.describe('ImportSource', () => {
  test('导入页面仅提供4种数据来源', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
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
  });

  test('导入页面切换不同导入方式', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    test.setTimeout(60000);
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
