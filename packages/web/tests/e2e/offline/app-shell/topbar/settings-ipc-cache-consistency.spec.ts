import { test, expect } from '../../../../fixtures/electron.fixture';

test.describe('SettingsIpcCacheConsistency', () => {
  // AI 配置中的“更多设置”应通过 IPC 打开设置页并落到 ai-settings
  test('离线模式下通过 AI 配置入口打开设置页并保持 ai-settings 激活', async ({ topBarPage, contentPage, clearCache }) => {
    await clearCache();
    const aiBtn = topBarPage.locator('[data-testid="header-ai-btn"]');
    await aiBtn.click();
    const aiDialog = contentPage.locator('.ai-dialog');
    await expect(aiDialog).toBeVisible({ timeout: 5000 });
    // 先从 AI 对话页进入 AI 配置页，再通过“更多设置”触发 openSettingsTab
    const aiDialogSettingsBtn = aiDialog.getByRole('button', { name: /设置|Settings/i }).first();
    await aiDialogSettingsBtn.click();
    const moreSettingsBtn = aiDialog.getByRole('button', { name: /更多设置|More settings|More Settings/ }).first();
    await expect(moreSettingsBtn).toBeVisible({ timeout: 5000 });
    await moreSettingsBtn.click();
    // 验证设置 Tab 与设置菜单激活状态同步正确
    await expect(contentPage).toHaveURL(/.*#\/settings/, { timeout: 10000 });
    const settingsTab = topBarPage.locator('[data-test-id^="header-tab-item-"].active[data-id^="settings-"]').first();
    await expect(settingsTab).toBeVisible({ timeout: 5000 });
    const aiSettingsMenu = contentPage.locator('[data-testid="settings-menu-ai-settings"]');
    await expect(aiSettingsMenu).toHaveClass(/active/, { timeout: 5000 });
    // 验证设置子菜单缓存写入为 ai-settings
    await expect.poll(async () => {
      return await contentPage.evaluate(() => localStorage.getItem('appState/localData/activeMenu') || '');
    }, { timeout: 5000 }).toBe('ai-settings');
  });
  // tabsUpdated 与 activeTabUpdated 事件应持续同步到内容页缓存并在刷新后恢复
  test('离线模式下 tabs/activeTab IPC 缓存一致性与刷新恢复', async ({ topBarPage, contentPage, clearCache, createProject, reload }) => {
    await clearCache();
    const projectAName = await createProject(`IPC缓存A-${Date.now()}`);
    const projectBName = await createProject(`IPC缓存B-${Date.now()}`);
    const projectATab = topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectAName }).first();
    await expect(projectATab).toBeVisible({ timeout: 5000 });
    const projectAId = await projectATab.getAttribute('data-id');
    expect(projectAId).not.toBeNull();
    // 创建设置页签并切换回项目页，触发 tabsUpdated + activeTabUpdated 链路
    const settingsBtn = topBarPage.locator('[data-testid="header-settings-btn"]');
    await settingsBtn.click();
    await expect(contentPage).toHaveURL(/.*#\/settings/, { timeout: 10000 });
    await projectATab.click();
    const escapedProjectAId = (projectAId || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(contentPage).toHaveURL(new RegExp(`.*#\\/workbench.*[?&]id=${escapedProjectAId}`), { timeout: 10000 });
    // 对比 topBar 当前 tab 列表与 content 缓存中的 tabs 是否一致
    const topBarTabIdsRaw = await topBarPage.locator('[data-test-id^="header-tab-item-"]').evaluateAll((nodes) => {
      return nodes.map((node) => node.getAttribute('data-id'));
    });
    const topBarTabIds = topBarTabIdsRaw.filter((id): id is string => typeof id === 'string' && id.length > 0);
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const raw = localStorage.getItem('appWorkbench/header/tabs') || '[]';
        const parsed = JSON.parse(raw) as Array<{ id?: string }>;
        return parsed.map((item) => item.id || '').filter((id) => id.length > 0).join('|');
      });
    }, { timeout: 5000 }).toBe(topBarTabIds.join('|'));
    // 对比 topBar 当前激活 tab 与 content 缓存中的 activeTab 是否一致
    const activeTopBarTabId = await topBarPage.locator('[data-test-id^="header-tab-item-"].active').first().getAttribute('data-id');
    expect(activeTopBarTabId).not.toBeNull();
    await expect.poll(async () => {
      return await contentPage.evaluate(() => localStorage.getItem('appWorkbench/header/activeTab') || '');
    }, { timeout: 5000 }).toBe(activeTopBarTabId || '');
    // 刷新后再次验证 tabs 与 activeTab 缓存和 topBar 状态仍一致
    await reload();
    await expect(topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectAName })).toBeVisible({ timeout: 5000 });
    await expect(topBarPage.locator('[data-test-id^="header-tab-item-"]').filter({ hasText: projectBName })).toBeVisible({ timeout: 5000 });
    const topBarTabIdsAfterReloadRaw = await topBarPage.locator('[data-test-id^="header-tab-item-"]').evaluateAll((nodes) => {
      return nodes.map((node) => node.getAttribute('data-id'));
    });
    const topBarTabIdsAfterReload = topBarTabIdsAfterReloadRaw.filter((id): id is string => typeof id === 'string' && id.length > 0);
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const raw = localStorage.getItem('appWorkbench/header/tabs') || '[]';
        const parsed = JSON.parse(raw) as Array<{ id?: string }>;
        return parsed.map((item) => item.id || '').filter((id) => id.length > 0).join('|');
      });
    }, { timeout: 5000 }).toBe(topBarTabIdsAfterReload.join('|'));
    const activeTopBarTabIdAfterReload = await topBarPage.locator('[data-test-id^="header-tab-item-"].active').first().getAttribute('data-id');
    expect(activeTopBarTabIdAfterReload).not.toBeNull();
    await expect.poll(async () => {
      return await contentPage.evaluate(() => localStorage.getItem('appWorkbench/header/activeTab') || '');
    }, { timeout: 5000 }).toBe(activeTopBarTabIdAfterReload || '');
  });
});
