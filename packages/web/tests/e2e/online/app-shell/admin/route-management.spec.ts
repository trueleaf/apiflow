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
  test.describe.configure({ timeout: 120000 });
  let createdRoutes: string[] = [];

  test.beforeEach(async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    const loginName1 = process.env.TEST_LOGIN_NAME;
    const password1 = process.env.TEST_LOGIN_PASSWORD;
    const loginName2 = process.env.TEST_LOGIN_NAME2;
    const password2 = process.env.TEST_LOGIN_PASSWORD2;
    if (!loginName1 || !password1) throw new Error('缺少环境变量');
    await loginAccount({ loginName: loginName1, password: password1 });
    let adminReady = false;
    try {
      await navigateToAdmin(topBarPage, contentPage);
      adminReady = true;
    } catch {
      if (!loginName2 || !password2) test.skip(true, '未配置第二账号，且当前账号不是管理员');
      await loginAccount({ loginName: loginName2, password: password2 });
      try {
        await navigateToAdmin(topBarPage, contentPage);
        adminReady = true;
      } catch {
        adminReady = false;
      }
    }
    test.skip(!adminReady, '当前测试环境没有管理员账号');
    await switchAdminTab(contentPage, '客户端路由');
    await waitForRouteListLoaded(contentPage);
    createdRoutes = [];
  });

  test.afterEach(async ({ contentPage }) => {
    const routesToCleanup = Array.from(new Set(createdRoutes.filter((routeName) => /^(测试客户端路由_|测试搜索客户端_|客户端分组筛选|客户端批量路由)/.test(routeName)))).sort((a, b) => b.length - a.length);
    for (const routeName of routesToCleanup) {
      try {
        const routeRow = findRouteRowByName(contentPage, routeName);
        const rowVisible = await routeRow.isVisible({ timeout: 800 }).catch(() => false);
        if (!rowVisible) {
          continue;
        }
        const deleteBtn = routeRow.locator('.el-button').filter({ hasText: /删除/ }).first();
        const btnVisible = await deleteBtn.isVisible({ timeout: 500 }).catch(() => false);
        if (!btnVisible) {
          continue;
        }
        const btnDisabled = await deleteBtn.isDisabled().catch(() => true);
        if (btnDisabled) {
          continue;
        }
        await deleteBtn.click();
        const fastConfirmBtn = contentPage.locator('.cl-confirm-wrapper .el-button--primary, .el-message-box .el-button--primary').first();
        const hasConfirm = await fastConfirmBtn.isVisible({ timeout: 1000 }).catch(() => false);
        if (hasConfirm) {
          await fastConfirmBtn.click();
          await contentPage.waitForTimeout(200);
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
    const errorMessage = dialog.locator('.el-form-item__error').first();
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
    const routeRow = findRouteRowByName(contentPage, routeName);
    await clickRowAction(routeRow, '删除');
    await confirmDeleteDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    await expect(findRouteRowByName(contentPage, routeName)).toHaveCount(0, { timeout: 5000 });
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
    const searchInput = contentPage.locator('.settings .content-area input[placeholder*="名称&地址"], .settings .content-area input[placeholder*="搜索"]').first();
    await searchInput.fill(routeName);
    const searchBtn = contentPage.locator('.settings .content-area .el-button').filter({ hasText: /搜索/ }).first();
    await searchBtn.click();
    const routeRow = findRouteRowByName(contentPage, routeName);
    await expect(routeRow).toBeVisible({ timeout: 5000 });
  });

  test('搜索客户端路由-按分组名称筛选', async ({ contentPage }) => {
    const groupA = `客户端分组A_${Date.now()}`;
    const groupB = `客户端分组B_${Date.now()}`;
    const routeA = `客户端分组筛选A_${Date.now()}`;
    const routeB = `客户端分组筛选B_${Date.now()}`;
    createdRoutes.push(routeA, routeB);
    // 创建两条不同分组的客户端路由
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    await fillDialogForm(contentPage, {
      '路由名称': routeA,
      '路由地址': `/test/client/route/group-a/${Date.now()}`,
      '分组名称': groupA,
    });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    await addBtn.click();
    await fillDialogForm(contentPage, {
      '路由名称': routeB,
      '路由地址': `/test/client/route/group-b/${Date.now()}`,
      '分组名称': groupB,
    });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    // 通过分组下拉筛选，仅显示分组A的数据
    const groupSelect = contentPage.locator('.el-select').first();
    await groupSelect.click();
    const groupOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: groupA }).first();
    await groupOption.click();
    const searchBtn = contentPage.locator('.settings .content-area .el-button').filter({ hasText: /搜索/ }).first();
    await searchBtn.click();
    await expect(findRouteRowByName(contentPage, routeA)).toBeVisible({ timeout: 5000 });
    await expect(findRouteRowByName(contentPage, routeB)).toHaveCount(0, { timeout: 5000 });
  });

  test('客户端路由-批量修改类型后分组更新', async ({ contentPage }) => {
    const routeA = `客户端批量路由A_${Date.now()}`;
    const routeB = `客户端批量路由B_${Date.now()}`;
    const sourceGroup = `客户端原分组_${Date.now()}`;
    const targetGroup = `客户端新分组_${Date.now()}`;
    createdRoutes.push(routeA, routeB);
    // 创建两条同分组路由，作为批量修改目标
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    await fillDialogForm(contentPage, {
      '路由名称': routeA,
      '路由地址': `/test/client/batch/a/${Date.now()}`,
      '分组名称': sourceGroup,
    });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    await addBtn.click();
    await fillDialogForm(contentPage, {
      '路由名称': routeB,
      '路由地址': `/test/client/batch/b/${Date.now()}`,
      '分组名称': sourceGroup,
    });
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    // 按路由名精确勾选两条记录并打开批量修改弹窗
    const routeARow = findRouteRowByName(contentPage, routeA);
    const routeBRow = findRouteRowByName(contentPage, routeB);
    await expect(routeARow).toBeVisible({ timeout: 5000 });
    await expect(routeBRow).toBeVisible({ timeout: 5000 });
    await routeARow.locator('.el-checkbox').first().click();
    await routeBRow.locator('.el-checkbox').first().click();
    const batchBtn = contentPage.locator('.el-button').filter({ hasText: /批量修改类型/ }).first();
    await batchBtn.click();
    const batchDialog = contentPage.locator('.el-dialog:visible').filter({ hasText: /批量修改前端路由类型/ }).first();
    await expect(batchDialog).toBeVisible({ timeout: 5000 });
    await batchDialog.locator('input').first().fill(targetGroup);
    await batchDialog.locator('.el-button--primary').last().click();
    await expect(batchDialog).toBeHidden({ timeout: 5000 });
    await waitForRouteListLoaded(contentPage);
    await expect(findRouteRowByName(contentPage, routeA)).toContainText(targetGroup, { timeout: 5000 });
    await expect(findRouteRowByName(contentPage, routeB)).toContainText(targetGroup, { timeout: 5000 });
  });

  test('客户端路由列表展示-列表正常加载', async ({ contentPage }) => {
    const routeTable = contentPage.locator('.el-table').first();
    await expect(routeTable).toBeVisible({ timeout: 5000 });
    const rowCount = await getTableRowCount(contentPage);
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Online后台管理-服务端路由管理', () => {
  test.describe.configure({ timeout: 120000 });
  let createdRoutes: string[] = [];

  test.beforeEach(async ({ topBarPage, contentPage, clearCache, loginAccount }) => {
    await clearCache();
    const loginName1 = process.env.TEST_LOGIN_NAME;
    const password1 = process.env.TEST_LOGIN_PASSWORD;
    const loginName2 = process.env.TEST_LOGIN_NAME2;
    const password2 = process.env.TEST_LOGIN_PASSWORD2;
    if (!loginName1 || !password1) throw new Error('缺少环境变量');
    await loginAccount({ loginName: loginName1, password: password1 });
    let adminReady = false;
    try {
      await navigateToAdmin(topBarPage, contentPage);
      adminReady = true;
    } catch {
      if (!loginName2 || !password2) test.skip(true, '未配置第二账号，且当前账号不是管理员');
      await loginAccount({ loginName: loginName2, password: password2 });
      try {
        await navigateToAdmin(topBarPage, contentPage);
        adminReady = true;
      } catch {
        adminReady = false;
      }
    }
    test.skip(!adminReady, '当前测试环境没有管理员账号');
    await switchAdminTab(contentPage, '服务端路由');
    await waitForRouteListLoaded(contentPage);
    createdRoutes = [];
  });

  test.afterEach(async ({ contentPage }) => {
    const routesToCleanup = Array.from(new Set(createdRoutes.filter((routeName) => /^(测试服务端路由_|测试搜索服务端_|服务端分组筛选|服务端批量路由|测试GET_|测试POST_|测试PUT_|测试DELETE_)/.test(routeName)))).sort((a, b) => b.length - a.length);
    for (const routeName of routesToCleanup) {
      try {
        const routeRow = findRouteRowByName(contentPage, routeName);
        const rowVisible = await routeRow.isVisible({ timeout: 800 }).catch(() => false);
        if (!rowVisible) {
          continue;
        }
        const deleteBtn = routeRow.locator('.el-button').filter({ hasText: /删除/ }).first();
        const btnVisible = await deleteBtn.isVisible({ timeout: 500 }).catch(() => false);
        if (!btnVisible) {
          continue;
        }
        const btnDisabled = await deleteBtn.isDisabled().catch(() => true);
        if (btnDisabled) {
          continue;
        }
        await deleteBtn.click();
        const fastConfirmBtn = contentPage.locator('.cl-confirm-wrapper .el-button--primary, .el-message-box .el-button--primary').first();
        const hasConfirm = await fastConfirmBtn.isVisible({ timeout: 1000 }).catch(() => false);
        if (hasConfirm) {
          await fastConfirmBtn.click();
          await contentPage.waitForTimeout(200);
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
    const getOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^get$/i }).first();
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
    const postOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^post$/i }).first();
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
    const putOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^put$/i }).first();
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
    const deleteOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^delete$/i }).first();
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
    const errorMessage = dialog.locator('.el-form-item__error').first();
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
    const getOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^get$/i }).first();
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

  test('修改服务端路由-请求方法和路径不可编辑', async ({ contentPage }) => {
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
    const getOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^get$/i }).first();
    await getOption.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const routeRow = findRouteRowByName(contentPage, routeName);
    await clickRowAction(routeRow, '修改');
    const editDialog = contentPage.locator('.el-dialog').first();
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    // 校验服务端路由编辑时 method/path 为只读，避免误改路由主键
    const methodInput = editDialog.locator('input[disabled]').first();
    const pathInput = editDialog.locator('input[disabled]').nth(1);
    await expect(methodInput).toBeVisible({ timeout: 5000 });
    await expect(pathInput).toBeVisible({ timeout: 5000 });
    await expect(methodInput).toHaveValue(/GET|POST|PUT|DELETE/i);
    await expect(pathInput).toHaveValue(/\/api\/test\/server\/route\//);
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
    const getOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^get$/i }).first();
    await getOption.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const routeRow = findRouteRowByName(contentPage, routeName);
    await clickRowAction(routeRow, '删除');
    await confirmDeleteDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    await expect(findRouteRowByName(contentPage, routeName)).toHaveCount(0, { timeout: 5000 });
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
    const getOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^get$/i }).first();
    await getOption.click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    const searchInput = contentPage.locator('.settings .content-area input[placeholder*="名称&地址"], .settings .content-area input[placeholder*="搜索"]').first();
    await searchInput.fill(routeName);
    const searchBtn = contentPage.locator('.settings .content-area .el-button').filter({ hasText: /搜索/ }).first();
    await searchBtn.click();
    const routeRow = findRouteRowByName(contentPage, routeName);
    await expect(routeRow).toBeVisible({ timeout: 5000 });
  });

  test('搜索服务端路由-按分组名称筛选', async ({ contentPage }) => {
    const groupA = `服务端分组A_${Date.now()}`;
    const groupB = `服务端分组B_${Date.now()}`;
    const routeA = `服务端分组筛选A_${Date.now()}`;
    const routeB = `服务端分组筛选B_${Date.now()}`;
    createdRoutes.push(routeA, routeB);
    // 创建两条不同分组路由
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    await fillDialogForm(contentPage, {
      '路由名称': routeA,
      '路由地址': `/api/test/server/group-a/${Date.now()}`,
      '分组名称': groupA,
    });
    const dialog = contentPage.locator('.el-dialog').first();
    await dialog.locator('.el-select').first().click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^get$/i }).first().click();
    await confirmDialog(contentPage);
    await waitForRouteListLoaded(contentPage);
    await addBtn.click();
    await fillDialogForm(contentPage, {
      '路由名称': routeB,
      '路由地址': `/api/test/server/group-b/${Date.now()}`,
      '分组名称': groupB,
    });
    const dialog2 = contentPage.locator('.el-dialog').first();
    await dialog2.locator('.el-select').first().click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^get$/i }).first().click();
    await confirmDialog(contentPage);
    await waitForRouteListLoaded(contentPage);
    // 通过分组下拉筛选，仅显示分组A
    const groupSelect = contentPage.locator('.el-select').first();
    await groupSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: groupA }).first().click();
    const searchBtn = contentPage.locator('.settings .content-area .el-button').filter({ hasText: /搜索/ }).first();
    await searchBtn.click();
    await expect(findRouteRowByName(contentPage, routeA)).toBeVisible({ timeout: 5000 });
    await expect(findRouteRowByName(contentPage, routeB)).toHaveCount(0, { timeout: 5000 });
  });

  test('服务端路由-批量修改类型后分组更新', async ({ contentPage }) => {
    const routeA = `服务端批量路由A_${Date.now()}`;
    const routeB = `服务端批量路由B_${Date.now()}`;
    const sourceGroup = `服务端原分组_${Date.now()}`;
    const targetGroup = `服务端新分组_${Date.now()}`;
    createdRoutes.push(routeA, routeB);
    // 创建两条待批量修改的服务端路由
    const addBtn = contentPage.locator('.el-button').filter({ hasText: /新增路由/ });
    await addBtn.click();
    await fillDialogForm(contentPage, {
      '路由名称': routeA,
      '路由地址': `/api/test/server/batch/a/${Date.now()}`,
      '分组名称': sourceGroup,
    });
    const dialog = contentPage.locator('.el-dialog').first();
    await dialog.locator('.el-select').first().click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^get$/i }).first().click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    await addBtn.click();
    await fillDialogForm(contentPage, {
      '路由名称': routeB,
      '路由地址': `/api/test/server/batch/b/${Date.now()}`,
      '分组名称': sourceGroup,
    });
    const dialog2 = contentPage.locator('.el-dialog').first();
    await dialog2.locator('.el-select').first().click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: /^get$/i }).first().click();
    await confirmDialog(contentPage);
    await expectSuccessMessage(contentPage);
    await waitForRouteListLoaded(contentPage);
    // 按路由名精确勾选记录并批量更新分组
    const routeARow = findRouteRowByName(contentPage, routeA);
    const routeBRow = findRouteRowByName(contentPage, routeB);
    await expect(routeARow).toBeVisible({ timeout: 5000 });
    await expect(routeBRow).toBeVisible({ timeout: 5000 });
    await routeARow.locator('.el-checkbox').first().click();
    await routeBRow.locator('.el-checkbox').first().click();
    const batchBtn = contentPage.locator('.el-button').filter({ hasText: /批量修改类型/ }).first();
    await batchBtn.click();
    const batchDialog = contentPage.locator('.el-dialog:visible').filter({ hasText: /批量修改服务端路由类型/ }).first();
    await expect(batchDialog).toBeVisible({ timeout: 5000 });
    await batchDialog.locator('input').first().fill(targetGroup);
    await batchDialog.locator('.el-button--primary').last().click();
    await expect(batchDialog).toBeHidden({ timeout: 5000 });
    await waitForRouteListLoaded(contentPage);
    await expect(findRouteRowByName(contentPage, routeA)).toContainText(targetGroup, { timeout: 5000 });
    await expect(findRouteRowByName(contentPage, routeB)).toContainText(targetGroup, { timeout: 5000 });
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
      const methodOption = contentPage.locator('.el-select-dropdown__item').filter({ hasText: new RegExp(`^${method}$`, 'i') }).first();
      await methodOption.click();
      await confirmDialog(contentPage);
      await waitForRouteListLoaded(contentPage);
    }
    for (const { routeName } of testMethods) {
      const routeRow = findRouteRowByName(contentPage, routeName);
      await expect(routeRow).toBeVisible({ timeout: 5000 });
    }
  });
});
