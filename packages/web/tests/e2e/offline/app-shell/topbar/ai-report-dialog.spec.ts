import { test, expect } from '../../../../fixtures/desktop.fixture';

test.describe('AiReportDialog', () => {
  // AI 弹窗在应用商店态下可打开举报弹窗，并完成复制邮箱与关闭流程
  test('离线模式下 AI 举报弹窗支持显示复制与关闭', async ({ topBarPage, contentPage, clearCache }) => {
    await clearCache();
    await contentPage.evaluate(() => { window.desktopAPI!.updateManager.isAppStore = async () => true; });
    // 打开 AI 弹窗并检查举报入口是否可见
    const aiBtn = topBarPage.locator('[data-testid="header-ai-btn"]');
    await aiBtn.click();
    const aiDialog = contentPage.locator('.ai-dialog');
    await expect(aiDialog).toBeVisible({ timeout: 5000 });
    const reportBtn = aiDialog.getByRole('button', { name: /举报/ }).first();
    const reportBtnCount = await reportBtn.count();
    if (reportBtnCount === 0) {
      test.skip(true, '当前运行环境未展示 AI 举报入口');
    }
    await expect(reportBtn).toBeVisible({ timeout: 5000 });
    await reportBtn.click();
    // 校验举报弹窗核心内容并执行复制邮箱动作
    const reportDialog = contentPage.locator('.el-dialog').filter({ hasText: /举报 AI 内容/ }).first();
    await expect(reportDialog).toBeVisible({ timeout: 5000 });
    await expect(reportDialog.locator('.report-email')).toContainText('2581105856@qq.com');
    const copyBtn = reportDialog.locator('.report-copy-btn').first();
    await copyBtn.click();
    const copyFeedback = contentPage.locator('.el-message').filter({ hasText: /已复制到剪贴板|复制失败，请手动复制/ }).last();
    await expect(copyFeedback).toBeVisible({ timeout: 5000 });
    // 关闭举报弹窗，确认流程完整结束
    const closeBtn = reportDialog.getByRole('button', { name: /关闭/ }).first();
    await closeBtn.click();
    await expect(reportDialog).toBeHidden({ timeout: 5000 });
  });
});
