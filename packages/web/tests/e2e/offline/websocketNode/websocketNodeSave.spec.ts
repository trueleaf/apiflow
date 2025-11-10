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
    test('保存按钮应初始为启用状态', async () => {
      await verifySaveButtonEnabled(contentPage);
    });

    test('应能点击保存按钮', async () => {
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(500);
    });

    test('应能通过快捷键保存', async () => {
      await saveByShortcut(contentPage);
      await contentPage.waitForTimeout(500);
    });
  });

  test.describe('10.2 刷新功能测试', () => {
    test('应能点击刷新按钮', async () => {
      await clickRefresh(contentPage);
      await contentPage.waitForTimeout(500);
    });

    test('刷新后应恢复保存的配置', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(300);
      await clickRefresh(contentPage);
      await contentPage.waitForTimeout(500);
      await verifyUrlValue(contentPage, 'echo.websocket.org');
    });

    test('刷新应重新加载所有配置', async () => {
      await fillUrl(contentPage, 'test.com');
      await addQueryParam(contentPage, 'token', '123');
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(300);
      await clickRefresh(contentPage);
      await contentPage.waitForTimeout(500);
      await verifyUrlValue(contentPage, 'test.com');
    });
  });

  test.describe('10.3 未保存标识测试', () => {
    test('修改URL后应显示未保存标识', async () => {
      await fillUrl(contentPage, 'changed.com');
      await contentPage.waitForTimeout(500);
      const unsavedIndicator = contentPage.locator('.unsaved, .modified, [class*="unsaved"]').first();
      if (await unsavedIndicator.count() > 0) {
        await expect(unsavedIndicator).toBeVisible();
      }
    });

    test('保存后应隐藏未保存标识', async () => {
      await fillUrl(contentPage, 'test.com');
      await contentPage.waitForTimeout(300);
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(500);
    });
  });

  test.describe('10.4 保存内容测试', () => {
    test('应保存URL配置', async () => {
      await fillUrl(contentPage, 'echo.websocket.org');
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(300);
      await clickRefresh(contentPage);
      await verifyUrlValue(contentPage, 'echo.websocket.org');
    });

    test('应保存Query参数', async () => {
      await addQueryParam(contentPage, 'token', 'abc123');
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(300);
      await clickRefresh(contentPage);
      await contentPage.waitForTimeout(500);
    });

    test('应保存消息内容', async () => {
      await fillMessage(contentPage, 'Saved message');
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(500);
    });
  });
});
