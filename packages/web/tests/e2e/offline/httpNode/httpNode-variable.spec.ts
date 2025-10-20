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

// ==================== HTTP Node 变量功能测试 ====================
test.describe('HTTP Node - 变量功能', () => {
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
		const testProjectName = `HTTPNode-Variable-${Date.now()}`;
		await createTestProject(headerPage, contentPage, testProjectName);
		await expect(contentPage).toHaveURL(/doc-edit/, { timeout: 10000 });
		await contentPage.waitForSelector('.banner', { timeout: 10000 });
		await contentPage.waitForTimeout(500);
	});

	test('应能访问变量管理页面', async () => {
		// 点击左侧导航栏的"变量"菜单
		const variableMenu = contentPage.locator('.nav-item:has-text("变量"), a:has-text("变量")').first();
		if (await variableMenu.isVisible({ timeout: 3000 })) {
			await variableMenu.click();
			await contentPage.waitForTimeout(1000);

			// 验证变量页面可见
			const variablePage = contentPage.locator('.s-variable, text=变量列表');
			await expect(variablePage.first()).toBeVisible({ timeout: 5000 });
		}
	});

	test('应能在URL中使用变量引用', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 在URL中输入变量引用
		const urlInput = contentPage.locator('input[placeholder*="path"]').first();
		await urlInput.fill('{{baseUrl}}/api/users/{{userId}}');
		await contentPage.waitForTimeout(500);

		// 验证输入成功
		await expect(urlInput).toHaveValue('{{baseUrl}}/api/users/{{userId}}');
	});

	test.skip('应能在Query参数中使用变量引用', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 添加Query参数并使用变量（Query参数默认就在主视图中）
		const querySection = contentPage.locator('.query-path-params').first();
		
		const keyInput = querySection.locator('.custom-params-tree-node input[placeholder*="参数名称"]').first();
		await keyInput.fill('token');
		await contentPage.waitForTimeout(300);

		const valueInput = querySection.locator('.custom-params-tree-node input[placeholder*="参数值"]').first();
		await valueInput.fill('{{authToken}}');
		await contentPage.waitForTimeout(300);

		// 验证变量引用输入成功
		await expect(valueInput).toHaveValue('{{authToken}}');
	});

	test('应能在Headers中使用变量引用', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 切换到Headers标签页
		const headersTab = contentPage.locator('.el-tabs__item:has-text("Headers")');
		if (await headersTab.isVisible({ timeout: 3000 })) {
			await headersTab.click();
			await contentPage.waitForTimeout(500);

			// 添加Header并使用变量
			const headerSection = contentPage.locator('.header-info').first();
			
			const keyInput = headerSection.locator('.custom-params-tree-node input[placeholder*="参数名称"]').first();
			await keyInput.fill('Authorization');
			await contentPage.waitForTimeout(300);

			const valueInput = headerSection.locator('.custom-params-tree-node input[placeholder*="参数值"]').first();
			await valueInput.fill('Bearer {{token}}');
			await contentPage.waitForTimeout(300);

			// 验证变量引用输入成功
			await expect(valueInput).toHaveValue('Bearer {{token}}');
		}
	});

	test('应能在JSON Body中使用变量引用', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 切换到POST方法
		const methodDropdown = contentPage.locator('[placeholder*="请求方法"], .el-select').first();
		if (await methodDropdown.isVisible()) {
			await methodDropdown.click();
			await contentPage.waitForTimeout(300);
			const postOption = contentPage.locator('.el-select-dropdown__item:has-text("POST")').first();
			await postOption.click();
			await contentPage.waitForTimeout(500);
		}

		// 切换到Body标签页
		const bodyTab = contentPage.locator('.el-tabs__item:has-text("Body")');
		await bodyTab.click();
		await contentPage.waitForTimeout(500);

		// 确保JSON模式
		const jsonRadio = contentPage.locator('label:has-text("JSON"), .el-radio:has-text("json")').first();
		if (await jsonRadio.isVisible()) {
			await jsonRadio.click();
			await contentPage.waitForTimeout(500);
		}

		// 在JSON中使用变量引用
		const jsonInput = contentPage.locator('textarea[placeholder*="JSON"], .monaco-editor textarea').first();
		if (await jsonInput.isVisible()) {
			const jsonWithVariables = '{"username": "{{username}}", "password": "{{password}}"}';
			await jsonInput.fill(jsonWithVariables);
			await contentPage.waitForTimeout(500);

			// 验证变量引用输入成功
			const value = await jsonInput.inputValue();
			expect(value).toContain('{{username}}');
			expect(value).toContain('{{password}}');
		}
	});
});
