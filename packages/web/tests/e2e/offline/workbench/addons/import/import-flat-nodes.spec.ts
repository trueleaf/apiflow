import { test, expect } from '../../../../../fixtures/desktop.fixture';

test('多层目录导入移除旧预览 children，保留原创建者和父子关系（issue #51）', async ({ contentPage, clearCache, createProject }) => {
  await clearCache();
  await createProject();
  await contentPage.waitForURL(/.*?#?\/workbench/);
  const projectId = new URL(contentPage.url().split('#')[1], 'http://localhost').searchParams.get('id');
  expect(projectId).toBeTruthy();
  const httpNode = {
    _id: 'import-http', pid: 'import-child-folder', projectId, sort: 2,
    info: { name: '多层目录接口', type: 'http', creator: '原创建者', description: '', version: '1.0', maintainer: '', deletePerson: '' },
    item: {
      method: 'GET', url: { path: '/ping', prefix: 'https://example.com/v1' },
      paths: [], queryParams: [], headers: [], contentType: '', responseParams: [],
      requestBody: {
        mode: 'none', rawJson: '', formdata: [], urlencoded: [],
        raw: { data: '', dataType: 'text/plain' },
        binary: { mode: 'file', varValue: '', binaryValue: { path: '', raw: '', id: '' } },
      },
    },
    preRequest: { raw: '' }, afterRequest: { raw: '' }, isDeleted: false,
  };
  await contentPage.getByTestId('banner-tool-more-btn').click();
  await contentPage.locator('.tool-panel .dropdown-item').filter({ hasText: '导入文档' }).click();
  const importPage = contentPage.locator('.doc-import');
  await importPage.locator('.source-item').filter({ hasText: '粘贴内容' }).click();
  // 扁平节点列表附带旧版预览产生的 children，嵌套副本的创建者为空
  await importPage.locator('.paste-import textarea').fill(JSON.stringify({
    type: 'apiflow', info: { projectName: '旧预览数据' },
    docs: [
      { _id: 'import-root-folder', pid: '', projectId, sort: 0, info: { name: '根目录', type: 'folder', creator: '原创建者' } },
      {
        _id: 'import-child-folder', pid: 'import-root-folder', projectId, sort: 1,
        info: { name: '子目录', type: 'folder', creator: '原创建者' },
        children: [{ ...httpNode, info: { ...httpNode.info, creator: '' } }],
      },
      httpNode,
    ],
  }));
  await importPage.getByRole('button', { name: '解析内容' }).click();
  // 多层预览不能重复展示接口，也不能依赖旧 children 构建目录
  await expect(importPage.locator('.el-tree .custom-tree-node')).toHaveCount(3);
  await expect(importPage.locator('.el-tree .custom-tree-node').filter({ hasText: '多层目录接口' })).toHaveCount(1);
  await importPage.getByRole('button', { name: '确定导入' }).click();
  await expect(contentPage.locator('.el-message--success').filter({ hasText: '导入成功' })).toBeVisible();
  // 读取实际持久化节点，验证 ID 重建后的两层父子关系
  const storedDocs = await contentPage.evaluate(async projectId => {
    return await new Promise<unknown[]>((resolve, reject) => {
      const openRequest = indexedDB.open('workspaceDataCache');
      openRequest.onerror = () => reject(openRequest.error);
      openRequest.onsuccess = () => {
        const database = openRequest.result;
        const nodesRequest = database.transaction('httpNodeList', 'readonly').objectStore('httpNodeList').index('projectId').getAll(projectId);
        nodesRequest.onerror = () => { database.close(); reject(nodesRequest.error); };
        nodesRequest.onsuccess = () => { database.close(); resolve(nodesRequest.result as unknown[]); };
      };
    });
  }, projectId!) as { _id: string; pid: string; children?: unknown[]; info: { name: string; creator: string }; item?: { url: { prefix: string; host: string } } }[];
  expect(storedDocs).toHaveLength(3);
  expect(storedDocs.every(doc => !Object.hasOwn(doc, 'children'))).toBeTruthy();
  expect(storedDocs.every(doc => doc.info.creator === '原创建者')).toBeTruthy();
  const root = storedDocs.find(doc => doc.info.name === '根目录');
  const child = storedDocs.find(doc => doc.info.name === '子目录');
  const importedHttp = storedDocs.find(doc => doc.info.name === '多层目录接口');
  expect(root?.pid).toBe('');
  expect(child?.pid).toBe(root?._id);
  expect(importedHttp?.pid).toBe(child?._id);
  expect(importedHttp?.item?.url.prefix).toBe('https://example.com/v1');
  expect(importedHttp?.item?.url.host).toBe('https://example.com/v1');
});
