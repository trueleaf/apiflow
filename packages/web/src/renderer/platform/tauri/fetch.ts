import { Channel, invoke } from '@tauri-apps/api/core';
import type { DesktopHttpEvent, DesktopHttpRequest } from '@src/types/desktop';

// 为 AI SDK 提供原生网络传输和流式响应
export const desktopFetch: typeof fetch = async (input, init) => {
  const request = new Request(input, init);
  if (request.signal.aborted) throw request.signal.reason ?? new DOMException('Aborted', 'AbortError');
  const text = request.body ? await request.text() : undefined;
  const requestId = crypto.randomUUID();
  return new Promise<Response>((resolve, reject) => {
    let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
    let started = false;
    let completed = false;
    let cancelled = false;
    let responded = false;
    const cancelNative = () => {
      cancelled = true;
      if (started) void invoke('http_cancel', { requestId }).catch(reject);
    };
    const finish = (error?: Error) => {
      if (completed) return;
      completed = true;
      request.signal.removeEventListener('abort', abort);
      if (error) {
        if (responded) controller?.error(error);
        else reject(error);
      } else controller?.close();
    };
    const abort = () => {
      cancelNative();
      finish(new DOMException('Aborted', 'AbortError'));
    };
    request.signal.addEventListener('abort', abort, { once: true });
    const stream = new ReadableStream<Uint8Array>({
      start(value) { controller = value; },
      cancel() { cancelNative(); completed = true; request.signal.removeEventListener('abort', abort); },
    });
    const output = new Channel<DesktopHttpEvent>(event => {
      if (event.kind === 'start') { started = true; if (cancelled) cancelNative(); return; }
      if (completed) return;
      if (event.kind === 'response' && event.response) {
        const head = event.response;
        if (request.redirect === 'error' && head.status >= 300 && head.status < 400) { cancelNative(); finish(new TypeError('Redirect is not allowed')); return; }
        const headers = new Headers();
        for (const [name, values] of Object.entries(head.headers)) for (const value of values) headers.append(name, value);
        responded = true;
        const response = new Response([204, 205, 304].includes(head.status) || request.method === 'HEAD' ? null : stream, { status: head.status, statusText: head.statusText, headers });
        Object.defineProperty(response, 'url', { value: head.url });
        Object.defineProperty(response, 'redirected', { value: head.url !== request.url });
        resolve(response);
      } else if (event.kind === 'data' && event.data) controller?.enqueue(Uint8Array.from(event.data));
      else if (event.kind === 'end') finish();
      else if (event.kind === 'abort') finish(new DOMException('Aborted', 'AbortError'));
      else if (event.kind === 'error' || event.kind === 'file-error') finish(new Error(event.message || 'HTTP_REQUEST_FAILED'));
    });
    const options: DesktopHttpRequest = {
      requestId, url: request.url, method: request.method, headers: Object.fromEntries(request.headers),
      timeout: 0, followRedirect: request.redirect === 'follow', maxRedirects: 10, maxSendFileSize: 0,
      body: text === undefined ? null : { kind: 'raw', text },
    };
    if (request.signal.aborted) { abort(); return; }
    void invoke('http_request', { options, output }).catch(error => finish(new Error(String(error))));
  });
};
