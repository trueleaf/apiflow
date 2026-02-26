import { test, expect } from '../../../../fixtures/electron.fixture';
import zhCnMessages from '../../../../../src/renderer/i18n/zh-cn';
import enMessages from '../../../../../src/renderer/i18n/en';

test.describe('I18nResourceConsistency', () => {
  // 中英文资源键应保持一致，避免界面出现缺失翻译
  test('zh-cn 与 en 的 i18n 资源键集合一致', async () => {
    const zhKeys: string[] = [];
    const enKeys: string[] = [];
    // 展开中文资源的所有键路径
    const zhStack: Array<{ prefix: string; value: unknown }> = [{ prefix: '', value: zhCnMessages as Record<string, unknown> }];
    while (zhStack.length > 0) {
      const current = zhStack.pop();
      if (!current) {
        continue;
      }
      if (typeof current.value !== 'object' || current.value === null || Array.isArray(current.value)) {
        continue;
      }
      const entries = Object.entries(current.value as Record<string, unknown>);
      for (let i = 0; i < entries.length; i += 1) {
        const [key, value] = entries[i];
        const nextPath = current.prefix ? `${current.prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          zhStack.push({ prefix: nextPath, value });
          continue;
        }
        zhKeys.push(nextPath);
      }
    }
    // 展开英文资源的所有键路径
    const enStack: Array<{ prefix: string; value: unknown }> = [{ prefix: '', value: enMessages as Record<string, unknown> }];
    while (enStack.length > 0) {
      const current = enStack.pop();
      if (!current) {
        continue;
      }
      if (typeof current.value !== 'object' || current.value === null || Array.isArray(current.value)) {
        continue;
      }
      const entries = Object.entries(current.value as Record<string, unknown>);
      for (let i = 0; i < entries.length; i += 1) {
        const [key, value] = entries[i];
        const nextPath = current.prefix ? `${current.prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          enStack.push({ prefix: nextPath, value });
          continue;
        }
        enKeys.push(nextPath);
      }
    }
    zhKeys.sort();
    enKeys.sort();
    const missingInEn = zhKeys.filter(key => !enKeys.includes(key));
    const missingInZh = enKeys.filter(key => !zhKeys.includes(key));
    expect(missingInEn, `en.ts 缺失键：${missingInEn.slice(0, 20).join(',')}`).toEqual([]);
    expect(missingInZh, `zh-cn.ts 缺失键：${missingInZh.slice(0, 20).join(',')}`).toEqual([]);
  });
});
