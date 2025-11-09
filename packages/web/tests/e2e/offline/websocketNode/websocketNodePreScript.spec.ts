import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../fixtures/fixtures';
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
    test('应显示前置脚本编辑器', async () => {
      await switchToPreScriptTab(contentPage);
      await verifyScriptEditorVisible(contentPage);
    });

    test('应能编辑前置脚本', async () => {
      await fillPreRequestScript(contentPage, '// Pre-request script\nconsole.log("Before connection");');
      const content = await getScriptContent(contentPage);
      expect(content).toContain('Pre-request');
    });

    test('应能输入多行脚本', async () => {
      const script = `// Set variables\nconst token = "abc123";\nconst user = "test";`;
      await fillPreRequestScript(contentPage, script);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('token');
      expect(content).toContain('user');
    });
  });

  test.describe('8.2 脚本功能测试', () => {
    test('应能在脚本中设置变量', async () => {
      const script = 'ap.variables.set("testVar", "testValue");';
      await fillPreRequestScript(contentPage, script);
      await contentPage.waitForTimeout(300);
    });

    test('应能访问全局对象', async () => {
      const script = '// Access global objects\nconst vars = ap.variables;\nconst cookies = ap.cookies;';
      await fillPreRequestScript(contentPage, script);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('ap.variables');
      expect(content).toContain('ap.cookies');
    });
  });

  test.describe('8.3 前置脚本标签页测试', () => {
    test('应能切换到前置脚本标签', async () => {
      await switchToPreScriptTab(contentPage);
      const tab = contentPage.locator('.el-tabs__item.is-active:has-text("前置脚本")');
      await expect(tab).toBeVisible();
    });
  });
});
