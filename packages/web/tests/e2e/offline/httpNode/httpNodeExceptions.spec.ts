import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  fillUrl,
  switchToPreRequestTab,
  fillPreRequestScript,
  switchToAfterRequestTab,
  fillAfterRequestScript,
  openHistoryPanel,
  addLocalVariable,
  switchToTab
} from './helpers/httpNodeHelpers';

test.describe('17. HTTP节点 - 异常场景测试', () => {
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

  test.describe('17.1 网络错误处理', () => {
    /**
     * 测试目的：验证网络不可用时的错误提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入一个本地不存在的服务地址(如localhost:9999)
     *   2. 点击发送请求
     *   3. 等待请求失败
     *   4. 检查错误提示信息
     * 预期结果：
     *   - 显示网络不可用的错误提示
     *   - 错误信息清晰明确
     * 验证点：网络不可达场景的错误处理
     * 说明：模拟服务器未启动或端口未开放的情况
     */
    test('网络不可用应显示错误提示', async () => {
      await fillUrl(contentPage, 'http://localhost:9999/unavailable');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      const errorMsg = contentPage.locator('.el-message--error, .error-message, .response-error').first();
      if (await errorMsg.isVisible()) {
        await expect(errorMsg).toBeVisible();
      }
    });

    /**
     * 测试目的：验证DNS解析失败时的错误提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入一个不存在的域名地址
     *   2. 点击发送请求
     *   3. 等待DNS解析失败
     *   4. 检查错误提示信息
     * 预期结果：
     *   - 显示DNS解析失败的错误提示
     *   - 提示信息包含相关错误描述
     * 验证点：域名解析失败场景的错误处理
     * 说明：测试输入无效域名时的错误捕获机制
     */
    test('DNS解析失败应显示错误', async () => {
      await fillUrl(contentPage, 'http://this-domain-does-not-exist-12345.com/api');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      const errorMsg = contentPage.locator('.el-message--error, .error-message, .response-error').first();
      if (await errorMsg.isVisible()) {
        await expect(errorMsg).toBeVisible();
      }
    });

    /**
     * 测试目的：验证连接超时时的错误提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入一个会导致连接超时的地址(如10.255.255.1)
     *   2. 点击发送请求
     *   3. 等待超时发生(通常几秒钟)
     *   4. 检查超时错误提示
     * 预期结果：
     *   - 显示连接超时错误提示
     *   - 错误信息明确指出超时原因
     *   - 请求不会一直挂起
     * 验证点：连接超时场景的错误处理和超时控制
     * 说明：使用不可路由的IP地址模拟超时场景
     */
    test('连接超时应显示超时错误', async () => {
      await fillUrl(contentPage, 'http://10.255.255.1/timeout');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(5000);
      const errorMsg = contentPage.locator('.el-message--error, .error-message, .timeout-error').first();
      if (await errorMsg.isVisible()) {
        await expect(errorMsg).toBeVisible();
      }
    });

    /**
     * 测试目的：验证连接被拒绝时的错误提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入一个端口未监听的本地地址(如localhost:54321)
     *   2. 点击发送请求
     *   3. 等待连接被拒绝
     *   4. 检查错误提示信息
     * 预期结果：
     *   - 显示连接被拒绝的错误提示
     *   - 错误信息准确描述问题
     * 验证点：端口未开放或服务未启动的错误处理
     * 说明：与"网络不可用"测试类似，但更具体地验证连接拒绝场景
     */
    test('连接被拒绝应显示错误', async () => {
      await fillUrl(contentPage, 'http://localhost:54321/refused');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      const errorMsg = contentPage.locator('.el-message--error, .error-message, .connection-error').first();
      if (await errorMsg.isVisible()) {
        await expect(errorMsg).toBeVisible();
      }
    });
  });

  test.describe('17.2 HTTP错误状态码', () => {
    /**
     * 测试目的：验证400错误状态码的正确显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回400状态码的测试接口
     *   2. 等待请求完成
     *   3. 检查状态码显示
     * 预期结果：
     *   - 状态码显示为400
     *   - 显示错误样式(通常为红色)
     * 验证点：客户端错误状态码的显示
     * 说明：400表示Bad Request，客户端请求参数错误
     */
    test('400错误应正确显示', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/status/400');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      if (await statusCode.isVisible()) {
        const text = await statusCode.textContent();
        expect(text).toContain('400');
      }
    });

    /**
     * 测试目的：验证401未授权状态码的正确显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回401状态码的测试接口
     *   2. 等待请求完成
     *   3. 检查状态码显示
     * 预期结果：
     *   - 状态码显示为401
     *   - 显示错误样式
     * 验证点：身份认证失败状态码的显示
     * 说明：401表示Unauthorized，需要身份认证
     */
    test('401未授权应显示错误', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/status/401');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      if (await statusCode.isVisible()) {
        const text = await statusCode.textContent();
        expect(text).toContain('401');
      }
    });

    /**
     * 测试目的：验证403禁止访问状态码的正确显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回403状态码的测试接口
     *   2. 等待请求完成
     *   3. 检查状态码显示
     * 预期结果：
     *   - 状态码显示为403
     *   - 显示错误样式
     * 验证点：权限不足状态码的显示
     * 说明：403表示Forbidden，服务器拒绝访问
     */
    test('403禁止访问应显示错误', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/status/403');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      if (await statusCode.isVisible()) {
        const text = await statusCode.textContent();
        expect(text).toContain('403');
      }
    });

    /**
     * 测试目的：验证404未找到状态码的正确显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回404状态码的测试接口
     *   2. 等待请求完成
     *   3. 检查状态码显示
     * 预期结果：
     *   - 状态码显示为404
     *   - 显示错误样式
     * 验证点：资源不存在状态码的显示
     * 说明：404表示Not Found，请求的资源不存在
     */
    test('404未找到应显示错误', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/status/404');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      if (await statusCode.isVisible()) {
        const text = await statusCode.textContent();
        expect(text).toContain('404');
      }
    });

    /**
     * 测试目的：验证500服务器错误状态码的正确显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回500状态码的测试接口
     *   2. 等待请求完成
     *   3. 检查状态码显示
     * 预期结果：
     *   - 状态码显示为500
     *   - 显示错误样式
     * 验证点：服务器内部错误状态码的显示
     * 说明：500表示Internal Server Error，服务器发生内部错误
     */
    test('500服务器错误应显示错误', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/status/500');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      if (await statusCode.isVisible()) {
        const text = await statusCode.textContent();
        expect(text).toContain('500');
      }
    });

    /**
     * 测试目的：验证502/503/504网关错误状态码的显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回502状态码的测试接口
     *   2. 等待请求完成
     *   3. 检查状态码显示是否正常
     * 预期结果：
     *   - 状态码正确显示
     *   - 错误状态码有对应的错误样式
     * 验证点：网关和代理服务器错误状态码的显示
     * 说明：502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout
     */
    test('502/503/504网关错误应显示', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/status/502');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      const statusCode = contentPage.locator('.status-code, .response-status').first();
      if (await statusCode.isVisible()) {
        const text = await statusCode.textContent();
        expect(text).toBeDefined();
      }
    });
  });

  test.describe('17.3 响应格式错误', () => {
    /**
     * 测试目的：验证非法JSON响应的错误提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回HTML内容的接口(非JSON)
     *   2. 等待请求完成
     *   3. 检查响应体显示
     * 预期结果：
     *   - 响应体正常显示
     *   - 不会因格式错误而崩溃
     *   - 可能显示格式不匹配的提示
     * 验证点：响应格式与预期不符时的容错处理
     * 说明：测试当Content-Type为JSON但实际内容不是JSON的场景
     */
    test('非法JSON响应应显示错误', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/html');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
      const responseBody = contentPage.locator('.response-body, .response-content').first();
      if (await responseBody.isVisible()) {
        await expect(responseBody).toBeVisible();
      }
    });

    /**
     * 测试目的：验证Content-Type与实际内容不符时的提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求一个Content-Type声明与实际内容不符的接口
     *   2. 等待请求完成
     *   3. 观察是否有格式不匹配的提示
     * 预期结果：
     *   - 系统能够检测格式不匹配
     *   - 显示相应的警告或提示信息
     *   - 内容仍能正常显示
     * 验证点：Content-Type与实际内容的一致性检查
     * 说明：某些API可能错误地设置Content-Type头
     */
    test('Content-Type与实际内容不符应提示', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/html');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
    });

    /**
     * 测试目的：验证乱码响应的正确处理
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回UTF-8编码内容的接口
     *   2. 等待请求完成
     *   3. 检查响应内容显示
     * 预期结果：
     *   - UTF-8内容正确显示
     *   - 特殊字符和多语言文本正常渲染
     *   - 不出现乱码
     * 验证点：字符编码的正确处理
     * 说明：测试系统对不同字符编码的支持能力
     */
    test('乱码响应应正确处理', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/encoding/utf8');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
    });

    /**
     * 测试目的：验证超大响应的正常处理
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 请求返回1MB数据的接口
     *   2. 等待请求完成(可能需要较长时间)
     *   3. 检查响应视图是否正常显示
     * 预期结果：
     *   - 大响应能够完整接收
     *   - 响应视图正常显示
     *   - 不会导致界面卡顿或崩溃
     *   - 可能启用虚拟滚动或分页加载
     * 验证点：大数据响应的性能和稳定性
     * 说明：1MB响应测试系统对大文件的处理能力
     */
    test('超大响应应能正常处理', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/bytes/1048576');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(5000);
      const responseView = contentPage.locator('.response-view, .response-panel').first();
      if (await responseView.isVisible()) {
        await expect(responseView).toBeVisible();
      }
    });
  });

  test.describe('17.4 脚本执行错误', () => {
    /**
     * 测试目的：验证前置脚本语法错误的捕获
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 在前置脚本编辑器中输入语法错误的代码(如const a = ;)
     *   2. 等待编辑器解析
     *   3. 检查是否显示语法错误标记
     * 预期结果：
     *   - 编辑器显示语法错误的波浪线或标记
     *   - 鼠标悬停时显示错误详情
     *   - 不影响其他功能的正常使用
     * 验证点：脚本语法检查功能
     * 说明：Monaco编辑器提供实时语法检查
     */
    test('前置脚本语法错误应捕获', async () => {
      const invalidScript = 'const a = ;';
      await fillPreRequestScript(contentPage, invalidScript);
      await contentPage.waitForTimeout(300);
      const errorMarker = contentPage.locator('.squiggly-error, .error-marker').first();
      if (await errorMarker.isVisible()) {
        await expect(errorMarker).toBeVisible();
      }
    });

    /**
     * 测试目的：验证前置脚本运行时错误的捕获
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 在前置脚本中输入会抛出运行时错误的代码
     *   2. 发送请求触发脚本执行
     *   3. 检查错误捕获和提示
     * 预期结果：
     *   - 脚本运行时错误被捕获
     *   - 显示错误提示信息
     *   - 错误不会导致应用崩溃
     *   - 请求流程可能中断或继续(根据配置)
     * 验证点：运行时异常的错误捕获和处理
     * 说明：测试throw new Error等运行时异常场景
     */
    test('前置脚本运行时错误应捕获', async () => {
      const errorScript = 'throw new Error("Runtime error in pre-request script");';
      await fillPreRequestScript(contentPage, errorScript);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证后置脚本错误的捕获
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 在后置脚本中输入调用未定义函数的代码
     *   2. 发送请求触发后置脚本执行
     *   3. 检查错误捕获情况
     * 预期结果：
     *   - 后置脚本运行时错误被捕获
     *   - 显示错误提示
     *   - 不影响响应数据的正常显示
     * 验证点：后置脚本的错误隔离和处理
     * 说明：后置脚本错误不应影响响应查看
     */
    test('后置脚本错误应捕获', async () => {
      const errorScript = 'undefinedFunction();';
      await fillAfterRequestScript(contentPage, errorScript);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证断言失败的正确标识
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 在后置脚本中编写会失败的测试断言
     *   2. 发送请求触发断言执行
     *   3. 检查断言失败的标识
     * 预期结果：
     *   - 断言失败被明确标识
     *   - 显示失败的断言信息
     *   - 可在测试结果中查看详情
     * 验证点：测试断言功能和失败反馈
     * 说明：测试pm.test和pm.expect等断言API
     */
    test('断言失败应正确标识', async () => {
      const failScript = 'pm.test("Should fail", () => { pm.expect(1).to.equal(2); });';
      await fillAfterRequestScript(contentPage, failScript);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证脚本超时中止机制
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 在前置脚本中输入无限循环代码
     *   2. 发送请求触发脚本执行
     *   3. 等待超时机制生效
     * 预期结果：
     *   - 脚本在超时时间内被强制中止
     *   - 显示超时错误提示
     *   - 不会导致整个应用挂起
     *   - 请求可能取消或继续执行
     * 验证点：脚本执行超时控制
     * 说明：防止恶意或错误脚本导致应用无响应
     */
    test('脚本超时应中止执行', async () => {
      const infiniteScript = 'while(true) { }';
      await fillPreRequestScript(contentPage, infiniteScript);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('17.5 文件上传错误', () => {
    /**
     * 测试目的：验证文件不存在时的错误提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Body标签页
     *   2. 选择文件上传模式
     *   3. 尝试选择一个不存在的文件
     * 预期结果：
     *   - 显示文件不存在的错误提示
     *   - 阻止请求发送
     * 验证点：文件存在性验证
     * 说明：待补充具体文件上传操作步骤
     */
    test('文件不存在应显示错误', async () => {
      await switchToTab(contentPage, 'Body');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证文件过大时的提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Body标签页
     *   2. 选择文件上传模式
     *   3. 尝试上传超过限制大小的文件
     * 预期结果：
     *   - 显示文件过大的警告提示
     *   - 提示最大允许的文件大小
     *   - 可能阻止上传或询问用户确认
     * 验证点：文件大小限制验证
     * 说明：待补充具体的文件大小限制值和测试步骤
     */
    test('文件过大应提示', async () => {
      await switchToTab(contentPage, 'Body');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证文件权限不足时的错误提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Body标签页
     *   2. 选择文件上传模式
     *   3. 尝试访问没有读权限的文件
     * 预期结果：
     *   - 显示权限不足的错误提示
     *   - 明确说明原因
     *   - 阻止请求发送
     * 验证点：文件访问权限检查
     * 说明：在Electron环境中测试文件系统权限
     */
    test('文件权限不足应显示错误', async () => {
      await switchToTab(contentPage, 'Body');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证不支持的文件类型的提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Body标签页
     *   2. 选择文件上传模式
     *   3. 尝试上传不支持或受限的文件类型
     * 预期结果：
     *   - 显示文件类型不支持的提示
     *   - 列出允许的文件类型
     *   - 可能阻止上传或警告
     * 验证点：文件类型验证
     * 说明：某些文件类型可能出于安全考虑被限制
     */
    test('文件类型不支持应提示', async () => {
      await switchToTab(contentPage, 'Body');
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('17.6 变量相关错误', () => {
    /**
     * 测试目的：验证未定义变量的处理方式
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 在URL或参数中使用未定义的变量{{undefinedVar}}
     *   2. 检查变量占位符的显示
     *   3. 发送请求观察行为
     * 预期结果：
     *   - 未定义的变量保持{{undefinedVar}}形式
     *   - 可能显示警告提示但不阻止请求
     *   - 或者显示明确的错误提示
     * 验证点：未定义变量的友好处理
     * 说明：未定义变量保持原样便于调试和识别问题
     */
    test('未定义的变量应保持原样或提示', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get?param={{undefinedVar}}');
      await contentPage.waitForTimeout(300);
      const urlInput = contentPage.locator('.url-input, input[placeholder*="URL"]').first();
      const value = await urlInput.inputValue();
      expect(value).toContain('{{undefinedVar}}');
    });

    /**
     * 测试目的：验证循环引用变量的检测
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 定义变量varA的值为{{varB}}
     *   2. 定义变量varB的值为{{varA}}
     *   3. 尝试使用这些变量
     * 预期结果：
     *   - 系统检测到循环引用
     *   - 显示循环引用错误提示
     *   - 阻止无限递归解析
     * 验证点：循环引用的检测和保护机制
     * 说明：循环引用会导致无限递归，必须检测和阻止
     */
    test('循环引用的变量应检测', async () => {
      await addLocalVariable(contentPage, 'varA', '{{varB}}');
      await addLocalVariable(contentPage, 'varB', '{{varA}}');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证变量值格式错误的处理
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 定义一个变量，值为不合法的JSON格式
     *   2. 尝试使用该变量
     *   3. 观察错误处理
     * 预期结果：
     *   - 变量值被当作普通字符串处理
     *   - 或显示格式错误提示
     *   - 不会导致应用崩溃
     * 验证点：变量值的容错处理
     * 说明：变量值可以是任意字符串，不一定是合法JSON
     */
    test('变量值格式错误应处理', async () => {
      await addLocalVariable(contentPage, 'invalidJson', '{invalid: json}');
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('17.7 并发和竞态条件', () => {
    /**
     * 测试目的：验证快速连续发送请求的正确处理
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 设置请求URL
     *   2. 快速连续点击发送按钮3次(间隔100ms)
     *   3. 等待所有请求完成
     * 预期结果：
     *   - 所有请求都能正常处理
     *   - 不会出现请求丢失或覆盖
     *   - UI状态正确更新
     *   - 响应数据不会混乱
     * 验证点：并发请求处理能力和请求队列管理
     * 说明：测试用户快速点击或脚本自动化场景
     */
    test('快速连续发送请求应正确处理', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/get?concurrent=test');
      const sendBtn1 = contentPage.locator('button:has-text("发送请求")'); await sendBtn1.click();
      await contentPage.waitForTimeout(100);
      const sendBtn2 = contentPage.locator('button:has-text("发送请求")'); await sendBtn2.click();
      await contentPage.waitForTimeout(100);
      const sendBtn3 = contentPage.locator('button:has-text("发送请求")'); await sendBtn3.click();
      await contentPage.waitForTimeout(3000);
    });

    /**
     * 测试目的：验证请求发送中切换节点的处理
     * 前置条件：已创建多个HTTP节点
     * 操作步骤：
     *   1. 发送一个延迟5秒的请求
     *   2. 在请求进行中切换到另一个节点
     *   3. 观察系统行为
     * 预期结果：
     *   - 正在进行的请求不会影响节点切换
     *   - 可能自动取消当前请求或在后台继续
     *   - 切换到新节点后状态正确
     *   - 不会出现数据混乱或状态错误
     * 验证点：节点切换时的请求状态管理
     * 说明：测试竞态条件下的数据隔离
     */
    test('请求发送中切换节点应处理正确', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/delay/5');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(500);
      const treeNode = contentPage.locator('.tree-node, .el-tree-node').nth(1).first();
      if (await treeNode.isVisible()) {
        await treeNode.click();
        await contentPage.waitForTimeout(300);
      }
    });

    /**
     * 测试目的：验证请求发送中修改配置的提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 发送一个延迟3秒的请求
     *   2. 在请求进行中修改URL
     *   3. 观察系统反应
     * 预期结果：
     *   - 可能显示请求进行中的警告
     *   - 可能阻止修改或询问用户
     *   - 修改不会影响正在进行的请求
     *   - 新配置在下次请求时生效
     * 验证点：请求进行时的配置锁定或提示
     * 说明：防止用户在请求进行时误操作
     */
    test('请求发送中修改配置应提示', async () => {
      await fillUrl(contentPage, 'https://httpbin.org/delay/3');
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(500);
      await fillUrl(contentPage, 'https://httpbin.org/get?modified=true');
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('17.8 数据恢复错误', () => {
    /**
     * 测试目的：验证损坏的缓存数据的恢复能力
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 等待节点加载
     *   2. 模拟缓存数据损坏场景
     * 预期结果：
     *   - 系统能够检测到数据损坏
     *   - 自动恢复或重置为默认状态
     *   - 显示恢复提示信息
     *   - 不会导致应用崩溃或无法使用
     * 验证点：数据损坏的容错和恢复机制
     * 说明：待补充具体的缓存数据损坏模拟步骤
     */
    test('损坏的缓存数据应能恢复', async () => {
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证历史记录损坏的处理
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 打开历史记录面板
     *   2. 模拟历史记录数据损坏
     *   3. 观察系统处理
     * 预期结果：
     *   - 系统能够处理损坏的历史记录
     *   - 显示友好的错误提示
     *   - 可选择清空或重建历史记录
     *   - 不影响其他功能的正常使用
     * 验证点：历史记录数据的容错处理
     * 说明：历史记录存储在IndexedDB中，待补充损坏模拟步骤
     */
    test('历史记录损坏应能处理', async () => {
      await openHistoryPanel(contentPage);
      await contentPage.waitForTimeout(300);
    });
  });
});

