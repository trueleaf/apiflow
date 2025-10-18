import { WSAfter, InitDataMessage, EvalMessage } from './types/types.ts';
import { variables } from '../preRequest/variables/index.ts'
import { cookies } from '../preRequest/cookies/index.ts'
import { localStorage } from '../preRequest/localStorage/index.ts'
import { sessionStorage } from '../preRequest/sessionStorage/index.ts'
import axios from 'axios'

const ws: WSAfter = new Proxy({
  projectId: '',
  nodeId: '',
  response: {
    data: '',
    type: 'text' as 'text' | 'binary',
    timestamp: 0,
    size: 0,
    mimeType: '',
  },
  variables,
  sessionStorage,
  localStorage,
  cookies,
}, {
  deleteProperty(target, key) {
    if (key === 'nodeId' || key === 'response' || key === 'variables' || key === 'sessionStorage' || key === 'localStorage' || key === 'cookies') {
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
    console.log('WebSocket AfterRequest initData', e.data)
    const { websocketInfo, responseData } = e.data;

    // 初始化基本信息
    ws.nodeId = websocketInfo._id;
    ws.projectId = websocketInfo.projectId;

    // 初始化响应数据
    ws.response.data = responseData.data;
    ws.response.type = responseData.type;
    ws.response.timestamp = responseData.timestamp;
    ws.response.size = responseData.size;
    ws.response.mimeType = responseData.mimeType || '';

    // 初始化变量、Cookies、Storage
    Object.assign(ws.variables, e.data.variables);
    Object.assign(ws.cookies, e.data.cookies);
    Object.assign(ws.localStorage, e.data.localStorage);
    Object.assign(ws.sessionStorage, e.data.sessionStorage);

    self.postMessage({
      type: 'ws-after-request-init-success',
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
          type: 'ws-after-request-eval-success',
          value: JSON.parse(JSON.stringify(ws)),
        });
      }).catch((error: Error) => {
        console.error(error);
        self.postMessage({
          type: 'ws-after-request-eval-error',
          value: {
            message: error?.message,
            stack: error?.stack,
          }
        });
      });
    } catch (error) {
      console.error(error);
      self.postMessage({
        type: 'ws-after-request-eval-error',
        value: (error as Error)?.message,
      });
    }
  }
};
