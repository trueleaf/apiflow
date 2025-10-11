import { useApidoc } from '@/store/apidoc/apidoc';
import { ref, toRaw } from 'vue';
import json5 from 'json5'
import { HttpNode, ApidocProperty } from '@src/types';
import { convertTemplateValueToRealValue, getEncodedStringFromEncodedParams, getFormDataFromFormDataParams, getObjectPathParams, getQueryStringFromQueryParams } from '@/utils/utils';
import { useVariable } from '@/store/apidoc/variables';
import { GotRequestOptions, JsonData, RedirectOptions, ResponseInfo } from '@src/types/index.ts';
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { useApidocTas } from '@/store/apidoc/tabs';
import { useApidocResponse } from '@/store/apidoc/response';
import { httpNodeCache } from '@/cache/http/httpNodeCache';
import { httpResponseCache } from '@/cache/http/httpResponseCache';
import { config } from '@src/config/config';
import { cloneDeep, uuid } from '@/helper';
import { useApidocRequest } from '@/store/apidoc/request';
import { i18n } from '@/i18n';
import { useCookies } from '@/store/apidoc/cookies';
import { InitDataMessage, OnEvalSuccess, ReceivedEvent } from '@/worker/pre-request/types/types.ts';
import { Method } from 'got';
import preRequestWorker from '@/worker/pre-request/pre-request.ts?worker&inline';
import { WebSocketNode } from '@src/types/websocketNode';
import { webSocketNodeCache } from '@/cache/websocketNode/websocketNodeCache.ts';
/*
|--------------------------------------------------------------------------
| 发送请求
|--------------------------------------------------------------------------
*/
const convertStringValueAsync = (data: JsonData) => {
  const needConvertList: Promise<void>[] = [];
  const { objectVariable } = useVariable()
  const loop = (jsonData: JsonData) => {
    const isSimpleValue = (typeof jsonData === 'string' || typeof jsonData === 'number' || typeof jsonData === 'boolean' || jsonData === null);
    const isArray = Array.isArray(jsonData);
    const isObject = !isArray && !isSimpleValue;
    if (isArray) {
      for (let i = 0; i < jsonData.length; i++) {
        const item = jsonData[i];
        if (Array.isArray(item)) {
          loop(item);
        } else if (typeof item === 'object') {
          loop(item);
        } else if (typeof item === 'string') {
          needConvertList.push(new Promise(resolve => {
            convertTemplateValueToRealValue(item, objectVariable).then((replacedValue) => {
              jsonData[i] = replacedValue;
              resolve()
            });
          }))
        }
      }
    } else if (isObject) {
      for (const key in jsonData) {
        const value = (jsonData as { [key: string]: JsonData })[key];
        if (Array.isArray(value)) {
          loop(value)
        } else if (typeof value === 'object') {
          loop(value);
        } else if (typeof value === 'string') {
          needConvertList.push(new Promise(resolve => {
            convertTemplateValueToRealValue(value, objectVariable).then((replacedValue) => {
              jsonData[key] = replacedValue;
              resolve()
            });
          }))
        }
      }
    }
  }
  loop(data);
  return needConvertList;
}
const getMethod = (apidoc: HttpNode) => {
  return apidoc.item.method;
}
export const getUrl = async (httpNode: HttpNode) => {
  const { objectVariable } = useVariable();
  const { url, queryParams, paths, } = httpNode.item;
  const queryString = await getQueryStringFromQueryParams(queryParams, objectVariable);
  const objectPathParams = await getObjectPathParams(paths, objectVariable);
  const replacedPathParamsString = url.path.replace(/(?<!\{)\{([^{}]+)\}(?!\})/g, (_, variableName) => {
    return objectPathParams[variableName] || ''
  }); // 替换路径参数
  const pathString = await convertTemplateValueToRealValue(replacedPathParamsString, objectVariable);
  let fullUrl = pathString + queryString;
  if (!fullUrl.startsWith('http') && !fullUrl.startsWith('https')) {
    fullUrl = `http://${fullUrl}`
  }
  if (fullUrl.includes('localhost')) {
    fullUrl = fullUrl.replace('localhost', '127.0.0.1')
  }
  fullUrl = await convertTemplateValueToRealValue(fullUrl, objectVariable);
  return fullUrl;
}
export const getWebSocketUrl = async (websocketNode: WebSocketNode) => {
  const { objectVariable } = useVariable();
  const { url, queryParams } = websocketNode.item;
  const queryString = await getQueryStringFromQueryParams(queryParams, objectVariable);
  let fullUrl = url.path + queryString;
  if (!fullUrl.startsWith('ws') && !fullUrl.startsWith('wss')) {
    fullUrl = `ws://${fullUrl}`
  }
  if (fullUrl.includes('localhost')) {
    fullUrl = fullUrl.replace('localhost', '127.0.0.1')
  }
  fullUrl = await convertTemplateValueToRealValue(fullUrl, objectVariable);
  return fullUrl;
}

/*
 * 获取WebSocket请求头
 * 1.从默认请求头中获取必需的WebSocket握手头
 * 2.从用户定义请求头中获取请求头
 * 3.从公共请求头中获取请求头 
 * 4.从cookie中读取请求头
 */
export const getWebSocketHeaders = async (websocketNode: WebSocketNode, defaultHeaders: ApidocProperty<'string'>[], fullUrl: string) => {
  const { objectVariable } = useVariable();
  const apidocBaseInfoStore = useApidocBaseInfo();
  const apidocTabsStore = useApidocTas();
  const { getMachtedCookies } = useCookies();
  const projectId = websocketNode.projectId;
  const tabs = apidocTabsStore.tabs[projectId];
  const currentSelectTab = tabs?.find((tab) => tab.selected) || null;

  if (!currentSelectTab) {
    console.warn('未匹配到当前选中tab');
    return {};
  }

  const defaultCommonHeaders = apidocBaseInfoStore.getCommonHeadersById(currentSelectTab?._id || "");
  const ignoreHeaderIds = webSocketNodeCache.getWsIgnoredCommonHeaderByTabId?.(projectId, currentSelectTab?._id ?? "") || [];
  const commonHeaders = defaultCommonHeaders.filter(header => !ignoreHeaderIds.includes(header._id));
  const headers = websocketNode.item.headers;
  const headersObject: Record<string, string> = {};

  // Web 环境生成 Sec-WebSocket-Key
  const generateWebSocketKey = (): string => {
    const buffer = new Uint8Array(16);
    crypto.getRandomValues(buffer);
    let binary = "";
    for (let i = 0; i < buffer.length; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  };


  // 从URL中提取Host
  const getHostFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.host;
    } catch {
      return 'localhost';
    }
  };

  // 处理默认请求头
  for (let i = 0; i < defaultHeaders.length; i++) {
    const header = defaultHeaders[i];
    if (!header.select && header.key !== 'Host' && header.key !== 'Upgrade' && header.key !== 'Connection' && header.key !== 'Sec-WebSocket-Key' && header.key !== 'Sec-WebSocket-Version') {
      continue; // 跳过未选中的可选请求头
    }

    const headerKey = header.key.toLowerCase();

    // 特殊处理必需的请求头
    if (header.key === 'Host') {
      headersObject[headerKey] = getHostFromUrl(fullUrl);
    } else if (header.key === 'Upgrade') {
      headersObject[headerKey] = header.value || 'websocket';
    } else if (header.key === 'Connection') {
      headersObject[headerKey] = header.value || 'Upgrade';
    } else if (header.key === 'Sec-WebSocket-Key') {
      headersObject[headerKey] = generateWebSocketKey();
    } else if (header.key === 'Sec-WebSocket-Version') {
      headersObject[headerKey] = '13';
    } else if (header.value) {
      // 处理其他默认请求头
      const realValue = await convertTemplateValueToRealValue(header.value, objectVariable);
      headersObject[headerKey] = realValue;
    }
  }

  // 处理公共请求头
  for (let i = 0; i < commonHeaders.length; i++) {
    const header = commonHeaders[i];
    const realKey = await convertTemplateValueToRealValue(header.key, objectVariable);
    if (realKey.trim() === '') {
      continue;
    }
    const headerKeyLower = realKey.toLowerCase();

    // 不允许覆盖关键的WebSocket握手头
    if (headerKeyLower === 'sec-websocket-key' || headerKeyLower === 'sec-websocket-version') {
      continue;
    }

    const realValue = await convertTemplateValueToRealValue(header.value, objectVariable);
    headersObject[headerKeyLower] = realValue;
  }

  // 处理用户填写的请求头 (会覆盖公共请求头)
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    if (!header.select) {
      continue;
    }
    const realKey = await convertTemplateValueToRealValue(header.key, objectVariable);
    if (realKey.trim() === '') {
      continue;
    }
    const headerKeyLower = realKey.toLowerCase();

    // 不允许覆盖关键的WebSocket握手头
    if (headerKeyLower === 'sec-websocket-key' || headerKeyLower === 'sec-websocket-version') {
      continue;
    }

    const realValue = await convertTemplateValueToRealValue(header.value, objectVariable);
    headersObject[headerKeyLower] = realValue;
  }

  // 处理Cookie
  const matchedCookies = getMachtedCookies(fullUrl);
  if (matchedCookies.length > 0) {
    const cookieHeader = matchedCookies.map(c => `${c.name}=${c.value}`).join('; ');
    headersObject['cookie'] = cookieHeader;
  }
  // console.log('最终WebSocket请求头', headersObject);
  return headersObject;
};
const getBody = async (apidoc: HttpNode): Promise<GotRequestOptions['body']> => {
  const { changeResponseInfo, changeRequestState } = useApidocResponse()
  const { objectVariable } = useVariable()
  const { changeFormDataErrorInfoById } = useApidoc()
  const { mode, urlencoded } = apidoc.item.requestBody;
  if (mode === 'json' && apidoc.item.requestBody.rawJson.trim()) {
    /*
     * 情况1：json值存在超长数字，在js中会被截断 例如：{ num: 123456789087654321 } 会被转换为 { num: 123456789087654320 } 
     * 情况2："{{ 变量名称 }}" 会被解析为实际变量值
     * 情况3："{{ @xxx }}" 会被保留为字符串
     * 情况4: "\{{ @xxx }}" 反斜杠转义，不会被解析
     */
    const bigNumberMap: Record<string, string> = {}; // 存储超长数字
    const MAX_SAFE_INTEGER_LENGTH = 16; // Number.MAX_SAFE_INTEGER 的长度
    const replacedRawJson = apidoc.item.requestBody.rawJson.replace(/([+-]?\d+)(?=\s*[,}\]])/g, ($1: string) => {
      // 只处理超过安全长度的整数
      const numberStr = $1.replace(/^[+-]/, ''); // 移除符号来计算长度
      if (numberStr.length > MAX_SAFE_INTEGER_LENGTH) {
        const replacedStr = `"${$1}n"`;
        bigNumberMap[`${$1}n`] = `${$1}`;
        return replacedStr;
      }
      return $1; // 安全长度内的数字不做处理
    })
    try {
      const jsonObject = json5.parse(replacedRawJson || 'null');
      await Promise.all(convertStringValueAsync(jsonObject));
      const stringBody = JSON.stringify(jsonObject).replace(/"([+-]?\d+n)"(?=\s*[,}\]])/g, (_, $2) => {
        return bigNumberMap[$2];
      })
      return {
        type: 'json',
        value: stringBody
      };
    } catch (error) {
      changeResponseInfo({
        responseData: {
          canApiflowParseType: 'error',
          errorData: `Body参数JSON数据格式解析错误，原始数据：${replacedRawJson},\n${(error as Error).message}`
        }
      });
      changeRequestState('finish');
      throw new Error((error as Error).message)
    }
  } else if (mode === 'json' && !apidoc.item.requestBody.rawJson.trim()) {
    return undefined;
  }
  if (mode === 'urlencoded') {
    const urlencodedString = await getEncodedStringFromEncodedParams(urlencoded, objectVariable);
    return {
      type: 'urlencoded',
      value: urlencodedString
    };
  }
  if (mode === 'formdata') {
    const validFormData = apidoc.item.requestBody.formdata.filter((formData: ApidocProperty<'string' | 'file'>) => formData.select && formData.key !== '');
    validFormData.forEach((formData: ApidocProperty<'string' | 'file'>) => {
      changeFormDataErrorInfoById(formData._id, ''); //每次请求前清空错误信息
    })
    const formData = await getFormDataFromFormDataParams(validFormData, objectVariable);
    return {
      type: 'formdata',
      value: formData
    };
  }
  if (mode === 'raw') {
    const { data } = apidoc.item.requestBody.raw;
    const realData = await convertTemplateValueToRealValue(data, objectVariable);
    return {
      type: 'raw',
      value: realData
    };
  }
  if (mode === 'binary') {
    const { mode, varValue, binaryValue } = apidoc.item.requestBody.binary;
    if (mode === 'var') {
      const filePath = await convertTemplateValueToRealValue(varValue, objectVariable);
      return {
        type: 'binary',
        value: {
          mode: 'var',
          path: filePath
        }
      };
    } else {
      const filePath = binaryValue.path;
      return {
        type: 'binary',
        value: {
          mode: 'file',
          path: filePath
        }
      };
    }
  }
  if (mode === 'none') {
    return undefined;
  }
  console.warn(`${i18n.global.t('未知的请求body类型')}`)
  return undefined;
}
/*
  * 1.从用户定义请求头中获取请求头
  * 2.从公共请求头中获取请求头 
  * 3.从cookie中读取请求头
 */
const getHeaders = async (apidoc: HttpNode) => {
  const { objectVariable } = useVariable();
  const apidocBaseInfoStore = useApidocBaseInfo();
  const { defaultHeaders } = useApidoc();
  const apidocTabsStore = useApidocTas();
  const projectId = apidoc.projectId;
  const tabs = apidocTabsStore.tabs[projectId];
  const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
  if (!currentSelectTab) {
    console.warn('未匹配到当前选中tab')
    return {}
  }
  const defaultCommonHeaders = apidocBaseInfoStore.getCommonHeadersById(currentSelectTab?._id || "");
  const ignoreHeaderIds = httpNodeCache.getIgnoredCommonHeaderByTabId(projectId, currentSelectTab?._id ?? "") || [];
  const commonHeaders = defaultCommonHeaders.filter(header => !ignoreHeaderIds.includes(header._id));
  const headers = apidoc.item.headers;
  const headersObject: Record<string, string | null> = {};
  for (let i = 0; i < defaultHeaders.length; i++) {
    const header = defaultHeaders[i];
    if (!header.disabled && !header.select) { //当前请求头可以被取消
      headersObject[header.key.toLowerCase()] = null;
    } else if (!header._disableValue && header.value) {
      const realValue = await convertTemplateValueToRealValue(header.value, objectVariable);
      headersObject[header.key.toLowerCase()] = realValue;
    }
  }
  for (let i = 0; i < commonHeaders.length; i++) {
    const header = commonHeaders[i];
    const realKey = await convertTemplateValueToRealValue(header.key, objectVariable);
    if (realKey.trim() === '') {
      continue;
    }
    const realValue = await convertTemplateValueToRealValue(header.value, objectVariable);
    headersObject[realKey.toLowerCase()] = realValue
  }
  // const matchedCookies = getMachtedCookies(url);
  // if (matchedCookies.length > 0) {
  //   const cookieHeader = matchedCookies.map(c => `${c.name}=${c.value}`).join('; ');
  //   headersObject['cookie'] = cookieHeader;
  // }
  //用户填写的请求头会覆盖公共请求头
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    if (!header.disabled && !header.select) {
      continue
    }
    const realKey = await convertTemplateValueToRealValue(header.key, objectVariable);
    if (realKey.trim() === '') {
      continue;
    }
    const realValue = await convertTemplateValueToRealValue(header.value, objectVariable);
    headersObject[realKey.toLowerCase()] = realValue
  }
  return headersObject;
}


const convertPropertyToObject = async (properties: ApidocProperty<'string' | 'file'>[]): Promise<Record<string, string>> => {
  const result: Record<string, string> = {};
  const { objectVariable } = useVariable();
  for (const prop of properties) {
    if (prop.select && prop.key.trim() !== '') {
      const realKey = await convertTemplateValueToRealValue(prop.key, objectVariable);
      const realValue = await convertTemplateValueToRealValue(prop.value, objectVariable);
      result[realKey] = realValue;
    }
  }
  return result;
};

const convertObjectToProperty = (objectParams: Record<string, any>) => {
  const newQueryParams: ApidocProperty<'string'>[] = [];
  Object.keys(objectParams).forEach(key => {
    newQueryParams.push({
      key,
      value: objectParams[key],
      select: true,
      _id: uuid(),
      type: 'string',
      required: false,
      description: ''
    });
  })
  return newQueryParams;
}

export const sendRequest = async () => {
  const worker = new preRequestWorker();
  const redirectList = ref<ResponseInfo['redirectList']>([]);
  const apidocBaseInfoStore = useApidocBaseInfo();
  const { objectVariable } = useVariable();
  const apidocResponseStore = useApidocResponse();
  const projectId = apidocBaseInfoStore.projectId;
  const apidocTabsStore = useApidocTas();
  const selectedTab = apidocTabsStore.getSelectedTab(apidocBaseInfoStore.projectId);
  const apidocStore = useApidoc();
  const { updateCookiesBySetCookieHeader, getMachtedCookies } = useCookies();
  const { changeCancelRequestRef } = useApidocRequest()

  // 缓存节流控制
  let lastCacheTime = 0;
  const cacheThrottleDelay = 2000;

  // 清理函数，确保资源释放
  const cleanup = () => {
    worker.terminate();
  };
  const {
    changeResponseInfo,
    changeResponseBody,
    changeResponseCacheAllowed,
    changeRequestState,
    changeLoadingProcess,
    addStreamData,
    changeFileBlobUrl
  } = useApidocResponse()
  const copiedApidoc = cloneDeep(toRaw(apidocStore.$state.apidoc));
  const preSendMethod = getMethod(copiedApidoc);
  const preSendUrl = await getUrl(copiedApidoc);
  const preSendBody = await getBody(copiedApidoc);
  const preSendHeaders = await getHeaders(copiedApidoc);
  const objUrlencoded = await convertPropertyToObject(copiedApidoc.item.requestBody.urlencoded);
  const objPaths = await convertPropertyToObject(copiedApidoc.item.paths);
  const objQueryParams = await convertPropertyToObject(copiedApidoc.item.queryParams);
  changeRequestState('sending');
  const matchedCookies = getMachtedCookies(preSendUrl);
  const objCookies = await convertPropertyToObject(matchedCookies.map(cookie => ({ key: cookie.name, value: cookie.value, select: true })) as ApidocProperty<"string">[])
  const preRequestSessionStorage = httpNodeCache.getPreRequestSessionStorage(projectId) || {};
  const preRequestLocalStorage = httpNodeCache.getPreRequestLocalStorage(projectId) || {};
  let finalSendHeaders = preSendHeaders;
  let finalCookies = objCookies;
  //实际发送请求
  const invokeRequest = async () => {
    const method = getMethod(copiedApidoc);
    const url = await getUrl(copiedApidoc);
    const body = await getBody(copiedApidoc);
    if (Object.values(finalCookies).length > 0) {
      finalSendHeaders.cookie = Object.entries(finalCookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
    } else {
      delete finalSendHeaders.cookie;
    }
    window.electronAPI?.sendRequest({
      url,
      method,
      timeout: 60000,
      body,
      headers: finalSendHeaders,
      signal(cancelRequest) {
        changeCancelRequestRef(cancelRequest);
      },
      onAbort: () => {
        changeRequestState('finish');
        // 如果是流式返回的数据，则不显示请求已取消的消息
        if (apidocResponseStore.responseInfo.headers['transfer-encoding'] === 'chunked') {
          return;
        }
        changeResponseInfo({
          responseData: {
            canApiflowParseType: 'error',
            errorData: i18n.global.t('请求已取消')
          }
        });
      },
      onError: (err) => {
        cleanup(); // 清理 worker
        changeResponseInfo({
          redirectList: [],
          responseData: {
            canApiflowParseType: 'error',
            errorData: err.message
          }
        });
        changeRequestState('finish');
      },
      beforeRedirect: (options: RedirectOptions) => {
        const { plainResponse, requestHeaders, method } = options;
        const responseHeaders: Record<string, string> = {};
        plainResponse.rawHeaders.forEach((value, index) => {
          if (index % 2 === 0) {
            responseHeaders[value.toLowerCase()] = plainResponse.rawHeaders[index + 1] || '';
          }
        });
        redirectList.value.push({
          responseHeaders,
          requestHeaders,
          statusCode: plainResponse.statusCode,
          method,
          url: plainResponse.url,
        })
      },
      beforeRetry: () => {
      },
      onReadFileFormDataError(options: { id: string, msg: string, fullMsg: string }) {
        cleanup(); // 清理 worker
        apidocStore.changeFormDataErrorInfoById(options.id, options.msg);
        changeResponseInfo({
          responseData: {
            canApiflowParseType: 'error',
            errorData: options.fullMsg
          }
        });
        changeRequestState('finish');
      },
      onReadBinaryDataError(options: { msg: string, fullMsg: string }) {
        cleanup(); // 清理 worker
        changeResponseInfo({
          responseData: {
            canApiflowParseType: 'error',
            errorData: options.fullMsg
          }
        });
        changeRequestState('finish');
      },
      onResponse(responseInfo) {
        changeResponseInfo(responseInfo);
        changeRequestState('response');
      },
      onResponseData(chunkWithTimestampe, loadedLength, totalLength) {
        addStreamData(chunkWithTimestampe)
        changeResponseInfo({
          bodyByteLength: apidocResponseStore.responseInfo.bodyByteLength + chunkWithTimestampe.chunk.byteLength,
        })
        changeLoadingProcess({
          total: totalLength || (apidocResponseStore.responseInfo.bodyByteLength + chunkWithTimestampe.chunk.byteLength),
          transferred: loadedLength,
          percent: loadedLength / totalLength
        })

        // 使用节流机制优化缓存操作，避免高频率的深拷贝和缓存写入
        const now = Date.now();
        if (now - lastCacheTime >= cacheThrottleDelay) {
          lastCacheTime = now;
          // 只有在数据大小合理的情况下才进行深拷贝和缓存
          if (apidocResponseStore.responseInfo.bodyByteLength <= config.cacheConfig.apiflowResponseCache.singleResponseBodySize) {
            httpResponseCache.setResponse(selectedTab?._id ?? '', apidocResponseStore.responseInfo);
          }
        }
      },
      onResponseEnd(responseInfo) {
        const rawBody = responseInfo.body;
        const setCookieStrList = responseInfo.headers['set-cookie'] || [];
        changeRequestState('finish');
        changeResponseBody(responseInfo.body)
        responseInfo.body = null; // 不存储body防止数据量过大
        responseInfo.redirectList = cloneDeep(redirectList.value); // 记录重定向列表
        changeResponseInfo(responseInfo);
        changeFileBlobUrl(rawBody as Uint8Array, responseInfo.contentType);
        updateCookiesBySetCookieHeader(setCookieStrList, copiedApidoc.item.url.prefix, projectId);
        console.log('responseInfo', responseInfo)
        const storedResponseInfo = cloneDeep(responseInfo);
        storedResponseInfo.body = rawBody;
        if (responseInfo.bodyByteLength > config.cacheConfig.apiflowResponseCache.singleResponseBodySize) {
          storedResponseInfo.body = [];
          storedResponseInfo.responseData.textData = '';
          storedResponseInfo.responseData.jsonData = '';
          storedResponseInfo.responseData.fileData = {
            url: "",
            name: "",
            ext: ''
          };
          storedResponseInfo.responseData.canApiflowParseType = 'cachedBodyIsTooLarge';
          changeResponseCacheAllowed(selectedTab?._id ?? '', false);
        } else {
          changeResponseCacheAllowed(selectedTab?._id ?? '', true);
        }
        httpResponseCache.setResponse(selectedTab?._id ?? '', storedResponseInfo);
        cleanup(); // 请求完成后清理 worker
      },
    })
  }
  if (!copiedApidoc.preRequest.raw.trim()) {
    // 没有前置脚本，直接发送请求
    invokeRequest();
    return;
  }
  // console.log(JSONbig.parse(preSendBody.value))
  const initDataMessage: InitDataMessage = {
    type: 'initData',
    reqeustInfo: {
      _id: copiedApidoc._id,
      projectId,
      name: copiedApidoc.info.name,
      item: {
        method: preSendMethod,
        url: preSendUrl,
        paths: objPaths,
        queryParams: objQueryParams,
        requestBody: {
          json: preSendBody?.type === 'json' ? preSendBody.value : '{}',
          formdata: preSendBody?.type === 'formdata' ? preSendBody.value : [],
          urlencoded: preSendBody?.type === 'urlencoded' ? objUrlencoded : {},
          raw: preSendBody?.type === 'raw' ? preSendBody.value : '',
          binary: preSendBody?.type === 'binary' ? preSendBody.value : {
            mode: 'var',
            path: ''
          },
        },
        headers: preSendHeaders,
        bodyType: copiedApidoc.item.requestBody.mode
      }
    },
    variables: toRaw(objectVariable),
    cookies: objCookies,
    localStorage: preRequestLocalStorage,
    sessionStorage: preRequestSessionStorage
  }
  // 处理前置脚本
  worker.postMessage(initDataMessage);
  // 监听脚本处理
  worker.addEventListener('message', async (e: MessageEvent<ReceivedEvent>) => {
    if (e.data.type === 'pre-request-init-success') {
      worker.postMessage({
        type: 'eval',
        code: copiedApidoc.preRequest.raw
      })
    }
    if (e.data.type === 'pre-request-eval-error') {
      cleanup(); // 前置脚本错误时清理 worker
      changeResponseInfo({
        responseData: {
          canApiflowParseType: 'error',
          errorData: `前置脚本执行错误: ${JSON.stringify(e.data.value)}`
        }
      });
      changeRequestState('finish');
      return;
    } else if (e.data.type === 'pre-request-set-query-params') {
      const evaledParams = e.data.value;
      const newParams = convertObjectToProperty(evaledParams);
      copiedApidoc.item.queryParams = newParams;
    } else if (e.data.type === 'pre-request-delete-query-params') {
      const evaledParams = e.data.value;
      const newParams = convertObjectToProperty(evaledParams);
      copiedApidoc.item.queryParams = newParams;
    } else if (e.data.type === 'pre-request-set-header-params') {
      const evaledParams = e.data.value;
      finalSendHeaders = evaledParams;
    } else if (e.data.type === 'pre-request-delete-header-params') {
      const evaledParams = e.data.value;
      finalSendHeaders = evaledParams;
    } else if (e.data.type === 'pre-request-set-path-params') {
      const evaledParams = e.data.value;
      const newParams = convertObjectToProperty(evaledParams);
      copiedApidoc.item.paths = newParams;
    } else if (e.data.type === 'pre-request-delete-path-params') {
      const evaledParams = e.data.value;
      const newParams = convertObjectToProperty(evaledParams);
      copiedApidoc.item.paths = newParams;
    } else if (e.data.type === 'pre-request-delete-json-params') {
      copiedApidoc.item.requestBody.rawJson = e.data.value;
    } else if (e.data.type === 'pre-request-set-json-params') {
      copiedApidoc.item.requestBody.rawJson = e.data.value;
    } else if (e.data.type === 'pre-request-delete-urlencoded') {
      const evaledParams = e.data.value;
      const newParams = convertObjectToProperty(evaledParams);
      copiedApidoc.item.requestBody.urlencoded = newParams;
    } else if (e.data.type === 'pre-request-set-urlencoded') {
      const evaledParams = e.data.value;
      const newParams = convertObjectToProperty(evaledParams);
      copiedApidoc.item.requestBody.urlencoded = newParams;
    } else if (e.data.type === 'pre-request-set-method') {
      copiedApidoc.item.method = e.data.value as Method;
    } else if (e.data.type === 'pre-request-set-raw-body') {
      copiedApidoc.item.requestBody.raw.data = e.data.value;
    } else if (e.data.type === 'pre-request-set-binary-body') {
      const { mode, path } = e.data.value;
      copiedApidoc.item.requestBody.binary = {
        mode,
        varValue: mode === 'var' ? path : '',
        binaryValue: mode === 'file' ? { path, raw: '', id: uuid() } : { path: '', raw: '', id: uuid() }
      };
    } else if (e.data.type === 'pre-request-set-formdata' || e.data.type === 'pre-request-delete-formdata') {
      const evaledValue = e.data.value;
      const newParams: ApidocProperty<'string' | 'file'>[] = [];
      Object.keys(evaledValue).forEach(key => {
        const value = evaledValue[key];
        newParams.push({
          select: true,
          _id: uuid(),
          required: false,
          description: '',
          key,
          value: value.value,
          type: value.type,
        })
      })
      copiedApidoc.item.requestBody.formdata = newParams
    } else if (e.data.type === 'pre-request-set-url') {
      copiedApidoc.item.url.prefix = '';
      copiedApidoc.item.url.path = e.data.value;
    } else if (e.data.type === 'pre-request-set-cookie') {
      finalCookies = e.data.value;
    } else if (e.data.type === 'pre-request-delete-cookie') {
      finalCookies = e.data.value;
    } else if (e.data.type === 'pre-request-set-variable') {
      // 修改variable无意义 console.log(e.data.type, e.data.value);
    } else if (e.data.type === 'pre-request-set-session-storage') {
      httpNodeCache.setPreRequestSessionStorage(projectId, e.data.value);
    } else if (e.data.type === 'pre-request-delete-session-storage') {
      httpNodeCache.setPreRequestSessionStorage(projectId, {});
    } else if (e.data.type === 'pre-request-set-local-storage') {
      httpNodeCache.setPreRequestLocalStorage(projectId, e.data.value);
    } else if (e.data.type === 'pre-request-delete-local-storage') {
      httpNodeCache.setPreRequestLocalStorage(projectId, {});
    }
  })
  worker.addEventListener('message', async (e: MessageEvent<OnEvalSuccess>) => {
    if (e.data.type === 'pre-request-eval-success') {
      invokeRequest()
    }
  });
  worker.addEventListener('error', (error) => {
    changeResponseInfo({
      responseData: {
        canApiflowParseType: 'error',
        errorData: `Pre-request script error: ${error.message}`
      }
    });
    changeRequestState('finish');
  });
  worker.addEventListener('messageerror', () => {
    changeResponseInfo({
      responseData: {
        canApiflowParseType: 'error',
        errorData: 'Pre-request script message error: Failed to deserialize message'
      }
    });
    changeRequestState('finish');
  });
}

export const stopRequest = (): void => {
  const apidocResponseStore = useApidocResponse()
  const { changeRequestState } = apidocResponseStore
  const { cancelRequest } = useApidocRequest()
  changeRequestState('waiting');
  cancelRequest();
}
