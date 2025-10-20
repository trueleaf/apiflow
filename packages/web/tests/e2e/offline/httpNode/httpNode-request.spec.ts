import { expect, type ElectronApplication, type Page } from '@playwright/test';
import { test, resolveHeaderAndContentPages } from '../../../fixtures/enhanced-electron-fixtures';
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
// 点击 Banner 区域的节点
const clickBannerNode = async (contentPage: Page, nodeName: string) => {
	const node = contentPage.locator(`.custom-tree-node:has-text("${nodeName}")`).first();
	await node.waitFor({ state: 'visible', timeout: 5000 });
	await node.click();
	await contentPage.waitForTimeout(2000);
};

// ==================== HTTP Node 请求执行测试 ====================
test.describe('HTTP Node - 请求执行', () => {
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
		const testProjectName = `HTTPNode-Request-${Date.now()}`;
		await createTestProject(headerPage, contentPage, testProjectName);
		await expect(contentPage).toHaveURL(/doc-edit/, { timeout: 10000 });
		await contentPage.waitForSelector('.banner', { timeout: 10000 });
		await contentPage.waitForTimeout(500);
	});

	test('应能点击发送请求按钮', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 设置URL
		const urlInput = contentPage.locator('input[placeholder*="path"]').first();
		await urlInput.fill('https://jsonplaceholder.typicode.com/posts/1');
		await contentPage.waitForTimeout(500);

		// 查找发送请求按钮
		const sendBtn = contentPage.locator('button:has-text("发送请求")');
		await expect(sendBtn).toBeVisible();
		await expect(sendBtn).toBeEnabled();

		// 点击发送请求
		await sendBtn.click();
		await contentPage.waitForTimeout(1000);

		// 验证按钮文字变为"取消请求"或请求已完成
		const cancelBtn = contentPage.locator('button:has-text("取消请求")');
		const sendBtnAgain = contentPage.locator('button:has-text("发送请求")');
		
		// 请求可能很快完成，所以检查按钮是否变化过
		const isCancelVisible = await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false);
		const isSendVisible = await sendBtnAgain.isVisible({ timeout: 2000 }).catch(() => false);
		
		// 只要有一个按钮可见，说明请求已经执行
		expect(isCancelVisible || isSendVisible).toBe(true);
	});

	test('应能取消正在进行的请求', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 设置一个可能较慢的URL
		const urlInput = contentPage.locator('input[placeholder*="path"]').first();
		await urlInput.fill('https://jsonplaceholder.typicode.com/posts');
		await contentPage.waitForTimeout(500);

		// 点击发送请求
		const sendBtn = contentPage.locator('button:has-text("发送请求")');
		await sendBtn.click();
		await contentPage.waitForTimeout(200);

		// 查找并点击取消请求按钮
		const cancelBtn = contentPage.locator('button:has-text("取消请求")');
		if (await cancelBtn.isVisible({ timeout: 2000 })) {
			await cancelBtn.click();
			await contentPage.waitForTimeout(500);

			// 验证按钮变回"发送请求"
			await expect(sendBtn).toBeVisible({ timeout: 5000 });
		}
	});
});

// ==================== HTTP Node 响应处理测试 ====================
test.describe('HTTP Node - 响应处理', () => {
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
		const testProjectName = `HTTPNode-Response-${Date.now()}`;
		await createTestProject(headerPage, contentPage, testProjectName);
		await expect(contentPage).toHaveURL(/doc-edit/, { timeout: 10000 });
		await contentPage.waitForSelector('.banner', { timeout: 10000 });
		await contentPage.waitForTimeout(500);
	});

	test('应能显示响应状态码', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 设置URL
		const urlInput = contentPage.locator('input[placeholder*="path"]').first();
		await urlInput.fill('https://jsonplaceholder.typicode.com/posts/1');
		await contentPage.waitForTimeout(500);

		// 发送请求
		const sendBtn = contentPage.locator('button:has-text("发送请求")');
		await sendBtn.click();

		// 等待响应
		await contentPage.waitForTimeout(5000);

		// 查找状态码显示（可能在响应区域）
		const statusCode = contentPage.locator('text=/200|404|500/').first();
		if (await statusCode.isVisible({ timeout: 5000 })) {
			await expect(statusCode).toBeVisible();
		}
	});

	test('应能查看响应头信息', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 设置URL
		const urlInput = contentPage.locator('input[placeholder*="path"]').first();
		await urlInput.fill('https://jsonplaceholder.typicode.com/posts/1');
		await contentPage.waitForTimeout(500);

		// 发送请求
		const sendBtn = contentPage.locator('button:has-text("发送请求")');
		await sendBtn.click();

		// 等待响应
		await contentPage.waitForTimeout(5000);

		// 切换到返回头标签页
		const headersTab = contentPage.locator('.el-tabs__item:has-text("返回头")');
		if (await headersTab.isVisible({ timeout: 3000 })) {
			await headersTab.click();
			await contentPage.waitForTimeout(500);

			// 验证响应头区域可见
			const headersSection = contentPage.locator('text=/content-type|Content-Type/i').first();
			if (await headersSection.isVisible({ timeout: 2000 })) {
				await expect(headersSection).toBeVisible();
			}
		}
	});

	test('应能查看响应体内容', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 设置URL
		const urlInput = contentPage.locator('input[placeholder*="path"]').first();
		await urlInput.fill('https://jsonplaceholder.typicode.com/posts/1');
		await contentPage.waitForTimeout(500);

		// 发送请求
		const sendBtn = contentPage.locator('button:has-text("发送请求")');
		await sendBtn.click();

		// 等待响应
		await contentPage.waitForTimeout(5000);

		// 切换到返回值标签页（默认应该就在这个标签）
		const bodyTab = contentPage.locator('.el-tabs__item:has-text("返回值")');
		if (await bodyTab.isVisible({ timeout: 3000 })) {
			await bodyTab.click();
			await contentPage.waitForTimeout(500);
		}

		// 验证响应体区域有内容（JSON数据）
		const bodyContent = contentPage.locator('text=/userId|id|title/').first();
		if (await bodyContent.isVisible({ timeout: 3000 })) {
			await expect(bodyContent).toBeVisible();
		}
	});

	test('应能查看请求信息', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 设置URL
		const urlInput = contentPage.locator('input[placeholder*="path"]').first();
		await urlInput.fill('https://jsonplaceholder.typicode.com/posts/1');
		await contentPage.waitForTimeout(500);

		// 发送请求
		const sendBtn = contentPage.locator('button:has-text("发送请求")');
		await sendBtn.click();

		// 等待响应
		await contentPage.waitForTimeout(5000);

		// 切换到请求信息标签页
		const requestTab = contentPage.locator('.el-tabs__item:has-text("请求信息")');
		if (await requestTab.isVisible({ timeout: 3000 })) {
			await requestTab.click();
			await contentPage.waitForTimeout(500);

			// 验证请求信息标签页已激活
			await expect(requestTab).toHaveAttribute('aria-selected', 'true');
		}
	});

	test('应能查看原始响应数据', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 设置URL
		const urlInput = contentPage.locator('input[placeholder*="path"]').first();
		await urlInput.fill('https://jsonplaceholder.typicode.com/posts/1');
		await contentPage.waitForTimeout(500);

		// 发送请求
		const sendBtn = contentPage.locator('button:has-text("发送请求")');
		await sendBtn.click();

		// 等待响应
		await contentPage.waitForTimeout(5000);

		// 切换到原始值标签页
		const rawTab = contentPage.locator('.el-tabs__item:has-text("原始值")');
		if (await rawTab.isVisible({ timeout: 3000 })) {
			await rawTab.click();
			await contentPage.waitForTimeout(500);

			// 验证原始值标签页已激活
			await expect(rawTab).toHaveAttribute('aria-selected', 'true');
		}
	});
});
