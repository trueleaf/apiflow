import { test, expect } from '../../../../../fixtures/electron.fixture';

test.describe('ResponseParams', () => {
  // 测试用例1: 返回参数可以新增,可以删除(但是必须保留一个),可以修改名称,可以修改状态码,可以数据类型
  test('返回参数可以新增、删除、修改名称、状态码和数据类型', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('返回参数CRUD测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到返回参数标签页
    const responseTab = contentPage.locator('[data-testid="http-params-tab-response"]');
    await responseTab.click();
    await contentPage.waitForTimeout(300);
    // 验证返回参数区域可见
    const responseParams = contentPage.locator('.response-params');
    await expect(responseParams).toBeVisible({ timeout: 5000 });
    // 验证默认有一个返回参数
    const initialCards = responseParams.locator('.response-collapse-card');
    await expect(initialCards).toHaveCount(1, { timeout: 5000 });
    // 点击新增按钮添加新的返回参数
    const addBtn = responseParams.locator('.action-icon').filter({ has: contentPage.locator('svg') }).first();
    await addBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证新增成功，现在有2个返回参数
    await expect(initialCards).toHaveCount(2, { timeout: 5000 });
    // 修改第二个参数的名称
    const secondCard = responseParams.locator('.response-collapse-card').nth(1);
    const editIcon = secondCard.locator('.edit-icon').first();
    await editIcon.click();
    await contentPage.waitForTimeout(200);
    const editInput = secondCard.locator('.edit-input');
    await editInput.fill('自定义返回参数');
    const confirmBtn = secondCard.locator('span').filter({ hasText: /确定|Confirm/ }).first();
    await confirmBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证名称修改成功
    await expect(secondCard).toContainText('自定义返回参数', { timeout: 5000 });
    // 删除第二个返回参数
    const deleteBtn = secondCard.locator('.delete');
    await deleteBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证删除成功，现在只有1个返回参数
    await expect(initialCards).toHaveCount(1, { timeout: 5000 });
    // 尝试删除最后一个参数，验证不能删除（删除按钮不可见）
    const lastCard = responseParams.locator('.response-collapse-card').first();
    const lastDeleteBtn = lastCard.locator('.delete');
    await expect(lastDeleteBtn).toBeHidden({ timeout: 5000 });
  });
  // 测试用例2: 允许选择常见响应码,也允许用户自定义100~999的响应码,不同大小响应码颜色不同
  test('状态码选择和颜色显示正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('状态码测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到返回参数标签页
    const responseTab = contentPage.locator('[data-testid="http-params-tab-response"]');
    await responseTab.click();
    await contentPage.waitForTimeout(300);
    // 点击状态码输入框，弹出常见响应码列表
    const responseParams = contentPage.locator('.response-params');
    const statusCodeArea = responseParams.locator('.status-code').first();
    await statusCodeArea.click();
    await contentPage.waitForTimeout(300);
    // 验证弹出状态码选择器
    const statusPopover = contentPage.locator('.el-popover').filter({ hasText: /200|404|500/ });
    await expect(statusPopover).toBeVisible({ timeout: 5000 });
    // 选择404状态码
    const status404 = statusPopover.locator('text=404').first();
    await status404.click();
    await contentPage.waitForTimeout(300);
    // 验证状态码已更新为404，且显示为红色（4xx错误）
    const statusCodeSpan = statusCodeArea.locator('.red');
    await expect(statusCodeSpan).toContainText('404', { timeout: 5000 });
    // 再次点击状态码，选择200
    await statusCodeArea.click();
    await contentPage.waitForTimeout(300);
    const status200 = contentPage.locator('.el-popover').filter({ hasText: /200/ }).locator('text=200').first();
    await status200.click();
    await contentPage.waitForTimeout(300);
    // 验证状态码已更新为200，且显示为绿色（2xx成功）
    const statusCodeGreen = statusCodeArea.locator('.green');
    await expect(statusCodeGreen).toContainText('200', { timeout: 5000 });
  });
  // 测试用例3: 允许选择常见响应类型,也允许用户自定义响应类型,不同响应类型对应不同输入框
  test('响应类型选择和对应输入框显示正确', async ({ contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*#\/v1\/apidoc\/doc-edit.*/, { timeout: 5000 });
    // 新增HTTP节点
    const addFileBtn = contentPage.locator('.pin-wrap .item').filter({ hasText: /新增文件|Add File/ }).first();
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    const fileNameInput = addFileDialog.locator('input').first();
    await fileNameInput.fill('响应类型测试接口');
    const confirmAddBtn = addFileDialog.locator('.el-button--primary').last();
    await confirmAddBtn.click();
    await contentPage.waitForTimeout(500);
    // 切换到返回参数标签页
    const responseTab = contentPage.locator('[data-testid="http-params-tab-response"]');
    await responseTab.click();
    await contentPage.waitForTimeout(300);
    // 点击数据类型下拉框
    const responseParams = contentPage.locator('.response-params');
    const contentTypeArea = responseParams.locator('.content-type').first();
    await contentTypeArea.click();
    await contentPage.waitForTimeout(300);
    // 验证弹出类型选择器，包含常见类型
    const mimePopover = contentPage.locator('.el-popover').filter({ hasText: /JSON|HTML|XML|Text/ });
    await expect(mimePopover).toBeVisible({ timeout: 5000 });
    // 选择JSON类型
    const jsonOption = mimePopover.locator('text=application/json').first();
    await jsonOption.click();
    await contentPage.waitForTimeout(300);
    // 验证JSON编辑器显示
    const jsonEditor = responseParams.locator('.editor-wrap').first();
    await expect(jsonEditor).toBeVisible({ timeout: 5000 });
    // 在JSON编辑器中输入内容
    const editorContent = jsonEditor.locator('.monaco-editor, .view-lines').first();
    await editorContent.click();
    await contentPage.keyboard.type('{"message": "test"}');
    await contentPage.waitForTimeout(300);
    // 再次点击数据类型，选择HTML类型
    await contentTypeArea.click();
    await contentPage.waitForTimeout(300);
    const htmlOption = contentPage.locator('.el-popover').filter({ hasText: /HTML/ }).locator('text=text/html').first();
    await htmlOption.click();
    await contentPage.waitForTimeout(300);
    // 验证类型已更新
    await expect(contentTypeArea).toContainText('text/html', { timeout: 5000 });
  });
});
