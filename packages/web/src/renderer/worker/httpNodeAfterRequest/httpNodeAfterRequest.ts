import { AfHttpRequestOptions, AfHttpResponse, HttpAfter, InitDataMessage, EvalMessage, OnSetLocalStorageEvent, OnDeleteLocalStorageEvent, OnSetSessionStorageEvent, OnDeleteSessionStorageEvent, OnHttpRequestEvent, HttpResponseMessage, HttpErrorMessage } from './types/types';
const createRequestId = (() => {
  let index = 0;
  return () => {
    index += 1;
    return `${Date.now()}-${index}`;
  };
})();
const createHttpClient = () => {
  const pending = new Map<string, { resolve: (response: AfHttpResponse) => void; reject: (error: Error) => void }>();
  const request = async (url: string, options?: Omit<AfHttpRequestOptions, 'url'>): Promise<AfHttpResponse> => {
    const requestId = createRequestId();
    const message: OnHttpRequestEvent = {
      type: 'after-request-http-request',
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
const createVariablesProxy = () => {
  const store: Record<string, unknown> = {};
  return new Proxy(store as Record<string, unknown> & {
    set: (name: string, value: unknown) => void;
    get: (name: string) => unknown;
    remove: (name: string) => void;
  }, {
    get(_target, key: string) {
      if (key === 'set') {
        return (name: string, value: unknown) => {
          store[name] = value;
        };
      }
      if (key === 'get') {
        return (name: string) => store[name];
      }
      if (key === 'remove') {
        return (name: string) => {
          delete store[name];
        };
      }
      return store[key];
    },
    set(_target, key: string, value: unknown) {
      store[key] = value;
      return true;
    },
    deleteProperty(_target, key: string) {
      delete store[key];
      return true;
    },
  });
};
const createStorageProxy = (setType: OnSetLocalStorageEvent['type'] | OnSetSessionStorageEvent['type'], deleteType: OnDeleteLocalStorageEvent['type'] | OnDeleteSessionStorageEvent['type']) => {
  const store: Record<string, unknown> = {};
  const postSetMessage = () => {
    self.postMessage({
      type: setType,
      value: JSON.parse(JSON.stringify(store)),
    });
  };
  const postDeleteMessage = () => {
    self.postMessage({
      type: deleteType,
      value: JSON.parse(JSON.stringify(store)),
    });
  };
  return new Proxy(store, {
    get(_target, key: string) {
      if (key === 'set') {
        return (name: string, value: unknown) => {
          store[name] = value;
          postSetMessage();
        };
      }
      if (key === 'get') {
        return (name: string) => store[name] ?? null;
      }
      if (key === 'remove') {
        return (name: string) => {
          delete store[name];
          postDeleteMessage();
        };
      }
      if (key === 'clear') {
        return () => {
          Object.keys(store).forEach(k => delete store[k]);
          postDeleteMessage();
        };
      }
      return store[key];
    },
    set(_target, key: string, value: unknown) {
      store[key] = value;
      postSetMessage();
      return true;
    },
    deleteProperty(_target, key: string) {
      delete store[key];
      postDeleteMessage();
      return true;
    },
  });
};
const variables = createVariablesProxy();
const localStorage = createStorageProxy('after-request-set-local-storage', 'after-request-delete-local-storage');
const sessionStorage = createStorageProxy('after-request-set-session-storage', 'after-request-delete-session-storage');
const af: HttpAfter = new Proxy({
  projectId: '',
  nodeId: '',
  request: {
    method: '',
    url: '',
    headers: {},
    queryParams: {},
    pathParams: {},
    body: {
      json: {},
      urlencoded: {},
      formdata: {},
      raw: '',
      binary: { mode: 'var', path: '' },
    },
    bodyType: 'none',
  },
  response: {
    statusCode: 0,
    headers: {},
    rt: 0,
    size: 0,
    ip: '',
    text: '',
    json: '',
    body: '',
  },
  variables,
  sessionStorage,
  localStorage,
  cookies: {},
  http: {
    request: httpClient.request,
    get: httpClient.get,
    post: httpClient.post,
    put: httpClient.put,
    delete: httpClient.delete,
  }
}, {
  deleteProperty(target, key) {
    if (key === 'nodeId' || key === 'request' || key === 'variables' || key === 'sessionStorage' || key === 'localStorage' || key === 'cookies' || key === 'http' || key === 'response') {
      return true;
    }
    return Reflect.deleteProperty(target, key);
  },
});
self.onmessage = (e: MessageEvent<InitDataMessage | EvalMessage | HttpResponseMessage | HttpErrorMessage>) => {
  if (e.data.type === 'initData') {
    const { requestInfo, responseInfo } = e.data;
    af.nodeId = requestInfo._id;
    af.projectId = requestInfo.projectId;
    af.request.method = requestInfo.item.method;
    af.request.url = requestInfo.item.url;
    af.request.headers = requestInfo.item.headers;
    af.request.queryParams = requestInfo.item.queryParams;
    af.request.pathParams = requestInfo.item.paths;
    af.request.body.urlencoded = requestInfo.item.requestBody.urlencoded;
    af.request.body.raw = requestInfo.item.requestBody.raw;
    af.request.body.binary = requestInfo.item.requestBody.binary;
    af.request.bodyType = requestInfo.item.bodyType;
    af.request.body.formdata = requestInfo.item.requestBody.formdata.reduce((acc, item) => {
      acc[item.key] = { type: item.type, value: item.value };
      return acc;
    }, {} as Record<string, { type: 'string' | 'file'; value: string }>);
    af.response = responseInfo;
    Object.assign(af.variables, e.data.variables);
    Object.assign(af.cookies, e.data.cookies);
    Object.assign(af.localStorage, e.data.localStorage);
    Object.assign(af.sessionStorage, e.data.sessionStorage);
    try {
      const parsedJson = JSON.parse(requestInfo.item.requestBody.json || '{}');
      Object.assign(af.request.body.json, parsedJson);
    } catch {
      af.request.body.json = {};
    }
    self.postMessage({
      type: 'after-request-init-success',
    });
  }
  if (e.data.type === 'after-request-http-response') {
    httpClient.resolve(e.data.value);
  }
  if (e.data.type === 'after-request-http-error') {
    httpClient.reject(e.data.value);
  }
  if (e.data.type === 'eval') {
    const { code } = e.data;
    try {
      const wrappedFunction = new Function('af', `
        return (async function() {
          ${code}
          return af;
        })(af);
      `);
      const evalPromise = wrappedFunction(af);
      evalPromise.then(() => {
        self.postMessage({
          type: 'after-request-eval-success',
          value: JSON.parse(JSON.stringify(af)),
        });
      }).catch((error: Error) => {
        self.postMessage({
          type: 'after-request-eval-error',
          value: {
            message: error?.message,
            stack: error?.stack,
          },
        });
      });
    } catch (error) {
      self.postMessage({
        type: 'after-request-eval-error',
        value: (error as Error)?.message,
      });
    }
  }
};
