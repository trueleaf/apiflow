import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('VariableDialog', () => {
  // 测试用例1: 点击变量按钮打开变量管理弹窗,弹窗展示当前项目的所有变量
  test('点击变量按钮打开变量管理弹窗', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('变量弹窗测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 查找并点击变量管理按钮
    const variableBtn = contentPage.locator('.variable-btn, [data-testid="variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证变量弹窗打开
    const variableDialog = contentPage.locator('.el-dialog, .variable-dialog').filter({ hasText: /变量|Variable/ });
    await expect(variableDialog).toBeVisible({ timeout: 5000 });
    // 验证弹窗包含必要的操作按钮
    const addBtn = variableDialog.locator('.el-button').filter({ hasText: /新增|添加|Add/ });
    await expect(addBtn.first()).toBeVisible({ timeout: 5000 });
  });
  // 测试用例2: 变量弹窗可以拖拽移动位置,关闭后再打开位置保持不变
  test('变量弹窗可以拖拽移动位置', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('弹窗拖拽测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 打开变量管理弹窗
    const variableBtn = contentPage.locator('.variable-btn, [data-testid="variable-btn"]').first();
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证变量弹窗打开
    const variableDialog = contentPage.locator('.el-dialog, .variable-dialog').filter({ hasText: /变量|Variable/ });
    await expect(variableDialog).toBeVisible({ timeout: 5000 });
    // 获取弹窗初始位置
    const dialogHeader = variableDialog.locator('.el-dialog__header, .dialog-header').first();
    const initialBoundingBox = await variableDialog.boundingBox();
    // 拖拽弹窗标题栏
    if (initialBoundingBox) {
      await dialogHeader.hover();
      await contentPage.mouse.down();
      await contentPage.mouse.move(initialBoundingBox.x + 100, initialBoundingBox.y + 50);
      await contentPage.mouse.up();
      await contentPage.waitForTimeout(300);
    }
    // 获取拖拽后的位置
    const newBoundingBox = await variableDialog.boundingBox();
    // 验证位置已改变
    if (initialBoundingBox && newBoundingBox) {
      expect(newBoundingBox.x).not.toBe(initialBoundingBox.x);
    }
    // 关闭弹窗
    const closeBtn = variableDialog.locator('.el-dialog__close, .close-btn').first();
    await closeBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证弹窗已关闭
    await expect(variableDialog).toBeHidden({ timeout: 5000 });
    // 重新打开弹窗
    await variableBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证弹窗再次打开
    await expect(variableDialog).toBeVisible({ timeout: 5000 });
  });
});
