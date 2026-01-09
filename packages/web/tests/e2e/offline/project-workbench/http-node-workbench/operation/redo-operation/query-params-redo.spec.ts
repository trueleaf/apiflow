import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('QueryParamsRedo', () => {
  // 测试用例1: query参数key输入值后撤销,再重做,值恢复到撤销前的状态
  test('query参数key输入值后撤销再重做,值恢复到撤销前的状态', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Query参数重做测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 确保选中当前HTTP节点（用于记录撤销/重做）
    const navTab = contentPage.locator('.nav .item').filter({ hasText: 'Query参数重做测试' }).first();
    await navTab.click();
    await expect(navTab).toHaveClass(/active/, { timeout: 5000 });
    // 点击Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 在query参数key输入框中输入page
    const queryTree = contentPage.locator('.cl-params-tree').first();
    const keyInputs = queryTree.locator('[data-testid="params-tree-key-input"]');
    await keyInputs.first().click();
    await keyInputs.first().fill('page');
    await contentPage.waitForTimeout(200);
    // 验证key值为page
    await expect(keyInputs.first()).toHaveValue('page', { timeout: 5000 });
    // 点击撤销按钮
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]').first();
    await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
    for (let i = 0; i < 5; i += 1) {
      const currentValue = await keyInputs.first().inputValue();
      if (!currentValue) break;
      await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
      await undoBtn.click();
      await contentPage.waitForTimeout(200);
    }
    // 验证撤销后query参数key为空
    await expect(keyInputs.first()).toHaveValue('', { timeout: 10000 });
    // 点击重做按钮
    const redoBtn = contentPage.locator('[data-testid="http-params-redo-btn"]').first();
    await expect(redoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
    for (let i = 0; i < 5; i += 1) {
      const currentValue = await keyInputs.first().inputValue();
      if (currentValue === 'page') break;
      await expect(redoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
      await redoBtn.click();
      await contentPage.waitForTimeout(200);
    }
    // 验证重做后query参数key值恢复为page
    await expect(keyInputs.first()).toHaveValue('page', { timeout: 5000 });
  });
  // 测试用例2: query参数拖拽后撤销,再重做,顺序恢复到撤销前的状态
  test('query参数拖拽后撤销再重做,顺序恢复到撤销前的状态', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('[data-testid="banner-add-http-btn"]');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('Query参数拖拽重做测试');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 确保选中当前HTTP节点（用于记录撤销/重做）
    const navTab = contentPage.locator('.nav .item').filter({ hasText: 'Query参数拖拽重做测试' }).first();
    await navTab.click();
    await expect(navTab).toHaveClass(/active/, { timeout: 5000 });
    // 点击Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 添加两个query参数: page和size
    const queryTree = contentPage.locator('.cl-params-tree').first();
    const keyInputs = queryTree.locator('[data-testid="params-tree-key-input"]');
    await keyInputs.first().click();
    await keyInputs.first().fill('page');
    await contentPage.waitForTimeout(200);
    await expect(keyInputs.nth(1)).toBeVisible({ timeout: 5000 });
    await keyInputs.nth(1).click();
    await keyInputs.nth(1).fill('size');
    await contentPage.waitForTimeout(200);
    // 验证初始顺序为page,size
    await expect(keyInputs.first()).toHaveValue('page', { timeout: 5000 });
    await expect(keyInputs.nth(1)).toHaveValue('size', { timeout: 5000 });
    // 拖拽第一个参数到第二个位置
    const nodeContents = queryTree.locator('.el-tree-node__content');
    await expect(nodeContents.nth(1)).toBeVisible({ timeout: 5000 });
    await nodeContents.first().dragTo(nodeContents.nth(1), {
      sourcePosition: { x: 2, y: 10 },
      targetPosition: { x: 2, y: 10 },
    });
    await contentPage.waitForTimeout(500);
    // 验证拖拽后顺序已变化
    await expect(keyInputs.first()).toHaveValue('size', { timeout: 5000 });
    // 点击撤销按钮恢复顺序
    const undoBtn = contentPage.locator('[data-testid="http-params-undo-btn"]').first();
    await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
    for (let i = 0; i < 5; i += 1) {
      const firstValue = await keyInputs.first().inputValue();
      if (firstValue === 'page') break;
      await expect(undoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
      await undoBtn.click();
      await contentPage.waitForTimeout(200);
    }
    // 验证撤销后顺序恢复为page,size
    await expect(keyInputs.first()).toHaveValue('page', { timeout: 5000 });
    // 点击重做
    const redoBtn = contentPage.locator('[data-testid="http-params-redo-btn"]').first();
    await expect(redoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
    for (let i = 0; i < 5; i += 1) {
      const firstValue = await keyInputs.first().inputValue();
      if (firstValue === 'size') break;
      await expect(redoBtn).not.toHaveClass(/disabled/, { timeout: 5000 });
      await redoBtn.click();
      await contentPage.waitForTimeout(200);
    }
    // 验证重做后顺序恢复为拖拽后的状态
    await expect(keyInputs.first()).toHaveValue('size', { timeout: 5000 });
  });
});


