import type { ResponseInfo } from "@src/types/types"
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