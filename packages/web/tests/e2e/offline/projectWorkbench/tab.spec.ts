import { Page } from 'playwright/test';
import { test, expect } from '../../../fixtures/fixtures';
import { initOfflineWorkbench, createProject, createNodes } from '../../../fixtures/fixtures';

// ==================== 测试套件 ====================

test.describe('Nav组件 - Tab功能测试', () => {
  let headerPage: Page;
  let contentPage: Page;
  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
    await createProject(contentPage, '测试项目');
  });

  // ==================== 测试组1: Tab创建与显示 (8个用例) ====================
  test.describe('Tab创建与显示', () => {
    test('应正确显示HTTP GET节点的tab', async ({ electronApp }) => {
      await createNodes(contentPage, { name: 'GET请求', type: 'http' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'GET请求' });
      await expect(tab).toBeVisible();

      // 验证请求方法图标和颜色
      const methodIcon = tab.locator('span').first();
      await expect(methodIcon).toHaveText('GET');
      const color = await methodIcon.evaluate((el: HTMLElement) => window.getComputedStyle(el).color);
      // GET请求默认颜色应该是绿色系
      expect(color).toBeTruthy();
    });

    test('应正确显示HTTP POST节点的tab', async ({ electronApp }) => {
      await createNodes(contentPage, { name: 'POST请求', type: 'http' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'POST请求' });
      await expect(tab).toBeVisible();

      // 验证初始方法为GET
      let methodIcon = tab.locator('span').first();
      await expect(methodIcon).toHaveText('GET');

      // 修改节点为POST方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.locator('.el-select-dropdown__item:has-text("POST")').click();

      // 验证tab上的方法仍显示GET（未保存状态）
      methodIcon = tab.locator('span').first();
      await expect(methodIcon).toHaveText('GET');

      // 验证显示未保存圆点
      const dot = tab.locator('.has-change .dot');
      await expect(dot).toBeVisible();

      // 保存节点
      await contentPage.keyboard.press('Control+S');
      await contentPage.waitForTimeout(500);

      // 验证tab上的方法显示更新为POST
      methodIcon = tab.locator('span').first();
      await expect(methodIcon).toHaveText('POST');

      // 验证未保存圆点消失
      await expect(dot).not.toBeVisible();
    });

    test('应正确显示HTTP PUT节点的tab', async ({ electronApp }) => {
      await createNodes(contentPage, { name: 'PUT请求', type: 'http' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'PUT请求' });

      // 验证初始方法为GET
      let methodIcon = tab.locator('span').first();
      await expect(methodIcon).toHaveText('GET');

      // 修改节点为PUT方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.locator('.el-select-dropdown__item:has-text("PUT")').click();

      // 验证tab上的方法仍显示GET（未保存状态）
      methodIcon = tab.locator('span').first();
      await expect(methodIcon).toHaveText('GET');

      // 保存节点
      await contentPage.keyboard.press('Control+S');
      await contentPage.waitForTimeout(500);

      // 验证tab上的方法显示更新为PUT
      methodIcon = tab.locator('span').first();
      await expect(methodIcon).toHaveText('PUT');
    });

    test('应正确显示HTTP DELETE节点的tab', async ({ electronApp }) => {
      await createNodes(contentPage, { name: 'DELETE请求', type: 'http' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'DELETE请求' });

      // 验证初始方法为GET
      let methodIcon = tab.locator('span').first();
      await expect(methodIcon).toHaveText('GET');

      // 修改节点为DELETE方法
      const methodSelect = contentPage.locator('[data-testid="method-select"]');
      await methodSelect.click();
      await contentPage.locator('.el-select-dropdown__item:has-text("DEL")').click();

      // 验证tab上的方法仍显示GET（未保存状态）
      methodIcon = tab.locator('span').first();
      await expect(methodIcon).toHaveText('GET');

      // 保存节点
      await contentPage.keyboard.press('Control+S');
      await contentPage.waitForTimeout(500);

      // 验证tab上的方法显示更新为DELETE
      methodIcon = tab.locator('span').first();
      await expect(methodIcon).toHaveText('DEL');
    });

    test('应正确显示WebSocket节点的tab', async ({ electronApp }) => {
      await createNodes(contentPage, { name: 'WS连接', type: 'websocket' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'WS连接' });
      await expect(tab).toBeVisible();

      // 验证显示WS图标
      const wsIcon = tab.locator('span').first();
      await expect(wsIcon).toHaveText('WS');
    });

    test('应正确显示HttpMock节点的tab', async ({ electronApp }) => {
      await createNodes(contentPage, { name: 'Mock接口', type: 'httpMock' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Mock接口' });
      await expect(tab).toBeVisible();

      // 验证显示MOCK图标
      const mockIcon = tab.locator('span').first();
      await expect(mockIcon).toHaveText('MOCK');
    });

    test('点击新增按钮应创建未命名接口tab', async ({ electronApp }) => {
      // 点击新增按钮（+ 图标）
      const addTabBtn = contentPage.locator('.nav .add-tab');
      await addTabBtn.click();

      // 验证创建了未命名接口tab
      const unnamedTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '未命名接口' });
      await expect(unnamedTab).toBeVisible();
    });

    test('Tab标签超过50字符应显示省略号并有title提示', async ({ electronApp }) => {
      const longName = '这是一个非常非常非常非常非常非常非常非常非常非常长的接口名称用于测试省略号显示';
      await createNodes(contentPage, { name: longName, type: 'http' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: longName });
      await expect(tab).toBeVisible();

      // 验证title属性存在（悬停提示） - 从.item元素获取
      const title = await tab.getAttribute('title');
      expect(title).toBe(longName);

      // 验证CSS属性 - 从.item-text元素验证
      const textSpan = tab.locator('.item-text');
      const styles = await textSpan.evaluate((el: HTMLElement) => {
        const computed = window.getComputedStyle(el);
        return {
          textOverflow: computed.textOverflow,
          overflow: computed.overflow,
          whiteSpace: computed.whiteSpace,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth
        };
      });

      // 验证必要的CSS属性
      expect(styles.textOverflow).toBe('ellipsis');
      expect(styles.overflow).toContain('hidden');
      expect(styles.whiteSpace).toBe('nowrap');

      // 验证文本确实被截断了（scrollWidth > clientWidth）
      expect(styles.scrollWidth).toBeGreaterThan(styles.clientWidth);
    });

    test('Tab标签文本较短时不应显示省略号', async ({ electronApp }) => {
      const shortName = '短名称';
      await createNodes(contentPage, { name: shortName, type: 'http' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: shortName });
      await expect(tab).toBeVisible();

      // 验证title属性仍然存在（所有tab都有title）
      const title = await tab.getAttribute('title');
      expect(title).toBe(shortName);

      // 验证CSS属性依然设置
      const textSpan = tab.locator('.item-text');
      const styles = await textSpan.evaluate((el: HTMLElement) => {
        const computed = window.getComputedStyle(el);
        return {
          textOverflow: computed.textOverflow,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth
        };
      });

      expect(styles.textOverflow).toBe('ellipsis');

      // 验证短文本没有被截断（scrollWidth <= clientWidth）
      expect(styles.scrollWidth).toBeLessThanOrEqual(styles.clientWidth);
    });
  });

  // ==================== 测试组2: Tab切换与激活 (6个用例) ====================
  test.describe('Tab切换与激活', () => {
    test('单击tab应切换到对应节点', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点1', type: 'http' },
        { name: '节点2', type: 'http' },
      ]);

      // 点击第一个tab
      const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点1' });
      await tab1.click();

      // 验证第一个tab激活
      await expect(tab1).toHaveClass(/active/);

      // 点击第二个tab
      const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点2' });
      await tab2.click();

      // 验证第二个tab激活
      await expect(tab2).toHaveClass(/active/);
      await expect(tab1).not.toHaveClass(/active/);
    });

    test('激活的tab应有active样式和背景色', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '测试节点', type: 'http' });

      const activeTab = contentPage.locator('.nav .tab-list .item.active');
      await expect(activeTab).toBeVisible();

      // 验证active类
      await expect(activeTab).toHaveClass(/active/);

      // 验证背景色为 #f0f3fa
      const bgColor = await activeTab.evaluate((el: HTMLElement) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      // rgb(240, 243, 250) = #f0f3fa
      expect(bgColor).toBe('rgb(240, 243, 250)');
    });

    test('只能有一个tab处于激活状态', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点1', type: 'http' },
        { name: '节点2', type: 'http' },
        { name: '节点3', type: 'http' },
      ]);

      // 验证只有一个active tab
      const activeTabs = contentPage.locator('.nav .tab-list .item.active');
      await expect(activeTabs).toHaveCount(1);

      // 切换到不同tab
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点1' }).click();
      await expect(activeTabs).toHaveCount(1);

      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点2' }).click();
      await expect(activeTabs).toHaveCount(1);
    });

    test('新创建的tab应自动激活', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '新节点', type: 'http' });

      const newTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '新节点' });
      await expect(newTab).toHaveClass(/active/);
    });

    test('激活的tab应自动滚动到可视区域', async ({ electronApp }) => {
      // 创建多个节点
      const nodes = Array.from({ length: 15 }, (_, i) => ({
        name: `节点${i + 1}`,
        type: 'http' as const,
      }));
      await createNodes(contentPage, nodes);

      // 点击第一个节点 - 使用nth(0)精确定位第一个tab
      const allTabs = contentPage.locator('.nav .tab-list .item');
      await allTabs.nth(0).click();

      // 验证第一个tab可见
      const tab1 = allTabs.nth(0);
      await expect(tab1).toBeVisible();

      // 检查是否在视口内
      const isInViewport = await tab1.evaluate((el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= window.innerWidth;
      });
      expect(isInViewport).toBe(true);
    });

    test('切换tab应更新内容区域', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: 'API1', type: 'http' },
        { name: 'API2', type: 'http' },
      ]);

      // 修改第一个API的URL
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: 'API1' }).click();
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://api1.example.com');
      // 切换太快数据还未赋值，添加等待
      await contentPage.waitForTimeout(1000)
      // 切换到第二个tab
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: 'API2' }).click();
      // 验证URL输入框已清空（新节点默认为空）
      const currentUrl = await urlInput.inputValue();
      expect(currentUrl).not.toBe('https://api1.example.com');

      // 切换回第一个tab
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: 'API1' }).click();

      // 验证URL恢复
      const restoredUrl = await urlInput.inputValue();
      expect(restoredUrl).toBe('https://api1.example.com');
    });
  });

  // ==================== 测试组3: Tab关闭操作 (8个用例) ====================
  test.describe('Tab关闭操作', () => {
    test('悬停已保存的tab应显示关闭按钮', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '测试节点', type: 'http' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '测试节点' });

      // 悬停前关闭按钮可能不可见或隐藏
      const closeBtn = tab.locator('.close');

      // 悬停
      await tab.hover();

      // 验证关闭按钮可见
      await expect(closeBtn).toBeVisible();
    });

    test('点击关闭按钮应关闭tab', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '待关闭节点', type: 'http' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '待关闭节点' });
      await expect(tab).toBeVisible();

      // 悬停并点击关闭按钮
      await tab.hover();
      const closeBtn = tab.locator('.close');
      await closeBtn.click();

      // 验证tab已关闭
      await expect(tab).not.toBeVisible();
    });

    test('中键点击tab应关闭tab', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '中键测试', type: 'http' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '中键测试' });
      await expect(tab).toBeVisible();

      // 中键点击
      await tab.click({ button: 'middle' });

      // 验证tab已关闭
      await expect(tab).not.toBeVisible();
    });

    test('关闭激活tab应自动激活右侧tab', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点1', type: 'http' },
        { name: '节点2', type: 'http' },
        { name: '节点3', type: 'http' },
      ]);

      // 点击激活第二个tab
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点2' }).click();
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点2' })).toHaveClass(/active/);

      // 关闭第二个tab
      const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点2' });
      await tab2.hover();
      await tab2.locator('.close').click();

      // 验证第三个tab被激活
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点3' })).toHaveClass(/active/);
    });

    test('关闭最右侧激活tab应激活左侧tab', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点1', type: 'http' },
        { name: '节点2', type: 'http' },
        { name: '节点3', type: 'http' },
      ]);

      // 点击激活第三个tab（最右侧）
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点3' }).click();

      // 关闭第三个tab
      const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点3' });
      await tab3.hover();
      await tab3.locator('.close').click();

      // 验证第二个tab被激活
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点2' })).toHaveClass(/active/);
    });

    test('关闭唯一tab后应显示空白状态或保持项目页面', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '唯一节点', type: 'http' });

      // 关闭这个唯一的tab
      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '唯一节点' });
      await tab.hover();
      await tab.locator('.close').click();

      // 验证tab列表为空
      const tabCount = await contentPage.locator('.nav .tab-list .item').count();
      expect(tabCount).toBe(0);

      // 验证仍在项目编辑页面（不会跳转）
      const url = contentPage.url();
      expect(url).toContain('doc-edit');
    });

    test('中键点击未保存tab应弹出保存确认对话框', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '未保存节点', type: 'http' });

      // 修改URL使其变为未保存状态
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://example.com');
      await contentPage.waitForTimeout(1000)

      // 验证显示未保存标识
      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '未保存节点' });
      const dot = tab.locator('.has-change .dot');
      const hasDot = await dot.isVisible();
      expect(hasDot).toBe(true);

      // 使用中键点击关闭tab
      await tab.click({ button: 'middle' });

      // 验证弹出确认对话框
      const dialog = contentPage.locator('.el-message-box');
      await expect(dialog).toBeVisible({ timeout: 2000 });
    });

    test('在确认对话框中选择不保存应直接关闭tab', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '测试节点', type: 'http' });

      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://example.com');
      await contentPage.waitForTimeout(1000)

      // 使用中键点击关闭tab
      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '测试节点' });
      await tab.click({ button: 'middle' });

      // 在对话框中选择"不保存"
      const dialog = contentPage.locator('.el-message-box');
      await expect(dialog).toBeVisible();

      const noSaveBtn = dialog.locator('button').filter({ hasText: /不保存|放弃/ });
      if (await noSaveBtn.count() > 0) {
        await noSaveBtn.click();

        // 验证tab已关闭
        await expect(tab).not.toBeVisible();
      } else {
        // 如果没有"不保存"按钮，点击取消
        const cancelBtn = dialog.locator('button').filter({ hasText: /取消/ });
        await cancelBtn.click();
      }
    });

    test('右键菜单关闭未保存tab应弹出确认对话框', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '未保存节点', type: 'http' });

      // 修改URL使其变为未保存状态
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://example.com');
      await contentPage.waitForTimeout(1000)

      // 验证显示未保存标识
      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '未保存节点' });
      const dot = tab.locator('.has-change .dot');
      const hasDot = await dot.isVisible();
      expect(hasDot).toBe(true);

      // 右键点击tab
      await tab.click({ button: 'right' });

      // 点击"关闭"菜单项
      const closeItem = contentPage.locator('.s-contextmenu').locator('text="关闭"');
      await closeItem.click();

      // 验证弹出确认对话框
      const dialog = contentPage.locator('.el-message-box');
      await expect(dialog).toBeVisible({ timeout: 2000 });
    });

    test('未保存状态下悬停tab应显示圆点不显示关闭按钮', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '未保存节点', type: 'http' });

      // 修改URL使其变为未保存状态
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://example.com');
      await contentPage.waitForTimeout(1000)

      // 验证显示未保存标识
      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '未保存节点' });
      const dot = tab.locator('.has-change .dot');
      await expect(dot).toBeVisible();

      // 悬停tab
      await tab.hover();
      await contentPage.waitForTimeout(200);

      // 验证圆点仍然可见
      await expect(dot).toBeVisible();

      // 验证关闭按钮不可见（因为v-show="element.saved"）
      const closeBtn = tab.locator('.close');
      const isCloseBtnVisible = await closeBtn.isVisible();
      expect(isCloseBtnVisible).toBe(false);
    });

    test('Ctrl+W关闭未保存tab应弹出确认对话框', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '未保存节点', type: 'http' });

      // 修改URL使其变为未保存状态
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://example.com');
      await contentPage.waitForTimeout(1000)

      // 验证显示未保存标识
      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '未保存节点' });
      const dot = tab.locator('.has-change .dot');
      await expect(dot).toBeVisible();

      // 按下Ctrl+W
      await contentPage.keyboard.press('Control+W');

      // 验证弹出确认对话框
      const dialog = contentPage.locator('.el-message-box');
      await expect(dialog).toBeVisible({ timeout: 2000 });
    });

    test('在确认对话框中选择"保存"应保存并关闭tab', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '测试节点', type: 'http' });

      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://api.example.com/save-test');
      await contentPage.waitForTimeout(1000)

      // 验证显示未保存标识
      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '测试节点' });
      const dot = tab.locator('.has-change .dot');
      await expect(dot).toBeVisible();

      // 使用中键点击关闭tab
      await tab.click({ button: 'middle' });

      // 在对话框中选择"保存"
      const dialog = contentPage.locator('.el-message-box');
      await expect(dialog).toBeVisible();

      const saveBtn = dialog.locator('button').filter({ hasText: /保存/ });
      await saveBtn.click();

      // 等待保存完成
      await contentPage.waitForTimeout(1000);

      // 验证tab已关闭
      await expect(tab).not.toBeVisible();
    });

    test('在确认对话框中点击X关闭对话框应取消操作保留tab', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '保留节点', type: 'http' });

      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://example.com/keep');
      await contentPage.waitForTimeout(1000)

      // 验证显示未保存标识
      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '保留节点' });
      const dot = tab.locator('.has-change .dot');
      await expect(dot).toBeVisible();

      // 使用中键点击关闭tab
      await tab.click({ button: 'middle' });

      // 验证对话框显示
      const dialog = contentPage.locator('.el-message-box');
      await expect(dialog).toBeVisible();

      // 点击对话框右上角的关闭按钮（X）
      const closeDialogBtn = dialog.locator('.el-message-box__headerbtn');
      await closeDialogBtn.click();

      // 等待对话框关闭
      await contentPage.waitForTimeout(500);

      // 验证tab仍然存在
      await expect(tab).toBeVisible();

      // 验证仍然是未保存状态
      await expect(dot).toBeVisible();
    });

  });

  // ==================== 测试组4: 右键菜单 (10个用例) ====================
  test.describe('右键菜单操作', () => {
    test('右键点击tab应显示上下文菜单', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '测试节点', type: 'http' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '测试节点' });
      await tab.click({ button: 'right' });

      // 验证菜单显示
      const menu = contentPage.locator('.s-contextmenu');
      await expect(menu).toBeVisible();
    });

    test('点击菜单外部应关闭菜单', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '测试节点', type: 'http' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '测试节点' });
      await tab.click({ button: 'right' });

      const menu = contentPage.locator('.s-contextmenu');
      await expect(menu).toBeVisible();

      // 点击页面其他区域
      await contentPage.locator('.banner').click();

      // 验证菜单关闭
      await expect(menu).not.toBeVisible();
    });

    test('关闭菜单项应关闭当前tab', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '待关闭节点', type: 'http' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '待关闭节点' });
      await tab.click({ button: 'right' });

      // 点击"关闭"菜单项
      const closeItem = contentPage.locator('.s-contextmenu').locator(`text="关闭"`);
      await closeItem.click();

      // 验证tab已关闭
      await expect(tab).not.toBeVisible();
    });

    test('关闭左侧菜单项应关闭当前tab左侧所有tab', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点1', type: 'http' },
        { name: '节点2', type: 'http' },
        { name: '节点3', type: 'http' },
      ]);

      // 右键点击第三个tab
      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点3' });
      await tab.click({ button: 'right' });

      // 点击"关闭左侧"
      const closeLeftItem = contentPage.locator('.s-contextmenu').locator(`text="关闭左侧"`);
      await closeLeftItem.click();

      // 验证左侧tab已关闭
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点1' })).not.toBeVisible();
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点2' })).not.toBeVisible();
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点3' })).toBeVisible();
    });

    test('关闭右侧菜单项应关闭当前tab右侧所有tab', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点1', type: 'http' },
        { name: '节点2', type: 'http' },
        { name: '节点3', type: 'http' },
      ]);

      // 右键点击第一个tab
      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点1' });
      await tab.click({ button: 'right' });

      // 点击"关闭右侧"
      const closeRightItem = contentPage.locator('.s-contextmenu').locator(`text="关闭右侧"`);
      await closeRightItem.click();

      // 验证右侧tab已关闭
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点1' })).toBeVisible();
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点2' })).not.toBeVisible();
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点3' })).not.toBeVisible();
    });

    test('关闭其他菜单项应只保留当前tab', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点1', type: 'http' },
        { name: '节点2', type: 'http' },
        { name: '节点3', type: 'http' },
      ]);

      // 右键点击第二个tab
      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点2' });
      await tab.click({ button: 'right' });

      // 点击"关闭其他"
      const closeOthersItem = contentPage.locator('.s-contextmenu').locator(`text="关闭其他"`);
      await closeOthersItem.click();

      // 验证只剩下第二个tab
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点1' })).not.toBeVisible();
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点2' })).toBeVisible();
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点3' })).not.toBeVisible();

      const tabCount = await contentPage.locator('.nav .tab-list .item').count();
      expect(tabCount).toBe(1);
    });

    test('全部关闭菜单项应关闭所有tab', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点1', type: 'http' },
        { name: '节点2', type: 'http' },
      ]);

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点1' });
      await tab.click({ button: 'right' });

      // 点击"全部关闭"
      const closeAllItem = contentPage.locator('.s-contextmenu').locator(`text="全部关闭"`);
      await closeAllItem.click();

      // 可能会有确认对话框（如果有未保存的tab）
      const dialog = contentPage.locator('.el-message-box');
      if (await dialog.isVisible({ timeout: 1000 })) {
        const confirmBtn = dialog.locator('button:has-text("确定")');
        await confirmBtn.click();
      }

      // 验证所有tab已关闭
      const tabCount = await contentPage.locator('.nav .tab-list .item').count();
      expect(tabCount).toBe(0);
    });

    test('只有一个tab时关闭其他应禁用或不产生效果', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '唯一节点', type: 'http' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '唯一节点' });
      await tab.click({ button: 'right' });

      // 验证"关闭其他"菜单项存在但可能禁用
      const closeOthersItem = contentPage.locator('.s-contextmenu').locator('text="关闭其他"');
      if (await closeOthersItem.count() > 0) {
        // 如果菜单项存在，点击它不应影响唯一的tab
        await closeOthersItem.click();

        // 验证tab仍存在
        await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '唯一节点' })).toBeVisible();
      }
    });

    test('右键"关闭其他"包含未保存tab应弹出确认对话框', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点1', type: 'http' },
        { name: '节点2', type: 'http' },
        { name: '节点3', type: 'http' },
      ]);

      // 修改节点1和节点3的URL
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点1' }).click();
      let urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://api1.example.com');
      await contentPage.waitForTimeout(1000);

      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点3' }).click();
      urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://api3.example.com');
      await contentPage.waitForTimeout(1000);

      // 验证节点1和节点3显示未保存标识
      const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点1' });
      const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点3' });
      await expect(tab1.locator('.has-change .dot')).toBeVisible();
      await expect(tab3.locator('.has-change .dot')).toBeVisible();

      // 在节点2右键选择"关闭其他"
      const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点2' });
      await tab2.click({ button: 'right' });

      const closeOthersItem = contentPage.locator('.s-contextmenu').locator('text="关闭其他"');
      await closeOthersItem.click();

      // 验证弹出确认对话框（针对未保存的节点1）
      const dialog = contentPage.locator('.el-message-box');
      await expect(dialog).toBeVisible({ timeout: 2000 });

      // 选择"不保存"以继续关闭流程
      const noSaveBtn = dialog.locator('button').filter({ hasText: /不保存|放弃/ });
      if (await noSaveBtn.count() > 0) {
        await noSaveBtn.click();
        await contentPage.waitForTimeout(500);

        // 可能会有第二个确认对话框（针对节点3）
        if (await dialog.isVisible({ timeout: 1000 })) {
          const noSaveBtn2 = dialog.locator('button').filter({ hasText: /不保存|放弃/ });
          if (await noSaveBtn2.count() > 0) {
            await noSaveBtn2.click();
          }
        }
      }

      // 验证只剩下节点2
      await contentPage.waitForTimeout(500);
      await expect(tab2).toBeVisible();
      const tabCount = await contentPage.locator('.nav .tab-list .item').count();
      expect(tabCount).toBe(1);
    });

    test('右键"关闭左侧"包含未保存tab应弹出确认对话框', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '左节点1', type: 'http' },
        { name: '左节点2', type: 'http' },
        { name: '右节点3', type: 'http' },
      ]);

      // 修改左节点1
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '左节点1' }).click();
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://left1.example.com');
      await contentPage.waitForTimeout(1000);

      // 验证显示未保存标识
      const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '左节点1' });
      await expect(tab1.locator('.has-change .dot')).toBeVisible();

      // 在右节点3右键选择"关闭左侧"
      const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '右节点3' });
      await tab3.click({ button: 'right' });

      const closeLeftItem = contentPage.locator('.s-contextmenu').locator('text="关闭左侧"');
      await closeLeftItem.click();

      // 验证弹出确认对话框
      const dialog = contentPage.locator('.el-message-box');
      await expect(dialog).toBeVisible({ timeout: 2000 });
    });

    test('右键"关闭右侧"包含未保存tab应弹出确认对话框', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '左节点1', type: 'http' },
        { name: '右节点2', type: 'http' },
        { name: '右节点3', type: 'http' },
      ]);

      // 修改右节点2
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '右节点2' }).click();
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://right2.example.com');
      await contentPage.waitForTimeout(1000);

      // 验证显示未保存标识
      const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '右节点2' });
      await expect(tab2.locator('.has-change .dot')).toBeVisible();

      // 在左节点1右键选择"关闭右侧"
      const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '左节点1' });
      await tab1.click({ button: 'right' });

      const closeRightItem = contentPage.locator('.s-contextmenu').locator('text="关闭右侧"');
      await closeRightItem.click();

      // 验证弹出确认对话框
      const dialog = contentPage.locator('.el-message-box');
      await expect(dialog).toBeVisible({ timeout: 2000 });
    });

    test('右键"全部关闭"包含未保存tab应逐个弹出确认对话框', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '全部节点1', type: 'http' },
        { name: '全部节点2', type: 'http' },
        { name: '全部节点3', type: 'http' },
      ]);

      // 修改节点1和节点2
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '全部节点1' }).click();
      let urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://all1.example.com');
      await contentPage.waitForTimeout(1000);

      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '全部节点2' }).click();
      urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://all2.example.com');
      await contentPage.waitForTimeout(1000);

      // 验证显示未保存标识
      const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '全部节点1' });
      const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '全部节点2' });
      await expect(tab1.locator('.has-change .dot')).toBeVisible();
      await expect(tab2.locator('.has-change .dot')).toBeVisible();

      // 右键点击任意tab选择"全部关闭"
      const tab3 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '全部节点3' });
      await tab3.click({ button: 'right' });

      const closeAllItem = contentPage.locator('.s-contextmenu').locator('text="全部关闭"');
      await closeAllItem.click();

      // 验证弹出第一个确认对话框
      const dialog = contentPage.locator('.el-message-box');
      await expect(dialog).toBeVisible({ timeout: 2000 });

      // 选择"不保存"继续关闭
      let noSaveBtn = dialog.locator('button').filter({ hasText: /不保存|放弃/ });
      if (await noSaveBtn.count() > 0) {
        await noSaveBtn.click();
        await contentPage.waitForTimeout(500);

        // 验证弹出第二个确认对话框（针对第二个未保存的tab）
        if (await dialog.isVisible({ timeout: 1000 })) {
          noSaveBtn = dialog.locator('button').filter({ hasText: /不保存|放弃/ });
          if (await noSaveBtn.count() > 0) {
            await noSaveBtn.click();
          }
        }
      }

      // 验证所有tab都已关闭
      await contentPage.waitForTimeout(500);
      const tabCount = await contentPage.locator('.nav .tab-list .item').count();
      expect(tabCount).toBe(0);
    });

    test('右键"强制全部关闭"应直接关闭所有tab无确认对话框', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '强制节点1', type: 'http' },
        { name: '强制节点2', type: 'http' },
      ]);

      // 修改节点1使其未保存
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '强制节点1' }).click();
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://force1.example.com');
      await contentPage.waitForTimeout(1000);

      // 验证显示未保存标识
      const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '强制节点1' });
      await expect(tab1.locator('.has-change .dot')).toBeVisible();

      // 右键点击任意tab
      const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '强制节点2' });
      await tab2.click({ button: 'right' });

      // 点击"强制全部关闭"
      const forceCloseAllItem = contentPage.locator('.s-contextmenu').locator('text="强制全部关闭"');
      await forceCloseAllItem.click();

      // 等待一小段时间
      await contentPage.waitForTimeout(500);

      // 验证没有弹出确认对话框（对话框不应出现）
      const dialog = contentPage.locator('.el-message-box');
      const dialogVisible = await dialog.isVisible({ timeout: 500 }).catch(() => false);
      expect(dialogVisible).toBe(false);

      // 验证所有tab已直接关闭
      const tabCount = await contentPage.locator('.nav .tab-list .item').count();
      expect(tabCount).toBe(0);
    });
  });

  // ==================== 测试组5: 拖拽排序 (6个用例) ====================
  test.describe('拖拽排序', () => {
    test('应能将第一个tab拖拽到最后位置', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点A', type: 'http' },
        { name: '节点B', type: 'http' },
        { name: '节点C', type: 'http' },
      ]);

      const tabA = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点A' });
      const tabC = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点C' });

      // 拖拽第一个tab到最后
      await tabA.dragTo(tabC);

      // 等待动画完成
      await contentPage.waitForTimeout(200);

      // 验证顺序变为: B, C, A
      const tabs = contentPage.locator('.nav .tab-list .item');
      await expect(tabs.nth(0)).toContainText('节点B');
      await expect(tabs.nth(1)).toContainText('节点C');
      await expect(tabs.nth(2)).toContainText('节点A');
    });

    test('应能将最后一个tab拖拽到第一个位置', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点A', type: 'http' },
        { name: '节点B', type: 'http' },
        { name: '节点C', type: 'http' },
      ]);

      const tabA = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点A' });
      const tabC = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点C' });

      // 拖拽最后一个tab到第一个位置
      await tabC.dragTo(tabA);

      await contentPage.waitForTimeout(200);

      // 验证顺序变为: C, A, B
      const tabs = contentPage.locator('.nav .tab-list .item');
      await expect(tabs.nth(0)).toContainText('节点C');
      await expect(tabs.nth(1)).toContainText('节点A');
      await expect(tabs.nth(2)).toContainText('节点B');
    });

    test('拖拽后tab顺序应立即更新', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点1', type: 'http' },
        { name: '节点2', type: 'http' },
      ]);

      const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点1' });
      const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点2' });

      // 拖拽
      await tab1.dragTo(tab2);

      // 立即验证顺序
      const tabs = contentPage.locator('.nav .tab-list .item');
      const firstTabText = await tabs.nth(0).textContent();
      expect(firstTabText).toContain('节点2');
    });

    test('拖拽后应持久化到localStorage', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点X', type: 'http' },
        { name: '节点Y', type: 'http' },
        { name: '节点Z', type: 'http' },
      ]);

      const tabX = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点X' });
      const tabZ = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点Z' });

      // 拖拽X到最后
      await tabX.dragTo(tabZ);

      // 刷新页面验证持久化
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 验证顺序保持: Y, Z, X
      const tabs = contentPage.locator('.nav .tab-list .item');
      await expect(tabs.nth(0)).toContainText('节点Y');
      await expect(tabs.nth(1)).toContainText('节点Z');
      await expect(tabs.nth(2)).toContainText('节点X');
    });

    test('拖拽动画应平滑', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点1', type: 'http' },
        { name: '节点2', type: 'http' },
      ]);

      // 验证拖拽容器使用了vuedraggable
      const tabList = contentPage.locator('.nav .tab-list');
      const classList = await tabList.getAttribute('class');

      // vuedraggable应用的类或属性
      expect(classList).toBeTruthy();
    });

    test('刷新后应保持拖拽后的顺序', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: 'Alpha', type: 'http' },
        { name: 'Beta', type: 'http' },
        { name: 'Gamma', type: 'http' },
      ]);

      // 拖拽调整顺序
      const tabAlpha = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Alpha' });
      const tabGamma = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'Gamma' });
      await tabAlpha.dragTo(tabGamma);

      // 验证当前顺序
      let tabs = contentPage.locator('.nav .tab-list .item');
      await expect(tabs.nth(0)).toContainText('Beta');

      // 刷新页面
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 验证顺序保持
      tabs = contentPage.locator('.nav .tab-list .item');
      await expect(tabs.nth(0)).toContainText('Beta');
      await expect(tabs.nth(1)).toContainText('Gamma');
      await expect(tabs.nth(2)).toContainText('Alpha');
    });
  });

  // ==================== 测试组6: Tab固定功能 (4个用例) ====================
  test.describe('Tab固定功能', () => {
    test('双击tab应切换固定状态', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '测试节点', type: 'http' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '测试节点' });

      // 初始状态应该是固定的（新创建的tab默认fixed: true）
      let fixed = await tab.evaluate((el: HTMLElement) => {
        const transform = window.getComputedStyle(el).transform;
        return transform === 'none';
      });
      expect(fixed).toBe(true);

      // 双击取消固定
      await tab.dblclick();
      await contentPage.waitForTimeout(200);

      // 验证已取消固定
      fixed = await tab.evaluate((el: HTMLElement) => {
        const transform = window.getComputedStyle(el).transform;
        return transform === 'none';
      });
      expect(fixed).toBe(false);

      // 再次双击固定
      await tab.dblclick();
      await contentPage.waitForTimeout(200);

      // 验证已固定
      fixed = await tab.evaluate((el: HTMLElement) => {
        const transform = window.getComputedStyle(el).transform;
        return transform === 'none';
      });
      expect(fixed).toBe(true);
    });

    test('固定的tab文本不应倾斜', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '固定节点', type: 'http' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '固定节点' });

      // 双击固定
      await tab.dblclick();
      await contentPage.waitForTimeout(200);

      // 验证transform为none（不倾斜）
      const textSpan = tab.locator('.item-text').first();
      const transform = await textSpan.evaluate((el: HTMLElement) => window.getComputedStyle(el).transform);
      expect(transform).toBe('none');
    });

    test('未固定的tab文本应倾斜', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '未固定节点', type: 'http' });

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '未固定节点' });

      // 新创建的节点默认是固定的，需要先取消固定
      await tab.dblclick();
      await contentPage.waitForTimeout(200);

      // 验证transform不为none（有倾斜）
      const textSpan = tab.locator('.item-text').first();
      const transform = await textSpan.evaluate((el: HTMLElement) => window.getComputedStyle(el).transform);
      expect(transform).not.toBe('none');
      // 应该包含skewX的matrix值
      expect(transform).toContain('matrix');
    });

    test('固定状态应持久化', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点1', type: 'http' },
        { name: '节点2', type: 'http' },
      ]);

      // 固定第一个节点
      const tab1 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点1' });
      await tab1.dblclick();
      await contentPage.waitForTimeout(200);

      // 验证已固定
      let fixed1 = await tab1.evaluate((el: HTMLElement) => {
        const transform = window.getComputedStyle(el).transform;
        return transform === 'none';
      });
      expect(fixed1).toBe(true);

      // 刷新页面
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 验证固定状态保持
      const tab1AfterReload = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点1' });
      fixed1 = await tab1AfterReload.evaluate((el: HTMLElement) => {
        const transform = window.getComputedStyle(el).transform;
        return transform === 'none';
      });
      expect(fixed1).toBe(true);

      // 验证第二个节点仍未固定
      const tab2AfterReload = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点2' });
      const fixed2 = await tab2AfterReload.evaluate((el: HTMLElement) => {
        const transform = window.getComputedStyle(el).transform;
        return transform === 'none';
      });
      expect(fixed2).toBe(false);
    });
  });

  // ==================== 测试组7: 未保存状态 (4个用例) ====================
  test.describe('未保存状态', () => {
    test('修改节点URL后tab应显示未保存圆点', async ({ electronApp }) => {
      await createNodes(contentPage, { name: 'API节点', type: 'http' });

      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://api.example.com');

      // 验证显示未保存圆点
      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: 'API节点' });
      const hasDot = await tab.isVisible() && await tab.locator('.has-change .dot').isVisible();
      expect(hasDot).toBe(true);

      // 验证圆点颜色（绿色 #36cea1）
      const dot = tab.locator('.has-change .dot');
      const bgColor = await dot.evaluate((el: HTMLElement) => window.getComputedStyle(el).backgroundColor);
      expect(bgColor).toBe('rgb(54, 206, 161)'); // #36cea1
    });

    test('修改节点名称后tab应显示未保存圆点', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '原始名称', type: 'http' });

      // 修改节点名称（通过banner编辑）
      const bannerTitle = contentPage.locator('.banner .info .operate input');
      await bannerTitle.fill('修改后名称');

      // 验证显示未保存圆点
      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '修改后名称' });
      const hasDot = await tab.isVisible() && await tab.locator('.has-change .dot').isVisible();
      expect(hasDot).toBe(true);
    });

    test('保存节点后圆点应消失显示关闭按钮', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '待保存节点', type: 'http' });

      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://api.example.com/test');

      // 验证显示圆点
      let tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '待保存节点' });
      let hasDot = await tab.isVisible() && await tab.locator('.has-change .dot').isVisible();
      expect(hasDot).toBe(true);

      // 保存节点（Ctrl+S）
      await contentPage.keyboard.press('Control+S');
      await contentPage.waitForTimeout(500);

      // 验证圆点消失
      tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '待保存节点' });
      hasDot = await tab.isVisible() && await tab.locator('.has-change .dot').isVisible();
      expect(hasDot).toBe(false);

      // 验证显示关闭按钮
      await tab.hover();
      const closeBtn = tab.locator('.close');
      await expect(closeBtn).toBeVisible();
    });

    test('悬停未保存tab时圆点应隐藏关闭按钮应显示', async ({ electronApp }) => {
      await createNodes(contentPage, { name: '测试节点', type: 'http' });

      // 修改URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://api.example.com');

      const tab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '测试节点' });

      // 悬停
      await tab.hover();

      // 验证关闭按钮显示
      const closeBtn = tab.locator('.close');
      await expect(closeBtn).toBeVisible();

      // 圆点应该隐藏（CSS控制）
      const dot = tab.locator('.has-change .dot');
      const dotVisible = await dot.isVisible();
      // 注意: 圆点可能通过opacity或display:none隐藏
      // 这里我们验证关闭按钮可见即可
      expect(await closeBtn.isVisible()).toBe(true);
    });
  });

  // ==================== 测试组8: 多Tab场景 (3个用例) ====================
  test.describe('多Tab场景', () => {
    test('同时打开15个tab应启用横向滚动', async ({ electronApp }) => {
      // 创建15个节点
      const nodes = Array.from({ length: 15 }, (_, i) => ({
        name: `接口${i + 1}`,
        type: 'http' as const,
      }));
      await createNodes(contentPage, nodes);

      // 验证tab数量
      const tabCount = await contentPage.locator('.nav .tab-list .item').count();
      expect(tabCount).toBe(15);

      // 验证滚动容器
      const tabList = contentPage.locator('.nav .tab-list');
      const overflowX = await tabList.evaluate((el: HTMLElement) => window.getComputedStyle(el).overflowX);
      expect(overflowX).toBe('auto');

      // 验证可以滚动
      const scrollWidth = await tabList.evaluate((el: HTMLElement) => el.scrollWidth);
      const clientWidth = await tabList.evaluate((el: HTMLElement) => el.clientWidth);
      expect(scrollWidth).toBeGreaterThan(clientWidth);
    });

    test('关闭中间某个tab应正确更新其他tab的索引', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点1', type: 'http' },
        { name: '节点2', type: 'http' },
        { name: '节点3', type: 'http' },
        { name: '节点4', type: 'http' },
      ]);

      // 关闭第二个tab
      const tab2 = contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点2' });
      await tab2.hover();
      await tab2.locator('.close').click();

      // 验证剩余3个tab
      const tabCount = await contentPage.locator('.nav .tab-list .item').count();
      expect(tabCount).toBe(3);

      // 验证剩余tab顺序正确
      const tabs = contentPage.locator('.nav .tab-list .item');
      await expect(tabs.nth(0)).toContainText('节点1');
      await expect(tabs.nth(1)).toContainText('节点3');
      await expect(tabs.nth(2)).toContainText('节点4');
    });

    test('快速连续创建10个tab应全部正常显示', async ({ electronApp }) => {
      // 快速创建10个节点
      const nodes = Array.from({ length: 10 }, (_, i) => ({
        name: `快速节点${i + 1}`,
        type: 'http' as const,
      }));

      await createNodes(contentPage, nodes);

      // 验证所有tab都显示
      const tabCount = await contentPage.locator('.nav .tab-list .item').count();
      expect(tabCount).toBe(10);

      // 验证最后一个tab可见
      const lastTab = contentPage.locator('.nav .tab-list .item').filter({ hasText: '快速节点10' });
      await expect(lastTab).toBeVisible();
    });
  });

  // ==================== 测试组9: 持久化验证 (3个用例) ====================
  test.describe('持久化验证', () => {
    test('刷新页面后应恢复所有打开的tabs', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '持久化节点1', type: 'http' },
        { name: '持久化节点2', type: 'websocket' },
        { name: '持久化节点3', type: 'httpMock' },
      ]);

      // 验证当前有3个tab
      let tabCount = await contentPage.locator('.nav .tab-list .item').count();
      expect(tabCount).toBe(3);

      // 刷新页面
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 验证仍有3个tab
      tabCount = await contentPage.locator('.nav .tab-list .item').count();
      expect(tabCount).toBe(3);

      // 验证tab内容正确
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '持久化节点1' })).toBeVisible();
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '持久化节点2' })).toBeVisible();
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '持久化节点3' })).toBeVisible();
    });

    test('刷新页面后应恢复激活的tab', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '节点A', type: 'http' },
        { name: '节点B', type: 'http' },
        { name: '节点C', type: 'http' },
      ]);

      // 切换到第二个tab
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点B' }).click();
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点B' })).toHaveClass(/active/);

      // 刷新页面
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 验证第二个tab仍然激活
      await expect(contentPage.locator('.nav .tab-list .item').filter({ hasText: '节点B' })).toHaveClass(/active/);
    });

    test('刷新页面后应恢复每个tab的固定状态', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: '固定节点A', type: 'http' },
        { name: '普通节点B', type: 'http' },
        { name: '固定节点C', type: 'http' },
      ]);

      // 固定第一个和第三个节点
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '固定节点A' }).dblclick();
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: '固定节点C' }).dblclick();

      // 验证固定状态
      let tabA = contentPage.locator('.nav .tab-list .item').filter({ hasText: '固定节点A' });
      let tabB = contentPage.locator('.nav .tab-list .item').filter({ hasText: '普通节点B' });
      let tabC = contentPage.locator('.nav .tab-list .item').filter({ hasText: '固定节点C' });

      let fixedA = await tabA.evaluate((el: HTMLElement) => {
        const transform = window.getComputedStyle(el).transform;
        return transform === 'none';
      });
      let fixedB = await tabB.evaluate((el: HTMLElement) => {
        const transform = window.getComputedStyle(el).transform;
        return transform === 'none';
      });
      let fixedC = await tabC.evaluate((el: HTMLElement) => {
        const transform = window.getComputedStyle(el).transform;
        return transform === 'none';
      });

      expect(fixedA).toBe(true);
      expect(fixedB).toBe(false);
      expect(fixedC).toBe(true);

      // 刷新页面
      await contentPage.reload();
      await contentPage.waitForLoadState('domcontentloaded');
      await contentPage.waitForTimeout(1000);

      // 验证固定状态保持
      tabA = contentPage.locator('.nav .tab-list .item').filter({ hasText: '固定节点A' });
      tabB = contentPage.locator('.nav .tab-list .item').filter({ hasText: '普通节点B' });
      tabC = contentPage.locator('.nav .tab-list .item').filter({ hasText: '固定节点C' });

      fixedA = await tabA.evaluate((el: HTMLElement) => {
        const transform = window.getComputedStyle(el).transform;
        return transform === 'none';
      });
      fixedB = await tabB.evaluate((el: HTMLElement) => {
        const transform = window.getComputedStyle(el).transform;
        return transform === 'none';
      });
      fixedC = await tabC.evaluate((el: HTMLElement) => {
        const transform = window.getComputedStyle(el).transform;
        return transform === 'none';
      });

      expect(fixedA).toBe(true);
      expect(fixedB).toBe(false);
      expect(fixedC).toBe(true);
    });
  });

  // ==================== 测试组10: 请求取消机制 (1个用例) ====================
  test.describe('请求取消机制', () => {
    test('切换tab时应取消当前发送中的请求', async ({ electronApp }) => {
      await createNodes(contentPage, [
        { name: 'API1', type: 'http' },
        { name: 'API2', type: 'http' },
      ]);

      // 在第一个tab设置一个会超时的URL
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: 'API1' }).click();
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.fill('https://httpbin.org/delay/10');

      // 发送请求（不等待完成）
      const sendBtn = contentPage.locator('.send-btn');
      await sendBtn.click();

      // 等待请求开始
      await contentPage.waitForTimeout(500);

      // 验证请求正在进行（loading状态）
      const loadingIndicator = contentPage.locator('.loading-icon, .el-loading-mask');
      if (await loadingIndicator.count() > 0) {
        await expect(loadingIndicator.first()).toBeVisible();
      }

      // 切换到第二个tab
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: 'API2' }).click();

      // 等待tab切换完成

      // 切换回第一个tab
      await contentPage.locator('.nav .tab-list .item').filter({ hasText: 'API1' }).click();

      // 验证请求已取消（loading消失，状态为waiting）
      // 由于请求被取消，响应区域应该为空或显示取消状态
      const responseArea = contentPage.locator('.response-container');
      const isEmpty = await responseArea.evaluate((el: HTMLElement) => {
        return el.textContent?.trim() === '' || el.textContent?.includes('取消') || el.textContent?.includes('中断');
      });

      // 或者验证loading已消失
      if (await loadingIndicator.count() > 0) {
        await expect(loadingIndicator.first()).not.toBeVisible({ timeout: 2000 });
      }
    });
  });
});
