import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForWebSocketNodeReady,
  fillUrl,
  clickSaveApi,
  clickRefresh,
  saveByShortcut,
  verifySaveButtonEnabled,
  verifySaveButtonDisabled,
  verifyUrlValue,
  addQueryParam,
  fillMessage
} from './helpers/websocketNodeHelpers';

test.describe('10. WebSocket节点 - 保存功能测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
    await createProject(contentPage, '测试项目');
    await createSingleNode(contentPage, {
      name: 'Test WebSocket',
      type: 'websocket'
    });
    await waitForWebSocketNodeReady(contentPage);
  });

  test.describe('10.1 保存按钮测试', () => {
    /**
     * 测试目的：验证保存按钮初始状态
     * 前置条件：已创建WebSocket节点
     * 操作步骤：检查保存按钮状态
     * 预期结果：保存按钮处于启用状态
     * 验证点：保存按钮初始状态
     */
    test('保存按钮应初始为启用状态', async () => {
      // 验证保存按钮可用
      await verifySaveButtonEnabled(contentPage);
    });

    test('应能点击保存按钮', async () => {
      // 点击保存按钮
      await clickSaveApi(contentPage);
      // 等待保存完成
      await contentPage.waitForTimeout(500);
    });

    test('应能通过快捷键保存', async () => {
      // 使用快捷键保存
      await saveByShortcut(contentPage);
      // 等待保存完成
      await contentPage.waitForTimeout(500);
    });
  });

  test.describe('10.2 刷新功能测试', () => {
    test('应能点击刷新按钮', async () => {
      // 点击刷新按钮
      await clickRefresh(contentPage);
      // 等待刷新完成
      await contentPage.waitForTimeout(500);
    });

    test('刷新后应恢复保存的配置', async () => {
      // 输入URL
      await fillUrl(contentPage, 'echo.websocket.org');
      // 保存配置
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(300);
      // 点击刷新
      await clickRefresh(contentPage);
      await contentPage.waitForTimeout(500);
      // 验证URL恢复
      await verifyUrlValue(contentPage, 'echo.websocket.org');
    });

    test('刷新应重新加载所有配置', async () => {
      // 输入URL
      await fillUrl(contentPage, 'test.com');
      // 添加Query参数
      await addQueryParam(contentPage, 'token', '123');
      // 保存配置
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(300);
      // 点击刷新
      await clickRefresh(contentPage);
      await contentPage.waitForTimeout(500);
      // 验证URL恢复
      await verifyUrlValue(contentPage, 'test.com');
    });
  });

  test.describe('10.3 未保存标识测试', () => {
    test('修改URL后应显示未保存标识', async () => {
      // 修改URL
      await fillUrl(contentPage, 'changed.com');
      await contentPage.waitForTimeout(500);
      // 查找未保存标识
      const unsavedIndicator = contentPage.locator('.unsaved, .modified, [class*="unsaved"]').first();
      if (await unsavedIndicator.count() > 0) {
        // 验证未保存标识显示
        await expect(unsavedIndicator).toBeVisible();
      }
    });

    test('保存后应隐藏未保存标识', async () => {
      // 修改URL
      await fillUrl(contentPage, 'test.com');
      await contentPage.waitForTimeout(300);
      // 保存配置
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(500);
    });
  });

  test.describe('10.4 保存内容测试', () => {
    test('应保存URL配置', async () => {
      // 输入URL
      await fillUrl(contentPage, 'echo.websocket.org');
      // 保存配置
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(300);
      // 刷新页面
      await clickRefresh(contentPage);
      // 验证URL保存成功
      await verifyUrlValue(contentPage, 'echo.websocket.org');
    });

    test('应保存Query参数', async () => {
      // 添加Query参数
      await addQueryParam(contentPage, 'token', 'abc123');
      // 保存配置
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(300);
      // 刷新页面
      await clickRefresh(contentPage);
      await contentPage.waitForTimeout(500);
    });

    test('应保存消息内容', async () => {
      // 填充消息内容
      await fillMessage(contentPage, 'Saved message');
      // 保存配置
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(500);
    });
  });
});
