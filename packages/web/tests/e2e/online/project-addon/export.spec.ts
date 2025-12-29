import { test, expect } from '../../../fixtures/electron-online.fixture';

const MOCK_SERVER_PORT = 3456;

test.describe('Export', () => {
  test('导出弹窗显示HTML、WORD、JSON文档、OpenAPI四种导出类型', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    await expect(exportPage.locator('.item').filter({ hasText: 'HTML' })).toBeVisible();
    await expect(exportPage.locator('.item').filter({ hasText: 'WORD' })).toBeVisible();
    await expect(exportPage.locator('.item').filter({ hasText: /JSON文档/ })).toBeVisible();
    await expect(exportPage.locator('.item').filter({ hasText: 'OpenAPI' })).toBeVisible();
  });
  test('选择JSON文档类型后显示active状态', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const jsonOption = exportPage.locator('.item').filter({ hasText: /JSON文档/ });
    await jsonOption.click();
    await expect(jsonOption).toHaveClass(/active/);
  });
  test('选择OpenAPI类型后显示active状态', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const openapiOption = exportPage.locator('.item').filter({ hasText: 'OpenAPI' });
    await openapiOption.click();
    await expect(openapiOption).toHaveClass(/active/);
  });
  test('开启选择导出后显示el-tree节点树', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增接口|新建接口|Add/ });
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('测试接口');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const selectExportCheckbox = exportPage.locator('.config-item').filter({ hasText: /选择导出/ }).locator('.el-checkbox');
    await expect(selectExportCheckbox).toBeVisible({ timeout: 5000 });
    await selectExportCheckbox.click();
    await contentPage.waitForTimeout(300);
    const tree = exportPage.locator('.el-tree');
    await expect(tree).toBeVisible({ timeout: 5000 });
    await expect(tree.locator('.el-tree-node').first()).toBeVisible();
  });
  test('在线模式创建全类型节点与参数组合,导出JSON并校验内容', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    const projectName = '导出JSON全量测试项目';
    await createProject(projectName);
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });

    const addFolderBtn = contentPage.getByTestId('banner-add-folder-btn');
    await addFolderBtn.click();
    const addFolderDialog = contentPage.locator('.el-dialog').filter({ hasText: /新增文件夹|新建文件夹|Add Folder/ });
    await expect(addFolderDialog).toBeVisible({ timeout: 5000 });
    await addFolderDialog.locator('input').first().fill('导出测试文件夹');
    await addFolderDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);

    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');

    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('导出测试WebSocket节点');
    await addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket' }).first().click();
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);

    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('导出测试HTTP Mock节点');
    await addFileDialog.locator('.el-radio').filter({ hasText: 'HTTP Mock' }).first().click();
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);

    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('导出测试WebSocket Mock节点');
    await addFileDialog.locator('.el-radio').filter({ hasText: 'WebSocket Mock' }).first().click();
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);

    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('OpenAPI-参数组合接口');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/openapi/params/{userId}`);
    await contentPage.waitForTimeout(500);
    const paramsTab = contentPage.locator('[data-testid="http-params-tab-params"]');
    await paramsTab.click();
    await contentPage.waitForTimeout(300);
    const queryParamsTree = contentPage.locator('.query-path-params .cl-params-tree').first();
    const queryRows = queryParamsTree.locator('[data-testid="params-tree-row"]');
    await queryRows.nth(0).locator('[data-testid="params-tree-key-input"] input').fill('q');
    await queryRows.nth(0).locator('[data-testid="params-tree-value-input"]').click();
    await contentPage.keyboard.type('1');
    await queryRows.nth(0).locator('[data-testid="params-tree-required-checkbox"]').click();
    await queryRows.nth(1).locator('[data-testid="params-tree-key-input"] input').fill('opt');
    await queryRows.nth(1).locator('[data-testid="params-tree-value-input"]').click();
    await contentPage.keyboard.type('2');
    const pathParamsTree = contentPage.locator('.query-path-params .cl-params-tree').nth(1);
    const userIdRow = pathParamsTree.locator('[data-testid="params-tree-row"][data-row-key=\"userId\"]');
    await userIdRow.locator('[data-testid="params-tree-required-checkbox"]').click();
    const headersTab = contentPage.locator('[data-testid="http-params-tab-headers"]');
    await headersTab.click();
    await contentPage.waitForTimeout(300);
    const headerTree = contentPage.locator('.header-info .cl-params-tree').last();
    const headerRows = headerTree.locator('[data-testid="params-tree-row"]');
    await headerRows.nth(0).locator('[data-testid="params-tree-key-input"] input').fill('X-Token');
    await headerRows.nth(0).locator('[data-testid="params-tree-value-input"]').click();
    await contentPage.keyboard.type('token_value');
    await headerRows.nth(0).locator('[data-testid="params-tree-required-checkbox"]').click();
    await contentPage.waitForTimeout(300);

    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('OpenAPI-JSON请求体接口');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/openapi/json`);
    const methodSelect = contentPage.locator('[data-testid="method-select"]');
    await methodSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).first().click();
    const bodyTab = contentPage.locator('[data-testid="http-params-tab-body"]');
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    await contentPage.locator('.body-mode-item').filter({ hasText: /^json$/i }).locator('.el-radio').click();
    await contentPage.waitForTimeout(300);
    const jsonEditor = contentPage.locator('.s-json-editor').first();
    await jsonEditor.click({ force: true });
    await contentPage.keyboard.press('Control+a');
    await contentPage.keyboard.type('{"name":"test","count":1,"active":true}');
    await contentPage.waitForTimeout(300);

    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('OpenAPI-FormData请求体接口');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/openapi/formdata`);
    await methodSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).first().click();
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    await contentPage.locator('.body-mode-item').filter({ hasText: /^form-data$/i }).locator('.el-radio').click();
    await contentPage.waitForTimeout(300);
    const formTree = contentPage.locator('.body-params .cl-params-tree').first();
    const formRows = formTree.locator('[data-testid="params-tree-row"]');
    await formRows.nth(0).locator('[data-testid="params-tree-key-input"] input').fill('file');
    await formRows.nth(0).locator('[data-testid="params-tree-type-select"]').click();
    await contentPage.waitForTimeout(200);
    await contentPage.locator('.el-select-dropdown__item:visible').filter({ hasText: /^File$/ }).first().click();
    await contentPage.waitForTimeout(200);
    await formRows.nth(0).locator('[data-testid="params-tree-required-checkbox"]').click();
    await formRows.nth(1).locator('[data-testid="params-tree-key-input"] input').fill('name');
    await formRows.nth(1).locator('[data-testid="params-tree-value-input"]').click();
    await contentPage.keyboard.type('test');
    await contentPage.waitForTimeout(300);

    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('OpenAPI-UrlEncoded请求体接口');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/openapi/urlencoded`);
    await methodSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).first().click();
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    await contentPage.locator('.body-mode-item').filter({ hasText: /^x-www-form-urlencoded$/i }).locator('.el-radio').click();
    await contentPage.waitForTimeout(300);
    const urlencodedTree = contentPage.locator('.body-params .cl-params-tree').first();
    const urlencodedRows = urlencodedTree.locator('[data-testid="params-tree-row"]');
    await urlencodedRows.nth(0).locator('[data-testid="params-tree-key-input"] input').fill('a');
    await urlencodedRows.nth(0).locator('[data-testid="params-tree-value-input"]').click();
    await contentPage.keyboard.type('1');
    await urlencodedRows.nth(0).locator('[data-testid="params-tree-required-checkbox"]').click();
    await contentPage.waitForTimeout(300);

    await addFileBtn.click();
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('OpenAPI-Raw请求体接口');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    await urlInput.fill(`http://127.0.0.1:${MOCK_SERVER_PORT}/openapi/raw`);
    await methodSelect.click();
    await contentPage.locator('.el-select-dropdown__item').filter({ hasText: 'POST' }).first().click();
    await bodyTab.click();
    await contentPage.waitForTimeout(300);
    await contentPage.locator('.body-mode-item').filter({ hasText: /^raw$/i }).locator('.el-radio').click();
    await contentPage.waitForTimeout(300);
    await contentPage.locator('[data-testid="raw-body-type-select"]').click();
    await contentPage.waitForTimeout(200);
    await contentPage.locator('.el-select-dropdown__item:visible').filter({ hasText: 'xml' }).first().click();
    await contentPage.waitForTimeout(200);
    const rawEditor = contentPage.locator('.raw-wrap .s-json-editor').first();
    await rawEditor.click({ force: true });
    await contentPage.keyboard.type('<?xml version=\"1.0\"?><root><name>test</name></root>');
    await contentPage.waitForTimeout(300);

    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const jsonOption = exportPage.locator('.item').filter({ hasText: /JSON文档/ });
    await jsonOption.click();
    await expect(jsonOption).toHaveClass(/active/);
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
        return w.__downloadRecords?.filter((r) => r.filename.endsWith('.json') && !!r.content).length || 0;
      });
    }, { timeout: 15000 }).toBeGreaterThan(0);
    const exportJsonText = await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadRecords?: { filename: string; href: string; content?: string }[] };
      return w.__downloadRecords?.find((r) => r.filename.endsWith('.json'))?.content || '';
    });
    expect(exportJsonText).toBeTruthy();
    const exportJson = JSON.parse(exportJsonText) as unknown as {
      type?: string;
      info?: { projectName?: string };
      docs?: { info?: { name?: string; type?: string }; item?: { requestBody?: { mode?: string; raw?: { dataType?: string } } } }[];
    };
    expect(exportJson.type).toBe('apiflow');
    expect(exportJson.info?.projectName).toBe(projectName);
    expect(exportJson.docs?.some((d) => d.info?.name === '导出测试文件夹' && d.info?.type === 'folder')).toBeTruthy();
    expect(exportJson.docs?.some((d) => d.info?.name === '导出测试WebSocket节点' && d.info?.type === 'websocket')).toBeTruthy();
    expect(exportJson.docs?.some((d) => d.info?.name === '导出测试HTTP Mock节点' && d.info?.type === 'httpMock')).toBeTruthy();
    expect(exportJson.docs?.some((d) => d.info?.name === '导出测试WebSocket Mock节点' && d.info?.type === 'websocketMock')).toBeTruthy();
    expect(exportJson.docs?.some((d) => d.info?.name === 'OpenAPI-JSON请求体接口' && d.info?.type === 'http' && d.item?.requestBody?.mode === 'json')).toBeTruthy();
    expect(exportJson.docs?.some((d) => d.info?.name === 'OpenAPI-FormData请求体接口' && d.info?.type === 'http' && d.item?.requestBody?.mode === 'formdata')).toBeTruthy();
    expect(exportJson.docs?.some((d) => d.info?.name === 'OpenAPI-UrlEncoded请求体接口' && d.info?.type === 'http' && d.item?.requestBody?.mode === 'urlencoded')).toBeTruthy();
    expect(exportJson.docs?.some((d) => d.info?.name === 'OpenAPI-Raw请求体接口' && d.info?.type === 'http' && d.item?.requestBody?.mode === 'raw' && d.item?.requestBody?.raw?.dataType === 'application/xml')).toBeTruthy();
  });
  test('导出HTML文档格式,点击确定导出按钮触发下载', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('HTML导出测试接口');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const htmlOption = exportPage.locator('.item').filter({ hasText: 'HTML' });
    await htmlOption.click();
    await expect(htmlOption).toHaveClass(/active/);
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
            w.__downloadRecords?.push({ filename: downloadAttr, href });
          }
          return w.__originalAnchorClick!.apply(this);
        };
      }
    });
    const exportBtn = exportPage.locator('.el-button--primary').filter({ hasText: /确定导出/ });
    await exportBtn.click();
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const w = window as unknown as { __downloadRecords?: { filename: string }[] };
        return w.__downloadRecords?.length || 0;
      });
    }, { timeout: 15000 }).toBeGreaterThan(0);
    const filenames = await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadRecords?: { filename: string }[] };
      return (w.__downloadRecords || []).map((r) => r.filename);
    });
    expect(filenames.some((name) => name.endsWith('.html'))).toBeTruthy();
  });
  test('导出WORD文档格式,点击确定导出按钮触发下载', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('WORD导出测试接口');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const wordOption = exportPage.locator('.item').filter({ hasText: 'WORD' });
    await wordOption.click();
    await expect(wordOption).toHaveClass(/active/);
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
            w.__downloadRecords?.push({ filename: downloadAttr, href });
          }
          return w.__originalAnchorClick!.apply(this);
        };
      }
    });
    const exportBtn = exportPage.locator('.el-button--primary').filter({ hasText: /确定导出/ });
    await exportBtn.click();
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const w = window as unknown as { __downloadRecords?: { filename: string }[] };
        return w.__downloadRecords?.length || 0;
      });
    }, { timeout: 15000 }).toBeGreaterThan(0);
    const filenames = await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadRecords?: { filename: string }[] };
      return (w.__downloadRecords || []).map((r) => r.filename);
    });
    expect(filenames.some((name) => name.endsWith('.docx'))).toBeTruthy();
  });
  test('在线模式选择OpenAPI后点击确定导出提示仅支持离线模式且不触发下载', async ({ topBarPage, contentPage, clearCache, createProject, loginAccount }) => {
    await clearCache();
    await loginAccount();
    await createProject();
    await contentPage.waitForURL(/.*?#?\/workbench/, { timeout: 5000 });
    const addFileBtn = contentPage.getByTestId('banner-add-http-btn');
    await addFileBtn.click();
    const addFileDialog = contentPage.locator('[data-testid="add-file-dialog"]');
    await expect(addFileDialog).toBeVisible({ timeout: 5000 });
    await addFileDialog.locator('input').first().fill('OpenAPI提示测试接口');
    await addFileDialog.locator('.el-button--primary').last().click();
    await contentPage.waitForTimeout(500);
    const moreBtn = contentPage.locator('[data-testid="banner-tool-more-btn"]');
    await moreBtn.click();
    const exportItem = contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: /导出文档/ });
    await exportItem.click();
    await contentPage.waitForTimeout(500);
    const exportPage = contentPage.locator('.doc-export');
    await expect(exportPage).toBeVisible({ timeout: 5000 });
    const openapiOption = exportPage.locator('.item').filter({ hasText: 'OpenAPI' });
    await openapiOption.click();
    await expect(openapiOption).toHaveClass(/active/);
    await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadRecords?: { filename: string; href: string }[] };
      w.__downloadRecords = [];
    });
    const exportBtn = exportPage.locator('.el-button--primary').filter({ hasText: /确定导出/ });
    await exportBtn.click();
    await expect(contentPage.getByText(/OpenAPI导出仅支持离线模式/)).toBeVisible({ timeout: 5000 });
    const downloadCount = await contentPage.evaluate(() => {
      const w = window as unknown as { __downloadRecords?: { filename: string; href: string }[] };
      return w.__downloadRecords?.length || 0;
    });
    expect(downloadCount).toBe(0);
  });
});
