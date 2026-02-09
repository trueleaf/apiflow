import { test, expect } from '../../../../../fixtures/electron.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('Export', () => {
  test('导出弹窗显示HTML、WORD、JSON文档、OpenAPI四种导出类型', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开导出页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const htmlOption = exportPage.locator('.item').filter({ hasText: 'HTML' });
    await expect(htmlOption).toBeVisible();
    const wordOption = exportPage.locator('.item').filter({ hasText: 'WORD' });
    await expect(wordOption).toBeVisible();
    const jsonOption = exportPage.locator('.item').filter({ hasText: /JSON文档/ });
    await expect(jsonOption).toBeVisible();
    const openapiOption = exportPage.locator('.item').filter({ hasText: 'OpenAPI' });
    await expect(openapiOption).toBeVisible();
  });
  test('选择JSON文档类型后显示active状态', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开导出页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const jsonOption = exportPage.locator('.item').filter({ hasText: /JSON文档/ });
    await jsonOption.click();
    await expect(jsonOption).toHaveClass(/active/);
  });
  test('选择OpenAPI类型后显示active状态', async ({ topBarPage, contentPage, clearCache, createProject }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 打开导出页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const openapiOption = exportPage.locator('.item').filter({ hasText: 'OpenAPI' });
    await openapiOption.click();
    await expect(openapiOption).toHaveClass(/active/);
  });
  test('开启选择导出后显示el-tree节点树', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 先创建节点，确保选择导出有可选内容
    await createNode(contentPage, { nodeType: 'http', name: '测试接口' });
    // 打开导出页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const selectExportCheckbox = exportPage.locator('.config-item').filter({ hasText: /选择导出/ }).locator('.el-checkbox');
    await expect(selectExportCheckbox).toBeVisible({ timeout: 5000 });
    await selectExportCheckbox.click();
    const tree = exportPage.locator('.el-tree');
    await expect(tree).toBeVisible({ timeout: 5000 });
    const treeNode = tree.locator('.el-tree-node');
    await expect(treeNode.first()).toBeVisible();
  });
  test('导出JSON文档格式,点击确定导出按钮触发下载', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建节点，确保导出内容非空
    await createNode(contentPage, { nodeType: 'http', name: '导出测试接口' });
    // 打开导出页面
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const jsonOption = exportPage.locator('.item').filter({ hasText: /JSON文档/ });
    await jsonOption.click();
    await expect(jsonOption).toHaveClass(/active/);
    await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadFilenames?: string[] };
      w.__downloadFilenames = [];
      const originalClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        const downloadAttr = this.getAttribute('download');
        if (downloadAttr) {
          w.__downloadFilenames?.push(downloadAttr);
        }
        return originalClick.apply(this);
      };
    });
    const exportBtn = exportPage.locator('.el-button--primary').filter({ hasText: /确定导出/ });
    await exportBtn.click();
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const w = window as unknown as { __downloadFilenames?: string[] };
        return w.__downloadFilenames?.length || 0;
      });
    }, { timeout: 5000 }).toBeGreaterThan(0);
    const filenames = await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadFilenames?: string[] };
      return w.__downloadFilenames || [];
    });
    expect(filenames.some((name) => name.endsWith('.json'))).toBeTruthy();
  });
  test('开启选择导出但不勾选任何节点,点击导出触发警告提示', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: '选择导出警告测试' });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    // 开启选择导出但不勾选任何节点
    const selectExportCheckbox = exportPage.locator('.config-item').filter({ hasText: /选择导出/ }).locator('.el-checkbox');
    await selectExportCheckbox.click();
    const tree = exportPage.locator('.el-tree');
    await expect(tree).toBeVisible({ timeout: 5000 });
    // 点击确定导出,应触发警告而非下载
    const exportBtn = exportPage.locator('.el-button--primary').filter({ hasText: /确定导出/ });
    await exportBtn.click();
    const warningMsg = contentPage.locator('.el-message--warning');
    await expect(warningMsg).toBeVisible({ timeout: 5000 });
    await expect(warningMsg).toContainText(/请至少选择一个文档导出/);
  });
  test('选择性导出JSON文档仅包含勾选的节点', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    // 创建3个节点,后续只勾选导出其中1个
    await createNode(contentPage, { nodeType: 'http', name: '导出节点A' });
    await createNode(contentPage, { nodeType: 'http', name: '不导出节点B' });
    await createNode(contentPage, { nodeType: 'http', name: '不导出节点C' });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    // 选择JSON文档类型
    const jsonOption = exportPage.locator('.item').filter({ hasText: /JSON文档/ });
    await jsonOption.click();
    await expect(jsonOption).toHaveClass(/active/);
    // 开启选择导出
    const selectExportCheckbox = exportPage.locator('.config-item').filter({ hasText: /选择导出/ }).locator('.el-checkbox');
    await selectExportCheckbox.click();
    const tree = exportPage.locator('.el-tree');
    await expect(tree).toBeVisible({ timeout: 5000 });
    // 只勾选"导出节点A"
    const nodeA = tree.locator('.el-tree-node').filter({ hasText: '导出节点A' }).first();
    await nodeA.locator('.el-checkbox').click();
    // 拦截下载并捕获内容
    await contentPage.evaluate(() => {
      const w = window as unknown as { __exportContent?: string };
      const origClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        const href = this.getAttribute('href') || '';
        if (this.getAttribute('download') && href.startsWith('blob:')) {
          fetch(href).then(r => r.text()).then(text => { w.__exportContent = text; });
        }
        return origClick.apply(this);
      };
    });
    const exportBtn = exportPage.locator('.el-button--primary').filter({ hasText: /确定导出/ });
    await exportBtn.click();
    // 等待下载内容被捕获
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const w = window as unknown as { __exportContent?: string };
        return !!w.__exportContent;
      });
    }, { timeout: 10000 }).toBeTruthy();
    const exportContent = await contentPage.evaluate(() => {
      const w = window as unknown as { __exportContent?: string };
      return w.__exportContent || '';
    });
    const parsed = JSON.parse(exportContent) as { type: string; docs: { info: { name: string } }[] };
    expect(parsed.type).toBe('apiflow');
    // 验证只包含勾选的节点A,不含B和C
    const docNames = parsed.docs.map(d => d.info?.name);
    expect(docNames).toContain('导出节点A');
    expect(docNames).not.toContain('不导出节点B');
    expect(docNames).not.toContain('不导出节点C');
  });
  test('导出HTML格式触发.html文件下载', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    await clearCache();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    await createNode(contentPage, { nodeType: 'http', name: 'HTML导出测试接口' });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    // HTML是默认选中类型,直接导出
    const htmlOption = exportPage.locator('.item').filter({ hasText: 'HTML' });
    await expect(htmlOption).toHaveClass(/active/);
    await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadFilenames?: string[] };
      w.__downloadFilenames = [];
      const originalClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        const downloadAttr = this.getAttribute('download');
        if (downloadAttr) {
          w.__downloadFilenames?.push(downloadAttr);
        }
        return originalClick.apply(this);
      };
    });
    const exportBtn = exportPage.locator('.el-button--primary').filter({ hasText: /确定导出/ });
    await exportBtn.click();
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const w = window as unknown as { __downloadFilenames?: string[] };
        return w.__downloadFilenames?.length || 0;
      });
    }, { timeout: 10000 }).toBeGreaterThan(0);
    const filenames = await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadFilenames?: string[] };
      return w.__downloadFilenames || [];
    });
    expect(filenames.some((name) => name.endsWith('.html'))).toBeTruthy();
  });
  test('离线模式创建全类型节点与参数组合,导出OpenAPI并校验schema与required', async ({ topBarPage, contentPage, clearCache, createProject, createNode }) => {
    // 该用例步骤较多，避免在 CI/低性能环境下因超时导致误报失败
    test.setTimeout(300000);
    await clearCache();
    const projectName = '导出OpenAPI全量测试项目';
    await createProject(projectName);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    // 创建各类型节点，覆盖导出OpenAPI的多场景
    await createNode(contentPage, { nodeType: 'folder', name: '导出测试文件夹' });

    await createNode(contentPage, { nodeType: 'websocket', name: '导出测试WebSocket节点' });

    await createNode(contentPage, { nodeType: 'httpMock', name: '导出测试HTTP Mock节点' });

    await createNode(contentPage, { nodeType: 'websocketMock', name: '导出测试WebSocket Mock节点' });

    await createNode(contentPage, { nodeType: 'http', name: 'OpenAPI-参数组合接口' });
    const urlInput = contentPage.locator('[data-testid="url-input"] .ProseMirror').first();
    // 通过模拟真实输入更新 URL（ClRichInput/ProseMirror 直接 fill 可能无法触发内部状态同步）
    await urlInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/openapi/params/{userId}`);
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    const queryParamsTree = contentPage.locator('.query-path-params .cl-params-tree').first();
    const queryRows = queryParamsTree.locator('[data-testid="params-tree-row"]');
    await expect(queryRows.nth(0)).toBeVisible({ timeout: 10000 });
    // 填写 Query 参数（使用 click + keyboard，避免直接依赖 el-input 内部 input 结构）
    await queryRows.nth(0).locator('[data-testid="params-tree-key-input"]').click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('q');
    await queryRows.nth(0).locator('[data-testid="params-tree-value-input"]').click();
    await contentPage.keyboard.type('1');
    await queryRows.nth(0).locator('[data-testid="params-tree-description-input"]').click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('query必填');
    await expect(queryRows.nth(1)).toBeVisible({ timeout: 10000 });
    await queryRows.nth(1).locator('[data-testid="params-tree-key-input"]').click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('opt');
    await queryRows.nth(1).locator('[data-testid="params-tree-value-input"]').click();
    await contentPage.keyboard.type('2');
    // 参数默认必填，点击一次切换为非必填
    await queryRows.nth(1).locator('[data-testid="params-tree-required-checkbox"]').click();
    await queryRows.nth(1).locator('[data-testid="params-tree-description-input"]').click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('query非必填');
    const pathParamsTree = contentPage.locator('.query-path-params .cl-params-tree').nth(1);
    const userIdRow = pathParamsTree.locator('[data-testid="params-tree-row"][data-row-key=\"userId\"]');
    await userIdRow.locator('[data-testid="params-tree-description-input"]').click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('用户ID');
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    // 填写 Headers 参数（使用 data-testid 直接定位，避免依赖容器 class）
    const headerKeyInput = contentPage.locator('[data-testid="params-tree-key-autocomplete"] input, [data-testid="params-tree-key-input"] input').first();
    await expect(headerKeyInput).toBeVisible({ timeout: 10000 });
    await headerKeyInput.click();
    await headerKeyInput.fill('X-Token');
    const headerValueInput = contentPage.locator('[data-testid="params-tree-value-input"] .ProseMirror').first();
    await headerValueInput.click();
    await contentPage.keyboard.type('token_value');
    await contentPage.locator('[data-testid="params-tree-description-input"]').first().click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('令牌');
    // 保存接口，确保导出时能读取到最新配置
    const saveBtn = contentPage.locator('[data-testid="operation-save-btn"]');
    await saveBtn.click();
    await contentPage.waitForTimeout(500);

    await createNode(contentPage, { nodeType: 'http', name: 'OpenAPI-JSON请求体接口' });
    await urlInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/openapi/json`);
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).first().click();
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    const jsonBodyRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^json$/i }).locator('.el-radio');
    await expect(jsonBodyRadio).toBeVisible({ timeout: 10000 });
    await jsonBodyRadio.click();
    const jsonEditor = contentPage.locator('.s-json-editor').first();
    await expect(jsonEditor).toBeVisible({ timeout: 10000 });
    await jsonEditor.click({ force: true });
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('{"name":"test","count":1,"active":true,"tags":["a"],"meta":{"id":1}}');
    const responseTab = contentPage.locator('[data-testid="http-params-tab-response"]');
    await responseTab.click();
    const responseParams = contentPage.locator('.response-params');
    await expect(responseParams).toBeVisible({ timeout: 10000 });
    const contentTypeArea = responseParams.locator('.content-type').first();
    await contentTypeArea.locator('.cursor-pointer').first().click();
    const responseTypePopover = contentPage.locator('.el-popper.el-popover:visible').filter({ hasText: /常用/ }).first();
    await expect(responseTypePopover).toBeVisible({ timeout: 10000 });
    await responseTypePopover.locator('.item').filter({ hasText: /^JSON$/ }).first().click();
    // 确认响应类型已切换为 application/json
    await expect(contentTypeArea.locator('.type-text')).toContainText('application/json', { timeout: 10000 });
    const responseJsonEditor = responseParams.locator('.response-collapse-card').first().locator('.s-json-editor').first();
    await expect(responseJsonEditor).toBeVisible({ timeout: 10000 });
    const responseJsonViewLines = responseJsonEditor.locator('.view-lines');
    await expect(responseJsonViewLines).toBeVisible({ timeout: 10000 });
    await responseJsonViewLines.click({ force: true });
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('{"ok":true,"data":{"id":1}}');
    await responseParams.locator('.card-actions .action-icon').first().click();
    const secondCard = responseParams.locator('.response-collapse-card').nth(1);
    await expect(secondCard).toBeVisible({ timeout: 10000 });
    await secondCard.locator('.status-code .cursor-pointer').first().click();
    const status400Item = contentPage.locator('.el-popper.el-popover:visible').filter({ hasText: /400/ }).locator('text=400').first();
    await expect(status400Item).toBeVisible({ timeout: 10000 });
    await status400Item.click();
    await secondCard.locator('.content-type .cursor-pointer').first().click();
    const textPlainPopover = contentPage.locator('.el-popper.el-popover:visible').filter({ hasText: /常用/ }).first();
    await expect(textPlainPopover).toBeVisible({ timeout: 10000 });
    await textPlainPopover.locator('.item').filter({ hasText: /^text\/plain$/ }).first().click();
    await expect(secondCard.locator('.content-type .type-text')).toContainText('text/plain', { timeout: 10000 });
    const secondCardEditor = secondCard.locator('.s-json-editor').first();
    await expect(secondCardEditor).toBeVisible({ timeout: 10000 });
    const secondCardViewLines = secondCardEditor.locator('.view-lines');
    await expect(secondCardViewLines).toBeVisible({ timeout: 10000 });
    await secondCardViewLines.click({ force: true });
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('error');
    // 保存接口，确保响应配置会被导出到 OpenAPI
    await saveBtn.click();
    await contentPage.waitForTimeout(500);

    await createNode(contentPage, { nodeType: 'http', name: 'OpenAPI-FormData请求体接口' });
    await urlInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/openapi/formdata`);
    await methodSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).first().click();
    await bodyTab.click();
    const formDataRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio');
    await expect(formDataRadio).toBeVisible({ timeout: 10000 });
    await formDataRadio.click();
    const formTree = contentPage.locator('.body-params .cl-params-tree').first();
    const formRows = formTree.locator('[data-testid="params-tree-row"]');
    await expect(formRows.nth(0)).toBeVisible({ timeout: 10000 });
    // 填写 FormData 参数
    await formRows.nth(0).locator('[data-testid="params-tree-key-input"]').click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('file');
    await formRows.nth(0).locator('[data-testid="params-tree-type-select"]').click();
    const fileTypeOption = contentPage.locator('.el-select-dropdown__item:visible').filter({ hasText: /^File$/ }).first();
    await expect(fileTypeOption).toBeVisible({ timeout: 10000 });
    await fileTypeOption.click();
    await formRows.nth(0).locator('[data-testid="params-tree-description-input"]').click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('上传文件');
    await expect(formRows.nth(1)).toBeVisible({ timeout: 10000 });
    await formRows.nth(1).locator('[data-testid="params-tree-key-input"]').click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('name');
    await formRows.nth(1).locator('[data-testid="params-tree-value-input"]').click();
    await contentPage.keyboard.type('test');
    // 参数默认必填，点击一次切换为非必填
    await formRows.nth(1).locator('[data-testid="params-tree-required-checkbox"]').click();
    await formRows.nth(1).locator('[data-testid="params-tree-description-input"]').click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('名称');
    // 保存接口，确保请求体配置会被导出到 OpenAPI
    await saveBtn.click();
    await contentPage.waitForTimeout(500);

    await createNode(contentPage, { nodeType: 'http', name: 'OpenAPI-UrlEncoded请求体接口' });
    await urlInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/openapi/urlencoded`);
    await methodSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).first().click();
    await bodyTab.click();
    const urlEncodedRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^x-www-form-urlencoded$/i }).locator('.el-radio');
    await expect(urlEncodedRadio).toBeVisible({ timeout: 10000 });
    await urlEncodedRadio.click();
    const urlencodedTree = contentPage.locator('.body-params .cl-params-tree').first();
    const urlencodedRows = urlencodedTree.locator('[data-testid="params-tree-row"]');
    await expect(urlencodedRows.nth(0)).toBeVisible({ timeout: 10000 });
    await urlencodedRows.nth(0).locator('[data-testid="params-tree-key-input"]').click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('a');
    await urlencodedRows.nth(0).locator('[data-testid="params-tree-value-input"]').click();
    await contentPage.keyboard.type('1');
    await urlencodedRows.nth(0).locator('[data-testid="params-tree-description-input"]').click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('a必填');
    await expect(urlencodedRows.nth(1)).toBeVisible({ timeout: 10000 });
    await urlencodedRows.nth(1).locator('[data-testid="params-tree-key-input"]').click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('b');
    await urlencodedRows.nth(1).locator('[data-testid="params-tree-value-input"]').click();
    await contentPage.keyboard.type('2');
    // 参数默认必填，点击一次切换为非必填
    await urlencodedRows.nth(1).locator('[data-testid="params-tree-required-checkbox"]').click();
    await urlencodedRows.nth(1).locator('[data-testid="params-tree-description-input"]').click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('b非必填');
    // 保存接口，确保请求体配置会被导出到 OpenAPI
    await saveBtn.click();
    await contentPage.waitForTimeout(500);

    await createNode(contentPage, { nodeType: 'http', name: 'OpenAPI-Raw请求体接口' });
    await urlInput.click();
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type(`http://127.0.0.1:${MOCK_SERVER_PORT}/openapi/raw`);
    await methodSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).first().click();
    await bodyTab.click();
    const rawRadio = contentPage.locator('.body-mode-item').filter({ hasText: /^raw$/i }).locator('.el-radio');
    await expect(rawRadio).toBeVisible({ timeout: 10000 });
    await rawRadio.click();
    const rawBodyTypeSelect = contentPage.locator('[data-testid="raw-body-type-select"]');
    await expect(rawBodyTypeSelect).toBeVisible({ timeout: 10000 });
    await rawBodyTypeSelect.click();
    const xmlOption = contentPage.locator('.el-select-dropdown__item:visible').filter({ hasText: 'xml' }).first();
    await expect(xmlOption).toBeVisible({ timeout: 10000 });
    await xmlOption.click();
    const rawTextarea = contentPage.locator('.raw-textarea textarea, .raw-editor textarea, [data-testid="raw-body-input"]');
    const rawTextareaCount = await rawTextarea.count();
    if (rawTextareaCount > 0) {
      await rawTextarea.fill('<?xml version="1.0\"?><root><name>test</name></root>');
    } else {
      const rawEditor = contentPage.locator('.raw-wrap .s-json-editor').first();
      await rawEditor.click({ force: true });
      await contentPage.keyboard.type('<?xml version=\"1.0\"?><root><name>test</name></root>');
    }
    // 保存接口，确保 Raw Body 配置会被导出到 OpenAPI
    await saveBtn.click();
    await contentPage.waitForTimeout(500);

    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const openapiOption = exportPage.locator('.item').filter({ hasText: 'OpenAPI' });
    await openapiOption.click();
    await expect(openapiOption).toHaveClass(/active/);
    await contentPage.evaluate(() => {
      const w = window as unknown as {
        __downloadRecords?: { filename: string; href: string; content?: string }[];
        __originalAnchorClick?: typeof HTMLAnchorElement.prototype.click;
        __originalRevokeObjectURL?: typeof URL.revokeObjectURL;
      };
      w.__downloadRecords = [];
      if (!w.__originalRevokeObjectURL) {
        w.__originalRevokeObjectURL = URL.revokeObjectURL.bind(URL);
        URL.revokeObjectURL = () => { };
      }
      if (!w.__originalAnchorClick) {
        w.__originalAnchorClick = HTMLAnchorElement.prototype.click;
        HTMLAnchorElement.prototype.click = function () {
          const downloadAttr = this.getAttribute('download');
          const href = this.getAttribute('href') || '';
          if (downloadAttr) {
            const record: { filename: string; href: string; content?: string } = { filename: downloadAttr, href };
            w.__downloadRecords?.push(record);
            if (href.startsWith('blob:')) {
              fetch(href).then((r) => r.text()).then((text) => {
                record.content = text;
              }).catch(() => { });
            }
          }
          return w.__originalAnchorClick!.apply(this);
        };
      }
    });
    const exportBtn = exportPage.locator('.el-button--primary').filter({ hasText: /确定导出/ });
    await exportBtn.click();
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const w = window as unknown as { __downloadRecords?: { filename: string; href: string; content?: string }[] };
        return w.__downloadRecords?.filter((r) => r.filename.endsWith('.openapi.json') && !!r.content).length || 0;
      });
    }, { timeout: 5000 }).toBeGreaterThan(0);
    const openapiJsonText = await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadRecords?: { filename: string; href: string; content?: string }[] };
      return w.__downloadRecords?.find((r) => r.filename.endsWith('.openapi.json'))?.content || '';
    });
    expect(openapiJsonText).toBeTruthy();
    const openapiJson = JSON.parse(openapiJsonText) as unknown as {
      openapi: string;
      info: { title: string };
      paths: Record<string, Record<string, {
        summary: string;
        parameters: { name: string; in: 'path' | 'query' | 'header'; required: boolean; description: string; schema: { type: string } }[];
        requestBody?: { required: boolean; content: Record<string, { schema: unknown }> };
        responses: Record<string, { description: string; content?: Record<string, { schema: unknown }> }>;
      }>>;
    };
    expect(openapiJson.openapi).toBe('3.0.3');
    expect(openapiJson.info.title).toBe(projectName);
    expect(Object.keys(openapiJson.paths).sort()).toEqual([
      '/openapi/formdata',
      '/openapi/json',
      '/openapi/params/{userId}',
      '/openapi/raw',
      '/openapi/urlencoded',
    ].sort());
    expect(openapiJson.paths['/openapi/params/{userId}']).toBeTruthy();
    expect(openapiJson.paths['/openapi/params/{userId}'].get).toBeTruthy();
    expect(openapiJson.paths['/openapi/params/{userId}'].get.summary).toBe('OpenAPI-参数组合接口');
    expect(openapiJson.paths['/openapi/params/{userId}'].get.parameters).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }),
      expect.objectContaining({ name: 'q', in: 'query', required: true, schema: { type: 'string' } }),
      expect.objectContaining({ name: 'opt', in: 'query', required: false, schema: { type: 'string' } }),
      expect.objectContaining({ name: 'X-Token', in: 'header', required: true, schema: { type: 'string' } }),
    ]));
    expect(openapiJson.paths['/openapi/json'].post).toBeTruthy();
    expect(openapiJson.paths['/openapi/json'].post.summary).toBe('OpenAPI-JSON请求体接口');
    expect(openapiJson.paths['/openapi/json'].post.requestBody?.required).toBe(true);
    expect(openapiJson.paths['/openapi/json'].post.requestBody?.content['application/json']).toBeTruthy();
    expect(openapiJson.paths['/openapi/json'].post.responses['200']).toBeTruthy();
    expect(openapiJson.paths['/openapi/json'].post.responses['200'].content?.['application/json']).toBeTruthy();
    expect(openapiJson.paths['/openapi/json'].post.responses['400']).toBeTruthy();
    expect(openapiJson.paths['/openapi/json'].post.responses['400'].content?.['text/plain']).toBeTruthy();
    expect(openapiJson.paths['/openapi/formdata'].post).toBeTruthy();
    expect(openapiJson.paths['/openapi/formdata'].post.requestBody?.content['multipart/form-data']).toBeTruthy();
    expect(openapiJson.paths['/openapi/urlencoded'].post).toBeTruthy();
    expect(openapiJson.paths['/openapi/urlencoded'].post.requestBody?.content['application/x-www-form-urlencoded']).toBeTruthy();
    expect(openapiJson.paths['/openapi/raw'].post).toBeTruthy();
    expect(openapiJson.paths['/openapi/raw'].post.requestBody?.content['application/xml']).toBeTruthy();
  });
});


