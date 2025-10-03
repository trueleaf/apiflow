import type { Page } from '@playwright/test';

/**
 * 等待元素出现
 * @param page - Playwright Page 对象
 * @param selector - 元素选择器
 * @param timeout - 超时时间（毫秒）
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 10000
): Promise<void> {
  await page.waitForSelector(selector, { timeout, state: 'visible' });
}

/**
 * 等待元素消失
 * @param page - Playwright Page 对象
 * @param selector - 元素选择器
 * @param timeout - 超时时间（毫秒）
 */
export async function waitForElementHidden(
  page: Page,
  selector: string,
  timeout = 10000
): Promise<void> {
  await page.waitForSelector(selector, { timeout, state: 'hidden' });
}

/**
 * 等待网络空闲
 * @param page - Playwright Page 对象
 */
export async function waitForNetworkIdle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * 等待指定时间
 * @param ms - 等待毫秒数
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
