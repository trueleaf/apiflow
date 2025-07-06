import { useApidoc } from '@/store/apidoc/apidoc';
import { ref, toRaw } from 'vue';
import json5 from 'json5'
import { ApidocDetail, ApidocProperty } from '@src/types/global';
import { convertTemplateValueToRealValue, getEncodedStringFromEncodedParams, getFormDataFromFormDataParams, getObjectPathParams, getQueryStringFromQueryParams } from '@/utils/utils';
import { useVariable } from '@/store/apidoc/variables';
import { GotRequestOptions, JsonData, RedirectOptions, ResponseInfo } from '@src/types/types';
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { useApidocTas } from '@/store/apidoc/tabs';
import { useApidocResponse } from '@/store/apidoc/response';
import { apidocCache } from '@/cache/apidoc';
import { config } from '@src/config/config';
import { cloneDeep, uuid } from '@/helper';
import { useApidocRequest } from '@/store/apidoc/request';
import { t } from 'i18next';
import { useCookies } from '@/store/apidoc/cookies';
import { InitDataMessage, OnEvalSuccess, ReceivedEvent } from '@/worker/pre-request/types/types.ts';
import { Method } from 'got';
import preRequestWorker from '@/worker/pre-request/pre-request.ts?worker&inline';
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
const getMethod = (apidoc: ApidocDetail) => {
  return apidoc.item.method;
}
export const getUrl = async (apidoc: ApidocDetail) => {
  const { objectVariable } = useVariable()
  const { url, queryParams, paths, } = apidoc.item;
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
const getBody = async (apidoc: ApidocDetail): Promise<GotRequestOptions['body']> => {
  const { changeResponseInfo, changeRequestState } = useApidocResponse()
  const { objectVariable } = useVariable()
  const { changeFormDataErrorInfoById } = useApidoc()
  const { mode, urlencoded } = apidoc.item.requestBody;
  if (mode === 'json' && apidoc.item.requestBody.rawJson.trim()) {
    /*
     * 情况1：json值存在超长数字，在js中会被截断 例如：{ num: 123456789087654321 } 会被转换为 { num: 123456789087654320 } 
     * 情况2："{{ 变量名称 }}" 会被解析为实际变量值
     * 情况3："{{ @xxx }}" 会被解析为mock值
     * 情况4: "\{{ @xxx }}" 反斜杠转义，不会被解析
     */
    const bigNumberMap: Record<string, string> = {}; // 存储超长数字
    const replacedRawJson = apidoc.item.requestBody.rawJson.replace(/([+-]?\d*\.?\d+)(?=\s*[,}\]])/g, ($1) => {
      const replacedStr = `"${$1}n"`;
      bigNumberMap[`${$1}n`] = `${$1}`;
      return replacedStr;
    })
    try {
      const jsonObject = json5.parse(replacedRawJson || 'null');
      await Promise.all(convertStringValueAsync(jsonObject));
      const stringBody = JSON.stringify(jsonObject).replace(/"([+-]?\d*\.?\d+n)"(?=\s*[,}\]])/g, (_, $2) => {
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
    const validFormData = apidoc.item.requestBody.formdata.filter(formData => formData.select && formData.key !== '');
    validFormData.forEach(formData => {
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
  console.warn(`${t('未知的请求body类型')}`)
  return undefined;
}
/*
  * 1.从用户定义请求头中获取请求头
  * 2.从公共请求头中获取请求头 
  * 3.从cookie中读取请求头
 */
const getHeaders = async (apidoc: ApidocDetail) => {
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
  const ignoreHeaderIds = apidocCache.getIgnoredCommonHeaderByTabId(projectId, currentSelectTab?._id ?? "") || [];
  const commonHeaders = defaultCommonHeaders.filter(header => !ignoreHeaderIds.includes(header._id));
  const headers = apidoc.item.headers;
  const headersObject: Record<string, string | null> = {};
  for(let i = 0; i < defaultHeaders.length; i++) {
    const header = defaultHeaders[i];
    if (!header.disabled && !header.select) { //当前请求头可以被取消
      headersObject[header.key.toLowerCase()] = null;
    } else if (!header._disableValue && header.value) {
      const realValue = await convertTemplateValueToRealValue(header.value, objectVariable);
      headersObject[header.key.toLowerCase()] = realValue;
    }
  }
  for(let i = 0; i < commonHeaders.length; i++) {
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
  for(let i = 0; i < headers.length; i++) {
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

export async function sendRequest() {
  const worker = new preRequestWorker();
  const redirectList = ref<ResponseInfo['redirectList']>([]);
  const apidocBaseInfoStore = useApidocBaseInfo();
  const { objectVariable } = useVariable();
  const projectId = apidocBaseInfoStore.projectId;
  const apidocTabsStore = useApidocTas();
  const selectedTab = apidocTabsStore.getSelectedTab(apidocBaseInfoStore.projectId);
  const apidocStore = useApidoc();
  const { updateCookiesBySetCookieHeader, getMachtedCookies } = useCookies();
  const { changeCancelRequestRef } = useApidocRequest()
  const { changeResponseInfo, changeResponseBody, changeResponseCacheAllowed, changeRequestState, changeLoadingProcess, changeFileBlobUrl } = useApidocResponse()
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
  const preRequestSessionStorage = apidocCache.getPreRequestSessionStorage(projectId) || {};
  const preRequestLocalStorage = apidocCache.getPreRequestLocalStorage(projectId) || {};
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
      onError: (err) => {
        console.error(err)
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
      onReadFileFormDataError(options: {id: string, msg: string, fullMsg: string}) {
        apidocStore.changeFormDataErrorInfoById(options.id, options.msg);
        changeResponseInfo({
          responseData: {
            canApiflowParseType: 'error',
            errorData: options.fullMsg
          }
        });
        changeRequestState('finish');
      },
      onReadBinaryDataError(options: {msg: string, fullMsg: string}) {
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
        changeRequestState('finish');
      },
      onResponseData(loadedLength, totalLength) {
        changeLoadingProcess({
          total: totalLength,
          transferred: loadedLength,
          percent: loadedLength / totalLength
        })
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
        updateCookiesBySetCookieHeader(setCookieStrList, responseInfo.requestData.host, projectId);
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
        apidocCache.setResponse(selectedTab?._id ?? '', storedResponseInfo);
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
      copiedApidoc.item.url.host = '';
      copiedApidoc.item.url.path = e.data.value;
    } else if (e.data.type === 'pre-request-set-cookie') {
      finalCookies = e.data.value;
    } else if (e.data.type === 'pre-request-delete-cookie') {
      finalCookies = e.data.value;
    } else if (e.data.type === 'pre-request-set-variable') {
      // 修改variable无意义 console.log(e.data.type, e.data.value);
    } else if (e.data.type === 'pre-request-set-session-storage') {
      apidocCache.setPreRequestSessionStorage(projectId, e.data.value);
    } else if (e.data.type === 'pre-request-delete-session-storage') {
      apidocCache.setPreRequestSessionStorage(projectId, {});
    } else if (e.data.type === 'pre-request-set-local-storage') {
      apidocCache.setPreRequestLocalStorage(projectId, e.data.value);
    } else if (e.data.type === 'pre-request-delete-local-storage') {
      apidocCache.setPreRequestLocalStorage(projectId, {});
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

export function stopRequest(): void {
  const { changeRequestState, changeResponseInfo } = useApidocResponse()
  const { cancelRequest } = useApidocRequest()
  changeRequestState('waiting');
  cancelRequest();
  changeResponseInfo({
    responseData: {
      canApiflowParseType: 'error',
      errorData: t('请求被手动取消')
    }
  })
}
