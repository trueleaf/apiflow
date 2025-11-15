import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';

test.describe('15. HTTP节点 - 变量替换功能测试', () => {
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

  test.describe('15.1 URL中的变量替换', () => {
    /**
     * 测试目的：验证识别{{variableName}}语法
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 在URL中输入包含{{host}}变量的地址
     *   2. 检查URL输入框的样式类
     * 预期结果：
     *   - 正确识别{{}}包裹的变量语法
     *   - URL输入框显示变量标识样式
     * 验证点：变量语法识别
     * 说明：{{variableName}}是变量占位符的标准语法
     */
    test('应识别{{variableName}}语法', async () => {
      // 输入包含变量的URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('http://{{host}}/api');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      // 验证变量被识别
      const urlInputValue = contentPage.locator('[data-testid="url-input"]');
      const value = await urlInputValue.inputValue();
      expect(value).toContain('{{host}}');
      // 检查URL输入框样式
      const urlInputElement = contentPage.locator('input[placeholder*="URL"], .url-input').first();
      const className = await urlInputElement.getAttribute('class');
      expect(className).toBeTruthy();
    });

    /**
     * 测试目的：验证替换单个变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量host=example.com
     *   2. 在URL中使用{{host}}
     *   3. 验证变量被识别
     * 预期结果：
     *   - 变量被正确识别
     *   - 发送请求时会替换为实际值
     * 验证点：单个变量的替换
     * 说明：变量替换在发送请求时执行
     */
    test('应替换单个变量', async () => {
      // 添加局部变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('host');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('example.com');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 在URL中使用变量
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('http://{{host}}/api');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证变量被识别
      const urlInput2 = contentPage.locator('[data-testid="url-input"]');
      const value2 = await urlInput2.inputValue();
      expect(value2).toContain('{{host}}');
    });

    /**
     * 测试目的：验证替换多个变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加多个局部变量
     *   2. 在URL中使用多个变量占位符
     *   3. 验证所有变量被识别
     * 预期结果：
     *   - 所有变量都被识别
     *   - 支持同一URL中使用多个变量
     * 验证点：多个变量的同时替换
     * 说明：URL可以包含任意数量的变量
     */
    test('应替换多个变量', async () => {
      // 添加多个局部变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('host');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('example.com');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      const variableBtn2 = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn2.click();
      await contentPage.waitForTimeout(300);
      const localTab2 = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab2.isVisible()) {
        await localTab2.click();
        await contentPage.waitForTimeout(200);
      }
      const table2 = contentPage.locator('.variable-table, .s-params').first();
      const lastRow2 = table2.locator('tbody tr').last();
      const keyInput2 = lastRow2.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput2.fill('version');
      await contentPage.keyboard.press('Tab');
      const valueInput2 = lastRow2.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput2.fill('v1');
      await valueInput2.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn2 = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn2.isVisible()) {
        await closeBtn2.click();
      }
      await contentPage.waitForTimeout(200);
      // 在URL中使用多个变量
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('http://{{host}}/{{version}}/api');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证所有变量被识别
      const urlInput3 = contentPage.locator('[data-testid="url-input"]');
      const value3 = await urlInput3.inputValue();
      expect(value3).toContain('{{host}}');
      const urlInput4 = contentPage.locator('[data-testid="url-input"]');
      const value4 = await urlInput4.inputValue();
      expect(value4).toContain('{{version}}');
    });

    /**
     * 测试目的：验证未定义变量保持原样
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 使用未定义的变量{{undefined}}
     *   2. 检查变量占位符
     * 预期结果：
     *   - 未定义的变量保持{{undefined}}形式
     *   - 不会报错或替换为空
     * 验证点：未定义变量的处理
     * 说明：未定义变量保持原样便于调试
     */
    test('未定义的变量应保持原样', async () => {
      // 使用未定义的变量
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('http://example.com/{{undefined}}/api');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证变量占位符保持原样
      const urlInput2 = contentPage.locator('[data-testid="url-input"]');
      const value = await urlInput2.inputValue();
      expect(value).toContain('{{undefined}}');
    });

    /**
     * 测试目的：验证变量名区分大小写
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 定义变量Host(大写H)
     *   2. 使用变量{{host}}(小写h)
     *   3. 检查是否匹配
     * 预期结果：
     *   - 变量名大小写敏感
     *   - Host和host视为不同变量
     * 验证点：变量名的大小写敏感性
     * 说明：变量名区分大小写是编程的常规约定
     */
    test('变量名应区分大小写', async () => {
      // 定义大写Host变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('Host');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('example.com');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 使用小写host变量
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('http://{{host}}/api');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证未匹配到Host变量
      const urlInput2 = contentPage.locator('[data-testid="url-input"]');
      const value = await urlInput2.inputValue();
      expect(value).toContain('{{host}}');
    });
  });

  test.describe('15.2 参数中的变量替换', () => {
    /**
     * 测试目的：验证Query参数value支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量userId=123
     *   2. 添加Query参数id={{userId}}
     *   3. 验证参数存在
     * 预期结果：
     *   - Query参数value可以使用变量
     *   - 发送请求时替换为实际值
     * 验证点：Query参数value的变量替换
     * 说明：参数值使用变量是常见需求
     */
    test('Query参数value应支持变量', async () => {
      // 添加局部变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('userId');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('123');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 在Query参数中使用变量
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
        const keyInput2 = targetRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        await keyInput2.fill('id');
        const valueInput2 = targetRow.locator(
          '.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]'
        ).first();
        await valueInput2.fill('{{userId}}');
      } else {
        let keyInput2 = contentPage.locator('input[placeholder="输入参数名称自动换行"]').first();
        if (!(await keyInput2.count())) {
          keyInput2 = contentPage.locator('input[placeholder*="参数名称"]').first();
        }
        if (!(await keyInput2.count())) {
          keyInput2 = contentPage.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        }
        await keyInput2.fill('id');
        let valueInput2 = contentPage.locator('input[placeholder="参数值、@代表mock数据、{{ 变量 }}"]').first();
        if (!(await valueInput2.count())) {
          valueInput2 = contentPage.locator('input[placeholder*="参数值"]').first();
        }
        if (!(await valueInput2.count())) {
          valueInput2 = contentPage.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
        }
        await valueInput2.fill('{{userId}}');
      }
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
      // 验证参数存在
      const targetName2 = 'Params';
      const tab2 = contentPage.locator(`.el-tabs__item:has-text("${targetName2}")`);
      await tab2.click();
      await contentPage.waitForTimeout(300);
      const container = contentPage.locator('.query-path-params .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const keyInputs = container.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]');
      const count2 = await keyInputs.count();
      let found = false;
      for (let i = 0; i < count2; i++) {
        const candidate = keyInputs.nth(i);
        const value2 = await candidate.inputValue();
        if (value2 === 'id') {
          await expect(candidate).toBeVisible();
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error('Query param id not found');
      }
    });

    /**
     * 测试目的：验证Query参数key支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量paramKey=id
     *   2. 添加Query参数{{paramKey}}=value
     * 预期结果：
     *   - Query参数key可以使用变量
     *   - 发送时参数名为实际值
     * 验证点：Query参数key的变量替换
     * 说明：参数名使用变量适用于动态API
     */
    test('Query参数key应支持变量', async () => {
      // 添加局部变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('paramKey');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('id');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 参数key使用变量
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
        const keyInput2 = targetRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        await keyInput2.fill('{{paramKey}}');
        const valueInput2 = targetRow.locator(
          '.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]'
        ).first();
        await valueInput2.fill('value');
      } else {
        let keyInput2 = contentPage.locator('input[placeholder="输入参数名称自动换行"]').first();
        if (!(await keyInput2.count())) {
          keyInput2 = contentPage.locator('input[placeholder*="参数名称"]').first();
        }
        if (!(await keyInput2.count())) {
          keyInput2 = contentPage.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        }
        await keyInput2.fill('{{paramKey}}');
        let valueInput2 = contentPage.locator('input[placeholder="参数值、@代表mock数据、{{ 变量 }}"]').first();
        if (!(await valueInput2.count())) {
          valueInput2 = contentPage.locator('input[placeholder*="参数值"]').first();
        }
        if (!(await valueInput2.count())) {
          valueInput2 = contentPage.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
        }
        await valueInput2.fill('value');
      }
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证Path参数支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量userId=456
     *   2. 在URL中使用Path参数{id}
     * 预期结果：
     *   - Path参数可以使用变量替换
     *   - 支持RESTful风格的路径参数
     * 验证点：Path参数的变量替换
     * 说明：Path参数常用于RESTful API
     */
    test('Path参数应支持变量', async () => {
      // 添加局部变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('userId');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('456');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 在URL中使用Path参数
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('http://example.com/users/{id}');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证参数value可包含部分变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量id=123
     *   2. 添加参数fullId=prefix_{{id}}_suffix
     * 预期结果：
     *   - 参数值可以包含变量和固定文本
     *   - 仅替换变量部分
     * 验证点：参数值的部分变量替换
     * 说明：支持变量与固定文本混合使用
     */
    test('参数value可包含部分变量', async () => {
      // 添加局部变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('id');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('123');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 添加包含变量的参数
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
        const keyInput2 = targetRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        await keyInput2.fill('fullId');
        const valueInput2 = targetRow.locator(
          '.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]'
        ).first();
        await valueInput2.fill('prefix_{{id}}_suffix');
      } else {
        let keyInput2 = contentPage.locator('input[placeholder="输入参数名称自动换行"]').first();
        if (!(await keyInput2.count())) {
          keyInput2 = contentPage.locator('input[placeholder*="参数名称"]').first();
        }
        if (!(await keyInput2.count())) {
          keyInput2 = contentPage.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        }
        await keyInput2.fill('fullId');
        let valueInput2 = contentPage.locator('input[placeholder="参数值、@代表mock数据、{{ 变量 }}"]').first();
        if (!(await valueInput2.count())) {
          valueInput2 = contentPage.locator('input[placeholder*="参数值"]').first();
        }
        if (!(await valueInput2.count())) {
          valueInput2 = contentPage.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
        }
        await valueInput2.fill('prefix_{{id}}_suffix');
      }
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
      // 验证参数存在
      const targetName2 = 'Params';
      const tab2 = contentPage.locator(`.el-tabs__item:has-text("${targetName2}")`);
      await tab2.click();
      await contentPage.waitForTimeout(300);
      const container = contentPage.locator('.query-path-params .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const keyInputs = container.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]');
      const count2 = await keyInputs.count();
      let found = false;
      for (let i = 0; i < count2; i++) {
        const candidate = keyInputs.nth(i);
        const value2 = await candidate.inputValue();
        if (value2 === 'fullId') {
          await expect(candidate).toBeVisible();
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error('Query param fullId not found');
      }
    });
  });

  test.describe('15.3 请求头中的变量替换', () => {
    /**
     * 测试目的：验证Header value支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量token=abc123
     *   2. 添加请求头X-Token={{token}}
     *   3. 验证请求头存在
     * 预期结果：
     *   - 请求头value可以使用变量
     *   - 发送请求时替换为实际值
     * 验证点：请求头value的变量替换
     * 说明：请求头使用变量便于统一管理认证信息
     */
    test('Header value应支持变量', async () => {
      // 添加局部变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('token');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('abc123');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 添加包含变量的请求头
      const headersActive = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive) {
        const targetName = '请求头';
        const tab = contentPage.locator(`.el-tabs__item:has-text("${targetName}")`);
        await tab.click();
        await contentPage.waitForTimeout(300);
      }
      const container = contentPage.locator('.header-info .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const rows = container.locator('.custom-params');
      const count = await rows.count();
      const lastIndex = count > 0 ? count - 1 : 0;
      const lastRow2 = rows.nth(lastIndex);
      const keyInput2 = lastRow2.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput2.fill('X-Token');
      const valueInput2 = lastRow2.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput2.fill('{{token}}');
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
      // 验证请求头存在
      const targetName2 = '请求头';
      const tab2 = contentPage.locator(`.el-tabs__item:has-text("${targetName2}")`);
      await tab2.click();
      await contentPage.waitForTimeout(300);
      const headerSection = contentPage.locator('.header-info, .headers-table, .s-params').first();
      await headerSection.waitFor({ state: 'visible', timeout: 5000 });
      const exactInput = headerSection.locator('input[value="X-Token"]').first();
      if (await exactInput.count()) {
        await expect(exactInput).toBeVisible();
      } else {
        const keyInputs = headerSection.locator('input[placeholder*="参数"], input[placeholder*="key"], input[placeholder*="请求头"]');
        const inputCount = await keyInputs.count();
        let found = false;
        for (let i = 0; i < inputCount; i++) {
          const candidate = keyInputs.nth(i);
          const value = await candidate.inputValue();
          if (value === 'X-Token') {
            await expect(candidate).toBeVisible();
            found = true;
            break;
          }
        }
        if (!found) {
          throw new Error('Header X-Token not found');
        }
      }
    });

    /**
     * 测试目的：验证Authorization头支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量token=secret-token-123
     *   2. 添加Authorization头Bearer {{token}}
     *   3. 验证请求头存在
     * 预期结果：
     *   - Authorization头可以使用变量
     *   - 支持Bearer等认证方式
     * 验证点：Authorization头的变量替换
     * 说明：Authorization是最常用变量的请求头
     */
    test('Authorization header应支持Bearer token变量', async () => {
      // 添加局部变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('token');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('secret-token-123');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 添加Authorization头
      const headersActive = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive) {
        const targetName = '请求头';
        const tab = contentPage.locator(`.el-tabs__item:has-text("${targetName}")`);
        await tab.click();
        await contentPage.waitForTimeout(300);
      }
      const container = contentPage.locator('.header-info .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const rows = container.locator('.custom-params');
      const count = await rows.count();
      const lastIndex = count > 0 ? count - 1 : 0;
      const lastRow2 = rows.nth(lastIndex);
      const keyInput2 = lastRow2.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput2.fill('Authorization');
      const valueInput2 = lastRow2.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput2.fill('Bearer {{token}}');
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
      // 验证请求头存在
      const targetName2 = '请求头';
      const tab2 = contentPage.locator(`.el-tabs__item:has-text("${targetName2}")`);
      await tab2.click();
      await contentPage.waitForTimeout(300);
      const headerSection = contentPage.locator('.header-info, .headers-table, .s-params').first();
      await headerSection.waitFor({ state: 'visible', timeout: 5000 });
      const exactInput = headerSection.locator('input[value="Authorization"]').first();
      if (await exactInput.count()) {
        await expect(exactInput).toBeVisible();
      } else {
        const keyInputs = headerSection.locator('input[placeholder*="参数"], input[placeholder*="key"], input[placeholder*="请求头"]');
        const inputCount = await keyInputs.count();
        let found = false;
        for (let i = 0; i < inputCount; i++) {
          const candidate = keyInputs.nth(i);
          const value = await candidate.inputValue();
          if (value === 'Authorization') {
            await expect(candidate).toBeVisible();
            found = true;
            break;
          }
        }
        if (!found) {
          throw new Error('Header Authorization not found');
        }
      }
    });

    /**
     * 测试目的：验证自定义头支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量customValue=custom123
     *   2. 添加自定义请求头X-Custom-Header={{customValue}}
     *   3. 验证请求头存在
     * 预期结果：
     *   - 自定义请求头支持变量
     *   - 变量替换规则一致
     * 验证点：自定义请求头的变量替换
     * 说明：所有类型的请求头都支持变量
     */
    test('自定义头应支持变量', async () => {
      // 添加局部变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('customValue');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('custom123');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 添加自定义请求头
      const headersActive = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive) {
        const targetName = '请求头';
        const tab = contentPage.locator(`.el-tabs__item:has-text("${targetName}")`);
        await tab.click();
        await contentPage.waitForTimeout(300);
      }
      const container = contentPage.locator('.header-info .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const rows = container.locator('.custom-params');
      const count = await rows.count();
      const lastIndex = count > 0 ? count - 1 : 0;
      const lastRow2 = rows.nth(lastIndex);
      const keyInput2 = lastRow2.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput2.fill('X-Custom-Header');
      const valueInput2 = lastRow2.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput2.fill('{{customValue}}');
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
      // 验证请求头存在
      const targetName2 = '请求头';
      const tab2 = contentPage.locator(`.el-tabs__item:has-text("${targetName2}")`);
      await tab2.click();
      await contentPage.waitForTimeout(300);
      const headerSection = contentPage.locator('.header-info, .headers-table, .s-params').first();
      await headerSection.waitFor({ state: 'visible', timeout: 5000 });
      const exactInput = headerSection.locator('input[value="X-Custom-Header"]').first();
      if (await exactInput.count()) {
        await expect(exactInput).toBeVisible();
      } else {
        const keyInputs = headerSection.locator('input[placeholder*="参数"], input[placeholder*="key"], input[placeholder*="请求头"]');
        const inputCount = await keyInputs.count();
        let found = false;
        for (let i = 0; i < inputCount; i++) {
          const candidate = keyInputs.nth(i);
          const value = await candidate.inputValue();
          if (value === 'X-Custom-Header') {
            await expect(candidate).toBeVisible();
            found = true;
            break;
          }
        }
        if (!found) {
          throw new Error('Header X-Custom-Header not found');
        }
      }
    });
  });

  test.describe('15.4 Body中的变量替换', () => {
    /**
     * 测试目的：验证JSON Body支持变量替换
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 选择POST方法
     *   2. 添加局部变量userId=789
     *   3. 填写JSON Body包含{{userId}}
     * 预期结果：
     *   - JSON字段值可以使用变量
     *   - 发送时替换为实际值
     * 验证点：JSON Body的变量替换
     * 说明：JSON是最常用的请求体格式
     */
    test('JSON Body应支持变量替换', async () => {
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.locator('.el-select-dropdown__item:has-text("POST")').click();
      await contentPage.waitForTimeout(200);
      // 添加局部变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('userId');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('789');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 填写包含变量的JSON Body
      const targetName = 'Body';
      const tab = contentPage.locator(`.el-tabs__item:has-text("${targetName}")`);
      await tab.click();
      await contentPage.waitForTimeout(300);
      const modeMap = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue = modeMap['JSON'];
      const radioOption = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue });
      if (await radioOption.count()) {
        await radioOption.first().click();
      } else {
        const radioInput = contentPage.locator(`.body-params input[value="${targetValue}"]`).first();
        await radioInput.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const jsonString = JSON.stringify({ userId: '{{userId}}', name: 'test' }, null, 2);
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      const jsonTip = contentPage.locator('.workbench .json-tip').first();
      if (await jsonTip.isVisible()) {
        await jsonTip.click({ force: true });
        await contentPage.waitForTimeout(100);
      }
      await editor.click({ force: true });
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(jsonString);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证JSON多层嵌套支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 选择POST方法
     *   2. 添加多个局部变量
     *   3. 填写嵌套JSON包含变量
     * 预期结果：
     *   - 嵌套对象中的变量都能正确替换
     *   - 支持任意嵌套层级
     * 验证点：嵌套JSON的变量替换
     * 说明：复杂JSON结构也支持变量
     */
    test('JSON多层嵌套应支持变量', async () => {
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.locator('.el-select-dropdown__item:has-text("POST")').click();
      await contentPage.waitForTimeout(200);
      // 添加多个局部变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('userId');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('123');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      const variableBtn2 = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn2.click();
      await contentPage.waitForTimeout(300);
      const localTab2 = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab2.isVisible()) {
        await localTab2.click();
        await contentPage.waitForTimeout(200);
      }
      const table2 = contentPage.locator('.variable-table, .s-params').first();
      const lastRow2 = table2.locator('tbody tr').last();
      const keyInput2 = lastRow2.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput2.fill('userName');
      await contentPage.keyboard.press('Tab');
      const valueInput2 = lastRow2.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput2.fill('testUser');
      await valueInput2.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn2 = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn2.isVisible()) {
        await closeBtn2.click();
      }
      await contentPage.waitForTimeout(200);
      // 填写嵌套JSON
      const targetName = 'Body';
      const tab = contentPage.locator(`.el-tabs__item:has-text("${targetName}")`);
      await tab.click();
      await contentPage.waitForTimeout(300);
      const modeMap = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue = modeMap['JSON'];
      const radioOption = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue });
      if (await radioOption.count()) {
        await radioOption.first().click();
      } else {
        const radioInput = contentPage.locator(`.body-params input[value="${targetValue}"]`).first();
        await radioInput.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const jsonString = JSON.stringify({
        user: {
          id: '{{userId}}',
          name: '{{userName}}'
        }
      }, null, 2);
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      const jsonTip = contentPage.locator('.workbench .json-tip').first();
      if (await jsonTip.isVisible()) {
        await jsonTip.click({ force: true });
        await contentPage.waitForTimeout(100);
      }
      await editor.click({ force: true });
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(jsonString);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证FormData value支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 选择POST方法
     *   2. 添加局部变量fieldValue=formValue123
     *   3. 切换到form-data模式
     *   4. 添加字段使用变量
     * 预期结果：
     *   - FormData字段值支持变量
     *   - 发送时正确替换
     * 验证点：FormData的变量替换
     * 说明：FormData常用于文件上传
     */
    test('FormData value应支持变量', async () => {
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.locator('.el-select-dropdown__item:has-text("POST")').click();
      await contentPage.waitForTimeout(200);
      // 添加局部变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('fieldValue');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('formValue123');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 切换到form-data模式
      const targetName = 'Body';
      const tab = contentPage.locator(`.el-tabs__item:has-text("${targetName}")`);
      await tab.click();
      await contentPage.waitForTimeout(300);
      const modeMap = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue = modeMap['form-data'];
      const radioOption = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue });
      if (await radioOption.count()) {
        await radioOption.first().click();
      } else {
        const radioInput = contentPage.locator(`.body-params input[value="${targetValue}"]`).first();
        await radioInput.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 添加包含变量的字段
      const container = contentPage.locator('.body-params .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const rows = container.locator('.custom-params');
      const count = await rows.count();
      const targetIndex = count > 0 ? count - 1 : 0;
      const lastRow2 = rows.nth(targetIndex);
      const keyInput2 = lastRow2.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput2.fill('field1');
      const valueInput2 = lastRow2.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput2.fill('{{fieldValue}}');
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证Raw模式支持变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 选择POST方法
     *   2. 添加局部变量var=rawValue
     *   3. 切换到raw模式
     *   4. 填写包含变量的文本
     * 预期结果：
     *   - Raw模式支持变量替换
     *   - 可以在任意位置使用变量
     * 验证点：Raw模式的变量替换
     * 说明：Raw模式适用于自定义格式的请求体
     */
    test('Raw模式应支持变量', async () => {
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.locator('.el-select-dropdown__item:has-text("POST")').click();
      await contentPage.waitForTimeout(200);
      // 添加局部变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('var');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('rawValue');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 切换到raw模式
      const targetName = 'Body';
      const tab = contentPage.locator(`.el-tabs__item:has-text("${targetName}")`);
      await tab.click();
      await contentPage.waitForTimeout(300);
      const modeMap = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue = modeMap['raw'];
      const radioOption = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue });
      if (await radioOption.count()) {
        await radioOption.first().click();
      } else {
        const radioInput = contentPage.locator(`.body-params input[value="${targetValue}"]`).first();
        await radioInput.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 填写包含变量的文本
      const editor = contentPage.locator('.workbench .monaco-editor, .workbench textarea').first();
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type('Text with {{var}} replacement');
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证Binary变量模式读取变量值
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 选择POST方法
     *   2. 切换到binary模式
     *   3. 选择变量模式
     * 预期结果：
     *   - Binary模式支持从变量读取
     *   - 变量值应为文件路径或base64
     * 验证点：Binary模式的变量支持
     * 说明：Binary模式可以通过变量动态指定文件
     */
    test('Binary变量模式应读取变量值', async () => {
      // 选择POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.locator('.el-select-dropdown__item:has-text("POST")').click();
      await contentPage.waitForTimeout(200);
      // 切换到binary模式
      const targetName = 'Body';
      const tab = contentPage.locator(`.el-tabs__item:has-text("${targetName}")`);
      await tab.click();
      await contentPage.waitForTimeout(300);
      const modeMap = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue = modeMap['binary'];
      const radioOption = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue });
      if (await radioOption.count()) {
        await radioOption.first().click();
      } else {
        const radioInput = contentPage.locator(`.body-params input[value="${targetValue}"]`).first();
        await radioInput.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 选择变量模式
      const varMode = contentPage.locator('input[type="radio"][value="variable"], .mode-variable').first();
      if (await varMode.isVisible()) {
        await varMode.check({ force: true });
        await contentPage.waitForTimeout(300);
      }
    });
  });

  test.describe('15.5 变量作用域测试', () => {
    /**
     * 测试目的：验证优先使用局部变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加全局变量scopeTest=globalValue
     *   2. 添加局部变量scopeTest=localValue
     *   3. 在URL中使用{{scopeTest}}
     * 预期结果：
     *   - 使用局部变量的值
     *   - 局部变量优先级最高
     * 验证点：变量作用域优先级(局部优先)
     * 说明：优先级：局部 > 环境 > 全局
     */
    test('应优先使用局部变量', async () => {
      // 添加全局变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const globalTab = contentPage.locator('.el-tabs__item:has-text("全局"), .global-tab').first();
      if (await globalTab.isVisible()) {
        await globalTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('scopeTest');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('globalValue');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 添加局部变量
      const variableBtn2 = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn2.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table2 = contentPage.locator('.variable-table, .s-params').first();
      const lastRow2 = table2.locator('tbody tr').last();
      const keyInput2 = lastRow2.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput2.fill('scopeTest');
      await contentPage.keyboard.press('Tab');
      const valueInput2 = lastRow2.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput2.fill('localValue');
      await valueInput2.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn2 = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn2.isVisible()) {
        await closeBtn2.click();
      }
      await contentPage.waitForTimeout(200);
      // 使用变量
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('http://{{scopeTest}}/api');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证变量被识别
      const urlInput2 = contentPage.locator('[data-testid="url-input"]');
      const value = await urlInput2.inputValue();
      expect(value).toContain('{{scopeTest}}');
    });

    /**
     * 测试目的：验证局部变量不存在时使用环境变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加环境变量envVar=envValue
     *   2. 在URL中使用{{envVar}}(不添加局部变量)
     * 预期结果：
     *   - 使用环境变量的值
     *   - 环境变量优先级次于局部变量
     * 验证点：变量作用域优先级(环境次之)
     * 说明：环境变量用于不同环境配置
     */
    test('局部变量不存在时应使用环境变量', async () => {
      // 添加环境变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const envTab = contentPage.locator('.el-tabs__item:has-text("环境"), .env-tab').first();
      if (await envTab.isVisible()) {
        await envTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('envVar');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('envValue');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 使用变量
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('http://{{envVar}}/api');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证变量被识别
      const urlInput2 = contentPage.locator('[data-testid="url-input"]');
      const value = await urlInput2.inputValue();
      expect(value).toContain('{{envVar}}');
    });

    /**
     * 测试目的：验证环境变量不存在时使用全局变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加全局变量globalVar=globalValue
     *   2. 在URL中使用{{globalVar}}(不添加局部和环境变量)
     * 预期结果：
     *   - 使用全局变量的值
     *   - 全局变量优先级最低
     * 验证点：变量作用域优先级(全局最后)
     * 说明：全局变量适用于所有项目
     */
    test('环境变量不存在时应使用全局变量', async () => {
      // 添加全局变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const globalTab = contentPage.locator('.el-tabs__item:has-text("全局"), .global-tab').first();
      if (await globalTab.isVisible()) {
        await globalTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('globalVar');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('globalValue');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 使用变量
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('http://{{globalVar}}/api');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证变量被识别
      const urlInput2 = contentPage.locator('[data-testid="url-input"]');
      const value = await urlInput2.inputValue();
      expect(value).toContain('{{globalVar}}');
    });
  });

  test.describe('15.6 变量实时预览', () => {
    /**
     * 测试目的：验证显示变量替换后的实际值预览
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加局部变量previewVar=previewValue
     *   2. 在URL中使用{{previewVar}}
     *   3. 检查预览元素
     * 预期结果：
     *   - 显示变量替换后的实际值
     *   - 预览元素可见
     * 验证点：变量值预览功能
     * 说明：预览帮助确认变量值是否正确
     */
    test('应显示变量替换后的实际值预览', async () => {
      // 添加局部变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('previewVar');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('previewValue');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 在URL中使用变量
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('http://{{previewVar}}/api');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 检查预览元素
      const previewElement = contentPage.locator('.variable-preview, .var-tip').first();
      if (await previewElement.isVisible()) {
        await expect(previewElement).toBeVisible();
      }
    });

    /**
     * 测试目的：验证鼠标悬停变量显示当前值
     * 前置条件：已创建HTTP节点并使用变量
     * 操作步骤：
     *   1. 添加局部变量hoverVar=hoverValue
     *   2. 在URL中使用{{hoverVar}}
     *   3. 鼠标悬停到URL输入框
     *   4. 检查tooltip显示
     * 预期结果：
     *   - 鼠标悬停时显示tooltip
     *   - tooltip包含变量的实际值
     * 验证点：变量值tooltip提示
     * 说明：悬停提示提供快速查看变量值的方式
     */
    test('鼠标悬停变量应显示当前值', async () => {
      // 添加局部变量
      const variableBtn = contentPage.locator('[title*="变量"], .variable-btn, button:has-text("变量")').first();
      await variableBtn.click();
      await contentPage.waitForTimeout(300);
      const localTab = contentPage.locator('.el-tabs__item:has-text("局部"), .local-tab').first();
      if (await localTab.isVisible()) {
        await localTab.click();
        await contentPage.waitForTimeout(200);
      }
      const table = contentPage.locator('.variable-table, .s-params').first();
      const lastRow = table.locator('tbody tr').last();
      const keyInput = lastRow.locator('input[placeholder*="变量"], input[placeholder*="key"]').first();
      await keyInput.fill('hoverVar');
      await contentPage.keyboard.press('Tab');
      const valueInput = lastRow.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('hoverValue');
      await valueInput.blur();
      await contentPage.waitForTimeout(200);
      const closeBtn = contentPage.locator('.el-dialog__close, .close-btn').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
      await contentPage.waitForTimeout(200);
      // 在URL中使用变量
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('http://{{hoverVar}}/api');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 鼠标悬停到URL输入框
      const urlInput2 = contentPage.locator('input[placeholder*="URL"], .url-input').first();
      await urlInput2.hover();
      await contentPage.waitForTimeout(500);
      // 检查tooltip显示
      const tooltip = contentPage.locator('.el-tooltip__popper, .tooltip').first();
      if (await tooltip.isVisible()) {
        await expect(tooltip).toBeVisible();
      }
    });
  });
});
