import { test, expect } from '../../../fixtures/electron-online.fixture';

test.describe('Online项目成员权限', () => {
  test('项目仅剩一个管理员时不允许退出', async ({ topBarPage, contentPage, clearCache, loginAccount, createProject }) => {
    await clearCache();
    await loginAccount();

    const loginName = process.env.TEST_LOGIN_NAME;
    if (!loginName) throw new Error('缺少 TEST_LOGIN_NAME 环境变量');

    const projectName = await createProject(`E2E-权限项目-${Date.now()}`);
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 10000 });

    const projectListResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_list') && response.status() === 200,
      { timeout: 20000 },
    );
    await topBarPage.locator('[data-testid="header-home-btn"]').click();
    await contentPage.waitForURL(/.*#\/home.*/, { timeout: 10000 });
    await projectListResponse;

    const projectCard = contentPage.locator('[data-testid^="home-project-card-"]').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 5000 });

    const membersResponse = contentPage.waitForResponse(
      (response) => response.url().includes('/api/project/project_members') && response.status() === 200,
      { timeout: 20000 },
    );
    await expect(projectCard.locator('.operator > div').nth(1)).toBeVisible({ timeout: 5000 });
    await projectCard.locator('.operator > div').nth(1).click();
    await membersResponse;

    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /成员管理|Member/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const selfRow = dialog.locator('.el-table__row').filter({ hasText: loginName }).first();
    await expect(selfRow).toBeVisible({ timeout: 5000 });
    await selfRow.getByRole('button', { name: /退出|Leave/i }).click();

    await expect(contentPage.locator('.el-message').filter({ hasText: /团队至少保留一个管理员/ })).toBeVisible({ timeout: 5000 });
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });
});
