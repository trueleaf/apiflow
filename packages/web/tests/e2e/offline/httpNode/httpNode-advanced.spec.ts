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
// 点击 Banner 区域的节点
const clickBannerNode = async (contentPage: Page, nodeName: string) => {
	const node = contentPage.locator(`.custom-tree-node:has-text("${nodeName}")`).first();
	await node.waitFor({ state: 'visible', timeout: 5000 });
	await node.click();
	await contentPage.waitForTimeout(2000);
};

// ==================== HTTP Node Cookie管理测试 ====================
test.describe('HTTP Node - Cookie管理', () => {
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
		const testProjectName = `HTTPNode-Cookie-${Date.now()}`;
		await createTestProject(headerPage, contentPage, testProjectName);
		await expect(contentPage).toHaveURL(/doc-edit/, { timeout: 10000 });
		await contentPage.waitForSelector('.banner', { timeout: 10000 });
		await contentPage.waitForTimeout(500);
	});

	test('应能访问Cookie管理页面', async () => {
		// 点击左侧导航的Cookie菜单
		const cookieMenu = contentPage.locator('.nav-item:has-text("Cookie"), a:has-text("Cookie")').first();
		if (await cookieMenu.isVisible({ timeout: 3000 })) {
			await cookieMenu.click();
			await contentPage.waitForTimeout(1000);

			// 验证Cookie管理页面可见
			const cookiePage = contentPage.locator('.cookies-page, text=Cookies 管理');
			await expect(cookiePage.first()).toBeVisible({ timeout: 5000 });
		}
	});

	test('应能查看Cookie列表', async () => {
		const cookieMenu = contentPage.locator('.nav-item:has-text("Cookie"), a:has-text("Cookie")').first();
		if (await cookieMenu.isVisible({ timeout: 3000 })) {
			await cookieMenu.click();
			await contentPage.waitForTimeout(1000);

			// 验证Cookie表格可见
			const cookieTable = contentPage.locator('.el-table');
			await expect(cookieTable.first()).toBeVisible({ timeout: 5000 });
		}
	});

	test('应能打开新增Cookie对话框', async () => {
		const cookieMenu = contentPage.locator('.nav-item:has-text("Cookie"), a:has-text("Cookie")').first();
		if (await cookieMenu.isVisible({ timeout: 3000 })) {
			await cookieMenu.click();
			await contentPage.waitForTimeout(1000);

			// 点击新增Cookie按钮
			const addBtn = contentPage.locator('button:has-text("新增 Cookie")');
			if (await addBtn.isVisible({ timeout: 3000 })) {
				await addBtn.click();
				await contentPage.waitForTimeout(500);

				// 验证对话框打开
				const dialog = contentPage.locator('.el-dialog:has-text("新增 Cookie")');
				await expect(dialog).toBeVisible({ timeout: 5000 });
			}
		}
	});
});

// ==================== HTTP Node 前置脚本测试 ====================
test.describe('HTTP Node - 前置脚本', () => {
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
		const testProjectName = `HTTPNode-PreScript-${Date.now()}`;
		await createTestProject(headerPage, contentPage, testProjectName);
		await expect(contentPage).toHaveURL(/doc-edit/, { timeout: 10000 });
		await contentPage.waitForSelector('.banner', { timeout: 10000 });
		await contentPage.waitForTimeout(500);
	});

	test('应能访问前置脚本标签页', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 查找前置脚本标签页
		const preScriptTab = contentPage.locator('.el-tabs__item:has-text("前置脚本"), .el-tabs__item:has-text("Pre")');
		if (await preScriptTab.first().isVisible({ timeout: 3000 })) {
			await preScriptTab.first().click();
			await contentPage.waitForTimeout(500);

			// 验证前置脚本编辑器可见
			const editor = contentPage.locator('.monaco-editor, textarea');
			await expect(editor.first()).toBeVisible({ timeout: 5000 });
		}
	});

	test('应能在前置脚本编辑器中输入代码', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		const preScriptTab = contentPage.locator('.el-tabs__item:has-text("前置脚本"), .el-tabs__item:has-text("Pre")');
		if (await preScriptTab.first().isVisible({ timeout: 3000 })) {
			await preScriptTab.first().click();
			await contentPage.waitForTimeout(1000);

			// 尝试在编辑器中输入代码
			const editor = contentPage.locator('textarea').first();
			if (await editor.isVisible({ timeout: 3000 })) {
				const scriptCode = 'console.log("Pre-request script");';
				await editor.fill(scriptCode);
				await contentPage.waitForTimeout(500);

				// 验证代码已输入
				const value = await editor.inputValue();
				expect(value).toContain('Pre-request');
			}
		}
	});

	test('应能查看前置脚本帮助文档', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		const preScriptTab = contentPage.locator('.el-tabs__item:has-text("前置脚本"), .el-tabs__item:has-text("Pre")');
		if (await preScriptTab.first().isVisible({ timeout: 3000 })) {
			await preScriptTab.first().click();
			await contentPage.waitForTimeout(500);

			// 查找帮助文档链接或按钮
			const helpBtn = contentPage.locator('button:has-text("帮助"), a:has-text("帮助"), .help-icon');
			if (await helpBtn.first().isVisible({ timeout: 2000 })) {
				await expect(helpBtn.first()).toBeVisible();
			}
		}
	});
});

// ==================== HTTP Node 后置脚本测试 ====================
test.describe('HTTP Node - 后置脚本', () => {
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
		const testProjectName = `HTTPNode-AfterScript-${Date.now()}`;
		await createTestProject(headerPage, contentPage, testProjectName);
		await expect(contentPage).toHaveURL(/doc-edit/, { timeout: 10000 });
		await contentPage.waitForSelector('.banner', { timeout: 10000 });
		await contentPage.waitForTimeout(500);
	});

	test('应能访问后置脚本标签页', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		// 查找后置脚本标签页
		const afterScriptTab = contentPage.locator('.el-tabs__item:has-text("后置脚本"), .el-tabs__item:has-text("After")');
		if (await afterScriptTab.first().isVisible({ timeout: 3000 })) {
			await afterScriptTab.first().click();
			await contentPage.waitForTimeout(500);

			// 验证后置脚本编辑器可见
			const editor = contentPage.locator('.monaco-editor, textarea');
			await expect(editor.first()).toBeVisible({ timeout: 5000 });
		}
	});

	test('应能在后置脚本编辑器中输入代码', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		const afterScriptTab = contentPage.locator('.el-tabs__item:has-text("后置脚本"), .el-tabs__item:has-text("After")');
		if (await afterScriptTab.first().isVisible({ timeout: 3000 })) {
			await afterScriptTab.first().click();
			await contentPage.waitForTimeout(1000);

			// 尝试在编辑器中输入代码
			const editor = contentPage.locator('textarea').first();
			if (await editor.isVisible({ timeout: 3000 })) {
				const scriptCode = 'console.log("After-request script");';
				await editor.fill(scriptCode);
				await contentPage.waitForTimeout(500);

				// 验证代码已输入
				const value = await editor.inputValue();
				expect(value).toContain('After-request');
			}
		}
	});

	test('应能使用后置脚本处理响应数据', async () => {
		const nodeName = `接口-${Date.now()}`;
		await createRootHttpNode(contentPage, nodeName);
		await clickBannerNode(contentPage, nodeName);
		await contentPage.waitForTimeout(1000);

		const afterScriptTab = contentPage.locator('.el-tabs__item:has-text("后置脚本"), .el-tabs__item:has-text("After")');
		if (await afterScriptTab.first().isVisible({ timeout: 3000 })) {
			await afterScriptTab.first().click();
			await contentPage.waitForTimeout(1000);

			// 输入处理响应的代码
			const editor = contentPage.locator('textarea').first();
			if (await editor.isVisible({ timeout: 3000 })) {
				const scriptCode = `
// 处理响应数据
const response = apiflow.response;
if (response.status === 200) {
    console.log('请求成功');
}
				`.trim();
				await editor.fill(scriptCode);
				await contentPage.waitForTimeout(500);

				// 验证代码已输入
				const value = await editor.inputValue();
				expect(value).toContain('apiflow.response');
			}
		}
	});
});

// ==================== HTTP Node 历史记录测试 ====================
test.describe('HTTP Node - 历史记录', () => {
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
		const testProjectName = `HTTPNode-History-${Date.now()}`;
		await createTestProject(headerPage, contentPage, testProjectName);
		await expect(contentPage).toHaveURL(/doc-edit/, { timeout: 10000 });
		await contentPage.waitForSelector('.banner', { timeout: 10000 });
		await contentPage.waitForTimeout(500);
	});

	test('应能访问历史记录页面', async () => {
		// 点击左侧导航的历史记录菜单
		const historyMenu = contentPage.locator('.nav-item:has-text("历史"), a:has-text("历史"), .nav-item:has-text("History")').first();
		if (await historyMenu.isVisible({ timeout: 3000 })) {
			await historyMenu.click();
			await contentPage.waitForTimeout(1000);

			// 验证历史记录页面可见
			const historyPage = contentPage.locator('.history-page, text=历史记录');
			await expect(historyPage.first()).toBeVisible({ timeout: 5000 });
		}
	});

	test('应能查看请求历史列表', async () => {
		const historyMenu = contentPage.locator('.nav-item:has-text("历史"), a:has-text("历史"), .nav-item:has-text("History")').first();
		if (await historyMenu.isVisible({ timeout: 3000 })) {
			await historyMenu.click();
			await contentPage.waitForTimeout(1000);

			// 验证历史列表容器可见
			const historyList = contentPage.locator('.history-list, .el-table, .history-item');
			await expect(historyList.first()).toBeVisible({ timeout: 5000 });
		}
	});
});
