import { test, expect } from '../../../../../../fixtures/desktop.fixture';

test('保存多个响应示例后刷新仍保留，OpenAPI 导出包含同状态码示例和错误响应', async ({ contentPage, clearCache, createProject, createNode, reload }) => {
  await clearCache();
  await createProject();
  await createNode(contentPage, { nodeType: 'http', name: '响应示例导出' });
  await contentPage.getByTestId('http-params-layout-dropdown').click();
  await contentPage.getByText('上下布局', { exact: true }).click();
  const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
  // 通过真实请求保存同状态码的两个响应，以及一个错误响应
  for (const url of ['/echo?sample=first', '/echo?sample=second', '/status/404']) {
    await urlInput.fill(`http://127.0.0.1:3456${url}`);
    await contentPage.getByTestId('operation-send-btn').click();
    const saveExample = contentPage.getByTestId('response-save-example-btn');
    await expect(saveExample).toBeEnabled();
    await saveExample.click();
    await expect(contentPage.locator('.el-message--success').filter({ hasText: '响应示例已保存' }).last()).toBeVisible();
    await expect(saveExample).toBeEnabled();
  }
  await contentPage.getByTestId('http-params-tab-response').click();
  await expect(contentPage.locator('.response-collapse-card')).toHaveCount(3);
  // 清除未保存编辑缓存，验证示例确实写入持久化存储
  await contentPage.evaluate(() => localStorage.removeItem('httpNodeCache/httpNode'));
  await reload();
  await contentPage.getByTestId('http-params-tab-response').click();
  await expect(contentPage.locator('.response-collapse-card')).toHaveCount(3);
  await expect(contentPage.locator('.response-collapse-card').first()).toContainText('first');
  await expect(contentPage.locator('.response-collapse-card').nth(1)).toContainText('second');
  await expect(contentPage.locator('.response-collapse-card').last()).toContainText('404');
  await contentPage.screenshot({ path: 'test-results/response-examples.png' });
  // 捕获用户点击导出生成的文件，避免弹出系统下载窗口
  await contentPage.evaluate(() => {
    const originalCreateObjectURL = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      if (blob instanceof Blob) {
        void blob.text().then(text => {
          (window as unknown as { responseExampleExport: string }).responseExampleExport = text;
        });
      }
      return originalCreateObjectURL(blob);
    };
    document.addEventListener('click', event => {
      if (event.target instanceof HTMLAnchorElement && event.target.download) event.preventDefault();
    });
  });
  await contentPage.getByTestId('banner-tool-more-btn').click();
  await contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: '导出文档' }).click();
  const exportPage = contentPage.locator('.doc-export');
  await exportPage.locator('.item').filter({ hasText: 'OpenAPI' }).click();
  await exportPage.getByRole('button', { name: '确定导出' }).click();
  await expect.poll(() => contentPage.evaluate(() => (window as unknown as { responseExampleExport?: string }).responseExampleExport || '')).toContain('openapi');
  const exported = JSON.parse(await contentPage.evaluate(() => (window as unknown as { responseExampleExport: string }).responseExampleExport)) as {
    paths: Record<string, { get: { responses: Record<string, { content: Record<string, { examples: Record<string, { value: { query?: { sample: string }; statusCode?: number } }> }> }> } }>;
  };
  const responses = exported.paths['/status/404'].get.responses;
  expect(Object.values(responses['200'].content['application/json'].examples).map(example => example.value.query?.sample)).toEqual(['first', 'second']);
  expect(Object.values(responses['404'].content['application/json'].examples)[0].value.statusCode).toBe(404);
});
test('空响应可以保存为示例，文件响应无法保存', async ({ contentPage, clearCache, createProject, createNode }) => {
  await clearCache();
  await createProject();
  await createNode(contentPage, { nodeType: 'http', name: '空响应示例' });
  const urlInput = contentPage.locator('[data-testid="url-input"] [contenteditable]');
  // 保存 204 响应，只保留状态码，不生成不存在的正文
  await urlInput.fill('http://127.0.0.1:3456/status/204');
  await contentPage.getByTestId('operation-send-btn').click();
  const saveExample = contentPage.getByTestId('response-save-example-btn');
  await expect(saveExample).toBeEnabled();
  await saveExample.click();
  await expect(contentPage.locator('.el-message--success')).toContainText('响应示例已保存');
  await contentPage.getByTestId('http-params-tab-response').click();
  await expect(contentPage.locator('.response-collapse-card')).toHaveCount(1);
  await expect(contentPage.locator('.response-collapse-card')).toContainText('204');
  // 下载文件不应被保存为空的文本示例
  await urlInput.fill('http://127.0.0.1:3456/file/force-download');
  await contentPage.getByTestId('operation-send-btn').click();
  await expect(contentPage.getByTestId('response-tab-body')).toContainText('下载文件');
  await expect(saveExample).toBeDisabled();
  await expect(contentPage.locator('.response-collapse-card')).toHaveCount(1);
});
test('保存 HTML 响应保留正文和类型，在左右布局中可用', async ({ contentPage, clearCache, createProject, createNode }) => {
  await clearCache();
  await createProject();
  await createNode(contentPage, { nodeType: 'http', name: '文本响应示例' });
  // 切换布局并发送真实 HTML 响应
  await contentPage.getByTestId('http-params-layout-dropdown').click();
  await contentPage.getByText('左右布局', { exact: true }).click();
  await contentPage.locator('[data-testid="url-input"] [contenteditable]').fill('http://127.0.0.1:3456/response-example/html');
  await contentPage.getByTestId('operation-send-btn').click();
  const saveExample = contentPage.getByTestId('response-save-example-btn');
  await expect(saveExample).toBeEnabled();
  await saveExample.click();
  await expect(contentPage.locator('.el-message--success')).toContainText('响应示例已保存');
  await contentPage.getByTestId('http-params-tab-response').click();
  const exampleCard = contentPage.locator('.response-collapse-card');
  await expect(exampleCard).toHaveCount(1);
  await expect(exampleCard).toContainText('text/html');
  await expect(exampleCard).toContainText('Example response');
  await contentPage.screenshot({ path: 'test-results/response-example-horizontal.png' });
});
test('保存失败不会留下重复示例，可以再次保存', async ({ contentPage, clearCache, createProject, createNode }) => {
  await clearCache();
  await createProject();
  await createNode(contentPage, { nodeType: 'http', name: '响应示例保存失败' });
  await contentPage.locator('[data-testid="url-input"] [contenteditable]').fill('http://127.0.0.1:3456/status/200');
  await contentPage.getByTestId('operation-send-btn').click();
  const saveExample = contentPage.getByTestId('response-save-example-btn');
  await expect(saveExample).toBeEnabled();
  // 模拟一次持久化写入失败，随后恢复正常数据库操作
  await contentPage.evaluate(() => {
    const originalPut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = new Proxy(originalPut, {
      apply: (target, store: IDBObjectStore, args: unknown[]) => {
        if (store.name === 'httpNodeList') {
          IDBObjectStore.prototype.put = originalPut;
          throw new Error('模拟响应示例保存失败');
        }
        return Reflect.apply(target, store, args);
      },
    });
  });
  await saveExample.click();
  await expect(contentPage.locator('.el-message--error')).toContainText('保存响应示例失败');
  await contentPage.getByTestId('http-params-tab-response').click();
  await expect(contentPage.locator('.response-collapse-card')).toHaveCount(1);
  await expect(contentPage.locator('.response-collapse-card')).toContainText('成功返回');
  // 重试成功后只保留一条实际示例
  await expect(saveExample).toBeEnabled();
  await saveExample.click();
  await expect(contentPage.locator('.el-message--success')).toContainText('响应示例已保存');
  await expect(contentPage.locator('.response-collapse-card')).toHaveCount(1);
  await expect(contentPage.locator('.response-collapse-card')).toContainText('响应示例 200');
});
