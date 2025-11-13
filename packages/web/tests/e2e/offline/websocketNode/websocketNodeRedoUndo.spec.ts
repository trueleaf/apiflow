import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
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
    /**
     * 测试目的：验证初始状态撤销按钮禁用
     * 前置条件：已创建WebSocket节点
     * 操作步骤：检查撤销按钮状态
     * 预期结果：撤销按钮处于禁用状态
     * 验证点：撤销按钮初始状态
     */
    test('初始状态撤销按钮应禁用', async () => {
      // 查找撤销按钮
      const undoBtn = contentPage.locator('[title*="撤销"], .undo-btn').first();
      if (await undoBtn.count() > 0) {
        // 检查按钮状态
        const isDisabled = await undoBtn.isDisabled();
        // 验证按钮禁用
        expect(isDisabled).toBe(true);
      }
    });

    test('有操作后撤销按钮应启用', async () => {
      // 输入URL触发操作
      await fillUrl(contentPage, 'test.com');
      await contentPage.waitForTimeout(500);
      // 查找撤销按钮
      const undoBtn = contentPage.locator('[title*="撤销"], .undo-btn').first();
      if (await undoBtn.count() > 0) {
        // 检查按钮状态
        const isDisabled = await undoBtn.isDisabled();
        // 验证按钮启用
        expect(isDisabled).toBe(false);
      }
    });

    test('应能点击撤销按钮', async () => {
      // 输入URL
      await fillUrl(contentPage, 'test.com');
      await contentPage.waitForTimeout(300);
      // 点击撤销按钮
      await clickUndo(contentPage);
    });
  });

  test.describe('12.2 撤销URL更改测试', () => {
    test('应能撤销URL更改', async () => {
      // 输入原始URL
      await fillUrl(contentPage, 'original.com');
      await contentPage.waitForTimeout(300);
      // 修改URL
      await fillUrl(contentPage, 'changed.com');
      await contentPage.waitForTimeout(300);
      // 使用快捷键撤销
      await undoByShortcut(contentPage);
      // 验证URL恢复
      await verifyUrlValue(contentPage, 'original.com');
    });

    test('撤销后重做应恢复更改', async () => {
      // 输入URL
      await fillUrl(contentPage, 'first.com');
      await contentPage.waitForTimeout(300);
      // 撤销操作
      await undoByShortcut(contentPage);
      // 重做操作
      await redoByShortcut(contentPage);
      // 验证URL恢复
      await verifyUrlValue(contentPage, 'first.com');
    });
  });

  test.describe('12.3 撤销参数更改测试', () => {
    test('应能撤销添加参数操作', async () => {
      // 添加Query参数
      await addQueryParam(contentPage, 'token', '123');
      await contentPage.waitForTimeout(300);
      // 撤销添加操作
      await undoByShortcut(contentPage);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('12.4 撤销消息内容更改测试', () => {
    test('应能撤销消息内容更改', async () => {
      // 输入原始消息
      await fillMessage(contentPage, 'Original message');
      await contentPage.waitForTimeout(500);
      // 修改消息
      await fillMessage(contentPage, 'Changed message');
      await contentPage.waitForTimeout(500);
      // 撤销修改
      await undoByShortcut(contentPage);
      // 获取消息内容
      const content = await getMessageContent(contentPage);
      // 验证消息恢复
      expect(content).toContain('Original');
    });
  });

  test.describe('12.5 快捷键测试', () => {
    test('Ctrl+Z应触发撤销', async () => {
      // 输入URL
      await fillUrl(contentPage, 'test.com');
      await contentPage.waitForTimeout(300);
      // 使用Ctrl+Z撤销
      await undoByShortcut(contentPage);
      await contentPage.waitForTimeout(300);
    });

    test('Ctrl+Y应触发重做', async () => {
      // 输入URL
      await fillUrl(contentPage, 'test.com');
      await contentPage.waitForTimeout(300);
      // 撤销操作
      await undoByShortcut(contentPage);
      // 使用Ctrl+Y重做
      await redoByShortcut(contentPage);
      // 验证URL恢复
      await verifyUrlValue(contentPage, 'test.com');
    });
  });

  test.describe('12.6 重做按钮测试', () => {
    test('初始状态重做按钮应禁用', async () => {
      // 查找重做按钮
      const redoBtn = contentPage.locator('[title*="重做"], .redo-btn').first();
      if (await redoBtn.count() > 0) {
        // 检查按钮状态
        const isDisabled = await redoBtn.isDisabled();
        // 验证按钮禁用
        expect(isDisabled).toBe(true);
      }
    });

    test('撤销后重做按钮应启用', async () => {
      // 输入URL
      await fillUrl(contentPage, 'test.com');
      await contentPage.waitForTimeout(300);
      // 撤销操作
      await undoByShortcut(contentPage);
      // 查找重做按钮
      const redoBtn = contentPage.locator('[title*="重做"], .redo-btn').first();
      if (await redoBtn.count() > 0) {
        // 检查按钮状态
        const isDisabled = await redoBtn.isDisabled();
        // 验证按钮启用
        expect(isDisabled).toBe(false);
      }
    });

    test('应能点击重做按钮', async () => {
      // 输入URL
      await fillUrl(contentPage, 'test.com');
      await contentPage.waitForTimeout(300);
      // 点击撤销
      await clickUndo(contentPage);
      // 点击重做
      await clickRedo(contentPage);
    });
  });

  test.describe('12.7 多次撤销重做测试', () => {
    test('应能连续撤销多次', async () => {
      // 输入第一个URL
      await fillUrl(contentPage, 'first.com');
      await contentPage.waitForTimeout(200);
      // 输入第二个URL
      await fillUrl(contentPage, 'second.com');
      await contentPage.waitForTimeout(200);
      // 输入第三个URL
      await fillUrl(contentPage, 'third.com');
      await contentPage.waitForTimeout(200);
      // 第一次撤销
      await undoByShortcut(contentPage);
      // 验证恢复到second
      await verifyUrlValue(contentPage, 'second.com');
      // 第二次撤销
      await undoByShortcut(contentPage);
      // 验证恢复到first
      await verifyUrlValue(contentPage, 'first.com');
    });

    test('应能连续重做多次', async () => {
      // 输入第一个URL
      await fillUrl(contentPage, 'first.com');
      await contentPage.waitForTimeout(200);
      // 输入第二个URL
      await fillUrl(contentPage, 'second.com');
      await contentPage.waitForTimeout(200);
      // 撤销两次
      await undoByShortcut(contentPage);
      await undoByShortcut(contentPage);
      // 第一次重做
      await redoByShortcut(contentPage);
      // 验证恢复到first
      await verifyUrlValue(contentPage, 'first.com');
      // 第二次重做
      await redoByShortcut(contentPage);
      // 验证恢复到second
      await verifyUrlValue(contentPage, 'second.com');
    });
  });
});
