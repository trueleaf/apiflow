import { test, expect } from '../../../../../../fixtures/electron-online.fixture';

test.describe('BinaryBodyValidation', () => {
  // ========================= Binary Body类型切换测试 =========================
  // 测试用例1: 切换Body类型为Binary后显示Binary选项
  test('切换Body类型为Binary后显示Binary选项', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    // clearCache() 已经导航到首页并刷新，无需再等待
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary测试接口');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到Body标签
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择binary类型
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await expect(binaryRadio).toBeVisible({ timeout: 5000 });
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    // 验证binary-wrap区域显示
    const binaryWrap = contentPage.locator('.binary-wrap');
    await expect(binaryWrap).toBeVisible({ timeout: 5000 });
    // 验证变量模式和文件模式选项存在
    const varModeRadio = binaryWrap.locator('.el-radio', { hasText: /变量模式/ });
    const fileModeRadio = binaryWrap.locator('.el-radio', { hasText: /文件模式/ });
    await expect(varModeRadio).toBeVisible();
    await expect(fileModeRadio).toBeVisible();
  });

  // ========================= Binary变量模式测试 =========================
  // 测试用例2: Binary变量模式输入框可见
  test('Binary变量模式输入框可见', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    // clearCache() 已经导航到首页并刷新，无需
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary变量模式测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到Body标签
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择binary类型
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择变量模式
    const binaryWrap = contentPage.locator('.binary-wrap');
    const varModeRadio = binaryWrap.locator('.el-radio', { hasText: /变量模式/ });
    await varModeRadio.click();
    await contentPage.waitForTimeout(300);
    // 验证变量输入框可见
    const varModeDiv = contentPage.locator('.var-mode');
    await expect(varModeDiv).toBeVisible({ timeout: 5000 });
    const varInput = varModeDiv.locator('.el-input');
    await expect(varInput).toBeVisible();
  });

  // 测试用例3: Binary变量模式可以输入变量
  test('Binary变量模式可以输入变量', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    // clearCache() 已经导航到首页并刷新，无需再等待
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary变量输入测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到Body标签
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择binary类型
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择变量模式
    const binaryWrap = contentPage.locator('.binary-wrap');
    const varModeRadio = binaryWrap.locator('.el-radio', { hasText: /变量模式/ });
    await varModeRadio.click();
    await contentPage.waitForTimeout(300);
    // 输入变量值
    const varInput = contentPage.locator('.var-mode .el-input input');
    await varInput.fill('{{fileValue}}');
    await contentPage.waitForTimeout(300);
    // 验证输入值正确
    await expect(varInput).toHaveValue('{{fileValue}}');
  });

  // ========================= Binary文件模式测试 =========================
  // 测试用例4: Binary文件模式选择文件按钮可见
  test('Binary文件模式选择文件按钮可见', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    // clearCache() 已经导航到首页并刷新，无需再等待
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary文件模式测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到Body标签
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择binary类型
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择文件模式
    const binaryWrap = contentPage.locator('.binary-wrap');
    const fileModeRadio = binaryWrap.locator('.el-radio', { hasText: /文件模式/ });
    await fileModeRadio.click();
    await contentPage.waitForTimeout(300);
    // 验证文件模式区域可见
    const fileModeDiv = contentPage.locator('.file-mode');
    await expect(fileModeDiv).toBeVisible({ timeout: 5000 });
    // 验证选择文件标签可见
    const selectFileLabel = fileModeDiv.locator('label', { hasText: /选择文件/ });
    await expect(selectFileLabel).toBeVisible();
  });

  // 测试用例5: Binary模式切换在变量和文件之间
  test('Binary模式切换在变量和文件之间', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    // clearCache() 已经导航到首页并刷新，无需再等待
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary模式切换测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到Body标签
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择binary类型
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    const binaryWrap = contentPage.locator('.binary-wrap');
    // 初始状态应该是变量模式
    const varModeRadio = binaryWrap.locator('.el-radio', { hasText: /变量模式/ });
    const fileModeRadio = binaryWrap.locator('.el-radio', { hasText: /文件模式/ });
    // 切换到文件模式
    await fileModeRadio.click();
    await contentPage.waitForTimeout(300);
    const fileModeDiv = contentPage.locator('.file-mode');
    await expect(fileModeDiv).toBeVisible({ timeout: 5000 });
    // 切换回变量模式
    await varModeRadio.click();
    await contentPage.waitForTimeout(300);
    const varModeDiv = contentPage.locator('.var-mode');
    await expect(varModeDiv).toBeVisible({ timeout: 5000 });
    // 验证文件模式隐藏
    await expect(fileModeDiv).toBeHidden();
  });

  // ========================= Binary POST请求方法测试 =========================
  // 测试用例6: POST方法下可以选择Binary类型
  test('POST方法下可以选择Binary类型', asy, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    // clearCache() 已经导航到首页并刷新，无需再等待
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('POST Binary测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 选择POST方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.waitForTimeout(200);
    const postOption = contentPage.locator('.el-select-dropdown__item', { hasText: 'POST' });
    await postOption.click();
    await contentPage.waitForTimeout(300);
    // 切换到Body标签
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 验证binary选项可见
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await expect(binaryRadio).toBeVisible({ timeout: 5000 });
    // 点击binary选项
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    // 验证binary-wrap显示
    const binaryWrap = contentPage.locator('.binary-wrap');
    await expect(binaryWrap).toBeVisible({ timeout: 5000 });
  });

  // ========================= PUT方法下Binary测试 =========================
  // 测试用例7: PUT方法下可以选择Binary类型
  test('PUT方法下可以选择Binary类型', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    // clearCache() 已经导航到首页并刷新，无需再等待
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('PUT Binary测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 选择PUT方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.waitForTimeout(200);
    const putOption = contentPage.locator('.el-select-dropdown__item', { hasText: 'PUT' });
    await putOption.click();
    await contentPage.waitForTimeout(300);
    // 切换到Body标签
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 验证binary选项可见
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await expect(binaryRadio).toBeVisible({ timeout: 5000 });
    // 点击binary选项
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    // 验证binary-wrap显示
    const binaryWrap = contentPage.locator('.binary-wrap');
    await expect(binaryWrap).toBeVisible({ timeout: 5000 });
  });

  // ========================= PA===========
  // 测试用例8: PATCH方法下可以选择Binary类型
  test('PATCH方法下可以选择Binary类型', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    // clearCache() 已经导航到首页并刷新，无需再等待
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('PATCH Binary测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 选择PATCH方法
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.waitForTimeout(200);
    const patchOption = contentPage.locator('.el-select-dropdown__item', { hasText: 'PATCH' });
    await patchOption.click();
    await contentPage.waitForTimeout(300);
    // 切换到Body标签
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 验证binary选项可见
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await expect(binaryRadio).toBeVisible({ timeout: 5000 });
    // 点击binary选项
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    // 验证binary-wrap显示
    const binaryWrap = contentPage.locator('.binary-wrap');
    await expect(binaryWrap).toBeVisible({ timeout: 5000 });
  });

  // ========================= Binary变量值保持测试 =========================
  // 测试用例9: Binary变量模式输入值在切换tab后保持
  test('Binary变量模式输入值在切换tab后保持', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    // clearCache() 已经导航到首页并刷新，无需再等待
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary值保持测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到Body标签
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择binary类型
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择变量模式并输入值
    const binaryWrap = contentPage.locator('.binary-wrap');
    const varModeRadio = binaryWrap.locator('.el-radio', { hasText: /变量模式/ });
    await varModeRadio.click();
    await contentPage.waitForTimeout(300);
    const varInput = contentPage.locator('.var-mode .el-input input');
    await varInput.fill('{{testBinaryVar}}');
    await contentPage.waitForTimeout(300);
    // 切换到Query标签
    const queryTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await queryTab.click();
    await contentPage.waitForTimeout(300);
    // 切换回Body标签
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 验证变量值保持
    const varInputAfter = contentPage.locator('.var-mode .el-input input');
    await expect(varInputAfter).toHaveValue('{{testBinaryVar}}');
  });

  // ========================= Binary模式状态保持测试 =========================
  // 测试用例10: Binary模式选择在切换tab后保持
  test('Binary模式选择在切换tab后保持', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    // clearCache() 已经导航到首页并刷新，无需再等待
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary模式保持测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到Body标签
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择binary类型
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择文件模式
    const binaryWrap = contentPage.locator('.binary-wrap');
    const fileModeRadio = binaryWrap.locator('.el-radio', { hasText: /文件模式/ });
    await fileModeRadio.click();
    await contentPage.waitForTimeout(300);
    // 验证文件模式可见
    const fileModeDiv = contentPage.locator('.file-mode');
    await expect(fileModeDiv).toBeVisible({ timeout: 5000 });
    // 切换到Query标签
    const queryTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await queryTab.click();
    await contentPage.waitForTimeout(300);
    // 切换回Body标签
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 验证文件模式仍然可见
    await expect(fileModeDiv).toB
  });

  // ========================= Binary与其他Body类型切换测试 =========================
  // 测试用例11: 从Binary切换到JSON类型后再切回Binary
  test('从Binary切换到JSON类型后再切回Binary', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    // clearCache() 已经导航到首页并刷新，无需再等待
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary切换测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到Body标签
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择binary类型
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    // 输入变量值
    const varInput = contentPage.locator('.var-mode .el-input input');
    await varInput.fill('{{myBinaryData}}');
    await contentPage.waitForTimeout(300);
    // 切换到JSON类型
    const jsonRadio = contentPage.locator('.body-params .el-radio', { hasText: /json/i }).first();
    await jsonRadio.click();
    await contentPage.waitForTimeout(300);
    // 验证binary-wrap隐藏
    const binaryWrap = contentPage.locator('.binary-wrap');
    await expect(binaryWrap).toBeHidden();
    // 切换回binary类型
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    // 验证binary-wrap重新显示
    await expect(binaryWrap).toBeVisible({ timeout: 5000 });
    // 验证之前输入的变量值仍然保持
    const varInputAfter = contentnput input');
    await expect(varInputAfter).toHaveValue('{{myBinaryData}}');
  });

  // ========================= Binary变量模式placeholder测试 =========================
  // 测试用例12: Binary变量模式输入框有正确的placeholder提示
  test('Binary变量模式输入框有正确的placeholder提示', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();

    await loginAccount();
    // clearCache() 已经导航到首页并刷新，无需再等待
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    await contentPage.waitForTimeout(500);
    // 创建HTTP节点
    const treeWrap = contentPage.locator('.tree-wrap');
    await treeWrap.click({ button: 'right', position: { x: 100, y: 200 } });
    await contentPage.waitForTimeout(300);
    const contextMenu = contentPage.locator('.s-contextmenu');
    const newInterfaceItem = contextMenu.locator('.s-contextmenu-item', { hasText: /新建接口/ });
    await newInterfaceItem.click();
    await contentPage.waitForTimeout(300);
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    const nameInput = addFileDialog.locator('input').first();
    await nameInput.fill('Binary placeholder测试');
    const confirmBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到Body标签
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    // 选择binary类型
    const binaryRadio = contentPage.locator('.body-params .el-radio', { hasText: /binary/i });
    await binaryRadio.click();
    await contentPage.waitForTimeout(300);
    // 选择变量模式
    const binaryWrap = contentPage.locator('.binary-wrap');
    const varModeRadio = binaryWrap.locator('.el-radio', { hasText: /变量模式/ });
    await varModeRadio.click();
    await contentPage.waitForTimeout(300);
    // 验证输入框placeholder包含变量格式提示
    const varInput = contentPage.locator('.var-mode .el-input input');
    const placeholder = await varInput.getAttribute('placeholder');
    expect(placeholder).toContain('{{');
    expect(placeholder).toContain('}}');
  });
});
