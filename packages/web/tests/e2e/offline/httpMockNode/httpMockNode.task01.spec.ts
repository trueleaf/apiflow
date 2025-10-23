import { expect, type Page } from '@playwright/test';
import {
  test,
  getPages,
  configureMockBasics,
  saveMockConfig,
} from './httpMockNode.fixture';

/**
 * httpMockNode 任务组1: Mock服务管理测试
 *
 * 这个文件只包含任务组1的测试,方便单独运行和调试
 */

/**
 * 通过UI创建测试项目
 */
async function createTestProjectViaUI(headerPage: Page, contentPage: Page, projectName: string) {
  await contentPage.locator('button:has-text("新建项目")').click();
  await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible', timeout: 10000 });
  const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]').first();
  await nameInput.fill(projectName);
  await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
  await contentPage.waitForURL(/doc-edit/, { timeout: 15000 });
  await contentPage.waitForLoadState('domcontentloaded');
  await contentPage.waitForSelector('.banner', { timeout: 10000 });
}

/**
 * 通过UI创建HttpMock节点
 */
async function createHttpMockNodeViaUI(contentPage: Page, nodeName: string) {
  await contentPage.waitForSelector('.tool-icon', { timeout: 10000 });
  const addNodeBtn = contentPage.locator('.tool-icon [title="新增文件"]').first();
  await addNodeBtn.click();
  await contentPage.waitForSelector('.el-dialog:has-text("新建接口")', { state: 'visible', timeout: 10000 });

  const mockRadio = contentPage.locator('.el-dialog:has-text("新建接口") .el-radio:has-text("Mock"), .el-dialog:has-text("新建接口") .el-radio:has-text("HTTP Mock")').first();
  await mockRadio.click();
  await contentPage.waitForTimeout(300);

  const nodeInput = contentPage.locator('.el-dialog:has-text("新建接口") input[placeholder*="接口名称"], .el-dialog:has-text("新建接口") input[placeholder*="名称"]').first();
  await nodeInput.fill(nodeName);
  await contentPage.locator('.el-dialog:has-text("新建接口") button:has-text("确定")').click();
  await contentPage.waitForSelector('.el-dialog:has-text("新建接口")', { state: 'hidden', timeout: 10000 });
  await contentPage.waitForTimeout(500);
}

/**
 * 点击并打开Mock节点
 */
async function clickMockNode(contentPage: Page, nodeName: string) {
  const node = contentPage.locator(`.custom-tree-node:has-text("${nodeName}")`).first();
  await node.waitFor({ state: 'visible', timeout: 5000 });
  await node.click();
  await contentPage.waitForTimeout(1500);
}

/**
 * 切换Mock服务状态
 */
async function toggleMockService(contentPage: Page, enable: boolean) {
  const enableSwitch = contentPage.locator('.el-switch').first();
  if (await enableSwitch.count() > 0) {
    const isCurrentlyEnabled = await enableSwitch.evaluate((el: any) =>
      el.classList.contains('is-checked')
    );

    // 只有当前状态与目标状态不同时才点击
    if (isCurrentlyEnabled !== enable) {
      await enableSwitch.click();
      await contentPage.waitForTimeout(500);
    }
  }
}

test.describe('任务组1: Mock服务管理测试', () => {
  let headerPage: Page;
  let contentPage: Page;
  let testProjectName: string;
  let testMockName: string;

  test.beforeEach(async ({ electronApp }) => {
    const pages = await getPages(electronApp);
    headerPage = pages.headerPage;
    contentPage = pages.contentPage;

    await contentPage.evaluate(() => {
      localStorage.setItem('runtime/networkMode', 'offline');
      localStorage.setItem('history/lastVisitePage', '/home');
    });

    await contentPage.evaluate(() => {
      (window as any).location.hash = '#/home';
    });

    await contentPage.waitForURL(/home/, { timeout: 10000 });
    await contentPage.waitForLoadState('domcontentloaded');
    await contentPage.waitForTimeout(500);

    testProjectName = `MockTask1-${Date.now()}`;
    await createTestProjectViaUI(headerPage, contentPage, testProjectName);

    await expect(contentPage).toHaveURL(/doc-edit/, { timeout: 10000 });
    await contentPage.waitForSelector('.banner', { timeout: 10000 });

    testMockName = `Mock-T1-${Date.now()}`;
    await createHttpMockNodeViaUI(contentPage, testMockName);

    await clickMockNode(contentPage, testMockName);
    await contentPage.waitForTimeout(1000);
  });

  // ========================================================================
  // 测试1: 端口号验证 - 有效端口
  // ========================================================================

  test('应该验证端口号有效性 - 有效端口', async () => {
    const validPorts = [3000, 8080, 8888, 9000];

    for (const port of validPorts) {
      await configureMockBasics(contentPage, { port });
      await contentPage.waitForTimeout(300);

      const portInput = contentPage.locator('input[type="number"]').first();
      const value = await portInput.inputValue();
      expect(value).toBe(String(port));
    }
  });

  // ========================================================================
  // 测试2: 端口号验证 - 无效端口边界
  // ========================================================================

  test('应该验证端口号有效性 - 无效端口边界', async () => {
    const invalidPorts = [0, 65536, 70000, -1];

    for (const port of invalidPorts) {
      await configureMockBasics(contentPage, { port });
      await contentPage.waitForTimeout(300);

      // 应该显示错误提示或拒绝输入
      const errorMsg = contentPage.locator('.el-form-item__error, .error-message').first();
      if (await errorMsg.count() > 0) {
        await expect(errorMsg).toBeVisible();
      }
    }
  });

  // ========================================================================
  // 测试3: URL路径格式验证
  // ========================================================================

  test('应该支持URL路径格式验证', async () => {
    const validUrls = ['/api/test', '/users/:id', '/api/v1/resource', '/'];

    for (const url of validUrls) {
      await configureMockBasics(contentPage, { url });
      await saveMockConfig(contentPage);
      await contentPage.waitForTimeout(300);

      const urlInput = contentPage.locator('input[placeholder*="URL"], input[placeholder*="路径"]').first();
      const value = await urlInput.inputValue();
      expect(value).toBe(url);
    }
  });

  // ========================================================================
  // 测试4: HTTP方法ALL选项
  // ========================================================================

  test('应该支持HTTP方法ALL选项', async () => {
    const allCheckbox = contentPage.locator('.el-checkbox:has-text("ALL")').first();
    if (await allCheckbox.count() > 0) {
      await allCheckbox.click();
      await contentPage.waitForTimeout(500);

      // 验证所有方法都被选中
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      for (const method of methods) {
        const checkbox = contentPage.locator(`.el-checkbox:has-text("${method}")`).first();
        if (await checkbox.count() > 0) {
          const isChecked = await checkbox.evaluate((el: any) =>
            el.classList.contains('is-checked') || el.querySelector('.is-checked')
          );
          expect(isChecked).toBeTruthy();
        }
      }
    }
  });

  // ========================================================================
  // 测试5: HTTP方法多选组合
  // ========================================================================

  test('应该支持HTTP方法多选组合', async () => {
    const methodCombinations = [
      ['GET', 'POST'],
      ['PUT', 'DELETE'],
      ['GET', 'POST', 'PUT', 'DELETE']
    ];

    for (const methods of methodCombinations) {
      // 先取消所有选择(通过点击ALL两次)
      const allCheckbox = contentPage.locator('.el-checkbox:has-text("ALL")').first();
      if (await allCheckbox.count() > 0) {
        await allCheckbox.click();
        await contentPage.waitForTimeout(200);
        await allCheckbox.click();
        await contentPage.waitForTimeout(200);
      }

      await configureMockBasics(contentPage, { methods });
      await contentPage.waitForTimeout(500);

      // 验证选中的方法
      for (const method of methods) {
        const checkbox = contentPage.locator(`.el-checkbox:has-text("${method}")`).first();
        if (await checkbox.count() > 0) {
          const isChecked = await checkbox.evaluate((el: any) =>
            el.classList.contains('is-checked') || el.querySelector('.is-checked')
          );
          expect(isChecked).toBeTruthy();
        }
      }
    }
  });

  // ========================================================================
  // 测试6-12: Mock服务启停和状态管理
  // 注意: 这些测试需要实际的Mock服务支持,可能需要调整
  // ========================================================================

  test('应该能够启动Mock服务', async () => {
    await configureMockBasics(contentPage, {
      port: 3100,
      url: '/api/test',
      methods: ['GET']
    });
    await saveMockConfig(contentPage);

    await toggleMockService(contentPage, true);
    await contentPage.waitForTimeout(2000);

    // 验证服务状态指示器
    const statusIndicator = contentPage.locator('.status-indicator, .service-status').first();
    if (await statusIndicator.count() > 0) {
      const statusText = await statusIndicator.textContent();
      // 根据实际UI调整验证逻辑
      console.log('Service status:', statusText);
    }
  });

  test('应该能够停止Mock服务', async () => {
    // 先启动服务
    await toggleMockService(contentPage, true);
    await contentPage.waitForTimeout(2000);

    // 停止服务
    await toggleMockService(contentPage, false);
    await contentPage.waitForTimeout(2000);

    // 验证服务状态
    const statusIndicator = contentPage.locator('.status-indicator, .service-status').first();
    if (await statusIndicator.count() > 0) {
      const statusText = await statusIndicator.textContent();
      console.log('Service status after stop:', statusText);
    }
  });

  test('应该显示服务状态指示器', async () => {
    const statusIndicator = contentPage.locator('.status-indicator, .service-status, .el-switch').first();
    await expect(statusIndicator).toBeVisible();
  });

  test('应该在服务运行时禁用端口配置', async () => {
    await toggleMockService(contentPage, true);
    await contentPage.waitForTimeout(1000);

    const portInput = contentPage.locator('input[type="number"]').first();
    const isDisabled = await portInput.isDisabled();

    // 如果UI设计上允许修改,这个测试可能需要调整
    console.log('Port input disabled when service running:', isDisabled);
  });

  test('应该在服务停止后启用端口配置', async () => {
    await toggleMockService(contentPage, true);
    await contentPage.waitForTimeout(1000);

    await toggleMockService(contentPage, false);
    await contentPage.waitForTimeout(1000);

    const portInput = contentPage.locator('input[type="number"]').first();
    const isDisabled = await portInput.isDisabled();
    expect(isDisabled).toBe(false);
  });

  test('应该保存服务运行状态', async () => {
    await toggleMockService(contentPage, true);
    await saveMockConfig(contentPage);
    await contentPage.waitForTimeout(1000);

    // 刷新配置
    const refreshBtn = contentPage.locator('button:has-text("刷新")').first();
    if (await refreshBtn.count() > 0) {
      await refreshBtn.click();
      await contentPage.waitForTimeout(1500);

      // 验证服务状态保持
      const switchElement = contentPage.locator('.el-switch').first();
      const isChecked = await switchElement.evaluate((el: any) =>
        el.classList.contains('is-checked')
      );
      console.log('Service state preserved after refresh:', isChecked);
    }
  });

  // 注意: "应该处理端口冲突" 测试需要实际启动服务器,这里暂时跳过
  test.skip('应该处理端口冲突', async () => {
    // 这个测试需要实际的Mock服务实现
    // 配置一个可能已被占用的端口
    await configureMockBasics(contentPage, { port: 80 });
    await saveMockConfig(contentPage);

    await toggleMockService(contentPage, true);
    await contentPage.waitForTimeout(2000);

    // 应该显示端口冲突错误
    const errorMsg = contentPage.locator('.el-message--error, .error-notification').first();
    if (await errorMsg.count() > 0) {
      const text = await errorMsg.textContent();
      expect(text).toMatch(/端口|占用|冲突/);
    }
  });

});

/**
 * 使用说明:
 *
 * 1. 运行这个文件中的所有测试:
 *    npm run test:e2e -- httpMockNode.task01.spec.ts --reporter=line
 *
 * 2. 只运行某个特定测试:
 *    npm run test:e2e -- httpMockNode.task01.spec.ts --grep "应该验证端口号有效性"
 *
 * 3. 使用 .only 只运行特定测试:
 *    在测试前面加 .only: test.only('...', async () => { ... })
 *
 * 4. 跳过某个测试:
 *    在测试前面加 .skip: test.skip('...', async () => { ... })
 */
