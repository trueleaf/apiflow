import {
  GotRequestBinaryBody,
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
import { config } from '../config/config';

/*
|--------------------------------------------------------------------------
| 工具函数
|--------------------------------------------------------------------------
*/

// 从响应头中提取文件名
const getFileNameFromHeaders = (headers: Record<string, string | string[] | undefined>, fileTypeInfo: any, defaultExt: string): string => {
  const contentDisposition = headers['content-disposition'];
  if (contentDisposition) {
    const dispositionStr = Array.isArray(contentDisposition) ? contentDisposition[0] : contentDisposition;
    const match = dispositionStr.match(/filename="?([^";]*)"?/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }
  
  // 如果没有从响应头获取到文件名，则生成默认文件名
  const timestamp = Date.now();
  const ext = fileTypeInfo?.ext || defaultExt;
  return `download_${timestamp}.${ext}`;
};

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
      fullMsg: path ? `文件${path}在磁盘上未找到，发送被终止` : 'body类型为binary,请选择文件后再发起请求'
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
    const isFormDataBody = options.body?.type === 'formdata';
    const isBinaryBody = options.body?.type === 'binary';
    if (isFormDataBody) {
      reqeustBody = await getFormDataFromRendererFormData(options.body!.value as RendererFormDataBody);
      if (!(reqeustBody instanceof FormData)) {
        options.onReadFileFormDataError?.(reqeustBody);
        return
      }
      responseInfo.requestData.body = reqeustBody.getBuffer().toString();
    } else if (isBinaryBody) {
      const { value } = options.body as GotRequestBinaryBody
      reqeustBody = await getFileBufferByPath(value.path) as Buffer;
      if (!Buffer.isBuffer(reqeustBody)) {
        options.onReadBinaryDataError?.(reqeustBody);
        return
      }
      responseInfo.requestData.body = reqeustBody.toString();
    } else if (options.body) {
      responseInfo.requestData.body = options.body.value as string;
    }

    //更user-agent,accept-encoding和accept，不能放在for循环后面，否则参数勾选将无效
    headers['user-agent'] = options.headers['user-agent'] ?? config.requestConfig.userAgent;
    headers['accept'] = options.headers['accept'] ?? '*/*';
    headers['accept-encoding'] = options.headers['accept-encoding'] ?? 'gzip, deflate, br';
    //更新请求头信息
    for (const key in options.headers) {
      if (options.headers[key.toLowerCase()] === null) { //undefined代表未设置值，null代表取消发送
        headers[key.toLowerCase()] = undefined
      } else if (isFormDataBody && key === 'content-type') {
        headers[key.toLowerCase()] = (reqeustBody as FormData)?.getHeaders()['content-type'];
      } else if (isBinaryBody && key === 'content-type') {
        const fileTypeInfo = await fileTypeFromBuffer(reqeustBody as Buffer);
        if (fileTypeInfo?.mime) {
          headers[key.toLowerCase()] = fileTypeInfo.mime;
        } else {
          headers[key.toLowerCase()] = options.headers[key.toLowerCase()]!;
        }
      } else {
        headers[key.toLowerCase()] = options.headers[key.toLowerCase()]!;
      }
    }
    // undefined代表未设置值，null代表取消发送
    const isConnectionKeepAlive = options.headers['Connection'] == undefined || options.headers['Connection'] === 'keep-alive';
    const hasFormData = isFormDataBody && (options.body!.value as RendererFormDataBody).some(item => (item.key));
    let willSendBody: undefined | string | FormData | Buffer = '';
    if (options.method.toLowerCase() === 'head') { //只有head请求body值为undefined,head请求不挟带body
      willSendBody = undefined
    } else if (isFormDataBody && reqeustBody instanceof FormData && hasFormData) {
      willSendBody = reqeustBody
    } else if (isFormDataBody && !hasFormData) {
      willSendBody = ''
    } else if (isBinaryBody) {
      willSendBody = reqeustBody as Buffer;
    } else if (options.body) {
      willSendBody = options.body.value as string;
    }
    // console.log(willSendBody, headers, hasFormData)
    const gotOptions: Omit<OptionsInit, 'isStream'>  = ({
      url: options.url,
      method: options.method,
      signal: abortController.signal,
      allowGetBody: true,
      agent: {
        http: new http.Agent({ keepAlive: isConnectionKeepAlive }),
        http2: new http2.Agent({ keepAlive: isConnectionKeepAlive }),
      },
      body: willSendBody,
      headers,
      followRedirect: config.requestConfig.followRedirect,
      maxRedirects: config.requestConfig.maxRedirects,
      throwHttpErrors: false,
      hooks: {
        beforeError: [(error: RequestError) => {
          options.onError(error)
          return Promise.reject(error)
        }],
        beforeRedirect: [(updatedOptions: Options, plainResponse: PlainResponse) => {
          options.beforeRedirect({
            plainResponse,
            requestHeaders: updatedOptions.headers,
            method: updatedOptions.method,
          })
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
      const host = req.getHeader('host');
      const path = req.path;
      const fullUrl = `${req.protocol}//${host}${path === '/' ? '' : path}`;
      responseInfo.requestData.url = fullUrl;
      responseInfo.requestData.method = req.method;
      responseInfo.requestData.headers = req.getHeaders();
      responseInfo.requestData.host = req.host;
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
      } else if (responseInfo.contentType.includes('text/csv')) {
        responseInfo.responseData.canApiflowParseType = 'csv';
      } else if (responseInfo.contentType.includes('application/javascript')) {
        responseInfo.responseData.canApiflowParseType = 'js';
      } else if (responseInfo.contentType.includes('text/')) {
        responseInfo.responseData.canApiflowParseType = 'text';
      } else if (responseInfo.contentType.includes('image/')) {
        responseInfo.responseData.canApiflowParseType = 'image';
      } else if (
        responseInfo.contentType.includes('application/zip') ||
        responseInfo.contentType.includes('application/x-zip-compressed') ||
        responseInfo.contentType.includes('application/x-tar') ||
        responseInfo.contentType.includes('application/x-rar-compressed') ||
        responseInfo.contentType.includes('application/x-7z-compressed') ||
        responseInfo.contentType.includes('application/x-7z') ||
        responseInfo.contentType.includes('application/x-compressed') ||
        responseInfo.contentType.includes('application/x-gtar')
      ) {
        responseInfo.responseData.canApiflowParseType = 'archive';
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
      const noFileType = !fileTypeInfo;
      const contentTypeIsPdf = responseInfo.contentType.includes('application/pdf');
      const contentTypeIsExcel = (responseInfo.contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || responseInfo.contentType.includes('application/vnd.ms-excel'));
      const contentTypeIsWord = (responseInfo.contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || responseInfo.contentType.includes('application/msword'));
      const contentTypeIsXml = responseInfo.contentType.includes('application/xml')
      const contentTypeIsPpt = (responseInfo.contentType.includes('application/vnd.ms-powerpoint') || responseInfo.contentType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation'))
      const contentTypeIsVideo = responseInfo.contentType.includes('video/')
      const contentTypeIsAudio = responseInfo.contentType.includes('audio/')
      const contentTypeIsImage = responseInfo.contentType.includes('image/')
      const contentTypeIsArchive = responseInfo.contentType.includes('application/zip') ||  
        responseInfo.contentType.includes('application/zip') ||
        responseInfo.contentType.includes('application/x-zip-compressed') ||
        responseInfo.contentType.includes('application/x-tar') ||
        responseInfo.contentType.includes('application/x-rar-compressed') ||
        responseInfo.contentType.includes('application/x-7z-compressed') ||
        responseInfo.contentType.includes('application/x-7z') ||
        responseInfo.contentType.includes('application/x-compressed') ||
        responseInfo.contentType.includes('application/x-gtar');
      const contentTypeIsExe = responseInfo.contentType.includes('application/x-msdownload');
      const contentTypeIsEpub = responseInfo.contentType.includes('application/epub+zip') || responseInfo.contentType.includes('application/x-epub+zip');

      const responseAsPdf = contentTypeIsPdf || fileTypeInfo?.mime?.includes('application/pdf');
      const responseAsExcel = contentTypeIsExcel || fileTypeInfo?.mime?.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || fileTypeInfo?.mime?.includes('application/vnd.ms-excel')
      const responseAsWord = contentTypeIsWord || (fileTypeInfo?.mime?.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || fileTypeInfo?.mime?.includes('application/msword'))
      const responseAsXml = contentTypeIsXml || fileTypeInfo?.mime?.includes('application/xml') || fileTypeInfo?.mime?.includes('text/xml');
      const responseAsPPT = contentTypeIsPpt || fileTypeInfo?.mime?.includes('application/vnd.ms-powerpoint') || fileTypeInfo?.mime?.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')
      const responseAsVideo = contentTypeIsVideo || fileTypeInfo?.mime?.includes('video/');
      const responseAsAudio = contentTypeIsAudio || fileTypeInfo?.mime?.includes('audio/');
      const responseAsImage = contentTypeIsImage || fileTypeInfo?.mime?.includes('image/');
      const responseAsArchive = contentTypeIsArchive || fileTypeInfo?.mime?.includes('application/zip') ||
        fileTypeInfo?.mime?.includes('application/zip') ||
        fileTypeInfo?.mime?.includes('application/x-zip-compressed') ||
        fileTypeInfo?.mime?.includes('application/x-tar') ||
        fileTypeInfo?.mime?.includes('application/x-rar-compressed') ||
        fileTypeInfo?.mime?.includes('application/x-7z-compressed') ||
        fileTypeInfo?.mime?.includes('application/x-7z') ||
        fileTypeInfo?.mime?.includes('application/x-compressed') ||
        fileTypeInfo?.mime?.includes('application/x-gtar');
      const responseAsExe = contentTypeIsExe || fileTypeInfo?.mime?.includes('application/x-msdownload');
      const responseAsEpub = contentTypeIsEpub || fileTypeInfo?.mime?.includes('application/epub') || fileTypeInfo?.mime?.includes('application/x-epub');
      const responseAsForceDownload = responseInfo.contentType.includes('application/force-download') || responseInfo.contentType.includes('application/octet-stream');
      if (noFileType && responseInfo.contentType.includes('application/json')) {
        responseInfo.responseData.canApiflowParseType = 'json';
        responseInfo.responseData.jsonData = bufferData.toString();
      } else if (noFileType && responseInfo.contentType.includes('text/html')) {
        responseInfo.responseData.canApiflowParseType = 'html';
        responseInfo.responseData.textData = bufferData.toString('utf-8');
      } else if (noFileType && responseInfo.contentType.includes('text/css')) {
        responseInfo.responseData.canApiflowParseType = 'css';
        responseInfo.responseData.textData = bufferData.toString();
      } else if (noFileType && responseInfo.contentType.includes('text/csv')) {
        responseInfo.responseData.canApiflowParseType = 'csv';
        responseInfo.responseData.textData = bufferData.toString();
      } else if (noFileType && responseInfo.contentType.includes('application/javascript')) {
        responseInfo.responseData.canApiflowParseType = 'js';
        responseInfo.responseData.textData = bufferData.toString();
      } else if (noFileType && responseInfo.contentType.includes('text/')) {
        responseInfo.responseData.canApiflowParseType = 'text';
        responseInfo.responseData.textData = bufferData.toString();
      } else if (responseAsImage) {
        const blob = new Blob([bufferData], { type: fileTypeInfo?.mime ?? responseInfo.contentType });
        const blobUrl = URL.createObjectURL(blob);
        const fileName = getFileNameFromHeaders(responseInfo.headers, fileTypeInfo, 'jpg');
        responseInfo.responseData.canApiflowParseType = 'image';
        responseInfo.responseData.fileData.url = blobUrl;
        responseInfo.responseData.fileData.name = fileName;
        responseInfo.responseData.fileData.ext = fileTypeInfo?.ext || '';
      } else if (responseAsPdf) {
        const blob = new Blob([bufferData], { type: fileTypeInfo?.mime ?? 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        const fileName = getFileNameFromHeaders(responseInfo.headers, fileTypeInfo, 'pdf');
        responseInfo.responseData.fileData.url = blobUrl;
        responseInfo.responseData.fileData.name = fileName;
        responseInfo.responseData.fileData.ext = fileTypeInfo?.ext || 'pdf';
        responseInfo.responseData.canApiflowParseType = 'pdf';
      } else if (responseAsExcel) {
        const blob = new Blob([bufferData], { type: fileTypeInfo?.mime ?? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const blobUrl = URL.createObjectURL(blob);
        const fileName = getFileNameFromHeaders(responseInfo.headers, fileTypeInfo, 'xlsx');
        responseInfo.responseData.fileData.url = blobUrl;
        responseInfo.responseData.fileData.name = fileName;
        responseInfo.responseData.fileData.ext = fileTypeInfo?.ext || 'xlsx';
        responseInfo.responseData.canApiflowParseType = 'excel';
      } else if (responseAsWord) {
        const blob = new Blob([bufferData], { type: fileTypeInfo?.mime ?? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const blobUrl = URL.createObjectURL(blob);
        const fileName = getFileNameFromHeaders(responseInfo.headers, fileTypeInfo, 'docx');
        responseInfo.responseData.fileData.url = blobUrl;
        responseInfo.responseData.fileData.name = fileName;
        responseInfo.responseData.fileData.ext = fileTypeInfo?.ext || 'docx';
        responseInfo.responseData.canApiflowParseType = 'word';
      } else if (responseAsPPT) {
        const blob = new Blob([bufferData], { type: fileTypeInfo?.mime ?? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
        const blobUrl = URL.createObjectURL(blob);
        const fileName = getFileNameFromHeaders(responseInfo.headers, fileTypeInfo, 'pptx');
        responseInfo.responseData.fileData.url = blobUrl;
        responseInfo.responseData.fileData.name = fileName;
        responseInfo.responseData.fileData.ext = fileTypeInfo?.ext || 'pptx';
        responseInfo.responseData.canApiflowParseType = 'ppt';
      } else if (responseAsXml) {
        responseInfo.responseData.canApiflowParseType = 'xml';
        responseInfo.responseData.textData = bufferData.toString();
      } else if (responseAsVideo) {
        const blob = new Blob([bufferData], { type: fileTypeInfo?.mime ?? 'video/mp4' });
        const blobUrl = URL.createObjectURL(blob);
        const fileName = getFileNameFromHeaders(responseInfo.headers, fileTypeInfo, 'mp4');
        responseInfo.responseData.fileData.url = blobUrl;
        responseInfo.responseData.fileData.name = fileName;
        responseInfo.responseData.fileData.ext = fileTypeInfo?.ext || 'mp4';
        responseInfo.responseData.canApiflowParseType = 'video';
      } else if (responseAsAudio) {
        const blob = new Blob([bufferData], { type: fileTypeInfo?.mime ?? 'audio/mpeg' });
        const blobUrl = URL.createObjectURL(blob);
        const fileName = getFileNameFromHeaders(responseInfo.headers, fileTypeInfo, 'mp3');
        responseInfo.responseData.fileData.url = blobUrl;
        responseInfo.responseData.fileData.name = fileName;
        responseInfo.responseData.fileData.ext = fileTypeInfo?.ext || 'mp3';
        responseInfo.responseData.canApiflowParseType = 'audio';
      } else if (responseAsArchive) {
        const blob = new Blob([bufferData], { type: fileTypeInfo?.mime ?? 'application/zip' });
        const blobUrl = URL.createObjectURL(blob);
        const fileName = getFileNameFromHeaders(responseInfo.headers, fileTypeInfo, 'zip');
        responseInfo.responseData.fileData.url = blobUrl;
        responseInfo.responseData.fileData.name = fileName;
        responseInfo.responseData.fileData.ext = fileTypeInfo?.ext || 'zip';
        responseInfo.responseData.canApiflowParseType = 'archive';
      } else if (responseAsExe) {
        const blob = new Blob([bufferData], { type: fileTypeInfo?.mime ?? 'application/x-msdownload' });
        const blobUrl = URL.createObjectURL(blob);
        const fileName = getFileNameFromHeaders(responseInfo.headers, fileTypeInfo, 'exe');
        responseInfo.responseData.fileData.url = blobUrl;
        responseInfo.responseData.fileData.name = fileName;
        responseInfo.responseData.fileData.ext = fileTypeInfo?.ext || 'exe';
        responseInfo.responseData.canApiflowParseType = 'exe';
      } else if (responseAsEpub) {
        const blob = new Blob([bufferData], { type: fileTypeInfo?.mime ?? 'application/epub+zip' });
        const blobUrl = URL.createObjectURL(blob);
        const fileName = getFileNameFromHeaders(responseInfo.headers, fileTypeInfo, 'epub');
        responseInfo.responseData.fileData.url = blobUrl;
        responseInfo.responseData.fileData.name = fileName;
        responseInfo.responseData.fileData.ext = fileTypeInfo?.ext || 'epub';
        responseInfo.responseData.canApiflowParseType = 'epub';
      } else if (responseAsForceDownload) {
        responseInfo.responseData.canApiflowParseType = 'forceDownload';
        const blob = new Blob([bufferData], { type: responseInfo.contentType });
        const blobUrl = URL.createObjectURL(blob);
        const fileName = getFileNameFromHeaders(responseInfo.headers, fileTypeInfo, 'forceDownload');
        responseInfo.responseData.fileData.url = blobUrl;
        responseInfo.responseData.fileData.name = fileName;
        responseInfo.responseData.fileData.ext = fileTypeInfo?.ext || 'forceDownload';
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
