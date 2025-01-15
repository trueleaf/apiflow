
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
import { generateEmptyResponse } from './utils';
import { Buffer } from 'node:buffer';

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
  try {
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
      throwHttpErrors: false,
      hooks: {
        beforeError: [(error: RequestError) => {
          options.onError(error)
          return Promise.reject(error)
        }],
        beforeRedirect: [(updatedOptions: Options, plainResponse: PlainResponse) => {
          options.beforeRedirect(updatedOptions, plainResponse)
        }],
        beforeRequest: [(reqeustOptions: Options) => {
          options.beforeRequest?.(JSON.parse(JSON.stringify(reqeustOptions)))
        }],
        beforeRetry: [(error: RequestError, retryCount: number) => {
          options.beforeRetry?.(error, retryCount)
        }],
      }
    });
    //取消请求
    options.signal(abortController.abort)
    console.log("gotOptions", options)
    const requestStream = got.stream(gotOptions);
    const bufferList: Buffer[] = [];
    let streamByteLength = 0;
    let contentLength = 0;
    const responseInfo = generateEmptyResponse();
   
    requestStream.on("response", (response: PlainResponse) => {
      const contentLengthStr = response.headers['content-length'] ?? '0';
      contentLength = isNaN(parseInt(contentLengthStr)) ? 0 : parseInt(contentLengthStr)
      responseInfo.headers = response.headers;
      responseInfo.contentType = response.headers['content-type'] ?? '';
      responseInfo.contentLength = contentLength;
      responseInfo.body = response.body,
      responseInfo.finalRequestUrl = response.url;
      responseInfo.ip = response.ip || '';
      responseInfo.isFromCache = response.isFromCache;
      responseInfo.redirectUrls = response.redirectUrls;
      responseInfo.timings = response.timings;
      responseInfo.retryCount = response.retryCount;
      responseInfo.statusCode = response.statusCode;
      options.onResponse?.(responseInfo);
    });
    requestStream.on("data", (chunk: Buffer) => {
      bufferList.push(chunk);
      streamByteLength += chunk.byteLength;
      options.onResponseData?.(streamByteLength, contentLength);
    });
    requestStream.on("end", async () => {
      const endTime = responseInfo.timings.end ?? 0;
      const startTime = responseInfo.timings.start ?? 0;
      const rt = endTime - startTime;
      responseInfo.rt = rt;
      const bufferData = Buffer.concat(bufferList as Uint8Array[]);
      const fileTypeInfo = await fileTypeFromBuffer(bufferData.buffer as ArrayBuffer);
      responseInfo.bodyByteLength = bufferData.byteLength;
      responseInfo.body = bufferData
      const isTextData = !fileTypeInfo; // 无法解析mimeType数据都当作文本展示
      if (isTextData && responseInfo.contentType.includes('application/json')) {
        responseInfo.responseData.canApiflowParseType = 'json';
        responseInfo.responseData.jsonData = bufferData.toString();
      } else if (isTextData && responseInfo.contentType.includes('application/xml')) {
        responseInfo.responseData.canApiflowParseType = 'xml';
        responseInfo.responseData.textData = bufferData.toString();
      } else if (isTextData && responseInfo.contentType.includes('text/html')) {
        responseInfo.responseData.canApiflowParseType = 'html';
        responseInfo.responseData.textData = bufferData.toString();
      } else if (isTextData && responseInfo.contentType.includes('application/css')) {
        responseInfo.responseData.canApiflowParseType = 'css';
        responseInfo.responseData.textData = bufferData.toString();
      } else if (isTextData && responseInfo.contentType.includes('application/javascript')) {
        responseInfo.responseData.canApiflowParseType = 'js';
        responseInfo.responseData.textData = bufferData.toString();
      } else if (isTextData && responseInfo.contentType.includes('text/')) {
        responseInfo.responseData.canApiflowParseType = 'text';
        responseInfo.responseData.textData = bufferData.toString();
      } else if (!isTextData && fileTypeInfo.mime.includes('image/')) {
        const blob = new Blob([bufferData], { type: fileTypeInfo.mime });
        const blobUrl = URL.createObjectURL(blob);
        responseInfo.responseData.canApiflowParseType = 'image';
        responseInfo.responseData.fileData.url = blobUrl;
      } else if (!isTextData && fileTypeInfo.mime.includes('application/pdf')) {
        responseInfo.responseData.canApiflowParseType = 'pdf';
        responseInfo.responseData.fileData.url = bufferData.toString('base64');
      }
      // let mimeType = 'unknown';
      // if (fileTypeInfo) {
      //   mimeType = fileTypeInfo.mime
      //   responseInfo.mimeType = fileTypeInfo.mime
      // }
      // if (!mimeType && responseInfo.contentType) {
      //   mimeType = responseInfo.contentType;
      // }
      // const textMimes = ["text/", "application/json", "application/javascript", "application/xml"];
      // const imageMimes = ["image/"];
      // const zipMimes = ['application/zip', 'application/x-tar', 'application/x-rar-compressed', 'application/gzip', 'application/x-bzip2', 'application/x-7z-compressed'];
      // const wordMimes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      // const excelMimes = ['application/vnd.ms-excel', 'application/vnd.oasis.opendocument.spreadsheet'];
      // const pptMimes = ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
      // responseInfo.body = bufData;
      // if (textMimes.find(mime => mimeType.match(mime))) {
      //   responseInfo.dataType = 'text';
      //   responseInfo.body = bufData.toString()
      // } else if (imageMimes.find(mime => mimeType.match(mime))) {
      //   responseInfo.dataType = 'image';
      // } else if (zipMimes.find(mime => mimeType.match(mime))) {
      //   responseInfo.dataType = 'zip';
      // } else if (wordMimes.find(mime => mimeType.match(mime))) {
      //   responseInfo.dataType = 'word';
      // } else if (excelMimes.find(mime => mimeType.match(mime))) {
      //   responseInfo.dataType = 'excel';
      // } else if (pptMimes.find(mime => mimeType.match(mime))) {
      //   responseInfo.dataType = 'ppt';
      // }
      options.onResponseEnd?.(responseInfo);
    });
    requestStream.once("error", (error) => {
      options.onError(error as Error);
    });
  } catch (error) {
    options.onError(error as Error)
  }

}