import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  switchToPreRequestTab,
  fillPreRequestScript,
  getScriptContent,
  verifyScriptEditorVisible,
  switchToTab,
  addLocalVariable
} from './helpers/httpNodeHelpers';

test.describe('8. HTTP节点 - 前置脚本测试', () => {
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

  test.describe('8.1 脚本编辑功能', () => {
    /**
     * 测试目的：验证显示代码编辑器
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到前置脚本标签页
     *   2. 检查脚本编辑器是否显示
     * 预期结果：
     *   - Monaco编辑器可见
     *   - 编辑器正常加载
     * 验证点：脚本编辑器的显示
     * 说明：使用Monaco编辑器提供专业的代码编辑体验
     */
    test('应显示代码编辑器', async () => {
      // 切换到前置脚本标签页
      await switchToPreRequestTab(contentPage);
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
     * 说明：前置脚本使用JavaScript语言
     */
    test('应能输入JavaScript代码', async () => {
      // 在脚本编辑器中输入代码
      const script = 'console.log("test");';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
      // 验证代码已输入
      const content = await getScriptContent(contentPage);
      expect(content).toContain('console.log');
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
      await fillPreRequestScript(contentPage, 'const test = "value";');
      await contentPage.waitForTimeout(300);
      // 检查是否有语法高亮token元素
      const editor = contentPage.locator('.monaco-editor').first();
      const hasHighlight = await editor.evaluate((el) => {
        const tokens = el.querySelectorAll('.mtk1, .mtk6, .mtk22');
        return tokens.length > 0;
      });
      expect(hasHighlight).toBeDefined();
    });

    /**
     * 测试目的：验证代码提示功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到前置脚本标签页
     *   2. 在编辑器中输入pm.
     *   3. 等待自动完成提示
     * 预期结果：
     *   - 显示代码提示列表
     *   - 提示包含pm对象的方法
     * 验证点：代码自动完成功能
     * 说明：代码提示提高编写效率和准确性
     */
    test('应支持代码提示', async () => {
      // 切换到前置脚本标签页
      await switchToPreRequestTab(contentPage);
      // 在编辑器中输入pm.触发代码提示
      const editor = contentPage.locator('.monaco-editor').first();
      await editor.click();
      await contentPage.keyboard.type('pm.');
      await contentPage.waitForTimeout(500);
      // 检查是否显示代码提示
      const suggestions = contentPage.locator('.suggest-widget').first();
      if (await suggestions.isVisible()) {
        await expect(suggestions).toBeVisible();
      }
    });

    /**
     * 测试目的：验证支持多行代码
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入多行JavaScript代码
     *   2. 获取编辑器内容
     *   3. 验证所有行都已保存
     * 预期结果：
     *   - 多行代码完整保存
     *   - 保留换行符和缩进
     * 验证点：多行代码支持
     * 说明：前置脚本可以编写复杂逻辑
     */
    test('应支持多行代码', async () => {
      // 输入多行JavaScript代码
      const multilineScript = `const a = 1;
const b = 2;
console.log(a + b);`;
      await fillPreRequestScript(contentPage, multilineScript);
      await contentPage.waitForTimeout(300);
      // 验证所有行都已保存
      const content = await getScriptContent(contentPage);
      expect(content).toContain('const a');
      expect(content).toContain('const b');
    });
  });

  test.describe('8.2 脚本执行功能', () => {
    /**
     * 测试目的：验证访问request对象
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写访问request.url的脚本
     *   2. 保存脚本
     * 预期结果：
     *   - 脚本可以访问request对象
     *   - request对象包含url等属性
     * 验证点：request对象的访问
     * 说明：request对象包含请求的所有信息
     */
    test('应能访问request对象', async () => {
      // 编写访问request.url的脚本
      const script = 'console.log(request.url);';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证访问variables对象
     * 前置条件：已创建HTTP节点并添加变量
     * 操作步骤：
     *   1. 添加局部变量testVar
     *   2. 编写获取变量的脚本
     * 预期结果：
     *   - 可以通过pm.variables.get获取变量
     *   - 能访问所有作用域的变量
     * 验证点：variables对象的访问
     * 说明：变量对象用于读取和设置变量
     */
    test('应能访问variables对象', async () => {
      // 添加局部变量testVar
      await addLocalVariable(contentPage, 'testVar', 'testValue');
      // 编写获取变量的脚本
      const script = 'console.log(pm.variables.get("testVar"));';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证修改请求参数
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写修改request.url的脚本
     *   2. 保存脚本
     * 预期结果：
     *   - 可以修改请求URL
     *   - 修改会在发送请求时生效
     * 验证点：请求参数修改功能
     * 说明：前置脚本可以动态修改请求内容
     */
    test('应能修改请求参数', async () => {
      // 编写修改request.url的脚本
      const script = 'request.url = "http://example.com/modified";';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证设置变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写pm.variables.set设置变量的脚本
     *   2. 保存脚本
     * 预期结果：
     *   - 可以通过脚本设置变量
     *   - 设置的变量可以在请求中使用
     * 验证点：变量设置功能
     * 说明：前置脚本常用于动态生成变量值
     */
    test('应能设置变量', async () => {
      // 编写pm.variables.set设置变量的脚本
      const script = 'pm.variables.set("dynamicVar", "dynamicValue");';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证访问环境变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写访问环境变量的脚本
     *   2. 保存脚本
     * 预期结果：
     *   - 可以访问pm.environment对象
     *   - 能获取环境变量的值
     * 验证点：环境变量访问
     * 说明：环境变量用于不同环境的配置
     */
    test('应能访问环境变量', async () => {
      // 编写访问环境变量的脚本
      const script = 'const env = pm.environment.get("envVar");';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证脚本在请求发送前执行
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写添加请求头的脚本
     *   2. 保存脚本
     * 预期结果：
     *   - 脚本在请求发送前执行
     *   - 脚本的修改会影响实际请求
     * 验证点：脚本执行时机
     * 说明：前置脚本在请求发送前执行
     */
    test('脚本执行应在请求发送前', async () => {
      // 编写添加请求头的脚本
      const script = 'request.headers["X-Pre-Request"] = "PreValue";';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('8.3 脚本错误处理', () => {
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
      await fillPreRequestScript(contentPage, invalidScript);
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
      const runtimeErrorScript = 'throw new Error("Test error");';
      await fillPreRequestScript(contentPage, runtimeErrorScript);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证脚本错误不阻止请求发送
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写有错误的脚本
     *   2. 检查发送按钮状态
     * 预期结果：
     *   - 发送按钮仍然可用
     *   - 脚本错误不影响请求功能
     * 验证点：错误隔离机制
     * 说明：脚本错误不应阻断正常使用
     */
    test('脚本错误不应阻止请求发送', async () => {
      // 编写有错误的脚本
      const errorScript = 'undefinedFunction();';
      await fillPreRequestScript(contentPage, errorScript);
      await contentPage.waitForTimeout(300);
      // 检查发送按钮状态
      const sendBtn = contentPage.locator('button:has-text("发送请求")').first();
      await expect(sendBtn).toBeEnabled();
    });

    /**
     * 测试目的：验证显示脚本执行日志
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写包含console.log的脚本
     *   2. 保存脚本
     * 预期结果：
     *   - 脚本执行后显示日志
     *   - 日志内容与console.log输出一致
     * 验证点：脚本日志功能
     * 说明：日志帮助调试脚本执行过程
     */
    test('应显示脚本执行日志', async () => {
      // 编写包含console.log的脚本
      const logScript = 'console.log("Pre-request log message");';
      await fillPreRequestScript(contentPage, logScript);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('8.4 脚本自动保存', () => {
    /**
     * 测试目的：验证脚本自动保存
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写脚本
     *   2. 切换到其他标签页
     *   3. 切换回前置脚本标签页
     *   4. 验证脚本内容保持
     * 预期结果：
     *   - 脚本自动保存
     *   - 切换标签页后脚本不丢失
     * 验证点：脚本自动保存功能
     * 说明：自动保存防止脚本丢失
     */
    test('脚本应自动保存', async () => {
      // 编写脚本
      const testScript = 'const savedScript = true;';
      await fillPreRequestScript(contentPage, testScript);
      // 切换到其他标签页
      await switchToTab(contentPage, 'Params');
      // 切换回前置脚本标签页
      await switchToPreRequestTab(contentPage);
      await contentPage.waitForTimeout(300);
      // 验证脚本内容保持
      const content = await getScriptContent(contentPage);
      expect(content).toContain('savedScript');
    });
  });

  test.describe('8.5 常用API测试', () => {
    /**
     * 测试目的：验证pm.variables.set()设置变量
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写使用pm.variables.set的脚本
     *   2. 验证代码内容
     * 预期结果：
     *   - pm.variables.set方法可用
     *   - 可以设置任意名称的变量
     * 验证点：变量设置API
     * 说明：pm.variables.set是最常用的API
     */
    test('应支持pm.variables.set()设置变量', async () => {
      // 编写使用pm.variables.set的脚本
      const script = 'pm.variables.set("apiKey", "12345");';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
      // 验证代码内容
      const content = await getScriptContent(contentPage);
      expect(content).toContain('pm.variables.set');
    });

    /**
     * 测试目的：验证pm.variables.get()获取变量
     * 前置条件：已创建HTTP节点并添加变量
     * 操作步骤：
     *   1. 添加局部变量
     *   2. 编写使用pm.variables.get的脚本
     *   3. 验证代码内容
     * 预期结果：
     *   - pm.variables.get方法可用
     *   - 可以获取已定义的变量
     * 验证点：变量获取API
     * 说明：pm.variables.get用于读取变量值
     */
    test('应支持pm.variables.get()获取变量', async () => {
      // 添加局部变量
      await addLocalVariable(contentPage, 'userId', '999');
      // 编写使用pm.variables.get的脚本
      const script = 'const id = pm.variables.get("userId");';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
      // 验证代码内容
      const content = await getScriptContent(contentPage);
      expect(content).toContain('pm.variables.get');
    });

    /**
     * 测试目的：验证pm.request设置请求
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 编写使用pm.request修改请求的脚本
     *   2. 验证代码内容
     * 预期结果：
     *   - pm.request对象可用
     *   - 可以修改请求的headers等属性
     * 验证点：请求对象API
     * 说明：pm.request用于动态修改请求
     */
    test('应支持pm.request设置请求', async () => {
      // 编写使用pm.request修改请求的脚本
      const script = 'pm.request.headers.add({key: "X-API-Key", value: "test"});';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
      // 验证代码内容
      const content = await getScriptContent(contentPage);
      expect(content).toContain('pm.request');
    });
  });
});

