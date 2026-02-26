import { test, expect } from '@playwright/test';
import { IPC_EVENTS } from '@src/types/ipc/events';
import type { IPCEventMap } from '@src/types/ipc/payloads';
import type { RuntimeNetworkMode, RuntimeState } from '@src/types/runtime';
import type { QuickLoginCredential } from '@src/types/security/quickLogin';

type IsTypeEqual<T1, T2> = (
  (<T>() => T extends T1 ? 1 : 2) extends (<T>() => T extends T2 ? 1 : 2) ? true : false
);

test.describe('RuntimeSecurityTypeContract', () => {
  // 运行时与安全类型在 IPC 事件和状态模型中的边界保持稳定
  test('RuntimeNetworkMode 与 QuickLoginCredential 契约一致', async () => {
    // 编译期校验：运行时网络模式边界仅允许 online/offline
    const networkModes: RuntimeNetworkMode[] = ['online', 'offline'];
    expect(networkModes).toHaveLength(2);
    // 编译期校验：运行时状态中的 networkMode 字段类型保持一致
    const runtimeNetworkTypeAssert: IsTypeEqual<RuntimeState['networkMode'], RuntimeNetworkMode> = true;
    expect(runtimeNetworkTypeAssert).toBeTruthy();
    // 编译期校验：安全类型 QuickLoginCredential 与 IPC 请求载荷保持同源
    const quickLoginPayloadAssert: IsTypeEqual<
      IPCEventMap[typeof IPC_EVENTS.apiflow.contentToTopBar.quickLoginCredentialChanged]['request'],
      QuickLoginCredential
    > = true;
    expect(quickLoginPayloadAssert).toBeTruthy();
  });
});
