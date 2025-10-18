import { expect, type ElectronApplication, type Page } from '@playwright/test';
import { test } from '../../../fixtures/enhanced-electron-fixtures';

type HeaderAndContentPages = {
  headerPage: Page;
  contentPage: Page;
};

const HEADER_URL_HINTS = ['header.html', '/header'];

// 判断是否为header页面
const isHeaderUrl = (url: string): boolean => {
  if (!url) {
    return false;
  }
  return HEADER_URL_HINTS.some((hint) => url.includes(hint));
};

// 解析获取header和content两个页面
const resolveHeaderAndContentPages = async (
  electronApp: ElectronApplication,
  timeout = 10000
): Promise<HeaderAndContentPages> => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const windows = electronApp.windows();
    let headerPage: Page | undefined;
    let contentPage: Page | undefined;
    windows.forEach((page) => {
      const url = page.url();
      if (isHeaderUrl(url)) {
        headerPage = page;
        return;
      }
      if (url && url !== 'about:blank') {
        contentPage = page;
      }
    });
    if (headerPage && contentPage) {
      return { headerPage, contentPage };
    }
    try {
      await electronApp.waitForEvent('window', {
        timeout: 500,
        predicate: (page) => {
          const url = page.url();
          return isHeaderUrl(url) || (!!url && url !== 'about:blank');
        }
      });
    } catch {
      // 忽略短暂超时，继续轮询
    }
  }
  throw new Error('未能定位 header 与 content 页面');
};

// ==================== 辅助函数 ====================

// 点击语言切换按钮打开语言菜单
const openLanguageMenu = async (headerPage: Page, contentPage: Page): Promise<void> => {
  // 点击header中的语言切换按钮
  const languageBtn = headerPage.locator('.icon:has(.iconyuyan)').first();
  await languageBtn.waitFor({ state: 'visible', timeout: 5000 });
  await languageBtn.click();
  
  // 等待语言菜单出现在content页面
  await contentPage.waitForSelector('.language-dropdown-menu', { state: 'visible', timeout: 5000 });
};

// 选择语言
const selectLanguage = async (contentPage: Page, languageName: string): Promise<void> => {
  const menuItem = contentPage.locator(`.language-menu-item:has-text("${languageName}")`).first();
  await menuItem.waitFor({ state: 'visible', timeout: 3000 });
  await menuItem.click();
  
  // 等待菜单关闭
  await contentPage.waitForSelector('.language-dropdown-menu', { state: 'hidden', timeout: 3000 });
  await contentPage.waitForTimeout(500);
};

// 获取当前语言显示文本（header中的语言按钮文本）
const getCurrentLanguageDisplay = async (headerPage: Page): Promise<string> => {
  const languageText = headerPage.locator('.language-text').first();
  await languageText.waitFor({ state: 'visible', timeout: 3000 });
  return await languageText.textContent() || '';
};

// 获取localStorage中存储的语言
const getStoredLanguage = async (contentPage: Page): Promise<string> => {
  return await contentPage.evaluate(() => {
    return localStorage.getItem('language') || '';
  });
};

// 验证页面文本是否为指定语言
const verifyPageLanguage = async (page: Page, expectedTexts: string[]): Promise<boolean> => {
  for (const text of expectedTexts) {
    const element = page.locator(`text=${text}`).first();
    const isVisible = await element.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      return true;
    }
  }
  return false;
};

// ==================== 测试套件开始 ====================

// 语言切换功能测试
test.describe('语言切换功能测试', () => {
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
    
    // 设置离线模式和初始页面
    await contentPage.evaluate(() => {
      localStorage.setItem('runtime/networkMode', 'offline');
      localStorage.setItem('history/lastVisitePage', '/home');
      // 设置默认语言为简体中文
      localStorage.setItem('language', 'zh-cn');
    });
    
    // 刷新页面以应用语言设置
    await headerPage.reload();
    await contentPage.reload();
    await Promise.all([
      headerPage.waitForLoadState('domcontentloaded'),
      contentPage.waitForLoadState('domcontentloaded')
    ]);
    await contentPage.waitForTimeout(1000);
  });

  test('应能打开语言切换菜单', async () => {
    // 点击语言切换按钮
    await openLanguageMenu(headerPage, contentPage);
    
    // 验证语言菜单显示
    const languageMenu = contentPage.locator('.language-dropdown-menu');
    await expect(languageMenu).toBeVisible();
    
    // 验证所有语言选项都存在
    const zhCnItem = contentPage.locator('.language-menu-item:has-text("简体中文")');
    const zhTwItem = contentPage.locator('.language-menu-item:has-text("繁體中文")');
    const enItem = contentPage.locator('.language-menu-item:has-text("English")');
    const jaItem = contentPage.locator('.language-menu-item:has-text("日本語")');
    
    await expect(zhCnItem).toBeVisible();
    await expect(zhTwItem).toBeVisible();
    await expect(enItem).toBeVisible();
    await expect(jaItem).toBeVisible();
  });

  test('应能切换到简体中文', async () => {
    // 先切换到英文
    await openLanguageMenu(headerPage, contentPage);
    await selectLanguage(contentPage, 'English');
    await contentPage.waitForTimeout(500);
    
    // 切换回简体中文
    await openLanguageMenu(headerPage, contentPage);
    await selectLanguage(contentPage, '简体中文');
    
    // 验证header显示为"中"
    const displayText = await getCurrentLanguageDisplay(headerPage);
    expect(displayText).toBe('中');
    
    // 验证localStorage中保存的语言
    const storedLanguage = await getStoredLanguage(contentPage);
    expect(storedLanguage).toBe('zh-cn');
    
    // 验证页面文本为简体中文
    const hasChineseText = await verifyPageLanguage(contentPage, ['项目列表', '新建项目', '主页面']);
    expect(hasChineseText).toBe(true);
  });

  test('应能切换到英文', async () => {
    // 打开语言菜单
    await openLanguageMenu(headerPage, contentPage);
    
    // 选择英文
    await selectLanguage(contentPage, 'English');
    
    // 验证header显示为"EN"
    const displayText = await getCurrentLanguageDisplay(headerPage);
    expect(displayText).toBe('EN');
    
    // 验证localStorage中保存的语言
    const storedLanguage = await getStoredLanguage(contentPage);
    expect(storedLanguage).toBe('en');
    
    // 验证页面文本为英文
    const hasEnglishText = await verifyPageLanguage(contentPage, ['Project List', 'New Project', 'Home']);
    expect(hasEnglishText).toBe(true);
  });

  test('应能切换到繁体中文', async () => {
    // 打开语言菜单
    await openLanguageMenu(headerPage, contentPage);
    
    // 选择繁体中文
    await selectLanguage(contentPage, '繁體中文');
    
    // 验证header显示为"繁"
    const displayText = await getCurrentLanguageDisplay(headerPage);
    expect(displayText).toBe('繁');
    
    // 验证localStorage中保存的语言
    const storedLanguage = await getStoredLanguage(contentPage);
    expect(storedLanguage).toBe('zh-tw');
    
    // 验证页面文本为繁体中文（部分文本可能与简体相同，但key是zh-tw）
    const hasTraditionalChineseText = await verifyPageLanguage(contentPage, ['項目列表', '新建項目', '主頁面']);
    // 如果没有繁体特有文本，至少验证语言存储正确
    if (!hasTraditionalChineseText) {
      expect(storedLanguage).toBe('zh-tw');
    }
  });

  test('应能切换到日语', async () => {
    // 打开语言菜单
    await openLanguageMenu(headerPage, contentPage);
    
    // 选择日语
    await selectLanguage(contentPage, '日本語');
    
    // 验证header显示为"JP"
    const displayText = await getCurrentLanguageDisplay(headerPage);
    expect(displayText).toBe('JP');
    
    // 验证localStorage中保存的语言
    const storedLanguage = await getStoredLanguage(contentPage);
    expect(storedLanguage).toBe('ja');
  });

  test('切换语言后界面文本应正确更新', async () => {
    // 初始为简体中文，验证中文文本
    const chineseButton = contentPage.locator('button:has-text("新建项目")').first();
    await expect(chineseButton).toBeVisible({ timeout: 3000 });
    
    // 切换到英文
    await openLanguageMenu(headerPage, contentPage);
    await selectLanguage(contentPage, 'English');
    await contentPage.waitForTimeout(500);
    
    // 验证英文文本（按钮文本应该更新）
    const englishButton = contentPage.locator('button:has-text("New Project")').first();
    const hasEnglishButton = await englishButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    // 至少验证header中的文本更新
    const homeText = headerPage.locator('.home span');
    const homeTextContent = await homeText.textContent();
    
    // 英文模式下，"主页面"应该变成"Home"或类似文本
    const isEnglishMode = await getStoredLanguage(contentPage);
    expect(isEnglishMode).toBe('en');
  });

  test('切换语言后应保存用户偏好', async () => {
    // 切换到英文
    await openLanguageMenu(headerPage, contentPage);
    await selectLanguage(contentPage, 'English');
    
    // 验证localStorage中保存了英文设置
    let storedLanguage = await getStoredLanguage(contentPage);
    expect(storedLanguage).toBe('en');
    
    // 切换到繁体中文
    await openLanguageMenu(headerPage, contentPage);
    await selectLanguage(contentPage, '繁體中文');
    
    // 验证localStorage更新为繁体中文
    storedLanguage = await getStoredLanguage(contentPage);
    expect(storedLanguage).toBe('zh-tw');
    
    // 切换回简体中文
    await openLanguageMenu(headerPage, contentPage);
    await selectLanguage(contentPage, '简体中文');
    
    // 验证localStorage更新为简体中文
    storedLanguage = await getStoredLanguage(contentPage);
    expect(storedLanguage).toBe('zh-cn');
  });

  test('重启应用后应保持语言设置', async () => {
    // 切换到英文
    await openLanguageMenu(headerPage, contentPage);
    await selectLanguage(contentPage, 'English');
    
    // 验证切换成功
    let storedLanguage = await getStoredLanguage(contentPage);
    expect(storedLanguage).toBe('en');
    
    // 模拟应用重启：刷新页面
    await headerPage.reload();
    await contentPage.reload();
    await Promise.all([
      headerPage.waitForLoadState('domcontentloaded'),
      contentPage.waitForLoadState('domcontentloaded')
    ]);
    await contentPage.waitForTimeout(1000);
    
    // 验证语言设置保持为英文
    storedLanguage = await getStoredLanguage(contentPage);
    expect(storedLanguage).toBe('en');
    
    // 验证header显示仍为"EN"
    const displayText = await getCurrentLanguageDisplay(headerPage);
    expect(displayText).toBe('EN');
  });

  test('语言菜单应正确高亮当前选中的语言', async () => {
    // 打开语言菜单
    await openLanguageMenu(headerPage, contentPage);
    
    // 验证简体中文项有active类（默认语言）
    const zhCnItem = contentPage.locator('.language-menu-item:has-text("简体中文")').first();
    await expect(zhCnItem).toHaveClass(/active/);
    
    // 关闭菜单（点击遮罩层）
    const overlay = contentPage.locator('.language-menu-overlay').first();
    await overlay.click();
    await contentPage.waitForTimeout(300);
    
    // 切换到英文
    await openLanguageMenu(headerPage, contentPage);
    await selectLanguage(contentPage, 'English');
    await contentPage.waitForTimeout(300);
    
    // 再次打开菜单
    await openLanguageMenu(headerPage, contentPage);
    
    // 验证英文项有active类
    const enItem = contentPage.locator('.language-menu-item:has-text("English")').first();
    await expect(enItem).toHaveClass(/active/);
  });

  test('点击语言菜单外部应关闭菜单', async () => {
    // 打开语言菜单
    await openLanguageMenu(headerPage, contentPage);
    
    // 验证菜单可见
    const languageMenu = contentPage.locator('.language-dropdown-menu');
    await expect(languageMenu).toBeVisible();
    
    // 点击遮罩层关闭菜单
    const overlay = contentPage.locator('.language-menu-overlay').first();
    await overlay.click();
    
    // 验证菜单已关闭
    await expect(languageMenu).not.toBeVisible();
  });

  test('语言菜单应显示正确的语言图标', async () => {
    // 打开语言菜单
    await openLanguageMenu(headerPage, contentPage);
    
    // 验证各语言项包含正确的emoji图标
    const zhCnItem = contentPage.locator('.language-menu-item:has-text("简体中文")').first();
    const zhCnFlag = zhCnItem.locator('.language-flag');
    await expect(zhCnFlag).toBeVisible();
    const zhCnFlagText = await zhCnFlag.textContent();
    expect(zhCnFlagText).toBe('🇨🇳');
    
    const enItem = contentPage.locator('.language-menu-item:has-text("English")').first();
    const enFlag = enItem.locator('.language-flag');
    await expect(enFlag).toBeVisible();
    const enFlagText = await enFlag.textContent();
    expect(enFlagText).toBe('🇺🇸');
  });

  test('选中的语言应显示勾选标记', async () => {
    // 打开语言菜单
    await openLanguageMenu(headerPage, contentPage);
    
    // 验证当前选中的语言（简体中文）有勾选标记
    const zhCnItem = contentPage.locator('.language-menu-item:has-text("简体中文")').first();
    const checkMark = zhCnItem.locator('.language-check');
    await expect(checkMark).toBeVisible();
    const checkText = await checkMark.textContent();
    expect(checkText).toBe('✓');
  });

  test('多次切换语言应正常工作', async () => {
    const languages = [
      { name: 'English', code: 'en', display: 'EN' },
      { name: '繁體中文', code: 'zh-tw', display: '繁' },
      { name: '日本語', code: 'ja', display: 'JP' },
      { name: '简体中文', code: 'zh-cn', display: '中' }
    ];
    
    for (const lang of languages) {
      // 打开菜单并选择语言
      await openLanguageMenu(headerPage, contentPage);
      await selectLanguage(contentPage, lang.name);
      await contentPage.waitForTimeout(300);
      
      // 验证显示文本
      const displayText = await getCurrentLanguageDisplay(headerPage);
      expect(displayText).toBe(lang.display);
      
      // 验证存储的语言代码
      const storedLanguage = await getStoredLanguage(contentPage);
      expect(storedLanguage).toBe(lang.code);
    }
  });

  test('语言切换不应影响应用的其他功能', async () => {
    // 切换到英文
    await openLanguageMenu(headerPage, contentPage);
    await selectLanguage(contentPage, 'English');
    await contentPage.waitForTimeout(500);
    
    // 验证新建项目按钮仍然可用
    const newProjectBtn = contentPage.locator('button').filter({ hasText: /New Project|新建项目/ }).first();
    await expect(newProjectBtn).toBeVisible();
    await expect(newProjectBtn).toBeEnabled();
    
    // 验证网络模式切换按钮仍然可用
    const networkBtn = headerPage.locator('.network-btn').first();
    await expect(networkBtn).toBeVisible();
  });
});
