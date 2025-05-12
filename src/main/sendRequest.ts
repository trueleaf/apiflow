
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
import http, { ClientRequest } from 'node:http';
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
        return Promise.resolve({
          id,
          msg: '文件不存在(发送被终止)',
          fullMsg: `formData参数${key}对应的文件在磁盘上未找到，发送被终止`
        });
      }
      try {
        const fsStat = await fs.stat(value);
        if (!fsStat.isFile) {
          return Promise.resolve({
            id,
            msg: '不是文件无法读取(发送被终止)',
            fullMsg: `formData参数${key}对应的非文件类型文件，发送被终止`
          })
        }
        if (fsStat.size > 1024 * 1024 * 10) {
          return Promise.resolve({
            id,
            msg: '文件大小超过10MB(发送被终止)',
            fullMsg: `formData参数${key}对应的文件大小超过10MB，发送被终止，如需更改可以前往设置页面(ctrl+,)`
          })
        }
      } catch (error) {
        return Promise.resolve({
          id,
          msg: (error as Error).message,
          fullMsg: (error as Error).message,
        })
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
const getFileBufferByPath = async (path: string) => {
  try {
    await fs.access(path, fs.constants.F_OK)
  } catch {
    return Promise.resolve({
      msg: '文件不存在(发送被终止)',
      fullMsg: `文件${path}在磁盘上未找到，发送被终止`
    });
  }
  try {
    const fsStat = await fs.stat(path);
    if (!fsStat.isFile) {
      return Promise.resolve({
        msg: '不是文件无法读取(发送被终止)',
        fullMsg: `文件${path}对应的非文件类型文件，发送被终止`
      })
    }
    if (fsStat.size > 1024 * 1024 * 10) {
      return Promise.resolve({
        msg: '文件大小超过10MB(发送被终止)',
        fullMsg: `文件${path}大小超过10MB，发送被终止，如需更改可以前往设置页面(ctrl+,)`
      })
    }
    const buffer = await fs.readFile(path);
    return Promise.resolve(buffer);
  } catch (error) {
    return Promise.resolve({
      msg: (error as Error).message,
      fullMsg: (error as Error).message,
    })
  }
}

export const gotRequest = async (options: GotRequestOptions) => {
  try {
    const responseInfo = generateEmptyResponse();
    const abortController = new AbortController();
    let reqeustBody: FormData | {
      id: string,
      msg: string,
      fullMsg: string
    } | Buffer | null = null;
    const headers: Record<string, string | undefined> = {};
    //formData数据单独处理
    const isFormDataBody = Array.isArray(options.body);
    const isBinaryBody = (options.body as {
      type: "binary";
      path: string;
    })?.type === 'binary';
    if (isFormDataBody) {
      reqeustBody = await getFormDataFromRendererFormData(options.body as RendererFormDataBody);
      if (!(reqeustBody instanceof FormData)) {
        options.onReadFileFormDataError?.(reqeustBody);
        return
      }
      responseInfo.requestData.body = reqeustBody.getBuffer().toString();
    } else if (isBinaryBody) {
      const { path } = options.body as {
        type: "binary";
        path: string;
      };
      reqeustBody = await getFileBufferByPath(path) as Buffer;
      if (!Buffer.isBuffer(reqeustBody)) {
        options.onReadBinaryDataError?.(reqeustBody);
        return
      }
      responseInfo.requestData.body = reqeustBody.toString();
    } else if (options.body) {
      responseInfo.requestData.body = options.body as string;
    }
    //更新请求头信息
    for (const key in options.headers) {
      if (options.headers[key] === null) { //undefined代表未设置值，null代表取消发送
        headers[key] = undefined
      } else if (isFormDataBody && key === 'Content-Type') {
        headers[key] = (reqeustBody as FormData)?.getHeaders()['content-type'];
      } else if (isBinaryBody && key === 'Content-Type') {
        const fileTypeInfo = await fileTypeFromBuffer(reqeustBody as Buffer);
        if (fileTypeInfo?.mime) {
          headers[key] = fileTypeInfo.mime;
        } else {
          headers[key] = options.headers[key]
        }
      } else {
        headers[key] = options.headers[key]
      }
    }
    const isConnectionKeepAlive = options.headers['Connection'] == undefined || options.headers['Connection'] === 'keep-alive';
    const needDecompress = options.headers['Accept-Encoding'] === undefined || options.headers['Accept-Encoding'] === 'gzip, deflate, br';
    let willSendBody: undefined | string | FormData | Buffer = '';
    if (options.method.toLowerCase() === 'head') { //只有head请求body值为undefined,head请求不挟带body
      willSendBody = undefined
    } else if (isFormDataBody && reqeustBody instanceof FormData) {
      willSendBody = reqeustBody
    } else if (isBinaryBody) {
      willSendBody = reqeustBody as Buffer;
    } else if (options.body) {
      willSendBody = options.body as string;
    }
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
      body: willSendBody,
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

    // console.log("gotOptions", options)
    const requestStream = got.stream(gotOptions);
    const bufferList: Buffer[] = [];
    let streamByteLength = 0;
    let contentLength = 0;
    requestStream.on('request', (req: ClientRequest) => {
      responseInfo.requestData.url = `${req.protocol}//${req.path}`;
      responseInfo.requestData.method = req.method;
      responseInfo.requestData.headers = req.getHeaders();
    })
    requestStream.on("response", (response: PlainResponse) => {
      // console.log(reqeustBody?.getBuffer())
      // responseInfo.requestData.body = response.request.options.body;
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
      const contentTypeIsPdf = responseInfo.contentType.includes('application/pdf');
      const contentTypeIsExcel = (responseInfo.contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || responseInfo.contentType.includes('application/vnd.ms-excel'));
      const contentTypeIsWord = (responseInfo.contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || responseInfo.contentType.includes('application/msword'));
      
      if (responseInfo.contentType.includes('application/json')) {
        responseInfo.responseData.canApiflowParseType = 'json';
      } else if (responseInfo.contentType.includes('text/html')) {
        responseInfo.responseData.canApiflowParseType = 'html';
      } else if (responseInfo.contentType.includes('text/css')) {
        responseInfo.responseData.canApiflowParseType = 'css';
      } else if (responseInfo.contentType.includes('application/javascript')) {
        responseInfo.responseData.canApiflowParseType = 'js';
      } else if (responseInfo.contentType.includes('text/')) {
        responseInfo.responseData.canApiflowParseType = 'text';
      } else if (responseInfo.contentType.includes('image/')) {
        responseInfo.responseData.canApiflowParseType = 'image';
      } else if (contentTypeIsPdf) {
        responseInfo.responseData.canApiflowParseType = 'pdf';
      } else if (contentTypeIsExcel) {
        responseInfo.responseData.canApiflowParseType = 'excel';
      } else if (contentTypeIsWord) {
        responseInfo.responseData.canApiflowParseType = 'word';
      } else if (responseInfo.contentType.includes('application/xml')) {
        responseInfo.responseData.canApiflowParseType = 'xml';
      }
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
      const hasFileType = !fileTypeInfo;
      const contentTypeIsPdf = responseInfo.contentType.includes('application/pdf');
      const contentTypeIsExcel = (responseInfo.contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || responseInfo.contentType.includes('application/vnd.ms-excel'));
      const contentTypeIsWord = (responseInfo.contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || responseInfo.contentType.includes('application/msword'));
      const contentTypeIsXml = responseInfo.contentType.includes('application/xml')
      const contentTypeIsPpt = (responseInfo.contentType.includes('application/vnd.ms-powerpoint') || responseInfo.contentType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation'))
      const contentTypeIsVideo = responseInfo.contentType.includes('video/')
      const contentTypeIsImage = responseInfo.contentType.includes('image/')
      const responseAsPdf = contentTypeIsPdf || fileTypeInfo?.mime?.includes('application/pdf');
      const responseAsExcel = contentTypeIsExcel || fileTypeInfo?.mime?.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || fileTypeInfo?.mime?.includes('application/vnd.ms-excel')
      const responseAsWord = contentTypeIsWord || (fileTypeInfo?.mime?.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || fileTypeInfo?.mime?.includes('application/msword'))
      const responseAsXml = contentTypeIsXml || fileTypeInfo?.mime?.includes('application/xml');
      const responseAsPPT = contentTypeIsPpt || fileTypeInfo?.mime?.includes('application/vnd.ms-powerpoint') || fileTypeInfo?.mime?.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')
      const responseAsVideo = contentTypeIsVideo || fileTypeInfo?.mime?.includes('video/');
      const responseAsImage = contentTypeIsImage || fileTypeInfo?.mime?.includes('image/');
      if (hasFileType && responseInfo.contentType.includes('application/json')) {
        responseInfo.responseData.canApiflowParseType = 'json';
        responseInfo.responseData.jsonData = bufferData.toString();
      } else if (hasFileType && responseInfo.contentType.includes('text/html')) {
        responseInfo.responseData.canApiflowParseType = 'html';
        responseInfo.responseData.textData = bufferData.toString();
      } else if (hasFileType && responseInfo.contentType.includes('text/css')) {
        responseInfo.responseData.canApiflowParseType = 'css';
        responseInfo.responseData.textData = bufferData.toString();
      } else if (hasFileType && responseInfo.contentType.includes('application/javascript')) {
        responseInfo.responseData.canApiflowParseType = 'js';
        responseInfo.responseData.textData = bufferData.toString();
      } else if (hasFileType && responseInfo.contentType.includes('text/')) {
        responseInfo.responseData.canApiflowParseType = 'text';
        responseInfo.responseData.textData = bufferData.toString();
      } else if (responseAsImage) {
        const blob = new Blob([bufferData], { type: fileTypeInfo?.mime ?? responseInfo.contentType });
        const blobUrl = URL.createObjectURL(blob);
        responseInfo.responseData.canApiflowParseType = 'image';
        responseInfo.responseData.fileData.url = blobUrl;
      } else if (responseAsPdf) {
        const blob = new Blob([bufferData], { type: fileTypeInfo?.mime ?? 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        responseInfo.responseData.fileData.url = blobUrl;
        responseInfo.responseData.canApiflowParseType = 'pdf';
      } else if (responseAsExcel) {
        const blob = new Blob([bufferData], { type: fileTypeInfo?.mime ?? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const blobUrl = URL.createObjectURL(blob);
        responseInfo.responseData.fileData.url = blobUrl;
        responseInfo.responseData.canApiflowParseType = 'excel';
      } else if (responseAsWord) {
        const blob = new Blob([bufferData], { type: fileTypeInfo?.mime ?? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const blobUrl = URL.createObjectURL(blob);
        responseInfo.responseData.fileData.url = blobUrl;
        responseInfo.responseData.canApiflowParseType = 'word';
      } else if (responseAsPPT) {
        const blob = new Blob([bufferData], { type: fileTypeInfo?.mime ?? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const blobUrl = URL.createObjectURL(blob);
        responseInfo.responseData.fileData.url = blobUrl;
        responseInfo.responseData.canApiflowParseType = 'ppt';
      } else if (responseAsXml) {
        responseInfo.responseData.canApiflowParseType = 'xml';
        responseInfo.responseData.textData = bufferData.toString();
      } else if (responseAsVideo) {
        const blob = new Blob([bufferData], { type: fileTypeInfo?.mime ?? 'video/mp4' });
        const blobUrl = URL.createObjectURL(blob);
        responseInfo.responseData.fileData.url = blobUrl;
        responseInfo.responseData.canApiflowParseType = 'video';
      } else {
        responseInfo.responseData.canApiflowParseType = 'unknown';
        console.log(`无法解析的类型\nContentType值为${responseInfo.contentType} \n读取到的文件类型为=${JSON.stringify(fileTypeInfo)}`)
        responseInfo.responseData.textData = `无法解析的类型\nContentType值为${responseInfo.contentType} \n读取到的文件类型为=${JSON.stringify(fileTypeInfo)}`
      }
      options.onResponseEnd?.(responseInfo);
    });
    requestStream.once("error", (error) => {
      console.error(error);
      options.onError(error as Error);
    });
    //取消请求
    options.signal(() => {
      abortController.abort()
      requestStream.destroy();
    });
  } catch (error) {
    console.error(error)
    options.onError(error as Error)
  }

}