import type { Page } from '@playwright/test';
// 导航到AI设置页面
export const navigateToAiSettings = async (
  headerPage: Page,
  contentPage: Page
): Promise<void> => {
  await headerPage.waitForSelector('.icongerenzhongxin', { timeout: 10000 });
  await headerPage.locator('.icongerenzhongxin').click();
  await contentPage.waitForTimeout(500);
  await contentPage.waitForSelector('.user-center', { timeout: 5000 });
  await contentPage.locator('.tab-item:has-text("AI 设置")').click();
  await contentPage.waitForTimeout(1000);
};
// 保存AI配置（通过UI操作）
export const saveAiConfig = async (
  contentPage: Page,
  apiKey: string,
  apiUrl: string
): Promise<void> => {
  await contentPage.locator('input[placeholder="请输入 DeepSeek API Key"]').fill(apiKey);
  await contentPage.locator('input[placeholder="请输入 API 地址"]').fill(apiUrl);
  await contentPage.locator('button:has-text("保存配置")').click();
  await contentPage.waitForTimeout(500);
};
