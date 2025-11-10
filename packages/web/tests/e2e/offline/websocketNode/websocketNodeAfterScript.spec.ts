import { expect, type Page } from '@playwright/test';
import { test, initOfflineWorkbench, createProject, createSingleNode } from '../../../fixtures/fixtures';
import {
  waitForWebSocketNodeReady,
  switchToAfterScriptTab,
  fillAfterRequestScript,
  getScriptContent,
  verifyScriptEditorVisible
} from './helpers/websocketNodeHelpers';

test.describe('9. WebSocket节点 - 后置脚本测试', () => {
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

  test.describe('9.1 脚本编辑器测试', () => {
    test('应显示后置脚本编辑器', async () => {
      await switchToAfterScriptTab(contentPage);
      await verifyScriptEditorVisible(contentPage);
    });

    test('应能编辑后置脚本', async () => {
      await fillAfterRequestScript(contentPage, '// After-receive script\nconsole.log("Message received");');
      const content = await getScriptContent(contentPage);
      expect(content).toContain('After-receive');
    });

    test('应能输入多行脚本', async () => {
      const script = `// Process message\nconst data = JSON.parse(message.content);\nap.variables.set("responseData", data);`;
      await fillAfterRequestScript(contentPage, script);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('message.content');
      expect(content).toContain('responseData');
    });
  });

  test.describe('9.2 脚本功能测试', () => {
    test('应能在脚本中访问消息对象', async () => {
      const script = '// Access message\nconst content = message.content;\nconst type = message.type;';
      await fillAfterRequestScript(contentPage, script);
      const scriptContent = await getScriptContent(contentPage);
      expect(scriptContent).toContain('message.content');
      expect(scriptContent).toContain('message.type');
    });

    test('应能在脚本中提取变量', async () => {
      const script = 'const data = JSON.parse(message.content);\nap.variables.set("extractedValue", data.value);';
      await fillAfterRequestScript(contentPage, script);
      const content = await getScriptContent(contentPage);
      expect(content).toContain('extractedValue');
    });
  });

  test.describe('9.3 后置脚本标签页测试', () => {
    test('应能切换到后置脚本标签', async () => {
      await switchToAfterScriptTab(contentPage);
      const tab = contentPage.locator('.el-tabs__item.is-active:has-text("后置脚本")');
      await expect(tab).toBeVisible();
    });
  });
});
