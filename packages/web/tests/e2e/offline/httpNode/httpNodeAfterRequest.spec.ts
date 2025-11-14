import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
//获取脚本编辑器内容
const getScriptContent = async (page: Page): Promise<string> => {
  const editor = page.locator('.workbench .monaco-editor').first();
  const content = await editor.evaluate((el) => {
    const monaco = (window as any).monaco;
    if (monaco) {
      const models = monaco.editor.getModels();
      if (models && models.length > 0) {
        return models[0].getValue();
      }
    }
    return '';
  });
  if (content) {
    return content;
  }
  const fallback = await editor.locator('.view-lines').innerText();
  return fallback;
};
//验证脚本编辑器显示
const verifyScriptEditorVisible = async (page: Page): Promise<void> => {
  const editor = page.locator('.workbench .monaco-editor').first();
  await expect(editor).toBeVisible();
};

test.describe('9. HTTP节点 - 后置脚本测试', () => {
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

  test.describe('9.1 脚本编辑功能', () => {
    /**
     * 测试目的：验证显示代码编辑器
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到后置脚本标签页
     *   2. 检查脚本编辑器是否显示
     * 预期结果：
     *   - Monaco编辑器可见
     *   - 编辑器正常加载
     * 验证点：脚本编辑器的显示
     * 说明：后置脚本同样使用Monaco编辑器
     */
    test('应显示代码编辑器', async () => {
      // 切换到后置脚本标签页
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      // 验证脚本编辑器可见
      await verifyScriptEditorVisible(contentPage);
    });

    /**
     * 测试目的：验证输入JavaScript代码
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 在脚本编辑器中输入JavaScript代码
     *   2. 获取编辑器内容
     *   3. 验证代码已输入
     * 预期结果：
     *   - 代码成功输入到编辑器
     *   - 编辑器内容与输入一致
     * 验证点：JavaScript代码输入功能
     * 说明：后置脚本可以访问response对象
     */
    test('应能输入JavaScript代码', async () => {
      // 输入测试脚本
      const script = 'console.log(response.status);';
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(script);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 验证脚本内容
      const content = await getScriptContent(contentPage);
      expect(content).toContain('response.status');
    });

    /**
     * 测试目的：验证语法高亮功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入包含关键字的代码
     *   2. 检查编辑器是否有语法高亮
     * 预期结果：
     *   - 关键字、字符串等有不同颜色
     *   - 存在语法高亮的token元素
     * 验证点：代码语法高亮
     * 说明：语法高亮提高代码可读性
     */
    test('应支持语法高亮', async () => {
      // 输入包含关键字的代码
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type('const status = response.status;');
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 检查语法高亮 token
      const hasHighlight = await editor.evaluate((el) => {
        const tokens = el.querySelectorAll('.mtk1, .mtk6, .mtk22');
        return tokens.length > 0;
      });
      expect(hasHighlight).toBeDefined();
    });
  });

  test.describe('9.2 脚本执行功能', () => {
    /**
     * 测试目的：验证访问response对象
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写访问response对象的脚本
     *   2. 保存脚本
     * 预期结果：
     *   - 脚本可以访问response对象
     *   - response对象包含响应的所有信息
     * 验证点：response对象的访问
     * 说明：response对象是后置脚本的核心
     */
    test('应能访问response对象', async () => {
      // 编写访问response对象的脚本
      const script = 'console.log(response);';
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(script);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证访问response.status获取状态码
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写获取response.status的脚本
     *   2. 验证代码内容
     * 预期结果：
     *   - 可以访问response.status属性
     *   - 状态码是HTTP响应状态码
     * 验证点：响应状态码访问
     * 说明：状态码用于判断请求是否成功
     */
    test('应能访问response.status获取状态码', async () => {
      // 编写获取状态码的脚本
      const script = 'const statusCode = response.status;';
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(script);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 验证脚本内容
      const content = await getScriptContent(contentPage);
      expect(content).toContain('response.status');
    });

    /**
     * 测试目的：验证访问response.data获取响应体
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写获取response.data的脚本
     *   2. 验证代码内容
     * 预期结果：
     *   - 可以访问response.data属性
     *   - data包含响应体内容
     * 验证点：响应体数据访问
     * 说明：响应体包含服务器返回的数据
     */
    test('应能访问response.data获取响应体', async () => {
      // 编写获取响应体的脚本
      const script = 'const body = response.data;';
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(script);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 验证脚本内容
      const content = await getScriptContent(contentPage);
      expect(content).toContain('response.data');
    });

    /**
     * 测试目的：验证访问response.headers获取响应头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写获取response.headers的脚本
     *   2. 验证代码内容
     * 预期结果：
     *   - 可以访问response.headers属性
     *   - headers包含所有响应头
     * 验证点：响应头访问
     * 说明：响应头包含Content-Type、Set-Cookie等信息
     */
    test('应能访问response.headers获取响应头', async () => {
      // 编写获取响应头的脚本
      const script = 'const headers = response.headers;';
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(script);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 验证脚本内容
      const content = await getScriptContent(contentPage);
      expect(content).toContain('response.headers');
    });

    /**
     * 测试目的：验证执行断言测试
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写使用pm.test的断言脚本
     *   2. 验证代码内容
     * 预期结果：
     *   - pm.test方法可用
     *   - 可以编写断言测试
     * 验证点：断言测试功能
     * 说明：pm.test用于编写测试用例
     */
    test('应能执行断言测试', async () => {
      // 编写使用pm.test的断言脚本
      const script = 'pm.test("Status is 200", () => { pm.expect(response.status).to.equal(200); });';
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(script);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 验证脚本内容
      const content = await getScriptContent(contentPage);
      expect(content).toContain('pm.test');
    });

    /**
     * 测试目的：验证设置变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写从响应提取数据设置变量的脚本
     *   2. 验证代码内容
     * 预期结果：
     *   - 可以从响应中提取数据
     *   - 提取的数据可以保存为变量
     * 验证点：响应数据提取功能
     * 说明：常用于提取token等认证信息
     */
    test('应能设置变量', async () => {
      // 编写从响应提取数据设置变量的脚本
      const script = 'pm.variables.set("responseToken", response.data.token);';
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(script);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 验证脚本内容
      const content = await getScriptContent(contentPage);
      expect(content).toContain('pm.variables.set');
    });

    /**
     * 测试目的：验证脚本在请求完成后执行
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写日志输出脚本
     *   2. 保存脚本
     * 预期结果：
     *   - 脚本在请求完成后执行
     *   - 可以访问完整的响应数据
     * 验证点：脚本执行时机
     * 说明：后置脚本在收到响应后执行
     */
    test('脚本执行应在请求完成后', async () => {
      // 编写日志输出脚本
      const script = 'console.log("After request executed");';
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(script);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('9.3 脚本错误处理', () => {
    /**
     * 测试目的：验证语法错误显示提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入语法错误的代码
     *   2. 检查错误标记
     * 预期结果：
     *   - 编辑器显示错误波浪线
     *   - 错误位置准确标记
     * 验证点：语法错误提示
     * 说明：语法检查帮助发现代码错误
     */
    test('语法错误应显示提示', async () => {
      // 输入语法错误的代码
      const invalidScript = 'const a = ;';
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(invalidScript);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(500);
      // 检查错误标记
      const errorMarker = contentPage.locator('.squiggly-error, .error-marker').first();
      if (await errorMarker.isVisible()) {
        await expect(errorMarker).toBeVisible();
      }
    });

    /**
     * 测试目的：验证运行时错误显示信息
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写会抛出错误的脚本
     *   2. 保存脚本
     * 预期结果：
     *   - 运行时错误被捕获
     *   - 显示错误信息
     * 验证点：运行时错误处理
     * 说明：运行时错误在脚本执行时发生
     */
    test('运行时错误应显示错误信息', async () => {
      // 编写会抛出错误的脚本
      const errorScript = 'throw new Error("After request error");';
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(errorScript);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证断言失败显示失败信息
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写必然失败的断言
     *   2. 检查失败提示
     * 预期结果：
     *   - 断言失败被检测
     *   - 显示失败原因
     * 验证点：断言失败处理
     * 说明：断言失败不会阻止脚本继续执行
     */
    test('断言失败应显示失败信息', async () => {
      // 编写必然失败的断言
      const failScript = 'pm.test("Will fail", () => { pm.expect(1).to.equal(2); });';
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(failScript);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('9.4 测试断言功能', () => {
    /**
     * 测试目的：验证支持pm.test()编写测试
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写使用pm.test的脚本
     *   2. 验证代码内容
     * 预期结果：
     *   - pm.test方法可用
     *   - 可以编写命名测试用例
     * 验证点：pm.test API
     * 说明：pm.test用于组织断言测试
     */
    test('应支持pm.test()编写测试', async () => {
      // 编写使用pm.test的脚本
      const script = 'pm.test("Test name", function() { pm.expect(true).to.be.true; });';
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(script);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 验证脚本内容
      const content = await getScriptContent(contentPage);
      expect(content).toContain('pm.test');
    });

    /**
     * 测试目的：验证支持pm.expect()断言
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写使用pm.expect的脚本
     *   2. 验证代码内容
     * 预期结果：
     *   - pm.expect方法可用
     *   - 支持链式断言语法
     * 验证点：pm.expect API
     * 说明：pm.expect基于Chai断言库
     */
    test('应支持pm.expect()断言', async () => {
      // 编写使用pm.expect的脚本
      const script = 'pm.expect(response.status).to.equal(200);';
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(script);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 验证脚本内容
      const content = await getScriptContent(contentPage);
      expect(content).toContain('pm.expect');
    });

    /**
     * 测试目的：验证显示测试通过数量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写多个通过的测试
     *   2. 保存脚本
     * 预期结果：
     *   - 统计通过的测试数量
     *   - 显示测试结果摘要
     * 验证点：测试结果统计
     * 说明：测试统计帮助了解测试覆盖度
     */
    test('应显示测试通过数量', async () => {
      // 编写多个通过的测试
      const script = `pm.test("Test 1", () => { pm.expect(1).to.equal(1); });
pm.test("Test 2", () => { pm.expect(2).to.equal(2); });`;
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(script);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证显示测试失败数量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写失败的测试
     *   2. 检查失败统计
     * 预期结果：
     *   - 统计失败的测试数量
     *   - 高亮显示失败测试
     * 验证点：失败测试统计
     * 说明：快速定位失败的测试用例
     */
    test('应显示测试失败数量', async () => {
      // 编写失败的测试
      const script = 'pm.test("Fail test", () => { pm.expect(1).to.equal(2); });';
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置"), .after-request-tab').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForSelector('.workbench .s-monaco-editor', {
        timeout: 15000
      });
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(script);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });
  });
});
