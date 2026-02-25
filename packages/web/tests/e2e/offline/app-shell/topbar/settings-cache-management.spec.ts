import { test, expect } from '../../../../fixtures/electron.fixture';

test.describe('SettingsCacheManagement', () => {
  // 本地数据页 localStorage 模块支持详情查看
  test('离线设置-本地数据页支持查看 localStorage 详情', async ({ contentPage, clearCache, jumpToSettings }) => {
    await clearCache();
    await jumpToSettings();
    // 进入本地数据页并校验 localStorage 区块渲染
    const localDataMenu = contentPage.locator('[data-testid="settings-menu-local-data"]');
    await localDataMenu.click();
    await expect(localDataMenu).toHaveClass(/active/, { timeout: 5000 });
    await expect(contentPage.locator('.cache-management .page-title')).toContainText('本地数据管理', { timeout: 5000 });
    await expect(contentPage.locator('.localstorage-detail .table-title')).toContainText('localStorage 数据详情', { timeout: 5000 });
    // 若有数据则打开详情弹窗并关闭，若无数据则验证空态文案
    const localRows = contentPage.locator('.localstorage-detail .el-table__body-wrapper tbody tr');
    const localRowCount = await localRows.count();
    if (localRowCount > 0) {
      const detailBtn = localRows.first().locator('.el-button').filter({ hasText: /详情/ }).first();
      await detailBtn.click();
      const detailDialog = contentPage.locator('.el-dialog').filter({ hasText: /详情/ }).first();
      await expect(detailDialog).toBeVisible({ timeout: 5000 });
      await expect(detailDialog).toContainText(/键名/);
      await detailDialog.locator('.el-dialog__headerbtn').click();
      await expect(detailDialog).toBeHidden({ timeout: 5000 });
    } else {
      await expect(contentPage.locator('.localstorage-detail .empty-data')).toBeVisible({ timeout: 5000 });
    }
  });
  // 本地数据页 IndexedDB 模块支持切换与详情查看
  test('离线设置-本地数据页支持切换 IndexedDB 并查看详情', async ({ contentPage, clearCache, jumpToSettings }) => {
    await clearCache();
    await jumpToSettings();
    // 进入本地数据页后切换到 IndexedDB 卡片
    const localDataMenu = contentPage.locator('[data-testid="settings-menu-local-data"]');
    await localDataMenu.click();
    await expect(localDataMenu).toHaveClass(/active/, { timeout: 5000 });
    const indexedCard = contentPage.locator('.cache-card', { hasText: /IndexedDB 本地数据/ }).first();
    await indexedCard.click();
    await expect(indexedCard).toHaveClass(/selected/, { timeout: 5000 });
    await expect(contentPage.locator('.indexeddb-detail .table-title')).toContainText('IndexedDB 本地数据详情', { timeout: 5000 });
    // 触发一次刷新，等待列表或空态出现
    const refreshBtn = indexedCard.locator('.refresh-btn').first();
    await refreshBtn.click();
    const indexedRows = contentPage.locator('.indexeddb-detail .el-table__body-wrapper tbody tr');
    const indexedEmpty = contentPage.locator('.indexeddb-detail .empty-data');
    await expect.poll(async () => {
      const rowCount = await indexedRows.count();
      const emptyCount = await indexedEmpty.count();
      return rowCount + emptyCount;
    }, { timeout: 10000 }).toBeGreaterThan(0);
    // 若有数据则打开详情弹窗并关闭
    const indexedRowCount = await indexedRows.count();
    if (indexedRowCount > 0) {
      const detailBtn = indexedRows.first().locator('.el-button').filter({ hasText: /详情/ }).first();
      await detailBtn.click();
      const detailDialog = contentPage.locator('.el-dialog').filter({ hasText: /数据详情/ }).first();
      await expect(detailDialog).toBeVisible({ timeout: 5000 });
      await expect(detailDialog).toContainText(/数据库名称/);
      await detailDialog.locator('.el-dialog__headerbtn').click();
      await expect(detailDialog).toBeHidden({ timeout: 5000 });
    }
  });
});

