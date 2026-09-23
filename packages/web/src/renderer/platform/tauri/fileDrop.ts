import { invoke, isTauri } from '@tauri-apps/api/core';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import type { UnlistenFn } from '@tauri-apps/api/event';
import type { DesktopFile } from '@src/types/desktop';

// 订阅落在指定区域内的原生文件拖放
export const listenForDroppedFiles = async (element: HTMLElement, callback: (files: DesktopFile[]) => void): Promise<UnlistenFn> => {
  if (!isTauri()) return () => {};
  return getCurrentWebview().onDragDropEvent(async event => {
    if (event.payload.type !== 'drop') return;
    const point = event.payload.position.toLogical(window.devicePixelRatio);
    const bounds = element.getBoundingClientRect();
    if (point.x < bounds.left || point.x > bounds.right || point.y < bounds.top || point.y > bounds.bottom) return;
    try {
      const files = await Promise.all(event.payload.paths.map(path => invoke<DesktopFile>('file_info', { path })));
      callback(files);
    } catch (error) { window.reportError(error); }
  });
};
