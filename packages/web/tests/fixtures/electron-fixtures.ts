import { test as base, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import path from 'path';

// Electron 测试的自定义 fixtures 类型
type ElectronFixtures = {
  electronApp: ElectronApplication;
  mainWindow: Page;
};

// 扩展基础测试，添加 Electron 专用 fixtures
export const test = base.extend<ElectronFixtures>({
  // Electron 应用实例 fixture
  electronApp: async ({}, use) => {
    // 构建 Electron 主进程入口路径
    const mainPath = path.join(process.cwd(), 'dist', 'main', 'main.mjs');
    
    // 启动 Electron 应用
    const electronApp = await electron.launch({
      args: [mainPath],
      // 可以添加环境变量
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
      // 启用调试模式（可选）
      // executablePath: electron的安装路径（通常自动检测）
    });

    // 等待应用就绪
    await electronApp.evaluate(async ({ app }) => {
      return app.whenReady();
    });

    // 将应用实例传递给测试
    await use(electronApp);

    // 测试完成后关闭应用
    await electronApp.close();
  },

  // 主窗口 fixture - 依赖于 electronApp
  mainWindow: async ({ electronApp }, use) => {
    // 等待第一个窗口出现
    const window = await electronApp.firstWindow();
    
    // 等待窗口加载完成
    await window.waitForLoadState('domcontentloaded');

    // 将窗口传递给测试
    await use(window);
  },
});

export { expect } from '@playwright/test';
