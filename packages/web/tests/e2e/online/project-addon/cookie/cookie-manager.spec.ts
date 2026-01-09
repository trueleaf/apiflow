import { test, expect } from '../../../../fixtures/electron-online.fixture';

test.describe('CookieManagement', () => {
  // 测试用例1: 打开Cookie管理页面,验证页面显示Cookie列表、搜索框、域名选择器和操作按钮
  test('打开Cookie管理页面,显示Cookie列表和操作按钮', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 点击更多按钮，打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    // 验证Cookie管理页面成功打开
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    const title = cookiePage.locator('.title');
    await expect(title).toContainText(/Cookies 管理/);
    // 验证页面显示搜索框、域名选择器和操作按钮
    const searchInput = cookiePage.locator('input[placeholder*="名称"]');
    await expect(searchInput).toBeVisible();
    const domainSelect = cookiePage.locator('.el-select');
    await expect(domainSelect).toBeVisible();
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await expect(addBtn).toBeVisible();
    const batchDeleteBtn = cookiePage.locator('.el-button--danger').filter({ hasText: /批量删除/ });
    await expect(batchDeleteBtn).toBeVisible();
  });
  // 测试用例2: 新增Cookie成功,Cookie显示在列表中
  test('新增Cookie成功,Cookie显示在列表中', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    // 点击新增Cookie按钮，打开新增弹窗
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    // 填写Cookie名称和值
    const nameInput = dialog.locator('.el-form-item').filter({ hasText: /名称/ }).locator('input');
    await nameInput.fill('testCookie');
    const valueInput = dialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
    await valueInput.fill('testValue123');
    // 保存Cookie并验证弹窗关闭
    const saveBtn = dialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
    // 验证新增的Cookie显示在列表中
    const cookieTable = cookiePage.locator('.el-table');
    await expect(cookieTable).toContainText('testCookie');
    await expect(cookieTable).toContainText('testValue123');
  });
  // 测试用例3: 编辑Cookie成功,Cookie值被更新
  test('编辑Cookie成功,Cookie值被更新', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    // 新增一个待编辑的Cookie
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    const nameInput = addDialog.locator('.el-form-item').filter({ hasText: /名称/ }).locator('input');
    await nameInput.fill('editableCookie');
    const valueInput = addDialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
    await valueInput.fill('originalValue');
    const saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 点击编辑按钮，打开编辑弹窗
    const editBtn = cookiePage.locator('.el-table .el-button').filter({ hasText: /编辑/ }).first();
    await editBtn.click();
    const editDialog = contentPage.locator('.el-dialog').filter({ hasText: /编辑 Cookie/ });
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    // 修改Cookie值并保存
    const editValueInput = editDialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
    await editValueInput.fill('updatedValue');
    const editSaveBtn = editDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await editSaveBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(editDialog).not.toBeVisible({ timeout: 5000 });
    // 验证Cookie值已更新
    const cookieTable = cookiePage.locator('.el-table');
    await expect(cookieTable).toContainText('updatedValue');
  });
  // 测试用例4: 删除Cookie成功,Cookie从列表中移除
  test('删除Cookie成功,Cookie从列表中移除', async ({ topBarPage, contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    // 新增一个待删除的Cookie
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    const nameInput = addDialog.locator('.el-form-item').filter({ hasText: /名称/ }).locator('input');
    await nameInput.fill('deletableCookie');
    const valueInput = addDialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
    await valueInput.fill('deleteMe');
    const saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证Cookie已添加到列表
    const cookieTable = cookiePage.locator('.el-table');
    await expect(cookieTable).toContainText('deletableCookie');
    // 点击删除按钮并确认
    const deleteBtn = cookiePage.locator('.el-table .el-button--danger').filter({ hasText: /删除/ }).first();
    await deleteBtn.click();
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    const confirmBtn = confirmDialog.locator('.el-button--primary');
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证Cookie已从列表中移除
    await expect(cookieTable).not.toContainText('deletableCookie');
  });
  // 测试用例5: 按名称搜索Cookie,列表只显示匹配的Cookie
  test('按名称搜索Cookie,列表显示匹配的Cookie', async ({ contentPage, clearCache, createProject, createNode, loginAccount }) => {
    // 清除缓存并登录
    await clearCache();
    await loginAccount();
    // 创建项目并进入工作台
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    // 新增第一个Cookie: searchCookie
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    let addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    let nameInput = addDialog.locator('.el-form-item').filter({ hasText: /名称/ }).locator('input');
    await nameInput.fill('searchCookie');
    let valueInput = addDialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
    await valueInput.fill('searchValue');
    let saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 新增第二个Cookie: otherCookie
    await addBtn.click();
    addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(addDialog).toBeVisible({ timeout: 5000 });
    nameInput = addDialog.locator('.el-form-item').filter({ hasText: /名称/ }).locator('input');
    await nameInput.fill('otherCookie');
    valueInput = addDialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
    await valueInput.fill('otherValue');
    saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证两个Cookie都显示在列表中
    const cookieTable = cookiePage.locator('.el-table');
    await expect(cookieTable).toContainText('searchCookie');
    await expect(cookieTable).toContainText('otherCookie');
    // 在搜索框中输入"search"进行搜索
    const searchInput = cookiePage.locator('input[placeholder*="名称"]');
    await searchInput.fill('search');
    await contentPage.waitForTimeout(300);
    // 验证只显示匹配的Cookie，不匹配的已隐藏
    await expect(cookieTable).toContainText('searchCookie');
    await expect(cookieTable).not.toContainText('otherCookie');
  });
  // 测试用例6: 按名称搜索Cookie的多种场景
  test('按名称搜索Cookie-精确搜索、模糊搜索、无结果、清空搜索', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    const cookieTable = cookiePage.locator('.el-table');
    // 新增3个测试Cookie
    const testCookies = [
      { name: 'search_test_1', value: 'value1' },
      { name: 'search_test_2', value: 'value2' },
      { name: 'other_name', value: 'value3' }
    ];
    for (const cookie of testCookies) {
      await addBtn.click();
      const addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
      await expect(addDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addDialog.locator('.el-form-item').filter({ hasText: /名称/ }).locator('input');
      await nameInput.fill(cookie.name);
      const valueInput = addDialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
      await valueInput.fill(cookie.value);
      const saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
      await saveBtn.click();
      await contentPage.waitForTimeout(500);
    }
    // 场景1: 精确搜索
    const searchInput = cookiePage.locator('input[placeholder*="名称"]');
    await searchInput.fill('search_test_1');
    await contentPage.waitForTimeout(300);
    await expect(cookieTable).toContainText('search_test_1');
    await expect(cookieTable).not.toContainText('search_test_2');
    await expect(cookieTable).not.toContainText('other_name');
    const rows1 = cookieTable.locator('.el-table__row');
    await expect(rows1).toHaveCount(1);
    // 场景2: 模糊搜索
    await searchInput.fill('search');
    await contentPage.waitForTimeout(300);
    await expect(cookieTable).toContainText('search_test_1');
    await expect(cookieTable).toContainText('search_test_2');
    await expect(cookieTable).not.toContainText('other_name');
    const rows2 = cookieTable.locator('.el-table__row');
    await expect(rows2).toHaveCount(2);
    // 场景3: 搜索无结果
    await searchInput.fill('nonexistent');
    await contentPage.waitForTimeout(300);
    const emptyText = cookieTable.locator('.el-table__empty-text');
    await expect(emptyText).toBeVisible();
    // 场景4: 清空搜索
    await searchInput.clear();
    await contentPage.waitForTimeout(300);
    const rows4 = cookieTable.locator('.el-table__row');
    await expect(rows4).toHaveCount(3);
  });
  // 测试用例7: 按域名筛选Cookie的多种场景
  test('按域名筛选Cookie-特定域名、万能域名、清空筛选、组合筛选', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    const cookieTable = cookiePage.locator('.el-table');
    // 新增3个不同域名的Cookie
    const testCookies = [
      { name: 'universal_cookie', value: 'value1', domain: '' },
      { name: 'domain_127_cookie', value: 'value2', domain: '127.0.0.1' },
      { name: 'domain_localhost_cookie', value: 'value3', domain: 'localhost' }
    ];
    for (const cookie of testCookies) {
      await addBtn.click();
      const addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
      await expect(addDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addDialog.locator('.el-form-item').filter({ hasText: /名称/ }).locator('input');
      await nameInput.fill(cookie.name);
      const valueInput = addDialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
      await valueInput.fill(cookie.value);
      if (cookie.domain) {
        const domainInput = addDialog.locator('.el-form-item').filter({ hasText: /域名/ }).locator('input');
        await domainInput.fill(cookie.domain);
      }
      const saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
      await saveBtn.click();
      await contentPage.waitForTimeout(500);
    }
    // 场景1: 筛选特定域名
    const domainSelect = cookiePage.locator('.el-select');
    await domainSelect.click();
    await contentPage.waitForTimeout(300);
    const option127 = contentPage.locator('.el-select-dropdown__item').filter({ hasText: '127.0.0.1' });
    await option127.click();
    await contentPage.waitForTimeout(300);
    await expect(cookieTable).toContainText('domain_127_cookie');
    await expect(cookieTable).not.toContainText('universal_cookie');
    await expect(cookieTable).not.toContainText('domain_localhost_cookie');
    const rows1 = cookieTable.locator('.el-table__row');
    await expect(rows1).toHaveCount(1);
    // 场景2: 筛选万能域名
    await domainSelect.click();
    await contentPage.waitForTimeout(300);
    const optionUniversal = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /万能域名/ });
    await optionUniversal.click();
    await contentPage.waitForTimeout(300);
    await expect(cookieTable).toContainText('universal_cookie');
    await expect(cookieTable).not.toContainText('domain_127_cookie');
    await expect(cookieTable).not.toContainText('domain_localhost_cookie');
    const rows2 = cookieTable.locator('.el-table__row');
    await expect(rows2).toHaveCount(1);
    // 场景3: 清空筛选
    const clearBtn = domainSelect.locator('.el-select__clear');
    await clearBtn.click();
    await contentPage.waitForTimeout(300);
    const rows3 = cookieTable.locator('.el-table__row');
    await expect(rows3).toHaveCount(3);
    // 场景4: 组合筛选(域名+名称搜索)
    await domainSelect.click();
    await contentPage.waitForTimeout(300);
    const option127Again = contentPage.locator('.el-select-dropdown__item').filter({ hasText: '127.0.0.1' });
    await option127Again.click();
    await contentPage.waitForTimeout(300);
    const searchInput = cookiePage.locator('input[placeholder*="名称"]');
    await searchInput.fill('domain_127');
    await contentPage.waitForTimeout(300);
    await expect(cookieTable).toContainText('domain_127_cookie');
    const rows4 = cookieTable.locator('.el-table__row');
    await expect(rows4).toHaveCount(1);
    // 修改搜索关键词，应该无结果
    await searchInput.fill('universal');
    await contentPage.waitForTimeout(300);
    const emptyText = cookieTable.locator('.el-table__empty-text');
    await expect(emptyText).toBeVisible();
  });
  // 测试用例8: 批量删除Cookie
  test('批量删除Cookie-选中多个删除', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    const cookieTable = cookiePage.locator('.el-table');
    // 新增3个测试Cookie
    const testCookies = [
      { name: 'batch_delete_1', value: 'value1' },
      { name: 'batch_delete_2', value: 'value2' },
      { name: 'keep_cookie', value: 'value3' }
    ];
    for (const cookie of testCookies) {
      await addBtn.click();
      const addDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
      await expect(addDialog).toBeVisible({ timeout: 5000 });
      const nameInput = addDialog.locator('.el-form-item').filter({ hasText: /名称/ }).locator('input');
      await nameInput.fill(cookie.name);
      const valueInput = addDialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
      await valueInput.fill(cookie.value);
      const saveBtn = addDialog.locator('.el-button--primary').filter({ hasText: /保存/ });
      await saveBtn.click();
      await contentPage.waitForTimeout(500);
    }
    // 验证批量删除按钮初始为禁用状态
    const batchDeleteBtn = cookiePage.locator('.el-button--danger').filter({ hasText: /批量删除/ });
    await expect(batchDeleteBtn).toBeDisabled();
    // 勾选前2个Cookie
    const checkboxes = cookieTable.locator('.el-checkbox__input');
    await checkboxes.nth(1).click();
    await checkboxes.nth(2).click();
    await contentPage.waitForTimeout(300);
    // 验证批量删除按钮变为可用状态
    await expect(batchDeleteBtn).toBeEnabled();
    // 点击批量删除按钮
    await batchDeleteBtn.click();
    // 验证确认弹窗显示
    const confirmDialog = contentPage.locator('.cl-confirm-container');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    await expect(confirmDialog).toContainText('2');
    // 点击确认删除
    const confirmBtn = confirmDialog.locator('.el-button--primary');
    await confirmBtn.click();
    await contentPage.waitForTimeout(500);
    // 验证被删除的Cookie不再显示
    await expect(cookieTable).not.toContainText('batch_delete_1');
    await expect(cookieTable).not.toContainText('batch_delete_2');
    // 验证未选中的Cookie仍然存在
    await expect(cookieTable).toContainText('keep_cookie');
    const rows = cookieTable.locator('.el-table__row');
    await expect(rows).toHaveCount(1);
    // 验证所有checkbox恢复未选中状态
    const selectedCheckboxes = cookieTable.locator('.el-checkbox__input.is-checked');
    await expect(selectedCheckboxes).toHaveCount(0);
  });
  // 测试用例9: 新增Cookie表单验证-名称为空
  test('新增Cookie表单验证-名称为空时不允许保存', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    // 打开新增弹窗
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    // 只填写value字段
    const valueInput = dialog.locator('.el-form-item').filter({ hasText: /值/ }).locator('textarea');
    await valueInput.fill('testValue');
    // 点击保存按钮
    const saveBtn = dialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证表单验证错误提示显示
    const errorMsg = dialog.locator('.el-form-item__error').filter({ hasText: /请输入名称/ });
    await expect(errorMsg).toBeVisible();
    // 验证弹窗未关闭
    await expect(dialog).toBeVisible();
  });
  // 测试用例10: 新增Cookie表单验证-值为空
  test('新增Cookie表单验证-值为空时不允许保存', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    // 打开新增弹窗
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    // 只填写name字段
    const nameInput = dialog.locator('.el-form-item').filter({ hasText: /名称/ }).locator('input');
    await nameInput.fill('testName');
    // 点击保存按钮
    const saveBtn = dialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(300);
    // 验证表单验证错误提示显示
    const errorMsg = dialog.locator('.el-form-item__error').filter({ hasText: /请输入值/ });
    await expect(errorMsg).toBeVisible();
    // 验证弹窗未关闭
    await expect(dialog).toBeVisible();
  });
  // 测试用例11: 新增Cookie-填写所有属性并验证列表展示
  test('新增Cookie-填写所有属性验证列表完整展示', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    // 打开新增弹窗
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    // 填写所有字段
    const nameInput = dialog.locator('.el-form-item').filter({ hasText: /^名称/ }).locator('input');
    await nameInput.fill('test_all_attrs');
    const valueInput = dialog.locator('.el-form-item').filter({ hasText: /^值/ }).locator('textarea');
    await valueInput.fill('全属性测试Value');
    const domainInput = dialog.locator('.el-form-item').filter({ hasText: /^域名/ }).locator('input');
    await domainInput.fill('127.0.0.1');
    const pathInput = dialog.locator('.el-form-item').filter({ hasText: /^路径/ }).locator('input');
    await pathInput.fill('/echo');
    // 设置过期时间为明天
    const datePicker = dialog.locator('.el-date-picker');
    await datePicker.click();
    await contentPage.waitForTimeout(300);
    const tomorrowBtn = contentPage.locator('.el-picker-panel__shortcut').filter({ hasText: /24小时后/ });
    await tomorrowBtn.click();
    await contentPage.waitForTimeout(300);
    // 开启HttpOnly和Secure开关
    const httpOnlySwitch = dialog.locator('.el-form-item').filter({ hasText: /^HttpOnly/ }).locator('.el-switch');
    await httpOnlySwitch.click();
    const secureSwitch = dialog.locator('.el-form-item').filter({ hasText: /^Secure/ }).locator('.el-switch');
    await secureSwitch.click();
    // 选择SameSite为Strict
    const sameSiteSelect = dialog.locator('.el-form-item').filter({ hasText: /^SameSite/ }).locator('.el-select');
    await sameSiteSelect.click();
    await contentPage.waitForTimeout(300);
    const strictOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'Strict' });
    await strictOption.click();
    // 保存并验证弹窗关闭
    const saveBtn = dialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
    // 在表格中查找该Cookie行并验证各列显示
    const cookieTable = cookiePage.locator('.el-table');
    await expect(cookieTable).toContainText('test_all_attrs');
    await expect(cookieTable).toContainText('全属性测试Value');
    await expect(cookieTable).toContainText('127.0.0.1');
    await expect(cookieTable).toContainText('/echo');
    // 验证Expires列不是Session
    const targetRow = cookieTable.locator('.el-table__row').filter({ hasText: 'test_all_attrs' });
    const expiresCell = targetRow.locator('td').nth(5);
    await expect(expiresCell).not.toContainText('Session');
    // 验证HttpOnly列显示✔
    const httpOnlyCell = targetRow.locator('td').nth(6);
    await expect(httpOnlyCell).toContainText('✔');
    // 验证Secure列显示✔
    const secureCell = targetRow.locator('td').nth(7);
    await expect(secureCell).toContainText('✔');
    // 验证SameSite列显示Strict
    const sameSiteCell = targetRow.locator('td').nth(8);
    await expect(sameSiteCell).toContainText('Strict');
    // 验证Size列显示数字
    const sizeCell = targetRow.locator('td').nth(9);
    const sizeText = await sizeCell.textContent();
    const sizeValue = parseInt(sizeText || '0');
    expect(sizeValue).toBeGreaterThan(0);
  });
  // 测试用例12: 新增Cookie-仅填写必填项验证默认值
  test('新增Cookie-仅填写必填项验证默认值展示', async ({ contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开Cookie管理页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const cookieItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /Cookie管理|Cookies/ });
    await cookieItem.click();
    await contentPage.waitForTimeout(500);
    const cookiePage = contentPage.locator('.cookies-page');
    await expect(cookiePage).toBeVisible({ timeout: 5000 });
    // 打开新增弹窗
    const addBtn = cookiePage.locator('.el-button--primary').filter({ hasText: /新增 Cookie/ });
    await addBtn.click();
    const dialog = contentPage.locator('.el-dialog').filter({ hasText: /新增 Cookie/ });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    // 只填写name和value
    const nameInput = dialog.locator('.el-form-item').filter({ hasText: /^名称/ }).locator('input');
    await nameInput.fill('test_minimal');
    const valueInput = dialog.locator('.el-form-item').filter({ hasText: /^值/ }).locator('textarea');
    await valueInput.fill('最小测试');
    // 保存
    const saveBtn = dialog.locator('.el-button--primary').filter({ hasText: /保存/ });
    await saveBtn.click();
    await contentPage.waitForTimeout(500);
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
    // 验证表格显示
    const cookieTable = cookiePage.locator('.el-table');
    const targetRow = cookieTable.locator('.el-table__row').filter({ hasText: 'test_minimal' });
    // 验证Domain列显示"所有域名生效"
    const domainCell = targetRow.locator('td').nth(3);
    await expect(domainCell).toContainText(/所有域名生效/);
    // 验证Path列显示/
    const pathCell = targetRow.locator('td').nth(4);
    await expect(pathCell).toContainText('/');
    // 验证Expires列显示Session
    const expiresCell = targetRow.locator('td').nth(5);
    await expect(expiresCell).toContainText('Session');
    // 验证HttpOnly列不显示✔
    const httpOnlyCell = targetRow.locator('td').nth(6);
    const httpOnlyText = await httpOnlyCell.textContent();
    expect(httpOnlyText?.trim()).not.toBe('✔');
    // 验证Secure列不显示✔
    const secureCell = targetRow.locator('td').nth(7);
    const secureText = await secureCell.textContent();
    expect(secureText?.trim()).not.toBe('✔');
    // 验证SameSite列显示Lax(默认值)
    const sameSiteCell = targetRow.locator('td').nth(8);
    await expect(sameSiteCell).toContainText('Lax');
  });
});


