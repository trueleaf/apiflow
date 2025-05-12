
import { useApidoc } from '@/store/apidoc/apidoc';
import { toRaw } from 'vue';
import json5 from 'json5'
import { ApidocDetail } from '@src/types/global';
import { convertTemplateValueToRealValue, getEncodedStringFromEncodedParams, getFormDataFromFormDataParams, getObjectPathParams, getQueryStringFromQueryParams } from '@/utils/utils';
import { useVariable } from '@/store/apidoc/variables';
import { GotRequestOptions, JsonData, RendererFormDataBody } from '@src/types/types';
import { useApidocBaseInfo } from '@/store/apidoc/base-info';
import { useApidocTas } from '@/store/apidoc/tabs';
import { useApidocResponse } from '@/store/apidoc/response';
import { apidocCache } from '@/cache/apidoc';
import { config } from '@src/config/config';
import { cloneDeep } from '@/helper';
import { useApidocRequest } from '@/store/apidoc/request';
import { t } from 'i18next';

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
  const { changeResponseInfo } = useApidocResponse()
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
      return stringBody;
    } catch (error) {
      changeResponseInfo({
        responseData: {
          canApiflowParseType: 'error',
          errorData: `Body参数JSON数据格式解析错误\n${(error as Error).message}`
        }
      });
      throw new Error((error as Error).message)
    }
  } else if (mode === 'json' && !apidoc.item.requestBody.rawJson.trim()) {
    return
  }
  if (mode === 'urlencoded') {
    const urlencodedString = await getEncodedStringFromEncodedParams(urlencoded, objectVariable);
    return urlencodedString;
  }
  if (mode === 'formdata') {
    const validFormData = apidoc.item.requestBody.formdata.filter(formData => formData.select && formData.key !== '');
    validFormData.forEach(formData => {
      changeFormDataErrorInfoById(formData._id, ''); //每次请求前清空错误信息
    })
    const formData = await getFormDataFromFormDataParams(validFormData, objectVariable);
    return formData;
  }
  if (mode === 'raw') {
    const { data } = apidoc.item.requestBody.raw;
    const realData = await convertTemplateValueToRealValue(data, objectVariable);
    return realData;
  }
  if (mode === 'binary') {
    const { mode, varValue, binaryValue } = apidoc.item.requestBody.binary;
    if (mode === 'var') {
      const filePath = await convertTemplateValueToRealValue(varValue, objectVariable);
      return {
        type: 'binary',
        path: filePath
      };
    } else {
      const filePath = binaryValue.path;
      return {
        type: 'binary',
        path: filePath
      };
    }
  }
  console.warn(`${t('未知的请求body类型')}`)
  return '??'
}
/*
  * 1.从用户定义请求头中获取请求头
  * 2.从公共请求头中获取请求头 
 */
const getHeaders = async (apidoc: ApidocDetail) => {
  const { objectVariable } = useVariable()
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
  for(let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const realKey = await convertTemplateValueToRealValue(header.key, objectVariable);
    if (realKey.trim() === '') {
      continue;
    }
    const realValue = await convertTemplateValueToRealValue(header.value, objectVariable);
    headersObject[realKey] = realValue
  }
  for(let i = 0; i < commonHeaders.length; i++) {
    const header = commonHeaders[i];
    const realKey = await convertTemplateValueToRealValue(header.key, objectVariable);
    if (realKey.trim() === '') {
      continue;
    }
    const realValue = await convertTemplateValueToRealValue(header.value, objectVariable);
    headersObject[realKey] = realValue
  }
  for(let i = 0; i < defaultHeaders.length; i++) {
    const header = defaultHeaders[i];
    if (!header.disabled && !header.select) { //当前请求头可以被取消
      headersObject[header.key] = null;
    } else if (!header._disableValue && header.value) {
      const realValue = await convertTemplateValueToRealValue(header.value, objectVariable);
      headersObject[header.key] = realValue;
    }
  }
  return headersObject;
}

export async function sendRequest() {
  const apidocBaseInfoStore = useApidocBaseInfo();
  const apidocTabsStore = useApidocTas();
  const selectedTab = apidocTabsStore.getSelectedTab(apidocBaseInfoStore.projectId);
  const apidocStore = useApidoc()
  const { changeCancelRequestRef } = useApidocRequest()
  const { changeResponseInfo, changeRequestState, changeLoadingProcess } = useApidocResponse()
  const rawApidoc = toRaw(apidocStore.$state.apidoc)
  const method = getMethod(rawApidoc);
  const url = await getUrl(rawApidoc);
  const body = await getBody(rawApidoc);
  const headers = await getHeaders(rawApidoc);
  let formDataBody: RendererFormDataBody = []
  const isFormData = rawApidoc.item.requestBody.mode === 'formdata';
  if (isFormData) {
    formDataBody = body as RendererFormDataBody;
  }
  const requestBody = isFormData ? formDataBody : (body as string);
  changeRequestState('sending')
  window.electronAPI?.sendRequest({
    url,
    method,
    timeout: 60000,
    body: requestBody,
    headers,
    signal(cancelRequest) {
      changeCancelRequestRef(cancelRequest);
    },
    onError: (err) => {
      console.error(err)
      changeResponseInfo({
        responseData: {
          canApiflowParseType: 'error',
          errorData: err.message
        }
      });
      changeRequestState('finish');
    },
    beforeRedirect: () => {
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
      changeRequestState('finish');
      changeResponseInfo(responseInfo);
      console.log('responseInfo', responseInfo)
      const storedResponseInfo = cloneDeep(responseInfo);
      if (responseInfo.bodyByteLength > config.requestConfig.maxStoreSingleBodySize) {
        storedResponseInfo.body = [];
        storedResponseInfo.responseData.textData = '';
        storedResponseInfo.responseData.jsonData = '';
        storedResponseInfo.responseData.fileData = {
          url: "",
          name: "",
        };
        storedResponseInfo.responseData.canApiflowParseType = 'cachedBodyIsTooLarge'
      }
      apidocCache.setResponse(selectedTab?._id ?? '', storedResponseInfo);
    },
  })




  // worker = new Worker('/sandbox/pre-request/worker.js');
  // db.scriptList.toArray().then(scriptList => {
  //   //初始化默认apidoc信息
  //   worker.postMessage({
  //     type: 'pre-request-init-apidoc',
  //     value: JSON.parse(JSON.stringify({
  //       apidocInfo: JSON.parse(JSON.stringify(cpApidoc2)),
  //       commonHeaders: JSON.parse(JSON.stringify(commonHeaders)),
  //       currentEnv,
  //       projectName: apidocBaseInfoStore.projectName,
  //       _id: apidocBaseInfoStore._id,
  //       projectVaribles: JSON.parse(JSON.stringify(apidocBaseInfoStore.variables)),
  //       envs,
  //       sessionState: JSON.parse(JSON.stringify(apidocWorkerStateStore.sessionState[projectId] || {})),
  //       localState: JSON.parse(JSON.stringify(apidocWorkerStateStore.localState[projectId] || {})),
  //       remoteState: JSON.parse(JSON.stringify(apidocWorkerStateStore.remoteState[projectId] || {})),
  //       packages: JSON.parse(JSON.stringify(scriptList))
  //     }))
  //   });
  //   //发送请求
  //   worker.postMessage(JSON.parse(JSON.stringify({
  //     type: 'pre-request-request',
  //     value: apidocStore.apidoc.preRequest.raw
  //   })));
  // })
  // //错误处理
  // worker.addEventListener('error', (error) => {
  //   apidocResponseStore.changeLoading(false);
  //   apidocResponseStore.changeResponseContentType('error');
  //   apidocResponseStore.changeIsResponse(true);
  //   apidocResponseStore.changeResponseTextValue(error.message);
  //   console.error(error);
  // });
  // //信息处理
  // worker.addEventListener('message', async (res) => {
  //   if (typeof res.data !== 'object') {
  //     return
  //   }
  //   if (res.data.type === 'pre-request-send-request') { //老版本接口请求
  //     (got as Got)(res.data.value).then(response => {
  //       worker.postMessage({
  //         type: 'pre-request-request-success',
  //         value: JSON.parse(JSON.stringify({
  //           headers: JSON.parse(JSON.stringify(response.headers)),
  //           status: response.statusMessage,
  //           code: response.statusCode,
  //           responseTime: response.timings.phases.total,
  //           body: response.body,
  //         }))
  //       });
  //     }).catch(err => {
  //       worker.postMessage({
  //         type: 'pre-request-request-error',
  //         value: err
  //       });
  //     })
  //   }
  //   if (res.data.type === 'pre-request-http') { //接口请求
  //     const { url, body, headers, method, params } = res.data.value;
  //     if (!got) {
  //       worker.postMessage({
  //         type: 'pre-request-http-error',
  //         value: {}
  //       });
  //       console.warn('got实例不存在')
  //     } else {
  //       const requestBody = method.toLowerCase() === 'get' ? undefined : JSON.stringify(body);
  //       const options: OptionsOfTextResponseBody = {
  //         method,
  //         body: requestBody,
  //         headers
  //       }
  //       let realUrl = url;
  //       const stringParams = url.split('?')[1] || '';
  //       const urlSearchParams = new URLSearchParams(stringParams);
  //       const queryParams = Object.fromEntries(urlSearchParams.entries())
  //       if (Object.keys(queryParams).length > 0) {
  //         options.searchParams = Object.assign(queryParams, params);
  //         realUrl = realUrl.replace(/\?.*/, '')
  //       }
  //       got(realUrl, options).then(data => {
  //         let jsonBody = {};
  //         try {
  //           jsonBody = JSON.parse(data.body);
  //         } catch (err) {
  //           console.log('error')
  //           worker.postMessage({
  //             type: 'pre-request-http-error',
  //             value: err
  //           });
  //         }
  //         worker.postMessage({
  //           type: 'pre-request-http-success',
  //           value: JSON.parse(JSON.stringify({
  //             headers: data.headers,
  //             body: jsonBody,
  //             rawBody: data.rawBody,
  //             statusCode: data.statusCode,
  //           }))
  //         });
  //       }).catch(err => {
  //         worker.postMessage({
  //           type: 'pre-request-http-error',
  //           value: err
  //         });
  //       })
  //     }
  //   }
  //   if (res.data.type === 'pre-request-send-request-by-id') { //根据文档id发送请求
  //     apidocConverter.getDocRequestInfo(projectId, res.data.value.id)
  //   }
  //   if (res.data.type === 'pre-request-finish') { //前置脚本执行完
  //     console.log('pre script finish')
  //     electronRequest();
  //   }
  //   if (res.data.type === 'after-request-finish') { //后置脚本执行完
  //     console.log('after script finish')
  //   }
  //   if (res.data.type === 'change-temp-variables') { //改版临时变量
  //     apidocConverter.changeTempVariables(res.data.value);
  //   }
  //   if (res.data.type === 'pre-request-change-variables') { //改版集合内变量
  //     apidocConverter.changeCollectionVariables(res.data.value);
  //   }
  //   if (res.data.type === 'pre-request-change-url') { //改变完整url
  //     apidocConverter.replaceUrl(res.data.value);
  //   }
  //   if (res.data.type === 'pre-request-change-headers') { //改变请求头
  //     apidocConverter.changeHeaders(res.data.value);
  //   }
  //   if (res.data.type === 'pre-request-change-query-params') { //改变 queryparams
  //     apidocConverter.changeQueryParams(res.data.value);
  //   }
  //   if (res.data.type === 'pre-request-change-path-params') { //改变 pathparams
  //     apidocConverter.changePathParams(res.data.value);
  //   }
  //   if (res.data.type === 'pre-request-change-json-params') { //改变请求body
  //     apidocConverter.changeJsonBody(res.data.value);
  //   }
  //   if (res.data.type === 'pre-request-change-formdata') { //改变请求formdata body
  //     apidocConverter.changeFormdataBody(res.data.value);
  //   }
  //   if (res.data.type === 'pre-request-change-urlencoded') { //改变请求urlencoded body
  //     apidocConverter.changeUrlencodedBody(res.data.value);
  //   }
  //   if (res.data.type === 'pre-request-change-raw-params') { //改变raw body
  //     apidocConverter.changeRawBody(res.data.value);
  //   }
  //   if (res.data.type === 'pre-request-change-sessionState') { //改变worker的sessionState
  //     apidocWorkerStateStore.changeSessionState({
  //       projectId,
  //       value: res.data.value
  //     })
  //   }
  //   if (res.data.type === 'pre-request-change-localState') { //改变worker的localState
  //     apidocCache.setApidocWorkerLocalState(projectId, res.data.value)
  //     apidocWorkerStateStore.changeLocalState({
  //       projectId,
  //       value: res.data.value
  //     })
  //   }
  //   if (res.data.type === 'pre-request-error' || res.data.type === 'after-request-error') { //预请求错误捕获
  //     apidocResponseStore.changeLoading(false);
  //     apidocResponseStore.changeResponseContentType('error');
  //     apidocResponseStore.changeIsResponse(true);
  //     if (res.data.type === 'pre-request-error') {
  //       apidocResponseStore.changeResponseTextValue(`${t('前置脚本：')}${res.data.value.message}`);
  //     } else {
  //       apidocResponseStore.changeResponseTextValue(`${t('后置脚本：')}${res.data.value.message}`);
  //     }
  //     console.error(res.data.value);
  //   }
  // })
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
  // if (requestStream) {
  //   requestStream.destroy();
  // }
}
