import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('QueryParamsRedo', () => {
  // 测试用例1: query参数key输入值后撤销,再重做,值恢复到撤销前的状态
  test('query参数key输入值后撤销再重做,值恢复到撤销前的状态', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
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
    // 点击Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 在query参数key输入框中输入page
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    await keyInputs.first().fill('page');
    await contentPage.waitForTimeout(300);
    // 验证key值为page
    await expect(keyInputs.first()).toHaveValue('page', { timeout: 5000 });
    // 点击撤销按钮
    const undoBtn = contentPage.locator('[data-testid="undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证撤销后query参数key为空
    await expect(keyInputs.first()).toHaveValue('', { timeout: 5000 });
    // 点击重做按钮
    const redoBtn = contentPage.locator('[data-testid="redo-btn"]');
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证重做后query参数key值恢复为page
    await expect(keyInputs.first()).toHaveValue('page', { timeout: 5000 });
  });
  // 测试用例2: query参数拖拽后撤销,再重做,顺序恢复到撤销前的状态
  test('query参数拖拽后撤销再重做,顺序恢复到撤销前的状态', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
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
    // 点击Params标签页
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    // 添加两个query参数: page和size
    const keyInputs = contentPage.locator('[data-testid="params-tree-key-input"]');
    await keyInputs.first().fill('page');
    await contentPage.waitForTimeout(300);
    await keyInputs.nth(1).fill('size');
    await contentPage.waitForTimeout(300);
    // 验证初始顺序为page,size
    await expect(keyInputs.first()).toHaveValue('page', { timeout: 5000 });
    await expect(keyInputs.nth(1)).toHaveValue('size', { timeout: 5000 });
    // 拖拽第一个参数到第二个位置
    const paramRows = contentPage.locator('.params-tree-row');
    const firstRow = paramRows.first();
    const secondRow = paramRows.nth(1);
    const firstBox = await firstRow.boundingBox();
    const secondBox = await secondRow.boundingBox();
    if (firstBox && secondBox) {
      await contentPage.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
      await contentPage.mouse.down();
      await contentPage.waitForTimeout(100);
      await contentPage.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2, { steps: 10 });
      await contentPage.waitForTimeout(100);
      await contentPage.mouse.up();
    }
    await contentPage.waitForTimeout(500);
    // 点击撤销按钮恢复顺序
    const undoBtn = contentPage.locator('[data-testid="undo-btn"]');
    await undoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证撤销后顺序恢复为page,size
    await expect(keyInputs.first()).toHaveValue('page', { timeout: 5000 });
    // 点击重做按钮
    const redoBtn = contentPage.locator('[data-testid="redo-btn"]');
    await redoBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证重做后顺序恢复为拖拽后的状态
    await expect(keyInputs.first()).toHaveValue('size', { timeout: 5000 });
  });
});
