import { test, expect } from '../../../../../fixtures/electron.fixture';

test.describe('CallHistory', () => {
  // 测试用例1: 切换到调用历史Tab页,验证Tab切换功能和UI展示
  test('切换到调用历史Tab页,验证Tab切换功能', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 验证Banner区域的Tab切换器存在
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    await expect(bannerTabs).toBeVisible({ timeout: 5000 });
    // 验证存在"接口列表"和"调用历史"两个Tab选项
    const listTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /接口列表/ });
    const historyTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /调用历史/ });
    await expect(listTab).toBeVisible();
    await expect(historyTab).toBeVisible();
    // 点击"调用历史"Tab
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    // 验证SendHistory组件渲染
    const sendHistoryComponent = contentPage.locator('.send-history');
    await expect(sendHistoryComponent).toBeVisible({ timeout: 5000 });
    // 切换回"接口列表"Tab
    await listTab.click();
    await contentPage.waitForTimeout(300);
    // 验证el-tree节点树显示
    const nodeTree = contentPage.locator('[data-testid="banner-doc-tree"]');
    await expect(nodeTree).toBeVisible({ timeout: 5000 });
  });

  // 测试用例2: 调用历史搜索框功能验证
  test('调用历史搜索框功能验证,包括placeholder和清空按钮', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 添加HTTP节点
    const addHttpBtn = contentPage.getByTitle('新增文件', { exact: true });
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    await addApiDialog.locator('input').first().fill('未命名接口');
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 切换到调用历史Tab
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    // 验证搜索框存在
    const searchInput = contentPage.locator('.send-history-search .el-input');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    // 验证搜索框placeholder显示"过滤历史记录"
    const inputElement = searchInput.locator('input');
    await expect(inputElement).toHaveAttribute('placeholder', /过滤历史记录/);
    // 验证搜索框左侧显示搜索图标
    const searchIcon = searchInput.locator('.el-input__prefix .el-icon');
    await expect(searchIcon).toBeVisible();
    // 验证搜索框右侧显示清空历史记录图标
    const deleteIcon = searchInput.locator('.clear-history-icon');
    await expect(deleteIcon).toBeVisible();
    // 输入搜索内容
    await inputElement.fill('test');
    await contentPage.waitForTimeout(400);
    // 验证clearable清空按钮出现
    const clearBtn = searchInput.locator('.el-input__clear');
    await expect(clearBtn).toBeVisible();
    // 点击清空按钮清除输入内容
    await clearBtn.click();
    await expect(inputElement).toHaveValue('');
  });

  // 测试用例3: 清空所有历史记录功能验证
  test('清空所有历史记录功能验证,包括确认弹窗', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 切换到调用历史Tab
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    // 定位清空历史记录图标
    const deleteIcon = contentPage.locator('.send-history-search .clear-history-icon');
    await expect(deleteIcon).toBeVisible({ timeout: 5000 });
    // 验证删除图标title显示"清空历史记录"
    await expect(deleteIcon).toHaveAttribute('title', /清空历史记录/);
    // 点击删除图标
    await deleteIcon.click();
    await contentPage.waitForTimeout(300);
    // 验证弹出确认对话框
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    // 验证对话框内容
    const dialogContent = confirmDialog.locator('.cl-confirm-content');
    await expect(dialogContent).toContainText(/确定要清空所有历史记录吗/);
    // 点击"取消"按钮
    const cancelBtn = confirmDialog.locator('.cl-confirm-footer-right button').filter({ hasText: /取消/ });
    await cancelBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证对话框关闭
    await expect(confirmDialog).toBeHidden({ timeout: 5000 });
  });

  // 测试用例4: 历史记录列表展示验证
  test('历史记录列表展示验证,包括空状态', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 切换到调用历史Tab
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    // 验证历史列表容器存在
    const historyList = contentPage.locator('.send-history-list');
    await expect(historyList).toBeVisible({ timeout: 5000 });
    // 验证暂无历史记录的空状态显示
    const emptyState = contentPage.locator('.send-history-list .empty');
    await expect(emptyState).toBeVisible({ timeout: 5000 });
    await expect(emptyState).toContainText(/暂无历史记录/);
  });

  // 测试用例5: 点击历史记录项打开对应接口Tab页
  test('点击历史记录项打开对应接口Tab页', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 添加HTTP节点
    const addHttpBtn = contentPage.getByTitle('新增文件', { exact: true });
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    const httpName = '未命名接口';
    await addApiDialog.locator('input').first().fill(httpName);
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 选中接口节点，发送请求生成历史记录
    const bannerTree = contentPage.locator('[data-testid="banner-doc-tree"]');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    await bannerTree.locator('.el-tree-node__content', { hasText: httpName }).first().click();
    const urlEditor = contentPage.locator('[data-testid="url-input"] .ProseMirror');
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.click();
    await contentPage.keyboard.press('Control+A');
    await contentPage.keyboard.type('http://localhost:3456/echo');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
    await sendBtn.click();
    await contentPage.waitForTimeout(800);

    // 新增一个空白接口Tab，使当前接口Tab不再被选中
    const addTabBtn = contentPage.locator('[data-testid="project-nav-add-tab-btn"]');
    await expect(addTabBtn).toBeVisible({ timeout: 5000 });
    await addTabBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证新Tab被选中，原Tab不再是active状态
    const apiTab = contentPage.locator('[data-testid^="project-nav-tab-"]').filter({ hasText: httpName }).first();
    await expect(apiTab).toBeVisible({ timeout: 5000 });
    await expect(apiTab).not.toHaveClass(/active/);

    // 切换到调用历史Tab
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(500);
    // 等待历史记录项出现并点击
    const historyItem = contentPage.locator('.send-history-list .history-item').first();
    await expect(historyItem).toBeVisible({ timeout: 15000 });
    await historyItem.click();
    await contentPage.waitForTimeout(500);
    // 验证点击历史记录后，对应接口Tab被选中激活
    await expect(apiTab).toHaveClass(/active/, { timeout: 5000 });
  });

  // 测试用例6: 已删除接口的历史记录标记验证
  test('已删除接口的历史记录标记验证', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 添加HTTP节点
    const addHttpBtn = contentPage.getByTitle('新增文件', { exact: true });
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    const httpName = '未命名接口';
    await addApiDialog.locator('input').first().fill(httpName);
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 选中接口节点，发送请求生成历史记录
    const bannerTree = contentPage.locator('[data-testid="banner-doc-tree"]');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    const httpRow = bannerTree.locator('.el-tree-node__content', { hasText: httpName }).first();
    await httpRow.click();
    const urlEditor = contentPage.locator('[data-testid="url-input"] .ProseMirror');
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.click();
    await contentPage.keyboard.press('Control+A');
    await contentPage.keyboard.type('http://localhost:3456/echo');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
    await sendBtn.click();
    await contentPage.waitForTimeout(800);

    // 删除HTTP节点
    await httpRow.click({ button: 'right' });
  const deleteMenuItem = contentPage.locator('.s-contextmenu-item').filter({ hasText: /删除|Delete/ }).first();
    await expect(deleteMenuItem).toBeVisible({ timeout: 5000 });
    await deleteMenuItem.click();
    const confirmBtn = contentPage.locator('.cl-confirm-footer-right .el-button--primary');
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();
    await contentPage.waitForTimeout(800);
    // 切换到调用历史Tab
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(500);
    // 验证已删除接口的历史记录显示"已删除"标签，并显示清理按钮
    const deletedItem = contentPage.locator('.send-history-list .history-item.deleted-item').first();
    await expect(deletedItem).toBeVisible({ timeout: 15000 });
    const deletedTag = deletedItem.locator('.deleted-tag');
    await expect(deletedTag).toBeVisible({ timeout: 5000 });
    await expect(deletedTag).toContainText(/已删除/);
    const cleanDeletedBtn = contentPage.locator('.clean-deleted-btn');
    await expect(cleanDeletedBtn).toBeVisible({ timeout: 5000 });
  });

  // 测试用例7: 历史记录滚动加载更多功能验证
  test('历史记录滚动加载验证', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 预置足够数量的历史数据（31条），保证触发分页并出现“没有更多了”
    await contentPage.evaluate(async () => {
      const dbName = 'sendHistoryCache';
      const version = 2;
      const storeName = 'histories';
      const openRequest = indexedDB.open(dbName, version);
      const db: IDBDatabase = await new Promise((resolve, reject) => {
        openRequest.onupgradeneeded = () => {
          const upgradeDb = openRequest.result;
          if (!upgradeDb.objectStoreNames.contains(storeName)) {
            const store = upgradeDb.createObjectStore(storeName, { keyPath: '_id' });
            store.createIndex('nodeId', 'nodeId', { unique: false });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('networkType', 'networkType', { unique: false });
          }
        };
        openRequest.onsuccess = () => resolve(openRequest.result);
        openRequest.onerror = () => reject(openRequest.error);
      });

      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const now = Date.now();
      for (let i = 0; i < 31; i += 1) {
        store.put({
          _id: `e2e-${now}-${i}`,
          nodeId: `e2e-node-${i}`,
          nodeName: `E2E接口${i}`,
          nodeType: 'http',
          method: 'GET',
          url: `http://localhost:3456/echo?i=${i}`,
          timestamp: now - i,
          operatorName: 'e2e',
          networkType: 'offline'
        });
      }
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      db.close();
    });
    // 切换到调用历史Tab
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(300);
    // 验证历史列表容器存在且可滚动
    const historyList = contentPage.locator('.send-history-list');
    await expect(historyList).toBeVisible({ timeout: 5000 });
    // 等待列表至少渲染一条历史记录（避免仍处于加载状态）
    await expect(contentPage.locator('.send-history-list .history-item').first()).toBeVisible({ timeout: 15000 });
    // 滚动到底部触发加载更多，并最终出现“没有更多了”
    await historyList.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect(contentPage.locator('.send-history-list .no-more')).toBeVisible({ timeout: 15000 });
  });

  // 测试用例8: 清理已删除接口历史功能验证
  test('清理已删除接口历史功能验证', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 添加HTTP节点、发送请求生成历史，然后删除该接口，确保出现“已删除”历史
    const addHttpBtn = contentPage.getByTitle('新增文件', { exact: true });
    await expect(addHttpBtn).toBeVisible({ timeout: 5000 });
    await addHttpBtn.click();
    const addApiDialog = contentPage.locator('.el-dialog').filter({ hasText: /新建接口|Create/ });
    await expect(addApiDialog).toBeVisible({ timeout: 5000 });
    const httpName = '未命名接口';
    await addApiDialog.locator('input').first().fill(httpName);
    await addApiDialog.locator('.el-button--primary').last().click();
    await expect(addApiDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);

    const bannerTree = contentPage.locator('[data-testid="banner-doc-tree"]');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });
    const httpRow = bannerTree.locator('.el-tree-node__content', { hasText: httpName }).first();
    await httpRow.click();
    const urlEditor = contentPage.locator('[data-testid="url-input"] .ProseMirror');
    await expect(urlEditor).toBeVisible({ timeout: 5000 });
    await urlEditor.click();
    await contentPage.keyboard.press('Control+A');
    await contentPage.keyboard.type('http://localhost:3456/echo');
    const sendBtn = contentPage.locator('[data-testid="operation-send-btn"]');
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
    await sendBtn.click();
    await contentPage.waitForTimeout(800);

    await httpRow.click({ button: 'right' });
    const deleteMenuItem = contentPage.locator('.s-contextmenu-item').filter({ hasText: /删除|Delete/ }).first();
    await expect(deleteMenuItem).toBeVisible({ timeout: 5000 });
    await deleteMenuItem.click();
    const confirmBtn = contentPage.locator('.cl-confirm-footer-right .el-button--primary');
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();
    await contentPage.waitForTimeout(800);

    // 切换到调用历史Tab
    const bannerTabs = contentPage.locator('[data-testid="banner-tabs"]');
    const historyTab = bannerTabs.locator('.clean-tabs__item').filter({ hasText: /调用历史/ });
    await historyTab.click();
    await contentPage.waitForTimeout(300);

    // 验证清理按钮显示并包含数量
    const cleanDeletedBtn = contentPage.locator('.clean-deleted-btn');
    await expect(cleanDeletedBtn).toBeVisible({ timeout: 15000 });
    await expect(cleanDeletedBtn).toContainText(/\(\d+\)/);

    // 点击清理按钮，验证确认对话框并取消
    await cleanDeletedBtn.click();
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    const cancelBtn = confirmDialog.locator('.cl-confirm-footer-right button').filter({ hasText: /取消/ });
    await cancelBtn.click();
    await expect(confirmDialog).toBeHidden({ timeout: 5000 });

    // 再次点击清理按钮并确认，验证清理后列表为空状态（从UI角度验证）
    await cleanDeletedBtn.click();
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    const confirmClearBtn = confirmDialog.locator('.cl-confirm-footer-right .el-button--primary');
    await expect(confirmClearBtn).toBeVisible({ timeout: 5000 });
    await confirmClearBtn.click();
    await expect(confirmDialog).toBeHidden({ timeout: 5000 });
    await contentPage.waitForTimeout(500);

    // 已删除历史记录应被清理：deleted-item 不再出现
    const deletedItem = contentPage.locator('.send-history-list .history-item.deleted-item');
    await expect(deletedItem).toHaveCount(0);

    // 历史列表应展示空状态
    const emptyState = contentPage.locator('.send-history-list .empty');
    await expect(emptyState).toBeVisible({ timeout: 5000 });
    await expect(emptyState).toContainText(/暂无历史记录/);

    // 清理按钮应消失（没有可清理的已删除历史）
    await expect(cleanDeletedBtn).toBeHidden({ timeout: 5000 });
  });
});


