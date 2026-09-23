import { test, expect } from '../../../../fixtures/desktop.fixture';
import { execCode as execCodeWeb } from '@src/shared/execCode.web';

test('Tauri 与 Web 表达式执行结果一致，原生沙箱限制宿主访问和死循环', async ({ contentPage }) => {
  const result = await contentPage.evaluate(async () => ({
    expression: await window.desktopAPI!.execCode('value + 2', { value: 3 }),
    isolated: await window.desktopAPI!.execCode('typeof process + ":" + typeof require', {}),
    timeout: await window.desktopAPI!.execCode('while (true) {}', {}),
  }));
  const web = await execCodeWeb('value + 2', { value: 3 });
  expect(result.expression).toMatchObject({ code: 0, data: web.data });
  expect(result.isolated).toMatchObject({ code: 0, data: 'undefined:undefined' });
  expect(result.timeout.code).toBe(1);
});
