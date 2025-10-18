import { WS, InitDataMessage, EvalMessage, OnSetLocalStorageEvent, OnDeleteLocalStorageEvent, OnSetSessionStorageEvent, OnDeleteSessionStorageEvent } from './types/types.ts';
import { variables } from '../preRequest/variables/index.ts'
import { cookies } from '../preRequest/cookies/index.ts'
import axios from 'axios'

// WebSocket 专用的 localStorage 和 sessionStorage（发送不同的消息类型）
const _localStorage: Record<string, unknown> = {};
const localStorageHandler = {
  get(target: Record<string, unknown>, key: string) {
    return target[key];
  },
  set(target: Record<string, unknown>, key: string, value: unknown) {
    target[key] = value;
    const valueStr = value?.toString?.();
    if (valueStr && valueStr.length > 1024 * 100) {
      console.warn(`localStorage 值最大为100kb，当前值为${valueStr.length / 1000}kb`);
      return true
    }
    self.postMessage({
      type: 'ws-pre-request-set-local-storage',
      value: JSON.parse(JSON.stringify(target)),
    } as OnSetLocalStorageEvent);
    return true;
  },
  deleteProperty(target: Record<string, unknown>, key: string) {
    delete target[key];
    self.postMessage({
      type: 'ws-pre-request-delete-local-storage',
      value: JSON.parse(JSON.stringify(target)),
    } as OnDeleteLocalStorageEvent);
    return true;
  },
};
const localStorage = new Proxy(_localStorage, localStorageHandler);

const _sessionStorage: Record<string, unknown> = {};
const sessionStorageHandler = {
  get(target: Record<string, unknown>, key: string) {
    return target[key];
  },
  set(target: Record<string, unknown>, key: string, value: unknown) {
    target[key] = value;
    const valueStr = value?.toString?.();
    if (valueStr && valueStr.length > 1024 * 100) {
      console.warn(`sessionStorage 值最大为100kb，当前值为${valueStr.length / 1000}kb`);
      return true
    }
    self.postMessage({
      type: 'ws-pre-request-set-session-storage',
      value: JSON.parse(JSON.stringify(target)),
    } as OnSetSessionStorageEvent);
    return true;
  },
  deleteProperty(target: Record<string, unknown>, key: string) {
    delete target[key];
    self.postMessage({
      type: 'ws-pre-request-delete-session-storage',
      value: JSON.parse(JSON.stringify(target)),
    } as OnDeleteSessionStorageEvent);
    return true;
  },
};
const sessionStorage = new Proxy(_sessionStorage, sessionStorageHandler);

// 创建 WebSocket 请求代理对象
const createWebSocketRequestProxy = () => {
  let replacedUrl = '';

  return {
    protocol: 'ws' as 'ws' | 'wss',
    url: {
      prefix: '',
      path: '',
      url: ''
    },
    headers: {} as Record<string, string>,
    queryParams: {} as Record<string, string>,
    replaceUrl(url: string) {
      replacedUrl = url;
    },
    getReplacedUrl() {
      return replacedUrl;
    }
  };
};

const ws: WS = new Proxy({
  projectId: '',
  nodeId: '',
  request: createWebSocketRequestProxy(),
  variables,
  sessionStorage,
  localStorage,
  cookies,
}, {
  deleteProperty(target, key) {
    if (key === 'nodeId' || key === 'request' || key === 'variables' || key === 'sessionStorage' || key === 'localStorage' || key === 'cookies') {
      return true;
    }
    return Reflect.deleteProperty(target, key);
  },
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const options = {
  axios,
}

self.onmessage = (e: MessageEvent<InitDataMessage | EvalMessage>) => {
  if (e.data.type === "initData") {
    console.log('WebSocket PreRequest initData', e.data)
    const { websocketInfo } = e.data;

    // 初始化基本信息
    ws.nodeId = websocketInfo._id;
    ws.projectId = websocketInfo.projectId;
    ws.request.protocol = websocketInfo.item.protocol;

    // 初始化 URL 信息
    ws.request.url.prefix = websocketInfo.item.url.prefix;
    ws.request.url.path = websocketInfo.item.url.path;
    // 构建完整 URL
    const protocol = websocketInfo.item.protocol;
    const prefix = websocketInfo.item.url.prefix;
    const path = websocketInfo.item.url.path;
    ws.request.url.url = `${protocol}://${prefix}${path}`;

    // 初始化 Headers
    websocketInfo.item.headers.forEach(header => {
      if (header.select && header.key) {
        ws.request.headers[header.key] = header.value;
      }
    });

    // 初始化 Query Parameters
    websocketInfo.item.queryParams.forEach(param => {
      if (param.select && param.key) {
        ws.request.queryParams[param.key] = param.value;
      }
    });

    // 初始化变量、Cookies、Storage
    Object.assign(ws.variables, e.data.variables);
    Object.assign(ws.cookies, e.data.cookies);
    Object.assign(ws.localStorage, e.data.localStorage);
    Object.assign(ws.sessionStorage, e.data.sessionStorage);

    self.postMessage({
      type: 'ws-pre-request-init-success',
    });
  }

  if (e.data.type === "eval") {
    const { code } = e.data;
    try {
      const wrappedFunction = new Function('ws', 'options', `
        return (async function() {
          const axios = options.axios;
          ${code}
          return ws;
        })(ws, options);
      `);
      const evalPromise = wrappedFunction(ws, options);
      evalPromise.then(() => {
        self.postMessage({
          type: 'ws-pre-request-eval-success',
          value: JSON.parse(JSON.stringify(ws)),
        });
      }).catch((error: Error) => {
        console.error(error);
        self.postMessage({
          type: 'ws-pre-request-eval-error',
          value: {
            message: error?.message,
            stack: error?.stack,
          }
        });
      });
    } catch (error) {
      console.error(error);
      self.postMessage({
        type: 'ws-pre-request-eval-error',
        value: (error as Error)?.message,
      });
    }
  }
};
