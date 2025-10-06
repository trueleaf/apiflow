import { defineConfig } from '@playwright/test';
import path from 'path';

/**
 * Playwright Electron 配置文件
 * 用于测试 Electron 应用
 * 参考文档: https://playwright.dev/docs/api/class-electron
 */
export default defineConfig({
  // 测试文件目录
  testDir: './tests/e2e',
  
  // 完全并行运行测试
  fullyParallel: false, // Electron 测试建议串行执行，避免多个 Electron 实例冲突
  
  // CI 环境下禁止 test.only
  forbidOnly: !!process.env.CI,
  
  // CI 环境下失败重试 2 次
  retries: process.env.CI ? 2 : 0,
  
  // 使用 1 个 worker（Electron 应用测试建议单线程）
  workers: 1,
  
  // 测试报告生成 HTML 格式
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['list']
  ],
  
  // 全局测试配置
  use: {
    // 失败时重试录制 trace
    trace: 'retain-on-failure',
    
    // 失败时截图
    screenshot: 'only-on-failure',
    
    // 失败时录制视频
    video: 'retain-on-failure',
    
    // 设置超时
    actionTimeout: 10000,
  },
  
  // 测试项目配置
  projects: [
    {
      name: 'electron',
      testMatch: '**/*.spec.ts',
    },
  ],
  
  // 全局超时设置（30 秒）
  timeout: 30 * 1000,
  
  // 期望断言超时（5 秒）
  expect: {
    timeout: 5000,
  },
  
  // 输出目录
  outputDir: 'test-results/',
});
