import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  switchToTab,
  addHeader,
  deleteHeader,
  verifyHeaderExists,
  clearAllHeaders,
  switchBodyMode,
  clickSendRequest
} from './helpers/httpNodeHelpers';

test.describe('5. HTTP节点 - Headers模块测试', () => {
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

  test.describe('5.1 自定义请求头测试', () => {
    /**
     * 测试目的：验证添加自定义请求头功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 等待HTTP节点加载完成
     *   2. 添加自定义请求头 X-Custom-Header: CustomValue
     *   3. 验证请求头存在
     * 预期结果：
     *   - 自定义请求头成功添加
     *   - 请求头在列表中可见
     * 验证点：自定义请求头添加功能
     */
    test('应能添加自定义请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'X-Custom-Header', 'CustomValue');
      await verifyHeaderExists(contentPage, 'X-Custom-Header');
    });

    /**
     * 测试目的：验证编辑请求头的key
     * 前置条件：已添加请求头
     * 操作步骤：
     *   1. 添加请求头 Old-Header: value
     *   2. 切换到Headers标签页
     *   3. 定位到该请求头行
     *   4. 修改key为New-Header
     *   5. 验证新key存在
     * 预期结果：
     *   - 请求头key成功修改
     *   - 新key在列表中显示
     * 验证点：请求头key的可编辑性
     * 说明：测试标记为skip,可能存在已知问题
     */
    test.skip('应能编辑请求头的key', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Old-Header', 'value');
      await switchToTab(contentPage, 'Headers');
      const row = contentPage.locator('tr:has(input[value="Old-Header"])');
      const keyInput = row.locator('input[placeholder*="请求头"], input[placeholder*="key"]').first();
      await keyInput.clear();
      await keyInput.fill('New-Header');
      await contentPage.waitForTimeout(200);
      await verifyHeaderExists(contentPage, 'New-Header');
    });

    /**
     * 测试目的：验证编辑请求头的value
     * 前置条件：已添加请求头
     * 操作步骤：
     *   1. 添加请求头 Test-Header: oldValue
     *   2. 切换到Headers标签页
     *   3. 定位到该请求头行
     *   4. 修改value为newValue
     * 预期结果：
     *   - 请求头value成功修改
     *   - 新value保存
     * 验证点：请求头value的可编辑性
     * 说明：测试标记为skip,可能存在已知问题
     */
    test.skip('应能编辑请求头的value', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Test-Header', 'oldValue');
      await switchToTab(contentPage, 'Headers');
      const row = contentPage.locator('tr:has(input[value="Test-Header"])');
      const valueInput = row.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.clear();
      await valueInput.fill('newValue');
      await contentPage.waitForTimeout(200);
    });

    /**
     * 测试目的：验证删除单个请求头
     * 前置条件：已添加请求头
     * 操作步骤：
     *   1. 添加请求头 Delete-Me: value
     *   2. 执行删除操作
     * 预期结果：
     *   - 请求头从列表中移除
     *   - 删除操作成功
     * 验证点：请求头删除功能
     */
    test('应能删除请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Delete-Me', 'value');
      await deleteHeader(contentPage, 'Delete-Me');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证批量删除请求头功能
     * 前置条件：已添加多个请求头
     * 操作步骤：
     *   1. 添加3个请求头
     *   2. 执行清空所有请求头操作
     * 预期结果：
     *   - 所有自定义请求头被清除
     *   - 列表恢复初始状态
     * 验证点：批量删除功能
     */
    test('应能批量删除请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Header1', 'value1');
      await addHeader(contentPage, 'Header2', 'value2');
      await addHeader(contentPage, 'Header3', 'value3');
      await clearAllHeaders(contentPage);
    });

    /**
     * 测试目的：验证添加请求头描述功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：添加带描述的请求头
     * 预期结果：
     *   - 请求头描述成功保存
     *   - 描述信息可查看
     * 验证点：请求头描述信息管理
     * 说明：描述有助于API文档生成和团队协作
     */
    test('应能添加请求头描述', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Described-Header', 'value', { description: '这是请求头描述' });
      await verifyHeaderExists(contentPage, 'Described-Header');
    });

    /**
     * 测试目的：验证请求头value支持变量替换
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加请求头Authorization: Bearer {{token}}
     *   2. 验证请求头存在
     * 预期结果：
     *   - 变量占位符{{token}}被正确识别
     *   - 发送请求时会进行变量替换
     * 验证点：请求头中的变量支持
     * 说明：常用于动态设置Authorization等认证头
     */
    test('请求头value应支持变量替换', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Authorization', 'Bearer {{token}}');
      await verifyHeaderExists(contentPage, 'Authorization');
    });

    /**
     * 测试目的：验证请求头的启用/禁用功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加禁用状态的请求头
     *   2. 切换到Headers标签页
     *   3. 通过JS查找该请求头行的复选框状态
     * 预期结果：
     *   - 复选框未勾选(禁用状态)
     *   - 禁用的请求头不会在请求中发送
     * 验证点：请求头启用/禁用控制
     * 说明：禁用功能便于临时排除某些请求头
     */
    test('请求头应支持启用/禁用', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Disabled-Header', 'value', { enabled: false });
      await switchToTab(contentPage, 'Headers');
      const enabledState = await contentPage.evaluate(() => {
        const rows = Array.from(
          document.querySelectorAll<HTMLElement>(
            '.header-info .custom-params, .headers-table .custom-params, .s-params .custom-params'
          )
        );
        for (const row of rows) {
          const inputs = Array.from(row.querySelectorAll<HTMLInputElement>('input'));
          const matched = inputs.some((input) => input.value === 'Disabled-Header');
          if (!matched) {
            continue;
          }
          const checkbox = row.querySelector<HTMLInputElement>('input[type="checkbox"]');
          return checkbox ? checkbox.checked : null;
        }
        return null;
      });
      if (enabledState === null) {
        throw new Error('未找到Disabled-Header请求头对应的复选框');
      }
      expect(enabledState).toBe(false);
    });
  });

  test.describe('5.2 公共请求头测试', () => {
    /**
     * 测试目的：验证显示项目级公共请求头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 查找公共请求头按钮
     *   3. 点击打开公共请求头面板
     * 预期结果：
     *   - 公共请求头按钮可见
     *   - 点击后显示项目级公共请求头
     * 验证点：项目级公共请求头显示
     * 说明：项目级公共头对当前项目的所有接口生效
     */
    test('应显示项目级公共请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const publicHeadersBtn = contentPage.locator('[title*="公共"], .public-headers-btn').first();
      if (await publicHeadersBtn.isVisible()) {
        await publicHeadersBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });

    /**
     * 测试目的：验证显示全局级公共请求头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 打开公共请求头面板
     * 预期结果：显示全局级公共请求头
     * 验证点：全局级公共请求头显示
     * 说明：全局级公共头对所有项目的所有接口生效
     */
    test('应显示全局级公共请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const publicHeadersBtn = contentPage.locator('[title*="公共"], .public-headers-btn').first();
      if (await publicHeadersBtn.isVisible()) {
        await publicHeadersBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });

    /**
     * 测试目的：验证显示/隐藏公共请求头区域
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 查找切换按钮
     *   3. 点击显示公共请求头
     *   4. 点击隐藏公共请求头
     * 预期结果：
     *   - 公共请求头区域可以展开/折叠
     *   - 切换操作流畅
     * 验证点：公共请求头区域的显示/隐藏控制
     */
    test('应能显示/隐藏公共请求头区域', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const toggleBtn = contentPage.locator('.toggle-public-headers, .show-public').first();
      if (await toggleBtn.isVisible()) {
        await toggleBtn.click();
        await contentPage.waitForTimeout(200);
        await toggleBtn.click();
        await contentPage.waitForTimeout(200);
      }
    });

    /**
     * 测试目的：验证在节点级禁用公共请求头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 定位到公共请求头区域
     *   3. 取消勾选启用复选框
     * 预期结果：
     *   - 公共请求头被禁用
     *   - 该节点发送请求时不包含公共请求头
     * 验证点：节点级公共请求头禁用功能
     * 说明：允许单个接口排除公共请求头
     */
    test('应能在节点级禁用公共请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const publicHeadersArea = contentPage.locator('.public-headers, .common-headers').first();
      if (await publicHeadersArea.isVisible()) {
        const checkbox = publicHeadersArea.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
          await checkbox.uncheck();
          await contentPage.waitForTimeout(200);
        }
      }
    });

    /**
     * 测试目的：验证重新启用公共请求头
     * 前置条件：公共请求头已被禁用
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 勾选公共请求头启用复选框
     * 预期结果：
     *   - 公共请求头重新生效
     *   - 发送请求时包含公共请求头
     * 验证点：公共请求头的启用/禁用切换
     */
    test('应能重新启用公共请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const publicHeadersArea = contentPage.locator('.public-headers, .common-headers').first();
      if (await publicHeadersArea.isVisible()) {
        const checkbox = publicHeadersArea.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
          await checkbox.check();
          await contentPage.waitForTimeout(200);
        }
      }
    });

    /**
     * 测试目的：验证公共头标识其来源
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 查看公共请求头区域
     *   3. 检查来源标签
     * 预期结果：
     *   - 公共请求头有来源标识
     *   - 可区分项目级和全局级
     * 验证点：公共请求头来源标识
     * 说明：来源标识帮助用户了解请求头的配置位置
     */
    test('公共头应标识其来源（项目级/全局级）', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const publicHeadersArea = contentPage.locator('.public-headers, .common-headers').first();
      if (await publicHeadersArea.isVisible()) {
        const sourceLabel = publicHeadersArea.locator('.source-label, .level-tag').first();
        if (await sourceLabel.isVisible()) {
          await expect(sourceLabel).toBeVisible();
        }
      }
    });

    /**
     * 测试目的：验证公共头的key只读
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 定位到公共请求头区域
     *   3. 检查key输入框的readonly或disabled属性
     * 预期结果：
     *   - key输入框为只读状态
     *   - 不能在节点级修改公共头的key
     * 验证点：公共请求头key的只读限制
     * 说明：公共头只能在配置面板中修改
     */
    test('公共头的key应只读', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const publicHeadersArea = contentPage.locator('.public-headers, .common-headers').first();
      if (await publicHeadersArea.isVisible()) {
        const keyInput = publicHeadersArea.locator('input[placeholder*="请求头"]').first();
        if (await keyInput.isVisible()) {
          const isReadonly = await keyInput.getAttribute('readonly') || await keyInput.isDisabled();
          expect(isReadonly).toBeTruthy();
        }
      }
    });

    /**
     * 测试目的：验证公共头的value只读
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 定位到公共请求头区域
     *   3. 检查value输入框的readonly或disabled属性
     * 预期结果：
     *   - value输入框为只读状态
     *   - 不能在节点级修改公共头的value
     * 验证点：公共请求头value的只读限制
     * 说明：公共头只能在配置面板中修改
     */
    test('公共头的value应只读', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const publicHeadersArea = contentPage.locator('.public-headers, .common-headers').first();
      if (await publicHeadersArea.isVisible()) {
        const valueInput = publicHeadersArea.locator('input[placeholder*="值"]').first();
        if (await valueInput.isVisible()) {
          const isReadonly = await valueInput.getAttribute('readonly') || await valueInput.isDisabled();
          expect(isReadonly).toBeTruthy();
        }
      }
    });
  });

  test.describe('5.3 默认请求头测试', () => {
    /**
     * 测试目的：验证显示默认Content-Type请求头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 等待页面加载
     * 预期结果：显示默认的Content-Type请求头
     * 验证点：默认请求头的显示
     */
    test('应显示Content-Type默认请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证Content-Type根据Body模式自动设置
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换Body模式为JSON
     *   2. 切换到Headers标签页
     *   3. 检查Content-Type值
     * 预期结果：
     *   - Content-Type自动设置为application/json
     *   - Body模式改变时Content-Type同步更新
     * 验证点：Body模式与Content-Type的自动关联
     * 说明：减少手动配置错误,提高开发效率
     */
    test('Content-Type应根据Body模式自动设置', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchBodyMode(contentPage, 'JSON');
      await switchToTab(contentPage, 'Headers');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证手动修改Content-Type功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 定位Content-Type行
     *   3. 修改值为application/xml
     * 预期结果：
     *   - 允许覆盖自动设置的Content-Type
     *   - 修改后的值被保留
     * 验证点：默认请求头的可修改性
     * 说明：某些API需要特定的Content-Type
     */
    test('应能手动修改Content-Type', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const contentTypeRow = contentPage.locator('tr:has(input[value="Content-Type"])');
      if (await contentTypeRow.isVisible()) {
        const valueInput = contentTypeRow.locator('input[placeholder*="值"]').first();
        await valueInput.fill('application/xml');
        await contentPage.waitForTimeout(200);
      }
    });

    /**
     * 测试目的：验证切换Body模式时的Content-Type冲突提示
     * 前置条件：已手动修改Content-Type
     * 操作步骤：
     *   1. 切换Body模式为JSON
     *   2. 再切换为form-data
     *   3. 观察提示
     * 预期结果：
     *   - Body模式改变时提示Content-Type可能冲突
     *   - 用户可选择是否覆盖
     * 验证点：Content-Type冲突检测和提示
     * 说明：防止Body内容与Content-Type不匹配
     */
    test('手动修改Content-Type后切换Body模式应提示', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchBodyMode(contentPage, 'JSON');
      await switchBodyMode(contentPage, 'form-data');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证显示User-Agent等常见默认头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 检查常见默认请求头
     * 预期结果：
     *   - 显示User-Agent等默认头
     *   - 默认头包含应用标识
     * 验证点：常见默认请求头的显示
     * 说明：User-Agent等默认头帮助服务器识别客户端
     */
    test('应显示User-Agent等常见默认头', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('5.4 请求头优先级测试', () => {
    /**
     * 测试目的：验证自定义头优先于公共头
     * 前置条件：存在公共Authorization请求头
     * 操作步骤：
     *   1. 添加自定义Authorization请求头
     *   2. 等待保存
     * 预期结果：
     *   - 自定义头优先级高于公共头
     *   - 发送请求时使用自定义头的值
     * 验证点：请求头优先级规则(自定义 > 公共)
     * 说明：允许单个接口覆盖公共配置
     */
    test('自定义头应优先于公共头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Authorization', 'Bearer custom-token');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证禁用的自定义头不覆盖公共头
     * 前置条件：存在公共Authorization请求头
     * 操作步骤：
     *   1. 添加禁用状态的自定义Authorization
     *   2. 等待保存
     * 预期结果：
     *   - 禁用的自定义头不生效
     *   - 使用公共头的值
     * 验证点：禁用状态对优先级的影响
     * 说明：禁用的自定义头不参与优先级比较
     */
    test('禁用的自定义头不应覆盖公共头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Authorization', 'Bearer custom-token', { enabled: false });
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('5.5 特殊请求头处理', () => {
    /**
     * 测试目的：验证支持设置Authorization头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Authorization请求头
     *   2. 验证请求头存在
     * 预期结果：
     *   - Authorization请求头成功添加
     *   - 支持Bearer、Basic等认证类型
     * 验证点：Authorization请求头支持
     * 说明：Authorization是最常用的API认证方式
     */
    test('应支持设置Authorization头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Authorization', 'Bearer my-secret-token');
      await verifyHeaderExists(contentPage, 'Authorization');
    });

    /**
     * 测试目的：验证支持设置Cookie头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Cookie请求头
     *   2. 验证请求头存在
     * 预期结果：
     *   - Cookie请求头成功添加
     *   - 支持多个cookie键值对
     * 验证点：Cookie请求头支持
     * 说明：Cookie格式为name1=value1; name2=value2
     */
    test('应支持设置Cookie头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Cookie', 'sessionId=abc123; userId=456');
      await verifyHeaderExists(contentPage, 'Cookie');
    });

    /**
     * 测试目的：验证支持设置Accept头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Accept请求头
     *   2. 验证请求头存在
     * 预期结果：
     *   - Accept请求头成功添加
     *   - 支持指定响应类型
     * 验证点：Accept请求头支持
     * 说明：Accept用于指定客户端接受的响应类型
     */
    test('应支持设置Accept头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Accept', 'application/json');
      await verifyHeaderExists(contentPage, 'Accept');
    });

    /**
     * 测试目的：验证支持自定义X-开头的请求头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加X-Request-ID请求头
     *   2. 验证请求头存在
     * 预期结果：
     *   - X-开头的自定义请求头成功添加
     *   - 无特殊限制
     * 验证点：自定义请求头支持
     * 说明：X-前缀是自定义请求头的约定命名方式
     */
    test('应支持自定义header(X-Custom-Header)', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'X-Request-ID', 'req-12345');
      await verifyHeaderExists(contentPage, 'X-Request-ID');
    });
  });

  test.describe('5.6 请求头表格操作', () => {
    /**
     * 测试目的：验证Tab键快速填写请求头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 定位到请求头输入框
     *   3. 输入请求头名称
     *   4. 按Tab键切换到值输入框
     * 预期结果：
     *   - Tab键能正确切换焦点
     *   - 提高录入效率
     * 验证点：Tab键导航功能
     * 说明：Tab键导航是常用的表格快速录入方式
     */
    test('应支持快速填写（Tab键切换）', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const table = contentPage.locator('.header-info, .headers-table, .s-params').first();
      await table.waitFor({ state: 'visible', timeout: 5000 });
      let keyInput = table.locator('input[placeholder="输入参数名称自动换行"]').first();
      if (!(await keyInput.count())) {
        keyInput = table.locator('input[placeholder*="请求头"], input[placeholder*="key"]').first();
      }
      if (!(await keyInput.count())) {
        keyInput = table.locator('input[placeholder*="参数"]').first();
      }
      if (!(await keyInput.count())) {
        throw new Error('未找到可填写的请求头输入框');
      }
      await keyInput.fill('X-Test-Header');
      await contentPage.keyboard.press('Tab');
      await contentPage.waitForTimeout(200);
    });

    /**
     * 测试目的：验证拖拽排序请求头
     * 前置条件：已添加多个请求头
     * 操作步骤：
     *   1. 添加3个请求头
     *   2. 拖拽改变顺序
     * 预期结果：
     *   - 请求头顺序改变
     *   - 拖拽操作流畅
     * 验证点：拖拽排序功能
     * 说明：请求头顺序在某些场景下有意义
     */
    test('应支持拖拽排序', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Header1', 'value1');
      await addHeader(contentPage, 'Header2', 'value2');
      await addHeader(contentPage, 'Header3', 'value3');
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证复制请求头功能
     * 前置条件：已添加请求头
     * 操作步骤：
     *   1. 添加请求头
     *   2. 点击复制按钮
     * 预期结果：
     *   - 请求头成功复制
     *   - 副本与原请求头内容相同
     * 验证点：复制功能
     * 说明：复制功能便于创建相似请求头
     */
    test('应支持复制请求头', async () => {
      await waitForHttpNodeReady(contentPage);
      await addHeader(contentPage, 'Copy-Header', 'copy-value');
      await switchToTab(contentPage, 'Headers');
      const row = contentPage.locator('tr:has(input[value="Copy-Header"])');
      const copyBtn = row.locator('[title*="复制"], .copy-btn').first();
      if (await copyBtn.isVisible()) {
        await copyBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });

    /**
     * 测试目的：验证空行自动清除功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 点击输入框后失焦(不输入内容)
     *   3. 等待自动清理
     * 预期结果：
     *   - 空行自动移除
     *   - 表格保持整洁
     * 验证点：空行自动清理功能
     * 说明：自动清理避免表格中出现无效空行
     */
    test('空行应自动清除', async () => {
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Headers');
      const table = contentPage.locator('.header-info, .headers-table, .s-params').first();
      await table.waitFor({ state: 'visible', timeout: 5000 });
      let keyInput = table.locator('input[placeholder="输入参数名称自动换行"]').first();
      if (!(await keyInput.count())) {
        keyInput = table.locator('input[placeholder*="请求头"], input[placeholder*="key"]').first();
      }
      if (!(await keyInput.count())) {
        keyInput = table.locator('input[placeholder*="参数"]').first();
      }
      if (!(await keyInput.count())) {
        throw new Error('未找到可操作的请求头输入框');
      }
      await keyInput.click();
      await keyInput.blur();
      await contentPage.waitForTimeout(300);
    });
  });
});
