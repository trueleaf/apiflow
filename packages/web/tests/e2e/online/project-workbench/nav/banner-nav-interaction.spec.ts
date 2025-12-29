import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('BannerNavInteraction', () => {
  // 测试用例1: 单击左侧非folder类型节点,右侧导航栏会新增一个tab页签,并且页签为非固定状态,页签中字体为斜体
  test('单击左侧非folder类型节点新增非固定tab页签且字体斜体', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('测试接口1');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 关闭当前tab（双击创建的是固定tab）
    const closeBtn = contentPage.locator('[data-testid="project-nav-tab-close-btn"]').first();
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 单击banner中的节点
    const bannerNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试接口1' }).first();
    await bannerNode.click();
    await contentPage.waitForTimeout(300);
    // 验证tab页签存在
    const navTab = contentPage.locator('.nav .item.active');
    await expect(navTab).toBeVisible({ timeout: 3000 });
    // 验证页签文字为斜体（非固定状态）
    const itemText = navTab.locator('.item-text.unfixed');
    await expect(itemText).toBeVisible({ timeout: 3000 });
  });
  // 测试用例2: 双击左侧非folder类型节点,右侧导航栏会新增一个tab页签,并且页签为固定状态,页签中字体正常展示
  test('双击左侧非folder类型节点新增固定tab页签且字体正常', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('测试接口2');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 关闭当前tab
    const closeBtn = contentPage.locator('[data-testid="project-nav-tab-close-btn"]').first();
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 双击banner中的节点
    const bannerNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试接口2' }).first();
    await bannerNode.dblclick();
    await contentPage.waitForTimeout(300);
    // 验证tab页签存在
    const navTab = contentPage.locator('.nav .item.active');
    await expect(navTab).toBeVisible({ timeout: 3000 });
    // 验证页签文字不是斜体（固定状态，没有unfixed class）
    const itemText = navTab.locator('.item-text');
    await expect(itemText).toBeVisible({ timeout: 3000 });
    await expect(itemText).not.toHaveClass(/unfixed/);
  });
  // 测试用例3: 单击左侧folder类型节点,右侧导航栏不会新增一个tab页签
  test('单击左侧folder类型节点不会新增tab页签', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增文件夹节点
    const addFolderBtn = contentPage.getByTestId('banner-add-folder-btn');
    await addFolderBtn.click();
    const addFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增文件夹|新建文件夹|Add Folder/ });
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    const folderNameInput = addFolderDialog.locator('input').first();
    await folderNameInput.fill('测试文件夹');
    const confirmAddBtn = addFolderDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 获取当前tab数量
    const tabCountBefore = await contentPage.locator('.nav .item').count();
    // 单击folder节点
    const folderNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试文件夹' }).first();
    await folderNode.click();
    await contentPage.waitForTimeout(300);
    // 验证tab数量未变化
    const tabCountAfter = await contentPage.locator('.nav .item').count();
    expect(tabCountAfter).toBe(tabCountBefore);
  });
  // 测试用例4: 单击非folder节点A后再单击非folder节点B，节点B的tab会覆盖节点A的非固定tab
  test('单击非folder节点B覆盖非固定tab节点A', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增两个HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('接口A');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 关闭当前tab
    const closeBtn = contentPage.locator('[data-testid="project-nav-tab-close-btn"]').first();
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 新增第二个节点
    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('接口B');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 关闭当前tab
    await contentPage.locator('[data-testid="project-nav-tab-close-btn"]').first().click();
    await contentPage.waitForTimeout(300);
    // 单击节点A
    const nodeA = contentPage.locator('.el-tree-node__content').filter({ hasText: '接口A' }).first();
    await nodeA.click();
    await contentPage.waitForTimeout(300);
    // 获取当前tab数量
    const tabCountAfterClickA = await contentPage.locator('.nav .item').count();
    // 单击节点B
    const nodeB = contentPage.locator('.el-tree-node__content').filter({ hasText: '接口B' }).first();
    await nodeB.click();
    await contentPage.waitForTimeout(300);
    // 验证tab数量不变（B覆盖了A）
    const tabCountAfterClickB = await contentPage.locator('.nav .item').count();
    expect(tabCountAfterClickB).toBe(tabCountAfterClickA);
    // 验证当前激活的tab是接口B
    const activeTab = contentPage.locator('.nav .item.active');
    await expect(activeTab).toContainText('接口B');
  });
  // 测试用例5: 双击非folder节点覆盖非固定页签并设为固定
  test('双击非folder节点覆盖非固定页签并设为固定', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增两个HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('接口C');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 关闭当前固定tab
    await contentPage.locator('[data-testid="project-nav-tab-close-btn"]').first().click();
    await contentPage.waitForTimeout(300);
    // 新增第二个节点
    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('接口D');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 关闭当前tab
    await contentPage.locator('[data-testid="project-nav-tab-close-btn"]').first().click();
    await contentPage.waitForTimeout(300);
    // 单击节点C产生非固定页签
    const nodeC = contentPage.locator('.el-tree-node__content').filter({ hasText: '接口C' }).first();
    await nodeC.click();
    await contentPage.waitForTimeout(300);
    // 双击节点D
    const nodeD = contentPage.locator('.el-tree-node__content').filter({ hasText: '接口D' }).first();
    await nodeD.dblclick();
    await contentPage.waitForTimeout(300);
    // 验证当前激活的tab是接口D且为固定状态
    const activeTab = contentPage.locator('.nav .item.active');
    await expect(activeTab).toContainText('接口D');
    const itemText = activeTab.locator('.item-text');
    await expect(itemText).not.toHaveClass(/unfixed/);
  });
  // 测试用例6: banner新增节点会在右侧导航栏新增固定tab页签
  test('banner新增节点会在右侧导航栏新增固定tab页签', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('新增测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证tab页签存在且为固定状态
    const navTab = contentPage.locator('.nav .item.active');
    await expect(navTab).toBeVisible({ timeout: 3000 });
    await expect(navTab).toContainText('新增测试接口');
    const itemText = navTab.locator('.item-text');
    await expect(itemText).not.toHaveClass(/unfixed/);
  });
  // 测试用例7: 删除banner节点，右侧导航栏删除对应tab页签
  test('删除banner节点右侧导航栏删除对应tab页签', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('待删除接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证tab存在
    const navTab = contentPage.locator('.nav .item').filter({ hasText: '待删除接口' });
    await expect(navTab).toBeVisible({ timeout: 3000 });
    // 右键点击节点打开上下文菜单
    const bannerNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '待删除接口' }).first();
    await bannerNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    // 点击删除选项
    const deleteMenuItem = contentPage.locator('[data-testid="contextmenu-item-删除"], [data-testid="contextmenu-item-Delete"]');
    await deleteMenuItem.click();
    const confirmDeleteBtn = contentPage.locator('.el-message-box__btns .el-button--primary');
    await expect(confirmDeleteBtn).toBeVisible({ timeout: 3000 });
    await confirmDeleteBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证tab不存在
    await expect(navTab).not.toBeVisible();
  });
  // 测试用例8: 重命名banner节点，右侧导航栏对应tab页签名称更新
  test('重命名banner节点右侧导航栏对应tab页签名称更新', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('原接口名称');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证tab存在
    const navTab = contentPage.locator('.nav .item.active');
    await expect(navTab).toContainText('原接口名称');
    // 右键点击节点打开上下文菜单
    const bannerNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '原接口名称' }).first();
    await bannerNode.click({ button: 'right' });
    await contentPage.waitForTimeout(300);
    // 点击重命名选项
    const renameMenuItem = contentPage.locator('.s-contextmenu-item').filter({ hasText: /重命名|Rename/ });
    await renameMenuItem.click();
    await contentPage.waitForTimeout(300);
    // 清空并输入新名称
    const renameInput = contentPage.getByTestId('banner-doc-tree').locator('input.rename-ipt');
    await expect(renameInput).toBeVisible({ timeout: 3000 });
    await renameInput.fill('新接口名称');
    await renameInput.press('Enter');
    await contentPage.waitForTimeout(500);
    // 验证tab名称更新
    await expect(navTab).toContainText('新接口名称');
  });
  // 测试用例9: 点击tab页签，左侧banner节点高亮
  test('点击tab页签左侧banner节点高亮', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增两个HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('接口E');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 新增第二个节点
    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('接口F');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 点击第一个tab
    const tabE = contentPage.locator('.nav .item').filter({ hasText: '接口E' });
    await tabE.click();
    await contentPage.waitForTimeout(300);
    // 验证banner中对应节点高亮
    const bannerNodeE = contentPage.getByTestId('banner-doc-tree').locator('.custom-tree-node.active-node').filter({ hasText: '接口E' });
    await expect(bannerNodeE).toBeVisible({ timeout: 3000 });
  });
  // 测试用例10: 单击非固定页签变为固定
  test('双击非固定页签变为固定', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('测试接口G');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    // 关闭固定tab
    await contentPage.locator('[data-testid="project-nav-tab-close-btn"]').first().click();
    await contentPage.waitForTimeout(300);
    // 单击产生非固定tab
    const bannerNode = contentPage.locator('.el-tree-node__content').filter({ hasText: '测试接口G' }).first();
    await bannerNode.click();
    await contentPage.waitForTimeout(300);
    // 验证为非固定状态
    const navTab = contentPage.locator('.nav .item.active');
    const itemText = navTab.locator('.item-text');
    await expect(itemText).toHaveClass(/unfixed/);
    // 双击tab固定
    await navTab.dblclick();
    await contentPage.waitForTimeout(300);
    // 验证变为固定状态
    await expect(itemText).not.toHaveClass(/unfixed/);
  });
});
