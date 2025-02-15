import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent, Menu, MenuItem } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url';

const isDevelopment = process.env.NODE_ENV !== 'production'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




const changeDevtoolsFont = (win: BrowserWindow) => {
  win.webContents.on('devtools-opened', () => {
    const css = `
        :root {
            --sys-color-base: var(--ref-palette-neutral100);
            --source-code-font-family: consolas !important;
            --source-code-font-size: 12px;
            --monospace-font-family: consolas !important;
            --monospace-font-size: 12px;
            --default-font-family: system-ui, sans-serif;
            --default-font-size: 12px;
            --ref-palette-neutral99: #ffffffff;
        }
        .theme-with-dark-background {
            --sys-color-base: var(--ref-palette-secondary25);
        }
        body {
            --default-font-family: system-ui,sans-serif;
        }
    `;
    win.webContents.devToolsWebContents?.executeJavaScript(`
        const overriddenStyle = document.createElement('style');
        overriddenStyle.innerHTML = '${css.replaceAll('\n', ' ')}';
        document.body.append(overriddenStyle);
        document.querySelectorAll('.platform-windows').forEach(el => el.classList.remove('platform-windows'));
        addStyleToAutoComplete();
        const observer = new MutationObserver((mutationList, observer) => {
            for (const mutation of mutationList) {
                if (mutation.type === 'childList') {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const item = mutation.addedNodes[i];
                        if (item.classList.contains('editor-tooltip-host')) {
                            addStyleToAutoComplete();
                        }
                    }
                }
            }
        });
        observer.observe(document.body, {childList: true});
        function addStyleToAutoComplete() {
            document.querySelectorAll('.editor-tooltip-host').forEach(element => {
                if (element.shadowRoot.querySelectorAll('[data-key="overridden-dev-tools-font"]').length === 0) {
                    const overriddenStyle = document.createElement('style');
                    overriddenStyle.setAttribute('data-key', 'overridden-dev-tools-font');
                    overriddenStyle.innerHTML = '.cm-tooltip-autocomplete ul[role=listbox] {font-family: consolas !important;}';
                    element.shadowRoot.append(overriddenStyle);
                }
            });
        }
    `);
  });
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true
    }
  })
  mainWindow.loadURL('http://localhost:3000')
  mainWindow.webContents.openDevTools()
  mainWindow.maximize()
  changeDevtoolsFont(mainWindow);
}
const rebuildMenu = () => {
  Menu.setApplicationMenu(null)
}
const bindIpcMainHandle = () => {
  ipcMain.handle('apiflow-open-dev-tools', () => {
    BrowserWindow.getAllWindows()?.forEach(win => {
      win.webContents.openDevTools()
    })
  })
  ipcMain.handle('apiflow-read-file-as-blob', async (_: IpcMainInvokeEvent, path: string) => {
    try {
      await fs.access(path, fs.constants.F_OK)
    } catch {
      return '文件不存在'
    }
    try {
      const fsStat = await fs.stat(path);
      if (!fsStat.isFile) {
        return '不是文件无法读取'
      }
      if (fsStat.size > 1024 * 1024 * 10) {
        return '文件大小超过10MB'

      }
      const buffer = await fs.readFile(path)
      return buffer
    } catch (error) {
      return (error as Error).message
    }
  })
  ipcMain.handle('apiflow-reload-ignoring-cache', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.webContents.reloadIgnoringCache();
    }
  })
  ipcMain.handle('apiflow-reload', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.webContents.reload();
    }
  })
}

app.whenReady().then(() => {

  bindIpcMainHandle()
  createWindow()
  rebuildMenu();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      console.log('receive', data)
    })
  } else {
    process.on('SIGTERM', () => {
      console.log(222)
    })
  }
}

