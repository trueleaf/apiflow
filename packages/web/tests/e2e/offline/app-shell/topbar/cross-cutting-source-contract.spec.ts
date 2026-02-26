import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

test.describe('CrossCuttingSourceContract', () => {
  // 跨域公共能力的关键实现入口保持稳定（api封装、analytics链路、平台桥接）
  test('关键源码契约检查', async () => {
    const apiSource = await fs.readFile(path.resolve('src/renderer/api/api.ts'), 'utf8');
    // API 请求封装需同时保留 axios 拦截器与 fetch 流式请求分支
    expect(apiSource).toContain('axiosInstance.interceptors.request.use');
    expect(apiSource).toContain('axiosInstance.interceptors.response.use');
    expect(apiSource).toContain('export const requestStream = async');
    expect(apiSource).toContain("headers.set('x-sign'");
    expect(apiSource).toContain("headers.set('x-sign-headers'");
    expect(apiSource).toContain("headers.set('x-sign-timestamp'");
    expect(apiSource).toContain("headers.set('x-sign-nonce'");
    const analyticsSource = await fs.readFile(path.resolve('src/renderer/utils/analytics.ts'), 'utf8');
    const appConfigSource = await fs.readFile(path.resolve('src/renderer/pages/settings/commonSettings/appConfig/AppConfigPanel.vue'), 'utf8');
    const routerSource = await fs.readFile(path.resolve('src/renderer/router/index.ts'), 'utf8');
    // 埋点链路需包含加载、卸载与事件上报路径
    expect(analyticsSource).toContain('export const loadAnalytics');
    expect(analyticsSource).toContain('export const unloadAnalytics');
    expect(analyticsSource).toContain('export const trackEvent');
    expect(appConfigSource).toContain('loadAnalytics()');
    expect(appConfigSource).toContain('unloadAnalytics()');
    expect(routerSource).toContain('trackPageView(to.path');
    const platformBridgeSource = await fs.readFile(path.resolve('src/renderer/composables/usePlatformBridge.ts'), 'utf8');
    const themeHookSource = await fs.readFile(path.resolve('src/renderer/hooks/useTheme.ts'), 'utf8');
    // 平台桥接与主题 Hook 的核心入口需持续可用
    expect(platformBridgeSource).toContain('export const sendToMain');
    expect(platformBridgeSource).toContain('export const onMain');
    expect(platformBridgeSource).toContain('const eventToName');
    expect(themeHookSource).toContain('const initTheme = () =>');
    expect(themeHookSource).toContain('applyTheme');
    expect(themeHookSource).toContain('getSystemTheme');
  });
});
