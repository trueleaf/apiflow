import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

test.describe('HttpWebRequestRuntimeContract', () => {
  // Web 模式 HTTP 请求需要保持 proxyServerUrl 拼接、普通请求与 SSE 流式回调分支契约
  test('request.web 与 request.ts 关键分支源码契约稳定', async () => {
    const webRequestSource = await fs.readFile(path.resolve('src/renderer/server/request/request.web.ts'), 'utf8');
    const requestSource = await fs.readFile(path.resolve('src/renderer/server/request/request.ts'), 'utf8');
    // 校验 Web 代理地址拼接规则，确保支持自定义 proxyServerUrl 与默认 /api/proxy/http
    expect(webRequestSource).toContain("const proxyUrl = normalizedProxyServerUrl ? `${normalizedProxyServerUrl}/api/proxy/http` : '/api/proxy/http';");
    expect(webRequestSource).toContain('const proxyServerUrl = appSettingsCache.getProxyServerUrl().trim();');
    // 校验 SSE 代理分支必须设置 enableStream=true，并持续触发 onResponseData 增量回调
    expect(webRequestSource).toContain("body: JSON.stringify({ ...params, enableStream: true })");
    expect(webRequestSource).toContain('options.onResponseData?.(chunkWithTimestamp, loadedLength, 0);');
    expect(webRequestSource).toContain('if (isSSE) {');
    expect(webRequestSource).toContain('await handleSSEStream(proxyUrl, params, options);');
    expect(webRequestSource).toContain('await handleNormalRequest(proxyUrl, params, options);');
    // 校验 sendRequest 与前置脚本 af.http 都保留 Electron/Web 双分支，避免 Web 模式回退到主进程路径
    expect(requestSource).toContain("if (isElectron()) {");
    expect(requestSource).toContain("window.electronAPI?.sendRequest(requestOptions);");
    expect(requestSource).toContain("await webRequest(requestOptions);");
    expect(requestSource).toContain("window.electronAPI?.afHttpRequest(options);");
    expect(requestSource).toContain("webRequest(requestOptions);");
  });
});

