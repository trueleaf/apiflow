import { test, expect } from '../../../fixtures/electron.fixture';

test.describe('ShareRuntime', () => {
  // 分享态覆盖：接口正常/异常分支、密码缓存回滚、无权限到有权限切换、倒计时展示
  test('离线模式下分享页支持密码校验回滚与权限切换', async ({ contentPage, clearCache }) => {
    await clearCache();
    // 预置错误缓存密码和已选中 tab，触发自动验密失败与后续 doc_detail 拉取
    await contentPage.evaluate(() => {
      localStorage.setItem('projectCache/share/password', JSON.stringify({
        local_share: 'wrong-pass',
      }));
      localStorage.setItem('apiflow/projectWorkbench/node/navs', JSON.stringify({
        local_share: [
          {
            _id: 'doc-http-1',
            projectId: 'local_share',
            tabType: 'http',
            label: '分享HTTP文档',
            saved: true,
            fixed: false,
            selected: true,
            head: {
              icon: 'GET',
              color: '',
            },
          },
        ],
      }));
    });
    let shareInfoCount = 0;
    let verifyPasswordCount = 0;
    let shareDocDetailCount = 0;
    await contentPage.route('**/api/project/share_info**', async (route) => {
      shareInfoCount += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: {
            projectName: '分享项目A',
            shareName: '离线分享A',
            expire: Date.now() + 60 * 60 * 1000,
            needPassword: true,
          },
        }),
      });
    });
    await contentPage.route('**/api/project/verify_share_password**', async (route) => {
      verifyPasswordCount += 1;
      const postData = route.request().postDataJSON() as {
        password?: string
      };
      if (postData.password === 'correct-pass') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 0,
            data: {
              variables: [],
              banner: [
                {
                  _id: 'doc-http-1',
                  updatedAt: '2026-02-25T10:00:00.000Z',
                  type: 'http',
                  sort: 1,
                  pid: '',
                  name: '分享HTTP文档',
                  maintainer: 'tester',
                  method: 'GET',
                  url: '/orders/list',
                  readonly: false,
                  children: [],
                },
              ],
            },
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 1023,
          msg: '密码错误',
          data: null,
        }),
      });
    });
    await contentPage.route('**/api/project/share_doc_detail**', async (route) => {
      shareDocDetailCount += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: {
            _id: 'doc-http-1',
            pid: '',
            projectId: 'local_share',
            sort: 1,
            info: {
              name: '分享HTTP文档',
              description: '',
              version: '1.0.0',
              type: 'http',
              creator: 'tester',
              maintainer: 'tester',
              deletePerson: '',
            },
            item: {
              method: 'GET',
              url: {
                prefix: 'https://api.share.local',
                path: '/orders/list',
              },
              paths: [],
              queryParams: [],
              requestBody: {
                mode: 'none',
                rawJson: '',
                formdata: [],
                urlencoded: [],
                raw: {
                  data: '',
                  dataType: 'text/plain',
                },
                binary: {
                  mode: 'var',
                  varValue: '',
                  binaryValue: {
                    path: '',
                    raw: '',
                    id: '',
                  },
                },
              },
              responseParams: [],
              headers: [],
              contentType: '',
            },
            preRequest: {
              raw: '',
            },
            afterRequest: {
              raw: '',
            },
            createdAt: '2026-02-25T10:00:00.000Z',
            updatedAt: '2026-02-25T10:00:00.000Z',
            isDeleted: false,
          },
        }),
      });
    });
    // 通过用户侧跳转进入分享页
    await contentPage.evaluate(() => {
      window.location.hash = '#/share';
    });
    await contentPage.waitForURL(/.*#\/share/, { timeout: 10000 });
    const noPermissionPanel = contentPage.locator('.no-permission');
    await expect(noPermissionPanel).toBeVisible({ timeout: 10000 });
    await expect(noPermissionPanel).toContainText('过期倒计时');
    // 错误缓存密码自动校验失败后应被清理
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const raw = localStorage.getItem('projectCache/share/password') || '{}';
        const parsed = JSON.parse(raw) as Record<string, string>;
        return parsed.local_share || '';
      });
    }, { timeout: 10000 }).toBe('');
    // 手动输入正确密码，进入有权限态并落盘密码缓存
    const passwordInput = noPermissionPanel.locator('input[placeholder="请输入访问密码"]').first();
    await passwordInput.fill('correct-pass');
    await noPermissionPanel.locator('.el-button').filter({ hasText: /确认密码/ }).first().click();
    await expect(contentPage.locator('.doc-share')).toBeVisible({ timeout: 10000 });
    await expect(contentPage.locator('.api-doc-title')).toContainText('分享HTTP文档');
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const raw = localStorage.getItem('projectCache/share/password') || '{}';
        const parsed = JSON.parse(raw) as Record<string, string>;
        return parsed.local_share || '';
      });
    }, { timeout: 10000 }).toBe('correct-pass');
    await expect.poll(() => shareInfoCount, { timeout: 10000 }).toBe(1);
    await expect.poll(() => verifyPasswordCount, { timeout: 10000 }).toBe(2);
    await expect.poll(() => shareDocDetailCount, { timeout: 10000 }).toBe(1);
  });
  // 分享态覆盖：折叠状态缓存与 tab 恢复链路
  test('离线模式下分享页支持折叠状态缓存与tab恢复', async ({ contentPage, clearCache }) => {
    await clearCache();
    // 预置分享 tab 缓存，验证刷新后恢复并再次触发 doc_detail
    await contentPage.evaluate(() => {
      localStorage.setItem('apiflow/projectWorkbench/node/navs', JSON.stringify({
        local_share: [
          {
            _id: 'doc-http-2',
            projectId: 'local_share',
            tabType: 'http',
            label: '缓存恢复文档',
            saved: true,
            fixed: false,
            selected: true,
            head: {
              icon: 'GET',
              color: '',
            },
          },
        ],
      }));
      localStorage.removeItem('apiflow/share/collapse-state');
    });
    let shareInfoCount = 0;
    let shareDocDetailCount = 0;
    await contentPage.route('**/api/project/share_info**', async (route) => {
      shareInfoCount += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: {
            projectName: '分享项目B',
            shareName: '离线分享B',
            expire: null,
            needPassword: false,
          },
        }),
      });
    });
    await contentPage.route('**/api/project/share_doc_detail**', async (route) => {
      shareDocDetailCount += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: {
            _id: 'doc-http-2',
            pid: '',
            projectId: 'local_share',
            sort: 1,
            info: {
              name: '缓存恢复文档',
              description: '',
              version: '1.0.0',
              type: 'http',
              creator: 'tester',
              maintainer: 'tester',
              deletePerson: '',
            },
            item: {
              method: 'GET',
              url: {
                prefix: 'https://api.share.local',
                path: '/cache/doc',
              },
              paths: [],
              queryParams: [
                {
                  _id: 'query-1',
                  key: 'page',
                  value: '1',
                  type: 'string',
                  required: false,
                  description: '',
                  select: true,
                },
              ],
              requestBody: {
                mode: 'none',
                rawJson: '',
                formdata: [],
                urlencoded: [],
                raw: {
                  data: '',
                  dataType: 'text/plain',
                },
                binary: {
                  mode: 'var',
                  varValue: '',
                  binaryValue: {
                    path: '',
                    raw: '',
                    id: '',
                  },
                },
              },
              responseParams: [],
              headers: [],
              contentType: '',
            },
            preRequest: {
              raw: '',
            },
            afterRequest: {
              raw: '',
            },
            createdAt: '2026-02-25T10:00:00.000Z',
            updatedAt: '2026-02-25T10:00:00.000Z',
            isDeleted: false,
          },
        }),
      });
    });
    await contentPage.evaluate(() => {
      window.location.hash = '#/share';
    });
    await contentPage.waitForURL(/.*#\/share/, { timeout: 10000 });
    await expect(contentPage.locator('.doc-share')).toBeVisible({ timeout: 10000 });
    await expect(contentPage.locator('.api-doc-title')).toContainText('缓存恢复文档');
    await expect(contentPage.locator('.nav .item.active')).toContainText('缓存恢复文档');
    const queryBlock = contentPage.locator('.api-doc-block').filter({ hasText: /Query 参数/ }).first();
    const queryContent = queryBlock.locator('.api-doc-block-content').first();
    await expect(queryContent).toBeVisible();
    await queryBlock.locator('.api-doc-block-header').first().click();
    await expect(queryContent).toBeHidden();
    // 折叠状态写入缓存后刷新，验证状态与 tab 都能恢复
    await expect.poll(async () => {
      return await contentPage.evaluate(() => {
        const raw = localStorage.getItem('apiflow/share/collapse-state') || '{}';
        const parsed = JSON.parse(raw) as Record<string, { query?: boolean }>;
        const docState = parsed['doc-http-2'];
        if (!docState || typeof docState.query !== 'boolean') {
          return '';
        }
        return String(docState.query);
      });
    }, { timeout: 10000 }).toBe('false');
    await contentPage.reload();
    await contentPage.waitForURL(/.*#\/share/, { timeout: 10000 });
    await expect(contentPage.locator('.api-doc-title')).toContainText('缓存恢复文档');
    await expect(contentPage.locator('.nav .item.active')).toContainText('缓存恢复文档');
    const queryBlockAfterReload = contentPage.locator('.api-doc-block').filter({ hasText: /Query 参数/ }).first();
    const queryContentAfterReload = queryBlockAfterReload.locator('.api-doc-block-content').first();
    await expect(queryContentAfterReload).toBeHidden();
    await expect.poll(() => shareInfoCount, { timeout: 10000 }).toBe(2);
    await expect.poll(() => shareDocDetailCount, { timeout: 10000 }).toBe(2);
  });
});
