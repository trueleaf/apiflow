
import {
  GotRequestOptions,
  RendererFormDataBody,
} from '@/../types/types';
import { Options, got} from 'got';
import type { OptionsInit, PlainResponse, RequestError } from 'got'
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
import mime from "mime";
import fs from 'fs/promises';
import http from 'node:http';
import http2 from 'node:http';
import { basename } from 'path';


// const getFullUrl = (params: CustomRequestInfo, globalVariables: Record<string, any>) => {
//   const queryString = getQueryStringFromQueryParams(params.queryParams, globalVariables);
//   const pathString = convertPathParamsToPathString(params.paths, globalVariables);
//   const convertedUrl = convertTemplateValueToRealValue(params.url, globalVariables).toString().replace(/(\/*)$/, '');
//   return `${convertedUrl}${pathString ? `/${pathString}` : ''}${queryString ? `/${queryString}` : ''}`;
// };
// const getHeaders = (params: CustomRequestInfo, globalVariables: Record<string, any>) => {
//   const userSetHeaders = convertPropertyToObject(params.headers, globalVariables);
//   const autoSetHeaders: Record<string, string> = {};
//   const hasUserSetContentType = Object.keys(userSetHeaders).find(headerKey => {
//     return headerKey.toLocaleLowerCase().includes('content-type') || headerKey.toLocaleLowerCase().includes('contentType');
//   })
//   if (!hasUserSetContentType) {
//     autoSetHeaders['content-type'] = params.contentType
//   }
//   return Object.assign(autoSetHeaders, userSetHeaders);
// };
// const getBody = (params: CustomRequestInfo, globalVariables: Record<string, any>): string | FormData => {
//   if (params.contentType.includes('application/json')) {
//     const numberMap: Record<string, string> = {};
//     const convertBody = params.requestBody.rawJson.replace(/("\s*:\s*)(\d{14,})/g, (_, $1, $2) => {
//       numberMap[$2] = $2;
//       return `${$1}"${$2}"`;
//     });
//     try {
//       return JSON.stringify(json5.parse(convertBody || "null", (_: string, value: any) => {
//         if (!value) {
//           return value;
//         }
//         if (typeof value === 'string') {
//           return convertTemplateValueToRealValue(value, globalVariables);
//         }
//         return value;
//       }));
//     } catch (error) {
//       console.error(error);
//       return "";
//     }
//   }
//   return ''
// }

// const gotInstance = got.extend({
//   timeout: {
//     request: 60000, // 60s
//   },
//   allowGetBody: true,
//   retry: {
//     limit: 0,
//   },
// });
// export const sendRequest = (requestNode: FlowNode, options: SendRequestOptions) => {
//   return new Promise((resolve, reject) => {
//     const responseInfo = generateEmptyResponse()
//     try {
//       const { validVariables } = options;
//       const { requestInfo } = requestNode.api;
//       const method = requestInfo.method as Method;
//       const url = getFullUrl(requestInfo, validVariables);
//       const headers = getHeaders(requestInfo, validVariables);
//       const body = getBody(requestInfo, validVariables);
//       const requestStream = gotInstance(url, {
//         isStream: true,
//         method,
//         headers,
//         body
//       });
//       const streamData: Buffer[] = [];
//       let streamSize = 0;
//       requestStream.on("response", (response: PlainResponse) => {
//         responseInfo.headers = response.headers;
//         responseInfo.contentType = response.headers['content-type'] || '';
//         responseInfo.body = response.body,
//           responseInfo.finalRequestUrl = response.url;
//         responseInfo.originRequestUrl = response.requestUrl;
//         responseInfo.ip = response.ip || '';
//         responseInfo.isFromCache = response.isFromCache;
//         responseInfo.redirectUrls = response.redirectUrls;
//         responseInfo.timings = response.timings;
//         responseInfo.retryCount = response.retryCount;
//         responseInfo.statusCode = response.statusCode;
//       });
//       requestStream.on("data", (chunk: Buffer) => {
//         streamData.push(Buffer.from(chunk));
//         streamSize += chunk.length;
//       });
//       requestStream.on("end", async () => {
//         const bufData = Buffer.concat(streamData, streamSize);
//         const fileTypeResult = await fileTypeFromBlob(bufData.buffer);
//         responseInfo.bodySize = bufData.length;
//         let mimeType = 'unknown';
//         if (fileTypeResult) {
//           mimeType = fileTypeResult.mime
//           responseInfo.mimeType = fileTypeResult.mime
//         }
//         if (!mimeType && responseInfo.contentType) {
//           mimeType = responseInfo.contentType;
//         }
//         const textMimes = ["text/", "application/json", "application/javascript", "application/xml"];
//         const imageMimes = ["image/"];
//         const zipMimes = ['application/zip', 'application/x-tar', 'application/x-rar-compressed', 'application/gzip', 'application/x-bzip2', 'application/x-7z-compressed'];
//         const wordMimes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
//         const excelMimes = ['application/vnd.ms-excel', 'application/vnd.oasis.opendocument.spreadsheet'];
//         const pptMimes = ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
//         responseInfo.body = bufData;
//         if (textMimes.find(mime => mimeType.match(mime))) {
//           responseInfo.dataType = 'text';
//           responseInfo.body = bufData.toString()
//         } else if (imageMimes.find(mime => mimeType.match(mime))) {
//           responseInfo.dataType = 'image';
//         } else if (zipMimes.find(mime => mimeType.match(mime))) {
//           responseInfo.dataType = 'zip';
//         } else if (wordMimes.find(mime => mimeType.match(mime))) {
//           responseInfo.dataType = 'word';
//         } else if (excelMimes.find(mime => mimeType.match(mime))) {
//           responseInfo.dataType = 'excel';
//         } else if (pptMimes.find(mime => mimeType.match(mime))) {
//           responseInfo.dataType = 'ppt';
//         }
//         resolve(responseInfo)
//       });
//       requestStream.on("error", (error) => {
//         reject(error)
//       });
//     } catch (error) {
//       reject(error)
//     }
//   })
// }

const getFormDataFromRendererFormData = async (rendererFormDataList: RendererFormDataBody) => {
  const formData = new FormData();
  for (let i = 0; i < rendererFormDataList.length; i++) {
    const formDataParam = rendererFormDataList[i];
    const { id, key, type, value } = formDataParam;
    if (type === 'string') {
      formData.append(key, value);
    } else if (type === 'file') {
      try {
        await fs.access(value, fs.constants.F_OK)
      } catch {
        return {
          id,
          msg: '文件不存在(发送被终止)'
        }
      }
      try {
        const fsStat = await fs.stat(value);
        if (!fsStat.isFile) {
          return {
            id,
            msg: '不是文件无法读取(发送被终止)'
          }
        }
        if (fsStat.size > 1024 * 1024 * 10) {
          return {
            id,
            msg: '文件大小超过10MB(发送被终止)'
          }
        }
      } catch (error) {
        return {
          id,
          msg: (error as Error).message
        }
      }
      const buffer = await fs.readFile(value);
      const fileType = await fileTypeFromBuffer(buffer.buffer as ArrayBuffer);
      const filename = basename(value);
      let mimeType = fileType?.mime || ""
      if (!mimeType && formDataParam.value.match(/\.ts$/)) { //.ts以纯文本处理，不然会被当做视频处理
        mimeType = 'text/plain';
      } else if (!mimeType) {
        mimeType = mime.getType(formDataParam.value) || 'text/plain';
      }
      formData.append(key, buffer, {
        contentType: mimeType,
        filename: filename
      });
    }
  }
  return Promise.resolve(formData);
}


export const gotRequest = async (options: GotRequestOptions) => {
  const abortController = new AbortController();
  let reqeustBody: FormData | {
    id: string,
    msg: string
  } |  null = null;
  const headers: Record<string, string | undefined> = {};
  //formData数据单独处理
  const isFormDataBody = Array.isArray(options.body)
  if (isFormDataBody) {
    reqeustBody = await getFormDataFromRendererFormData(options.body as RendererFormDataBody);
    if (!(reqeustBody instanceof FormData)) {
      options.onReadFileFormDataError?.(reqeustBody);
      return
    }
  }
  //更新请求头信息
  for (const key in options.headers) {
    if (options.headers[key] === null) { //undefined代表未设置值，null代表取消发送
      headers[key] = undefined
    } else if (isFormDataBody && key.toLowerCase() === 'content-type') {
      headers[key] = reqeustBody?.getHeaders()['content-type'];
    } else {
      headers[key] = options.headers[key]
    }
  }
  const isConnectionKeepAlive = options.headers['Connection'] == undefined || options.headers['Connection'] === 'keep-alive';
  const needDecompress = options.headers['Accept-Encoding'] === undefined || options.headers['Accept-Encoding'] === 'gzip, deflate, br';
  const gotOptions: Omit<OptionsInit, 'isStream'>  = ({
    url: options.url,
    method: options.method,
    signal: abortController.signal,
    allowGetBody: true,
    decompress: needDecompress ? true : false,
    agent: {
      http: new http.Agent({ keepAlive: isConnectionKeepAlive }),
      http2: new http2.Agent({ keepAlive: isConnectionKeepAlive }),
    },
    body: (isFormDataBody && reqeustBody) ? reqeustBody : (options.body as string),
    headers,
    hooks: {
      beforeError: [(error: RequestError) => {
        console.log('beforeError', error)
        options.beforeError(error)
        return Promise.reject(error)
      }],
      beforeRedirect: [(updatedOptions: Options, plainResponse: PlainResponse) => {
        options.beforeRedirect(updatedOptions, plainResponse)
      }],
      beforeRequest: [(reqeustOptions: Options) => {
        options.beforeRequest(JSON.parse(JSON.stringify(reqeustOptions)))
      }],
      beforeRetry: [(error: RequestError, retryCount: number) => {
        options.beforeRetry(error, retryCount)
      }],
    }
  });

  //取消请求
  options.signal(abortController.abort)
  console.log("gotOptions", options)
  const requestStream = got.stream(gotOptions);
  // const streamData: Buffer[] = [];
  // let streamSize = 0;
  // const responseInfo = generateEmptyResponse()
  // requestStream.on("response", (response: PlainResponse) => {
  //   responseInfo.headers = response.headers;
  //   responseInfo.contentType = response.headers['content-type'] || '';
  //   responseInfo.body = response.body,
  //   responseInfo.finalRequestUrl = response.url;
  //   responseInfo.originRequestUrl = response.requestUrl;
  //   responseInfo.ip = response.ip || '';
  //   responseInfo.isFromCache = response.isFromCache;
  //   responseInfo.redirectUrls = response.redirectUrls;
  //   responseInfo.timings = response.timings;
  //   responseInfo.retryCount = response.retryCount;
  //   responseInfo.statusCode = response.statusCode;
  //   console.log(response)
  //   options.onResponse?.(responseInfo);
  // });
  // requestStream.on("data", (chunk: Buffer) => {
  //   streamData.push(Buffer.from(chunk));
  //   streamSize += chunk.length;
  // });
  // requestStream.on("end", async () => {
  //   const bufData = Buffer.concat(streamData, streamSize);
  //   const fileTypeResult = await fileTypeFromBuffer(bufData.buffer);
  //   responseInfo.bodySize = bufData.length;
  //   let mimeType = 'unknown';
  //   if (fileTypeResult) {
  //     mimeType = fileTypeResult.mime
  //     responseInfo.mimeType = fileTypeResult.mime
  //   }
  //   if (!mimeType && responseInfo.contentType) {
  //     mimeType = responseInfo.contentType;
  //   }
  //   const textMimes = ["text/", "application/json", "application/javascript", "application/xml"];
  //   const imageMimes = ["image/"];
  //   const zipMimes = ['application/zip', 'application/x-tar', 'application/x-rar-compressed', 'application/gzip', 'application/x-bzip2', 'application/x-7z-compressed'];
  //   const wordMimes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
  //   const excelMimes = ['application/vnd.ms-excel', 'application/vnd.oasis.opendocument.spreadsheet'];
  //   const pptMimes = ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
  //   responseInfo.body = bufData;
  //   if (textMimes.find(mime => mimeType.match(mime))) {
  //     responseInfo.dataType = 'text';
  //     responseInfo.body = bufData.toString()
  //   } else if (imageMimes.find(mime => mimeType.match(mime))) {
  //     responseInfo.dataType = 'image';
  //   } else if (zipMimes.find(mime => mimeType.match(mime))) {
  //     responseInfo.dataType = 'zip';
  //   } else if (wordMimes.find(mime => mimeType.match(mime))) {
  //     responseInfo.dataType = 'word';
  //   } else if (excelMimes.find(mime => mimeType.match(mime))) {
  //     responseInfo.dataType = 'excel';
  //   } else if (pptMimes.find(mime => mimeType.match(mime))) {
  //     responseInfo.dataType = 'ppt';
  //   }
  // });
  // requestStream.on("error", (error) => {
  //   console.error(error)
  // });
}