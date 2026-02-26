import { test, expect } from '@playwright/test';
import { IPC_EVENTS } from '@src/types/ipc/events';
import type { IPCEventMap } from '@src/types/ipc/payloads';

test.describe('IpcEventsPayloadContract', () => {
  // IPC 事件常量与 payload 类型映射关键链路保持契约一致
  test('关键 IPC 事件在 IPCEventMap 中都有 request/response 定义', async () => {
    // 编译期校验：以下事件若未在 IPCEventMap 建立映射，TypeScript 会在这里直接报错
    const contractEvents: Array<keyof IPCEventMap> = [
      IPC_EVENTS.apiflow.topBarToContent.appSettingsChanged,
      IPC_EVENTS.apiflow.contentToTopBar.appSettingsChanged,
      IPC_EVENTS.apiflow.rendererToMain.setWindowIcon,
      IPC_EVENTS.contentViewLifecycle.rendererToMain.retry,
      IPC_EVENTS.contentViewLifecycle.rendererToMain.fallback,
      IPC_EVENTS.contentViewLifecycle.rendererToMain.getLoadState,
      IPC_EVENTS.tempFile.rendererToMain.create,
      IPC_EVENTS.tempFile.rendererToMain.delete,
      IPC_EVENTS.tempFile.rendererToMain.read,
    ];
    expect(contractEvents).toHaveLength(9);
    // 运行时再校验关键事件名常量，防止字符串值被误改
    expect(IPC_EVENTS.apiflow.rendererToMain.setWindowIcon).toBe('apiflow:renderer:to:main:set-window-icon');
    expect(IPC_EVENTS.contentViewLifecycle.rendererToMain.getLoadState).toBe('content-view-lifecycle:renderer:to:main:get-load-state');
    expect(IPC_EVENTS.tempFile.rendererToMain.create).toBe('temp-file:renderer:to:main:create');
  });
});
