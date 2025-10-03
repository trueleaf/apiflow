import { test, expect } from '../../fixtures/electron-fixtures';

// Electron 应用测试：验证应用是否正常启动
test.describe('Electron 应用基础功能测试', () => {
  test('Electron 应用能够正常启动', async ({ electronApp, mainWindow }) => {
    // 验证 Electron 应用已启动
    expect(electronApp).toBeTruthy();
    
    // 验证主窗口存在
    expect(mainWindow).toBeTruthy();
    
    // 等待页面加载完成
    await mainWindow.waitForLoadState('domcontentloaded');
    
    // 验证页面标题
    await expect(mainWindow).toHaveTitle(/Apiflow/i);
    
    // 验证页面可见
    const body = mainWindow.locator('body');
    await expect(body).toBeVisible();
    
    console.log('✅ Electron 应用启动成功');
  });

  test('Electron 应用主窗口包含主要元素', async ({ mainWindow }) => {
    // 等待页面加载完成
    await mainWindow.waitForLoadState('domcontentloaded');
    
    // 验证主应用容器存在
    const appContainer = mainWindow.locator('#app');
    await expect(appContainer).toBeVisible();
    
    console.log('✅ 主要 UI 元素验证通过');
  });

  test('Electron 应用窗口属性正确', async ({ mainWindow }) => {
    // 验证窗口尺寸（可以根据实际需求调整）
    const size = await mainWindow.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    });
    
    // 验证窗口尺寸合理
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
    
    console.log(`✅ 窗口尺寸: ${size.width}x${size.height}`);
  });
});
