import { test, expect } from '@playwright/test';
import { parseUrl, getStrParams, getStrHeader, getStrJsonBody } from '@src/renderer/api/sign';

test.describe('ApiSignUtilsContract', () => {
  // 签名基础工具在 URL/参数/Header/Body 规范化上保持稳定
  test('sign 工具函数输出可预测且顺序稳定', async () => {
    // URL 解析应分离 path 与 query，并处理 + 号为空格
    const parsed = parseUrl('/api/demo?b=2&a=1+2&empty=');
    expect(parsed.url).toBe('/api/demo');
    expect(parsed.queryParams).toEqual({
      b: '2',
      a: '1 2',
      empty: '',
    });
    // 参数签名串应按 key 排序
    const strParams = getStrParams({
      z: 'last',
      a: 'first',
      m: 'middle',
    });
    expect(strParams).toBe('a=first&m=middle&z=last');
    // Header 签名串应按 key 排序并统一为小写 key
    const { strHeader, sortedHeaderKeys } = getStrHeader({
      'X-Beta': '2',
      'a-Token': 'token',
      'Content-Type': 'application/json',
    });
    expect(sortedHeaderKeys).toEqual(['Content-Type', 'X-Beta', 'a-Token']);
    expect(strHeader).toBe('content-type:application/json\nx-beta:2\na-token:token');
    // JSON Body 哈希应与 key 顺序无关
    const hash1 = getStrJsonBody({ a: '1', b: '2' });
    const hash2 = getStrJsonBody({ b: '2', a: '1' });
    expect(hash1).toBeTruthy();
    expect(hash1).toBe(hash2);
  });
});
