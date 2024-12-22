
import {
  CustomRequestInfo,
  FlowNode,
  GotRequestOptions,
  SendRequestOptions
} from '@/../types/types';
import got, { Options } from 'got';
import type { OptionsInit, Method, PlainResponse, RequestError } from 'got'
import json5 from 'json5';
import type FormData from "form-data"
import { fileTypeFromBuffer } from 'file-type';
import {
  getQueryStringFromQueryParams,
  convertTemplateValueToRealValue,
  convertPropertyToObject,
  generateEmptyResponse
} from '../utils/utils';




const getFullUrl = (params: CustomRequestInfo, globalVariables: Record<string, any>) => {
  const queryString = getQueryStringFromQueryParams(params.queryParams, globalVariables);
  const pathString = convertPathParamsToPathString(params.paths, globalVariables);
  const convertedUrl = convertTemplateValueToRealValue(params.url, globalVariables).toString().replace(/(\/*)$/, '');
  return `${convertedUrl}${pathString ? `/${pathString}` : ''}${queryString ? `/${queryString}` : ''}`;
};
const getHeaders = (params: CustomRequestInfo, globalVariables: Record<string, any>) => {
  const userSetHeaders = convertPropertyToObject(params.headers, globalVariables);
  const autoSetHeaders: Record<string, string> = {};
  const hasUserSetContentType = Object.keys(userSetHeaders).find(headerKey => {
    return headerKey.toLocaleLowerCase().includes('content-type') || headerKey.toLocaleLowerCase().includes('contentType');
  })
  if (!hasUserSetContentType) {
    autoSetHeaders['content-type'] = params.contentType
  }
  return Object.assign(autoSetHeaders, userSetHeaders);
};
const getBody = (params: CustomRequestInfo, globalVariables: Record<string, any>): string | FormData => {
  if (params.contentType.includes('application/json')) {
    const numberMap: Record<string, string> = {};
    const convertBody = params.requestBody.rawJson.replace(/("\s*:\s*)(\d{14,})/g, (_, $1, $2) => {
      numberMap[$2] = $2;
      return `${$1}"${$2}"`;
    });
    try {
      return JSON.stringify(json5.parse(convertBody || "null", (_: string, value: any) => {
        if (!value) {
          return value;
        }
        if (typeof value === 'string') {
          return convertTemplateValueToRealValue(value, globalVariables);
        }
        return value;
      }));
    } catch (error) {
      console.error(error);
      return "";
    }
  }
  return ''
}

const gotInstance = got.extend({
  timeout: {
    request: 60000, // 60s
  },
  allowGetBody: true,
  retry: {
    limit: 0,
  },
});
export const sendRequest = (requestNode: FlowNode, options: SendRequestOptions) => {
  return new Promise((resolve, reject) => {
    const responseInfo = generateEmptyResponse()
    try {
      const { validVariables } = options;
      const { requestInfo } = requestNode.api;
      const method = requestInfo.method as Method;
      const url = getFullUrl(requestInfo, validVariables);
      const headers = getHeaders(requestInfo, validVariables);
      const body = getBody(requestInfo, validVariables);
      const requestStream = gotInstance(url, {
        isStream: true,
        method,
        headers,
        body
      });
      const streamData: Buffer[] = [];
      let streamSize = 0;
      requestStream.on("response", (response: PlainResponse) => {
        responseInfo.headers = response.headers;
        responseInfo.contentType = response.headers['content-type'] || '';
        responseInfo.body = response.body,
          responseInfo.finalRequestUrl = response.url;
        responseInfo.originRequestUrl = response.requestUrl;
        responseInfo.ip = response.ip || '';
        responseInfo.isFromCache = response.isFromCache;
        responseInfo.redirectUrls = response.redirectUrls;
        responseInfo.timings = response.timings;
        responseInfo.retryCount = response.retryCount;
        responseInfo.statusCode = response.statusCode;
      });
      requestStream.on("data", (chunk: Buffer) => {
        streamData.push(Buffer.from(chunk));
        streamSize += chunk.length;
      });
      requestStream.on("end", async () => {
        const bufData = Buffer.concat(streamData, streamSize);
        const fileTypeResult = await fileTypeFromBuffer(bufData.buffer);
        responseInfo.bodySize = bufData.length;
        let mimeType = 'unknown';
        if (fileTypeResult) {
          mimeType = fileTypeResult.mime
          responseInfo.mimeType = fileTypeResult.mime
        }
        if (!mimeType && responseInfo.contentType) {
          mimeType = responseInfo.contentType;
        }
        const textMimes = ["text/", "application/json", "application/javascript", "application/xml"];
        const imageMimes = ["image/"];
        const zipMimes = ['application/zip', 'application/x-tar', 'application/x-rar-compressed', 'application/gzip', 'application/x-bzip2', 'application/x-7z-compressed'];
        const wordMimes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
        const excelMimes = ['application/vnd.ms-excel', 'application/vnd.oasis.opendocument.spreadsheet'];
        const pptMimes = ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
        responseInfo.body = bufData;
        if (textMimes.find(mime => mimeType.match(mime))) {
          responseInfo.dataType = 'text';
          responseInfo.body = bufData.toString()
        } else if (imageMimes.find(mime => mimeType.match(mime))) {
          responseInfo.dataType = 'image';
        } else if (zipMimes.find(mime => mimeType.match(mime))) {
          responseInfo.dataType = 'zip';
        } else if (wordMimes.find(mime => mimeType.match(mime))) {
          responseInfo.dataType = 'word';
        } else if (excelMimes.find(mime => mimeType.match(mime))) {
          responseInfo.dataType = 'excel';
        } else if (pptMimes.find(mime => mimeType.match(mime))) {
          responseInfo.dataType = 'ppt';
        }
        resolve(responseInfo)
      });
      requestStream.on("error", (error) => {
        reject(error)
      });
    } catch (error) {
      reject(error)
    }
  })
}



export const gotRequest = (options: GotRequestOptions) => {
  const abortController = new AbortController();
  const gotOptions: Omit<OptionsInit, 'isStream'>  = ({
    url: options.url,
    method: options.method,
    signal: abortController.signal,
    allowGetBody: true,
    body: options.body,
    headers: {
      'user-agent': "xxx",
    },
    hooks: {
      beforeError: [(error: RequestError) => {
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
  // console.log("gotOptions", gotOptions)
  const requestStream = got.stream(gotOptions);
  const streamData: Buffer[] = [];
  let streamSize = 0;
  const responseInfo = generateEmptyResponse()
  requestStream.on("response", (response: PlainResponse) => {
    responseInfo.headers = response.headers;
    responseInfo.contentType = response.headers['content-type'] || '';
    responseInfo.body = response.body,
    responseInfo.finalRequestUrl = response.url;
    responseInfo.originRequestUrl = response.requestUrl;
    responseInfo.ip = response.ip || '';
    responseInfo.isFromCache = response.isFromCache;
    responseInfo.redirectUrls = response.redirectUrls;
    responseInfo.timings = response.timings;
    responseInfo.retryCount = response.retryCount;
    responseInfo.statusCode = response.statusCode;
    console.log(response)
    options.onResponse?.(responseInfo);
  });
  requestStream.on("data", (chunk: Buffer) => {
    streamData.push(Buffer.from(chunk));
    streamSize += chunk.length;
  });
  requestStream.on("end", async () => {
    const bufData = Buffer.concat(streamData, streamSize);
    const fileTypeResult = await fileTypeFromBuffer(bufData.buffer);
    responseInfo.bodySize = bufData.length;
    let mimeType = 'unknown';
    if (fileTypeResult) {
      mimeType = fileTypeResult.mime
      responseInfo.mimeType = fileTypeResult.mime
    }
    if (!mimeType && responseInfo.contentType) {
      mimeType = responseInfo.contentType;
    }
    const textMimes = ["text/", "application/json", "application/javascript", "application/xml"];
    const imageMimes = ["image/"];
    const zipMimes = ['application/zip', 'application/x-tar', 'application/x-rar-compressed', 'application/gzip', 'application/x-bzip2', 'application/x-7z-compressed'];
    const wordMimes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const excelMimes = ['application/vnd.ms-excel', 'application/vnd.oasis.opendocument.spreadsheet'];
    const pptMimes = ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
    responseInfo.body = bufData;
    if (textMimes.find(mime => mimeType.match(mime))) {
      responseInfo.dataType = 'text';
      responseInfo.body = bufData.toString()
    } else if (imageMimes.find(mime => mimeType.match(mime))) {
      responseInfo.dataType = 'image';
    } else if (zipMimes.find(mime => mimeType.match(mime))) {
      responseInfo.dataType = 'zip';
    } else if (wordMimes.find(mime => mimeType.match(mime))) {
      responseInfo.dataType = 'word';
    } else if (excelMimes.find(mime => mimeType.match(mime))) {
      responseInfo.dataType = 'excel';
    } else if (pptMimes.find(mime => mimeType.match(mime))) {
      responseInfo.dataType = 'ppt';
    }
  });
  requestStream.on("error", (error) => {
    console.error(error)
  });
}