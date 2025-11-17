import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode, clearAllAppData } from '../../../fixtures/fixtures';


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
     * 测试目的：验证HTTP节点的基础创建流程及所有核心UI组件的完整显示（烟雾测试）
     * 测试策略：只验证UI元素的存在性和可见性，不进行交互操作
     * 前置条件：应用已启动，工作区已初始化
     * 操作步骤：
     *   1. 创建一个测试项目
     *   2. 在项目中创建一个HTTP类型的节点，命名为"Test API"
     *   3. 验证所有核心UI元素可见
     * 预期结果：
     *   - 节点创建成功(result.success为true)
     *   - 左侧树形导航中显示"Test API"节点
     *   - 请求方法选择器可见
     *   - URL输入框可见
     *   - HTTP节点的主操作区域(.api-operation)可见
     *   - 核心按钮组可见：发送请求、保存接口、刷新
     *   - 辅助按钮组可见：撤销、重做
     *   - 全部7个功能标签页tab可见：Params、Body、Headers、返回参数、前置脚本、后置脚本、备注
     *   - 默认Params标签页处于激活状态
     *   - Query参数区域可见（验证基础内容渲染正常）
     * 验证点：
     *   - 节点创建状态
     *   - UI组件完整性和可见性
     *   - 所有核心功能模块的入口可访问
     * 注意：本测试不验证交互功能，交互功能由"基础操作流程"测试覆盖
     */
    test('基础创建流程：创建HTTP节点应成功并显示完整UI', async () => {
      // 创建测试项目
      await createProject(contentPage, '测试项目');
      // 创建HTTP节点
      const result = await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      // 验证节点创建成功
      expect(result.success).toBe(true);
      // 验证树节点显示
      const treeNode = contentPage
        .locator('.tree-node:has-text("Test API"), .el-tree-node__content:has-text("Test API"), .el-tree-node__label:has-text("Test API")')
        .first();
      await expect(treeNode).toBeVisible();
      // 验证请求方法选择器可见
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await expect(methodSelect).toBeVisible();
      // 验证URL输入框可见
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await expect(urlInput).toBeVisible();
      // 验证主操作区域
      const apiOperation = contentPage.locator('.api-operation').first();
      await expect(apiOperation).toBeVisible();
      // 验证核心按钮组
      const sendBtn = contentPage.locator('button:has-text("发送请求")').first();
      await expect(sendBtn).toBeVisible();
      const saveBtn = contentPage.locator('button:has-text("保存接口")').first();
      await expect(saveBtn).toBeVisible();
      const refreshBtn = contentPage.locator('[title*="刷新"], .refresh-btn').first();
      await expect(refreshBtn).toBeVisible();
      // 验证撤销重做按钮
      const undoText = contentPage.locator('text=撤销').first();
      await expect(undoText).toBeVisible();
      const redoText = contentPage.locator('text=重做').first();
      await expect(redoText).toBeVisible();
      // 验证全部7个功能标签页tab存在
      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await expect(paramsTab).toBeVisible();
      const bodyTab = contentPage.locator('.el-tabs__item:has-text("Body")').first();
      await expect(bodyTab).toBeVisible();
      const headersTab = contentPage
        .locator('.el-tabs__item:has-text("Headers"), .el-tabs__item:has-text("请求头")')
        .first();
      await expect(headersTab).toBeVisible();
      const responseTab = contentPage.locator('.el-tabs__item:has-text("返回参数")').first();
      await expect(responseTab).toBeVisible();
      const preRequestTab = contentPage.locator('.el-tabs__item:has-text("前置脚本")').first();
      await expect(preRequestTab).toBeVisible();
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置脚本")').first();
      await expect(afterRequestTab).toBeVisible();
      const remarksTab = contentPage.locator('.el-tabs__item:has-text("备注")').first();
      await expect(remarksTab).toBeVisible();
      // 验证默认Params标签页处于激活状态
      const paramsActiveTab = contentPage.locator('.el-tabs__item.is-active:has-text("Params")').first();
      await expect(paramsActiveTab).toBeVisible();
      // 验证Query参数区域可见（确认基础内容渲染正常）
      await expect(contentPage.locator('text=Query 参数').first()).toBeVisible();
    });

    /**
     * 测试目的：验证HTTP节点创建后所有核心操作功能和交互功能可正常使用
     * 测试策略：全面测试各种交互操作和功能逻辑，包括按钮点击、输入、状态变化等
     * 前置条件：应用已启动，工作区已初始化
     * 操作步骤：
     *   1. 创建测试项目和HTTP节点
     *   2. 测试请求方法切换（GET -> POST -> GET）
     *   3. 测试URL输入功能（输入→验证→清空→重新输入）
     *   4. 测试发送请求按钮（验证状态变化为"取消请求"）
     *   5. 测试取消请求按钮（验证恢复为"发送请求"）
     *   6. 测试保存功能完整流程（保存后数据持久化）
     *   7. 测试刷新按钮可点击
     *   8. 测试全部7个标签页切换功能（Params→Body→Headers→返回参数→前置脚本→后置脚本→备注→循环回Params）
     *   9. 验证每个标签页切换后激活状态正确
     *   10. 验证每个标签页内容区域正确显示关键元素
     * 预期结果：
     *   - 请求方法可以正常切换且状态正确更新
     *   - URL输入框可以正常输入和修改
     *   - 发送请求按钮点击后变为取消按钮
     *   - 取消按钮点击后恢复为发送按钮
     *   - 保存后数据被正确持久化
     *   - 刷新按钮可以正常点击
     *   - 全部7个标签页可以正常切换
     *   - 每个标签页切换后激活状态正确
     *   - 每个标签页内容区域正确显示并包含关键元素
     *   - 多次切换标签页内容保持稳定
     *   - 循环切换验证所有标签页交互正常
     * 验证点：
     *   - 请求方法切换功能
     *   - URL输入功能
     *   - 发送/取消请求按钮状态切换
     *   - 保存功能和数据持久化
     *   - 刷新按钮交互
     *   - 全部7个标签页切换功能和激活状态
     *   - 每个标签页内容区域的关键元素显示
     * 注意：本测试负责所有交互功能验证，UI存在性验证由"基础创建流程"测试覆盖
     */
    test('基础操作流程：HTTP节点的核心功能应可正常操作', async () => {
      // 创建测试项目和HTTP节点
      await createProject(contentPage, '测试项目');
      const result = await createSingleNode(contentPage, {
        name: 'Test API',
        type: 'http'
      });
      expect(result.success).toBe(true);
      // 等待HTTP节点界面加载完成并验证GET方法
      const apiOperation = contentPage.locator('.api-operation').first();
      await expect(apiOperation).toBeVisible();
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await expect(methodSelect).toBeVisible();
      // 确保选中值已渲染（必要时主动选择 GET）
      await methodSelect.click();
      await contentPage.waitForTimeout(200);
      const getOptionInit = contentPage.locator('.el-select-dropdown__item:has-text("GET")').first();
      await getOptionInit.click();
      await contentPage.waitForTimeout(200);
      await methodSelect.click();
      await contentPage.waitForTimeout(200);
      const selectedGetNow = contentPage
        .locator('.el-select-dropdown__item[aria-selected="true"]:has-text("GET"), .el-select-dropdown__item.is-selected:has-text("GET")')
        .first();
      await expect(selectedGetNow).toBeVisible();
      await contentPage.keyboard.press('Escape');
      // 切换到POST方法
      await methodSelect.click();
      await contentPage.waitForTimeout(200);
      const postOption = contentPage.locator('.el-select-dropdown__item:has-text("POST")').first();
      await postOption.click();
      await contentPage.waitForTimeout(300);
      await methodSelect.click();
      await contentPage.waitForTimeout(200);
      const selectedPost = contentPage
        .locator('.el-select-dropdown__item[aria-selected="true"]:has-text("POST"), .el-select-dropdown__item.is-selected:has-text("POST")')
        .first();
      await expect(selectedPost).toBeVisible();
      await contentPage.keyboard.press('Escape');
      // 切换回GET方法
      await methodSelect.click();
      await contentPage.waitForTimeout(200);
      const getOption = contentPage.locator('.el-select-dropdown__item:has-text("GET")').first();
      await getOption.click();
      await contentPage.waitForTimeout(300);
      await methodSelect.click();
      await contentPage.waitForTimeout(200);
      const selectedGetAgain = contentPage
        .locator('.el-select-dropdown__item[aria-selected="true"]:has-text("GET"), .el-select-dropdown__item.is-selected:has-text("GET")')
        .first();
      await expect(selectedGetAgain).toBeVisible();
      await contentPage.keyboard.press('Escape');
      // 测试URL输入
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      // 第一次输入URL
      await urlInput.fill('https://api.example.com/test');
      await contentPage.waitForTimeout(200);
      let urlValue = await urlInput.inputValue();
      expect(urlValue).toBe('https://api.example.com/test');
      // 清空并重新输入URL
      await urlInput.clear();
      await contentPage.waitForTimeout(100);
      await urlInput.fill('https://api.example.com/users');
      await contentPage.waitForTimeout(200);
      urlValue = await urlInput.inputValue();
      expect(urlValue).toBe('https://api.example.com/users');
      // 测试发送请求按钮
      const sendBtn = contentPage.locator('button:has-text("发送请求")').first();
      await expect(sendBtn).toBeVisible();
      // 点击发送请求
      await sendBtn.click();
      await contentPage.waitForTimeout(200);
      // 验证按钮变为取消请求
      const cancelBtn = contentPage.locator('button:has-text("取消请求")').first();
      await expect(cancelBtn).toBeVisible();
      // 点击取消请求
      await cancelBtn.click();
      await contentPage.waitForTimeout(300);
      // 验证按钮恢复为发送请求
      await expect(sendBtn).toBeVisible();
      // 测试保存功能
      const saveBtn = contentPage.locator('button:has-text("保存接口")').first();
      await saveBtn.click();
      await contentPage.waitForTimeout(500);
      // 验证保存后数据保持
      const savedUrlValue = await urlInput.inputValue();
      expect(savedUrlValue).toBe('https://api.example.com/users');
      await methodSelect.click();
      await contentPage.waitForTimeout(200);
      const savedSelectedMethod = contentPage
        .locator('.el-select-dropdown__item[aria-selected="true"]:has-text("GET"), .el-select-dropdown__item.is-selected:has-text("GET")')
        .first();
      await expect(savedSelectedMethod).toBeVisible();
      await contentPage.keyboard.press('Escape');
      // 测试刷新按钮
      const refreshBtn = contentPage.locator('[title*="刷新"], .refresh-btn').first();
      await expect(refreshBtn).toBeVisible();
      await refreshBtn.click();
      await contentPage.waitForTimeout(300);
      // 测试标签页切换 - 验证所有标签页都能正常切换并显示内容
      
      // Params 标签页
      const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")').first();
      await paramsTab.click();
      await contentPage.waitForTimeout(300);
      const paramsActiveTab = contentPage.locator('.el-tabs__item.is-active:has-text("Params")').first();
      await expect(paramsActiveTab).toBeVisible();
      await expect(contentPage.locator('text=Query 参数').first()).toBeVisible();
      const paramInput = contentPage
        .locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数名称"]')
        .first();
      await expect(paramInput).toBeVisible();
      
      // Body 标签页
      const bodyTab = contentPage.locator('.el-tabs__item:has-text("Body")').first();
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      const bodyActiveTab = contentPage.locator('.el-tabs__item.is-active:has-text("Body")').first();
      await expect(bodyActiveTab).toBeVisible();
      const bodyModeSelector = contentPage.locator('.body-params .el-radio-group').first();
      await expect(bodyModeSelector).toBeVisible();
      const jsonRadio = contentPage.locator('.el-radio:has-text("json")').first();
      await expect(jsonRadio).toBeVisible();
      const formdataRadio = contentPage.locator('.el-radio:has-text("form-data")').first();
      await expect(formdataRadio).toBeVisible();
      const urlencodedRadio = contentPage.locator('.el-radio:has-text("x-www-form-urlencoded")').first();
      await expect(urlencodedRadio).toBeVisible();
      const rawRadio = contentPage.locator('.el-radio:has-text("raw")').first();
      await expect(rawRadio).toBeVisible();
      const binaryRadio = contentPage.locator('.el-radio:has-text("binary")').first();
      await expect(binaryRadio).toBeVisible();
      const noneRadio = contentPage.locator('.el-radio:has-text("none")').first();
      await expect(noneRadio).toBeVisible();
      
      // Headers/请求头 标签页
      const headersTab = contentPage
        .locator('.el-tabs__item:has-text("Headers"), .el-tabs__item:has-text("请求头")')
        .first();
      await headersTab.click();
      await contentPage.waitForTimeout(300);
      const headersActiveTab = contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first();
      await expect(headersActiveTab).toBeVisible();
      const headerContainer = contentPage.locator('.header-info').first();
      await expect(headerContainer).toBeVisible();
      const headerInput = contentPage
        .locator('.header-info input[placeholder="输入参数名称自动换行"], .header-info input[placeholder*="参数名称"]')
        .first();
      await expect(headerInput).toBeVisible();
      
      // 返回参数 标签页
      const responseTab = contentPage.locator('.el-tabs__item:has-text("返回参数")').first();
      await responseTab.click();
      await contentPage.waitForTimeout(300);
      const responseActiveTab = contentPage.locator('.el-tabs__item.is-active:has-text("返回参数")').first();
      await expect(responseActiveTab).toBeVisible();
      const responseContainer = contentPage.locator('.response-params').first();
      await expect(responseContainer).toBeVisible();
      
      // 前置脚本 标签页
      const preRequestTab = contentPage.locator('.el-tabs__item:has-text("前置脚本")').first();
      await preRequestTab.click();
      await contentPage.waitForTimeout(300);
      const preRequestActiveTab = contentPage.locator('.el-tabs__item.is-active:has-text("前置脚本")').first();
      await expect(preRequestActiveTab).toBeVisible();
      const preRequestEditor = contentPage.locator('.editor-wrap').first();
      await expect(preRequestEditor).toBeVisible();
      
      // 后置脚本 标签页
      const afterRequestTab = contentPage.locator('.el-tabs__item:has-text("后置脚本")').first();
      await afterRequestTab.click();
      await contentPage.waitForTimeout(300);
      const afterRequestActiveTab = contentPage.locator('.el-tabs__item.is-active:has-text("后置脚本")').first();
      await expect(afterRequestActiveTab).toBeVisible();
      const afterRequestEditor = contentPage.locator('.editor-wrap').first();
      await expect(afterRequestEditor).toBeVisible();
      
      // 备注 标签页
      const remarksTab = contentPage.locator('.el-tabs__item:has-text("备注")').first();
      await remarksTab.click();
      await contentPage.waitForTimeout(300);
      const remarksActiveTab = contentPage.locator('.el-tabs__item.is-active:has-text("备注")').first();
      await expect(remarksActiveTab).toBeVisible();
      const remarksTextarea = contentPage.locator('textarea[placeholder*="备注"]').first();
      await expect(remarksTextarea).toBeVisible();
      
      // 再次切换回Params标签页，验证循环切换正常
      await paramsTab.click();
      await contentPage.waitForTimeout(300);
      await expect(paramsActiveTab).toBeVisible();
      await expect(paramInput).toBeVisible();
    });


  });

});
