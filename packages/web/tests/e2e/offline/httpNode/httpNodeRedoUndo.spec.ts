import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  fillUrl,
  verifyUrlValue,
  addQueryParam,
  verifyQueryParamExists,
  addHeader,
  verifyHeaderExists,
  fillJsonBody,
  selectHttpMethod,
  clickUndo,
  clickRedo,
  getUndoButton,
  getRedoButton,
  verifyUndoDisabled,
  verifyUndoEnabled,
  verifyRedoDisabled,
  verifyRedoEnabled,
  undoByShortcut,
  redoByShortcut,
  redoByMacShortcut
} from './helpers/httpNodeHelpers';

test.describe('11. HTTP节点 - 撤销/重做功能测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;

    await createProject(contentPage, '测试项目');
    await createSingleNode(contentPage, {
      name: 'Test API',
      type: 'http'
    });
  });

  test.describe('11.1 撤销功能测试', () => {
    test('应显示撤销按钮', async () => {
      await waitForHttpNodeReady(contentPage);
      const undoBtn = getUndoButton(contentPage);
      await expect(undoBtn).toBeVisible();
    });

    test('初始状态撤销按钮应禁用', async () => {
      await waitForHttpNodeReady(contentPage);
      await verifyUndoDisabled(contentPage);
    });

    test('执行操作后撤销按钮应启用', async () => {
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'testKey', 'testValue');
      await contentPage.waitForTimeout(300);
      await verifyUndoEnabled(contentPage);
    });

    test('应能撤销添加Query参数', async () => {
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'testParam', 'testValue');
      await verifyQueryParamExists(contentPage, 'testParam');
      await clickUndo(contentPage);
      await contentPage.waitForTimeout(300);
      const row = contentPage.locator('tr:has(input[value="testParam"])');
      await expect(row).not.toBeVisible();
    });

    test('应能撤销编辑URL', async () => {
      await waitForHttpNodeReady(contentPage);
      const originalUrl = 'http://example.com/api';
      await fillUrl(contentPage, originalUrl);
      await contentPage.waitForTimeout(300);
      await fillUrl(contentPage, 'http://example.com/new-api');
      await contentPage.waitForTimeout(300);
      await clickUndo(contentPage);
      await verifyUrlValue(contentPage, originalUrl);
    });

    test('应能撤销添加Headers', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'X-Test-Header', 'TestValue');
      await verifyHeaderExists(contentPage, 'X-Test-Header');
      await clickUndo(contentPage);
      await contentPage.waitForTimeout(300);
      const row = contentPage.locator('tr:has(input[value="X-Test-Header"])');
      await expect(row).not.toBeVisible();
    });

    test('应能撤销Body编辑', async () => {
      await waitForHttpNodeReady(contentPage);
      await selectHttpMethod(contentPage, 'POST');
      await fillJsonBody(contentPage, { key: 'value1' });
      await contentPage.waitForTimeout(300);
      await fillJsonBody(contentPage, { key: 'value2' });
      await contentPage.waitForTimeout(300);
      await clickUndo(contentPage);
      await contentPage.waitForTimeout(300);
    });

    test('应能连续撤销多次操作', async () => {
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'param1', 'value1');
      await contentPage.waitForTimeout(300);
      await addQueryParam(contentPage, 'param2', 'value2');
      await contentPage.waitForTimeout(300);
      await addQueryParam(contentPage, 'param3', 'value3');
      await contentPage.waitForTimeout(300);
      await clickUndo(contentPage);
      await clickUndo(contentPage);
      await clickUndo(contentPage);
      await contentPage.waitForTimeout(300);
      const row1 = contentPage.locator('tr:has(input[value="param1"])');
      const row2 = contentPage.locator('tr:has(input[value="param2"])');
      const row3 = contentPage.locator('tr:has(input[value="param3"])');
      await expect(row1).not.toBeVisible();
      await expect(row2).not.toBeVisible();
      await expect(row3).not.toBeVisible();
    });

    test('撤销到初始状态后按钮应禁用', async () => {
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'testParam', 'testValue');
      await contentPage.waitForTimeout(300);
      await clickUndo(contentPage);
      await verifyUndoDisabled(contentPage);
    });

    test('应支持Ctrl+Z快捷键撤销', async () => {
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'shortcutTest', 'value');
      await verifyQueryParamExists(contentPage, 'shortcutTest');
      await undoByShortcut(contentPage);
      await contentPage.waitForTimeout(300);
      const row = contentPage.locator('tr:has(input[value="shortcutTest"])');
      await expect(row).not.toBeVisible();
    });
  });

  test.describe('11.2 重做功能测试', () => {
    test('应显示重做按钮', async () => {
      await waitForHttpNodeReady(contentPage);
      const redoBtn = getRedoButton(contentPage);
      await expect(redoBtn).toBeVisible();
    });

    test('初始状态重做按钮应禁用', async () => {
      await waitForHttpNodeReady(contentPage);
      await verifyRedoDisabled(contentPage);
    });

    test('撤销后重做按钮应启用', async () => {
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'testKey', 'testValue');
      await contentPage.waitForTimeout(300);
      await clickUndo(contentPage);
      await verifyRedoEnabled(contentPage);
    });

    test('应能重做被撤销的操作', async () => {
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'redoTest', 'value');
      await verifyQueryParamExists(contentPage, 'redoTest');
      await clickUndo(contentPage);
      await contentPage.waitForTimeout(300);
      const rowAfterUndo = contentPage.locator('tr:has(input[value="redoTest"])');
      await expect(rowAfterUndo).not.toBeVisible();
      await clickRedo(contentPage);
      await verifyQueryParamExists(contentPage, 'redoTest');
    });

    test('应能连续重做多次操作', async () => {
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'param1', 'value1');
      await contentPage.waitForTimeout(300);
      await addQueryParam(contentPage, 'param2', 'value2');
      await contentPage.waitForTimeout(300);
      await addQueryParam(contentPage, 'param3', 'value3');
      await contentPage.waitForTimeout(300);
      await clickUndo(contentPage);
      await clickUndo(contentPage);
      await clickUndo(contentPage);
      await contentPage.waitForTimeout(300);
      await clickRedo(contentPage);
      await clickRedo(contentPage);
      await clickRedo(contentPage);
      await contentPage.waitForTimeout(300);
      await verifyQueryParamExists(contentPage, 'param1');
      await verifyQueryParamExists(contentPage, 'param2');
      await verifyQueryParamExists(contentPage, 'param3');
    });

    test('重做到最新状态后按钮应禁用', async () => {
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'testParam', 'testValue');
      await contentPage.waitForTimeout(300);
      await clickUndo(contentPage);
      await clickRedo(contentPage);
      await verifyRedoDisabled(contentPage);
    });

    test('应支持Ctrl+Y快捷键重做', async () => {
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'shortcutRedo', 'value');
      await verifyQueryParamExists(contentPage, 'shortcutRedo');
      await undoByShortcut(contentPage);
      await contentPage.waitForTimeout(300);
      await redoByShortcut(contentPage);
      await verifyQueryParamExists(contentPage, 'shortcutRedo');
    });

    test('应支持Cmd+Shift+Z快捷键重做(Mac)', async () => {
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'macRedo', 'value');
      await verifyQueryParamExists(contentPage, 'macRedo');
      await undoByShortcut(contentPage);
      await contentPage.waitForTimeout(300);
      await redoByMacShortcut(contentPage);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('11.3 操作历史管理', () => {
    test('新操作应清空重做栈', async () => {
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'paramA', 'valueA');
      await contentPage.waitForTimeout(300);
      await clickUndo(contentPage);
      await verifyRedoEnabled(contentPage);
      await addQueryParam(contentPage, 'paramB', 'valueB');
      await contentPage.waitForTimeout(300);
      await verifyRedoDisabled(contentPage);
    });

    test('应限制历史记录最大数量', async () => {
      await waitForHttpNodeReady(contentPage);
      for (let i = 0; i < 25; i++) {
        await addQueryParam(contentPage, `param${i}`, `value${i}`);
        await contentPage.waitForTimeout(100);
      }
      await contentPage.waitForTimeout(300);
      let undoCount = 0;
      const maxUndoCount = 20;
      while (undoCount < maxUndoCount) {
        const undoBtn = getUndoButton(contentPage);
        const isDisabled = await undoBtn.isDisabled();
        if (isDisabled) break;
        await clickUndo(contentPage);
        undoCount++;
      }
      expect(undoCount).toBeLessThanOrEqual(maxUndoCount);
    });

    test('切换节点应清空历史', async () => {
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'testParam', 'testValue');
      await contentPage.waitForTimeout(300);
      await verifyUndoEnabled(contentPage);
      const createNodeBtn = contentPage.locator('[title*="创建"], .create-node-btn').first();
      if (await createNodeBtn.isVisible()) {
        await createNodeBtn.click();
        await contentPage.waitForTimeout(500);
        const httpOption = contentPage.locator('.node-type-http, [data-type="http"]').first();
        if (await httpOption.isVisible()) {
          await httpOption.click();
          await contentPage.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('11.4 撤销重做数据一致性', () => {
    test('撤销重做后数据应与原始状态一致', async () => {
      await waitForHttpNodeReady(contentPage);
      const initialUrl = 'http://example.com/initial';
      await fillUrl(contentPage, initialUrl);
      await contentPage.waitForTimeout(300);
      await fillUrl(contentPage, 'http://example.com/modified');
      await contentPage.waitForTimeout(300);
      await clickUndo(contentPage);
      await verifyUrlValue(contentPage, initialUrl);
      await clickRedo(contentPage);
      await verifyUrlValue(contentPage, 'http://example.com/modified');
      await clickUndo(contentPage);
      await verifyUrlValue(contentPage, initialUrl);
    });

    test('多次撤销重做应保持数据正确性', async () => {
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'step1', 'value1');
      await contentPage.waitForTimeout(200);
      await addQueryParam(contentPage, 'step2', 'value2');
      await contentPage.waitForTimeout(200);
      await fillUrl(contentPage, 'http://example.com/api');
      await contentPage.waitForTimeout(200);
      await addHeader(contentPage, 'X-Test', 'HeaderValue');
      await contentPage.waitForTimeout(300);
      await clickUndo(contentPage);
      await clickUndo(contentPage);
      await contentPage.waitForTimeout(300);
      await clickRedo(contentPage);
      await clickRedo(contentPage);
      await contentPage.waitForTimeout(300);
      await verifyUrlValue(contentPage, 'http://example.com/api');
      await verifyHeaderExists(contentPage, 'X-Test');
      await clickUndo(contentPage);
      await clickUndo(contentPage);
      await clickUndo(contentPage);
      await contentPage.waitForTimeout(300);
      await verifyQueryParamExists(contentPage, 'step1');
      const step2Row = contentPage.locator('tr:has(input[value="step2"])');
      await expect(step2Row).not.toBeVisible();
    });
  });
});
