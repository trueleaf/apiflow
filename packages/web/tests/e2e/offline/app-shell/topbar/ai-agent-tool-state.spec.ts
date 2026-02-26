import { test, expect } from '../../../../fixtures/electron.fixture';

test.describe('AiAgentToolState', () => {
  // Agent 模式下 tool-group/tool-call 支持折叠展开，并展示成功失败状态与参数结果
  test('离线模式下 AI Agent 工具消息展示与折叠状态正确', async ({ topBarPage, contentPage, clearCache }) => {
    await clearCache();
    // 预置一组 agent 对话缓存，覆盖 tool-group + tool-call success/error 三种展示
    const seedTime = Date.now();
    await contentPage.evaluate((baseTime) => {
      localStorage.setItem('appState/aiDialog/mode', 'agent');
      localStorage.setItem('apiflow/ai/conversation-v2', JSON.stringify({
        agentMessages: [
          {
            id: 'tool-group-case',
            kind: 'tool-group',
            content: '已挑选工具',
            createdAt: baseTime,
            toolGroup: {
              tools: ['searchNodes', 'getHttpNodeDetail'],
              iteration: 1,
              status: 'completed',
            },
          },
          {
            id: 'tool-call-success-case',
            kind: 'tool-call',
            content: 'searchNodes',
            createdAt: baseTime + 1,
            status: 'success',
            toolCall: {
              toolName: 'searchNodes',
              arguments: { keyword: '离线Mock' },
              result: '共找到 1 条节点',
            },
            llmOutput: '请先检索节点列表',
            tokenUsage: {
              promptTokens: 111,
              completionTokens: 22,
              totalTokens: 133,
            },
          },
          {
            id: 'tool-call-error-case',
            kind: 'tool-call',
            content: 'getHttpNodeDetail',
            createdAt: baseTime + 2,
            status: 'error',
            toolCall: {
              toolName: 'getHttpNodeDetail',
              arguments: { nodeId: 'missing-node-id' },
              error: '节点不存在',
            },
            llmOutput: '继续读取节点详情',
            tokenUsage: {
              promptTokens: 88,
              completionTokens: 10,
              totalTokens: 98,
            },
          },
        ],
        askMessages: [],
        updatedAt: baseTime + 3,
      }));
    }, seedTime);
    await contentPage.reload();
    await contentPage.waitForLoadState('domcontentloaded');
    // 打开 AI 弹窗并进入 Agent 模式，验证消息成功回放
    const aiBtn = topBarPage.locator('[data-testid="header-ai-btn"]');
    await aiBtn.click();
    const aiDialog = contentPage.locator('.ai-dialog');
    await expect(aiDialog).toBeVisible({ timeout: 5000 });
    const modeTrigger = aiDialog.locator('.ai-input-trigger').first();
    await expect(modeTrigger).toContainText('Agent');
    const toolGroup = aiDialog.locator('.ai-message-tool-group').first();
    await expect(toolGroup).toBeVisible({ timeout: 5000 });
    const toolGroupDetails = toolGroup.locator('.ai-tool-group-details');
    await expect(toolGroupDetails).toBeVisible({ timeout: 5000 });
    await expect(toolGroupDetails).toContainText('searchNodes');
    await expect(toolGroupDetails).toContainText('getHttpNodeDetail');
    // 验证 tool-group 折叠展开交互
    await toolGroup.locator('.ai-tool-group-header').click();
    await expect(toolGroupDetails).toBeHidden({ timeout: 5000 });
    await toolGroup.locator('.ai-tool-group-header').click();
    await expect(toolGroupDetails).toBeVisible({ timeout: 5000 });
    // 验证成功工具调用状态、参数与结果展示，并可折叠展开
    const successCall = aiDialog.locator('.ai-message-tool-execution').filter({ hasText: 'searchNodes' }).first();
    await expect(successCall.locator('.ai-tool-success')).toBeVisible({ timeout: 5000 });
    const successDetails = successCall.locator('.ai-tool-details');
    await expect(successDetails).toContainText('结果');
    await expect(successDetails).toContainText('共找到 1 条节点');
    await expect(successDetails).toContainText('参数');
    await successCall.locator('.ai-tool-toggle').click();
    await expect(successDetails).toBeHidden({ timeout: 5000 });
    await successCall.locator('.ai-tool-toggle').click();
    await expect(successDetails).toBeVisible({ timeout: 5000 });
    // 验证失败工具调用状态、错误与参数展示，并可折叠展开
    const errorCall = aiDialog.locator('.ai-message-tool-execution').filter({ hasText: 'getHttpNodeDetail' }).first();
    await expect(errorCall.locator('.ai-tool-error')).toBeVisible({ timeout: 5000 });
    const errorDetails = errorCall.locator('.ai-tool-details');
    await expect(errorDetails).toContainText('错误');
    await expect(errorDetails).toContainText('节点不存在');
    await expect(errorDetails).toContainText('参数');
    await errorCall.locator('.ai-tool-toggle').click();
    await expect(errorDetails).toBeHidden({ timeout: 5000 });
    await errorCall.locator('.ai-tool-toggle').click();
    await expect(errorDetails).toBeVisible({ timeout: 5000 });
  });
});
