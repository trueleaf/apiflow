import { listen } from '@tauri-apps/api/event';
import { getCurrentWebview } from '@tauri-apps/api/webview';

const listeners = new Map<string, Set<(payload: unknown) => void>>();
// 分发桌面服务消息
export const dispatchDesktopEvent = (channel: string, payload: unknown) => {
  for (const callback of [...(listeners.get(channel) ?? [])]) {
    try { callback(payload); } catch (error) { window.reportError(error); }
  }
};
// 注册桌面服务消息监听
export const onDesktopEvent = <T = unknown>(channel: string, callback: (payload: T) => void) => {
  const callbacks = listeners.get(channel) ?? new Set<(payload: unknown) => void>();
  callbacks.add(callback as (payload: unknown) => void);
  listeners.set(channel, callbacks);
};
// 移除桌面服务消息监听
export const offDesktopEvent = <T = unknown>(channel: string, callback?: (payload: T) => void) => {
  if (!callback) listeners.delete(channel);
  else {
    const callbacks = listeners.get(channel);
    callbacks?.delete(callback as (payload: unknown) => void);
    if (callbacks?.size === 0) listeners.delete(channel);
  }
};
// 在页面业务初始化前接通原生事件
export const connectDesktopEvents = async () => {
  await listen<{ channel: string; payload: unknown }>('desktop-message', event => {
    let payload = event.payload.payload;
    if (event.payload.channel === 'websocket:main:to:renderer:message' && payload && typeof payload === 'object' && 'message' in payload && Array.isArray(payload.message)) {
      payload = { ...payload, message: Uint8Array.from(payload.message) };
    }
    dispatchDesktopEvent(event.payload.channel, payload);
  }, { target: { kind: 'Webview', label: getCurrentWebview().label } });
  window.addEventListener('beforeunload', () => { listeners.clear(); }, { once: true });
};
