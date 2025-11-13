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
    /**
     * 测试目的：验证后置脚本编辑器的显示
     * 前置条件：已创建WebSocket节点
     * 操作步骤：
     *   1. 切换到后置脚本标签页
     *   2. 验证编辑器可见
     * 预期结果：后置脚本编辑器显示
     * 验证点：脚本编辑器UI
     * 说明：后置脚本在接收到消息后执行
     */
    test('应显示后置脚本编辑器', async () => {
      // 切换到后置脚本标签
      await switchToAfterScriptTab(contentPage);
      // 验证编辑器可见
      await verifyScriptEditorVisible(contentPage);
    });

    test('应能编辑后置脚本', async () => {
      // 填充后置脚本
      await fillAfterRequestScript(contentPage, '// After-receive script\nconsole.log("Message received");');
      // 获取脚本内容
      const content = await getScriptContent(contentPage);
      // 验证脚本内容
      expect(content).toContain('After-receive');
    });

    test('应能输入多行脚本', async () => {
      // 准备多行脚本
      const script = `// Process message\nconst data = JSON.parse(message.content);\nap.variables.set("responseData", data);`;
      // 填充脚本
      await fillAfterRequestScript(contentPage, script);
      // 获取脚本内容
      const content = await getScriptContent(contentPage);
      // 验证脚本内容
      expect(content).toContain('message.content');
      expect(content).toContain('responseData');
    });
  });

  test.describe('9.2 脚本功能测试', () => {
    test('应能在脚本中访问消息对象', async () => {
      // 准备访问消息对象的脚本
      const script = '// Access message\nconst content = message.content;\nconst type = message.type;';
      // 填充脚本
      await fillAfterRequestScript(contentPage, script);
      // 获取脚本内容
      const scriptContent = await getScriptContent(contentPage);
      // 验证消息对象访问
      expect(scriptContent).toContain('message.content');
      expect(scriptContent).toContain('message.type');
    });

    test('应能在脚本中提取变量', async () => {
      // 准备提取变量的脚本
      const script = 'const data = JSON.parse(message.content);\nap.variables.set("extractedValue", data.value);';
      // 填充脚本
      await fillAfterRequestScript(contentPage, script);
      // 获取脚本内容
      const content = await getScriptContent(contentPage);
      // 验证变量提取
      expect(content).toContain('extractedValue');
    });
  });

  test.describe('9.3 后置脚本标签页测试', () => {
    test('应能切换到后置脚本标签', async () => {
      // 切换到后置脚本标签
      await switchToAfterScriptTab(contentPage);
      // 获取激活的标签
      const tab = contentPage.locator('.el-tabs__item.is-active:has-text("后置脚本")');
      // 验证标签激活
      await expect(tab).toBeVisible();
    });
  });
});
