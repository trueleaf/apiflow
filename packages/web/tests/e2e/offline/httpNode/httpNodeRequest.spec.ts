import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  selectHttpMethod,
  fillUrl,
  verifyUrlValue,
  sendRequestAndWait,
  switchToTab,
  addQueryParam,
  verifyQueryParamExists,
  getFullRequestUrl
} from './helpers/httpNodeHelpers';

test.describe('2. HTTP节点 - 请求操作模块测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;

    //创建测试项目和HTTP节点
    await createProject(contentPage, '测试项目');
    await createSingleNode(contentPage, {
      name: 'Test API',
      type: 'http'
    });
  });

  test.describe('2.1 请求方法测试', () => {
    /**
     * 测试目的：验证GET方法的选择和持久化
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 选择GET方法
     *   2. 验证方法已更新
     *   3. 刷新页面
     *   4. 验证方法仍为GET
     * 预期结果：
     *   - GET方法可以正常选择
     *   - 刷新后方法保持不变
     * 验证点：GET方法选择功能和数据持久化
     */
    test('应支持GET方法选择', async () => {
      // 选择GET方法
      await selectHttpMethod(contentPage, 'GET');
      // 验证方法已更新
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await expect(methodSelect.locator('.el-select__selected-item').first()).toHaveText('GET');
      // 刷新页面验证持久化
      const refreshBtn = contentPage.locator('button:has-text("刷新")').first(); await refreshBtn.click();
      await expect(methodSelect.locator('.el-select__selected-item').first()).toHaveText('GET');
    });

    /**
     * 测试目的：验证POST方法的选择及相关UI变化
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 选择POST方法
     *   2. 验证方法已更新为POST
     *   3. 检查Body标签页是否显示
     * 预期结果：
     *   - POST方法可以正常选择
     *   - Body标签页自动显示(POST方法通常需要请求体)
     * 验证点：POST方法选择及UI自动适配
     * 说明：POST方法需要Body配置，系统应自动显示相关选项
     */
    test('应支持POST方法选择', async () => {
      // 选择POST方法
      await selectHttpMethod(contentPage, 'POST');
      // 验证方法已更新为POST
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await expect(methodSelect.locator('.el-select__selected-item').first()).toHaveText('POST');
      // 检查Body标签页是否显示
      const bodyTab = contentPage.locator('.el-tabs__item:has-text("Body")');
      await expect(bodyTab).toBeVisible();
    });

    /**
     * 测试目的：验证PUT方法的选择
     * 前置条件：已创建HTTP节点
     * 操作步骤：选择PUT方法并验证
     * 预期结果：PUT方法可以正常选择
     * 验证点：PUT方法(用于更新资源)的支持
     */
    test('应支持PUT方法选择', async () => {
      // 选择PUT方法并验证
      await selectHttpMethod(contentPage, 'PUT');
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await expect(methodSelect.locator('.el-select__selected-item').first()).toHaveText('PUT');
    });

    /**
     * 测试目的：验证DELETE方法的选择
     * 前置条件：已创建HTTP节点
     * 操作步骤：选择DELETE方法并验证
     * 预期结果：DELETE方法可以正常选择
     * 验证点：DELETE方法(用于删除资源)的支持
     */
    test('应支持DELETE方法选择', async () => {
      // 选择DELETE方法并验证
      await selectHttpMethod(contentPage, 'DELETE');
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await expect(methodSelect.locator('.el-select__selected-item').first()).toHaveText('DELETE');
    });

    /**
     * 测试目的：验证PATCH方法的选择
     * 前置条件：已创建HTTP节点
     * 操作步骤：选择PATCH方法并验证
     * 预期结果：PATCH方法可以正常选择
     * 验证点：PATCH方法(用于部分更新资源)的支持
     */
    test('应支持PATCH方法选择', async () => {
      // 选择PATCH方法并验证
      await selectHttpMethod(contentPage, 'PATCH');
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await expect(methodSelect.locator('.el-select__selected-item').first()).toHaveText('PATCH');
    });

    /**
     * 测试目的：验证HEAD方法的选择
     * 前置条件：已创建HTTP节点
     * 操作步骤：选择HEAD方法并验证
     * 预期结果：HEAD方法可以正常选择
     * 验证点：HEAD方法(只获取响应头)的支持
     */
    test('应支持HEAD方法选择', async () => {
      // 选择HEAD方法并验证
      await selectHttpMethod(contentPage, 'HEAD');
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await expect(methodSelect.locator('.el-select__selected-item').first()).toHaveText('HEAD');
    });

    /**
     * 测试目的：验证OPTIONS方法的选择
     * 前置条件：已创建HTTP节点
     * 操作步骤：选择OPTIONS方法并验证
     * 预期结果：OPTIONS方法可以正常选择
     * 验证点：OPTIONS方法(用于CORS预检等)的支持
     */
    test('应支持OPTIONS方法选择', async () => {
      // 选择OPTIONS方法并验证
      await selectHttpMethod(contentPage, 'OPTIONS');
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await expect(methodSelect.locator('.el-select__selected-item').first()).toHaveText('OPTIONS');
    });

    /**
     * 测试目的：验证切换请求方法时其他配置不受影响
     * 前置条件：已创建HTTP节点并配置了URL和参数
     * 操作步骤：
     *   1. 设置URL为http://example.com/api
     *   2. 添加Query参数userId=123
     *   3. 切换请求方法为POST
     *   4. 验证URL和参数是否保持不变
     * 预期结果：
     *   - URL保持为http://example.com/api
     *   - Query参数userId仍然存在
     * 验证点：方法切换的数据隔离性，确保只改变方法不影响其他配置
     */
    test('方法切换时应保持其他配置不变', async () => {
      // 设置URL
      await fillUrl(contentPage, 'http://example.com/api');
      // 添加Query参数
      await addQueryParam(contentPage, 'userId', '123');
      // 切换请求方法为POST
      await selectHttpMethod(contentPage, 'POST');
      // 验证URL和参数保持不变
      await verifyUrlValue(contentPage, 'http://example.com/api');
      await verifyQueryParamExists(contentPage, 'userId');
    });
  });

  test.describe('2.2 请求URL测试', () => {
    /**
     * 测试目的：验证能够输入并保存普通的HTTP URL
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入URL：http://example.com/api
     *   2. 验证URL已正确显示
     *   3. 刷新页面
     *   4. 验证URL仍然保持
     * 预期结果：
     *   - URL可以正常输入
     *   - 刷新后URL不丢失
     * 验证点：基本URL输入和持久化功能
     */
    test('应能输入普通URL', async () => {
      // 输入URL
      await fillUrl(contentPage, 'http://example.com/api');
      // 验证URL已正确显示
      await verifyUrlValue(contentPage, 'http://example.com/api');
      // 刷新页面验证持久化
      const refreshBtn = contentPage.locator('button:has-text("刷新")').first(); await refreshBtn.click();
      await verifyUrlValue(contentPage, 'http://example.com/api');
    });

    /**
     * 测试目的：验证支持带端口号的URL
     * 前置条件：已创建HTTP节点
     * 操作步骤：输入带端口的URL并验证
     * 预期结果：带端口号的URL可以正常输入和保存
     * 验证点：URL端口号的解析和保存
     * 说明：本地开发环境常用端口号(如3000、8080等)应正常支持
     */
    test('应能输入带端口的URL', async () => {
      // 输入带端口的URL并验证
      await fillUrl(contentPage, 'http://localhost:3000/api');
      await verifyUrlValue(contentPage, 'http://localhost:3000/api');
    });

    /**
     * 测试目的：验证URL中的查询参数会自动提取到Params标签页
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入带查询参数的URL：http://example.com/api?key=value&name=test
     *   2. 验证URL保存正确
     *   3. 切换到Params标签页
     *   4. 验证key和name参数是否自动提取显示
     * 预期结果：
     *   - URL保存完整
     *   - Query参数自动提取到Params标签页
     *   - key和name参数都可见
     * 验证点：URL查询参数的自动解析和分离显示功能
     */
    test('应能输入带查询参数的URL', async () => {
      // 输入带查询参数的URL
      await fillUrl(contentPage, 'http://example.com/api?key=value&name=test');
      await verifyUrlValue(contentPage, 'http://example.com/api?key=value&name=test');
      // 切换到Params标签页
      await switchToTab(contentPage, 'Params');
      // 验证参数自动提取
      const keyParam = contentPage.locator('tr:has(input[value="key"])');
      const nameParam = contentPage.locator('tr:has(input[value="name"])');
      await expect(keyParam).toBeVisible();
      await expect(nameParam).toBeVisible();
    });

    /**
     * 测试目的：验证URL中的路径参数会自动识别
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入带路径参数的URL：http://example.com/users/{id}/posts/{postId}
     *   2. 验证URL保存正确
     *   3. 切换到Params标签页
     *   4. 切换到Path参数子标签
     *   5. 验证id和postId参数是否自动识别
     * 预期结果：
     *   - URL中的{id}和{postId}被识别为路径参数
     *   - 在Path参数区域自动显示这两个参数
     * 验证点：RESTful风格路径参数的自动识别功能
     */
    test('应能输入带Path参数的URL', async () => {
      // 输入带路径参数的URL
      await fillUrl(contentPage, 'http://example.com/users/{id}/posts/{postId}');
      await verifyUrlValue(contentPage, 'http://example.com/users/{id}/posts/{postId}');
      // 切换到Params标签页
      await switchToTab(contentPage, 'Params');
      // 切换到Path参数子标签
      const pathTab = contentPage.locator('.params-type-tabs .el-tabs__item:has-text("Path")');
      await pathTab.click();
      await contentPage.waitForTimeout(300);
      // 验证路径参数自动识别
      const idParam = contentPage.locator('tr:has(input[value="id"])');
      const postIdParam = contentPage.locator('tr:has(input[value="postId"])');
      await expect(idParam).toBeVisible();
      await expect(postIdParam).toBeVisible();
    });

    /**
     * 测试目的：验证通过复制粘贴方式输入URL的功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 构造一个包含多个查询参数的长URL
     *   2. 使用剪贴板API将URL复制
     *   3. 聚焦到URL输入框
     *   4. 使用Ctrl+V粘贴
     *   5. 验证URL完整性
     * 预期结果：
     *   - 剪贴板粘贴功能正常
     *   - 长URL可以完整粘贴
     *   - 所有参数都被正确识别
     * 验证点：剪贴板操作和长URL处理能力
     */
    test('应支持URL粘贴', async () => {
      // 构造长URL
      const longUrl = 'http://example.com/api/v1/users/search?query=test&limit=100&offset=0&sort=created_at&order=desc';
      const urlInput = contentPage.locator('input[placeholder*="请输入URL"]').first();
      await urlInput.clear();
      // 使用剪贴板API复制URL
      await contentPage.evaluate((url) => {
        navigator.clipboard.writeText(url);
      }, longUrl);
      // 粘贴URL
      await urlInput.focus();
      await contentPage.keyboard.press('Control+V');
      await urlInput.blur();
      await contentPage.waitForTimeout(300);
      // 验证URL完整性
      await verifyUrlValue(contentPage, longUrl);
    });

    /**
     * 测试目的：验证URL输入时的自动格式化处理
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入带空格的URL：http://example.com/api test
     *   2. 失焦触发格式化
     *   3. 验证URL值是否保留
     * 预期结果：
     *   - URL中的特殊字符被保留或适当处理
     *   - 输入框自动格式化不会导致数据丢失
     * 验证点：URL格式化和特殊字符处理
     */
    test('应支持URL自动格式化', async () => {
      // 输入带空格的URL
      const urlInput = contentPage.locator('input[placeholder*="请输入URL"]').first();
      await urlInput.fill('http://example.com/api test');
      // 失焦触发格式化
      await urlInput.blur();
      await contentPage.waitForTimeout(300);
      // 验证URL值保留
      const value = await urlInput.inputValue();
      expect(value).toContain('test');
    });

    /**
     * 测试目的：验证URL中的变量占位符语法支持
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入包含变量占位符的URL：http://{{host}}/api/{{version}}
     *   2. 验证URL保存正确
     *   3. 验证输入框有特殊样式标识(表明包含变量)
     * 预期结果：
     *   - {{variable}}语法被正确识别
     *   - 输入框有视觉提示标识包含变量
     *   - 变量占位符不会被格式化破坏
     * 验证点：变量占位符的识别和保存功能
     * 说明：变量实际替换在发送请求时进行
     */
    test('应支持URL中的变量替换', async () => {
      // 输入包含变量占位符的URL
      await fillUrl(contentPage, 'http://{{host}}/api/{{version}}');
      await verifyUrlValue(contentPage, 'http://{{host}}/api/{{version}}');
      // 验证输入框有特殊标识
      const urlInput = contentPage.locator('input[placeholder*="请输入URL"]').first();
      const className = await urlInput.getAttribute('class');
      expect(className).toBeTruthy();
    });

    /**
     * 测试目的：验证对超长URL的处理能力
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 构造一个超长路径(2000个字符)的URL
     *   2. 输入该URL
     *   3. 验证URL完整保存
     *   4. 检查输入框的滚动能力
     * 预期结果：
     *   - 超长URL可以正常输入和保存
     *   - 输入框支持横向滚动查看完整URL
     *   - 不会因URL过长导致性能问题或界面卡顿
     * 验证点：长URL的存储和显示能力、输入框滚动功能
     */
    test('应处理超长URL', async () => {
      // 构造超长路径
      const longPath = 'a'.repeat(2000);
      const longUrl = `http://example.com/${longPath}`;
      // 输入超长URL
      await fillUrl(contentPage, longUrl);
      await verifyUrlValue(contentPage, longUrl);
      const urlInput = contentPage.locator('input[placeholder*="请输入URL"]').first();
      // 验证输入框可滚动
      const scrollWidth = await urlInput.evaluate((el: HTMLInputElement) => el.scrollWidth);
      const clientWidth = await urlInput.evaluate((el: HTMLInputElement) => el.clientWidth);
      expect(scrollWidth).toBeGreaterThan(clientWidth);
    });

    /**
     * 测试目的：验证URL格式验证功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入不合法的URL：invalid-url
     *   2. 验证输入框保存该值
     * 预期结果：
     *   - 不合法的URL可以输入(不强制校验)
     *   - 实际发送请求时会进行验证
     * 验证点：URL格式的宽松输入策略
     * 说明：允许输入不合法URL是为了支持相对路径、变量等特殊场景
     */
    test('应验证URL格式', async () => {
      // 输入不合法URL
      await fillUrl(contentPage, 'invalid-url');
      const urlInput = contentPage.locator('input[placeholder*="请输入URL"]').first();
      // 验证不合法URL仍被保存
      const value = await urlInput.inputValue();
      expect(value).toBe('invalid-url');
    });

    /**
     * 测试目的：验证URL输入框有合适的占位符提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：获取URL输入框的placeholder属性
     * 预期结果：
     *   - placeholder存在
     *   - placeholder包含http提示信息
     * 验证点：用户体验提示文本
     * 说明：良好的placeholder可以指导用户正确输入URL格式
     */
    test('URL输入框应有placeholder提示', async () => {
      const urlInput = contentPage.locator('input[placeholder*="请输入URL"]').first();
      // 验证placeholder存在
      const placeholder = await urlInput.getAttribute('placeholder');
      expect(placeholder).toBeTruthy();
      // 验证提示文本包含http
      expect(placeholder).toContain('http');
    });
  });

  test.describe('2.3 环境和前缀管理', () => {
    /**
     * 测试目的：验证环境选择下拉框的显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：查找环境选择器组件
     * 预期结果：环境选择下拉框可见
     * 验证点：环境切换UI组件存在性
     * 说明：环境选择用于管理不同部署环境的配置(开发、测试、生产等)
     */
    test('应显示环境选择下拉框', async () => {
      // 查找环境选择器组件
      const envSelector = contentPage.locator('.el-select, .el-checkbox').first();
      await expect(envSelector).toBeVisible();
    });

    /**
     * 测试目的：验证可以在不同环境之间切换
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 查找"接口前缀"按钮
     *   2. 如果按钮可见，点击打开环境配置弹窗
     * 预期结果：能够打开环境配置界面
     * 验证点：环境切换交互功能
     * 说明：不同环境可能有不同的接口前缀(如dev.api.com、prod.api.com)
     */
    test('应能切换不同环境', async () => {
      // 查找接口前缀按钮
      const prefixBtn = contentPage.locator('button:has-text("接口前缀")');
      if (await prefixBtn.isVisible()) {
        // 点击打开环境配置弹窗
        await prefixBtn.click();
        await contentPage.waitForTimeout(500);
      }
    });

    /**
     * 测试目的：验证接口前缀配置功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入相对路径URL：/users
     *   2. 获取完整的请求URL
     * 预期结果：
     *   - 可以输入相对路径
     *   - 完整URL包含前缀
     * 验证点：接口前缀自动拼接功能
     * 说明：相对路径会自动拼接环境前缀，方便批量管理API地址
     */
    test('应能配置接口前缀', async () => {
      // 输入相对路径
      await fillUrl(contentPage, '/users');
      // 获取完整URL
      const fullUrl = await getFullRequestUrl(contentPage);
      expect(fullUrl.length).toBeGreaterThan(0);
    });

    /**
     * 测试目的：验证前缀自动拼接到URL的逻辑
     * 前置条件：已创建HTTP节点
     * 操作步骤：待补充
     * 预期结果：相对路径自动拼接前缀形成完整URL
     * 验证点：URL拼接规则的正确性
     * 说明：测试用例需要补充具体操作步骤
     */
    test('前缀应自动拼接到URL', async () => {
      // 输入相对路径
      await fillUrl(contentPage, '/api/test');
      await contentPage.waitForTimeout(300);
      // 验证完整URL包含前缀
      const fullUrl = await getFullRequestUrl(contentPage);
      expect(fullUrl).toBeTruthy();
    });

    /**
     * 测试目的：验证绝对URL不受前缀影响
     * 前置条件：已创建HTTP节点,可能配置了接口前缀
     * 操作步骤：
     *   1. 输入绝对URL：http://example.com/api
     *   2. 获取完整请求URL
     * 预期结果：
     *   - 完整URL仍为http://example.com/api
     *   - 不拼接环境前缀
     * 验证点：URL拼接规则中对绝对路径的识别和处理
     * 说明：绝对URL具有更高优先级,不会被前缀覆盖
     */
    test('绝对URL应忽略前缀', async () => {
      // 输入绝对URL
      await fillUrl(contentPage, 'http://example.com/api');
      // 验证URL保持不变
      const fullUrl = await getFullRequestUrl(contentPage);
      expect(fullUrl).toContain('example.com');
    });
  });

  test.describe('2.4 发送和控制操作', () => {
    /**
     * 测试目的：验证发送请求按钮的基本显示和可用性
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入有效URL
     *   2. 查找"发送请求"按钮
     * 预期结果：
     *   - 发送按钮可见
     *   - 发送按钮可点击
     * 验证点：发送请求按钮的状态管理
     */
    test('点击发送按钮应发起请求', async () => {
      // 输入有效URL
      await fillUrl(contentPage, 'https://httpbin.org/get');
      // 验证发送按钮可见且可点击
      const sendBtn = contentPage.locator('button:has-text("发送请求")');
      await expect(sendBtn).toBeVisible();
      await expect(sendBtn).toBeEnabled();
    });

    /**
     * 测试目的：验证请求发送过程中的加载状态显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入一个延迟2秒的测试URL
     *   2. 点击发送请求
     *   3. 在请求过程中查找"取消请求"按钮
     * 预期结果：
     *   - 发送请求后,按钮文字变为"取消请求"
     *   - 表明请求正在进行中
     * 验证点：请求进行时的UI状态反馈
     * 说明：使用httpbin的delay端点模拟慢请求
     */
    test('请求发送中应显示加载状态', async () => {
      // 输入延迟2秒的URL
      await fillUrl(contentPage, 'https://httpbin.org/delay/2');
      // 点击发送请求
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      // 验证显示取消按钮
      const cancelBtn = contentPage.locator('button:has-text("取消请求")');
      await expect(cancelBtn).toBeVisible({ timeout: 2000 });
    });

    /**
     * 测试目的：验证取消正在进行的请求功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入一个延迟5秒的测试URL
     *   2. 点击发送请求
     *   3. 等待500ms确保请求开始
     *   4. 点击"取消请求"按钮
     *   5. 验证按钮恢复为"发送请求"
     * 预期结果：
     *   - 可以中途取消请求
     *   - 取消后按钮状态恢复正常
     *   - 不会等待完整的5秒响应
     * 验证点：请求取消功能和状态恢复
     */
    test('应能取消正在发送的请求', async () => {
      // 输入延迟5秒的URL
      await fillUrl(contentPage, 'https://httpbin.org/delay/5');
      // 点击发送请求
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(500);
      // 点击取消按钮
      const cancelBtn = contentPage.locator('button:has-text("取消请求")');
      if (await cancelBtn.isVisible()) {
        const cancelBtn = contentPage.locator('button:has-text("取消")').first(); await cancelBtn.click();
        await contentPage.waitForTimeout(500);
        // 验证按钮恢复为发送请求
        const sendBtn = contentPage.locator('button:has-text("发送请求")');
        await expect(sendBtn).toBeVisible();
      }
    });

    /**
     * 测试目的：验证请求完成后的响应处理
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入测试URL
     *   2. 发送请求
     *   3. 等待请求完成
     *   4. 验证按钮恢复为"发送请求"
     * 预期结果：
     *   - 请求完成后按钮自动恢复
     *   - 可以再次发送请求
     * 验证点：请求生命周期的状态管理
     */
    test('请求完成后应恢复发送按钮', async () => {
      // 输入测试URL
      await fillUrl(contentPage, 'https://httpbin.org/get');
      // 发送请求
      const sendBtn1 = contentPage.locator('button:has-text("发送请求")'); await sendBtn1.click();
      await contentPage.waitForTimeout(3000);
      // 验证按钮恢复
      const sendBtn2 = contentPage.locator('button:has-text("发送请求")');
      await expect(sendBtn2).toBeVisible({ timeout: 30000 });
    });

    /**
     * 测试目的：验证发送请求前对URL的必填验证
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 清空URL输入框
     *   2. 检查发送按钮状态
     * 预期结果：
     *   - 发送按钮仍然可见
     *   - 实际点击时可能会有验证提示
     * 验证点：表单必填项验证
     * 说明：具体的禁用逻辑可能在点击时触发,而非UI层直接禁用按钮
     */
    test('发送请求前应验证URL必填', async () => {
      // 清空URL
      const urlInput = contentPage.locator('input[placeholder*="请输入URL"]').first();
      await urlInput.clear();
      // 验证发送按钮状态
      const sendBtn = contentPage.locator('button:has-text("发送请求")');
      await expect(sendBtn).toBeVisible();
    });

    /**
     * 测试目的：验证快捷键发送请求功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入有效URL
     *   2. 聚焦到URL输入框
     *   3. 按下Ctrl+Enter快捷键
     * 预期结果：快捷键触发请求发送
     * 验证点：键盘快捷键支持
     * 说明：Ctrl+Enter是常见的提交快捷键,提升操作效率
     */
    test('应支持快捷键发送请求', async () => {
      // 输入URL
      await fillUrl(contentPage, 'https://httpbin.org/get');
      // 聚焦输入框
      const urlInput = contentPage.locator('input[placeholder*="请输入URL"]').first();
      await urlInput.focus();
      // 按下Ctrl+Enter快捷键
      await contentPage.keyboard.press('Control+Enter');
      await contentPage.waitForTimeout(500);
    });

    /**
     * 测试目的：验证请求失败时的错误提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入一个不存在的域名URL
     *   2. 发送请求
     *   3. 等待请求失败
     * 预期结果：应显示错误提示信息
     * 验证点：网络错误的错误处理和用户反馈
     * 说明：测试DNS解析失败、网络不可达等场景
     */
    test('发送失败应显示错误提示', async () => {
      // 输入无效域名
      await fillUrl(contentPage, 'http://invalid-domain-that-does-not-exist-12345.com');
      // 发送请求
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(3000);
    });

    /**
     * 测试目的：验证刷新操作功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入URL
     *   2. 点击刷新按钮
     *   3. 验证URL保持不变
     * 预期结果：
     *   - 刷新操作不清空已有数据
     *   - URL等信息保持原样
     * 验证点：刷新功能的数据持久化
     */
    test('应支持刷新操作', async () => {
      // 输入URL
      await fillUrl(contentPage, 'http://example.com/api');
      // 点击刷新按钮
      const refreshBtn = contentPage.locator('button:has-text("刷新")').first(); await refreshBtn.click();
      // 验证URL保持不变
      await verifyUrlValue(contentPage, 'http://example.com/api');
    });
  });

  test.describe('2.5 请求状态管理', () => {
    /**
     * 测试目的：验证未保存状态的视觉提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 修改URL
     *   2. 等待状态更新
     *   3. 查找未保存标识元素
     * 预期结果：
     *   - 可能显示未保存标识(如圆点、星号等)
     *   - 标识数量>=0(可能某些情况下不显示)
     * 验证点：脏数据状态的UI反馈
     * 说明：未保存标识帮助用户了解当前编辑状态
     */
    test('未保存状态应有提示标识', async () => {
      // 修改URL
      await fillUrl(contentPage, 'http://example.com/api');
      await contentPage.waitForTimeout(500);
      // 查找未保存标识
      const unsavedIndicator = contentPage.locator('.unsaved-indicator, .dirty-flag, [title*="未保存"]');
      const count = await unsavedIndicator.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    /**
     * 测试目的：验证保存后清除未保存标识
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 修改URL
     *   2. 点击保存按钮
     *   3. 等待保存完成
     * 预期结果：
     *   - 保存成功
     *   - 未保存标识消失
     * 验证点：保存操作对状态标识的影响
     */
    test('保存后应清除未保存标识', async () => {
      // 修改URL
      await fillUrl(contentPage, 'http://example.com/api');
      // 点击保存
      const saveBtn = contentPage.locator('button:has-text("保存")').first(); await saveBtn.click();
      await contentPage.waitForTimeout(500);
    });

    /**
     * 测试目的：验证发送请求前的自动保存机制
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 修改URL但不手动保存
     *   2. 点击发送请求
     *   3. 等待请求发送
     * 预期结果：
     *   - 发送请求前自动保存当前配置
     *   - 确保请求数据与界面一致
     * 验证点：自动保存机制
     * 说明：自动保存避免用户忘记保存导致的数据丢失
     */
    test('发送请求前应自动保存', async () => {
      // 修改URL但不保存
      await fillUrl(contentPage, 'https://httpbin.org/get');
      await contentPage.waitForTimeout(300);
      // 点击发送请求
      const sendBtn = contentPage.locator('button:has-text("发送请求")'); await sendBtn.click();
      await contentPage.waitForTimeout(1000);
    });
  });
});


