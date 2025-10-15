import { test } from './fixtures/enhanced-electron-fixtures';

test('调试窗口信息', async ({ electronApp }) => {
  console.log('等待2秒让应用完全加载...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const windows = electronApp.windows();
  console.log('窗口总数:', windows.length);
  
  for (let i = 0; i < windows.length; i++) {
    const window = windows[i];
    console.log(`\n窗口 ${i}:`);
    console.log('  URL:', window.url());
    console.log('  Title:', await window.title());
    
    // 尝试获取页面的一些基本信息
    const bodyExists = await window.locator('body').count();
    console.log('  Body元素存在:', bodyExists > 0);
  }
  
  // 检查是否可以通过主窗口访问WebContentsView
  const mainWindow = electronApp.windows()[0];
  if (mainWindow) {
    console.log('\n尝试在主窗口中查找WebContentsView的内容...');
    
    // 等待可能的iframe或其他内容
    await mainWindow.waitForTimeout(2000);
    
    const frames = mainWindow.frames();
    console.log('主窗口中的frames数量:', frames.length);
    
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      console.log(`\nFrame ${i}:`);
      console.log('  URL:', frame.url());
      console.log('  Name:', frame.name());
    }
  }
});
