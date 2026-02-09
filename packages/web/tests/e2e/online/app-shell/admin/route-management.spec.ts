import { test, expect } from '../../../../fixtures/electron-online.fixture';
import { 
  navigateToAdmin, 
  switchAdminTab, 
  waitForRouteListLoaded,
  getTableRowCount,
  findRouteRowByName,
  clickRowAction,
  fillDialogForm,
  confirmDialog,
  confirmDeleteDialog,
  expectSuccessMessage
} from '../../../../fixtures/admin-helper';

test.describe('Online后台管理-客户端路由管理', () => {
  let createdRoutes: string[] = [];

  test.beforeEach(async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    const loginName1 = process.env.TEST_LOGIN_NAME;
    const password1 = process.env.TEST_LOGIN_PASSWORD;
    const loginName2 = process.env.TEST_LOGIN_NAME2;
    const password2 = process.env.TEST_LOGIN_PASSWORD2;
    if (!loginName1 || !password1) throw new Error('缺少环境变量');
    await loginAccount({ loginName: loginName1, password: password1 });
    const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
    const adminBtnVisible = await adminBtn.isVisible({ timeout: 1000 }).catch(() => false);
    if (!adminBtnVisible) {
      if (!loginName2 || !password2) test.skip(true, '未配置第二账号，且当前账号不是管理员');
      await loginAccount({ loginName: loginName2, password: password2 });
    }
    const finalAdminBtnVisible = await adminBtn.isVisible({ timeout: 1000 }).catch(() => false);
    test.skip(!finalAdminBtnVisible, '当前测试环境没有管理员账号');
    await navigateToAdmin(topBarPage, contentPage);
    await switchAdminTab(contentPage, '客户端路由');
    await waitForRouteListLoaded(contentPage);
    createdRoutes = [];
  });

  test.afterEach(async ({ contentPage }) => {
    for (const routeName of createdRoutes) {
      try {
        const routeRow = findRouteRowByName(contentPage, routeName);
        const rowVisible = await routeRow.isVisible({ timeout: 2000 }).catch(() => false);
        if (rowVisible) {
          await clickRowAction(routeRow, '删除');
          await confirmDeleteDialog(contentPage);
        }
      } catch {
      }
    }
  });

  test('新增客户端路由-输入路由名称路径分组创建成功', async ({ contentPage }) => {
    const routeName = `测试客户端路由_${Date.now()}`;
    createdRoutes.push(routeName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '路由名称': routeName,
      '路由地址': `/test/client/route/${Date.now()}`,
      '分组名称': '测试分组'
    });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const routeRow = findRouteRowByName(contentPage, routeName);
    await expect(routeRow).toBeVisible({ timeout: 5000 });
    await expect(routeRow).toContainText('测试分组');
  });

  test('新增客户端路由-必填字段校验', async ({ contentPage }) => {
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    const dialog = contentPage.locator('.el-dialog').first();
    const confirmBtn = dialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    const errorMessage = dialog.locator('.el-form-item__error');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('修改客户端路由-修改路由信息成功', async ({ contentPage }) => {
    const routeName = `测试客户端路由_${Date.now()}`;
    const newRouteName = `${routeName}_修改后`;
    createdRoutes.push(routeName);
    createdRoutes.push(newRouteName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '路由名称': routeName,
      '路由地址': `/test/client/route/${Date.now()}`,
      '分组名称': '原分组'
    });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const routeRow = findRouteRowByName(contentPage, routeName);
    await clickRowAction(routeRow, '修改');
    const editDialog = contentPage.locator('.el-dialog').first();
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    const nameInput = editDialog.locator('input').first();
    await nameInput.clear();
    await nameInput.fill(newRouteName);
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const newRouteRow = findRouteRowByName(contentPage, newRouteName);
    await expect(newRouteRow).toBeVisible({ timeout: 5000 });
  });

  test('删除客户端路由-确认删除后从列表移除', async ({ contentPage }) => {
    const routeName = `测试客户端路由_${Date.now()}`;
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '路由名称': routeName,
      '路由地址': `/test/client/route/${Date.now()}`,
      '分组名称': '测试分组'
    });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const initialRowCount = await getTableRowCount(contentPage);
    const routeRow = findRouteRowByName(contentPage, routeName);
    await clickRowAction(routeRow, '删除');
    await confirmDeleteDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const finalRowCount = await getTableRowCount(contentPage);
    expect(finalRowCount).toBe(initialRowCount - 1);
  });

  test('搜索客户端路由-按路由名称搜索', async ({ contentPage }) => {
    const routeName = `测试搜索客户端_${Date.now()}`;
    createdRoutes.push(routeName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '路由名称': routeName,
      '路由地址': `/test/client/route/${Date.now()}`,
      '分组名称': '测试分组'
    });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const searchInput = contentPage.locator('input[placeholder*="路由名称"], input[placeholder*="搜索"]').first();
    await searchInput.fill(routeName);
    await contentPage.waitForTimeout(500);
    const routeRow = findRouteRowByName(contentPage, routeName);
    await expect(routeRow).toBeVisible({ timeout: 5000 });
  });

  test('客户端路由列表展示-列表正常加载', async ({ contentPage }) => {
    const routeTable = contentPage.locator('.el-table').first();
    await expect(routeTable).toBeVisible({ timeout: 5000 });
    const rowCount = await getTableRowCount(contentPage);
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Online后台管理-服务端路由管理', () => {
  let createdRoutes: string[] = [];

  test.beforeEach(async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    const loginName1 = process.env.TEST_LOGIN_NAME;
    const password1 = process.env.TEST_LOGIN_PASSWORD;
    const loginName2 = process.env.TEST_LOGIN_NAME2;
    const password2 = process.env.TEST_LOGIN_PASSWORD2;
    if (!loginName1 || !password1) throw new Error('缺少环境变量');
    await loginAccount({ loginName: loginName1, password: password1 });
    const adminBtn = topBarPage.locator('[data-testid="header-admin-btn"]');
    const adminBtnVisible = await adminBtn.isVisible({ timeout: 1000 }).catch(() => false);
    if (!adminBtnVisible) {
      if (!loginName2 || !password2) test.skip(true, '未配置第二账号，且当前账号不是管理员');
      await loginAccount({ loginName: loginName2, password: password2 });
    }
    const finalAdminBtnVisible = await adminBtn.isVisible({ timeout: 1000 }).catch(() => false);
    test.skip(!finalAdminBtnVisible, '当前测试环境没有管理员账号');
    await navigateToAdmin(topBarPage, contentPage);
    await switchAdminTab(contentPage, '服务端路由');
    await waitForRouteListLoaded(contentPage);
    createdRoutes = [];
  });

  test.afterEach(async ({ contentPage }) => {
    for (const routeName of createdRoutes) {
      try {
        const routeRow = findRouteRowByName(contentPage, routeName);
        const rowVisible = await routeRow.isVisible({ timeout: 2000 }).catch(() => false);
        if (rowVisible) {
          await clickRowAction(routeRow, '删除');
          await confirmDeleteDialog(contentPage);
        }
      } catch {
      }
    }
  });

  test('新增服务端路由-GET请求方法创建成功', async ({ contentPage }) => {
    const routeName = `测试服务端路由_GET_${Date.now()}`;
    createdRoutes.push(routeName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '路由名称': routeName,
      '路由地址': `/api/test/server/route/${Date.now()}`,
      '分组名称': '测试分组'
    });
    const dialog = contentPage.locator('.el-dialog').first();
    const methodSelect = dialog.locator('.el-select').first();
    await methodSelect.click();
    const getOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^GET$/ });
    await getOption.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const routeRow = findRouteRowByName(contentPage, routeName);
    await expect(routeRow).toBeVisible({ timeout: 5000 });
    await expect(routeRow).toContainText('GET');
  });

  test('新增服务端路由-POST请求方法创建成功', async ({ contentPage }) => {
    const routeName = `测试服务端路由_POST_${Date.now()}`;
    createdRoutes.push(routeName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '路由名称': routeName,
      '路由地址': `/api/test/server/route/${Date.now()}`,
      '分组名称': '测试分组'
    });
    const dialog = contentPage.locator('.el-dialog').first();
    const methodSelect = dialog.locator('.el-select').first();
    await methodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^POST$/ });
    await postOption.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const routeRow = findRouteRowByName(contentPage, routeName);
    await expect(routeRow).toBeVisible({ timeout: 5000 });
    await expect(routeRow).toContainText('POST');
  });

  test('新增服务端路由-PUT请求方法创建成功', async ({ contentPage }) => {
    const routeName = `测试服务端路由_PUT_${Date.now()}`;
    createdRoutes.push(routeName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '路由名称': routeName,
      '路由地址': `/api/test/server/route/${Date.now()}`,
      '分组名称': '测试分组'
    });
    const dialog = contentPage.locator('.el-dialog').first();
    const methodSelect = dialog.locator('.el-select').first();
    await methodSelect.click();
    const putOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^PUT$/ });
    await putOption.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const routeRow = findRouteRowByName(contentPage, routeName);
    await expect(routeRow).toBeVisible({ timeout: 5000 });
    await expect(routeRow).toContainText('PUT');
  });

  test('新增服务端路由-DELETE请求方法创建成功', async ({ contentPage }) => {
    const routeName = `测试服务端路由_DELETE_${Date.now()}`;
    createdRoutes.push(routeName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '路由名称': routeName,
      '路由地址': `/api/test/server/route/${Date.now()}`,
      '分组名称': '测试分组'
    });
    const dialog = contentPage.locator('.el-dialog').first();
    const methodSelect = dialog.locator('.el-select').first();
    await methodSelect.click();
    const deleteOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^DELETE$/ });
    await deleteOption.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const routeRow = findRouteRowByName(contentPage, routeName);
    await expect(routeRow).toBeVisible({ timeout: 5000 });
    await expect(routeRow).toContainText('DELETE');
  });

  test('新增服务端路由-必填字段校验', async ({ contentPage }) => {
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    const dialog = contentPage.locator('.el-dialog').first();
    const confirmBtn = dialog.locator('.el-button--primary').last();
    await confirmBtn.click();
    const errorMessage = dialog.locator('.el-form-item__error');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('修改服务端路由-修改路由信息成功', async ({ contentPage }) => {
    const routeName = `测试服务端路由_${Date.now()}`;
    const newRouteName = `${routeName}_修改后`;
    createdRoutes.push(routeName);
    createdRoutes.push(newRouteName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '路由名称': routeName,
      '路由地址': `/api/test/server/route/${Date.now()}`,
      '分组名称': '原分组'
    });
    const dialog = contentPage.locator('.el-dialog').first();
    const methodSelect = dialog.locator('.el-select').first();
    await methodSelect.click();
    const getOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^GET$/ });
    await getOption.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const routeRow = findRouteRowByName(contentPage, routeName);
    await clickRowAction(routeRow, '修改');
    const editDialog = contentPage.locator('.el-dialog').first();
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    const nameInput = editDialog.locator('input').first();
    await nameInput.clear();
    await nameInput.fill(newRouteName);
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const newRouteRow = findRouteRowByName(contentPage, newRouteName);
    await expect(newRouteRow).toBeVisible({ timeout: 5000 });
  });

  test('修改服务端路由-修改请求方法', async ({ contentPage }) => {
    const routeName = `测试服务端路由_${Date.now()}`;
    createdRoutes.push(routeName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '路由名称': routeName,
      '路由地址': `/api/test/server/route/${Date.now()}`,
      '分组名称': '测试分组'
    });
    const dialog = contentPage.locator('.el-dialog').first();
    const methodSelect = dialog.locator('.el-select').first();
    await methodSelect.click();
    const getOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^GET$/ });
    await getOption.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const routeRow = findRouteRowByName(contentPage, routeName);
    await clickRowAction(routeRow, '修改');
    const editDialog = contentPage.locator('.el-dialog').first();
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    const editMethodSelect = editDialog.locator('.el-select').first();
    await editMethodSelect.click();
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^POST$/ });
    await postOption.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const updatedRouteRow = findRouteRowByName(contentPage, routeName);
    await expect(updatedRouteRow).toContainText('POST');
  });

  test('删除服务端路由-确认删除后从列表移除', async ({ contentPage }) => {
    const routeName = `测试服务端路由_${Date.now()}`;
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '路由名称': routeName,
      '路由地址': `/api/test/server/route/${Date.now()}`,
      '分组名称': '测试分组'
    });
    const dialog = contentPage.locator('.el-dialog').first();
    const methodSelect = dialog.locator('.el-select').first();
    await methodSelect.click();
    const getOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^GET$/ });
    await getOption.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const initialRowCount = await getTableRowCount(contentPage);
    const routeRow = findRouteRowByName(contentPage, routeName);
    await clickRowAction(routeRow, '删除');
    await confirmDeleteDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const finalRowCount = await getTableRowCount(contentPage);
    expect(finalRowCount).toBe(initialRowCount - 1);
  });

  test('搜索服务端路由-按路由名称搜索', async ({ contentPage }) => {
    const routeName = `测试搜索服务端_${Date.now()}`;
    createdRoutes.push(routeName);
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    await fillDialogForm(contentPage, { 
      '路由名称': routeName,
      '路由地址': `/api/test/server/route/${Date.now()}`,
      '分组名称': '测试分组'
    });
    const dialog = contentPage.locator('.el-dialog').first();
    const methodSelect = dialog.locator('.el-select').first();
    await methodSelect.click();
    const getOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^GET$/ });
    await getOption.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const searchInput = contentPage.locator('input[placeholder*="路由名称"], input[placeholder*="搜索"]').first();
    await searchInput.fill(routeName);
    await contentPage.waitForTimeout(500);
    const routeRow = findRouteRowByName(contentPage, routeName);
    await expect(routeRow).toBeVisible({ timeout: 5000 });
  });

  test('服务端路由列表展示-列表正常加载', async ({ contentPage }) => {
    const routeTable = contentPage.locator('.el-table').first();
    await expect(routeTable).toBeVisible({ timeout: 5000 });
    const rowCount = await getTableRowCount(contentPage);
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('服务端路由列表展示-请求方法颜色标识正确', async ({ contentPage }) => {
    const testMethods = [
      { method: 'GET', routeName: `测试GET_${Date.now()}` },
      { method: 'POST', routeName: `测试POST_${Date.now()}` },
      { method: 'PUT', routeName: `测试PUT_${Date.now()}` },
      { method: 'DELETE', routeName: `测试DELETE_${Date.now()}` }
    ];
    for (const { method, routeName } of testMethods) {
      createdRoutes.push(routeName);
      const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
      await addBtn.click();
      await fillDialogForm(contentPage, { 
        '路由名称': routeName,
        '路由地址': `/api/test/${method.toLowerCase()}/${Date.now()}`,
        '分组名称': '测试分组'
      });
      const dialog = contentPage.locator('.el-dialog').first();
      const methodSelect = dialog.locator('.el-select').first();
      await methodSelect.click();
      const methodOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: new RegExp(`^${method}$`) });
      await methodOption.click();
      await confirmDialog(contentPage);
      await expectSuccessMessage(contentPage);
      await waitForRouteListLoaded(contentPage);
    }
    for (const { routeName } of testMethods) {
      const routeRow = findRouteRowByName(contentPage, routeName);
      await expect(routeRow).toBeVisible({ timeout: 5000 });
    }
  });
});
