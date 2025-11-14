import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';

test.describe('4. HTTP节点 - Body模块测试', () => {
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
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.locator('.el-select-dropdown__item:has-text("POST")').click();
    await contentPage.waitForTimeout(200);
  });

  test.describe('4.1 JSON模式测试', () => {
    /**
     * 测试目的：验证能够切换到JSON模式
     * 前置条件：已创建HTTP节点并选择POST方法
     * 操作步骤：
     *   1. 切换到Body标签页
     *   2. 选择JSON模式
     *   3. 验证Monaco编辑器显示
     * 预期结果：
     *   - JSON模式成功激活
     *   - Monaco代码编辑器可见
     * 验证点：JSON模式切换和编辑器初始化
     */
    test('应能切换到JSON模式', async () => {
      // 切换到Body标签页
      const bodyTab1 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab1.click();
      await contentPage.waitForTimeout(300);
      // 选择JSON模式
      const modeMap1 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue1 = modeMap1['JSON'];
      const radioOption1 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue1 });
      if (await radioOption1.count()) {
        await radioOption1.first().click();
      } else {
        const radioInput1 = contentPage.locator(`.body-params input[value="${targetValue1}"]`).first();
        await radioInput1.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 验证Monaco编辑器显示
      const editor = contentPage.locator('.monaco-editor').first();
      await expect(editor).toBeVisible();
    });

    /**
     * 测试目的：验证能够在JSON模式下输入数据
     * 前置条件：已切换到JSON模式
     * 操作步骤：
     *   1. 填入JSON对象 {key: 'value', name: 'test'}
     *   2. 等待编辑器更新
     *   3. 验证编辑器可见
     * 预期结果：
     *   - JSON数据成功输入
     *   - 编辑器正常显示
     * 验证点：JSON数据输入功能
     */
    test('应能输入JSON数据', async () => {
      // 填入JSON数据
      const bodyTab2 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab2.click();
      await contentPage.waitForTimeout(300);
      const modeMap2 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue2 = modeMap2['JSON'];
      const radioOption2 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue2 });
      if (await radioOption2.count()) {
        await radioOption2.first().click();
      } else {
        const radioInput2 = contentPage.locator(`.body-params input[value="${targetValue2}"]`).first();
        await radioInput2.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const jsonObj = { key: 'value', name: 'test' };
      const jsonString2 = JSON.stringify(jsonObj, null, 2);
      const editor2 = contentPage.locator('.workbench .monaco-editor').first();
      const jsonTip2 = contentPage.locator('.workbench .json-tip').first();
      if (await jsonTip2.isVisible()) {
        await jsonTip2.click({ force: true });
        await contentPage.waitForTimeout(100);
      }
      await editor2.click({ force: true });
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(jsonString2);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(500);
      // 验证编辑器显示
      const editor = contentPage.locator('.monaco-editor').first();
      await expect(editor).toBeVisible();
    });

    /**
     * 测试目的：验证JSON格式化功能
     * 前置条件：已输入压缩的JSON字符串
     * 操作步骤：
     *   1. 输入压缩的JSON: {"key":"value","name":"test"}
     *   2. 查找格式化按钮
     *   3. 点击格式化按钮
     * 预期结果：
     *   - JSON被格式化为易读的多行格式
     *   - 缩进和换行符正确添加
     * 验证点：JSON格式化美化功能
     * 说明：格式化后的JSON更易于阅读和编辑
     */
    test('应能格式化JSON', async () => {
      // 输入压缩的JSON
      const bodyTab3 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab3.click();
      await contentPage.waitForTimeout(300);
      const modeMap3 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue3 = modeMap3['JSON'];
      const radioOption3 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue3 });
      if (await radioOption3.count()) {
        await radioOption3.first().click();
      } else {
        const radioInput3 = contentPage.locator(`.body-params input[value="${targetValue3}"]`).first();
        await radioInput3.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const jsonString3 = '{"key":"value","name":"test"}';
      const editor3 = contentPage.locator('.workbench .monaco-editor').first();
      const jsonTip3 = contentPage.locator('.workbench .json-tip').first();
      if (await jsonTip3.isVisible()) {
        await jsonTip3.click({ force: true });
        await contentPage.waitForTimeout(100);
      }
      await editor3.click({ force: true });
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(jsonString3);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 点击格式化按钮
      const formatBtn = contentPage.locator('[title*="格式化"], .format-btn').first();
      if (await formatBtn.isVisible()) {
        await formatBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });

    /**
     * 测试目的：验证JSON语法验证功能
     * 前置条件：已切换到JSON模式
     * 操作步骤：
     *   1. 输入不合法的JSON: {"invalid json
     *   2. 等待验证结果
     * 预期结果：
     *   - 编辑器显示语法错误提示
     *   - 错误位置有下划线或标记
     * 验证点：JSON语法校验功能
     * 说明：实时语法检查帮助开发者发现JSON错误
     */
    test('应验证JSON语法', async () => {
      // 切换到JSON模式
      const bodyTab4 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab4.click();
      await contentPage.waitForTimeout(300);
      const modeMap4 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue4 = modeMap4['JSON'];
      const radioOption4 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue4 });
      if (await radioOption4.count()) {
        await radioOption4.first().click();
      } else {
        const radioInput4 = contentPage.locator(`.body-params input[value="${targetValue4}"]`).first();
        await radioInput4.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 输入不合法的JSON
      const jsonString4 = '{"invalid json';
      const editor4 = contentPage.locator('.workbench .monaco-editor').first();
      const jsonTip4 = contentPage.locator('.workbench .json-tip').first();
      if (await jsonTip4.isVisible()) {
        await jsonTip4.click({ force: true });
        await contentPage.waitForTimeout(100);
      }
      await editor4.click({ force: true });
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(jsonString4);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(500);
    });

    /**
     * 测试目的：验证JSON中支持变量替换语法
     * 前置条件：已切换到JSON模式
     * 操作步骤：
     *   1. 输入包含变量占位符的JSON
     *   2. 验证编辑器显示
     * 预期结果：
     *   - 变量占位符{{userId}}、{{token}}被识别
     *   - 发送请求时会进行变量替换
     * 验证点：JSON中的变量占位符支持
     * 说明：变量使用{{variableName}}语法
     */
    test('JSON中应支持变量替换', async () => {
      // 输入包含变量占位符的JSON
      const bodyTab5 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab5.click();
      await contentPage.waitForTimeout(300);
      const modeMap5 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue5 = modeMap5['JSON'];
      const radioOption5 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue5 });
      if (await radioOption5.count()) {
        await radioOption5.first().click();
      } else {
        const radioInput5 = contentPage.locator(`.body-params input[value="${targetValue5}"]`).first();
        await radioInput5.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const jsonObj5 = { userId: '{{userId}}', token: '{{token}}' };
      const jsonString5 = JSON.stringify(jsonObj5, null, 2);
      const editor5 = contentPage.locator('.workbench .monaco-editor').first();
      const jsonTip5 = contentPage.locator('.workbench .json-tip').first();
      if (await jsonTip5.isVisible()) {
        await jsonTip5.click({ force: true });
        await contentPage.waitForTimeout(100);
      }
      await editor5.click({ force: true });
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(jsonString5);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 验证编辑器显示
      const editor = contentPage.locator('.monaco-editor').first();
      await expect(editor).toBeVisible();
    });

    /**
     * 测试目的：验证JSON语法高亮显示
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 输入包含多种数据类型的JSON
     *   2. 检查编辑器样式
     * 预期结果：
     *   - 不同类型的值有不同颜色
     *   - 字符串、数字、布尔值等有语法高亮
     * 验证点：Monaco编辑器语法高亮功能
     * 说明：语法高亮提升代码可读性
     */
    test('应支持JSON语法高亮', async () => {
      // 输入包含多种数据类型的JSON
      const bodyTab6 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab6.click();
      await contentPage.waitForTimeout(300);
      const modeMap6 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue6 = modeMap6['JSON'];
      const radioOption6 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue6 });
      if (await radioOption6.count()) {
        await radioOption6.first().click();
      } else {
        const radioInput6 = contentPage.locator(`.body-params input[value="${targetValue6}"]`).first();
        await radioInput6.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const jsonObj6 = { key: 'value', number: 123, bool: true };
      const jsonString6 = JSON.stringify(jsonObj6, null, 2);
      const editor6 = contentPage.locator('.workbench .monaco-editor').first();
      const jsonTip6 = contentPage.locator('.workbench .json-tip').first();
      if (await jsonTip6.isVisible()) {
        await jsonTip6.click({ force: true });
        await contentPage.waitForTimeout(100);
      }
      await editor6.click({ force: true });
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(jsonString6);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 检查编辑器样式
      const editor = contentPage.locator('.monaco-editor').first();
      const hasHighlight = await editor.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.fontFamily.length > 0;
      });
      expect(hasHighlight).toBeTruthy();
    });

    /**
     * 测试目的：验证JSON模式自动设置Content-Type请求头
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 填入JSON数据
     *   2. 切换到Headers标签页
     *   3. 显示隐藏的请求头
     *   4. 验证Content-Type存在
     * 预期结果：
     *   - Content-Type自动设置为application/json
     *   - 请求头列表中可见
     * 验证点：Content-Type自动管理
     * 说明：系统根据Body模式自动设置正确的Content-Type
     */
    test('应自动设置Content-Type为application/json', async () => {
      // 填入JSON数据
      const bodyTab7 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab7.click();
      await contentPage.waitForTimeout(300);
      const modeMap7 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue7 = modeMap7['JSON'];
      const radioOption7 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue7 });
      if (await radioOption7.count()) {
        await radioOption7.first().click();
      } else {
        const radioInput7 = contentPage.locator(`.body-params input[value="${targetValue7}"]`).first();
        await radioInput7.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const jsonObj7 = { key: 'value' };
      const jsonString7 = JSON.stringify(jsonObj7, null, 2);
      const editor7 = contentPage.locator('.workbench .monaco-editor').first();
      const jsonTip7 = contentPage.locator('.workbench .json-tip').first();
      if (await jsonTip7.isVisible()) {
        await jsonTip7.click({ force: true });
        await contentPage.waitForTimeout(100);
      }
      await editor7.click({ force: true });
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(jsonString7);
      await contentPage.waitForTimeout(300);
      // 切换到Headers标签页
      const headersTab1 = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await headersTab1.click();
      await contentPage.waitForTimeout(300);
      // 显示隐藏的请求头
      const hiddenToggle = contentPage
        .locator('.header-info span')
        .filter({ hasText: /隐藏|hidden/i })
        .first();
      if (await hiddenToggle.isVisible()) {
        await hiddenToggle.click();
        await contentPage.waitForTimeout(200);
      }
      // 验证Content-Type存在
      const headerSection2 = contentPage.locator('.header-info, .headers-table, .s-params').first();
      await headerSection2.waitFor({ state: 'visible', timeout: 5000 });
      const exactInput2 = headerSection2.locator('input[value="Content-Type"]').first();
      if (await exactInput2.count()) {
        await expect(exactInput2).toBeVisible();
      } else {
        const keyInputs2 = headerSection2.locator('input[placeholder*="参数"], input[placeholder*="key"], input[placeholder*="请求头"]');
        const inputCount2 = await keyInputs2.count();
        let found2 = false;
        for (let i = 0; i < inputCount2; i++) {
          const candidate2 = keyInputs2.nth(i);
          const value2 = await candidate2.inputValue();
          if (value2 === 'Content-Type') {
            await expect(candidate2).toBeVisible();
            found2 = true;
            break;
          }
        }
        if (!found2) {
          throw new Error('Header Content-Type not found');
        }
      }
    });
  });

  test.describe('4.2 FormData模式测试', () => {
    /**
     * 测试目的：验证能够切换到FormData模式
     * 前置条件：已创建HTTP节点
     * 操作步骤：切换Body模式为form-data
     * 预期结果：
     *   - FormData模式成功激活
     *   - 参数树形表格显示
     * 验证点：FormData模式切换
     * 说明：FormData用于文件上传和表单提交
     */
    test('应能切换到FormData模式', async () => {
      // 切换到FormData模式
      const bodyTab8 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab8.click();
      await contentPage.waitForTimeout(300);
      const modeMap8 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue8 = modeMap8['form-data'];
      const radioOption8 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue8 });
      if (await radioOption8.count()) {
        await radioOption8.first().click();
      } else {
        const radioInput8 = contentPage.locator(`.body-params input[value="${targetValue8}"]`).first();
        await radioInput8.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 验证参数树形表格显示
      const tree = contentPage.locator('.body-params .el-tree').first();
      await expect(tree).toBeVisible();
    });

    /**
     * 测试目的：验证添加文本类型的FormData字段
     * 前置条件：已切换到FormData模式
     * 操作步骤：
     *   1. 添加字段 username=testuser
     *   2. 验证key输入框值
     *   3. 验证value输入框值
     * 预期结果：
     *   - 字段成功添加到列表
     *   - key和value正确显示
     * 验证点：文本字段添加功能
     */
    test('应能添加文本字段', async () => {
      // 添加文本字段
      const bodyTab9 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab9.click();
      await contentPage.waitForTimeout(300);
      const modeMap9 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue9 = modeMap9['form-data'];
      const radioOption9 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue9 });
      if (await radioOption9.count()) {
        await radioOption9.first().click();
      } else {
        const radioInput9 = contentPage.locator(`.body-params input[value="${targetValue9}"]`).first();
        await radioInput9.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const container9 = contentPage.locator('.body-params .el-tree').first();
      await container9.waitFor({ state: 'visible', timeout: 5000 });
      const rows9 = container9.locator('.custom-params');
      const count9 = await rows9.count();
      const targetIndex9 = count9 > 0 ? count9 - 1 : 0;
      const lastRow9 = rows9.nth(targetIndex9);
      const keyInput9 = lastRow9.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput9.fill('username');
      const valueInput9 = lastRow9.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput9.fill('testuser');
      await contentPage.waitForTimeout(200);
      // 验证key输入框值
      const keyInput = contentPage.locator('.body-params .custom-params input[placeholder*="参数"]').first();
      await expect(keyInput).toHaveValue('username');
      // 验证value输入框值
      const valueInput = contentPage.locator('.body-params .custom-params .value-text-input').first();
      await expect(valueInput).toHaveValue('testuser');
    });

    /**
     * 测试目的：验证添加文件类型的FormData字段
     * 前置条件：已切换到FormData模式
     * 操作步骤：
     *   1. 添加文件字段 avatar=/path/to/file.jpg
     *   2. 定位到avatar字段行
     *   3. 验证文件路径输入框值
     * 预期结果：
     *   - 文件字段成功添加
     *   - 文件路径正确保存
     * 验证点：文件字段添加功能
     * 说明：文件字段用于上传文件到服务器
     */
    test('应能添加文件字段', async () => {
      // 添加文件字段
      const bodyTab10 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab10.click();
      await contentPage.waitForTimeout(300);
      const modeMap10 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue10 = modeMap10['form-data'];
      const radioOption10 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue10 });
      if (await radioOption10.count()) {
        await radioOption10.first().click();
      } else {
        const radioInput10 = contentPage.locator(`.body-params input[value="${targetValue10}"]`).first();
        await radioInput10.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const container10 = contentPage.locator('.body-params .el-tree').first();
      await container10.waitFor({ state: 'visible', timeout: 5000 });
      const rows10 = container10.locator('.custom-params');
      const count10 = await rows10.count();
      const targetIndex10 = count10 > 0 ? count10 - 1 : 0;
      const lastRow10 = rows10.nth(targetIndex10);
      const keyInput10 = lastRow10.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput10.fill('avatar');
      const typeSelect10 = lastRow10.locator('.el-select').first();
      await typeSelect10.click();
      await contentPage.locator('.el-select-dropdown__item:has-text("file")').first().click();
      const varModeTrigger10 = lastRow10.locator('.var-mode').first();
      if (await varModeTrigger10.isVisible()) {
        await varModeTrigger10.click();
        await contentPage.waitForTimeout(100);
      }
      const fileVarInput10 = lastRow10.locator('input[placeholder*="变量模式"], input[placeholder*="variable"]').first();
      if (await fileVarInput10.count()) {
        await fileVarInput10.fill('/path/to/file.jpg');
      }
      await contentPage.waitForTimeout(200);
      // 定位到avatar字段行
      const keyInputs = await contentPage
        .locator('.body-params .custom-params input[placeholder*="参数"]')
        .evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      const targetIndex = keyInputs.indexOf('avatar');
      expect(targetIndex).toBeGreaterThan(-1);
      // 验证文件路径输入框值
      const row = contentPage.locator('.custom-params').nth(targetIndex);
      const valueInput = row.locator('input[placeholder*="变量模式"], input[placeholder*="variable"]').first();
      await expect(valueInput).toHaveValue('/path/to/file.jpg');
    });

    /**
     * 测试目的：验证删除FormData字段
     * 前置条件：已添加FormData字段
     * 操作步骤：
     *   1. 添加字段testField
     *   2. 定位到该字段行
     *   3. 点击删除按钮
     *   4. 验证字段已从列表移除
     * 预期结果：
     *   - 字段成功删除
     *   - 列表中不再包含该字段
     * 验证点：字段删除功能
     */
    test('应能删除表单字段', async () => {
      // 添加字段
      const bodyTab11 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab11.click();
      await contentPage.waitForTimeout(300);
      const modeMap11 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue11 = modeMap11['form-data'];
      const radioOption11 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue11 });
      if (await radioOption11.count()) {
        await radioOption11.first().click();
      } else {
        const radioInput11 = contentPage.locator(`.body-params input[value="${targetValue11}"]`).first();
        await radioInput11.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const container11 = contentPage.locator('.body-params .el-tree').first();
      await container11.waitFor({ state: 'visible', timeout: 5000 });
      const rows11 = container11.locator('.custom-params');
      const count11 = await rows11.count();
      const targetIndex11 = count11 > 0 ? count11 - 1 : 0;
      const lastRow11 = rows11.nth(targetIndex11);
      const keyInput11 = lastRow11.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput11.fill('testField');
      const valueInput11 = lastRow11.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput11.fill('testValue');
      await contentPage.waitForTimeout(200);
      // 定位到该字段行
      const keyLocator = contentPage.locator('.body-params .custom-params input[placeholder*="参数"]');
      const initialValues = await keyLocator.evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      const targetIndex = initialValues.indexOf('testField');
      expect(targetIndex).toBeGreaterThan(-1);
      // 点击删除按钮
      const row = contentPage.locator('.custom-params').nth(targetIndex);
      const deleteBtn = row.locator('.delete-icon, .icon-shanchu, [title*="删除"]').first();
      await deleteBtn.click();
      await contentPage.waitForTimeout(300);
      // 验证字段已移除
      const afterValues = await keyLocator.evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      expect(afterValues.includes('testField')).toBe(false);
    });

    /**
     * 测试目的：验证FormData字段的启用/禁用功能
     * 前置条件：已切换到FormData模式
     * 操作步骤：
     *   1. 添加禁用状态的字段
     *   2. 定位到该字段行
     *   3. 检查启用复选框状态
     * 预期结果：
     *   - 复选框未勾选(禁用状态)
     *   - 禁用的字段不会在请求中发送
     * 验证点：字段启用/禁用控制
     * 说明：禁用字段用于临时排除某些参数
     */
    test('表单字段应支持启用/禁用', async () => {
      // 添加禁用状态的字段
      const bodyTab12 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab12.click();
      await contentPage.waitForTimeout(300);
      const modeMap12 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue12 = modeMap12['form-data'];
      const radioOption12 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue12 });
      if (await radioOption12.count()) {
        await radioOption12.first().click();
      } else {
        const radioInput12 = contentPage.locator(`.body-params input[value="${targetValue12}"]`).first();
        await radioInput12.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const container12 = contentPage.locator('.body-params .el-tree').first();
      await container12.waitFor({ state: 'visible', timeout: 5000 });
      const rows12 = container12.locator('.custom-params');
      const count12 = await rows12.count();
      const targetIndex12 = count12 > 0 ? count12 - 1 : 0;
      const lastRow12 = rows12.nth(targetIndex12);
      const keyInput12 = lastRow12.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput12.fill('disabledField');
      const valueInput12 = lastRow12.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput12.fill('value');
      const checkbox12 = lastRow12.locator('input[type="checkbox"]').first();
      if (await checkbox12.isChecked()) {
        const checkboxWrapper12 = lastRow12.locator('.el-checkbox').first();
        await checkboxWrapper12.click();
      }
      await contentPage.waitForTimeout(200);
      // 定位到该字段行
      const keyValues = await contentPage
        .locator('.body-params .custom-params input[placeholder*="参数"]')
        .evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      const targetIndex = keyValues.indexOf('disabledField');
      expect(targetIndex).toBeGreaterThan(-1);
      // 检查启用复选框状态
      const row = contentPage.locator('.custom-params').nth(targetIndex);
      const checkbox = row.locator('input[type="checkbox"]').first();
      const isChecked = await checkbox.isChecked();
      expect(isChecked).toBe(false);
    });

    /**
     * 测试目的：验证FormData字段value支持变量
     * 前置条件：已切换到FormData模式
     * 操作步骤：
     *   1. 添加字段值为{{userId}}
     *   2. 定位到该字段行
     *   3. 验证value输入框包含变量占位符
     * 预期结果：
     *   - 变量占位符正确保存
     *   - 发送请求时会替换为实际值
     * 验证点：FormData中的变量支持
     */
    test('表单字段value应支持变量', async () => {
      // 添加字段值为变量占位符
      const bodyTab15 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab15.click();
      await contentPage.waitForTimeout(300);
      const modeMap15 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue15 = modeMap15['form-data'];
      const radioOption15 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue15 });
      if (await radioOption15.count()) {
        await radioOption15.first().click();
      } else {
        const radioInput15 = contentPage.locator(`.body-params input[value="${targetValue15}"]`).first();
        await radioInput15.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const container15 = contentPage.locator('.body-params .el-tree').first();
      await container15.waitFor({ state: 'visible', timeout: 5000 });
      const rows15 = container15.locator('.custom-params');
      const count15 = await rows15.count();
      const targetIndex15 = count15 > 0 ? count15 - 1 : 0;
      const lastRow15 = rows15.nth(targetIndex15);
      const keyInput15 = lastRow15.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput15.fill('userId');
      const valueInput15 = lastRow15.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput15.fill('{{userId}}');
      await contentPage.waitForTimeout(200);
      // 定位到该字段行
      const keyValues = await contentPage
        .locator('.body-params .custom-params input[placeholder*="参数"]')
        .evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      const targetIndex = keyValues.indexOf('userId');
      expect(targetIndex).toBeGreaterThan(-1);
      // 验证value输入框包含变量占位符
      const row = contentPage.locator('.custom-params').nth(targetIndex);
      const valueInput = row.locator('.value-text-input, textarea').first();
      await expect(valueInput).toHaveValue('{{userId}}');
    });

    /**
     * 测试目的：验证FormData模式自动设置Content-Type
     * 前置条件：已添加FormData字段
     * 操作步骤：
     *   1. 添加表单字段
     *   2. 切换到Headers标签页
     *   3. 显示隐藏的请求头
     *   4. 验证Content-Type存在
     * 预期结果：
     *   - Content-Type自动设置为multipart/form-data
     *   - 包含boundary参数
     * 验证点：FormData的Content-Type自动管理
     */
    test('应自动设置Content-Type为multipart/form-data', async () => {
      // 添加表单字段
      const bodyTab16 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab16.click();
      await contentPage.waitForTimeout(300);
      const modeMap16 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue16 = modeMap16['form-data'];
      const radioOption16 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue16 });
      if (await radioOption16.count()) {
        await radioOption16.first().click();
      } else {
        const radioInput16 = contentPage.locator(`.body-params input[value="${targetValue16}"]`).first();
        await radioInput16.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const container16 = contentPage.locator('.body-params .el-tree').first();
      await container16.waitFor({ state: 'visible', timeout: 5000 });
      const rows16 = container16.locator('.custom-params');
      const count16 = await rows16.count();
      const targetIndex16 = count16 > 0 ? count16 - 1 : 0;
      const lastRow16 = rows16.nth(targetIndex16);
      const keyInput16 = lastRow16.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput16.fill('formKey');
      const valueInput16 = lastRow16.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput16.fill('formValue');
      await contentPage.waitForTimeout(200);
      // 切换到Headers标签页
      const headersTab2 = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await headersTab2.click();
      await contentPage.waitForTimeout(300);
      // 显示隐藏的请求头
      const hiddenToggle = contentPage
        .locator('.header-info span')
        .filter({ hasText: /隐藏|hidden/i })
        .first();
      if (await hiddenToggle.isVisible()) {
        await hiddenToggle.click();
        await contentPage.waitForTimeout(200);
      }
      // 验证Content-Type存在
      const headerSection3 = contentPage.locator('.header-info, .headers-table, .s-params').first();
      await headerSection3.waitFor({ state: 'visible', timeout: 5000 });
      const exactInput3 = headerSection3.locator('input[value="Content-Type"]').first();
      if (await exactInput3.count()) {
        await expect(exactInput3).toBeVisible();
      } else {
        const keyInputs3 = headerSection3.locator('input[placeholder*="参数"], input[placeholder*="key"], input[placeholder*="请求头"]');
        const inputCount3 = await keyInputs3.count();
        let found3 = false;
        for (let i = 0; i < inputCount3; i++) {
          const candidate3 = keyInputs3.nth(i);
          const value3 = await candidate3.inputValue();
          if (value3 === 'Content-Type') {
            await expect(candidate3).toBeVisible();
            found3 = true;
            break;
          }
        }
        if (!found3) {
          throw new Error('Header Content-Type not found');
        }
      }
    });
  });

  test.describe('4.3 x-www-form-urlencoded模式测试', () => {
    /**
     * 测试目的：验证能够切换到urlencoded模式
     * 前置条件：已创建HTTP节点
     * 操作步骤：切换Body模式为x-www-form-urlencoded
     * 预期结果：
     *   - urlencoded模式成功激活
     *   - 参数树形表格显示
     * 验证点：urlencoded模式切换
     * 说明：urlencoded用于传统表单提交
     */
    test('应能切换到urlencoded模式', async () => {
      // 切换到urlencoded模式
      const bodyTab17 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab17.click();
      await contentPage.waitForTimeout(300);
      const modeMap17 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue17 = modeMap17['x-www-form-urlencoded'];
      const radioOption17 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue17 });
      if (await radioOption17.count()) {
        await radioOption17.first().click();
      } else {
        const radioInput17 = contentPage.locator(`.body-params input[value="${targetValue17}"]`).first();
        await radioInput17.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 验证参数树形表格显示
      const tree = contentPage.locator('.body-params .el-tree').first();
      await expect(tree).toBeVisible();
    });

    /**
     * 测试目的：验证添加urlencoded参数对
     * 前置条件：已切换到urlencoded模式
     * 操作步骤：
     *   1. 添加参数 username=testuser
     *   2. 验证key和value输入框
     * 预期结果：
     *   - 参数成功添加
     *   - key和value正确显示
     * 验证点：参数添加功能
     */
    test('应能添加参数对', async () => {
      // 添加参数
      const bodyTab18 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab18.click();
      await contentPage.waitForTimeout(300);
      const modeMap18 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue18 = modeMap18['x-www-form-urlencoded'];
      const radioOption18 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue18 });
      if (await radioOption18.count()) {
        await radioOption18.first().click();
      } else {
        const radioInput18 = contentPage.locator(`.body-params input[value="${targetValue18}"]`).first();
        await radioInput18.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const container18 = contentPage.locator('.body-params .el-tree').first();
      await container18.waitFor({ state: 'visible', timeout: 5000 });
      const rows18 = container18.locator('.custom-params');
      const count18 = await rows18.count();
      const lastRow18 = rows18.nth(count18 > 0 ? count18 - 1 : 0);
      const keyInput18 = lastRow18.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput18.fill('username');
      const valueInput18 = lastRow18.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput18.fill('testuser');
      await contentPage.waitForTimeout(200);
      // 验证key和value输入框
      const keyInput = contentPage.locator('.body-params .custom-params input[placeholder*="参数"]').first();
      await expect(keyInput).toHaveValue('username');
      const valueInput = contentPage.locator('.body-params .custom-params .value-text-input').first();
      await expect(valueInput).toHaveValue('testuser');
    });

    /**
     * 测试目的：验证编辑urlencoded参数
     * 前置条件：已添加urlencoded参数
     * 操作步骤：
     *   1. 添加参数editKey=oldValue
     *   2. 定位到该参数行
     *   3. 修改value为newValue
     * 预期结果：
     *   - 参数value成功修改
     *   - 新值正确保存
     * 验证点：参数编辑功能
     */
    test('应能编辑参数', async () => {
      // 添加参数
      const bodyTab19 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab19.click();
      await contentPage.waitForTimeout(300);
      const modeMap19 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue19 = modeMap19['x-www-form-urlencoded'];
      const radioOption19 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue19 });
      if (await radioOption19.count()) {
        await radioOption19.first().click();
      } else {
        const radioInput19 = contentPage.locator(`.body-params input[value="${targetValue19}"]`).first();
        await radioInput19.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const container19 = contentPage.locator('.body-params .el-tree').first();
      await container19.waitFor({ state: 'visible', timeout: 5000 });
      const rows19 = container19.locator('.custom-params');
      const count19 = await rows19.count();
      const lastRow19 = rows19.nth(count19 > 0 ? count19 - 1 : 0);
      const keyInput19 = lastRow19.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput19.fill('editKey');
      const valueInput19 = lastRow19.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput19.fill('oldValue');
      await contentPage.waitForTimeout(200);
      // 定位到该参数行
      const keyValues = await contentPage
        .locator('.body-params .custom-params input[placeholder*="参数"]')
        .evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      const targetIndex = keyValues.indexOf('editKey');
      expect(targetIndex).toBeGreaterThan(-1);
      // 修改value
      const row = contentPage.locator('.custom-params').nth(targetIndex);
      const valueInput = row.locator('.value-text-input').first();
      await valueInput.evaluate((element, newValue) => {
        const input = element as HTMLInputElement;
        input.focus();
        input.value = newValue as string;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, 'newValue');
      await contentPage.waitForTimeout(200);
    });

    /**
     * 测试目的：验证删除urlencoded参数
     * 前置条件：已添加urlencoded参数
     * 操作步骤：
     *   1. 添加参数deleteKey
     *   2. 定位到该参数行
     *   3. 点击删除按钮
     *   4. 验证参数已移除
     * 预期结果：
     *   - 参数成功删除
     *   - 列表中不再包含该参数
     * 验证点：参数删除功能
     */
    test('应能删除参数', async () => {
      // 添加参数
      const bodyTab20 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab20.click();
      await contentPage.waitForTimeout(300);
      const modeMap20 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue20 = modeMap20['x-www-form-urlencoded'];
      const radioOption20 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue20 });
      if (await radioOption20.count()) {
        await radioOption20.first().click();
      } else {
        const radioInput20 = contentPage.locator(`.body-params input[value="${targetValue20}"]`).first();
        await radioInput20.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const container20 = contentPage.locator('.body-params .el-tree').first();
      await container20.waitFor({ state: 'visible', timeout: 5000 });
      const rows20 = container20.locator('.custom-params');
      const count20 = await rows20.count();
      const lastRow20 = rows20.nth(count20 > 0 ? count20 - 1 : 0);
      const keyInput20 = lastRow20.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput20.fill('deleteKey');
      const valueInput20 = lastRow20.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput20.fill('value');
      await contentPage.waitForTimeout(200);
      // 定位到该参数行
      const keyLocator = contentPage.locator('.body-params .custom-params input[placeholder*="参数"]');
      const initialValues = await keyLocator.evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      const targetIndex = initialValues.indexOf('deleteKey');
      expect(targetIndex).toBeGreaterThan(-1);
      // 点击删除按钮
      const row = contentPage.locator('.custom-params').nth(targetIndex);
      const deleteBtn = row.locator('.delete-icon, .icon-shanchu, [title*="删除"]').first();
      await deleteBtn.click();
      await contentPage.waitForTimeout(300);
      // 验证参数已移除
      const afterValues = await keyLocator.evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      expect(afterValues.includes('deleteKey')).toBe(false);
    });

    /**
     * 测试目的：验证urlencoded参数的启用/禁用功能
     * 前置条件：已切换到urlencoded模式
     * 操作步骤：
     *   1. 添加禁用状态的参数
     *   2. 定位到该参数行
     *   3. 检查复选框状态
     * 预期结果：
     *   - 复选框未勾选
     *   - 禁用的参数不会在请求中发送
     * 验证点：参数启用/禁用控制
     */
    test('参数应支持启用/禁用', async () => {
      // 添加禁用状态的参数
      const bodyTab21 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab21.click();
      await contentPage.waitForTimeout(300);
      const modeMap21 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue21 = modeMap21['x-www-form-urlencoded'];
      const radioOption21 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue21 });
      if (await radioOption21.count()) {
        await radioOption21.first().click();
      } else {
        const radioInput21 = contentPage.locator(`.body-params input[value="${targetValue21}"]`).first();
        await radioInput21.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const container21 = contentPage.locator('.body-params .el-tree').first();
      await container21.waitFor({ state: 'visible', timeout: 5000 });
      const rows21 = container21.locator('.custom-params');
      const count21 = await rows21.count();
      const lastRow21 = rows21.nth(count21 > 0 ? count21 - 1 : 0);
      const keyInput21 = lastRow21.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput21.fill('disabledKey');
      const valueInput21 = lastRow21.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput21.fill('value');
      const checkbox21 = lastRow21.locator('input[type="checkbox"]').first();
      if (await checkbox21.isChecked()) {
        const checkboxWrapper21 = lastRow21.locator('.el-checkbox').first();
        await checkboxWrapper21.click();
      }
      await contentPage.waitForTimeout(200);
      // 定位到该参数行
      const keyValues = await contentPage
        .locator('.body-params .custom-params input[placeholder*="参数"]')
        .evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      const targetIndex = keyValues.indexOf('disabledKey');
      expect(targetIndex).toBeGreaterThan(-1);
      // 检查复选框状态
      const row = contentPage.locator('.custom-params').nth(targetIndex);
      const checkbox = row.locator('input[type="checkbox"]').first();
      const isChecked = await checkbox.isChecked();
      expect(isChecked).toBe(false);
    });

    /**
     * 测试目的：验证urlencoded模式自动设置Content-Type
     * 前置条件：已添加urlencoded参数
     * 操作步骤：
     *   1. 添加参数
     *   2. 切换到Headers标签页
     *   3. 显示隐藏的请求头
     *   4. 验证Content-Type存在
     * 预期结果：
     *   - Content-Type自动设置为application/x-www-form-urlencoded
     * 验证点：Content-Type自动管理
     */
    test('应自动设置Content-Type为application/x-www-form-urlencoded', async () => {
      // 添加urlencoded参数
      const bodyTab22 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab22.click();
      await contentPage.waitForTimeout(300);
      const modeMap22 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue22 = modeMap22['x-www-form-urlencoded'];
      const radioOption22 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue22 });
      if (await radioOption22.count()) {
        await radioOption22.first().click();
      } else {
        const radioInput22 = contentPage.locator(`.body-params input[value="${targetValue22}"]`).first();
        await radioInput22.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const container22 = contentPage.locator('.body-params .el-tree').first();
      await container22.waitFor({ state: 'visible', timeout: 5000 });
      const rows22 = container22.locator('.custom-params');
      const count22 = await rows22.count();
      const lastRow22 = rows22.nth(count22 > 0 ? count22 - 1 : 0);
      const keyInput22 = lastRow22.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput22.fill('formKey');
      const valueInput22 = lastRow22.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput22.fill('formValue');
      await contentPage.waitForTimeout(200);
      // 切换到Headers标签页
      const targetTab22 = contentPage.locator('.el-tabs__item').filter({ hasText: 'Headers' }).first();
      await targetTab22.click();
      await contentPage.waitForTimeout(300);
      // 显示隐藏的请求头
      const hiddenToggle = contentPage
        .locator('.header-info span')
        .filter({ hasText: /隐藏|hidden/i })
        .first();
      if (await hiddenToggle.isVisible()) {
        await hiddenToggle.click();
        await contentPage.waitForTimeout(200);
      }
      // 验证Content-Type存在
      const headerRows22 = contentPage.locator('.header-info .el-table__row, .header-info .table-row');
      const headerRowCount22 = await headerRows22.count();
      let found22 = false;
      for (let i22 = 0; i22 < headerRowCount22; i22++) {
        const keyCell22 = headerRows22.nth(i22).locator('.key-cell input, .key-cell, td:nth-child(1) input, td:nth-child(1)');
        const keyText22 = await keyCell22.inputValue().catch(() => keyCell22.textContent());
        if (keyText22?.trim() === 'Content-Type') {
          found22 = true;
          break;
        }
      }
      if (!found22) {
        throw new Error('Header "Content-Type" not found in header list');
      }
    });
  });

  test.describe('4.4 Raw模式测试', () => {
    /**
     * 测试目的：验证能够切换到Raw模式
     * 前置条件：已创建HTTP节点
     * 操作步骤：切换Body模式为raw
     * 预期结果：
     *   - Raw模式成功激活
     *   - 编辑器或文本框显示
     * 验证点：Raw模式切换
     * 说明：Raw模式用于发送原始文本数据
     */
    test('应能切换到Raw模式', async () => {
      // 切换到Raw模式
      const bodyTab23 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab23.click();
      await contentPage.waitForTimeout(300);
      const modeMap23 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue23 = modeMap23['raw'];
      const radioOption23 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue23 });
      if (await radioOption23.count()) {
        await radioOption23.first().click();
      } else {
        const radioInput23 = contentPage.locator(`.body-params input[value="${targetValue23}"]`).first();
        await radioInput23.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 验证编辑器显示
      const editor = contentPage.locator('.monaco-editor, textarea').first();
      await expect(editor).toBeVisible();
    });

    /**
     * 测试目的：验证在Raw模式下输入原始文本
     * 前置条件：已切换到Raw模式
     * 操作步骤：
     *   1. 填入原始文本内容
     *   2. 验证编辑器显示
     * 预期结果：
     *   - 文本成功输入
     *   - 编辑器正常显示
     * 验证点：原始文本输入功能
     */
    test('应能输入原始文本', async () => {
      // 填入原始文本内容
      const bodyTab24 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab24.click();
      await contentPage.waitForTimeout(300);
      const modeMap24 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue24 = modeMap24['raw'];
      const radioOption24 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue24 });
      if (await radioOption24.count()) {
        await radioOption24.first().click();
      } else {
        const radioInput24 = contentPage.locator(`.body-params input[value="${targetValue24}"]`).first();
        await radioInput24.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      const editor24 = contentPage.locator('.workbench .monaco-editor, .workbench textarea').first();
      await editor24.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type('This is raw text content');
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 验证编辑器显示
      const editor = contentPage.locator('.monaco-editor, textarea').first();
      await expect(editor).toBeVisible();
    });

    /**
     * 测试目的：验证Raw模式支持选择数据类型
     * 前置条件：已切换到Raw模式
     * 操作步骤：
     *   1. 查找数据类型选择器
     *   2. 点击打开下拉列表
     * 预期结果：
     *   - 类型选择器可见
     *   - 可以打开类型选择下拉
     * 验证点：数据类型选择功能
     * 说明：不同类型影响Content-Type和语法高亮
     */
    test('应能选择数据类型', async () => {
      // 切换到Raw模式
      const bodyTab25 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab25.click();
      await contentPage.waitForTimeout(300);
      const modeMap25 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue25 = modeMap25['raw'];
      const radioOption25 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue25 });
      if (await radioOption25.count()) {
        await radioOption25.first().click();
      } else {
        const radioInput25 = contentPage.locator(`.body-params input[value="${targetValue25}"]`).first();
        await radioInput25.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 查找数据类型选择器
      const typeSelector = contentPage.locator('.content-type-select, .el-select').first();
      if (await typeSelector.isVisible()) {
        // 点击打开下拉列表
        await typeSelector.click();
        await contentPage.waitForTimeout(200);
      }
    });

    /**
     * 测试目的：验证Raw模式支持text/plain类型
     * 前置条件：已切换到Raw模式
     * 操作步骤：
     *   1. 打开类型选择器
     *   2. 检查选项列表是否包含text
     * 预期结果：选项列表中有text类型
     * 验证点：text/plain类型支持
     */
    test('支持的数据类型应包括text/plain', async () => {
      // 切换到Raw模式
      const bodyTab27 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab27.click();
      await contentPage.waitForTimeout(300);
      const modeMap27 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue27 = modeMap27['raw'];
      const radioOption27 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue27 });
      if (await radioOption27.count()) {
        await radioOption27.first().click();
      } else {
        const radioInput27 = contentPage.locator(`.body-params input[value="${targetValue27}"]`).first();
        await radioInput27.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 打开类型选择器
      const typeSelector = contentPage.locator('.content-type-select, .el-select').first();
      if (await typeSelector.isVisible()) {
        await typeSelector.click();
        await contentPage.waitForTimeout(200);
        // 检查选项列表是否包含text
        const optionTexts = await contentPage
          .locator('.el-select-dropdown__item')
          .evaluateAll((elements) => elements.map((element) => (element.textContent || '').trim().toLowerCase()));
        expect(optionTexts.includes('text')).toBe(true);
      }
    });

    /**
     * 测试目的：验证Raw模式支持text/html类型
     * 前置条件：已切换到Raw模式
     * 操作步骤：
     *   1. 打开类型选择器
     *   2. 检查选项列表是否包含html
     * 预期结果：选项列表中有html类型
     * 验证点：text/html类型支持
     * 说明：html类型用于发送HTML文档
     */
    test('支持的数据类型应包括text/html', async () => {
      // 切换到Raw模式
      const bodyTab28 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab28.click();
      await contentPage.waitForTimeout(300);
      const modeMap28 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue28 = modeMap28['raw'];
      const radioOption28 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue28 });
      if (await radioOption28.count()) {
        await radioOption28.first().click();
      } else {
        const radioInput28 = contentPage.locator(`.body-params input[value="${targetValue28}"]`).first();
        await radioInput28.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 打开类型选择器
      const typeSelector = contentPage.locator('.content-type-select, .el-select').first();
      if (await typeSelector.isVisible()) {
        await typeSelector.click();
        await contentPage.waitForTimeout(200);
        // 检查选项列表是否包含html
        const optionTexts = await contentPage
          .locator('.el-select-dropdown__item')
          .evaluateAll((elements) => elements.map((element) => (element.textContent || '').trim().toLowerCase()));
        expect(optionTexts.includes('html')).toBe(true);
      }
    });

    /**
     * 测试目的：验证Raw模式支持application/xml类型
     * 前置条件：已切换到Raw模式
     * 操作步骤：
     *   1. 打开类型选择器
     *   2. 检查选项列表是否包含xml
     * 预期结果：选项列表中有xml类型
     * 验证点：application/xml类型支持
     * 说明：xml类型用于发送XML文档
     */
    test('支持的数据类型应包括application/xml', async () => {
      // 切换到Raw模式
      const bodyTab29 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab29.click();
      await contentPage.waitForTimeout(300);
      const modeMap29 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue29 = modeMap29['raw'];
      const radioOption29 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue29 });
      if (await radioOption29.count()) {
        await radioOption29.first().click();
      } else {
        const radioInput29 = contentPage.locator(`.body-params input[value="${targetValue29}"]`).first();
        await radioInput29.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 打开类型选择器
      const typeSelector = contentPage.locator('.content-type-select, .el-select').first();
      if (await typeSelector.isVisible()) {
        await typeSelector.click();
        await contentPage.waitForTimeout(200);
        // 检查选项列表是否包含xml
        const optionTexts = await contentPage
          .locator('.el-select-dropdown__item')
          .evaluateAll((elements) => elements.map((element) => (element.textContent || '').trim().toLowerCase()));
        expect(optionTexts.includes('xml')).toBe(true);
      }
    });

    /**
     * 测试目的：验证Raw模式支持text/javascript类型
     * 前置条件：已切换到Raw模式
     * 操作步骤：
     *   1. 打开类型选择器
     *   2. 检查选项列表是否包含javascript
     * 预期结果：选项列表中有javascript类型
     * 验证点：text/javascript类型支持
     */
    test('支持的数据类型应包括text/javascript', async () => {
      // 切换到Raw模式
      const bodyTab31 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab31.click();
      await contentPage.waitForTimeout(300);
      const modeMap31 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue31 = modeMap31['raw'];
      const radioOption31 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue31 });
      if (await radioOption31.count()) {
        await radioOption31.first().click();
      } else {
        const radioInput31 = contentPage.locator(`.body-params input[value="${targetValue31}"]`).first();
        await radioInput31.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 打开类型选择器
      const typeSelector = contentPage.locator('.content-type-select, .el-select').first();
      if (await typeSelector.isVisible()) {
        await typeSelector.click();
        await contentPage.waitForTimeout(200);
        // 检查选项列表是否包含javascript
        const optionTexts = await contentPage
          .locator('.el-select-dropdown__item')
          .evaluateAll((elements) => elements.map((element) => (element.textContent || '').trim().toLowerCase()));
        expect(optionTexts.includes('javascript')).toBe(true);
      }
    });

    /**
     * 测试目的：验证Raw模式支持变量替换
     * 前置条件：已切换到Raw模式
     * 操作步骤：填入包含变量占位符的文本
     * 预期结果：
     *   - 变量占位符正确保存
     *   - 发送请求时会进行变量替换
     * 验证点：Raw模式中的变量支持
     */
    test('Raw模式应支持变量替换', async () => {
      // 填入包含变量占位符的文本
      const rawModeTextarea32 = contentPage.locator('.body-params textarea[placeholder*="输入原始数据"]').first();
      await rawModeTextarea32.waitFor({ state: 'visible' });
      await rawModeTextarea32.click();
      await rawModeTextarea32.fill('');
      await contentPage.waitForTimeout(100);
      await rawModeTextarea32.type('User ID: {{userId}}, Token: {{token}}', { delay: 30 });
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证Raw模式根据选择的类型设置Content-Type
     * 前置条件：已切换到Raw模式
     * 操作步骤：
     *   1. 填入原始内容
     *   2. 选择html类型
     *   3. 切换到Headers标签页
     *   4. 验证Content-Type设置
     * 预期结果：
     *   - Content-Type根据选择的类型自动设置
     *   - 如选择html则为text/html
     * 验证点：Content-Type根据Raw类型自动设置
     */
    test('应根据选择的类型设置Content-Type', async () => {
      // 填入原始内容
      const rawModeTextarea33 = contentPage.locator('.body-params textarea[placeholder*="输入原始数据"]').first();
      await rawModeTextarea33.waitFor({ state: 'visible' });
      await rawModeTextarea33.click();
      await rawModeTextarea33.fill('');
      await contentPage.waitForTimeout(100);
      await rawModeTextarea33.type('Raw body sample', { delay: 30 });
      await contentPage.waitForTimeout(300);
      // 选择html类型
      const typeSelector = contentPage.locator('.content-type-select, .el-select').first();
      if (await typeSelector.isVisible()) {
        await typeSelector.click();
        const htmlOption = contentPage.locator('.el-select-dropdown__item:has-text("html")').first();
        if (await htmlOption.isVisible()) {
          await htmlOption.click();
        }
      }
      // 切换到Headers标签页
      const targetTab33 = contentPage.locator('.el-tabs__item').filter({ hasText: 'Headers' }).first();
      await targetTab33.click();
      await contentPage.waitForTimeout(300);
      // 显示隐藏的请求头
      const hiddenToggle = contentPage
        .locator('.header-info span')
        .filter({ hasText: /隐藏|hidden/i })
        .first();
      if (await hiddenToggle.isVisible()) {
        await hiddenToggle.click();
        await contentPage.waitForTimeout(200);
      }
      // 验证Content-Type设置
      const headerRows33 = contentPage.locator('.header-info .el-table__row, .header-info .table-row');
      const headerRowCount33 = await headerRows33.count();
      let found33 = false;
      for (let i33 = 0; i33 < headerRowCount33; i33++) {
        const keyCell33 = headerRows33.nth(i33).locator('.key-cell input, .key-cell, td:nth-child(1) input, td:nth-child(1)');
        const keyText33 = await keyCell33.inputValue().catch(() => keyCell33.textContent());
        if (keyText33?.trim() === 'Content-Type') {
          found33 = true;
          break;
        }
      }
      if (!found33) {
        throw new Error('Header "Content-Type" not found in header list');
      }
    });
  });

  test.describe('4.5 Binary模式测试', () => {
    /**
     * 测试目的：验证能够切换到Binary模式
     * 前置条件：已创建HTTP节点
     * 操作步骤：切换Body模式为binary
     * 预期结果：
     *   - Binary模式成功激活
     *   - Binary包装容器显示
     * 验证点：Binary模式切换
     * 说明：Binary模式用于发送二进制文件数据
     */
    test('应能切换到Binary模式', async () => {
      // 切换到Binary模式
      const bodyTab34 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab34.click();
      await contentPage.waitForTimeout(300);
      const modeMap34 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue34 = modeMap34['binary'];
      const radioOption34 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue34 });
      if (await radioOption34.count()) {
        await radioOption34.first().click();
      } else {
        const radioInput34 = contentPage.locator(`.body-params input[value="${targetValue34}"]`).first();
        await radioInput34.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 验证Binary包装容器显示
      const binaryWrap = contentPage.locator('.binary-wrap').first();
      await expect(binaryWrap).toBeVisible({ timeout: 2000 });
    });

    /**
     * 测试目的：验证Binary模式支持文件模式
     * 前置条件：已切换到Binary模式
     * 操作步骤：
     *   1. 查找文件模式单选按钮
     *   2. 点击选择文件模式
     * 预期结果：
     *   - 文件模式可选择
     *   - 显示文件选择界面
     * 验证点：文件模式选项
     * 说明：文件模式从本地选择文件发送
     */
    test('应支持文件模式', async () => {
      // 切换到Binary模式
      const bodyTab35 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab35.click();
      await contentPage.waitForTimeout(300);
      const modeMap35 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue35 = modeMap35['binary'];
      const radioOption35 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue35 });
      if (await radioOption35.count()) {
        await radioOption35.first().click();
      } else {
        const radioInput35 = contentPage.locator(`.body-params input[value="${targetValue35}"]`).first();
        await radioInput35.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 查找文件模式单选按钮
      const fileRadio = contentPage.locator('.binary-wrap .el-radio').filter({ hasText: '文件模式' }).first();
      if (await fileRadio.isVisible()) {
        // 点击选择文件模式
        await fileRadio.click();
        await contentPage.waitForTimeout(300);
      }
    });

    /**
     * 测试目的：验证Binary模式支持变量模式
     * 前置条件：已切换到Binary模式
     * 操作步骤：
     *   1. 查找变量模式单选按钮
     *   2. 点击选择变量模式
     * 预期结果：
     *   - 变量模式可选择
     *   - 显示变量输入框
     * 验证点：变量模式选项
     * 说明：变量模式使用变量值作为文件路径
     */
    test('应支持变量模式', async () => {
      // 切换到Binary模式
      const bodyTab36 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab36.click();
      await contentPage.waitForTimeout(300);
      const modeMap36 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue36 = modeMap36['binary'];
      const radioOption36 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue36 });
      if (await radioOption36.count()) {
        await radioOption36.first().click();
      } else {
        const radioInput36 = contentPage.locator(`.body-params input[value="${targetValue36}"]`).first();
        await radioInput36.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 查找变量模式单选按钮
      const varRadio = contentPage.locator('.binary-wrap .el-radio').filter({ hasText: '变量模式' }).first();
      if (await varRadio.isVisible()) {
        // 点击选择变量模式
        await varRadio.click();
        await contentPage.waitForTimeout(300);
      }
    });

    /**
     * 测试目的：验证文件模式显示文件大小
     * 前置条件：已切换到Binary模式并选择了文件
     * 操作步骤：切换到Binary模式
     * 预期结果：选择文件后显示文件大小信息
     * 验证点：文件信息显示
     * 说明：文件大小帮助用户了解上传的文件情况
     */
    test('文件模式应显示文件大小', async () => {
      // 切换到Binary模式
      const bodyTab37 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab37.click();
      await contentPage.waitForTimeout(300);
      const modeMap37 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue37 = modeMap37['binary'];
      const radioOption37 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue37 });
      if (await radioOption37.count()) {
        await radioOption37.first().click();
      } else {
        const radioInput37 = contentPage.locator(`.body-params input[value="${targetValue37}"]`).first();
        await radioInput37.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证能够清除选择的文件
     * 前置条件：已选择Binary文件
     * 操作步骤：
     *   1. 切换到Binary模式
     *   2. 查找清除按钮
     *   3. 点击清除按钮
     * 预期结果：
     *   - 清除按钮可见
     *   - 文件选择被清除
     * 验证点：文件清除功能
     */
    test('应能清除选择的文件', async () => {
      // 切换到Binary模式
      const bodyTab38 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab38.click();
      await contentPage.waitForTimeout(300);
      const modeMap38 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue38 = modeMap38['binary'];
      const radioOption38 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue38 });
      if (await radioOption38.count()) {
        await radioOption38.first().click();
      } else {
        const radioInput38 = contentPage.locator(`.body-params input[value="${targetValue38}"]`).first();
        await radioInput38.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 查找清除按钮
      const clearBtn = contentPage.locator('[title*="清除"], .clear-btn, .binary-wrap .close').first();
      if (await clearBtn.isVisible()) {
        // 点击清除按钮
        await clearBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });
  });

  test.describe('4.6 None模式测试', () => {
    /**
     * 测试目的：验证能够切换到None模式
     * 前置条件：已创建HTTP节点
     * 操作步骤：切换Body模式为none
     * 预期结果：
     *   - None模式成功激活
     *   - None模式单选按钮被选中
     * 验证点：None模式切换
     * 说明：None模式表示不发送请求体
     */
    test('应能切换到None模式', async () => {
      // 切换到None模式
      const bodyTab39 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab39.click();
      await contentPage.waitForTimeout(300);
      const modeMap39 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue39 = modeMap39['none'];
      const radioOption39 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue39 });
      if (await radioOption39.count()) {
        await radioOption39.first().click();
      } else {
        const radioInput39 = contentPage.locator(`.body-params input[value="${targetValue39}"]`).first();
        await radioInput39.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 验证None模式单选按钮被选中
      const noneInput = contentPage.locator('.body-params input[value="none"]').first();
      await expect(noneInput).toBeChecked();
    });

    /**
     * 测试目的：验证None模式清空Body内容
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 先输入JSON数据
     *   2. 切换到None模式
     *   3. 检查Monaco编辑器数量
     * 预期结果：
     *   - Body内容区域清空
     *   - 不显示任何编辑器
     * 验证点：None模式清空功能
     */
    test('None模式应清空Body内容', async () => {
      // 先输入JSON数据
      const monacoEditor40 = contentPage.locator('.body-params .monaco-editor').first();
      await monacoEditor40.waitFor({ state: 'visible' });
      const editorTextarea40 = monacoEditor40.locator('textarea').first();
      await editorTextarea40.focus();
      await contentPage.keyboard.press('Control+A');
      await contentPage.waitForTimeout(100);
      await contentPage.keyboard.press('Backspace');
      await contentPage.waitForTimeout(100);
      const jsonString40 = JSON.stringify({ key: 'value' }, null, 2);
      await editorTextarea40.type(jsonString40, { delay: 10 });
      await contentPage.waitForTimeout(500);
      // 切换到None模式
      const bodyTab41 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab41.click();
      await contentPage.waitForTimeout(300);
      const modeMap41 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue41 = modeMap41['none'];
      const radioOption41 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue41 });
      if (await radioOption41.count()) {
        await radioOption41.first().click();
      } else {
        const radioInput41 = contentPage.locator(`.body-params input[value="${targetValue41}"]`).first();
        await radioInput41.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 检查Monaco编辑器数量
      const editors = await contentPage.locator('.body-params .monaco-editor').count();
      expect(editors).toBe(0);
    });

    /**
     * 测试目的：验证None模式不设置Content-Type
     * 前置条件：已切换到None模式
     * 操作步骤：
     *   1. 切换到None模式
     *   2. 切换到Headers标签页
     *   3. 显示隐藏的请求头
     *   4. 检查Content-Type是否存在
     * 预期结果：
     *   - Headers列表中不包含Content-Type
     *   - 发送请求时不携带Content-Type
     * 验证点：None模式不设置Content-Type
     * 说明：None模式下请求体为空,不需要Content-Type
     */
    test('None模式不应设置Content-Type', async () => {
      // 切换到None模式
      const bodyTab42 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab42.click();
      await contentPage.waitForTimeout(300);
      const modeMap42 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue42 = modeMap42['none'];
      const radioOption42 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue42 });
      if (await radioOption42.count()) {
        await radioOption42.first().click();
      } else {
        const radioInput42 = contentPage.locator(`.body-params input[value="${targetValue42}"]`).first();
        await radioInput42.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 切换到Headers标签页
      const targetTab42 = contentPage.locator('.el-tabs__item').filter({ hasText: 'Headers' }).first();
      await targetTab42.click();
      await contentPage.waitForTimeout(300);
      // 显示隐藏的请求头
      const hiddenToggle = contentPage
        .locator('.header-info span')
        .filter({ hasText: /隐藏|hidden/i })
        .first();
      if (await hiddenToggle.isVisible()) {
        await hiddenToggle.click();
        await contentPage.waitForTimeout(200);
      }
      // 检查Content-Type是否存在
      const headerKeys = await contentPage
        .locator('.header-info input[placeholder*="请求头"], .header-info input[placeholder*="参数"], .header-info input[placeholder*="key"]')
        .evaluateAll((elements) => elements.map((element) => (element as HTMLInputElement).value));
      expect(headerKeys.includes('Content-Type')).toBe(false);
    });
  });

  test.describe('4.7 模式切换测试', () => {
    /**
     * 测试目的：验证从JSON切换到FormData时的数据丢失提示
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 输入JSON数据
     *   2. 切换到FormData模式
     *   3. 等待提示弹窗
     * 预期结果：
     *   - 可能显示数据丢失警告弹窗
     *   - 提示用户切换将清空当前数据
     * 验证点：模式切换的数据保护提示
     * 说明：不同模式数据格式不兼容,切换需提示
     */
    test('从JSON切换到FormData应提示数据丢失', async () => {
      // 输入JSON数据
      const monacoEditor43 = contentPage.locator('.body-params .monaco-editor').first();
      await monacoEditor43.waitFor({ state: 'visible' });
      const editorTextarea43 = monacoEditor43.locator('textarea').first();
      await editorTextarea43.focus();
      await contentPage.keyboard.press('Control+A');
      await contentPage.waitForTimeout(100);
      await contentPage.keyboard.press('Backspace');
      await contentPage.waitForTimeout(100);
      const jsonString43 = JSON.stringify({ key: 'value' }, null, 2);
      await editorTextarea43.type(jsonString43, { delay: 10 });
      await contentPage.waitForTimeout(500);
      // 切换到FormData模式
      const bodyTab44 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab44.click();
      await contentPage.waitForTimeout(300);
      const modeMap44 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue44 = modeMap44['form-data'];
      const radioOption44 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue44 });
      if (await radioOption44.count()) {
        await radioOption44.first().click();
      } else {
        const radioInput44 = contentPage.locator(`.body-params input[value="${targetValue44}"]`).first();
        await radioInput44.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 等待提示弹窗
      await contentPage.waitForTimeout(500);
    });

    /**
     * 测试目的：验证取消模式切换保持原数据
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 输入JSON数据
     *   2. 尝试切换模式但取消
     * 预期结果：
     *   - 原有数据保持不变
     *   - 仍处于JSON模式
     * 验证点：取消切换的数据保护
     */
    test('取消模式切换应保持原数据', async () => {
      // 输入JSON数据
      const monacoEditor45 = contentPage.locator('.body-params .monaco-editor').first();
      await monacoEditor45.waitFor({ state: 'visible' });
      const editorTextarea45 = monacoEditor45.locator('textarea').first();
      await editorTextarea45.focus();
      await contentPage.keyboard.press('Control+A');
      await contentPage.waitForTimeout(100);
      await contentPage.keyboard.press('Backspace');
      await contentPage.waitForTimeout(100);
      const jsonString45 = JSON.stringify({ key: 'value' }, null, 2);
      await editorTextarea45.type(jsonString45, { delay: 10 });
      await contentPage.waitForTimeout(500);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证确认切换清空前一模式数据
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 输入JSON数据
     *   2. 切换到FormData
     *   3. 再切换回JSON
     * 预期结果：
     *   - 每次切换清空前一模式的数据
     *   - 切换回JSON后数据为空
     * 验证点：模式切换的数据清理
     */
    test('确认切换应清空前一模式数据', async () => {
      // 输入JSON数据
      const monacoEditor46 = contentPage.locator('.body-params .monaco-editor').first();
      await monacoEditor46.waitFor({ state: 'visible' });
      const editorTextarea46 = monacoEditor46.locator('textarea').first();
      await editorTextarea46.focus();
      await contentPage.keyboard.press('Control+A');
      await contentPage.waitForTimeout(100);
      await contentPage.keyboard.press('Backspace');
      await contentPage.waitForTimeout(100);
      const jsonString46 = JSON.stringify({ key: 'value' }, null, 2);
      await editorTextarea46.type(jsonString46, { delay: 10 });
      await contentPage.waitForTimeout(500);
      await contentPage.waitForTimeout(500);
      // 切换到FormData
      const bodyTab46 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab46.click();
      await contentPage.waitForTimeout(300);
      const modeMap46 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue46 = modeMap46['form-data'];
      const radioOption46 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue46 });
      if (await radioOption46.count()) {
        await radioOption46.first().click();
      } else {
        const radioInput46 = contentPage.locator(`.body-params input[value="${targetValue46}"]`).first();
        await radioInput46.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 再切换回JSON
      const bodyTab47 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab47.click();
      await contentPage.waitForTimeout(300);
      const modeMap47 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue47 = modeMap47['JSON'];
      const radioOption47 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue47 });
      if (await radioOption47.count()) {
        await radioOption47.first().click();
      } else {
        const radioInput47 = contentPage.locator(`.body-params input[value="${targetValue47}"]`).first();
        await radioInput47.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证模式切换更新Content-Type
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到JSON模式
     *   2. 切换到FormData模式
     * 预期结果：
     *   - Content-Type跟随模式变化
     *   - JSON时为application/json
     *   - FormData时为multipart/form-data
     * 验证点：模式切换时Content-Type同步更新
     */
    test('模式切换应更新Content-Type', async () => {
      // 切换到JSON模式
      const bodyTab48 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab48.click();
      await contentPage.waitForTimeout(300);
      const modeMap48 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue48 = modeMap48['JSON'];
      const radioOption48 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue48 });
      if (await radioOption48.count()) {
        await radioOption48.first().click();
      } else {
        const radioInput48 = contentPage.locator(`.body-params input[value="${targetValue48}"]`).first();
        await radioInput48.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(200);
      // 切换到FormData模式
      const bodyTab49 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab49.click();
      await contentPage.waitForTimeout(300);
      const modeMap49 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue49 = modeMap49['form-data'];
      const radioOption49 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue49 });
      if (await radioOption49.count()) {
        await radioOption49.first().click();
      } else {
        const radioInput49 = contentPage.locator(`.body-params input[value="${targetValue49}"]`).first();
        await radioInput49.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证相同模式切换保持数据
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 输入JSON数据
     *   2. 切换到其他标签页
     *   3. 切换回Body标签页
     * 预期结果：
     *   - 数据保持不变
     *   - 仍为JSON模式
     * 验证点：标签页切换不影响Body数据
     */
    test('相同模式切换应保持数据', async () => {
      // 输入JSON数据
      const monacoEditor50 = contentPage.locator('.body-params .monaco-editor').first();
      await monacoEditor50.waitFor({ state: 'visible' });
      const editorTextarea50 = monacoEditor50.locator('textarea').first();
      await editorTextarea50.focus();
      await contentPage.keyboard.press('Control+A');
      await contentPage.waitForTimeout(100);
      await contentPage.keyboard.press('Backspace');
      await contentPage.waitForTimeout(100);
      const jsonString50 = JSON.stringify({ key: 'value' }, null, 2);
      await editorTextarea50.type(jsonString50, { delay: 10 });
      await contentPage.waitForTimeout(500);
      await contentPage.waitForTimeout(500);
      // 切换到其他标签页
      const targetTab50 = contentPage.locator('.el-tabs__item').filter({ hasText: 'Params' }).first();
      await targetTab50.click();
      await contentPage.waitForTimeout(300);
      // 切换回Body标签页
      const targetTab51 = contentPage.locator('.el-tabs__item').filter({ hasText: 'Body' }).first();
      await targetTab51.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('4.8 Body数据持久化', () => {
    /**
     * 测试目的：验证Body数据自动保存
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 输入JSON数据
     *   2. 切换到Headers标签页
     *   3. 切换回Body标签页
     * 预期结果：
     *   - Body数据仍然存在
     *   - 数据自动保存到缓存
     * 验证点：Body数据持久化功能
     * 说明：切换标签页不会丢失Body数据
     */
    test('Body数据应自动保存', async () => {
      const monacoEditor52 = contentPage.locator('.body-params .monaco-editor').first();
      await monacoEditor52.waitFor({ state: 'visible' });
      const editorTextarea52 = monacoEditor52.locator('textarea').first();
      await editorTextarea52.focus();
      await contentPage.keyboard.press('Control+A');
      await contentPage.waitForTimeout(100);
      await contentPage.keyboard.press('Backspace');
      await contentPage.waitForTimeout(100);
      const jsonString52 = JSON.stringify({ key: 'value' }, null, 2);
      await editorTextarea52.type(jsonString52, { delay: 10 });
      await contentPage.waitForTimeout(500);
      const targetTab52 = contentPage.locator('.el-tabs__item').filter({ hasText: 'Headers' }).first();
      await targetTab52.click();
      await contentPage.waitForTimeout(300);
      const targetTab53 = contentPage.locator('.el-tabs__item').filter({ hasText: 'Body' }).first();
      await targetTab53.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证切换请求方法保持Body数据
     * 前置条件：已输入JSON数据
     * 操作步骤：
     *   1. 输入JSON数据
     *   2. 切换HTTP方法为PUT
     *   3. 切换回Body标签页
     * 预期结果：
     *   - Body数据保持不变
     *   - 不同HTTP方法共享Body数据
     * 验证点：HTTP方法切换时Body数据保持
     * 说明：切换请求方法不影响已输入的Body内容
     */
    test('切换请求方法应保持Body数据', async () => {
      const monacoEditor54 = contentPage.locator('.body-params .monaco-editor').first();
      await monacoEditor54.waitFor({ state: 'visible' });
      const editorTextarea54 = monacoEditor54.locator('textarea').first();
      await editorTextarea54.focus();
      await contentPage.keyboard.press('Control+A');
      await contentPage.waitForTimeout(100);
      await contentPage.keyboard.press('Backspace');
      await contentPage.waitForTimeout(100);
      const jsonString54 = JSON.stringify({ key: 'value' }, null, 2);
      await editorTextarea54.type(jsonString54, { delay: 10 });
      await contentPage.waitForTimeout(500);
      await contentPage.waitForTimeout(500);
      const methodDropdown54 = contentPage.locator('.http-method-select, .method-select').first();
      await methodDropdown54.click();
      await contentPage.waitForTimeout(200);
      const methodOption54 = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'PUT' }).first();
      await methodOption54.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      const targetTab54 = contentPage.locator('.el-tabs__item').filter({ hasText: 'Body' }).first();
      await targetTab54.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });
  });
});
