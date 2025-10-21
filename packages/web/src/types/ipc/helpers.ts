/**
 * IPC 类型安全的辅助工具
 * 提供编译时类型检查的 IPC 通信方法
 */

import type { IpcRenderer, IpcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import type { IPCEventMap, IPCRequest, IPCResponse } from './payloads';

/**
 * 类型安全的 ipcRenderer.send 包装器
 */
export function typedSend<T extends keyof IPCEventMap>(
  ipcRenderer: IpcRenderer,
  channel: T,
  ...args: IPCRequest<T> extends void ? [] : [IPCRequest<T>]
): void {
  ipcRenderer.send(channel as string, ...(args as any[]));
}

/**
 * 类型安全的 ipcRenderer.invoke 包装器
 */
export function typedInvoke<T extends keyof IPCEventMap>(
  ipcRenderer: IpcRenderer,
  channel: T,
  ...args: IPCRequest<T> extends void ? [] : [IPCRequest<T>]
): Promise<IPCResponse<T>> {
  return ipcRenderer.invoke(channel as string, ...(args as any[])) as Promise<IPCResponse<T>>;
}

/**
 * 类型安全的 ipcRenderer.on 包装器
 */
export function typedOn<T extends keyof IPCEventMap>(
  ipcRenderer: IpcRenderer,
  channel: T,
  listener: (event: Electron.IpcRendererEvent, data: IPCRequest<T>) => void
): void {
  ipcRenderer.on(channel as string, listener as any);
}

/**
 * 类型安全的 ipcRenderer.once 包装器
 */
export function typedOnce<T extends keyof IPCEventMap>(
  ipcRenderer: IpcRenderer,
  channel: T,
  listener: (event: Electron.IpcRendererEvent, data: IPCRequest<T>) => void
): void {
  ipcRenderer.once(channel as string, listener as any);
}

/**
 * 类型安全的 ipcRenderer.removeListener 包装器
 */
export function typedRemoveListener<T extends keyof IPCEventMap>(
  ipcRenderer: IpcRenderer,
  channel: T,
  listener: (event: Electron.IpcRendererEvent, data: IPCRequest<T>) => void
): void {
  ipcRenderer.removeListener(channel as string, listener as any);
}

/**
 * 类型安全的 ipcMain.on 包装器
 */
export function typedMainOn<T extends keyof IPCEventMap>(
  ipcMain: IpcMain,
  channel: T,
  listener: (event: IpcMainEvent, data: IPCRequest<T>) => void
): void {
  ipcMain.on(channel as string, listener as any);
}

/**
 * 类型安全的 ipcMain.handle 包装器
 */
export function typedMainHandle<T extends keyof IPCEventMap>(
  ipcMain: IpcMain,
  channel: T,
  listener: (
    event: IpcMainInvokeEvent,
    data: IPCRequest<T>
  ) => Promise<IPCResponse<T>> | IPCResponse<T>
): void {
  ipcMain.handle(channel as string, (_event, data) => listener(_event, data as IPCRequest<T>));
}

/**
 * 类型安全的 ipcMain.removeHandler 包装器
 */
export function typedMainRemoveHandler<T extends keyof IPCEventMap>(
  ipcMain: IpcMain,
  channel: T
): void {
  ipcMain.removeHandler(channel as string);
}

/**
 * 创建类型安全的 ipcRenderer 包装对象
 */
export function createTypedIpcRenderer(ipcRenderer: IpcRenderer) {
  return {
    send: <T extends keyof IPCEventMap>(
      channel: T,
      ...args: IPCRequest<T> extends void ? [] : [IPCRequest<T>]
    ) => typedSend(ipcRenderer, channel, ...args),

    invoke: <T extends keyof IPCEventMap>(
      channel: T,
      ...args: IPCRequest<T> extends void ? [] : [IPCRequest<T>]
    ) => typedInvoke(ipcRenderer, channel, ...args),

    on: <T extends keyof IPCEventMap>(
      channel: T,
      listener: (event: Electron.IpcRendererEvent, data: IPCRequest<T>) => void
    ) => typedOn(ipcRenderer, channel, listener),

    once: <T extends keyof IPCEventMap>(
      channel: T,
      listener: (event: Electron.IpcRendererEvent, data: IPCRequest<T>) => void
    ) => typedOnce(ipcRenderer, channel, listener),

    removeListener: <T extends keyof IPCEventMap>(
      channel: T,
      listener: (event: Electron.IpcRendererEvent, data: IPCRequest<T>) => void
    ) => typedRemoveListener(ipcRenderer, channel, listener),
  };
}

/**
 * 创建类型安全的 ipcMain 包装对象
 */
export function createTypedIpcMain(ipcMain: IpcMain) {
  return {
    on: <T extends keyof IPCEventMap>(
      channel: T,
      listener: (event: IpcMainEvent, data: IPCRequest<T>) => void
    ) => typedMainOn(ipcMain, channel, listener),

    handle: <T extends keyof IPCEventMap>(
      channel: T,
      listener: (
        event: IpcMainInvokeEvent,
        data: IPCRequest<T>
      ) => Promise<IPCResponse<T>> | IPCResponse<T>
    ) => typedMainHandle(ipcMain, channel, listener),

    removeHandler: <T extends keyof IPCEventMap>(channel: T) =>
      typedMainRemoveHandler(ipcMain, channel),
  };
}
