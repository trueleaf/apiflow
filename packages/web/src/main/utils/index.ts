import type { ResponseInfo, WindowState } from "@src/types/types"
import { BrowserWindow } from "electron";

export const generateEmptyResponse = (): ResponseInfo => {
  return {
    id: '',
    apiId: '',
    requestId: '',
    headers: {},
    contentLength: 0,
    finalRequestUrl: '',
    redirectList: [],
    ip: '',
    isFromCache: false,
    statusCode: 0,
    timings: {
      start: 0,
      socket: 0,
      lookup: 0,
      connect: 0,
      secureConnect: 0,
      upload: 0,
      response: 0,
      end: 0,
      error: 0,
      abort: 0,
      phases: {
          wait: 0,
          dns: 0,
          tcp: 0,
          tls: 0,
          request: 0,
          firstByte: 0,
          download: 0,
          total: 0,
      }
    },
    contentType: '',
    retryCount: 0,
    body: null,
    bodyByteLength: 0,
    rt: 0,
    requestData: {
      url: "",
      method: "get",
      body: "",
      headers: {},
      host: "",
    },
    responseData: {
      canApiflowParseType: 'none',
      jsonData: '',
      textData: '',
      errorData: '',
      streamData: [],
      fileData: {
        url: '',
        name: '',
        ext: '',
      }
    },
  }
}
export const changeDevtoolsFont = (win: BrowserWindow) => {
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
export function arrayToTree<T extends { _id: string; pid: string }>(list: T[]): (T & { children: T[] })[] {
  const map = new Map<string, T & { children: T[] }>();
  const roots: (T & { children: T[] })[] = [];
  list.forEach(item => {
    map.set(item._id, { ...item, children: [] });
  });
  map.forEach(node => {
    if (node.pid && map.has(node.pid)) {
      map.get(node.pid)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}
/**
 * 遍历树形数据
 */
export const dfsForest = <T extends { children: T[], [propsName: string]: unknown }>(forestData: T[], fn: (item: T, level: number) => void) => {
  if (!Array.isArray(forestData)) {
    throw new Error('第一个参数必须为数组类型');
  }
  const foo = (forestData: T[], hook: (item: T, level: number) => void, level: number) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      hook(currentData, level);
      if (!currentData['children']) {
        continue;
      }
      if (!Array.isArray(currentData['children'])) {
        continue;
      }
      if ((currentData['children']).length > 0) {
        foo(currentData['children'], hook, level + 1);
      }
    }
  };
  foo(forestData, fn, 1);
}
export const getWindowState = (mainWindow: BrowserWindow): WindowState => {
  const isMinimized = mainWindow.isMinimized();
  const isMaximized = mainWindow.isMaximized();
  const isFullScreen = mainWindow.isFullScreen();
  const isVisible = mainWindow.isVisible();
  const isFocused = mainWindow.isFocused();
  const position = mainWindow.getPosition();
  const size = mainWindow.getSize();

  return {
    isMaximized,
    isMinimized,
    isFullScreen,
    isNormal: !isMinimized && !isMaximized && !isFullScreen,
    isVisible,
    isFocused,
    x: position[0],
    y: position[1],
    width: size[0],
    height: size[1],
  }
}
