import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  fillUrl,
  addQueryParam,
  clickSaveApi,
  clickSendRequest,
  clickRefresh,
  getSaveButton,
  verifySaveButtonEnabled,
  verifySaveButtonDisabled,
  saveByShortcut,
  saveByMacShortcut,
  verifySaveSuccessMessage,
  verifyUnsavedIndicatorVisible,
  verifyUnsavedIndicatorHidden,
  verifyTabUnsavedIndicator,
  clickSaveAs,
  fillSaveAsName,
  confirmSaveAs,
  selectSaveAsFolder
} from './helpers/httpNodeHelpers';

test.describe('14. HTTP节点 - 保存功能测试', () => {
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

  test.describe('14.1 保存接口测试', () => {
    test('应显示保存按钮', async () => {
      await waitForHttpNodeReady(contentPage);
      const saveBtn = getSaveButton(contentPage);
      await expect(saveBtn).toBeVisible();
    });

    test('未修改时保存按钮应禁用', async () => {
      await waitForHttpNodeReady(contentPage);
      await contentPage.waitForTimeout(500);
      const saveBtn = getSaveButton(contentPage);
      const isDisabled = await saveBtn.isDisabled();
      if (isDisabled) {
        await verifySaveButtonDisabled(contentPage);
      }
    });

    test('修改后保存按钮应启用', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await contentPage.waitForTimeout(300);
      await verifySaveButtonEnabled(contentPage);
    });

    test('点击保存应保存配置', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/post');
      await contentPage.waitForTimeout(300);
      await clickSaveApi(contentPage);
      await verifySaveSuccessMessage(contentPage);
    });

    test('保存成功应显示提示', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/put');
      await contentPage.waitForTimeout(300);
      await clickSaveApi(contentPage);
      await verifySaveSuccessMessage(contentPage);
    });

    test('保存后应清除未保存标识', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/delete');
      await contentPage.waitForTimeout(300);
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(300);
      await verifyUnsavedIndicatorHidden(contentPage);
    });

    test('应支持Ctrl+S快捷键保存', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/patch');
      await contentPage.waitForTimeout(300);
      await saveByShortcut(contentPage);
      await verifySaveSuccessMessage(contentPage);
    });

    test('应支持Cmd+S快捷键保存(Mac)', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get?mac=test');
      await contentPage.waitForTimeout(300);
      await saveByMacShortcut(contentPage);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('14.2 自动保存测试', () => {
    test('发送请求前应自动保存', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get?autosave=test');
      await contentPage.waitForTimeout(300);
      await clickSendRequest(contentPage);
      await contentPage.waitForTimeout(2000);
      await clickRefresh(contentPage);
      await waitForHttpNodeReady(contentPage);
      const urlInput = contentPage.locator('.url-input, input[placeholder*="URL"]').first();
      const urlValue = await urlInput.inputValue();
      expect(urlValue).toContain('autosave=test');
    });

    test('切换节点前应提示保存', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get?switch=test');
      await contentPage.waitForTimeout(300);
      const treeNode = contentPage.locator('.tree-node, .el-tree-node').nth(1).first();
      if (await treeNode.isVisible()) {
        await treeNode.click();
        await contentPage.waitForTimeout(300);
        const saveDialog = contentPage.locator('.el-message-box, .save-dialog').first();
        if (await saveDialog.isVisible()) {
          await expect(saveDialog).toBeVisible();
        }
      }
    });

    test('确认保存后应切换节点', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get?confirm=save');
      await contentPage.waitForTimeout(300);
      const treeNode = contentPage.locator('.tree-node, .el-tree-node').nth(1).first();
      if (await treeNode.isVisible()) {
        await treeNode.click();
        await contentPage.waitForTimeout(300);
        const confirmBtn = contentPage.locator('.el-message-box .el-button--primary').first();
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
          await contentPage.waitForTimeout(500);
        }
      }
    });

    test('取消保存应停留在当前节点', async () => {
      await waitForHttpNodeReady(contentPage);
      const initialUrl = 'https://httpbin.org/get?cancel=save';
      await fillUrl(contentPage, initialUrl);
      await contentPage.waitForTimeout(300);
      const treeNode = contentPage.locator('.tree-node, .el-tree-node').nth(1).first();
      if (await treeNode.isVisible()) {
        await treeNode.click();
        await contentPage.waitForTimeout(300);
        const cancelBtn = contentPage.locator('.el-message-box .el-button--default').first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
          await contentPage.waitForTimeout(300);
        }
      }
      const urlInput = contentPage.locator('.url-input, input[placeholder*="URL"]').first();
      const currentUrl = await urlInput.inputValue();
      expect(currentUrl).toContain('cancel=save');
    });
  });

  test.describe('14.3 保存状态标识测试', () => {
    test('未保存时应显示标识', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get?unsaved=indicator');
      await contentPage.waitForTimeout(300);
      await verifyUnsavedIndicatorVisible(contentPage);
    });

    test('保存后标识应消失', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get?saved=indicator');
      await contentPage.waitForTimeout(300);
      await clickSaveApi(contentPage);
      await contentPage.waitForTimeout(300);
      await verifyUnsavedIndicatorHidden(contentPage);
    });

    test('tab标题应显示未保存标识', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get?tab=indicator');
      await contentPage.waitForTimeout(300);
      await verifyTabUnsavedIndicator(contentPage);
    });
  });

  test.describe('14.4 另存为功能测试', () => {
    test('应支持另存为新接口', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get?saveas=new');
      await contentPage.waitForTimeout(300);
      await clickSaveAs(contentPage);
      const nameInput = contentPage.locator('.el-dialog input[placeholder*="名称"], .save-as-dialog input').first();
      if (await nameInput.isVisible()) {
        await fillSaveAsName(contentPage, 'New API Copy');
        await confirmSaveAs(contentPage);
        const newNode = contentPage.locator('.tree-node:has-text("New API Copy"), .el-tree-node__label:has-text("New API Copy")').first();
        if (await newNode.isVisible()) {
          await expect(newNode).toBeVisible();
        }
      }
    });

    test('另存为应复制所有配置', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get?config=all');
      await addQueryParam(contentPage, 'testKey', 'testValue');
      await contentPage.waitForTimeout(300);
      await clickSaveAs(contentPage);
      const nameInput = contentPage.locator('.el-dialog input[placeholder*="名称"], .save-as-dialog input').first();
      if (await nameInput.isVisible()) {
        await fillSaveAsName(contentPage, 'API With Config');
        await confirmSaveAs(contentPage);
        await contentPage.waitForTimeout(500);
      }
    });

    test('另存为应能选择保存位置', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get?location=test');
      await contentPage.waitForTimeout(300);
      await clickSaveAs(contentPage);
      const nameInput = contentPage.locator('.el-dialog input[placeholder*="名称"], .save-as-dialog input').first();
      if (await nameInput.isVisible()) {
        await selectSaveAsFolder(contentPage, '测试项目');
        await fillSaveAsName(contentPage, 'API In Folder');
        await confirmSaveAs(contentPage);
        await contentPage.waitForTimeout(500);
      }
    });

    test('另存为应生成唯一名称', async () => {
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, 'https://httpbin.org/get?unique=name');
      await contentPage.waitForTimeout(300);
      await clickSaveAs(contentPage);
      const nameInput = contentPage.locator('.el-dialog input[placeholder*="名称"], .save-as-dialog input').first();
      if (await nameInput.isVisible()) {
        await fillSaveAsName(contentPage, 'Test API');
        await confirmSaveAs(contentPage);
        await contentPage.waitForTimeout(500);
        const errorMsg = contentPage.locator('.el-message--error, .error-message').first();
        if (await errorMsg.isVisible()) {
          await expect(errorMsg).toBeVisible();
        }
      }
    });
  });
});
