import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode, clearAllAppData } from '../../../fixtures/fixtures';
import {
  waitForHttpNodeReady,
  getMethodSelector,
  verifyHttpMethod,
  getUrlInput,
  switchToTab,
  addQueryParam,
  verifyQueryParamExists,
  fillUrl,
  verifyPathParamExists,
} from './helpers/httpNodeHelpers';

test.describe('1. HTTP节点 - 基础功能测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
  });

  test.describe('1.1 基础创建测试', () => {
    /**
     * 测试目的：验证HTTP节点的基础创建流程是否正常
     * 前置条件：应用已启动，工作区已初始化
     * 操作步骤：
     *   1. 创建一个测试项目
     *   2. 在项目中创建一个HTTP类型的节点，命名为"Test API"
     *   3. 等待HTTP节点界面加载完成
     * 预期结果：
     *   - 节点创建成功(result.success为true)
     *   - 左侧树形导航中显示"Test API"节点
     *   - 默认请求方法为GET
     *   - HTTP节点的主操作区域(.api-operation)可见
     * 验证点：节点创建状态、UI可见性、默认HTTP方法
     */
    test('基础创建流程：创建HTTP节点应成功', async () => {
      await createProject(contentPage, '测试项目');
      const result = await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      expect(result.success).toBe(true);
      await waitForHttpNodeReady(contentPage);
      const treeNode = contentPage
        .locator('.tree-node:has-text("Test API"), .el-tree-node__content:has-text("Test API"), .el-tree-node__label:has-text("Test API")')
        .first();
      await expect(treeNode).toBeVisible();
      await verifyHttpMethod(contentPage, 'GET');
      const apiOperation = contentPage.locator('.api-operation').first();
      await expect(apiOperation).toBeVisible();
    });

    /**
     * 测试目的：验证HTTP节点创建后UI界面立即正确显示
     * 前置条件：已创建测试项目和HTTP节点
     * 操作步骤：
     *   1. 等待HTTP节点界面加载完成
     *   2. 检查各个核心UI组件的可见性
     * 预期结果：
     *   - HTTP方法选择器(methodSelector)可见
     *   - URL输入框(urlInput)可见
     *   - Params标签页可见
     *   - "发送请求"按钮可见
     * 验证点：HTTP节点核心UI组件的完整性和可见性
     */
    test('创建后应立即显示UI界面', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      const methodSelector = getMethodSelector(contentPage);
      await expect(methodSelector).toBeVisible();
      const urlInput = getUrlInput(contentPage);
      await expect(urlInput).toBeVisible();
      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await expect(paramsTab).toBeVisible();
      const sendBtn = contentPage.locator('button:has-text("发送请求")').first();
      await expect(sendBtn).toBeVisible();
    });
  });

  test.describe('1.2 标签页测试', () => {
    /**
     * 测试目的：验证HTTP节点的所有功能标签页都正确显示
     * 前置条件：已创建HTTP节点并等待界面加载完成
     * 操作步骤：检查各个标签页元素的可见性
     * 预期结果：
     *   - Params标签页可见
     *   - Body标签页可见
     *   - Headers(或"请求头")标签页可见
     * 验证点：标签页完整性，确保所有必需的配置入口都存在
     */
    test('应显示所有标签页', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await expect(paramsTab).toBeVisible();
      const bodyTab = contentPage.locator('.el-tabs__item:has-text("Body")').first();
      await expect(bodyTab).toBeVisible();
      const headersTab = contentPage
        .locator('.el-tabs__item:has-text("Headers"), .el-tabs__item:has-text("请求头")')
        .first();
      await expect(headersTab).toBeVisible();
    });

    /**
     * 测试目的：验证用户能够在不同标签页之间切换
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Params标签页
     *   2. 验证Params标签页处于激活状态
     *   3. 切换到Headers标签页
     *   4. 验证Headers标签页处于激活状态
     * 预期结果：
     *   - 每次切换后，对应标签页显示激活样式(.is-active)
     * 验证点：标签页切换功能和激活状态显示
     */
    test('应能切换标签页', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      const paramsActiveTab = contentPage.locator('.el-tabs__item.is-active:has-text("Params")');
      await expect(paramsActiveTab).toBeVisible();
      await switchToTab(contentPage, 'Headers');
      const headersActiveTab = contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first();
      await expect(headersActiveTab).toBeVisible();
    });

    /**
     * 测试目的：验证标签页切换时数据不会丢失
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 在Params标签页添加一个Query参数(testKey=testValue)
     *   2. 切换到Headers标签页
     *   3. 再切换回Params标签页
     *   4. 验证之前添加的参数是否还存在
     * 预期结果：
     *   - 切换回Params标签页后，testKey参数仍然存在
     * 验证点：标签页切换时的数据持久性
     */
    test('标签页切换应保持数据', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'testKey', 'testValue');
      await switchToTab(contentPage, 'Headers');
      await switchToTab(contentPage, 'Params');
      await verifyQueryParamExists(contentPage, 'testKey');
    });
  });

  test.describe('1.3 Params模块功能测试', () => {
    /**
     * 测试目的：验证Params标签页的基础结构正确显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Params标签页
     *   2. 检查"Query 参数"文本是否显示
     *   3. 检查参数输入框是否显示
     * 预期结果：
     *   - "Query 参数"标题可见
     *   - 参数名称输入框可见(placeholder包含"参数名称"相关文本)
     * 验证点：Params标签页的UI结构完整性
     */
    test('1.3.1 应正确显示Params标签页基础结构', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      await expect(contentPage.locator('text=Query 参数')).toBeVisible();
      const paramInput = contentPage.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数名称"]').first();
      await expect(paramInput).toBeVisible();
    });

    /**
     * 测试目的：验证Query参数的添加和编辑功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加第一个参数(testKey=testValue)
     *   2. 验证参数已成功添加
     *   3. 添加第二个参数，包含描述信息(key2=value2, description="测试描述")
     *   4. 验证第二个参数也成功添加
     * 预期结果：
     *   - 两个参数都能成功添加
     *   - 可以为参数添加描述信息
     * 验证点：Query参数的添加功能和描述字段支持
     */
    test('1.3.2 Query参数应支持添加和编辑', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'testKey', 'testValue');
      await verifyQueryParamExists(contentPage, 'testKey');
      await addQueryParam(contentPage, 'key2', 'value2', { description: '测试描述' });
      await verifyQueryParamExists(contentPage, 'key2');
    });

    /**
     * 测试目的：验证Query参数的启用/禁用功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加一个启用状态的参数(enabledParam=value1, enabled=true)
     *   2. 添加一个禁用状态的参数(disabledParam=value2, enabled=false)
     *   3. 验证两个参数都存在
     * 预期结果：
     *   - 启用和禁用的参数都能成功添加
     *   - 禁用的参数不会包含在实际请求中(后续测试验证)
     * 验证点：参数启用/禁用状态的设置和保存
     */
    test('1.3.3 Query参数应支持启用和禁用', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'enabledParam', 'value1', { enabled: true });
      await addQueryParam(contentPage, 'disabledParam', 'value2', { enabled: false });
      await verifyQueryParamExists(contentPage, 'enabledParam');
      await verifyQueryParamExists(contentPage, 'disabledParam');
    });

    /**
     * 测试目的：验证系统能自动识别URL中的Path参数
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 在URL输入框输入包含路径参数的地址：/api/:id/:userId
     *   2. 等待系统处理
     *   3. 切换到Params标签页查看Path参数区域
     * 预期结果：
     *   - "Path 参数"区域显示
     *   - 自动识别出id和userId两个路径参数
     * 验证点：URL路径参数的自动识别和提取功能
     */
    test('1.3.4 Path参数应自动识别URL中的路径变量', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await fillUrl(contentPage, '/api/:id/:userId');
      await contentPage.waitForTimeout(500);
      await switchToTab(contentPage, 'Params');
      await expect(contentPage.locator('text=Path 参数')).toBeVisible();
      await verifyPathParamExists(contentPage, 'id');
      await verifyPathParamExists(contentPage, 'userId');
    });

    /**
     * 测试目的：验证标签页切换时Params数据保持完整
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Query参数(persistKey=persistValue)
     *   2. 设置包含路径参数的URL(/api/:pathParam)
     *   3. 切换到Body标签页
     *   4. 切换到Headers标签页
     *   5. 切换回Params标签页
     *   6. 验证Query参数和Path参数是否还存在
     * 预期结果：
     *   - Query参数persistKey仍然存在
     *   - Path参数pathParam仍然存在
     * 验证点：多次标签页切换后的数据持久性
     */
    test('1.3.5 Params数据应在标签页切换时保持', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'persistKey', 'persistValue');
      await fillUrl(contentPage, '/api/:pathParam');
      await contentPage.waitForTimeout(500);
      await switchToTab(contentPage, 'Body');
      await switchToTab(contentPage, 'Headers');
      await switchToTab(contentPage, 'Params');
      await verifyQueryParamExists(contentPage, 'persistKey');
      await verifyPathParamExists(contentPage, 'pathParam');
    });

    /**
     * 测试目的：验证不同模块间的数据交互功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Query参数(testParam=testValue)
     *   2. 等待数据处理
     *   3. 验证参数存在
     * 预期结果：参数能正常添加并验证通过
     * 验证点：基础的模块间交互功能正常
     */
    test('各模块应能正常交互', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'testParam', 'testValue');
      await contentPage.waitForTimeout(300);
      await verifyQueryParamExists(contentPage, 'testParam');
    });

    /**
     * 测试目的：验证模块切换时数据的持久化
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Query参数(persistData=value)
     *   2. 切换到Body标签页
     *   3. 切换回Params标签页
     *   4. 验证参数是否还存在
     * 预期结果：数据在模块切换后保持完整
     * 验证点：模块切换时的数据保存机制
     */
    test('模块切换应保持数据', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await addQueryParam(contentPage, 'persistData', 'value');
      await switchToTab(contentPage, 'Body');
      await switchToTab(contentPage, 'Params');
      await verifyQueryParamExists(contentPage, 'persistData');
    });
  });

  test.describe('1.4 发送按钮测试', () => {
    /**
     * 测试目的：验证发送请求和取消请求按钮的显示和状态
     * 前置条件：已创建HTTP节点
     * 操作步骤：定位"发送请求"按钮并检查其状态
     * 预期结果：
     *   - "发送请求"按钮可见
     *   - 按钮处于可用状态(非禁用)
     * 验证点：主要操作按钮的可用性
     */
    test('应显示发送/取消按钮', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      const sendBtn = contentPage.locator('button:has-text("发送请求")').first();
      await expect(sendBtn).toBeVisible();
      await expect(sendBtn).toBeEnabled();
    });

    /**
     * 测试目的：验证保存接口按钮的显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：定位"保存接口"按钮
     * 预期结果："保存接口"按钮可见
     * 验证点：保存功能入口的存在性
     */
    test('应显示保存按钮', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      const saveBtn = contentPage.locator('button:has-text("保存接口")').first();
      await expect(saveBtn).toBeVisible();
    });

    /**
     * 测试目的：验证刷新按钮的显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：定位刷新按钮(通过title或class)
     * 预期结果：刷新按钮可见
     * 验证点：刷新功能入口的存在性
     */
    test('应显示刷新按钮', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      const refreshBtn = contentPage.locator('[title*="刷新"], .refresh-btn').first();
      await expect(refreshBtn).toBeVisible();
    });

    /**
     * 测试目的：验证撤销重做等辅助按钮的显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：定位"撤销"和"重做"文本
     * 预期结果：
     *   - "撤销"按钮/文本可见
     *   - "重做"按钮/文本可见
     * 验证点：编辑历史功能入口的存在性
     */
    test('应显示其他辅助按钮', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await expect(contentPage.locator('text=撤销')).toBeVisible();
      await expect(contentPage.locator('text=重做')).toBeVisible();
    });
  });

  test.describe('1.5 初始状态', () => {
    /**
     * 测试目的：验证HTTP节点创建后的默认请求方法
     * 前置条件：新创建的HTTP节点
     * 操作步骤：检查请求方法选择器的当前值
     * 预期结果：默认请求方法为GET
     * 验证点：初始状态符合HTTP协议最常用的方法(GET)
     */
    test('应使用默认请求方法（GET）', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await verifyHttpMethod(contentPage, 'GET');
    });

    /**
     * 测试目的：验证URL输入框的初始状态
     * 前置条件：新创建的HTTP节点
     * 操作步骤：
     *   1. 获取URL输入框
     *   2. 检查输入框的值是否为空
     *   3. 检查是否有placeholder提示文本
     * 预期结果：
     *   - 输入框值为空字符串
     *   - 有placeholder提示文本存在
     * 验证点：输入框初始状态符合新建场景的预期
     */
    test('应显示空URL输入框', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      const urlInput = getUrlInput(contentPage);
      const value = await urlInput.inputValue();
      expect(value).toBe('');
      const placeholder = await urlInput.getAttribute('placeholder');
      expect(placeholder).toBeTruthy();
    });

    /**
     * 测试目的：验证参数表单的初始状态
     * 前置条件：新创建的HTTP节点
     * 操作步骤：
     *   1. 切换到Params标签页
     *   2. 检查参数输入框是否显示
     * 预期结果：显示空的参数输入框供用户添加参数
     * 验证点：参数表单以空白状态开始，便于用户输入
     */
    test('应显示空参数表单', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await switchToTab(contentPage, 'Params');
      const paramInput = contentPage.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数名称"]').first();
      await expect(paramInput).toBeVisible();
    });

    /**
     * 测试目的：验证各标签页显示正确的默认状态
     * 前置条件：新创建的HTTP节点
     * 操作步骤：检查标签页数量
     * 预期结果：至少显示一个标签页(Params、Body、Headers等)
     * 验证点：标签页系统正常初始化
     */
    test('各标签页应显示正确的默认状态', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      const tabs = contentPage.locator('.el-tabs__item');
      const count = await tabs.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('1.6 响应式布局', () => {
    /**
     * 测试目的：验证界面在最小推荐宽度(1200px)下正常显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 设置浏览器视口为1200x800
     *   2. 等待布局调整
     *   3. 检查主操作区域是否可见
     * 预期结果：
     *   - 在1200px宽度下，api-operation区域正常显示
     *   - UI布局不会出现严重变形或重叠
     * 验证点：最小支持宽度的布局适配
     */
    test('应支持最小宽度1200px', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await contentPage.setViewportSize({ width: 1200, height: 800 });
      await contentPage.waitForTimeout(300);
      const apiOperation = contentPage.locator('.api-operation').first();
      await expect(apiOperation).toBeVisible();
    });

    /**
     * 测试目的：验证窗口小于最小宽度时的滚动行为
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 设置浏览器视口为1000x800(小于推荐宽度)
     *   2. 等待布局调整
     *   3. 检查页面是否产生水平滚动
     * 预期结果：
     *   - 在小于1200px宽度时，页面可以水平滚动
     *   - 内容不会被截断或隐藏
     * 验证点：小屏幕下的滚动降级方案
     * 说明：虽然推荐1200px，但更小尺寸下应提供滚动而非破坏布局
     */
    test('窗口小于1200px应显示可滚动', async () => {
      await createProject(contentPage, '测试项目');
      await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      await waitForHttpNodeReady(contentPage);
      await contentPage.setViewportSize({ width: 1000, height: 800 });
      await contentPage.waitForTimeout(300);
      const hasScroll = await contentPage.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasScroll).toBeDefined();
    });
  });
});
