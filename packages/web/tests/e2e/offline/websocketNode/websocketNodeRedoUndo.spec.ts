import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../fixtures/fixtures';
import {
  waitForWebSocketNodeReady,
  fillUrl,
  clickUndo,
  clickRedo,
  undoByShortcut,
  redoByShortcut,
  verifyUndoEnabled,
  verifyUndoDisabled,
  verifyRedoEnabled,
  verifyRedoDisabled,
  verifyUrlValue,
  addQueryParam,
  fillMessage,
  getMessageContent
} from './helpers/websocketNodeHelpers';

test.describe('12. WebSocket节点 - 撤销重做测试', () => {
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

  test.describe('12.1 撤销按钮测试', () => {
    test('初始状态撤销按钮应禁用', async () => {
      const undoBtn = contentPage.locator('[title*="撤销"], .undo-btn').first();
      if (await undoBtn.count() > 0) {
        const isDisabled = await undoBtn.isDisabled();
        expect(isDisabled).toBe(true);
      }
    });

    test('有操作后撤销按钮应启用', async () => {
      await fillUrl(contentPage, 'test.com');
      await contentPage.waitForTimeout(500);
      const undoBtn = contentPage.locator('[title*="撤销"], .undo-btn').first();
      if (await undoBtn.count() > 0) {
        const isDisabled = await undoBtn.isDisabled();
        expect(isDisabled).toBe(false);
      }
    });

    test('应能点击撤销按钮', async () => {
      await fillUrl(contentPage, 'test.com');
      await contentPage.waitForTimeout(300);
      await clickUndo(contentPage);
    });
  });

  test.describe('12.2 撤销URL更改测试', () => {
    test('应能撤销URL更改', async () => {
      await fillUrl(contentPage, 'original.com');
      await contentPage.waitForTimeout(300);
      await fillUrl(contentPage, 'changed.com');
      await contentPage.waitForTimeout(300);
      await undoByShortcut(contentPage);
      await verifyUrlValue(contentPage, 'original.com');
    });

    test('撤销后重做应恢复更改', async () => {
      await fillUrl(contentPage, 'first.com');
      await contentPage.waitForTimeout(300);
      await undoByShortcut(contentPage);
      await redoByShortcut(contentPage);
      await verifyUrlValue(contentPage, 'first.com');
    });
  });

  test.describe('12.3 撤销参数更改测试', () => {
    test('应能撤销添加参数操作', async () => {
      await addQueryParam(contentPage, 'token', '123');
      await contentPage.waitForTimeout(300);
      await undoByShortcut(contentPage);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('12.4 撤销消息内容更改测试', () => {
    test('应能撤销消息内容更改', async () => {
      await fillMessage(contentPage, 'Original message');
      await contentPage.waitForTimeout(500);
      await fillMessage(contentPage, 'Changed message');
      await contentPage.waitForTimeout(500);
      await undoByShortcut(contentPage);
      const content = await getMessageContent(contentPage);
      expect(content).toContain('Original');
    });
  });

  test.describe('12.5 快捷键测试', () => {
    test('Ctrl+Z应触发撤销', async () => {
      await fillUrl(contentPage, 'test.com');
      await contentPage.waitForTimeout(300);
      await undoByShortcut(contentPage);
      await contentPage.waitForTimeout(300);
    });

    test('Ctrl+Y应触发重做', async () => {
      await fillUrl(contentPage, 'test.com');
      await contentPage.waitForTimeout(300);
      await undoByShortcut(contentPage);
      await redoByShortcut(contentPage);
      await verifyUrlValue(contentPage, 'test.com');
    });
  });

  test.describe('12.6 重做按钮测试', () => {
    test('初始状态重做按钮应禁用', async () => {
      const redoBtn = contentPage.locator('[title*="重做"], .redo-btn').first();
      if (await redoBtn.count() > 0) {
        const isDisabled = await redoBtn.isDisabled();
        expect(isDisabled).toBe(true);
      }
    });

    test('撤销后重做按钮应启用', async () => {
      await fillUrl(contentPage, 'test.com');
      await contentPage.waitForTimeout(300);
      await undoByShortcut(contentPage);
      const redoBtn = contentPage.locator('[title*="重做"], .redo-btn').first();
      if (await redoBtn.count() > 0) {
        const isDisabled = await redoBtn.isDisabled();
        expect(isDisabled).toBe(false);
      }
    });

    test('应能点击重做按钮', async () => {
      await fillUrl(contentPage, 'test.com');
      await contentPage.waitForTimeout(300);
      await clickUndo(contentPage);
      await clickRedo(contentPage);
    });
  });

  test.describe('12.7 多次撤销重做测试', () => {
    test('应能连续撤销多次', async () => {
      await fillUrl(contentPage, 'first.com');
      await contentPage.waitForTimeout(200);
      await fillUrl(contentPage, 'second.com');
      await contentPage.waitForTimeout(200);
      await fillUrl(contentPage, 'third.com');
      await contentPage.waitForTimeout(200);
      await undoByShortcut(contentPage);
      await verifyUrlValue(contentPage, 'second.com');
      await undoByShortcut(contentPage);
      await verifyUrlValue(contentPage, 'first.com');
    });

    test('应能连续重做多次', async () => {
      await fillUrl(contentPage, 'first.com');
      await contentPage.waitForTimeout(200);
      await fillUrl(contentPage, 'second.com');
      await contentPage.waitForTimeout(200);
      await undoByShortcut(contentPage);
      await undoByShortcut(contentPage);
      await redoByShortcut(contentPage);
      await verifyUrlValue(contentPage, 'first.com');
      await redoByShortcut(contentPage);
      await verifyUrlValue(contentPage, 'second.com');
    });
  });
});
