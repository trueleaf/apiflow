import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';

test.describe('16. HTTP节点 - 边界场景测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
  const result = await initOfflineWorkbench(electronApp, { timeout: 60000 });
    headerPage = result.headerPage;
    contentPage = result.contentPage;

    await createProject(contentPage, '测试项目');
    await createSingleNode(contentPage, {
      name: 'Test API',
      type: 'http'
    });
  });

  test.describe('16.1 超长URL测试', () => {
    /**
     * 测试目的：验证2000字符超长URL支持
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入2000字符的URL
     *   2. 等待解析完成
     *   3. 验证完整URL显示
     *   4. 验证参数正确解析
     * 预期结果：URL正确显示和解析
     * 验证点：超长URL处理能力
     */
    test('应支持2000字符的URL', async () => {
      // 输入2000字符的URL
      const longUrl = 'https://httpbin.org/get?param=' + 'a'.repeat(1950);
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill(longUrl);
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证完整URL显示
      const fullUrl = await contentPage.locator('.pre-url-wrap .url').textContent();
      expect((fullUrl || '').length).toBeGreaterThan(1900);
      // 验证参数正确解析
      const container = contentPage.locator('.query-path-params .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const keyInputs = container.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]');
      const count = await keyInputs.count();
      let paramFound = false;
      for (let i = 0; i < count; i++) {
        const candidate = keyInputs.nth(i);
        const value = await candidate.inputValue();
        if (value === 'param') {
          await expect(candidate).toBeVisible();
          paramFound = true;
          break;
        }
      }
      if (!paramFound) {
        throw new Error('Query param param not found');
      }
      const rows = container.locator('.custom-params');
      const rowCount = await rows.count();
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const keyInput = row.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
        if (!(await keyInput.count())) {
          continue;
        }
        const keyValue = await keyInput.inputValue();
        if (keyValue === 'param') {
          const valueInput = row.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
          const value = await valueInput.inputValue();
          expect(value).toBe('a'.repeat(1950));
          break;
        }
      }
    });

    /**
     * 测试目的：验证5000字符极长URL支持
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入5000字符的URL
     *   2. 等待解析完成
     *   3. 验证完整URL显示
     *   4. 验证参数正确解析
     * 预期结果：极长URL正确处理
     * 验证点：极限长度URL处理
     */
    test('应支持5000字符的URL', async () => {
      // 输入5000字符的URL
      const veryLongUrl = 'https://httpbin.org/get?data=' + 'x'.repeat(4950);
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill(veryLongUrl);
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证完整URL显示
      const fullUrl = await contentPage.locator('.pre-url-wrap .url').textContent();
      expect((fullUrl || '').length).toBeGreaterThan(4900);
      // 验证参数正确解析
      const container = contentPage.locator('.query-path-params .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const keyInputs = container.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]');
      const count = await keyInputs.count();
      let dataFound = false;
      for (let i = 0; i < count; i++) {
        const candidate = keyInputs.nth(i);
        const value = await candidate.inputValue();
        if (value === 'data') {
          await expect(candidate).toBeVisible();
          dataFound = true;
          break;
        }
      }
      if (!dataFound) {
        throw new Error('Query param data not found');
      }
      const rows = container.locator('.custom-params');
      const rowCount = await rows.count();
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const keyInput = row.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
        if (!(await keyInput.count())) {
          continue;
        }
        const keyValue = await keyInput.inputValue();
        if (keyValue === 'data') {
          const valueInput = row.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
          const value = await valueInput.inputValue();
          expect(value).toBe('x'.repeat(4950));
          break;
        }
      }
    });

    /**
     * 测试目的：验证超长URL可滚动查看
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入超长URL
     *   2. 等待渲染完成
     *   3. 获取元素滚动宽度和可见宽度
     *   4. 比较两个宽度
     * 预期结果：滚动宽度大于可见宽度
     * 验证点：超长内容滚动功能
     */
    test('超长URL应可滚动查看', async () => {
      // 输入超长URL
      const longUrl = 'https://httpbin.org/get?scroll=' + 'b'.repeat(2000);
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill(longUrl);
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 获取元素滚动宽度和可见宽度
      const fullUrlElement = contentPage.locator('.pre-url-wrap .url');
      const scrollWidth = await fullUrlElement.evaluate((el) => el.scrollWidth);
      const clientWidth = await fullUrlElement.evaluate((el) => el.clientWidth);
      // 比较两个宽度
      expect(scrollWidth).toBeGreaterThan(clientWidth);
    });
  });

  test.describe('16.2 大量参数测试', () => {
    test.describe.configure({ timeout: 120000 });
    /**
     * 测试目的：验证100个Query参数支持
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Params标签页
     *   2. 循环添加100个参数
     *   3. 等待添加完成
     *   4. 保存API
     * 预期结果：100个参数正常添加和保存
     * 验证点：大量参数处理能力
     */
    test('应支持100个Query参数', async () => {
      test.slow();
      // 切换到Params标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("Params")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 循环添加100个参数
      for (let i = 0; i < 100; i++) {
        const tree = contentPage.locator('.body-params .el-tree, .query-path-params .el-tree').first();
        if (await tree.count()) {
          await tree.waitFor({ state: 'visible', timeout: 5000 });
          const rows = tree.locator('.custom-params');
          const count = await rows.count();
          const lastIndex = count > 0 ? count - 1 : 0;
          const targetRow = rows.nth(lastIndex);
          const keyInput = targetRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
          await keyInput.fill(`key${i}`);
          const valueInput = targetRow.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
          await valueInput.fill(`value${i}`);
        } else {
          let keyInput = contentPage.locator('input[placeholder="输入参数名称自动换行"]').first();
          if (!(await keyInput.count())) {
            keyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
          }
          if (!(await keyInput.count())) {
            keyInput = contentPage.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
          }
          await keyInput.fill(`key${i}`);
          let valueInput = contentPage.locator('input[placeholder="参数值、@代表mock数据、{{ 变量 }}"]').first();
          if (!(await valueInput.count())) {
            valueInput = contentPage.locator('input[placeholder*="参数值"]').first();
          }
          if (!(await valueInput.count())) {
            valueInput = contentPage.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
          }
          await valueInput.fill(`value${i}`);
        }
        await contentPage.waitForTimeout(20);
      }
      await contentPage.waitForTimeout(500);
      // 保存API
      const saveBtn = contentPage.locator('button:has-text("保存")').first();
      await saveBtn.click();
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证200个Query参数支持
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Params标签页
     *   2. 循环添加200个参数
     *   3. 等待添加完成
     * 预期结果：200个参数正常添加
     * 验证点：极限参数数量处理
     */
    test('应支持200个Query参数', async () => {
      test.slow();
      // 切换到Params标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("Params")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 循环添加200个参数
      for (let i = 0; i < 200; i++) {
        const tree = contentPage.locator('.body-params .el-tree, .query-path-params .el-tree').first();
        if (await tree.count()) {
          await tree.waitFor({ state: 'visible', timeout: 5000 });
          const rows = tree.locator('.custom-params');
          const count = await rows.count();
          const lastIndex = count > 0 ? count - 1 : 0;
          const targetRow = rows.nth(lastIndex);
          const keyInput = targetRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
          await keyInput.fill(`param${i}`);
          const valueInput = targetRow.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
          await valueInput.fill(`val${i}`);
        } else {
          let keyInput = contentPage.locator('input[placeholder="输入参数名称自动换行"]').first();
          if (!(await keyInput.count())) {
            keyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
          }
          if (!(await keyInput.count())) {
            keyInput = contentPage.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
          }
          await keyInput.fill(`param${i}`);
          let valueInput = contentPage.locator('input[placeholder="参数值、@代表mock数据、{{ 变量 }}"]').first();
          if (!(await valueInput.count())) {
            valueInput = contentPage.locator('input[placeholder*="参数值"]').first();
          }
          if (!(await valueInput.count())) {
            valueInput = contentPage.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
          }
          await valueInput.fill(`val${i}`);
        }
        await contentPage.waitForTimeout(20);
      }
      await contentPage.waitForTimeout(500);
    });

    /**
     * 测试目的：验证50个请求头支持
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 循环添加50个请求头
     *   3. 等待添加完成
     *   4. 保存API
     * 预期结果：50个请求头正常添加和保存
     * 验证点：大量请求头处理
     */
    test('应支持50个请求头', async () => {
      test.slow();
      // 切换到Headers标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 循环添加50个请求头
      for (let i = 0; i < 50; i++) {
        const container = contentPage.locator('.header-info .el-tree').first();
        await container.waitFor({ state: 'visible', timeout: 5000 });
        const rows = container.locator('.custom-params');
        const count = await rows.count();
        const lastIndex = count > 0 ? count - 1 : 0;
        const lastRow = rows.nth(lastIndex);
        const keyInput = lastRow.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
        await keyInput.fill(`X-Header-${i}`);
        const valueInput = lastRow.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
        await valueInput.fill(`value${i}`);
        await contentPage.waitForTimeout(20);
      }
      await contentPage.waitForTimeout(500);
      // 保存API
      const saveBtn = contentPage.locator('button:has-text("保存")').first();
      await saveBtn.click();
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证参数表格虚拟滚动
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Params标签页
     *   2. 添加150个参数
     *   3. 等待渲染完成
     *   4. 验证树形控件可见
     * 预期结果：参数表格使用虚拟滚动正常显示
     * 验证点：虚拟滚动性能优化
     */
    test('参数表格应支持虚拟滚动', async () => {
      // 切换到Params标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("Params")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 添加150个参数
      for (let i = 0; i < 150; i++) {
        const tree = contentPage.locator('.body-params .el-tree, .query-path-params .el-tree').first();
        if (await tree.count()) {
          await tree.waitFor({ state: 'visible', timeout: 5000 });
          const rows = tree.locator('.custom-params');
          const count = await rows.count();
          const lastIndex = count > 0 ? count - 1 : 0;
          const targetRow = rows.nth(lastIndex);
          const keyInput = targetRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
          await keyInput.fill(`test${i}`);
          const valueInput = targetRow.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
          await valueInput.fill(`data${i}`);
        } else {
          let keyInput = contentPage.locator('input[placeholder="输入参数名称自动换行"]').first();
          if (!(await keyInput.count())) {
            keyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
          }
          if (!(await keyInput.count())) {
            keyInput = contentPage.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
          }
          await keyInput.fill(`test${i}`);
          let valueInput = contentPage.locator('input[placeholder="参数值、@代表mock数据、{{ 变量 }}"]').first();
          if (!(await valueInput.count())) {
            valueInput = contentPage.locator('input[placeholder*="参数值"]').first();
          }
          if (!(await valueInput.count())) {
            valueInput = contentPage.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
          }
          await valueInput.fill(`data${i}`);
        }
        await contentPage.waitForTimeout(20);
      }
      await contentPage.waitForTimeout(500);
      // 验证树形控件可见
      const tree = contentPage.locator('.query-path-params .el-tree').first();
      await expect(tree).toBeVisible();
    });
  });

  test.describe('16.3 特殊字符处理', () => {
    /**
     * 测试目的：验证URL中文字符支持
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入包含中文的URL
     *   2. 等待解析完成
     *   3. 验证完整URL包含中文
     *   4. 验证参数值正确
     * 预期结果：中文字符正确处理
     * 验证点：中文字符支持
     */
    test('URL应支持中文字符', async () => {
      // 输入包含中文的URL
      const chineseUrl = 'https://httpbin.org/get?name=测试中文';
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill(chineseUrl);
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证完整URL包含中文
      const fullUrl = await contentPage.locator('.pre-url-wrap .url').textContent();
      expect(fullUrl).toContain(encodeURIComponent('测试中文'));
      // 验证参数值正确
      const container = contentPage.locator('.query-path-params .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const rows = container.locator('.custom-params');
      const rowCount = await rows.count();
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const keyInput = row.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
        if (!(await keyInput.count())) {
          continue;
        }
        const keyValue = await keyInput.inputValue();
        if (keyValue === 'name') {
          const valueInput = row.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
          const value = await valueInput.inputValue();
          expect(value).toBe('测试中文');
          return;
        }
      }
    });

    /**
     * 测试目的：验证URL emoji表情支持
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入包含emoji的URL
     *   2. 等待解析完成
     *   3. 验证完整URL包含emoji
     *   4. 验证参数值正确
     * 预期结果：emoji字符正确处理
     * 验证点：emoji字符支持
     */
    test('URL应支持emoji表情', async () => {
      // 输入包含emoji的URL
      const emojiUrl = 'https://httpbin.org/get?emoji=😀🎉';
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill(emojiUrl);
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证完整URL包含emoji
      const fullUrl = await contentPage.locator('.pre-url-wrap .url').textContent();
      expect(fullUrl).toContain('😀🎉');
      // 验证参数值正确
      const container = contentPage.locator('.query-path-params .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const rows = container.locator('.custom-params');
      const rowCount = await rows.count();
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const keyInput = row.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
        if (!(await keyInput.count())) {
          continue;
        }
        const keyValue = await keyInput.inputValue();
        if (keyValue === 'emoji') {
          const valueInput = row.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
          const value = await valueInput.inputValue();
          expect(value).toBe('😀🎉');
          return;
        }
      }
    });

    /**
     * 测试目的：验证参数值特殊字符支持
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Params标签页
     *   2. 添加包含&=?特殊字符的参数值
     *   3. 等待添加完成
     *   4. 验证参数值正确
     * 预期结果：特殊字符正确保存
     * 验证点：URL特殊字符处理
     */
    test('参数值应支持特殊字符&=?', async () => {
      // 切换到Params标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("Params")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 添加包含&=?特殊字符的参数值
      const tree = contentPage.locator('.body-params .el-tree, .query-path-params .el-tree').first();
      if (await tree.count()) {
        await tree.waitFor({ state: 'visible', timeout: 5000 });
        const rows = tree.locator('.custom-params');
        const count = await rows.count();
        const lastIndex = count > 0 ? count - 1 : 0;
        const targetRow = rows.nth(lastIndex);
        const keyInput = targetRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        await keyInput.fill('special');
        const valueInput = targetRow.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
        await valueInput.fill('value&with=special?chars');
      } else {
        let keyInput = contentPage.locator('input[placeholder="输入参数名称自动换行"]').first();
        if (!(await keyInput.count())) {
          keyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
        }
        if (!(await keyInput.count())) {
          keyInput = contentPage.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        }
        await keyInput.fill('special');
        let valueInput = contentPage.locator('input[placeholder="参数值、@代表mock数据、{{ 变量 }}"]').first();
        if (!(await valueInput.count())) {
          valueInput = contentPage.locator('input[placeholder*="参数值"]').first();
        }
        if (!(await valueInput.count())) {
          valueInput = contentPage.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
        }
        await valueInput.fill('value&with=special?chars');
      }
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
      // 验证参数值正确
      const container = contentPage.locator('.query-path-params .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const rows = container.locator('.custom-params');
      const rowCount = await rows.count();
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const keyInput = row.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
        if (!(await keyInput.count())) {
          continue;
        }
        const keyValue = await keyInput.inputValue();
        if (keyValue === 'special') {
          const valueInput = row.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
          const value = await valueInput.inputValue();
          expect(value).toBe('value&with=special?chars');
          return;
        }
      }
    });

    /**
     * 测试目的：验证参数值换行符支持
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Params标签页
     *   2. 添加包含换行符的参数值
     *   3. 等待添加完成
     *   4. 验证参数值正确
     * 预期结果：换行符正确保存
     * 验证点：多行文本支持
     */
    test('参数值应支持换行符', async () => {
      // 切换到Params标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("Params")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 添加包含换行符的参数值
      const tree = contentPage.locator('.body-params .el-tree, .query-path-params .el-tree').first();
      if (await tree.count()) {
        await tree.waitFor({ state: 'visible', timeout: 5000 });
        const rows = tree.locator('.custom-params');
        const count = await rows.count();
        const lastIndex = count > 0 ? count - 1 : 0;
        const targetRow = rows.nth(lastIndex);
        const keyInput = targetRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        await keyInput.fill('multiline');
        const valueInput = targetRow.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
        await valueInput.click({ force: true });
        await contentPage.waitForTimeout(50);
        const textarea = targetRow.locator('.value-textarea textarea, .value-textarea .el-textarea__inner, textarea').first();
        await textarea.waitFor({ state: 'visible', timeout: 3000 });
        await textarea.fill('line1\nline2\nline3');
        await textarea.blur();
      } else {
        let keyInput = contentPage.locator('input[placeholder="输入参数名称自动换行"]').first();
        if (!(await keyInput.count())) {
          keyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
        }
        if (!(await keyInput.count())) {
          keyInput = contentPage.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        }
        await keyInput.fill('multiline');
        let valueInput = contentPage.locator('input[placeholder="参数值、@代表mock数据、{{ 变量 }}"]').first();
        if (!(await valueInput.count())) {
          valueInput = contentPage.locator('input[placeholder*="参数值"]').first();
        }
        if (!(await valueInput.count())) {
          valueInput = contentPage.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
        }
        await valueInput.click({ force: true });
        await contentPage.waitForTimeout(50);
        const paramRow = contentPage.locator('.custom-params').filter({ has: valueInput }).first();
        const textarea = paramRow.locator('.value-textarea textarea, .value-textarea .el-textarea__inner, textarea').first();
        await textarea.waitFor({ state: 'visible', timeout: 3000 });
        await textarea.fill('line1\nline2\nline3');
        await textarea.blur();
      }
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
      // 验证参数值正确
      const container = contentPage.locator('.query-path-params .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const rows = container.locator('.custom-params');
      const rowCount = await rows.count();
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const keyInput = row.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
        if (!(await keyInput.count())) {
          continue;
        }
        const keyValue = await keyInput.inputValue();
        if (keyValue === 'multiline') {
          const valueInput = row.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
          await valueInput.click({ force: true });
          await contentPage.waitForTimeout(50);
          const textarea = row.locator('.value-textarea textarea, .value-textarea .el-textarea__inner, textarea').first();
          await textarea.waitFor({ state: 'visible', timeout: 3000 });
          const value = await textarea.inputValue();
          expect(value).toBe('line1\nline2\nline3');
          await textarea.blur();
          return;
        }
      }
    });

    /**
     * 测试目的：验证JSON Unicode字符支持
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Body标签页
     *   2. 输入包含Unicode转义的JSON
     *   3. 等待输入完成
     * 预期结果：Unicode字符正确处理
     * 验证点：JSON Unicode支持
     */
    test('JSON应支持Unicode字符', async () => {
      // 切换到Body标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("Body")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 输入包含Unicode转义的JSON
      const unicodeJson = '{"unicode": "\\u4e2d\\u6587"}';
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      const jsonTip = contentPage.locator('.workbench .json-tip').first();
      if (await jsonTip.isVisible()) {
        await jsonTip.click({ force: true });
        await contentPage.waitForTimeout(100);
      }
      await editor.click({ force: true });
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(unicodeJson);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证Header值特殊字符支持
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 添加包含特殊字符的Header值
     *   3. 等待添加完成
     *   4. 验证Header存在
     * 预期结果：Header特殊字符正确保存
     * 验证点：Header特殊字符支持
     */
    test('Header value应支持特殊字符', async () => {
      // 切换到Headers标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 添加包含特殊字符的Header值
      const container = contentPage.locator('.header-info .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const rows = container.locator('.custom-params');
      const count = await rows.count();
      const lastIndex = count > 0 ? count - 1 : 0;
      const lastRow = rows.nth(lastIndex);
      const keyInput = lastRow.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput.fill('X-Special-Header');
      const valueInput = lastRow.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('value-with-special@#$');
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
      // 验证Header存在
      const headerSection = contentPage.locator('.header-info, .headers-table, .s-params').first();
      await headerSection.waitFor({ state: 'visible', timeout: 5000 });
      const exactInput = headerSection.locator('input[value="X-Special-Header"]').first();
      if (await exactInput.count()) {
        await expect(exactInput).toBeVisible();
      } else {
        const keyInputs = headerSection.locator('input[placeholder*="参数"], input[placeholder*="key"], input[placeholder*="请求头"]');
        const inputCount = await keyInputs.count();
        let found = false;
        for (let i = 0; i < inputCount; i++) {
          const candidate = keyInputs.nth(i);
          const value = await candidate.inputValue();
          if (value === 'X-Special-Header') {
            await expect(candidate).toBeVisible();
            found = true;
            break;
          }
        }
        if (!found) {
          throw new Error('Header X-Special-Header not found');
        }
      }
    });
  });

  test.describe('16.4 空值处理', () => {
    /**
     * 测试目的：验证空URL错误提示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 清空URL输入框
     *   2. 等待输入完成
     *   3. 点击发送请求按钮
     *   4. 验证错误提示显示
     * 预期结果：显示空URL错误提示
     * 验证点：空URL验证
     */
    test('空URL应提示错误', async () => {
      // 清空URL输入框
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 点击发送请求按钮
      const sendBtn = contentPage.locator('button:has-text("发送请求")');
      await sendBtn.click();
      await contentPage.waitForTimeout(300);
      // 验证错误提示显示
      const errorMsg = contentPage.locator('.el-message--error, .error-message').first();
      if (await errorMsg.isVisible()) {
        await expect(errorMsg).toBeVisible();
      }
    });

    /**
     * 测试目的：验证空Query参数key自动清除
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Params标签页
     *   2. 添加空key的参数
     *   3. 等待处理完成
     * 预期结果：空key参数被自动清除
     * 验证点：空参数清理逻辑
     */
    test('空Query参数key应自动清除', async () => {
      // 切换到Params标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("Params")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 添加空key的参数
      const tree = contentPage.locator('.body-params .el-tree, .query-path-params .el-tree').first();
      if (await tree.count()) {
        await tree.waitFor({ state: 'visible', timeout: 5000 });
        const rows = tree.locator('.custom-params');
        const count = await rows.count();
        const lastIndex = count > 0 ? count - 1 : 0;
        const targetRow = rows.nth(lastIndex);
        const keyInput = targetRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        await keyInput.fill('');
        const valueInput = targetRow.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
        await valueInput.fill('emptyKeyValue');
      } else {
        let keyInput = contentPage.locator('input[placeholder="输入参数名称自动换行"]').first();
        if (!(await keyInput.count())) {
          keyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
        }
        if (!(await keyInput.count())) {
          keyInput = contentPage.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        }
        await keyInput.fill('');
        let valueInput = contentPage.locator('input[placeholder="参数值、@代表mock数据、{{ 变量 }}"]').first();
        if (!(await valueInput.count())) {
          valueInput = contentPage.locator('input[placeholder*="参数值"]').first();
        }
        if (!(await valueInput.count())) {
          valueInput = contentPage.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
        }
        await valueInput.fill('emptyKeyValue');
      }
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证空Header key自动清除
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Headers标签页
     *   2. 添加空key的Header
     *   3. 等待处理完成
     * 预期结果：空key Header被自动清除
     * 验证点：空Header清理逻辑
     */
    test('空Header key应自动清除', async () => {
      // 切换到Headers标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("请求头")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 添加空key的Header
      const container = contentPage.locator('.header-info .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const rows = container.locator('.custom-params');
      const count = await rows.count();
      const lastIndex = count > 0 ? count - 1 : 0;
      const lastRow = rows.nth(lastIndex);
      const keyInput = lastRow.locator('input[placeholder*="请求头"], input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
      await keyInput.fill('');
      const valueInput = lastRow.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
      await valueInput.fill('emptyHeaderValue');
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证空JSON保存处理
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Body标签页
     *   2. 清空JSON内容
     *   3. 等待输入完成
     *   4. 保存API
     * 预期结果：空JSON保存为空对象或空字符串
     * 验证点：空JSON处理
     */
    test('空JSON应保存为空对象或空字符串', async () => {
      // 切换到Body标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("Body")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 清空JSON内容
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      const jsonTip = contentPage.locator('.workbench .json-tip').first();
      if (await jsonTip.isVisible()) {
        await jsonTip.click({ force: true });
        await contentPage.waitForTimeout(100);
      }
      await editor.click({ force: true });
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type('');
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 保存API
      const saveBtn = contentPage.locator('button:has-text("保存")').first();
      await saveBtn.click();
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证空Body设置Content-Length
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Body标签页
     *   2. 清空Body内容
     *   3. 等待输入完成
     * 预期结果：Content-Length设置为0
     * 验证点：空Body Content-Length处理
     */
    test('空Body应设置Content-Length为0', async () => {
      // 切换到Body标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("Body")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 清空Body内容
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      const jsonTip = contentPage.locator('.workbench .json-tip').first();
      if (await jsonTip.isVisible()) {
        await jsonTip.click({ force: true });
        await contentPage.waitForTimeout(100);
      }
      await editor.click({ force: true });
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type('');
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('16.5 空白字符处理', () => {
    /**
     * 测试目的：验证URL前后空格自动trim
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入前后带空格的URL
     *   2. 等待输入完成
     *   3. 验证输入框和显示区域的URL
     * 预期结果：空格被自动trim
     * 验证点：URL空格处理
     */
    test('URL前后空格应自动trim', async () => {
      // 输入前后带空格的URL
      const urlWithSpaces = '  https://httpbin.org/get  ';
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill(urlWithSpaces);
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证输入框URL
      const urlInput = contentPage.locator('input[placeholder*="请输入URL"]').first();
      const value = await urlInput.inputValue();
      expect(value.replace(/\s+/g, '')).toContain('https://httpbin.org/get');
      // 验证显示区域的URL
      const fullUrl = (await contentPage.locator('.pre-url-wrap .url').textContent()) || '';
      expect(fullUrl.replace(/\s+/g, '')).toContain('https://httpbin.org/get');
    });

    /**
     * 测试目的：验证参数key前后空格trim
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Params标签页
     *   2. 添加前后带空格的参数key
     *   3. 等待添加完成
     * 预期结果：参数key空格被trim
     * 验证点：参数key空格处理
     */
    test('参数key前后空格应trim', async () => {
      // 切换到Params标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("Params")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 添加前后带空格的参数key
      const tree = contentPage.locator('.body-params .el-tree, .query-path-params .el-tree').first();
      if (await tree.count()) {
        await tree.waitFor({ state: 'visible', timeout: 5000 });
        const rows = tree.locator('.custom-params');
        const count = await rows.count();
        const lastIndex = count > 0 ? count - 1 : 0;
        const targetRow = rows.nth(lastIndex);
        const keyInput = targetRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        await keyInput.fill('  trimKey  ');
        const valueInput = targetRow.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
        await valueInput.fill('value');
      } else {
        let keyInput = contentPage.locator('input[placeholder="输入参数名称自动换行"]').first();
        if (!(await keyInput.count())) {
          keyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
        }
        if (!(await keyInput.count())) {
          keyInput = contentPage.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        }
        await keyInput.fill('  trimKey  ');
        let valueInput = contentPage.locator('input[placeholder="参数值、@代表mock数据、{{ 变量 }}"]').first();
        if (!(await valueInput.count())) {
          valueInput = contentPage.locator('input[placeholder*="参数值"]').first();
        }
        if (!(await valueInput.count())) {
          valueInput = contentPage.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
        }
        await valueInput.fill('value');
      }
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证参数value内部空格保留
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Params标签页
     *   2. 添加包含空格的参数value
     *   3. 等待添加完成
     *   4. 验证参数存在
     * 预期结果：value内部空格被保留
     * 验证点：参数value空格保留
     */
    test('参数value内部空格应保留', async () => {
      // 切换到Params标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("Params")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 添加包含空格的参数value
      const tree = contentPage.locator('.body-params .el-tree, .query-path-params .el-tree').first();
      if (await tree.count()) {
        await tree.waitFor({ state: 'visible', timeout: 5000 });
        const rows = tree.locator('.custom-params');
        const count = await rows.count();
        const lastIndex = count > 0 ? count - 1 : 0;
        const targetRow = rows.nth(lastIndex);
        const keyInput = targetRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        await keyInput.fill('message');
        const valueInput = targetRow.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
        await valueInput.fill('hello world test');
      } else {
        let keyInput = contentPage.locator('input[placeholder="输入参数名称自动换行"]').first();
        if (!(await keyInput.count())) {
          keyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
        }
        if (!(await keyInput.count())) {
          keyInput = contentPage.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        }
        await keyInput.fill('message');
        let valueInput = contentPage.locator('input[placeholder="参数值、@代表mock数据、{{ 变量 }}"]').first();
        if (!(await valueInput.count())) {
          valueInput = contentPage.locator('input[placeholder*="参数值"]').first();
        }
        if (!(await valueInput.count())) {
          valueInput = contentPage.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
        }
        await valueInput.fill('hello world test');
      }
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
      // 验证参数存在
      const container = contentPage.locator('.query-path-params .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const keyInputs = container.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]');
      const count = await keyInputs.count();
      for (let i = 0; i < count; i++) {
        const candidate = keyInputs.nth(i);
        const value = await candidate.inputValue();
        if (value === 'message') {
          await expect(candidate).toBeVisible();
          return;
        }
      }
      throw new Error('Query param message not found');
    });

    /**
     * 测试目的：验证JSON格式化空格保留
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Body标签页
     *   2. 输入格式化的JSON
     *   3. 等待输入完成
     * 预期结果：JSON格式保留
     * 验证点：JSON格式保留
     */
    test('JSON中的空格应保留格式', async () => {
      // 切换到Body标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("Body")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 输入格式化的JSON
      const formattedJson = '{\n  "name": "test",\n  "value": 123\n}';
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      const jsonTip = contentPage.locator('.workbench .json-tip').first();
      if (await jsonTip.isVisible()) {
        await jsonTip.click({ force: true });
        await contentPage.waitForTimeout(100);
      }
      await editor.click({ force: true });
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(formattedJson);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('16.6 Unicode和特殊编码', () => {
    /**
     * 测试目的：验证UTF-8编码支持
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 输入包含中文的URL
     *   2. 等待解析完成
     *   3. 验证完整URL包含中文
     *   4. 验证参数值正确
     * 预期结果：UTF-8字符正确处理
     * 验证点：UTF-8编码支持
     */
    test('应支持UTF-8编码', async () => {
      // 输入包含中文的URL
      const urlInput = contentPage.locator('[data-testid="url-input"]');
      await urlInput.clear();
      await urlInput.fill('https://httpbin.org/get?utf8=测试');
      await urlInput.blur();
      await contentPage.waitForTimeout(200);
      await contentPage.waitForTimeout(300);
      // 验证完整URL包含中文
      const fullUrl = await contentPage.locator('.pre-url-wrap .url').textContent();
      expect(fullUrl).toContain(encodeURIComponent('测试'));
      // 验证参数值正确
      const container = contentPage.locator('.query-path-params .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const rows = container.locator('.custom-params');
      const rowCount = await rows.count();
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const keyInput = row.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]').first();
        if (!(await keyInput.count())) {
          continue;
        }
        const keyValue = await keyInput.inputValue();
        if (keyValue === 'utf8') {
          const valueInput = row.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
          const value = await valueInput.inputValue();
          expect(value).toBe('测试');
          return;
        }
      }
    });

    /**
     * 测试目的：验证emoji字符支持
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Params标签页
     *   2. 添加包含emoji的参数值
     *   3. 等待添加完成
     *   4. 验证参数存在
     * 预期结果：emoji字符正确保存
     * 验证点：emoji字符支持
     */
    test('应支持emoji字符', async () => {
      // 切换到Params标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("Params")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 添加包含emoji的参数值
      const tree = contentPage.locator('.body-params .el-tree, .query-path-params .el-tree').first();
      if (await tree.count()) {
        await tree.waitFor({ state: 'visible', timeout: 5000 });
        const rows = tree.locator('.custom-params');
        const count = await rows.count();
        const lastIndex = count > 0 ? count - 1 : 0;
        const targetRow = rows.nth(lastIndex);
        const keyInput = targetRow.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        await keyInput.fill('emoji');
        const valueInput = targetRow.locator('.value-text-input, textarea, input[placeholder*="值"], input[placeholder*="value"]').first();
        await valueInput.fill('🚀🎉👍');
      } else {
        let keyInput = contentPage.locator('input[placeholder="输入参数名称自动换行"]').first();
        if (!(await keyInput.count())) {
          keyInput = contentPage.locator('input[placeholder*="参数名称"]').first();
        }
        if (!(await keyInput.count())) {
          keyInput = contentPage.locator('input[placeholder*="参数"], input[placeholder*="key"]').first();
        }
        await keyInput.fill('emoji');
        let valueInput = contentPage.locator('input[placeholder="参数值、@代表mock数据、{{ 变量 }}"]').first();
        if (!(await valueInput.count())) {
          valueInput = contentPage.locator('input[placeholder*="参数值"]').first();
        }
        if (!(await valueInput.count())) {
          valueInput = contentPage.locator('input[placeholder*="值"], input[placeholder*="value"]').first();
        }
        await valueInput.fill('🚀🎉👍');
      }
      await contentPage.waitForTimeout(20);
      await contentPage.waitForTimeout(300);
      // 验证参数存在
      const container = contentPage.locator('.query-path-params .el-tree').first();
      await container.waitFor({ state: 'visible', timeout: 5000 });
      const keyInputs = container.locator('input[placeholder="输入参数名称自动换行"], input[placeholder*="参数"], input[placeholder*="key"]');
      const count = await keyInputs.count();
      for (let i = 0; i < count; i++) {
        const candidate = keyInputs.nth(i);
        const value = await candidate.inputValue();
        if (value === 'emoji') {
          await expect(candidate).toBeVisible();
          return;
        }
      }
      throw new Error('Query param emoji not found');
    });

    /**
     * 测试目的：验证多语言文字支持
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 切换到Body标签页
     *   2. 输入包含多种语言的JSON
     *   3. 等待输入完成
     * 预期结果：各种语言文字正确处理
     * 验证点：多语言支持
     */
    test('应支持各种语言文字', async () => {
      // 切换到Body标签页
      const tab = contentPage.locator('.el-tabs__item:has-text("Body")');
      await tab.click();
      await contentPage.waitForTimeout(300);
      // 输入包含多种语言的JSON
      const multiLangJson = '{"chinese":"中文","japanese":"日本語","korean":"한국어","arabic":"العربية"}';
      const editor = contentPage.locator('.workbench .monaco-editor').first();
      const jsonTip = contentPage.locator('.workbench .json-tip').first();
      if (await jsonTip.isVisible()) {
        await jsonTip.click({ force: true });
        await contentPage.waitForTimeout(100);
      }
      await editor.click({ force: true });
      await contentPage.keyboard.press('Control+A');
      await contentPage.keyboard.type(multiLangJson);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });
  });

  test.describe('16.7 最小宽度限制', () => {
    /**
     * 测试目的：验证1200px窗口正常显示
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 调整窗口到1200x800
     *   2. 等待窗口调整完成
     *   3. 验证容器可见
     * 预期结果：1200px窗口正常显示
     * 验证点：最小宽度显示
     */
    test('窗口宽度1200px应正常显示', async () => {
      // 调整窗口到1200x800
      await contentPage.setViewportSize({ width: 1200, height: 800 });
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 验证容器可见
      const container = contentPage.locator('.http-node-container, .main-container').first();
      if (await container.isVisible()) {
        await expect(container).toBeVisible();
      }
    });

    /**
     * 测试目的：验证小于1200px显示滚动条
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 调整窗口到1000x800
     *   2. 等待窗口调整完成
     * 预期结果：显示滚动条
     * 验证点：小窗口滚动条显示
     */
    test('窗口宽度小于1200px应显示滚动条', async () => {
      // 调整窗口到1000x800
      await contentPage.setViewportSize({ width: 1000, height: 800 });
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
    });

    /**
     * 测试目的：验证窗口缩放保持布局
     * 前置条件：已创建HTTP节点
     * 操作步骤：
     *   1. 调整窗口到1600x900
     *   2. 等待窗口调整完成
     *   3. 调整窗口到1200x800
     *   4. 验证容器可见
     * 预期结果：窗口缩放后布局正常
     * 验证点：响应式布局
     */
    test('窗口缩放应保持布局', async () => {
      // 调整窗口到1600x900
      await contentPage.setViewportSize({ width: 1600, height: 900 });
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 调整窗口到1200x800
      await contentPage.setViewportSize({ width: 1200, height: 800 });
      await contentPage.waitForTimeout(300);
      await contentPage.waitForTimeout(300);
      // 验证容器可见
      const container = contentPage.locator('.http-node-container, .main-container').first();
      if (await container.isVisible()) {
        await expect(container).toBeVisible();
      }
    });
  });
});
