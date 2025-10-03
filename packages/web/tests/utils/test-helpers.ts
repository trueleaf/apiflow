import type { Page, Locator } from '@playwright/test';

/**
 * 测试辅助函数集合
 */

/**
 * 安全点击元素（等待元素可见后再点击）
 * @param locator - Playwright Locator 对象
 */
export async function safeClick(locator: Locator): Promise<void> {
  await locator.waitFor({ state: 'visible' });
  await locator.click();
}

/**
 * 安全填写表单（等待元素可见后再填写）
 * @param locator - Playwright Locator 对象
 * @param value - 要填写的值
 */
export async function safeFill(locator: Locator, value: string): Promise<void> {
  await locator.waitFor({ state: 'visible' });
  await locator.fill(value);
}

/**
 * 截图并附加到测试报告
 * @param page - Playwright Page 对象
 * @param name - 截图名称
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

/**
 * 获取元素文本内容
 * @param locator - Playwright Locator 对象
 * @returns 元素文本内容
 */
export async function getTextContent(locator: Locator): Promise<string> {
  await locator.waitFor({ state: 'visible' });
  const text = await locator.textContent();
  return text || '';
}

/**
 * 判断元素是否存在
 * @param page - Playwright Page 对象
 * @param selector - 元素选择器
 * @returns 是否存在
 */
export async function isElementExist(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout: 1000, state: 'attached' });
    return true;
  } catch {
    return false;
  }
}
