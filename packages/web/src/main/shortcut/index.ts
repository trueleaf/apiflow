import { BrowserWindow, globalShortcut } from 'electron';

export const bindMainProcessGlobalShortCut = (win: BrowserWindow) => {
  let isShortcutRegistered = false;
  win.on('focus', () => {
    if (!isShortcutRegistered) {
      globalShortcut.register('CommandOrControl+R', () => {
        const wins = BrowserWindow.getAllWindows();
        wins.forEach(win => {
          win.reload(); // 重新加载当前窗口
        })
      });
      globalShortcut.register('CommandOrControl+Shift+R', () => {
        const wins = BrowserWindow.getAllWindows();
        wins.forEach(win => {
          win.webContents.reloadIgnoringCache();
        })
      });
      isShortcutRegistered = true;
    }
  });
  win.on('blur', () => {
    if (isShortcutRegistered) {
      globalShortcut.unregister('CommandOrControl+R');
      globalShortcut.unregister('CommandOrControl+Shift+R');
      isShortcutRegistered = false;
    }
  });
}
