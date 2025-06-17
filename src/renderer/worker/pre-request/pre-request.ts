
import { AF, InitDataMessage, EvalMessage } from './types/types.ts';
import { createRequestProxy } from './request/index.ts'
import { variables } from './variables/index.ts'
import { cookies } from './cookies/index.ts'
import { localStorage } from './localStorage/index.ts'
import { sessionStorage } from './sessionStorage/index.ts'
import axios from 'axios'

const af: AF = new Proxy({
  projectId: '',
  nodeId: '',
  request: createRequestProxy(),
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
  getFile(path: string) {
    return {
      mode: 'file',
      value: path
    };
  },
  axios,
}

self.onmessage = (e: MessageEvent<InitDataMessage | EvalMessage>) => {
  if (e.data.type === "initData") {
    console.log('initData', e.data)
    const { reqeustInfo } = e.data;
    af.request.method = reqeustInfo.item.method;
    af.nodeId = reqeustInfo._id;
    af.projectId = reqeustInfo.projectId;
    Object.assign(af.request.headers, reqeustInfo.item.headers)
    Object.assign(af.request.queryParams, reqeustInfo.item.queryParams)
    Object.assign(af.request.pathParams, reqeustInfo.item.paths);
    Object.assign(af.request.body.urlencoded, reqeustInfo.item.requestBody.urlencoded);
    Object.assign(af.request.body.formdata, reqeustInfo.item.requestBody.formdata);
    Object.assign(af.variables, e.data.variables);
    Object.assign(af.cookies, e.data.cookies);
    Object.assign(af.localStorage, e.data.localStorage);
    Object.assign(af.sessionStorage, e.data.sessionStorage);
    af.request.body.raw = reqeustInfo.item.requestBody.raw;
    af.request.bodyType = reqeustInfo.item.bodyType;
    af.request.body.binary.mode = reqeustInfo.item.requestBody.binary.mode;
    af.request.body.binary.path = reqeustInfo.item.requestBody.binary.path;
    self.postMessage({
      type: 'pre-request-init-success',
    });
  }
  if (e.data.type === "eval") {
    const { code } = e.data;
    const wrappedCode = `
      (async function() {
        const getFile = options.getFile;
        const axios = options.axios;
        ${code}
        return af;
      })(af, options)
    `
    try {
      const evalPromise = eval(wrappedCode);
      evalPromise.then(() => {
        self.postMessage({
          type: 'pre-request-eval-success',
          value: JSON.parse(JSON.stringify(af)),
        });
      }).catch((error: Error) => {
        console.error(error)
      });
    } catch (error) {
      console.error(error)
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