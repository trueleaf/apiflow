import FileType from 'file-type/browser';
import type FormData from 'form-data'
import type { Timings, IncomingMessageWithTimings } from '@szmarczak/http-timer';
import config from './config'
import apidocConverter from './utils'
import { useApidocRequest } from '@/store/apidoc/request';
import { useApidocResponse } from '@/store/apidoc/response';
import { useApidoc } from '@/store/apidoc/apidoc';
import { getFileNameFromContentDisposition } from '@/helper';

let got: Got | null = null;
let gotInstance: Got | null = null;
let requestStream: Request | null = null;
let worker: Worker;


//初始化请求
function initGot() {
  if (!got) {
    return null;
  }
  if (gotInstance) {
    return gotInstance;
  }
  const apidocRequestStore = useApidocRequest();
  const initGotConfig = {
    timeout: config.timeout || 60000, //超时时间
    retry: 0,
    throwHttpErrors: false,
    followRedirect: true,
    allowGetBody: true,
    agent: {},
    headers: {
      'user-agent': 'https://github.com/trueleaf/moyu'
    },
    hooks: {
      beforeRequest: [(options: NormalizedOptions) => {
        const realHeaders: Record<string, string> = {
          host: options.url.host,
          ...options.headers,
          connection: 'close',
        };
        apidocRequestStore.changeFinalRequestInfo({
          url: options.url.href,
          headers: realHeaders,
          method: options.method,
          // todo
          body: options.body as any,
        })
      }]
    },
  }
  // if (enabledProxy) {
  //   initGotConfig.agent = {
  //     http: new ProxyAgent(proxyPath),
  //     https: new ProxyAgent(proxyPath),
  //   }
  // }
  gotInstance = got.extend(initGotConfig);
  return gotInstance;
}

//将buffer值转换为返回参数
async function formatResponseBuffer(bufferData: Buffer, contentType?: string) {
  const apidocResponseStore = useApidocResponse();
  const apidocStore = useApidoc();
  const typeInfo = await FileType.fileTypeFromBuffer(bufferData.buffer);
  const mimeType = typeInfo ? typeInfo.mime : 'text/plain' //无法解析数据按照文本显示
  const mime = contentType || mimeType; //优先读取contentType
  const textContentType = ['text/', 'application/json', 'application/javascript', 'application/xml'];
  apidocResponseStore.changeResponseContentType(mime);
  if (!contentType) { //没有contentType按照文本格式解析
    apidocResponseStore.changeResponseTextValue(bufferData.toString());
  } else if (textContentType.find(type => contentType.match(type))) {
    apidocResponseStore.changeResponseTextValue(bufferData.toString());
  } else {
    const blobData = new Blob([bufferData], { type: mime });
    const blobUrl = URL.createObjectURL(blobData);
    const { path } = apidocStore.apidoc.item.url;
    const headers = apidocResponseStore.header;
    const contentDisposition = headers['content-disposition'] as string;
    const headerFileName = getFileNameFromContentDisposition(contentDisposition);
    const matchedUrlFileName = path.match(/[^/]+.[^.]$/);
    const urlName = matchedUrlFileName ? matchedUrlFileName[0] : ''
    const fileName = headerFileName || urlName;
    apidocResponseStore.changeResponseFileInfo({
      url: blobUrl,
      mime,
      ext: typeInfo?.ext || '',
      name: fileName,
    });
   
    // store.commit("apidoc/response/changeResponseFileUrl", blobUrl);
    // store.commit("apidoc/response/changeResponseFileExt", (typeInfo ? typeInfo.ext : ""));
  }
}
//electron发送请求
function electronRequest() {
  const apidocResponseStore = useApidocResponse();
  const apidocStore = useApidoc()
  const requestInstance = initGot();
  if (!requestInstance) {
    console.warn('当前环境无法获取Got实例');
    return
  }
  try {
    const requestUrl = apidocConverter.getUrlInfo().fullUrl;
    const method = apidocConverter.getMethod();
    let body: string | FormData = '';
    // if (method === "GET") { //GET请求body为空，否则请求将被一直挂起
    // } else {
    //     body = apidocConverter.getRequestBody() as (string | FormData);
    // }
    body = apidocConverter.getRequestBody() as (string | FormData); //允许GET请求发送body数据
    const headers = apidocConverter.getHeaders();
    if (!requestUrl) { //请求url不存在
      apidocResponseStore.changeLoading(false);
      apidocResponseStore.changeIsResponse(true);
      apidocResponseStore.changeResponseContentType('error');
      apidocResponseStore.changeResponseTextValue('请求url不能为空');
      return;
    }
    requestStream = requestInstance(requestUrl, {
      isStream: true,
      method,
      body,
      headers,
    });
    //=====================================数据处理====================================//
    const streamData: Buffer[] = [];
    let responseData: IncomingMessageWithTimings | null = null;
    let streamSize = 0;
    //收到返回
    requestStream.on('response', (response: IncomingMessageWithTimings & { ip: string }) => {
      responseData = response;
      apidocResponseStore.changeResponseHeader(response.headers);
      apidocResponseStore.changeResponseCookies(response.headers['set-cookie'] || []);
      apidocResponseStore.changeResponseBaseInfo({
        httpVersion: response.httpVersion,
        ip: response.ip,
        statusCode: response.statusCode ?? -1,
        statusMessage: response.statusMessage ?? "",
        contentType: response.headers['content-type'] ?? "",
      })
      apidocResponseStore.changeIsResponse(true)
      // store.commit('apidoc/response/changeResponseHeader', response.headers);
      // store.commit('apidoc/response/changeResponseCookies', response.headers['set-cookie'] || []);
      // store.commit('apidoc/response/changeResponseBaseInfo', {
      //   httpVersion: response.httpVersion,
      //   ip: response.ip,
      //   statusCode: response.statusCode,
      //   statusMessage: response.statusMessage,
      //   contentType: response.headers['content-type'],
      // });
      // store.commit('apidoc/response/changeIsResponse', true)
    });
    //数据获取完毕
    requestStream.on('end', async () => {
      const responseContentType = apidocResponseStore.contentType;
      const bufData = Buffer.concat(streamData, streamSize);
      await formatResponseBuffer(bufData, responseContentType);
      const rt = (responseData?.timings as Timings).phases.total;
      apidocResponseStore.changeResponseTime(rt || -1);
      apidocResponseStore.changeResponseSize(streamSize);
      apidocResponseStore.changeLoading(false);
   
      const responseInfo = apidocResponseStore;
      // console.log(responseInfo)
      worker.postMessage({
        type: 'after-request-init-response',
        value: JSON.parse(JSON.stringify({
          headers: responseInfo.header,
          cookies: responseInfo.cookies,
          httpVersion: responseInfo.httpVersion,
          ip: responseInfo.ip,
          rt: responseInfo.rt,
          size: responseInfo.size,
          statusCode: responseInfo.statusCode,
          statusMessage: responseInfo.statusMessage,
          data: responseInfo.data,
        }))
      });
      worker.postMessage(JSON.parse(JSON.stringify({
        type: 'after-request-request',
        value: apidocStore.apidoc.afterRequest.raw
      })));
    });
    //获取流数据
    requestStream.on('data', (chunk) => {
      streamData.push(Buffer.from(chunk));
      streamSize += chunk.length;
    });
    //错误处理
    requestStream.on('error', (error) => {
      apidocResponseStore.changeLoading(false);
      apidocResponseStore.changeIsResponse(true)
      apidocResponseStore.changeResponseContentType('error');
      apidocResponseStore.changeResponseTextValue(error.message);
      console.error(error);
    });
    //重定向
    requestStream.on('redirect', () => {
      console.log('重定向');
    });
    //下载进度
    requestStream.on('downloadProgress', (process) => {
      apidocResponseStore.changeResponseProgress(process)
    });
  } catch (error) {
    apidocResponseStore.changeLoading(false);
    apidocResponseStore.changeIsResponse(true)
    apidocResponseStore.changeResponseContentType('error');
    apidocResponseStore.changeResponseTextValue((error as Error).toString());
    console.error(error);
  }
}

/*
|--------------------------------------------------------------------------
| 发送请求
|--------------------------------------------------------------------------
*/
export function sendRequest(): void {
  // const apidocResponseStore = useApidocResponse();
  const apidocStore = useApidoc()
  // const apidocBaseInfoStore = useApidocBaseInfo();
  // const apidocTabsStore = useApidocTas();
  // const apidocWorkerStateStore = useApidocWorkerState()

  // apidocResponseStore.changeIsResponse(false);
  // apidocBaseInfoStore.clearTempVariables();
  // apidocResponseStore.changeLoading(true);
  // const cpApidoc: ApidocDetail = JSON.parse(JSON.stringify(apidocStore.apidoc));
  // const cpApidoc2: ApidocDetail = JSON.parse(JSON.stringify(apidocStore.apidoc));
  // apidocConverter.setData(cpApidoc as ApidocDetail);
  // apidocConverter.replaceUrl('');
  // apidocConverter.clearTempVariables()
  // const currentEnv = cpApidoc.item.url.host;
  // const projectId = router.currentRoute.value.query.id as string;
  // const tabs = apidocTabsStore.tabs[projectId];
  // const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
  // const commonHeaders = apidocBaseInfoStore.getCommonHeadersById(currentSelectTab?._id || '')
  // const localEnvs = apidocCache.getApidocServer(projectId);
  // const envs = apidocBaseInfoStore.hosts.concat(localEnvs);

  const method = getMethod(apidocStore)


  window.electronAPI?.sendRequest({
    url: apidocStore.apidoc.item.url.path,
    method: 'get',
    timeout: 60000,
    signal() {
      
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
  const apidocResponseStore = useApidocResponse();
  apidocResponseStore.changeLoading(false);
  apidocResponseStore.changeIsResponse(true);
  if (requestStream) {
    requestStream.destroy();
  }
}
