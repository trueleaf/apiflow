import { test, expect } from '../../../../fixtures/desktop.fixture';
import { execCode as execCodeWeb } from '@src/shared/execCode.web';

test('Tauri 与 Web 表达式执行结果一致，原生沙箱限制宿主访问和死循环', async ({ contentPage }) => {
  const result = await contentPage.evaluate(async () => {
    const native = (window as unknown as { __TAURI_INTERNALS__: { invoke: (command: string, args: unknown) => Promise<{ data: unknown }> } }).__TAURI_INTERNALS__;
    return {
      expression: { code: 0, ...await native.invoke('execute_script', { code: '({data: value + 2})', variables: { value: 3 } }) },
      isolated: { code: 0, ...await native.invoke('execute_script', { code: '({data: typeof process + ":" + typeof require})', variables: {} }) },
      timeout: await native.invoke('execute_script', { code: 'while (true) {}', variables: {} }).then(() => ({ code: 0 })).catch(() => ({ code: 1 })),
    };
  });
  const web = await execCodeWeb('value + 2', { value: 3 });
  expect(result.expression).toMatchObject({ code: 0, data: web.data });
  expect(result.isolated).toMatchObject({ code: 0, data: 'undefined:undefined' });
  expect(result.timeout.code).toBe(1);
});
