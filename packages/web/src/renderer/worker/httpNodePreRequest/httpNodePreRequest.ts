
import { AF, WorkerMessage, AfHttpRequestOptions, AfHttpResponse, HttpErrorMessage, HttpResponseMessage, OnHttpRequestEvent } from './types/types.ts';
import { createRequestProxy } from './request/index.ts'
import { variables } from './variables/index.ts'
import { cookies } from './cookies/index.ts'
import { localStorage } from './localStorage/index.ts'
import { sessionStorage } from './sessionStorage/index.ts'
import axios from 'axios'
import JSONbig from 'json-bigint';

// 生成请求 id
const createRequestId = (() => {
  let index = 0;
  return () => {
    index += 1;
    return `${Date.now()}-${index}`;
  };
})();

// 发送 http 请求（由 renderer 转发到 preload/got 执行）
const createHttpClient = () => {
  const pending = new Map<string, { resolve: (response: AfHttpResponse) => void; reject: (error: Error) => void }>();
  const request = async (url: string, options?: Omit<AfHttpRequestOptions, 'url'>): Promise<AfHttpResponse> => {
    const requestId = createRequestId();
    const message: OnHttpRequestEvent = {
      type: 'pre-request-http-request',
      value: {
        requestId,
        options: {
          url,
          method: options?.method ?? 'GET',
          headers: options?.headers,
          params: options?.params,
          body: options?.body,
          timeout: options?.timeout,
        },
      },
    };
    self.postMessage(message);
    return new Promise<AfHttpResponse>((resolve, reject) => {
      pending.set(requestId, { resolve, reject });
    });
  };
  const resolve = (payload: HttpResponseMessage['value']) => {
    const task = pending.get(payload.requestId);
    if (!task) {
      return;
    }
    pending.delete(payload.requestId);
    task.resolve(payload.response);
  };
  const reject = (payload: HttpErrorMessage['value']) => {
    const task = pending.get(payload.requestId);
    if (!task) {
      return;
    }
    pending.delete(payload.requestId);
    task.reject(new Error(payload.message));
  };
  return {
    request,
    get: (url: string, options?: Omit<AfHttpRequestOptions, 'url' | 'method'>) => request(url, { ...options, method: 'GET' }),
    post: (url: string, options?: Omit<AfHttpRequestOptions, 'url' | 'method'>) => request(url, { ...options, method: 'POST' }),
    put: (url: string, options?: Omit<AfHttpRequestOptions, 'url' | 'method'>) => request(url, { ...options, method: 'PUT' }),
    delete: (url: string, options?: Omit<AfHttpRequestOptions, 'url' | 'method'>) => request(url, { ...options, method: 'DELETE' }),
    resolve,
    reject,
  };
};

const httpClient = createHttpClient();


const af: AF = new Proxy({
  projectId: '',
  nodeId: '',
  request: createRequestProxy(),
  variables,
  sessionStorage,
  localStorage,
  cookies,
  http: {
    request: httpClient.request,
    get: httpClient.get,
    post: httpClient.post,
    put: httpClient.put,
    delete: httpClient.delete,
  }
}, {
  deleteProperty(target, key) {
    if (key === 'nodeId' || key === 'request' || key === 'variables' || key === 'sessionStorage' || key === 'localStorage' || key === 'cookies' || key === 'http') {
      return true;
    }
    return Reflect.deleteProperty(target, key);
  },
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const options = {
  getFile(path: string) {
    return {
      type: 'file',
      value: path
    };
  },
  axios,
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type === "initData") {
    const { reqeustInfo } = e.data;
    af.request.method = reqeustInfo.item.method;
    af.nodeId = reqeustInfo._id;
    af.projectId = reqeustInfo.projectId;
    Object.assign(af.request.headers, reqeustInfo.item.headers)
    Object.assign(af.request.queryParams, reqeustInfo.item.queryParams)
    Object.assign(af.request.pathParams, reqeustInfo.item.paths);
    Object.assign(af.request.body.urlencoded, reqeustInfo.item.requestBody.urlencoded);
    Object.assign(af.variables, e.data.variables);
    Object.assign(af.cookies, e.data.cookies);
    Object.assign(af.localStorage, e.data.localStorage);
    Object.assign(af.sessionStorage, e.data.sessionStorage);
    reqeustInfo.item.requestBody.formdata.forEach(formdata => {
      af.request.body.formdata[formdata.key] = {
        type: formdata.type,
        value: formdata.value
      }
    })
    af.request.body.raw = reqeustInfo.item.requestBody.raw;
    af.request.bodyType = reqeustInfo.item.bodyType;
    af.request.body.binary.mode = reqeustInfo.item.requestBody.binary.mode;
    af.request.body.binary.path = reqeustInfo.item.requestBody.binary.path;
    const jsonBody = JSONbig.parse(reqeustInfo.item.requestBody.json);
    Object.assign(af.request.body.json, jsonBody);
    self.postMessage({
      type: 'pre-request-init-success',
    });
  }
  if (e.data.type === 'pre-request-http-response') {
    httpClient.resolve(e.data.value);
  }
  if (e.data.type === 'pre-request-http-error') {
    httpClient.reject(e.data.value);
  }
  if (e.data.type === "eval") {
    const { code } = e.data;
    try {
      const wrappedFunction = new Function('af', 'options', `
        return (async function() {
          const getFile = options.getFile;
          const axios = options.axios;
          ${code}
          return af;
        })(af, options);
      `);
      const evalPromise = wrappedFunction(af, options);
      evalPromise.then(() => {
        self.postMessage({
          type: 'pre-request-eval-success',
          value: JSON.parse(JSON.stringify(af)),
        });
      }).catch((error: Error) => {
        self.postMessage({
          type: 'pre-request-eval-error',
          value: {
            message: error?.message,
            stack: error?.stack,
          }
        });
      });
    } catch (error) {
      self.postMessage({
        type: 'pre-request-eval-error',
        value: (error as Error)?.message,
      });
    }
  }
};
/**
 * changeMethodById(apiId, method)
 * changeUrlById(apiId. url)
 * addHeaderById(apiId, key, value)
 * removeHeaderById(apiId, key)
 * updateHeaderById(apiId, key, value)
 * upsertHeaderById(apiId, key, value)
 * addQueryParamById(apiId, key, value)
 * removeQueryParamById(apiId, key)
 * updateQueryParamById(apiId, key, value)
 * addPathParamById(apiId, key, value)
 * removePathParamById(apiId, key)
 * updatePathParamById(apiId, key, value)
 * addJsonBodyById(apiId, key, value)
 * removeJsonBodyById(apiId, key)
 * updateJsonBodyById(apiId, key, value)
 * addUrlencodedBodyById(apiId, key, value)
 * removeUrlencodedBodyById(apiId, key)
 * updateUrlencodedBodyById(apiId, key, value)
 * addFormdataBodyById(apiId, key, value)
 * removeFormdataBodyById(apiId, key)
 * updateFormdataBodyById(apiId, key, value)
 * changeRawBodyById(apiId, value)
 * changeBiraryBodyById(apiId, value)
 * addSessionStorageById(apiId, key, value)
 * removeSessionStorageById(apiId, key)
 * updateSessionStorageById(apiId, key, value)
 * addLocalStorageById(apiId, key, value)
 * removeLocalStorageById(apiId, key)
 * updateLocalStorageById(apiId, key, value)
 * addVariableById(apiId, key, value)
 * removeVariableById(apiId, key)
 * updateVariableById(apiId, key, value)
 * getGlobalVariableById(apiId, key)
 * getCookieById(apiId, key)
 * addCookieById(apiId, key, value, options)
 * removeCookieById(apiId, key)
 * sendRequest(options)
 * 
 */