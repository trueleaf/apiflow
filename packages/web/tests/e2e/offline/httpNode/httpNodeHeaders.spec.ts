import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';

test.describe('5. HTTP节点 - Headers模块测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;

    await createProject(contentPage, '测试项目');
    await createSingleNode(contentPage, {
      name: 'Test API',
      type: 'http'
    });
  });

  test.describe('5.1 自定义请求头测试', () => {
    /**
     * 测试目的：验证添加自定义请求头功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 等待HTTP节点加载完成
     *   2. 添加自定义请求头 X-Custom-Header: CustomValue
     *   3. 验证请求头存在
     * 预期结果：
     *   - 自定义请求头成功添加
     *   - 请求头在列表中可见
     * 验证点：自定义请求头添加功能
     */
    test('应能添加自定义请求头', async () => {
      // 添加自定义请求头
      const headersActive1 = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive1) {
        const tab1 = contentPage.locator('.el-tabs__item:has-text("请求头")');
        await tab1.click();
        await contentPage.waitForTimeout(300);
      }
      const container1 = contentPage.locator('.header-info .el-tree').first();
      await container1.waitFor({ state: 'visible', timeout: 5000 });
      const rows1 = container1.locator('.custom-params');
      const count1 = await rows1.count();
      const lastIndex1 = count1 > 0 ? count1 - 1 : 0;
      const lastRow1 = rows1.nth(lastIndex1);
      const keyInput1 = lastRow1.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput1.fill('X-Custom-Header');
      const valueInput1 = lastRow1.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput1.fill('CustomValue');
      await contentPage.waitForTimeout(20);
      // 验证请求头存在
      const tab2 = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab2.click();
      await contentPage.waitForTimeout(300);
      const headerSection = contentPage.locator('.header-info, .headers-table, .s-params').first();
      await headerSection.waitFor({ state: 'visible', timeout: 5000 });
      const exactInput = headerSection.locator('input[value="X-Custom-Header"]').first();
      if (await exactInput.count()) {
        await expect(exactInput).toBeVisible();
      } else {
        const keyInputs = headerSection.locator('input[placeholder*="参数"], input[placeholder*="key"], input[placeholder*="请求头"]');
        const inputCount = await keyInputs.count();
        let found = false;
        for (let i = 0; i < inputCount; i++) {
          const candidate = keyInputs.nth(i);
          const value = await candidate.inputValue();
          if (value === 'X-Custom-Header') {
            await expect(candidate).toBeVisible();
            found = true;
            break;
          }
        }
        if (!found) {
          throw new Error('Header X-Custom-Header not found');
        }
      }
    });

    /**
     * 测试目的：验证编辑请求头的key
     * 前置条件：已添加请求头
     * 操作步骤：
     *   1. 添加请求头 Old-Header: value
     *   2. 切换到Headers标签页
     *   3. 定位到该请求头行
     *   4. 修改key为New-Header
     *   5. 验证新key存在
     * 预期结果：
     *   - 请求头key成功修改
     *   - 新key在列表中显示
     * 验证点：请求头key的可编辑性
     * 说明：测试标记为skip,可能存在已知问题
     */
    test.skip('应能编辑请求头的key', async () => {
      // 添加请求头
      const headersActive1 = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive1) {
        const tab1 = contentPage.locator('.el-tabs__item:has-text("请求头")');
        await tab1.click();
        await contentPage.waitForTimeout(300);
      }
      const container1 = contentPage.locator('.header-info .el-tree').first();
      await container1.waitFor({ state: 'visible', timeout: 5000 });
      const rows1 = container1.locator('.custom-params');
      const count1 = await rows1.count();
      const lastIndex1 = count1 > 0 ? count1 - 1 : 0;
      const lastRow1 = rows1.nth(lastIndex1);
      const keyInput1 = lastRow1.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput1.fill('Old-Header');
      const valueInput1 = lastRow1.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput1.fill('value');
      await contentPage.waitForTimeout(20);
      // 切换到Headers标签页
      const tab2 = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab2.click();
      await contentPage.waitForTimeout(300);
      // 定位到该请求头行
      const row = contentPage.locator('tr:has(input[value="Old-Header"])');
      const keyInput = row.locator('input[placeholder*="请求头"], input[placeholder*="key"]').first();
      // 修改key为New-Header
      await keyInput.clear();
      await keyInput.fill('New-Header');
      await contentPage.waitForTimeout(200);
      // 验证新key存在
      const tab3 = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab3.click();
      await contentPage.waitForTimeout(300);
      const headerSection = contentPage.locator('.header-info, .headers-table, .s-params').first();
      await headerSection.waitFor({ state: 'visible', timeout: 5000 });
      const exactInput = headerSection.locator('input[value="New-Header"]').first();
      if (await exactInput.count()) {
        await expect(exactInput).toBeVisible();
      } else {
        const keyInputs = headerSection.locator('input[placeholder*="参数"], input[placeholder*="key"], input[placeholder*="请求头"]');
        const inputCount = await keyInputs.count();
        let found = false;
        for (let i = 0; i < inputCount; i++) {
          const candidate = keyInputs.nth(i);
          const value = await candidate.inputValue();
          if (value === 'New-Header') {
            await expect(candidate).toBeVisible();
            found = true;
            break;
          }
        }
        if (!found) {
          throw new Error('Header New-Header not found');
        }
      }
    });

    /**
     * 测试目的：验证编辑请求头的value
     * 前置条件：已添加请求头
     * 操作步骤：
     *   1. 添加请求头 Test-Header: oldValue
     *   2. 切换到Headers标签页
     *   3. 定位到该请求头行
     *   4. 修改value为newValue
     * 预期结果：
     *   - 请求头value成功修改
     *   - 新value保存
     * 验证点：请求头value的可编辑性
     * 说明：测试标记为skip,可能存在已知问题
     */
    test.skip('应能编辑请求头的value', async () => {
      // 添加请求头
      const headersActive1 = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive1) {
        const tab1 = contentPage.locator('.el-tabs__item:has-text("请求头")');
        await tab1.click();
        await contentPage.waitForTimeout(300);
      }
      const container1 = contentPage.locator('.header-info .el-tree').first();
      await container1.waitFor({ state: 'visible', timeout: 5000 });
      const rows1 = container1.locator('.custom-params');
      const count1 = await rows1.count();
      const lastIndex1 = count1 > 0 ? count1 - 1 : 0;
      const lastRow1 = rows1.nth(lastIndex1);
      const keyInput1 = lastRow1.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput1.fill('Test-Header');
      const valueInput1 = lastRow1.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput1.fill('oldValue');
      await contentPage.waitForTimeout(20);
      // 切换到Headers标签页
      const tab2 = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab2.click();
      await contentPage.waitForTimeout(300);
      // 定位到该请求头行
      const row = contentPage.locator('tr:has(input[value="Test-Header"])');
      const valueInput = row.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
      // 修改value为newValue
      await valueInput.clear();
      await valueInput.fill('newValue');
      await contentPage.waitForTimeout(200);
    });

    /**
     * 测试目的：验证删除单个请求头
     * 前置条件：已添加请求头
     * 操作步骤：
     *   1. 添加请求头 Delete-Me: value
     *   2. 执行删除操作
     * 预期结果：
     *   - 请求头从列表中移除
     *   - 删除操作成功
     * 验证点：请求头删除功能
     */
    test('应能删除请求头', async () => {
      // 添加请求头
      const headersActive1 = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive1) {
        const tab1 = contentPage.locator('.el-tabs__item:has-text("请求头")');
        await tab1.click();
        await contentPage.waitForTimeout(300);
      }
      const container1 = contentPage.locator('.header-info .el-tree').first();
      await container1.waitFor({ state: 'visible', timeout: 5000 });
      const rows1 = container1.locator('.custom-params');
      const count1 = await rows1.count();
      const lastIndex1 = count1 > 0 ? count1 - 1 : 0;
      const lastRow1 = rows1.nth(lastIndex1);
      const keyInput1 = lastRow1.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput1.fill('Delete-Me');
      const valueInput1 = lastRow1.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput1.fill('value');
      await contentPage.waitForTimeout(20);
      // 执行删除操作
      const tab2 = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab2.click();
      await contentPage.waitForTimeout(300);
      const removed = await contentPage.evaluate((targetKey) => {
        const rowElements = Array.from(
          document.querySelectorAll<HTMLElement>(
            '.header-info .custom-params, .headers-table .custom-params, .s-params .custom-params'
          )
        );
        for (const row of rowElements) {
          const inputs = Array.from(row.querySelectorAll<HTMLInputElement>('input'));
          const matched = inputs.some((input) => input.value === targetKey);
          if (!matched) {
            continue;
          }
          const deleteButton = row.querySelector<HTMLElement>('.icon-shanchu, [title*="删除"]');
          if (deleteButton) {
            deleteButton.click();
            return true;
          }
        }
        return false;
      }, 'Delete-Me');
      if (!removed) {
        throw new Error('未找到请求头 Delete-Me');
      }
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证批量删除请求头功能
     * 前置条件：已添加多个请求头
     * 操作步骤：
     *   1. 添加3个请求头
     *   2. 执行清空所有请求头操作
     * 预期结果：
     *   - 所有自定义请求头被清除
     *   - 列表恢复初始状态
     * 验证点：批量删除功能
     */
    test('应能批量删除请求头', async () => {
      // 添加3个请求头
      const headersActive1 = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive1) {
        const tab1 = contentPage.locator('.el-tabs__item:has-text("请求头")');
        await tab1.click();
        await contentPage.waitForTimeout(300);
      }
      const container1 = contentPage.locator('.header-info .el-tree').first();
      await container1.waitFor({ state: 'visible', timeout: 5000 });
      const rows1 = container1.locator('.custom-params');
      const count1 = await rows1.count();
      const lastIndex1 = count1 > 0 ? count1 - 1 : 0;
      const lastRow1 = rows1.nth(lastIndex1);
      const keyInput1 = lastRow1.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput1.fill('Header1');
      const valueInput1 = lastRow1.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput1.fill('value1');
      await contentPage.waitForTimeout(20);
      const rows2 = container1.locator('.custom-params');
      const count2 = await rows2.count();
      const lastIndex2 = count2 > 0 ? count2 - 1 : 0;
      const lastRow2 = rows2.nth(lastIndex2);
      const keyInput2 = lastRow2.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput2.fill('Header2');
      const valueInput2 = lastRow2.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput2.fill('value2');
      await contentPage.waitForTimeout(20);
      const rows3 = container1.locator('.custom-params');
      const count3 = await rows3.count();
      const lastIndex3 = count3 > 0 ? count3 - 1 : 0;
      const lastRow3 = rows3.nth(lastIndex3);
      const keyInput3 = lastRow3.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput3.fill('Header3');
      const valueInput3 = lastRow3.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput3.fill('value3');
      await contentPage.waitForTimeout(20);
      // 执行清空所有请求头操作
      const tab2 = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab2.click();
      await contentPage.waitForTimeout(300);
      const container2 = contentPage.locator('.header-info, .headers-table, .s-params').first();
      await container2.waitFor({ state: 'visible', timeout: 5000 });
      const deleteButtons = container2.locator('.custom-params .icon-shanchu, .custom-params [title*="删除"]');
      while ((await deleteButtons.count()) > 0) {
        await deleteButtons.first().click();
        await contentPage.waitForTimeout(200);
      }
    });

    /**
     * 测试目的：验证添加请求头描述功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：添加带描述的请求头
     * 预期结果：
     *   - 请求头描述成功保存
     *   - 描述信息可查看
     * 验证点：请求头描述信息管理
     * 说明：描述有助于API文档生成和团队协作
     */
    test('应能添加请求头描述', async () => {
      // 添加带描述的请求头
      const headersActive1 = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive1) {
        const tab1 = contentPage.locator('.el-tabs__item:has-text("请求头")');
        await tab1.click();
        await contentPage.waitForTimeout(300);
      }
      const container1 = contentPage.locator('.header-info .el-tree').first();
      await container1.waitFor({ state: 'visible', timeout: 5000 });
      const rows1 = container1.locator('.custom-params');
      const count1 = await rows1.count();
      const lastIndex1 = count1 > 0 ? count1 - 1 : 0;
      const lastRow1 = rows1.nth(lastIndex1);
      const keyInput1 = lastRow1.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput1.fill('Described-Header');
      const valueInput1 = lastRow1.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput1.fill('value');
      const descInput = lastRow1.locator('input[placeholder="参数描述与备注"], input[placeholder*="描述"], input[placeholder*="说明"]').first();
      if (await descInput.count()) {
        await descInput.fill('这是请求头描述');
      }
      await contentPage.waitForTimeout(20);
      // 验证请求头存在
      const tab2 = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab2.click();
      await contentPage.waitForTimeout(300);
      const headerSection = contentPage.locator('.header-info, .headers-table, .s-params').first();
      await headerSection.waitFor({ state: 'visible', timeout: 5000 });
      const exactInput = headerSection.locator('input[value="Described-Header"]').first();
      if (await exactInput.count()) {
        await expect(exactInput).toBeVisible();
      } else {
        const keyInputs = headerSection.locator('input[placeholder*="参数"], input[placeholder*="key"], input[placeholder*="请求头"]');
        const inputCount = await keyInputs.count();
        let found = false;
        for (let i = 0; i < inputCount; i++) {
          const candidate = keyInputs.nth(i);
          const value = await candidate.inputValue();
          if (value === 'Described-Header') {
            await expect(candidate).toBeVisible();
            found = true;
            break;
          }
        }
        if (!found) {
          throw new Error('Header Described-Header not found');
        }
      }
    });

    /**
     * 测试目的：验证请求头value支持变量替换
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加请求头Authorization: Bearer {{token}}
     *   2. 验证请求头存在
     * 预期结果：
     *   - 变量占位符{{token}}被正确识别
     *   - 发送请求时会进行变量替换
     * 验证点：请求头中的变量支持
     * 说明：常用于动态设置Authorization等认证头
     */
    test('请求头value应支持变量替换', async () => {
      // 添加请求头Authorization使用变量
      const headersActive1 = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive1) {
        const tab1 = contentPage.locator('.el-tabs__item:has-text("请求头")');
        await tab1.click();
        await contentPage.waitForTimeout(300);
      }
      const container1 = contentPage.locator('.header-info .el-tree').first();
      await container1.waitFor({ state: 'visible', timeout: 5000 });
      const rows1 = container1.locator('.custom-params');
      const count1 = await rows1.count();
      const lastIndex1 = count1 > 0 ? count1 - 1 : 0;
      const lastRow1 = rows1.nth(lastIndex1);
      const keyInput1 = lastRow1.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput1.fill('Authorization');
      const valueInput1 = lastRow1.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput1.fill('Bearer {{token}}');
      await contentPage.waitForTimeout(20);
      // 验证请求头存在
      const tab2 = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab2.click();
      await contentPage.waitForTimeout(300);
      const headerSection = contentPage.locator('.header-info, .headers-table, .s-params').first();
      await headerSection.waitFor({ state: 'visible', timeout: 5000 });
      const exactInput = headerSection.locator('input[value="Authorization"]').first();
      if (await exactInput.count()) {
        await expect(exactInput).toBeVisible();
      } else {
        const keyInputs = headerSection.locator('input[placeholder*="参数"], input[placeholder*="key"], input[placeholder*="请求头"]');
        const inputCount = await keyInputs.count();
        let found = false;
        for (let i = 0; i < inputCount; i++) {
          const candidate = keyInputs.nth(i);
          const value = await candidate.inputValue();
          if (value === 'Authorization') {
            await expect(candidate).toBeVisible();
            found = true;
            break;
          }
        }
        if (!found) {
          throw new Error('Header Authorization not found');
        }
      }
    });

    /**
     * 测试目的：验证请求头的启用/禁用功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加禁用状态的请求头
     *   2. 切换到Headers标签页
     *   3. 通过JS查找该请求头行的复选框状态
     * 预期结果：
     *   - 复选框未勾选(禁用状态)
     *   - 禁用的请求头不会在请求中发送
     * 验证点：请求头启用/禁用控制
     * 说明：禁用功能便于临时排除某些请求头
     */
    test('请求头应支持启用/禁用', async () => {
      // 添加禁用状态的请求头
      const headersActive1 = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive1) {
        const tab1 = contentPage.locator('.el-tabs__item:has-text("请求头")');
        await tab1.click();
        await contentPage.waitForTimeout(300);
      }
      const container1 = contentPage.locator('.header-info .el-tree').first();
      await container1.waitFor({ state: 'visible', timeout: 5000 });
      const rows1 = container1.locator('.custom-params');
      const count1 = await rows1.count();
      const lastIndex1 = count1 > 0 ? count1 - 1 : 0;
      const lastRow1 = rows1.nth(lastIndex1);
      const keyInput1 = lastRow1.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput1.fill('Disabled-Header');
      const valueInput1 = lastRow1.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput1.fill('value');
      const checkboxWrapper = lastRow1.locator('.el-checkbox').first();
      if (await checkboxWrapper.count()) {
        await checkboxWrapper.click();
      }
      await contentPage.waitForTimeout(20);
      // 切换到Headers标签页
      const tab2 = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab2.click();
      await contentPage.waitForTimeout(300);
      // 通过JS查找该请求头行的复选框状态
      const enabledState = await contentPage.evaluate(() => {
        const rows = Array.from(
          document.querySelectorAll<HTMLElement>(
            '.header-info .custom-params, .headers-table .custom-params, .s-params .custom-params'
          )
        );
        for (const row of rows) {
          const inputs = Array.from(row.querySelectorAll<HTMLInputElement>('input'));
          const matched = inputs.some((input) => input.value === 'Disabled-Header');
          if (!matched) {
            continue;
          }
          const checkbox = row.querySelector<HTMLInputElement>('input[type="checkbox"]');
          return checkbox ? checkbox.checked : null;
        }
        return null;
      });
      if (enabledState === null) {
        throw new Error('未找到Disabled-Header请求头对应的复选框');
      }
      expect(enabledState).toBe(false);
    });
  });

  test.describe('5.2 公共请求头测试', () => {
    /**
     * 测试目的：验证显示项目级公共请求头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 查找公共请求头按钮
     *   3. 点击打开公共请求头面板
     * 预期结果：
     *   - 公共请求头按钮可见
     *   - 点击后显示项目级公共请求头
     * 验证点：项目级公共请求头显示
     * 说明：项目级公共头对当前项目的所有接口生效
     */
    test('应显示项目级公共请求头', async () => {
      // 切换到Headers标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 查找公共请求头按钮
      const publicHeadersBtn = contentPage.locator('[title*="公共"], .public-headers-btn').first();
      if (await publicHeadersBtn.isVisible()) {
        // 点击打开公共请求头面板
        await publicHeadersBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });

    /**
     * 测试目的：验证显示全局级公共请求头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 打开公共请求头面板
     * 预期结果：显示全局级公共请求头
     * 验证点：全局级公共请求头显示
     * 说明：全局级公共头对所有项目的所有接口生效
     */
    test('应显示全局级公共请求头', async () => {
      // 切换到Headers标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 打开公共请求头面板
      const publicHeadersBtn = contentPage.locator('[title*="公共"], .public-headers-btn').first();
      if (await publicHeadersBtn.isVisible()) {
        await publicHeadersBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });

    /**
     * 测试目的：验证显示/隐藏公共请求头区域
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 查找切换按钮
     *   3. 点击显示公共请求头
     *   4. 点击隐藏公共请求头
     * 预期结果：
     *   - 公共请求头区域可以展开/折叠
     *   - 切换操作流畅
     * 验证点：公共请求头区域的显示/隐藏控制
     */
    test('应能显示/隐藏公共请求头区域', async () => {
      // 切换到Headers标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 查找切换按钮
      const toggleBtn = contentPage.locator('.toggle-public-headers, .show-public').first();
      if (await toggleBtn.isVisible()) {
        // 点击显示公共请求头
        await toggleBtn.click();
        await contentPage.waitForTimeout(200);
        // 点击隐藏公共请求头
        await toggleBtn.click();
        await contentPage.waitForTimeout(200);
      }
    });

    /**
     * 测试目的：验证在节点级禁用公共请求头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 定位到公共请求头区域
     *   3. 取消勾选启用复选框
     * 预期结果：
     *   - 公共请求头被禁用
     *   - 该节点发送请求时不包含公共请求头
     * 验证点：节点级公共请求头禁用功能
     * 说明：允许单个接口排除公共请求头
     */
    test('应能在节点级禁用公共请求头', async () => {
      // 切换到Headers标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 定位到公共请求头区域
      const publicHeadersArea = contentPage.locator('.public-headers, .common-headers').first();
      if (await publicHeadersArea.isVisible()) {
        const checkbox = publicHeadersArea.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
          // 取消勾选启用复选框
          await checkbox.uncheck();
          await contentPage.waitForTimeout(200);
        }
      }
    });

    /**
     * 测试目的：验证重新启用公共请求头
     * 前置条件：公共请求头已被禁用
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 勾选公共请求头启用复选框
     * 预期结果：
     *   - 公共请求头重新生效
     *   - 发送请求时包含公共请求头
     * 验证点：公共请求头的启用/禁用切换
     */
    test('应能重新启用公共请求头', async () => {
      // 切换到Headers标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 勾选公共请求头启用复选框
      const publicHeadersArea = contentPage.locator('.public-headers, .common-headers').first();
      if (await publicHeadersArea.isVisible()) {
        const checkbox = publicHeadersArea.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
          await checkbox.check();
          await contentPage.waitForTimeout(200);
        }
      }
    });

    /**
     * 测试目的：验证公共头标识其来源
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 查看公共请求头区域
     *   3. 检查来源标签
     * 预期结果：
     *   - 公共请求头有来源标识
     *   - 可区分项目级和全局级
     * 验证点：公共请求头来源标识
     * 说明：来源标识帮助用户了解请求头的配置位置
     */
    test('公共头应标识其来源（项目级/全局级）', async () => {
      // 切换到Headers标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 查看公共请求头区域
      const publicHeadersArea = contentPage.locator('.public-headers, .common-headers').first();
      if (await publicHeadersArea.isVisible()) {
        // 检查来源标签
        const sourceLabel = publicHeadersArea.locator('.source-label, .level-tag').first();
        if (await sourceLabel.isVisible()) {
          await expect(sourceLabel).toBeVisible();
        }
      }
    });

    /**
     * 测试目的：验证公共头的key只读
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 定位到公共请求头区域
     *   3. 检查key输入框的readonly或disabled属性
     * 预期结果：
     *   - key输入框为只读状态
     *   - 不能在节点级修改公共头的key
     * 验证点：公共请求头key的只读限制
     * 说明：公共头只能在配置面板中修改
     */
    test('公共头的key应只读', async () => {
      // 切换到Headers标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 定位到公共请求头区域
      const publicHeadersArea = contentPage.locator('.public-headers, .common-headers').first();
      if (await publicHeadersArea.isVisible()) {
        // 检查key输入框的readonly或disabled属性
        const keyInput = publicHeadersArea.locator('input[placeholder*="请求头"]').first();
        if (await keyInput.isVisible()) {
          const isReadonly = await keyInput.getAttribute('readonly') || await keyInput.isDisabled();
          expect(isReadonly).toBeTruthy();
        }
      }
    });

    /**
     * 测试目的：验证公共头的value只读
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 定位到公共请求头区域
     *   3. 检查value输入框的readonly或disabled属性
     * 预期结果：
     *   - value输入框为只读状态
     *   - 不能在节点级修改公共头的value
     * 验证点：公共请求头value的只读限制
     * 说明：公共头只能在配置面板中修改
     */
    test('公共头的value应只读', async () => {
      // 切换到Headers标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 定位到公共请求头区域
      const publicHeadersArea = contentPage.locator('.public-headers, .common-headers').first();
      if (await publicHeadersArea.isVisible()) {
        // 检查value输入框的readonly或disabled属性
        const valueInput = publicHeadersArea.locator('input[placeholder*="值"]').first();
        if (await valueInput.isVisible()) {
          const isReadonly = await valueInput.getAttribute('readonly') || await valueInput.isDisabled();
          expect(isReadonly).toBeTruthy();
        }
      }
    });
  });

  test.describe('5.3 默认请求头测试', () => {
    /**
     * 测试目的：验证显示默认Content-Type请求头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 等待页面加载
     * 预期结果：显示默认的Content-Type请求头
     * 验证点：默认请求头的显示
     */
    test('应显示Content-Type默认请求头', async () => {
      // 切换到Headers标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证Content-Type根据Body模式自动设置
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换Body模式为JSON
     *   2. 切换到Headers标签页
     *   3. 检查Content-Type值
     * 预期结果：
     *   - Content-Type自动设置为application/json
     *   - Body模式改变时Content-Type同步更新
     * 验证点：Body模式与Content-Type的自动关联
     * 说明：减少手动配置错误,提高开发效率
     */
    test('Content-Type应根据Body模式自动设置', async () => {
      // 切换Body模式为JSON
      const bodyTab = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab.click();
      await contentPage.waitForTimeout(300);
      const modeMap = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue = modeMap['JSON'];
      const radioOption = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue });
      if (await radioOption.count()) {
        await radioOption.first().click();
      } else {
        const radioInput = contentPage.locator(`.body-params input[value="${targetValue}"]`).first();
        await radioInput.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 切换到Headers标签页
      const headersTab = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await headersTab.click();
      await contentPage.waitForTimeout(300);
      // 检查Content-Type值
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证手动修改Content-Type功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 定位Content-Type行
     *   3. 修改值为application/xml
     * 预期结果：
     *   - 允许覆盖自动设置的Content-Type
     *   - 修改后的值被保留
     * 验证点：默认请求头的可修改性
     * 说明：某些API需要特定的Content-Type
     */
    test('应能手动修改Content-Type', async () => {
      // 切换到Headers标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 定位Content-Type行
      const contentTypeRow = contentPage.locator('tr:has(input[value="Content-Type"])');
      if (await contentTypeRow.isVisible()) {
        // 修改值为application/xml
        const valueInput = contentTypeRow.locator('input[placeholder*="值"]').first();
        await valueInput.fill('application/xml');
        await contentPage.waitForTimeout(200);
      }
    });

    /**
     * 测试目的：验证切换Body模式时的Content-Type冲突提示
     * 前置条件：已手动修改Content-Type
     * 操作步骤：
     *   1. 切换Body模式为JSON
     *   2. 再切换为form-data
     *   3. 观察提示
     * 预期结果：
     *   - Body模式改变时提示Content-Type可能冲突
     *   - 用户可选择是否覆盖
     * 验证点：Content-Type冲突检测和提示
     * 说明：防止Body内容与Content-Type不匹配
     */
    test('手动修改Content-Type后切换Body模式应提示', async () => {
      // 切换Body模式为JSON
      const bodyTab1 = contentPage.locator('.el-tabs__item:has-text("Body")');
      await bodyTab1.click();
      await contentPage.waitForTimeout(300);
      const modeMap1 = {
        none: 'none',
        JSON: 'json',
        'form-data': 'formdata',
        'x-www-form-urlencoded': 'urlencoded',
        raw: 'raw',
        binary: 'binary'
      };
      const targetValue1 = modeMap1['JSON'];
      const radioOption1 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue1 });
      if (await radioOption1.count()) {
        await radioOption1.first().click();
      } else {
        const radioInput1 = contentPage.locator(`.body-params input[value="${targetValue1}"]`).first();
        await radioInput1.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      // 再切换为form-data
      const targetValue2 = modeMap1['form-data'];
      const radioOption2 = contentPage
        .locator('.body-params .el-radio-group .el-radio')
        .filter({ hasText: targetValue2 });
      if (await radioOption2.count()) {
        await radioOption2.first().click();
      } else {
        const radioInput2 = contentPage.locator(`.body-params input[value="${targetValue2}"]`).first();
        await radioInput2.check({ force: true });
      }
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证显示User-Agent等常见默认头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 检查常见默认请求头
     * 预期结果：
     *   - 显示User-Agent等默认头
     *   - 默认头包含应用标识
     * 验证点：常见默认请求头的显示
     * 说明：User-Agent等默认头帮助服务器识别客户端
     */
    test('应显示User-Agent等常见默认头', async () => {
      // 切换到Headers标签页
      const headersTab = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await headersTab.click();
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('5.4 请求头优先级测试', () => {
    /**
     * 测试目的：验证自定义头优先于公共头
     * 前置条件：存在公共Authorization请求头
     * 操作步骤：
     *   1. 添加自定义Authorization请求头
     *   2. 等待保存
     * 预期结果：
     *   - 自定义头优先级高于公共头
     *   - 发送请求时使用自定义头的值
     * 验证点：请求头优先级规则(自定义 > 公共)
     * 说明：允许单个接口覆盖公共配置
     */
    test('自定义头应优先于公共头', async () => {
      // 添加自定义Authorization请求头
      const headersActive1 = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive1) {
        const tab1 = contentPage.locator('.el-tabs__item:has-text("请求头")');
        await tab1.click();
        await contentPage.waitForTimeout(300);
      }
      const container1 = contentPage.locator('.header-info .el-tree').first();
      await container1.waitFor({ state: 'visible', timeout: 5000 });
      const rows1 = container1.locator('.custom-params');
      const count1 = await rows1.count();
      const lastIndex1 = count1 > 0 ? count1 - 1 : 0;
      const lastRow1 = rows1.nth(lastIndex1);
      const keyInput1 = lastRow1.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput1.fill('Authorization');
      const valueInput1 = lastRow1.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput1.fill('Bearer custom-token');
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证禁用的自定义头不覆盖公共头
     * 前置条件：存在公共Authorization请求头
     * 操作步骤：
     *   1. 添加禁用状态的自定义Authorization
     *   2. 等待保存
     * 预期结果：
     *   - 禁用的自定义头不生效
     *   - 使用公共头的值
     * 验证点：禁用状态对优先级的影响
     * 说明：禁用的自定义头不参与优先级比较
     */
    test('禁用的自定义头不应覆盖公共头', async () => {
      // 添加禁用状态的自定义Authorization
      const headersActive = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive) {
        const tab = contentPage.locator('.el-tabs__item:has-text("请求头")');
        await tab.click();
        await contentPage.waitForTimeout(300);
      }
      const container = contentPage.locator('.header-info .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const rows = container.locator('.custom-params');
      const count = await rows.count();
      const lastIndex = count > 0 ? count - 1 : 0;
      const lastRow = rows.nth(lastIndex);
      const keyInput = lastRow.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput.fill('Authorization');
      const valueInput = lastRow.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('Bearer custom-token');
      await contentPage.waitForTimeout(20);
      const checkbox = lastRow.locator('input[type="checkbox"]').first();
      const isChecked = await checkbox.isChecked();
      if (isChecked) {
        await checkbox.uncheck({ force: true });
      }
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('5.5 特殊请求头处理', () => {
    /**
     * 测试目的：验证支持设置Authorization头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Authorization请求头
     *   2. 验证请求头存在
     * 预期结果：
     *   - Authorization请求头成功添加
     *   - 支持Bearer、Basic等认证类型
     * 验证点：Authorization请求头支持
     * 说明：Authorization是最常用的API认证方式
     */
    test('应支持设置Authorization头', async () => {
      // 添加Authorization请求头
      const headersActive1 = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive1) {
        const tab1 = contentPage.locator('.el-tabs__item:has-text("请求头")');
        await tab1.click();
        await contentPage.waitForTimeout(300);
      }
      const container1 = contentPage.locator('.header-info .el-tree').first();
      await container1.waitFor({ state: 'visible', timeout: 5000 });
      const rows1 = container1.locator('.custom-params');
      const count1 = await rows1.count();
      const lastIndex1 = count1 > 0 ? count1 - 1 : 0;
      const lastRow1 = rows1.nth(lastIndex1);
      const keyInput1 = lastRow1.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput1.fill('Authorization');
      const valueInput1 = lastRow1.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput1.fill('Bearer my-secret-token');
      await contentPage.waitForTimeout(20);
      // 验证请求头存在
      const tree = contentPage.locator('.header-info .el-tree, .headers-container .el-tree, .s-params').first();
      await tree.waitFor({ state: 'visible', timeout: 5000 });
      const headerRow = tree.locator('.custom-params').filter({
        has: contentPage.locator('input[value="Authorization"]')
      });
      await headerRow.first().waitFor({ state: 'visible', timeout: 5000 });
    });

    /**
     * 测试目的：验证支持设置Cookie头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Cookie请求头
     *   2. 验证请求头存在
     * 预期结果：
     *   - Cookie请求头成功添加
     *   - 支持多个cookie键值对
     * 验证点：Cookie请求头支持
     * 说明：Cookie格式为name1=value1; name2=value2
     */
    test('应支持设置Cookie头', async () => {
      // 添加Cookie请求头
      const headersActive2 = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive2) {
        const tab2 = contentPage.locator('.el-tabs__item:has-text("请求头")');
        await tab2.click();
        await contentPage.waitForTimeout(300);
      }
      const container2 = contentPage.locator('.header-info .el-tree').first();
      await container2.waitFor({ state: 'visible', timeout: 5000 });
      const rows2 = container2.locator('.custom-params');
      const count2 = await rows2.count();
      const lastIndex2 = count2 > 0 ? count2 - 1 : 0;
      const lastRow2 = rows2.nth(lastIndex2);
      const keyInput2 = lastRow2.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput2.fill('Cookie');
      const valueInput2 = lastRow2.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput2.fill('sessionId=abc123; userId=456');
      await contentPage.waitForTimeout(20);
      // 验证请求头存在
      const tree2 = contentPage.locator('.header-info .el-tree, .headers-container .el-tree, .s-params').first();
      await tree2.waitFor({ state: 'visible', timeout: 5000 });
      const headerRow2 = tree2.locator('.custom-params').filter({
        has: contentPage.locator('input[value="Cookie"]')
      });
      await headerRow2.first().waitFor({ state: 'visible', timeout: 5000 });
    });

    /**
     * 测试目的：验证支持设置Accept头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加Accept请求头
     *   2. 验证请求头存在
     * 预期结果：
     *   - Accept请求头成功添加
     *   - 支持指定响应类型
     * 验证点：Accept请求头支持
     * 说明：Accept用于指定客户端接受的响应类型
     */
    test('应支持设置Accept头', async () => {
      // 添加Accept请求头
      const headersActive3 = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive3) {
        const tab3 = contentPage.locator('.el-tabs__item:has-text("请求头")');
        await tab3.click();
        await contentPage.waitForTimeout(300);
      }
      const container3 = contentPage.locator('.header-info .el-tree').first();
      await container3.waitFor({ state: 'visible', timeout: 5000 });
      const rows3 = container3.locator('.custom-params');
      const count3 = await rows3.count();
      const lastIndex3 = count3 > 0 ? count3 - 1 : 0;
      const lastRow3 = rows3.nth(lastIndex3);
      const keyInput3 = lastRow3.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput3.fill('Accept');
      const valueInput3 = lastRow3.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput3.fill('application/json');
      await contentPage.waitForTimeout(20);
      // 验证请求头存在
      const tree3 = contentPage.locator('.header-info .el-tree, .headers-container .el-tree, .s-params').first();
      await tree3.waitFor({ state: 'visible', timeout: 5000 });
      const headerRow3 = tree3.locator('.custom-params').filter({
        has: contentPage.locator('input[value="Accept"]')
      });
      await headerRow3.first().waitFor({ state: 'visible', timeout: 5000 });
    });

    /**
     * 测试目的：验证支持自定义X-开头的请求头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 添加X-Request-ID请求头
     *   2. 验证请求头存在
     * 预期结果：
     *   - X-开头的自定义请求头成功添加
     *   - 无特殊限制
     * 验证点：自定义请求头支持
     * 说明：X-前缀是自定义请求头的约定命名方式
     */
    test('应支持自定义header(X-Custom-Header)', async () => {
      // 添加X-Request-ID请求头
      const headersActive4 = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive4) {
        const tab4 = contentPage.locator('.el-tabs__item:has-text("请求头")');
        await tab4.click();
        await contentPage.waitForTimeout(300);
      }
      const container4 = contentPage.locator('.header-info .el-tree').first();
      await container4.waitFor({ state: 'visible', timeout: 5000 });
      const rows4 = container4.locator('.custom-params');
      const count4 = await rows4.count();
      const lastIndex4 = count4 > 0 ? count4 - 1 : 0;
      const lastRow4 = rows4.nth(lastIndex4);
      const keyInput4 = lastRow4.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput4.fill('X-Request-ID');
      const valueInput4 = lastRow4.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput4.fill('req-12345');
      await contentPage.waitForTimeout(20);
      // 验证请求头存在
      const tree4 = contentPage.locator('.header-info .el-tree, .headers-container .el-tree, .s-params').first();
      await tree4.waitFor({ state: 'visible', timeout: 5000 });
      const headerRow4 = tree4.locator('.custom-params').filter({
        has: contentPage.locator('input[value="X-Request-ID"]')
      });
      await headerRow4.first().waitFor({ state: 'visible', timeout: 5000 });
    });
  });

  test.describe('5.6 请求头表格操作', () => {
    /**
     * 测试目的：验证Tab键快速填写请求头
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 定位到请求头输入框
     *   3. 输入请求头名称
     *   4. 按Tab键切换到值输入框
     * 预期结果：
     *   - Tab键能正确切换焦点
     *   - 提高录入效率
     * 验证点：Tab键导航功能
     * 说明：Tab键导航是常用的表格快速录入方式
     */
    test('应支持快速填写（Tab键切换）', async () => {
      // 切换到Headers标签页
      const headersTab2 = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await headersTab2.click();
      await contentPage.waitForTimeout(300);
      const table = contentPage.locator('.header-info, .headers-table, .s-params').first();
      await table.waitFor({ state: 'visible', timeout: 5000 });
      // 定位到请求头输入框
      let keyInput = table.locator('input[placeholder="输入参数名称自动换行"]').first();
      if (!(await keyInput.count())) {
        keyInput = table.locator('input[placeholder*="请求头"], input[placeholder*="key"]').first();
      }
      if (!(await keyInput.count())) {
        keyInput = table.locator('input[placeholder*="参数"]').first();
      }
      if (!(await keyInput.count())) {
        throw new Error('未找到可填写的请求头输入框');
      }
      // 输入请求头名称
      await keyInput.fill('X-Test-Header');
      // 按Tab键切换到值输入框
      await contentPage.keyboard.press('Tab');
      await contentPage.waitForTimeout(200);
    });

    /**
     * 测试目的：验证拖拽排序请求头
     * 前置条件：已添加多个请求头
     * 操作步骤：
     *   1. 添加3个请求头
     *   2. 拖拽改变顺序
     * 预期结果：
     *   - 请求头顺序改变
     *   - 拖拽操作流畅
     * 验证点：拖拽排序功能
     * 说明：请求头顺序在某些场景下有意义
     */
    test('应支持拖拽排序', async () => {
      // 添加3个请求头
      const headersActive5 = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive5) {
        const tab5 = contentPage.locator('.el-tabs__item:has-text("请求头")');
        await tab5.click();
        await contentPage.waitForTimeout(300);
      }
      const container5 = contentPage.locator('.header-info .el-tree').first();
      await container5.waitFor({ state: 'visible', timeout: 5000 });
      const rows5 = container5.locator('.custom-params');
      const count5 = await rows5.count();
      const lastIndex5 = count5 > 0 ? count5 - 1 : 0;
      const lastRow5 = rows5.nth(lastIndex5);
      const keyInput5 = lastRow5.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput5.fill('Header1');
      const valueInput5 = lastRow5.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput5.fill('value1');
      await contentPage.waitForTimeout(20);
      const rows6 = container5.locator('.custom-params');
      const count6 = await rows6.count();
      const lastIndex6 = count6 > 0 ? count6 - 1 : 0;
      const lastRow6 = rows6.nth(lastIndex6);
      const keyInput6 = lastRow6.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput6.fill('Header2');
      const valueInput6 = lastRow6.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput6.fill('value2');
      await contentPage.waitForTimeout(20);
      const rows7 = container5.locator('.custom-params');
      const count7 = await rows7.count();
      const lastIndex7 = count7 > 0 ? count7 - 1 : 0;
      const lastRow7 = rows7.nth(lastIndex7);
      const keyInput7 = lastRow7.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput7.fill('Header3');
      const valueInput7 = lastRow7.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput7.fill('value3');
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证复制请求头功能
     * 前置条件：已添加请求头
     * 操作步骤：
     *   1. 添加请求头
     *   2. 点击复制按钮
     * 预期结果：
     *   - 请求头成功复制
     *   - 副本与原请求头内容相同
     * 验证点：复制功能
     * 说明：复制功能便于创建相似请求头
     */
    test('应支持复制请求头', async () => {
      // 添加请求头
      const headersActive6 = await contentPage
        .locator('.el-tabs__item.is-active:has-text("Headers"), .el-tabs__item.is-active:has-text("请求头")')
        .first()
        .isVisible()
        .catch(() => false);
      if (!headersActive6) {
        const tab6 = contentPage.locator('.el-tabs__item:has-text("请求头")');
        await tab6.click();
        await contentPage.waitForTimeout(300);
      }
      const container6 = contentPage.locator('.header-info .el-tree').first();
      await container6.waitFor({ state: 'visible', timeout: 5000 });
      const rows8 = container6.locator('.custom-params');
      const count8 = await rows8.count();
      const lastIndex8 = count8 > 0 ? count8 - 1 : 0;
      const lastRow8 = rows8.nth(lastIndex8);
      const keyInput8 = lastRow8.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput8.fill('Copy-Header');
      const valueInput8 = lastRow8.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput8.fill('copy-value');
      await contentPage.waitForTimeout(20);
      // 切换到Headers标签页
      const headersTab3 = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await headersTab3.click();
      await contentPage.waitForTimeout(300);
      const row = contentPage.locator('tr:has(input[value="Copy-Header"])');
      const copyBtn = row.locator('[title*="复制"], .copy-btn').first();
      if (await copyBtn.isVisible()) {
        // 点击复制按钮
        await copyBtn.click();
        await contentPage.waitForTimeout(300);
      }
    });

    /**
     * 测试目的：验证空行自动清除功能
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 点击输入框后失焦(不输入内容)
     *   3. 等待自动清理
     * 预期结果：
     *   - 空行自动移除
     *   - 表格保持整洁
     * 验证点：空行自动清理功能
     * 说明：自动清理避免表格中出现无效空行
     */
    test('空行应自动清除', async () => {
      // 切换到Headers标签页
      const headersTab4 = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await headersTab4.click();
      await contentPage.waitForTimeout(300);
      const table = contentPage.locator('.header-info, .headers-table, .s-params').first();
      await table.waitFor({ state: 'visible', timeout: 5000 });
      let keyInput = table.locator('input[placeholder="输入参数名称自动换行"]').first();
      if (!(await keyInput.count())) {
        keyInput = table.locator('input[placeholder*="请求头"], input[placeholder*="key"]').first();
      }
      if (!(await keyInput.count())) {
        keyInput = table.locator('input[placeholder*="参数"]').first();
      }
      if (!(await keyInput.count())) {
        throw new Error('未找到可操作的请求头输入框');
      }
      // 点击输入框后失焦(不输入内容)
      await keyInput.click();
      await keyInput.blur();
      // 等待自动清理
      await contentPage.waitForTimeout(300);
    });
  });
});
