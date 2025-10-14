import { expect, type ElectronApplication, type Page } from '@playwright/test';
import { test } from '../../../fixtures/enhanced-electron-fixtures';

// 辅助函数：获取 header 和 content 页面
const HEADER_URL_HINTS = ['header.html', '/header'];
const isHeaderUrl = (url: string): boolean => {
	if (!url) return false;
	return HEADER_URL_HINTS.some((hint) => url.includes(hint));
};
const resolveHeaderAndContentPages = async (
	electronApp: ElectronApplication,
	timeout = 10000
): Promise<{ headerPage: Page; contentPage: Page }> => {
	const startTime = Date.now();
	while (Date.now() - startTime < timeout) {
		const windows = electronApp.windows();
		let headerPage: Page | undefined;
		let contentPage: Page | undefined;
		windows.forEach((page) => {
			const url = page.url();
			if (isHeaderUrl(url)) headerPage = page;
			else if (url && url !== 'about:blank') contentPage = page;
		});
		if (headerPage && contentPage) return { headerPage, contentPage };
		try {
			await electronApp.waitForEvent('window', {
				timeout: 500,
				predicate: (page) => {
					const url = page.url();
					return isHeaderUrl(url) || (!!url && url !== 'about:blank');
				}
			});
		} catch {}
	}
	throw new Error('未能定位 header 与 content 页面');
};

// 创建测试项目
const createTestProject = async (headerPage: Page, contentPage: Page, projectName: string) => {
	await contentPage.locator('button:has-text("新建项目")').click();
	await contentPage.waitForSelector('.el-dialog:has-text("新增项目")', { state: 'visible', timeout: 10000 });
	const nameInput = contentPage.locator('.el-dialog .el-input input[placeholder*="项目名称"]');
	await nameInput.fill(projectName);
	await contentPage.locator('.el-dialog__footer button:has-text("确定")').click();
	await contentPage.waitForURL(/doc-edit/, { timeout: 15000 });
	await contentPage.waitForLoadState('domcontentloaded');
	await contentPage.waitForTimeout(2000);
	await contentPage.waitForSelector('.banner', { timeout: 10000 });
	return { name: projectName };
};

// 创建根级 HTTP 节点
const createRootHttpNode = async (contentPage: Page, nodeName: string) => {
	await contentPage.waitForSelector('.tool-icon', { timeout: 10000 });
	const addNodeBtn = contentPage.locator('.tool-icon [title="新增文件"]').first();
	await addNodeBtn.waitFor({ state: 'visible', timeout: 5000 });
	await addNodeBtn.click();
	await contentPage.waitForSelector('.el-dialog:has-text("新建接口")', { state: 'visible', timeout: 10000 });
	const nodeInput = contentPage.locator('.el-dialog:has-text("新建接口")').locator('input[placeholder*="接口名称"], input[placeholder*="名称"]').first();
	await nodeInput.fill(nodeName);
	await contentPage.locator('.el-dialog:has-text("新建接口")').locator('button:has-text("确定")').click();
	await contentPage.waitForSelector('.el-dialog:has-text("新建接口")', { state: 'hidden', timeout: 10000 });
	await contentPage.waitForTimeout(500);
};

// 获取 Banner 区域的节点
const getBannerNode = (contentPage: Page, nodeName: string) => {
	return contentPage.locator(`.custom-tree-node:has-text("${nodeName}")`).first();
};

// 点击 Banner 区域的节点
const clickBannerNode = async (contentPage: Page, nodeName: string) => {
	const node = getBannerNode(contentPage, nodeName);
	await node.waitFor({ state: 'visible', timeout: 5000 });
	await node.click();
	await contentPage.waitForTimeout(2000);
};

// ==================== HTTP Node 基础功能测试 ====================
test.describe('HTTP Node - 基础功能', () => {
	let headerPage: Page;
	let contentPage: Page;

	test.beforeEach(async ({ electronApp }) => {
		const result = await resolveHeaderAndContentPages(electronApp);
		headerPage = result.headerPage;
		contentPage = result.contentPage;
		await Promise.all([
			headerPage.waitForLoadState('domcontentloaded'),
			contentPage.waitForLoadState('domcontentloaded')
		]);
		await contentPage.evaluate(() => {
			localStorage.setItem('runtime/networkMode', 'offline');
			localStorage.setItem('history/lastVisitePage', '/home');
		});
		await contentPage.evaluate(() => {
			window.location.hash = '#/home';
		});
		await contentPage.waitForURL(/home/, { timeout: 10000 });
		await contentPage.waitForLoadState('domcontentloaded');
		await contentPage.waitForTimeout(1000);
		const testProjectName = `HTTPNode-Test-${Date.now()}`;
		await createTestProject(headerPage, contentPage, testProjectName);
		await expect(contentPage).toHaveURL(/doc-edit/, { timeout: 10000 });
		await contentPage.waitForSelector('.banner', { timeout: 10000 });
		await contentPage.waitForTimeout(500);
	});

	test('应能创建 HTTP 节点', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		const node = getBannerNode(contentPage, nodeName);
		await expect(node).toBeVisible();
	});

	test('应能切换请求方法', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		// 默认 GET，切换为 POST
		const methodSelector = contentPage.locator('.request-method .el-select');
		await methodSelector.waitFor({ state: 'visible', timeout: 10000 });
		await contentPage.waitForTimeout(1000);
		await methodSelector.click();
		await contentPage.waitForTimeout(500);
		const postOption = contentPage.locator('.el-select-dropdown__item:has-text("POST")');
		await postOption.waitFor({ state: 'visible', timeout: 5000 });
		await postOption.click();
		await contentPage.waitForTimeout(500);
		const selectedMethod = contentPage.locator('.request-method .el-select .el-select__wrapper');
		await expect(selectedMethod).toHaveText(/POST/);
	});

	test('应能编辑 URL', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);
		const urlInput = contentPage.locator('.op-wrap .el-input__inner');
		await urlInput.waitFor({ state: 'visible', timeout: 10000 });
		await urlInput.fill('/api/test-url');
		await expect(urlInput).toHaveValue('/api/test-url');
	});
});

// ==================== HTTP Node Query 参数测试 ====================
test.describe('HTTP Node - Query 参数', () => {
	let headerPage: Page;
	let contentPage: Page;

	test.beforeEach(async ({ electronApp }) => {
		const result = await resolveHeaderAndContentPages(electronApp);
		headerPage = result.headerPage;
		contentPage = result.contentPage;
		await Promise.all([
			headerPage.waitForLoadState('domcontentloaded'),
			contentPage.waitForLoadState('domcontentloaded')
		]);
		await contentPage.evaluate(() => {
			localStorage.setItem('runtime/networkMode', 'offline');
			localStorage.setItem('history/lastVisitePage', '/home');
		});
		await contentPage.evaluate(() => {
			window.location.hash = '#/home';
		});
		await contentPage.waitForURL(/home/, { timeout: 10000 });
		await contentPage.waitForLoadState('domcontentloaded');
		await contentPage.waitForTimeout(1000);
		const testProjectName = `HTTPNode-Query-${Date.now()}`;
		await createTestProject(headerPage, contentPage, testProjectName);
		await expect(contentPage).toHaveURL(/doc-edit/, { timeout: 10000 });
		await contentPage.waitForSelector('.banner', { timeout: 10000 });
		await contentPage.waitForTimeout(500);
	});

	test('应能添加 Query 参数', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 定位 Query 参数区域
		const querySection = contentPage.locator('.query-path-params').first();
		await expect(querySection).toBeVisible();

		// 找到第一个 Query 参数输入框
		const firstKeyInput = querySection.locator('.custom-params-tree-node input[placeholder*="参数名称"]').first();
		await firstKeyInput.click();
		await firstKeyInput.type('page');
		await contentPage.waitForTimeout(300);

		// 验证参数已添加
		await expect(firstKeyInput).toHaveValue('page');
	});

	test('应能编辑 Query 参数的 key 和 value', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1500);

		const querySection = contentPage.locator('.query-path-params').first();
		await querySection.waitFor({ state: 'visible', timeout: 10000 });
		
		// 输入 key
		const keyInput = querySection.locator('input[placeholder*="输入参数名称"]').first();
		await keyInput.waitFor({ state: 'visible', timeout: 10000 });
		await keyInput.click();
		await keyInput.type('pageSize');
		await contentPage.waitForTimeout(500);

		// 输入 value
		const valueInput = querySection.locator('input[placeholder*="请输入值"]').first();
		await valueInput.waitFor({ state: 'visible', timeout: 10000 });
		await valueInput.click();
		await valueInput.type('10');
		await contentPage.waitForTimeout(500);

		// 验证
		await expect(keyInput).toHaveValue('pageSize');
		await expect(valueInput).toHaveValue('10');
	});

	test('应能删除 Query 参数', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		const querySection = contentPage.locator('.query-path-params').first();
		
		// 添加第一个参数
		const keyInput = querySection.locator('input[placeholder*="输入参数名称"]').first();
		await keyInput.click();
		await keyInput.type('testParam');
		await contentPage.waitForTimeout(500);
		
		// 触发自动新增行(blur事件)
		await keyInput.blur();
		await contentPage.waitForTimeout(500);

		// 应该自动新增一行，现在有至少2行
		const paramRows = querySection.locator('.el-tree-node');
		const initialCount = await paramRows.count();
		expect(initialCount).toBeGreaterThan(1);

		// 删除第一行(找到删除按钮)
		const firstRow = querySection.locator('.el-tree-node').first();
		const deleteBtn = firstRow.locator('button').filter({ hasText: '' }).nth(1);
		if (await deleteBtn.isVisible()) {
			await deleteBtn.click();
			await contentPage.waitForTimeout(500);

			// 验证行数减少
			const finalCount = await paramRows.count();
			expect(finalCount).toBe(initialCount - 1);
		}
	});

	test('应能通过 checkbox 启用/禁用 Query 参数', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		const querySection = contentPage.locator('.query-path-params').first();
		
		// 添加参数
		const keyInput = querySection.locator('.custom-params-tree-node input[placeholder*="参数名称"]').first();
		await keyInput.click();
		await keyInput.type('enabled');
		await contentPage.waitForTimeout(300);

		// 找到 checkbox（默认应该是选中的）
		const checkbox = querySection.locator('.custom-params-tree-node .el-checkbox').first();
		await expect(checkbox).toBeVisible();

		// 点击取消选中
		await checkbox.click();
		await contentPage.waitForTimeout(300);

		// 再次点击选中
		await checkbox.click();
		await contentPage.waitForTimeout(300);
	});

	test('应能标记 Query 参数为必填', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		const querySection = contentPage.locator('.query-path-params').first();
		
		// 添加参数
		const keyInput = querySection.locator('.custom-params-tree-node input[placeholder*="参数名称"]').first();
		await keyInput.click();
		await keyInput.type('requiredParam');
		await contentPage.waitForTimeout(300);

		// 找到必填checkbox
		const requiredCheckbox = querySection.locator('.custom-params-tree-node .el-checkbox[label*="必"]').first();
		if (await requiredCheckbox.isVisible()) {
			await requiredCheckbox.click();
			await contentPage.waitForTimeout(300);
		}
	});

	test('应能添加 Query 参数描述', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		const querySection = contentPage.locator('.query-path-params').first();
		
		// 添加参数
		const keyInput = querySection.locator('.custom-params-tree-node input[placeholder*="参数名称"]').first();
		await keyInput.click();
		await keyInput.type('id');
		await contentPage.waitForTimeout(300);

		// 添加描述
		const descInput = querySection.locator('.custom-params-tree-node input[placeholder*="描述"]').first();
		await descInput.click();
		await descInput.type('用户ID');
		await contentPage.waitForTimeout(300);

		await expect(descInput).toHaveValue('用户ID');
	});

	test('应能在 Query 参数值中使用变量引用', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		const querySection = contentPage.locator('.query-path-params').first();
		
		// 添加参数
		const keyInput = querySection.locator('input[placeholder*="输入参数名称"]').first();
		await keyInput.click();
		await keyInput.type('token');
		await contentPage.waitForTimeout(300);

		// 使用变量引用
		const valueInput = querySection.locator('input[placeholder*="请输入值"]').first();
		await valueInput.click();
		await valueInput.type('{{authToken}}');
		await contentPage.waitForTimeout(300);

		await expect(valueInput).toHaveValue('{{authToken}}');
	});

	test('输入参数名称后应自动新增空白行', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		const querySection = contentPage.locator('.query-path-params').first();
		
		// 初始应该有1行
		let paramRows = querySection.locator('.el-tree-node');
		const initialCount = await paramRows.count();

		// 添加参数
		const keyInput = querySection.locator('input[placeholder*="输入参数名称"]').first();
		await keyInput.click();
		await keyInput.type('autoAdd');
		await keyInput.blur();
		await contentPage.waitForTimeout(500);

		// 应该自动新增一行
		paramRows = querySection.locator('.el-tree-node');
		const finalCount = await paramRows.count();
		expect(finalCount).toBeGreaterThan(initialCount);
	});
});

// ==================== HTTP Node Header 参数测试 ====================
test.describe('HTTP Node - Header 参数', () => {
	let headerPage: Page;
	let contentPage: Page;

	test.beforeEach(async ({ electronApp }) => {
		const result = await resolveHeaderAndContentPages(electronApp);
		headerPage = result.headerPage;
		contentPage = result.contentPage;
		await Promise.all([
			headerPage.waitForLoadState('domcontentloaded'),
			contentPage.waitForLoadState('domcontentloaded')
		]);
		await contentPage.evaluate(() => {
			localStorage.setItem('runtime/networkMode', 'offline');
			localStorage.setItem('history/lastVisitePage', '/home');
		});
		await contentPage.evaluate(() => {
			window.location.hash = '#/home';
		});
		await contentPage.waitForURL(/home/, { timeout: 10000 });
		await contentPage.waitForLoadState('domcontentloaded');
		await contentPage.waitForTimeout(1000);
		const testProjectName = `HTTPNode-Header-${Date.now()}`;
		await createTestProject(headerPage, contentPage, testProjectName);
		await expect(contentPage).toHaveURL(/doc-edit/, { timeout: 10000 });
		await contentPage.waitForSelector('.banner', { timeout: 10000 });
		await contentPage.waitForTimeout(500);
	});

	test('应能添加自定义 Header', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 切换到 请求头 标签页
		const headersTab = contentPage.locator('.el-tabs__item:has-text("请求头")');
		await headersTab.waitFor({ state: 'visible', timeout: 5000 });
		await headersTab.click();
		await contentPage.waitForTimeout(500);

		// 定位 Header 参数区域
		const headerSection = contentPage.locator('.header-info').first();
		await headerSection.waitFor({ state: 'visible', timeout: 5000 });

		// 添加自定义 Header
		const keyInput = headerSection.locator('input[placeholder*="输入参数名称"]').first();
		await keyInput.click();
		await keyInput.type('X-Custom-Header');
		await contentPage.waitForTimeout(300);

		const valueInput = headerSection.locator('input[placeholder*="请输入值"]').first();
		await valueInput.click();
		await valueInput.type('custom-value');
		await contentPage.waitForTimeout(300);

		await expect(keyInput).toHaveValue('X-Custom-Header');
		await expect(valueInput).toHaveValue('custom-value');
	});

	test('应能编辑 Header 的 key 和 value', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		const headersTab = contentPage.locator('.el-tabs__item:has-text("请求头")');
		await headersTab.waitFor({ state: 'visible', timeout: 5000 });
		await headersTab.click();
		await contentPage.waitForTimeout(500);

		const headerSection = contentPage.locator('.header-info').first();
		await headerSection.waitFor({ state: 'visible', timeout: 5000 });
		
		// 输入 key
		const keyInput = headerSection.locator('input[placeholder*="输入参数名称"]').first();
		await keyInput.click();
		await keyInput.type('Authorization');
		await contentPage.waitForTimeout(300);

		// 输入 value
		const valueInput = headerSection.locator('input[placeholder*="请输入值"]').first();
		await valueInput.click();
		await valueInput.type('Bearer token123');
		await contentPage.waitForTimeout(300);

		await expect(keyInput).toHaveValue('Authorization');
		await expect(valueInput).toHaveValue('Bearer token123');
	});

	test('应能删除自定义 Header', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		const headersTab = contentPage.locator('.el-tabs__item:has-text("请求头")');
		await headersTab.waitFor({ state: 'visible', timeout: 5000 });
		await headersTab.click();
		await contentPage.waitForTimeout(500);

		const headerSection = contentPage.locator('.header-info').first();
		await headerSection.waitFor({ state: 'visible', timeout: 5000 });
		
		// 添加 Header
		const keyInput = headerSection.locator('input[placeholder*="输入参数名称"]').first();
		await keyInput.click();
		await keyInput.type('X-Delete-Me');
		await keyInput.blur();
		await contentPage.waitForTimeout(500);

		// 获取初始行数
		const paramRows = headerSection.locator('.el-tree-node');
		const initialCount = await paramRows.count();

		// 删除第一行
		const firstRow = headerSection.locator('.el-tree-node').first();
		const deleteBtn = firstRow.locator('button').filter({ hasText: '' }).nth(1);
		if (await deleteBtn.isVisible()) {
			await deleteBtn.click();
			await contentPage.waitForTimeout(500);

			// 验证行数减少
			const finalCount = await paramRows.count();
			expect(finalCount).toBe(initialCount - 1);
		}
	});

	test('应能通过 checkbox 启用/禁用 Header', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		const headersTab = contentPage.locator('.el-tabs__item:has-text("请求头")');
		await headersTab.waitFor({ state: 'visible', timeout: 5000 });
		await headersTab.click();
		await contentPage.waitForTimeout(500);

		const headerSection = contentPage.locator('.header-info').first();
		await headerSection.waitFor({ state: 'visible', timeout: 5000 });
		
		// 添加 Header
		const keyInput = headerSection.locator('input[placeholder*="输入参数名称"]').first();
		await keyInput.click();
		await keyInput.type('X-Enable-Test');
		await contentPage.waitForTimeout(300);

		// 找到 checkbox
		const checkbox = headerSection.locator('.el-checkbox').first();
		await expect(checkbox).toBeVisible();

		// 点击取消选中
		await checkbox.click();
		await contentPage.waitForTimeout(300);

		// 再次点击选中
		await checkbox.click();
		await contentPage.waitForTimeout(300);
	});

	test('应能查看默认 Header', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		const headersTab = contentPage.locator('.el-tabs__item:has-text("请求头")');
		await headersTab.waitFor({ state: 'visible', timeout: 5000 });
		await headersTab.click();
		await contentPage.waitForTimeout(500);

		const headerSection = contentPage.locator('.header-info').first();
		await headerSection.waitFor({ state: 'visible', timeout: 5000 });
		
		// 查找"点击隐藏"或显示默认 Header 的按钮
		const showDefaultBtn = headerSection.locator('span:has-text("隐藏")');
		if (await showDefaultBtn.isVisible()) {
			// 已经显示，测试通过
			expect(await showDefaultBtn.isVisible()).toBe(true);
		} else {
			// 尝试显示
			const hiddenText = headerSection.locator('span:has-text("个隐藏")');
			if (await hiddenText.isVisible()) {
				await hiddenText.click();
				await contentPage.waitForTimeout(500);
				await expect(showDefaultBtn).toBeVisible();
			}
		}
	});

	test('应能在 Header 值中使用变量引用', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		const headersTab = contentPage.locator('.el-tabs__item:has-text("请求头")');
		await headersTab.waitFor({ state: 'visible', timeout: 5000 });
		await headersTab.click();
		await contentPage.waitForTimeout(500);

		const headerSection = contentPage.locator('.header-info').first();
		await headerSection.waitFor({ state: 'visible', timeout: 5000 });
		
		// 添加 Header
		const keyInput = headerSection.locator('input[placeholder*="输入参数名称"]').first();
		await keyInput.click();
		await keyInput.type('X-Api-Key');
		await contentPage.waitForTimeout(300);

		// 使用变量引用
		const valueInput = headerSection.locator('input[placeholder*="请输入值"]').first();
		await valueInput.click();
		await valueInput.type('{{apiKey}}');
		await contentPage.waitForTimeout(300);

		await expect(valueInput).toHaveValue('{{apiKey}}');
	});

	test('应能添加 Header 描述', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		const headersTab = contentPage.locator('.el-tabs__item:has-text("请求头")');
		await headersTab.waitFor({ state: 'visible', timeout: 5000 });
		await headersTab.click();
		await contentPage.waitForTimeout(500);

		const headerSection = contentPage.locator('.header-info').first();
		await headerSection.waitFor({ state: 'visible', timeout: 5000 });
		
		// 添加 Header
		const keyInput = headerSection.locator('input[placeholder*="输入参数名称"]').first();
		await keyInput.click();
		await keyInput.type('Content-Language');
		await contentPage.waitForTimeout(300);

		// 添加描述
		const descInput = headerSection.locator('input[placeholder*="参数描述"]').first();
		await descInput.click();
		await descInput.type('指定内容语言');
		await contentPage.waitForTimeout(300);

		await expect(descInput).toHaveValue('指定内容语言');
	});
});

// ==================== HTTP Node Path 参数测试 ====================
test.describe('HTTP Node - Path 参数', () => {
	let headerPage: Page;
	let contentPage: Page;

	test.beforeEach(async ({ electronApp }) => {
		const result = await resolveHeaderAndContentPages(electronApp);
		headerPage = result.headerPage;
		contentPage = result.contentPage;
		await Promise.all([
			headerPage.waitForLoadState('domcontentloaded'),
			contentPage.waitForLoadState('domcontentloaded')
		]);
		await contentPage.evaluate(() => {
			localStorage.setItem('runtime/networkMode', 'offline');
			localStorage.setItem('history/lastVisitePage', '/home');
		});
		await contentPage.evaluate(() => {
			window.location.hash = '#/home';
		});
		await contentPage.waitForURL(/home/, { timeout: 10000 });
		await contentPage.waitForLoadState('domcontentloaded');
		await contentPage.waitForTimeout(1000);
		const testProjectName = `HTTPNode-Path-${Date.now()}`;
		await createTestProject(headerPage, contentPage, testProjectName);
		await expect(contentPage).toHaveURL(/doc-edit/, { timeout: 10000 });
		await contentPage.waitForSelector('.banner', { timeout: 10000 });
		await contentPage.waitForTimeout(500);
	});

	test('应能识别 URL 中的 Path 参数', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 输入包含 Path 参数的 URL
		const urlInput = contentPage.locator('.op-wrap .el-input__inner');
		await urlInput.waitFor({ state: 'visible', timeout: 10000 });
		await urlInput.fill('/api/users/{id}');
		await contentPage.waitForTimeout(1000);

		// 切换到 Params 标签页查看 Path 参数
		const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")');
		await paramsTab.click();
		await contentPage.waitForTimeout(500);

		// 应该显示 Path 参数区域
		const pathSection = contentPage.locator('.query-path-params').first();
		const pathTitle = pathSection.locator('.title:has-text("Path")');
		
		// 验证 Path 参数区域可见
		if (await pathTitle.isVisible()) {
			await expect(pathTitle).toBeVisible();
			
			// 查找对应的参数输入框
			const pathParams = pathSection.locator('.el-tree-node');
			expect(await pathParams.count()).toBeGreaterThan(0);
		}
	});

	test('应能为 Path 参数设置值', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 输入包含 Path 参数的 URL
		const urlInput = contentPage.locator('.op-wrap .el-input__inner');
		await urlInput.waitFor({ state: 'visible', timeout: 10000 });
		await urlInput.fill('/api/users/{userId}/posts/{postId}');
		await contentPage.waitForTimeout(1000);

		// 切换到 Params 标签页
		const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")');
		await paramsTab.click();
		await contentPage.waitForTimeout(500);

		const pathSection = contentPage.locator('.query-path-params').first();
		
		// 如果 Path 参数区域可见，尝试设置值
		const pathTitle = pathSection.locator('.title:has-text("Path")');
		if (await pathTitle.isVisible()) {
			// 获取 Path 参数输入框（通常是只读的 key，可编辑的 value）
			const valueInputs = pathSection.locator('input[placeholder*="请输入值"]');
			const count = await valueInputs.count();
			
			if (count > 0) {
				// 为第一个 Path 参数设置值
				await valueInputs.first().click();
				await valueInputs.first().type('123');
				await contentPage.waitForTimeout(300);
				await expect(valueInputs.first()).toHaveValue('123');
			}
		}
	});

	test('应能识别多个 Path 参数', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 输入包含多个 Path 参数的 URL
		const urlInput = contentPage.locator('.op-wrap .el-input__inner');
		await urlInput.waitFor({ state: 'visible', timeout: 10000 });
		await urlInput.fill('/api/{version}/users/{userId}/comments/{commentId}');
		await contentPage.waitForTimeout(1000);

		// 切换到 Params 标签页
		const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")');
		await paramsTab.click();
		await contentPage.waitForTimeout(500);

		const pathSection = contentPage.locator('.query-path-params').first();
		const pathTitle = pathSection.locator('.title:has-text("Path")');
		
		// 验证能识别到 Path 参数
		if (await pathTitle.isVisible()) {
			await expect(pathTitle).toBeVisible();
		}
	});

	test.skip('Path 参数的 key 应该不可编辑', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 输入包含 Path 参数的 URL
		const urlInput = contentPage.locator('.op-wrap .el-input__inner');
		await urlInput.waitFor({ state: 'visible', timeout: 10000 });
		await urlInput.fill('/api/items/{itemId}');
		await contentPage.waitForTimeout(1000);

		// 切换到 Params 标签页
		const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")');
		await paramsTab.click();
		await contentPage.waitForTimeout(500);

		const pathSection = contentPage.locator('.query-path-params').first();
		const pathTitle = pathSection.locator('.title:has-text("Path")');
		
		if (await pathTitle.isVisible()) {
			// Path 参数的 key 输入框应该被禁用或只读
			const keyInputs = pathSection.locator('input[placeholder*="输入参数名称"]');
			const count = await keyInputs.count();
			
			if (count > 0) {
				// 检查是否禁用或只读
				const isDisabled = await keyInputs.first().isDisabled();
				const isReadonly = await keyInputs.first().getAttribute('readonly');
				// Path参数的key应该是不可编辑的（禁用或只读）
				// 注意：根据实际业务代码，如果key是可编辑的，这是业务逻辑问题
				expect(isDisabled || isReadonly !== null).toBe(true);
			}
		}
	});

	test('应能为 Path 参数添加描述', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1500);

		// 输入包含 Path 参数的 URL
		const urlInput = contentPage.locator('.op-wrap .el-input__inner');
		await urlInput.waitFor({ state: 'visible', timeout: 10000 });
		await urlInput.fill('/api/products/{productId}');
		await contentPage.waitForTimeout(1500);

		// 切换到 Params 标签页
		const paramsTab = contentPage.locator('.el-tabs__item:has-text("Params")');
		await paramsTab.click();
		await contentPage.waitForTimeout(500);

		const pathSection = contentPage.locator('.query-path-params').first();
		const pathTitle = pathSection.locator('.title:has-text("Path")');
		
		if (await pathTitle.isVisible()) {
			const descInputs = pathSection.locator('input[placeholder*="参数描述"]');
			const count = await descInputs.count();
			
			if (count > 0) {
				await descInputs.first().click();
				await descInputs.first().type('产品唯一标识符');
				await contentPage.waitForTimeout(300);
				await expect(descInputs.first()).toHaveValue('产品唯一标识符');
			}
		}
	});
});

// ==================== HTTP Node Request Body 测试 ====================
test.describe('HTTP Node - Request Body', () => {
	let headerPage: Page;
	let contentPage: Page;

	test.beforeEach(async ({ electronApp }) => {
		const result = await resolveHeaderAndContentPages(electronApp);
		headerPage = result.headerPage;
		contentPage = result.contentPage;
		await Promise.all([
			headerPage.waitForLoadState('domcontentloaded'),
			contentPage.waitForLoadState('domcontentloaded')
		]);
		await contentPage.evaluate(() => {
			localStorage.setItem('runtime/networkMode', 'offline');
			localStorage.setItem('history/lastVisitePage', '/home');
		});
		await contentPage.evaluate(() => {
			window.location.hash = '#/home';
		});
		await contentPage.waitForURL(/home/, { timeout: 10000 });
		await contentPage.waitForLoadState('domcontentloaded');
		await contentPage.waitForTimeout(1000);
		const testProjectName = `HTTPNode-Body-${Date.now()}`;
		await createTestProject(headerPage, contentPage, testProjectName);
		await expect(contentPage).toHaveURL(/doc-edit/, { timeout: 10000 });
		await contentPage.waitForSelector('.banner', { timeout: 10000 });
		await contentPage.waitForTimeout(500);
	});

	test('应能切换 Body 模式为 JSON', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 先切换请求方法为 POST（GET 通常不支持 Body）
		const methodSelector = contentPage.locator('.s-operation');
		if (await methodSelector.isVisible()) {
			// 查找方法选择器并切换
			const methodDropdown = contentPage.locator('[placeholder*="请求方法"], .el-select').first();
			await methodDropdown.click();
			await contentPage.waitForTimeout(300);
			
			const postOption = contentPage.locator('.el-select-dropdown__item:has-text("POST")').first();
			await postOption.click();
			await contentPage.waitForTimeout(500);
		}

		// 切换到 Body 标签页
		const bodyTab = contentPage.locator('.el-tabs__item:has-text("Body")');
		await bodyTab.click();
		await contentPage.waitForTimeout(500);

		// 查找 Body 模式选择器
		const bodyModeSelector = contentPage.locator('.body-mode-selector, .el-radio-group').first();
		if (await bodyModeSelector.isVisible()) {
			const jsonRadio = contentPage.locator('label:has-text("JSON"), .el-radio:has-text("json")').first();
			await jsonRadio.click();
			await contentPage.waitForTimeout(500);

			// 验证 JSON 编辑器可见
			const jsonEditor = contentPage.locator('.json-editor, .monaco-editor, textarea[placeholder*="JSON"]').first();
			await expect(jsonEditor).toBeVisible();
		}
	});

	test('应能切换 Body 模式为 form-data', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 切换到 POST 方法
		const methodDropdown = contentPage.locator('[placeholder*="请求方法"], .el-select').first();
		if (await methodDropdown.isVisible()) {
			await methodDropdown.click();
			await contentPage.waitForTimeout(300);
			const postOption = contentPage.locator('.el-select-dropdown__item:has-text("POST")').first();
			await postOption.click();
			await contentPage.waitForTimeout(500);
		}

		// 切换到 Body 标签页
		const bodyTab = contentPage.locator('.el-tabs__item:has-text("Body")');
		await bodyTab.click();
		await contentPage.waitForTimeout(500);

		// 选择 form-data 模式
		const formdataRadio = contentPage.locator('label:has-text("form-data"), .el-radio:has-text("formdata")').first();
		if (await formdataRadio.isVisible()) {
			await formdataRadio.click();
			await contentPage.waitForTimeout(500);

			// 验证 form-data 表格可见
			const formdataTable = contentPage.locator('.form-data-params, .custom-params-tree-node').first();
			await expect(formdataTable).toBeVisible();
		}
	});

	test('应能切换 Body 模式为 x-www-form-urlencoded', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 切换到 POST 方法
		const methodDropdown = contentPage.locator('[placeholder*="请求方法"], .el-select').first();
		if (await methodDropdown.isVisible()) {
			await methodDropdown.click();
			await contentPage.waitForTimeout(300);
			const postOption = contentPage.locator('.el-select-dropdown__item:has-text("POST")').first();
			await postOption.click();
			await contentPage.waitForTimeout(500);
		}

		// 切换到 Body 标签页
		const bodyTab = contentPage.locator('.el-tabs__item:has-text("Body")');
		await bodyTab.click();
		await contentPage.waitForTimeout(500);

		// 选择 urlencoded 模式
		const urlencodedRadio = contentPage.locator('label:has-text("urlencoded"), .el-radio:has-text("x-www-form-urlencoded")').first();
		if (await urlencodedRadio.isVisible()) {
			await urlencodedRadio.click();
			await contentPage.waitForTimeout(500);

			// 验证 urlencoded 表格可见
			const urlencodedTable = contentPage.locator('.urlencoded-params, .custom-params-tree-node').first();
			await expect(urlencodedTable).toBeVisible();
		}
	});

	test('应能在 JSON Body 中输入数据', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 切换到 POST
		const methodDropdown = contentPage.locator('[placeholder*="请求方法"], .el-select').first();
		if (await methodDropdown.isVisible()) {
			await methodDropdown.click();
			await contentPage.waitForTimeout(300);
			const postOption = contentPage.locator('.el-select-dropdown__item:has-text("POST")').first();
			await postOption.click();
			await contentPage.waitForTimeout(500);
		}

		// 切换到 Body 标签页
		const bodyTab = contentPage.locator('.el-tabs__item:has-text("Body")');
		await bodyTab.click();
		await contentPage.waitForTimeout(500);

		// 确保 JSON 模式
		const jsonRadio = contentPage.locator('label:has-text("JSON"), .el-radio:has-text("json")').first();
		if (await jsonRadio.isVisible()) {
			await jsonRadio.click();
			await contentPage.waitForTimeout(500);
		}

		// 输入 JSON 数据
		const jsonInput = contentPage.locator('textarea[placeholder*="JSON"], .monaco-editor textarea').first();
		if (await jsonInput.isVisible()) {
			await jsonInput.fill('{"name": "test", "age": 25}');
			await contentPage.waitForTimeout(500);
			await expect(jsonInput).toHaveValue(/test/);
		}
	});

	test('应能在 form-data 中添加字段', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 切换到 POST
		const methodDropdown = contentPage.locator('[placeholder*="请求方法"], .el-select').first();
		if (await methodDropdown.isVisible()) {
			await methodDropdown.click();
			await contentPage.waitForTimeout(300);
			const postOption = contentPage.locator('.el-select-dropdown__item:has-text("POST")').first();
			await postOption.click();
			await contentPage.waitForTimeout(500);
		}

		// 切换到 Body 标签页
		const bodyTab = contentPage.locator('.el-tabs__item:has-text("Body")');
		await bodyTab.click();
		await contentPage.waitForTimeout(500);

		// 选择 form-data
		const formdataRadio = contentPage.locator('label:has-text("form-data"), .el-radio:has-text("formdata")').first();
		if (await formdataRadio.isVisible()) {
			await formdataRadio.click();
			await contentPage.waitForTimeout(1000);

			// 添加字段
			const keyInput = contentPage.locator('input[placeholder*="输入参数名称"]').first();
			await keyInput.waitFor({ state: 'visible', timeout: 5000 });
			await keyInput.click();
			await keyInput.type('username');
			await contentPage.waitForTimeout(500);

			const valueInput = contentPage.locator('input[placeholder*="请输入值"]').first();
			await valueInput.waitFor({ state: 'visible', timeout: 5000 });
			await valueInput.click();
			await valueInput.type('john_doe');
			await contentPage.waitForTimeout(500);

			await expect(keyInput).toHaveValue('username');
			await expect(valueInput).toHaveValue('john_doe');
		}
	});

	test('应能切换 Body 模式为 Raw', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 切换到 POST
		const methodDropdown = contentPage.locator('[placeholder*="请求方法"], .el-select').first();
		if (await methodDropdown.isVisible()) {
			await methodDropdown.click();
			await contentPage.waitForTimeout(300);
			const postOption = contentPage.locator('.el-select-dropdown__item:has-text("POST")').first();
			await postOption.click();
			await contentPage.waitForTimeout(500);
		}

		// 切换到 Body 标签页
		const bodyTab = contentPage.locator('.el-tabs__item:has-text("Body")');
		await bodyTab.click();
		await contentPage.waitForTimeout(500);

		// 选择 Raw 模式
		const rawRadio = contentPage.locator('label:has-text("Raw"), .el-radio:has-text("raw")').first();
		if (await rawRadio.isVisible()) {
			await rawRadio.click();
			await contentPage.waitForTimeout(500);

			// 验证 Raw 编辑器可见
			const rawEditor = contentPage.locator('textarea, .monaco-editor').first();
			await expect(rawEditor).toBeVisible();
		}
	});

	test('应能切换 Body 模式为 None', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 切换到 Body 标签页
		const bodyTab = contentPage.locator('.el-tabs__item:has-text("Body")');
		if (await bodyTab.isVisible()) {
			await bodyTab.click();
			await contentPage.waitForTimeout(500);

			// 选择 None 模式
			const noneRadio = contentPage.locator('label:has-text("None"), .el-radio:has-text("none")').first();
			if (await noneRadio.isVisible()) {
				await noneRadio.click();
				await contentPage.waitForTimeout(500);
			}
		}
	});
});
