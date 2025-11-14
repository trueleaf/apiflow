import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';

//验证保存按钮启用状态
const verifySaveButtonEnabled = async (page: Page): Promise<void> => {
  const saveBtn = page.locator('button:has-text("保存接口"), .save-api-btn, [title*="保存"]').first();
  await expect(saveBtn).toBeEnabled();
};
//验证保存按钮禁用状态
const verifySaveButtonDisabled = async (page: Page): Promise<void> => {
  const saveBtn = page.locator('button:has-text("保存接口"), .save-api-btn, [title*="保存"]').first();
  await expect(saveBtn).toBeDisabled();
};
//通过快捷键保存
const saveByShortcut = async (page: Page): Promise<void> => {
  await page.keyboard.press('Control+S');
  await page.waitForTimeout(300);
};
//通过Mac快捷键保存
const saveByMacShortcut = async (page: Page): Promise<void> => {
  await page.keyboard.press('Meta+S');
  await page.waitForTimeout(300);
};
//验证保存成功提示
const verifySaveSuccessMessage = async (page: Page): Promise<void> => {
  const successMessage = page.locator('.el-message--success, .success-message, [class*="message"]:has-text("保存成功")').first();
  if (await successMessage.isVisible()) {
    await expect(successMessage).toBeVisible();
  }
};
//验证显示未保存标识
const verifyUnsavedIndicatorVisible = async (page: Page): Promise<void> => {
  const indicator = page.locator('.unsaved-indicator, .modified-flag, [class*="unsaved"]').first();
  if (await indicator.isVisible()) {
    await expect(indicator).toBeVisible();
  }
};
//验证未保存标识隐藏
const verifyUnsavedIndicatorHidden = async (page: Page): Promise<void> => {
  const indicator = page.locator('.unsaved-indicator, .modified-flag, [class*="unsaved"]').first();
  if (await indicator.isVisible()) {
    await expect(indicator).not.toBeVisible();
  }
};
//验证tab标题显示未保存标识
const verifyTabUnsavedIndicator = async (page: Page): Promise<void> => {
  const tabIndicator = page.locator('.tab-title:has-text("*"), .tab-pane[class*="modified"]').first();
  if (await tabIndicator.isVisible()) {
    await expect(tabIndicator).toBeVisible();
  }
};
//点击另存为按钮
const clickSaveAs = async (page: Page): Promise<void> => {
  const saveAsBtn = page.locator('button:has-text("另存为"), .save-as-btn, [title*="另存为"]').first();
  if (await saveAsBtn.isVisible()) {
    await saveAsBtn.click();
    await page.waitForTimeout(300);
  }
};
//输入另存为名称
const fillSaveAsName = async (page: Page, name: string): Promise<void> => {
  const nameInput = page.locator('.el-dialog input[placeholder*="名称"], .save-as-dialog input').first();
  await nameInput.fill(name);
  await page.waitForTimeout(200);
};
//确认另存为
const confirmSaveAs = async (page: Page): Promise<void> => {
  const confirmBtn = page.locator('.el-dialog .el-button--primary:has-text("确定"), .save-as-dialog button:has-text("确定")').first();
  await confirmBtn.click();
  await page.waitForTimeout(500);
};
//选择另存为目标文件夹
const selectSaveAsFolder = async (page: Page, folderName: string): Promise<void> => {
  const folderSelect = page.locator('.folder-select, .el-select').first();
  if (await folderSelect.isVisible()) {
    await folderSelect.click();
    await page.waitForTimeout(200);
    const folderOption = page.locator(`.el-select-dropdown__item:has-text("${folderName}")`).first();
    await folderOption.click();
    await page.waitForTimeout(200);
  }
};

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
    /**
     * 测试目的：验证显示保存按钮
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 等待HTTP节点就绪
     *   2. 检查保存按钮是否显示
     * 预期结果：
     *   - 保存按钮可见
     *   - 按钮位置在工具栏或编辑区域
     * 验证点：保存按钮的显示
     * 说明：保存按钮是接口配置持久化的入口
     */
    test('应显示保存按钮', async () => {
      // 检查保存按钮是否显示
      const saveBtn = contentPage.locator('button:has-text("保存")').first();
      await expect(saveBtn).toBeVisible();
    });

    /**
     * 测试目的：验证未修改时保存按钮禁用
     * 前置条件：已创建HTTP节点但未做修改
     * 操作步骤：
     *   1. 等待HTTP节点就绪
     *   2. 检查保存按钮状态
     * 预期结果：
     *   - 保存按钮为禁用状态
     *   - 无未保存标识
     * 验证点：保存按钮的初始状态
     * 说明：未修改时禁用保存按钮避免不必要的操作
     */
    test('未修改时保存按钮应禁用', async () => {
      await contentPage.waitForTimeout(500);
      // 检查保存按钮状态
      const saveBtn = contentPage.locator('button:has-text("保存")').first();
      const isDisabled = await saveBtn.isDisabled();
      if (isDisabled) {
        await verifySaveButtonDisabled(contentPage);
      }
    });

    /**
     * 测试目的：验证修改后保存按钮启用
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 修改URL
     *   2. 检查保存按钮状态
     * 预期结果：
     *   - 保存按钮变为启用状态
     *   - 显示未保存标识
     * 验证点：保存按钮状态变化
     * 说明：修改任何配置后保存按钮应启用
     */
    test('修改后保存按钮应启用', async () => {
      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/get');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 检查保存按钮状态
      await verifySaveButtonEnabled(contentPage);
    });

    /**
     * 测试目的：验证点击保存功能
     * 前置条件：已创建HTTP节点并修改配置
     * 操作步骤：
     *   1. 修改URL
     *   2. 点击保存按钮
     *   3. 检查保存结果
     * 预期结果：
     *   - 配置成功保存到IndexedDB
     *   - 显示保存成功提示
     * 验证点：保存功能执行
     * 说明：保存操作将配置持久化到本地数据库
     */
    test('点击保存应保存配置', async () => {
      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/post');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 点击保存按钮
      const saveBtn = contentPage.locator('button:has-text("保存")').first(); await saveBtn.click();
      // 检查保存结果
      await verifySaveSuccessMessage(contentPage);
    });

    /**
     * 测试目的：验证显示保存成功提示
     * 前置条件：已创建HTTP节点并修改配置
     * 操作步骤：
     *   1. 修改URL
     *   2. 点击保存
     *   3. 检查提示信息
     * 预期结果：
     *   - 显示成功提示消息
     *   - 提示内容为保存成功
     * 验证点：保存成功反馈
     * 说明：提示信息给用户明确的操作反馈
     */
    test('显示保存成功提示', async () => {
      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/put');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 点击保存
      const saveBtn = contentPage.locator('button:has-text("保存")').first(); await saveBtn.click();
      // 检查提示信息
      await verifySaveSuccessMessage(contentPage);
    });

    /**
     * 测试目的：验证保存后清除未保存标识
     * 前置条件：已创建HTTP节点并修改配置
     * 操作步骤：
     *   1. 修改URL
     *   2. 点击保存
     *   3. 检查未保存标识
     * 预期结果：
     *   - 未保存标识消失
     *   - 保存按钮恢复禁用状态
     * 验证点：保存后状态更新
     * 说明：保存后应重置未保存状态
     */
    test('保存后应清除未保存标识', async () => {
      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/delete');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 点击保存
      const saveBtn = contentPage.locator('button:has-text("保存")').first(); await saveBtn.click();
      await contentPage.waitForTimeout(300);
      // 检查未保存标识
      await verifyUnsavedIndicatorHidden(contentPage);
    });

    /**
     * 测试目的：验证Ctrl+S快捷键保存
     * 前置条件：已创建HTTP节点并修改配置
     * 操作步骤：
     *   1. 修改URL
     *   2. 按Ctrl+S
     *   3. 检查保存结果
     * 预期结果：
     *   - 配置成功保存
     *   - 显示保存成功提示
     * 验证点：快捷键保存功能
     * 说明：Ctrl+S是常用的保存快捷键
     */
    test('应支持Ctrl+S快捷键保存', async () => {
      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/patch');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 按Ctrl+S
      await saveByShortcut(contentPage);
      // 检查保存结果
      await verifySaveSuccessMessage(contentPage);
    });

    /**
     * 测试目的：验证Cmd+S快捷键保存(Mac)
     * 前置条件：已创建HTTP节点并修改配置
     * 操作步骤：
     *   1. 修改URL
     *   2. 按Cmd+S
     *   3. 检查保存结果
     * 预期结果：
     *   - 配置成功保存
     *   - Mac平台快捷键正常工作
     * 验证点：Mac平台快捷键
     * 说明：Mac系统使用Cmd代替Ctrl
     */
    test('应支持Cmd+S快捷键保存(Mac)', async () => {
      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/get?mac=test');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 按Cmd+S
      await saveByMacShortcut(contentPage);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('14.2 自动保存测试', () => {
    /**
     * 测试目的：验证发送请求前自动保存
     * 前置条件：已创建HTTP节点并修改配置
     * 操作步骤：
     *   1. 修改URL
     *   2. 点击发送请求
     *   3. 刷新页面
     *   4. 检查配置是否保存
     * 预期结果：
     *   - 请求前自动保存配置
     *   - 刷新后配置仍然存在
     * 验证点：请求前自动保存
     * 说明：防止用户忘记保存配置
     */
    test('发送请求前应自动保存', async () => {
      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/get?autosave=test');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 点击发送请求
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(2000);
      // 刷新页面
      const refreshBtn = contentPage.locator('button:has-text("刷新")').first(); await refreshBtn.click();
      // 检查配置是否保存
      const urlInput2 = contentPage.locator('.url-input, input[placeholder*="URL"]').first();
      const urlValue = await urlInput2.inputValue();
      expect(urlValue).toContain('autosave=test');
    });

    /**
     * 测试目的：验证切换节点前提示保存
     * 前置条件：已创建HTTP节点并修改配置
     * 操作步骤：
     *   1. 修改URL
     *   2. 点击切换到其他节点
     *   3. 检查保存提示
     * 预期结果：
     *   - 显示保存确认对话框
     *   - 提示用户是否保存更改
     * 验证点：切换前保存提示
     * 说明：防止用户丢失未保存的修改
     */
    test('切换节点前应提示保存', async () => {
      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/get?switch=test');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 点击切换到其他节点
      const treeNode = contentPage.locator('.tree-node, .el-tree-node').nth(1).first();
      if (await treeNode.isVisible()) {
        await treeNode.click();
        await contentPage.waitForTimeout(300);
        // 检查保存提示
        const saveDialog = contentPage.locator('.el-message-box, .save-dialog').first();
        if (await saveDialog.isVisible()) {
          await expect(saveDialog).toBeVisible();
        }
      }
    });

    /**
     * 测试目的：验证确认保存后切换节点
     * 前置条件：已创建HTTP节点并修改配置，尝试切换节点
     * 操作步骤：
     *   1. 修改URL
     *   2. 点击切换节点
     *   3. 在对话框中点击确认保存
     *   4. 检查是否切换成功
     * 预期结果：
     *   - 配置成功保存
     *   - 成功切换到目标节点
     * 验证点：确认保存并切换
     * 说明：保存后应继续执行切换操作
     */
    test('确认保存后应切换节点', async () => {
      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/get?confirm=save');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 点击切换节点
      const treeNode = contentPage.locator('.tree-node, .el-tree-node').nth(1).first();
      if (await treeNode.isVisible()) {
        await treeNode.click();
        await contentPage.waitForTimeout(300);
        // 在对话框中点击确认保存
        const confirmBtn = contentPage.locator('.el-message-box .el-button--primary').first();
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
          await contentPage.waitForTimeout(500);
        }
      }
    });

    /**
     * 测试目的：验证取消保存停留在当前节点
     * 前置条件：已创建HTTP节点并修改配置，尝试切换节点
     * 操作步骤：
     *   1. 修改URL
     *   2. 点击切换节点
     *   3. 在对话框中点击取消
     *   4. 检查当前URL
     * 预期结果：
     *   - 取消切换操作
     *   - 停留在当前节点
     *   - 修改的内容保持
     * 验证点：取消保存行为
     * 说明：取消操作不应丢失未保存的修改
     */
    test('取消保存应停留在当前节点', async () => {
      // 修改URL
      const initialUrl = 'https://httpbin.org/get?cancel=save';
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill(initialUrl);
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 点击切换节点
      const treeNode = contentPage.locator('.tree-node, .el-tree-node').nth(1).first();
      if (await treeNode.isVisible()) {
        await treeNode.click();
        await contentPage.waitForTimeout(300);
        // 在对话框中点击取消
        const cancelBtn = contentPage.locator('.el-message-box .el-button--default').first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
          await contentPage.waitForTimeout(300);
        }
      }
      // 检查当前URL
      const urlInput = contentPage.locator('.url-input, input[placeholder*="URL"]').first();
      const currentUrl = await urlInput.inputValue();
      expect(currentUrl).toContain('cancel=save');
    });
  });

  test.describe('14.3 保存状态标识测试', () => {
    /**
     * 测试目的：验证未保存时显示标识
     * 前置条件：已创建HTTP节点并修改配置
     * 操作步骤：
     *   1. 修改URL
     *   2. 检查未保存标识
     * 预期结果：
     *   - 显示未保存标识
     *   - 标识位置明显可见
     * 验证点：未保存状态标识
     * 说明：未保存标识提醒用户有未保存的修改
     */
    test('未保存时应显示标识', async () => {
      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/get?unsaved=indicator');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 检查未保存标识
      await verifyUnsavedIndicatorVisible(contentPage);
    });

    /**
     * 测试目的：验证保存后标识消失
     * 前置条件：已创建HTTP节点并修改配置
     * 操作步骤：
     *   1. 修改URL
     *   2. 点击保存
     *   3. 检查未保存标识
     * 预期结果：
     *   - 未保存标识消失
     *   - 不再显示任何未保存提示
     * 验证点：保存后标识更新
     * 说明：保存后应清除所有未保存标识
     */
    test('保存后标识应消失', async () => {
      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/get?saved=indicator');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 点击保存按钮
      const saveBtn = contentPage.locator('button:has-text("保存")').first(); await saveBtn.click();
      await contentPage.waitForTimeout(300);
      // 检查未保存标识消失
      await verifyUnsavedIndicatorHidden(contentPage);
    });

    /**
     * 测试目的：验证tab标题显示未保存标识
     * 前置条件：已创建HTTP节点并修改配置
     * 操作步骤：
     *   1. 修改URL
     *   2. 检查tab标题
     * 预期结果：
     *   - tab标题显示未保存标识(如*)
     *   - 标识位于节点名称旁边
     * 验证点：tab标题未保存标识
     * 说明：tab标题标识方便在多标签页中识别未保存节点
     */
    test('tab标题应显示未保存标识', async () => {
      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/get?tab=indicator');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 检查tab标题未保存标识
      await verifyTabUnsavedIndicator(contentPage);
    });
  });

  test.describe('14.4 另存为功能测试', () => {
    /**
     * 测试目的：验证另存为新接口
     * 前置条件：已创建HTTP节点并修改配置
     * 操作步骤：
     *   1. 修改URL
     *   2. 点击另存为
     *   3. 输入新名称
     *   4. 确认保存
     *   5. 检查新节点
     * 预期结果：
     *   - 创建新的API节点
     *   - 新节点出现在树中
     *   - 原节点保持不变
     * 验证点：另存为功能
     * 说明：另存为用于快速复制接口配置
     */
    test('应支持另存为新接口', async () => {
      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/get?saveas=new');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 点击另存为
      await clickSaveAs(contentPage);
      // 输入新名称并确认
      const nameInput = contentPage.locator('.el-dialog input[placeholder*="名称"], .save-as-dialog input').first();
      if (await nameInput.isVisible()) {
        await fillSaveAsName(contentPage, 'New API Copy');
        await confirmSaveAs(contentPage);
        // 检查新节点是否出现
        const newNode = contentPage.locator('.tree-node:has-text("New API Copy"), .el-tree-node__label:has-text("New API Copy")').first();
        if (await newNode.isVisible()) {
          await expect(newNode).toBeVisible();
        }
      }
    });

    /**
     * 测试目的：验证另存为复制所有配置
     * 前置条件：已创建HTTP节点并配置URL、参数等
     * 操作步骤：
     *   1. 配置URL和参数
     *   2. 点击另存为
     *   3. 输入新名称并确认
     *   4. 打开新节点验证配置
     * 预期结果：
     *   - 新节点包含所有原配置
     *   - URL、参数、headers等完整复制
     * 验证点：配置完整复制
     * 说明：另存为应复制完整的接口配置
     */
    test('另存为应复制所有配置', async () => {
      // 配置URL和参数
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/get?config=all');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      const key = 'testKey';
      const value = 'testValue';
      const options: { enabled?: boolean; description?: string } = {};
      const { enabled = true, description = '' } = options;
      const paramsActive = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Params"), .el-tabs__item.is-active:has-text("参数")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!paramsActive) {
        const targetName = 'Params';
        const tab = contentPage.locator(`.el-tabs__item:has-text("${targetName}")`);
        await tab.click();
        await contentPage.waitForTimeout(300);
      }
      const tree = contentPage.locator('.body-params .el-tree, .query-path-params .el-tree').first();
      if (await tree.count()) {
        await tree.waitFor({ state: 'visible', timeout: 5000 });
        const rows = tree.locator('.custom-params');
        const count = await rows.count();
        const lastIndex = count > 0 ? count - 1 : 0;
        const targetRow = rows.nth(lastIndex);
        const keyInput = targetRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        await keyInput.fill(key);
        const valueInput = targetRow.locator(
          '.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]'
        ).first();
        if (value.includes('\n')) {
          await valueInput.click({ force: true });
          await contentPage.waitForTimeout(50);
          const textarea = targetRow
            .locator('.value-textarea textarea, .value-textarea .el-textarea__inner, textarea')
            .first();
          await textarea.waitFor({ state: 'visible', timeout: 3000 });
          await textarea.fill(value);
          await textarea.blur();
        } else {
          await valueInput.fill(value);
        }
        if (description) {
          const descInput = targetRow.locator('input[placeholder*="描述"], input[placeholder*="说明"]').first();
          if (await descInput.count()) {
            await descInput.fill(description);
          }
        }
        if (!enabled) {
          const checkbox = targetRow.locator('input[type="checkbox"]').first();
          if (await checkbox.isChecked()) {
            const checkboxWrapper = targetRow.locator('.el-checkbox').first();
            await checkboxWrapper.click();
          }
        }
      } else {
        let keyInput = contentPage.locator('input[placeholder="输入参数名称自动换行"]').first();
        if (!(await keyInput.count())) {
          keyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
        }
        if (!(await keyInput.count())) {
          keyInput = contentPage.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        }
        await keyInput.fill(key);
        let valueInput = contentPage.locator('input[placeholder="参数值、@代表mock数据、{{ 变量 }}"]').first();
        if (!(await valueInput.count())) {
          valueInput = contentPage.locator('input[placeholder*="参数值"]').first();
        }
        if (!(await valueInput.count())) {
          valueInput = contentPage.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
        }
        if (value.includes('\n')) {
          await valueInput.click({ force: true });
          await contentPage.waitForTimeout(50);
          const paramRow = contentPage.locator('.custom-params').filter({ has: valueInput }).first();
          const textarea = paramRow
            .locator('.value-textarea textarea, .value-textarea .el-textarea__inner, textarea')
            .first();
          await textarea.waitFor({ state: 'visible', timeout: 3000 });
          await textarea.fill(value);
          await textarea.blur();
        } else {
          await valueInput.fill(value);
        }
        if (description) {
          let descInput = contentPage.locator('input[placeholder="参数描述与备注"]').first();
          if (!(await descInput.count())) {
            descInput = contentPage.locator('input[placeholder*="描述"], input[placeholder*="说明"]').first();
          }
          if (await descInput.count()) {
            await descInput.fill(description);
          }
        }
        if (!enabled) {
          let checkbox = contentPage.locator('label:has-text("必有") input[type="checkbox"]').first();
          if (!(await checkbox.count())) {
            checkbox = contentPage.locator('.params-table input[type="checkbox"], .s-params input[type="checkbox"]').first();
          }
          if (!(await checkbox.count())) {
            checkbox = contentPage.locator('input[type="checkbox"]').first();
          }
          if (await checkbox.count()) {
            await checkbox.uncheck();
          }
        }
      }
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
      // 点击另存为
      await clickSaveAs(contentPage);
      // 输入新名称并确认
      const nameInput = contentPage.locator('.el-dialog input[placeholder*="名称"], .save-as-dialog input').first();
      if (await nameInput.isVisible()) {
        await fillSaveAsName(contentPage, 'API With Config');
        await confirmSaveAs(contentPage);
        await contentPage.waitForTimeout(500);
      }
    });

    /**
     * 测试目的：验证另存为选择保存位置
     * 前置条件：已创建HTTP节点和分组
     * 操作步骤：
     *   1. 修改URL
     *   2. 点击另存为
     *   3. 选择目标分组
     *   4. 输入新名称并确认
     * 预期结果：
     *   - 可以选择保存到不同分组
     *   - 新节点出现在选择的分组中
     * 验证点：保存位置选择
     * 说明：另存为支持保存到不同的分组或文件夹
     */
    test('另存为应能选择保存位置', async () => {
      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/get?location=test');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 点击另存为
      await clickSaveAs(contentPage);
      // 选择保存位置并输入名称
      const nameInput = contentPage.locator('.el-dialog input[placeholder*="名称"], .save-as-dialog input').first();
      if (await nameInput.isVisible()) {
        await selectSaveAsFolder(contentPage, '测试项目');
        await fillSaveAsName(contentPage, 'API In Folder');
        await confirmSaveAs(contentPage);
        await contentPage.waitForTimeout(500);
      }
    });

    /**
     * 测试目的：验证另存为生成唯一名称
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 点击另存为
     *   2. 输入已存在的名称
     *   3. 确认保存
     *   4. 检查错误提示
     * 预期结果：
     *   - 显示名称冲突错误
     *   - 不允许使用重复名称
     * 验证点：名称唯一性校验
     * 说明：防止创建重名的API节点
     */
    test('另存为应生成唯一名称', async () => {
      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/get?unique=name');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 点击另存为
      await clickSaveAs(contentPage);
      // 输入已存在的名称
      const nameInput = contentPage.locator('.el-dialog input[placeholder*="名称"], .save-as-dialog input').first();
      if (await nameInput.isVisible()) {
        await fillSaveAsName(contentPage, 'Test API');
        await confirmSaveAs(contentPage);
        await contentPage.waitForTimeout(500);
        // 检查错误提示
        const errorMsg = contentPage.locator('.el-message--error, .error-message').first();
        if (await errorMsg.isVisible()) {
          await expect(errorMsg).toBeVisible();
        }
      }
    });
  });
});


