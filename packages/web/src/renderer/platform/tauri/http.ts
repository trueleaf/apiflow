import { Channel, invoke } from '@tauri-apps/api/core';
import { fileTypeFromBuffer } from 'file-type';
import { generateEmptyResponse } from '@/helper';
import { config } from '@src/config/config';
import { i18n } from '@/i18n';
import type { CanApiflowParseType, HttpRequestOptions, ResponseInfo } from '@src/types';
import type { DesktopHttpEvent, DesktopHttpRequest, DesktopResponseHead } from '@src/types/desktop';

// 转换为可跨进程传输的请求数据
export const createDesktopRequest = (options: HttpRequestOptions, requestId: string): DesktopHttpRequest => {
  const body = options.body;
  return {
    requestId, url: options.url, method: options.method, headers: options.headers, timeout: options.timeout,
    followRedirect: options.followRedirect ?? config.httpNodeConfig.followRedirect,
    maxRedirects: options.maxRedirects ?? config.httpNodeConfig.maxRedirects,
    maxSendFileSize: options.maxSendFileSize ?? config.httpNodeConfig.maxSendFileSize,
    body: !body ? null : body.type === 'formdata'
      ? { kind: body.type, fields: body.value.map(field => ({ ...field, kind: field.type })) }
      : body.type === 'binary' ? { kind: body.type, path: body.value.path }
        : { kind: body.type, text: body.value },
  };
};
// 保留多值 Cookie 响应头
const responseHeaders = (head: DesktopResponseHead): ResponseInfo['headers'] => Object.fromEntries(
  Object.entries(head.headers).map(([name, values]) => [name, name === 'set-cookie' ? values : values.join(', ')]),
);
// 按响应内容类型选择展示方式
const responseType = (contentType: string): CanApiflowParseType => {
  const mime = contentType.toLowerCase().split(';')[0].trim();
  if (mime === 'text/event-stream') return 'textEventStream';
  if (mime.includes('json')) return 'json';
  if (mime.includes('html')) return 'html';
  if (mime.includes('xml')) return 'xml';
  if (mime.includes('javascript')) return 'js';
  if (mime === 'text/css') return 'css';
  if (mime === 'text/csv') return 'csv';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.includes('word')) return 'word';
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'excel';
  if (mime.includes('powerpoint') || mime.includes('presentation')) return 'ppt';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.includes('epub')) return 'epub';
  if (mime.includes('zip') || mime.includes('tar') || mime.includes('rar') || mime.includes('compressed')) return 'archive';
  if (mime.includes('msdownload')) return 'exe';
  if (mime.includes('octet-stream') || mime.includes('force-download')) return 'forceDownload';
  return mime.startsWith('text/') ? 'text' : 'unknown';
};
// 接收原生 HTTP 流并通知现有请求工作流
export const sendDesktopRequest = async (options: HttpRequestOptions): Promise<void> => {
  const requestId = crypto.randomUUID();
  const response = generateEmptyResponse();
  const requestBody = options.body && ['json', 'raw', 'urlencoded'].includes(options.body.type) ? String(options.body.value) : '';
  response.requestData = { url: options.url, method: options.method, headers: {}, host: '', body: requestBody };
  const chunks: Uint8Array[] = [];
  let received = 0;
  let cancelled = false;
  let finished = false;
  let started = false;
  const cancel = () => {
    if (finished) return;
    cancelled = true;
    if (started) void invoke('http_cancel', { requestId }).catch(error => options.onError(new Error(String(error))));
  };
  options.signal(cancel);
  const output = new Channel<DesktopHttpEvent>(event => {
    if (finished) return;
    if (event.kind === 'start') {
      started = true;
      response.timings = { start: event.timestamp, phases: {} };
      if (cancelled) cancel();
      return;
    }
    if (event.kind === 'abort') {
      finished = true;
      options.onAbort?.();
      return;
    }
    if (event.kind === 'error' || event.kind === 'file-error') {
      finished = true;
      const message = event.message === 'FILE_NOT_FOUND' ? i18n.global.t('文件不存在') : event.message || 'HTTP_REQUEST_FAILED';
      if (event.kind === 'file-error' && event.fieldId && options.onReadFileFormDataError) {
        options.onReadFileFormDataError({ id: event.fieldId, msg: message, fullMsg: message });
      } else if (event.kind === 'file-error' && options.body?.type === 'binary' && options.onReadBinaryDataError) {
        options.onReadBinaryDataError({ msg: message, fullMsg: message });
      } else options.onError(new Error(message));
      return;
    }
    if (event.kind === 'redirect' && event.response) {
      const head = event.response;
      options.beforeRedirect({
        plainResponse: { statusCode: head.status, url: head.url, rawHeaders: Object.entries(head.headers).flatMap(([name, values]) => values.flatMap(value => [name, value])) },
        requestHeaders: head.requestHeaders,
        method: head.method as HttpRequestOptions['method'],
      });
      return;
    }
    if (event.kind === 'response' && event.response) {
      const head = event.response;
      response.statusCode = head.status;
      response.headers = responseHeaders(head);
      response.contentType = head.headers['content-type']?.[0] || '';
      response.contentLength = Number(head.headers['content-length']?.[0]) || 0;
      response.finalRequestUrl = head.url;
      response.ip = head.remoteAddress;
      response.timings.response = head.timestamp;
      response.requestData.url = head.url;
      response.requestData.method = head.method;
      const originalHeaderNames = new Map(Object.keys(options.headers).map(name => [name.toLowerCase(), name]));
      response.requestData.headers = Object.fromEntries(Object.entries(head.requestHeaders).map(([name, value]) => [originalHeaderNames.get(name.toLowerCase()) || name, value]));
      response.requestData.host = new URL(head.url).host;
      response.responseData.canApiflowParseType = responseType(response.contentType);
      options.onResponse?.(structuredClone(response));
      return;
    }
    if (event.kind === 'data' && event.data) {
      const chunk = Uint8Array.from(event.data);
      chunks.push(chunk);
      response.responseData.streamData.push({ chunk, timestamp: event.timestamp });
      received += chunk.byteLength;
      options.onResponseData?.({ chunk, timestamp: event.timestamp }, received, response.contentLength);
      return;
    }
    if (event.kind === 'end') {
      finished = true;
      const body = new Uint8Array(received);
      let offset = 0;
      for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
      response.body = body;
      response.bodyByteLength = received;
      response.timings.end = event.timestamp;
      response.rt = event.timestamp - response.timings.start;
      response.timings.phases.total = response.rt;
      response.timings.phases.download = event.timestamp - (response.timings.response ?? event.timestamp);
      void (async () => {
        const detected = await fileTypeFromBuffer(body).catch(() => undefined);
        const type = received === 0 ? 'none' : responseType(detected?.mime || response.contentType);
        response.responseData.canApiflowParseType = type;
        if (type === 'json') response.responseData.jsonData = new TextDecoder().decode(body);
        if (['text', 'html', 'xml', 'css', 'csv', 'js'].includes(type)) response.responseData.textData = new TextDecoder().decode(body);
        const disposition = response.headers['content-disposition'];
        let name = `download${detected?.ext ? `.${detected.ext}` : ''}`;
        if (typeof disposition === 'string') {
          const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition)?.[1];
          if (encoded) { try { name = decodeURIComponent(encoded); } catch { name = encoded; } }
          else name = /filename="?([^";]+)/i.exec(disposition)?.[1] || name;
        }
        response.responseData.fileData.name = name;
        response.responseData.fileData.ext = detected?.ext || name.split('.').slice(1).pop() || '';
        options.onResponseEnd?.(response);
      })().catch(error => options.onError(error instanceof Error ? error : new Error(String(error))));
    }
  });
  try {
    await invoke('http_request', { options: createDesktopRequest(options, requestId), output });
  } catch (error) {
    if (!finished) { finished = true; options.onError(new Error(String(error))); }
  }
};
