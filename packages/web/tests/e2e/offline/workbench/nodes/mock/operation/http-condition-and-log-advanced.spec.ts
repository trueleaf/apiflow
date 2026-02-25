import { test, expect } from '../../../../../../fixtures/electron.fixture';

test.describe('HttpMockConditionAndLog-Offline', () => {
  test('多响应条件脚本按顺序命中，首个命中后不再执行后续条件', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });

    // 创建 HTTP Mock 节点并配置基础监听信息
    await createNode(contentPage, { nodeType: 'httpMock', name: '离线-条件顺序命中' });
    const conditionNode = bannerTree.locator('.el-tree-node__content', { hasText: '离线-条件顺序命中' }).first();
    await expect(conditionNode).toBeVisible({ timeout: 5000 });
    await conditionNode.click();
    const mockConfig = contentPage.locator('.mock-config-content');
    await expect(mockConfig).toBeVisible({ timeout: 5000 });
    const portInput = mockConfig.locator('.condition-content .port-input input').first();
    await portInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('19181');
    const urlInput = mockConfig.locator('.condition-content .url-input input').first();
    await urlInput.fill('/mock/http-condition-order');

    // 为默认返回配置第一个条件脚本
    const addConditionButton = mockConfig.locator('.response-content .condition .condition-btn').filter({ hasText: /添加触发条件/ }).first();
    await addConditionButton.click();
    const firstConditionEditor = mockConfig.locator('.condition-config-section .s-code-editor .monaco-editor').first();
    await expect(firstConditionEditor).toBeVisible({ timeout: 5000 });
    await firstConditionEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("condition-order-first"); return true;');

    // 新增第二个返回配置并设置条件脚本
    const addResponseTagButton = mockConfig.locator('.response-tags .add-btn').first();
    await addResponseTagButton.click();
    const secondResponseTag = mockConfig.locator('.response-tags .el-tag').filter({ hasText: /条件返回1/ }).first();
    await expect(secondResponseTag).toBeVisible({ timeout: 5000 });
    await secondResponseTag.click();
    const secondAddConditionButton = mockConfig.locator('.response-content .condition .condition-btn').filter({ hasText: /添加触发条件/ }).first();
    await secondAddConditionButton.click();
    const secondConditionEditor = mockConfig.locator('.condition-config-section .s-code-editor .monaco-editor').first();
    await expect(secondConditionEditor).toBeVisible({ timeout: 5000 });
    await secondConditionEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("condition-order-second"); return true;');

    // 保存并启用服务后触发一次请求
    await mockConfig.getByRole('button', { name: /保存配置/ }).click();
    const enableRow = mockConfig.locator('.form-item').filter({ hasText: /启用Mock API/ }).first();
    await enableRow.locator('.el-switch').first().click();
    await expect(conditionNode.locator('.mock-status .status-dot.running')).toBeVisible({ timeout: 30000 });
    const response = await contentPage.request.get('http://127.0.0.1:19181/mock/http-condition-order');
    expect(response.status()).toBe(200);

    // 在日志页验证仅有第一个条件脚本被执行
    const logsTab = contentPage.locator('.clean-tabs__item').filter({ hasText: /^日志$/ }).first();
    await logsTab.click();
    const consoleBadge = contentPage.locator('.console-badge').first();
    await expect(consoleBadge).toBeVisible({ timeout: 10000 });
    await consoleBadge.click();
    const consoleDialog = contentPage.locator('.console-dialog-content').first();
    await expect(consoleDialog).toContainText('condition-order-first');
    await expect(consoleDialog).not.toContainText('condition-order-second');
  });

  test('条件不命中与条件脚本异常分支都返回 500', async ({ contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });

    // 创建“条件不命中”节点并写入 return false 脚本
    await createNode(contentPage, { nodeType: 'httpMock', name: '离线-条件不命中分支' });
    const noMatchNode = bannerTree.locator('.el-tree-node__content', { hasText: '离线-条件不命中分支' }).first();
    await expect(noMatchNode).toBeVisible({ timeout: 5000 });
    await noMatchNode.click();
    const noMatchConfig = contentPage.locator('.mock-config-content');
    await expect(noMatchConfig).toBeVisible({ timeout: 5000 });
    const noMatchPortInput = noMatchConfig.locator('.condition-content .port-input input').first();
    await noMatchPortInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('19182');
    const noMatchUrlInput = noMatchConfig.locator('.condition-content .url-input input').first();
    await noMatchUrlInput.fill('/mock/http-condition-false');
    const noMatchAddConditionButton = noMatchConfig.locator('.response-content .condition .condition-btn').filter({ hasText: /添加触发条件/ }).first();
    await noMatchAddConditionButton.click();
    const noMatchEditor = noMatchConfig.locator('.condition-config-section .s-code-editor .monaco-editor').first();
    await expect(noMatchEditor).toBeVisible({ timeout: 5000 });
    await noMatchEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('return false;');
    await noMatchConfig.getByRole('button', { name: /保存配置/ }).click();
    const noMatchEnableRow = noMatchConfig.locator('.form-item').filter({ hasText: /启用Mock API/ }).first();
    await noMatchEnableRow.locator('.el-switch').first().click();
    await expect(noMatchNode.locator('.mock-status .status-dot.running')).toBeVisible({ timeout: 30000 });
    const noMatchResponse = await contentPage.request.get('http://127.0.0.1:19182/mock/http-condition-false');
    expect(noMatchResponse.status()).toBe(500);
    const noMatchText = await noMatchResponse.text();
    expect(noMatchText).toMatch(/条件不满足|Condition script|not/);

    // 创建“脚本异常”节点并写入 throw Error 脚本
    await createNode(contentPage, { nodeType: 'httpMock', name: '离线-条件脚本异常分支' });
    const errorNode = bannerTree.locator('.el-tree-node__content', { hasText: '离线-条件脚本异常分支' }).first();
    await expect(errorNode).toBeVisible({ timeout: 5000 });
    await errorNode.click();
    const errorConfig = contentPage.locator('.mock-config-content');
    await expect(errorConfig).toBeVisible({ timeout: 5000 });
    const errorPortInput = errorConfig.locator('.condition-content .port-input input').first();
    await errorPortInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('19183');
    const errorUrlInput = errorConfig.locator('.condition-content .url-input input').first();
    await errorUrlInput.fill('/mock/http-condition-error');
    const errorAddConditionButton = errorConfig.locator('.response-content .condition .condition-btn').filter({ hasText: /添加触发条件/ }).first();
    await errorAddConditionButton.click();
    const errorEditor = errorConfig.locator('.condition-config-section .s-code-editor .monaco-editor').first();
    await expect(errorEditor).toBeVisible({ timeout: 5000 });
    await errorEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('throw new Error("mock-condition-script-error");');
    await errorConfig.getByRole('button', { name: /保存配置/ }).click();
    const errorEnableRow = errorConfig.locator('.form-item').filter({ hasText: /启用Mock API/ }).first();
    await errorEnableRow.locator('.el-switch').first().click();
    await expect(errorNode.locator('.mock-status .status-dot.running')).toBeVisible({ timeout: 30000 });
    const errorResponse = await contentPage.request.get('http://127.0.0.1:19183/mock/http-condition-error');
    expect(errorResponse.status()).toBe(500);
    const errorText = await errorResponse.text();
    expect(errorText).toMatch(/Condition script execution failed|mock-condition-script-error/);
  });

  test('HTTP Mock 日志支持筛选、Console详情、清除与启停状态回填', async ({ contentPage, clearCache, createProject, createNode }) => {
    test.setTimeout(120000);
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    const bannerTree = contentPage.getByTestId('banner-doc-tree');
    await expect(bannerTree).toBeVisible({ timeout: 5000 });

    // 创建 HTTP Mock 并通过条件脚本写入 console 日志
    await createNode(contentPage, { nodeType: 'httpMock', name: '离线-HTTP日志高级能力' });
    const logNode = bannerTree.locator('.el-tree-node__content', { hasText: '离线-HTTP日志高级能力' }).first();
    await expect(logNode).toBeVisible({ timeout: 5000 });
    await logNode.click();
    const logConfig = contentPage.locator('.mock-config-content');
    await expect(logConfig).toBeVisible({ timeout: 5000 });
    const logPortInput = logConfig.locator('.condition-content .port-input input').first();
    await logPortInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('19184');
    const logUrlInput = logConfig.locator('.condition-content .url-input input').first();
    await logUrlInput.fill('/mock/http-log-advanced');
    const addConditionButton = logConfig.locator('.response-content .condition .condition-btn').filter({ hasText: /添加触发条件/ }).first();
    await addConditionButton.click();
    const conditionEditor = logConfig.locator('.condition-config-section .s-code-editor .monaco-editor').first();
    await expect(conditionEditor).toBeVisible({ timeout: 5000 });
    await conditionEditor.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('console.log("http-log-advanced-console"); return true;');
    await logConfig.getByRole('button', { name: /保存配置/ }).click();
    const enableRow = logConfig.locator('.form-item').filter({ hasText: /启用Mock API/ }).first();
    await enableRow.locator('.el-switch').first().click();
    const runningDot = logNode.locator('.mock-status .status-dot.running');
    await expect(runningDot).toBeVisible({ timeout: 30000 });

    // 发送两条请求，为筛选与日志详情准备数据
    const requestA = await contentPage.request.get('http://127.0.0.1:19184/mock/http-log-advanced?log-key=keep');
    expect(requestA.status()).toBe(200);
    const requestB = await contentPage.request.get('http://127.0.0.1:19184/mock/http-log-advanced?log-key=drop');
    expect(requestB.status()).toBe(200);

    // 进入日志页并通过关键字过滤到单条记录
    const logsTab = contentPage.locator('.clean-tabs__item').filter({ hasText: /^日志$/ }).first();
    await logsTab.click();
    const keywordInput = contentPage.locator('.filters .filter-group').filter({ hasText: /关键字/ }).locator('input').first();
    await expect(keywordInput).toBeVisible({ timeout: 5000 });
    await keywordInput.fill('log-key=keep');
    const plainLogLines = contentPage.locator('.plain-log-line');
    await expect(plainLogLines).toHaveCount(1, { timeout: 10000 });
    await expect(plainLogLines.first()).toContainText('log-key=keep');

    // 打开 Console 日志详情，校验条件脚本日志内容
    const consoleBadge = contentPage.locator('.console-badge').first();
    await expect(consoleBadge).toBeVisible({ timeout: 10000 });
    await consoleBadge.click();
    const consoleDialog = contentPage.locator('.console-dialog-content').first();
    await expect(consoleDialog).toContainText('http-log-advanced-console');
    await contentPage.keyboard.press('Escape');
    await expect(contentPage.locator('.console-dialog-content').first()).toBeHidden({ timeout: 10000 });

    // 清空日志并确认空态文案
    const clearButton = contentPage.locator('.operation-btn').filter({ hasText: /清除/ }).first();
    await clearButton.click();
    const clearConfirmButton = contentPage.locator('.cl-confirm-footer-right .el-button--primary').first();
    await expect(clearConfirmButton).toBeVisible({ timeout: 5000 });
    await clearConfirmButton.click();
    await expect(contentPage.locator('.el-empty__description').filter({ hasText: /暂无符合条件的日志/ }).first()).toBeVisible({ timeout: 10000 });

    // 通过右键停止再启动，验证状态点可正确回填
    await logNode.click({ button: 'right' });
    const stopMockItem = contentPage.locator('.s-contextmenu .s-contextmenu-item').filter({ hasText: /停止mock/ }).first();
    await expect(stopMockItem).toBeVisible({ timeout: 10000 });
    await stopMockItem.click();
    await expect(runningDot).toBeHidden({ timeout: 30000 });
    await logNode.click({ button: 'right' });
    const startMockItem = contentPage.locator('.s-contextmenu .s-contextmenu-item').filter({ hasText: /启动mock/ }).first();
    await expect(startMockItem).toBeVisible({ timeout: 10000 });
    await startMockItem.click();
    await expect(runningDot).toBeVisible({ timeout: 30000 });
  });
});
