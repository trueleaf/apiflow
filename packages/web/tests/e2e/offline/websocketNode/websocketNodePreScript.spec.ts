import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForWebSocketNodeReady,
  switchToPreScriptTab,
  fillPreRequestScript,
  getScriptContent,
  verifyScriptEditorVisible
} from './helpers/websocketNodeHelpers';

test.describe('8. WebSocket节点 - 前置脚本测试', () => {
  let headerPage: Page;
  let contentPage: Page;

  test.beforeEach(async ({ electronApp }) => {
    const result = await initOfflineWorkbench(electronApp);
    headerPage = result.headerPage;
    contentPage = result.contentPage;
    await createProject(contentPage, '测试项目');
    await createSingleNode(contentPage, {
      name: 'Test WebSocket',
      type: 'websocket'
    });
    await waitForWebSocketNodeReady(contentPage);
  });

  test.describe('8.1 脚本编辑器测试', () => {
    /**
     * 测试目的：验证前置脚本编辑器的显示
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 切换到前置脚本标签页
     *   2. 验证编辑器可见
     * 预期结果：前置脚本编辑器显示
     * 验证点：脚本编辑器UI
     * 说明：前置脚本在连接建立前执行
     */
    test('应显示前置脚本编辑器', async () => {
      // 切换到前置脚本标签
      await switchToPreScriptTab(contentPage);
      // 验证编辑器可见
      await verifyScriptEditorVisible(contentPage);
    });

    test('应能编辑前置脚本', async () => {
      // 填充前置脚本
      await fillPreRequestScript(contentPage, '// Pre-request script\nconsole.log("Before connection");');
      // 获取脚本内容
      const content = await getScriptContent(contentPage);
      // 验证脚本内容
      expect(content).toContain('Pre-request');
    });

    test('应能输入多行脚本', async () => {
      // 准备多行脚本
      const script = `// Set variables\nconst token = "abc123";\nconst user = "test";`;
      // 填充脚本
      await fillPreRequestScript(contentPage, script);
      // 获取脚本内容
      const content = await getScriptContent(contentPage);
      // 验证脚本内容包含变量
      expect(content).toContain('token');
      expect(content).toContain('user');
    });
  });

  test.describe('8.2 脚本功能测试', () => {
    test('应能在脚本中设置变量', async () => {
      // 准备设置变量的脚本
      const script = 'ap.variables.set("testVar", "testValue");';
      // 填充脚本
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });

    test('应能访问全局对象', async () => {
      // 准备访问全局对象的脚本
      const script = '// Access global objects\nconst vars = ap.variables;\nconst cookies = ap.cookies;';
      // 填充脚本
      await fillPreRequestScript(contentPage, script);
      // 获取脚本内容
      const content = await getScriptContent(contentPage);
      // 验证全局对象访问
      expect(content).toContain('ap.variables');
      expect(content).toContain('ap.cookies');
    });
  });

  test.describe('8.3 前置脚本标签页测试', () => {
    test('应能切换到前置脚本标签', async () => {
      // 切换到前置脚本标签
      await switchToPreScriptTab(contentPage);
      // 获取激活的标签
      const tab = contentPage.locator('.el-tabs__item.is-active:has-text("前置脚本")');
      // 验证标签激活
      await expect(tab).toBeVisible();
    });
  });
});
