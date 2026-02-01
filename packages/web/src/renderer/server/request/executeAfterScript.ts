import { i18n } from '@/i18n';
import { httpNodeCache } from '@/cache/httpNode/httpNodeCache';
import { isElectron } from '@/helper';
import { webRequest } from './request.web';
import type { GotRequestOptions, ResponseInfo } from '@src/types';
import type { AfterRequestInfo, AfterResponseInfo, AfHttpResponse, WorkerMessage, OnHttpRequestEvent } from '@/worker/httpNodeAfterRequest/types/types';
import HttpNodeAfterRequestWorker from '@/worker/httpNodeAfterRequest/httpNodeAfterRequest.ts?worker';

export type ExecuteAfterScriptResult = {
  success: boolean;
  updatedVariables?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
  };
};

export const executeHttpAfterScript = async (
  requestInfo: AfterRequestInfo,
  responseInfo: AfterResponseInfo,
  variables: Record<string, unknown>,
  cookies: Record<string, string>,
  localStorage: Record<string, unknown>,
  sessionStorage: Record<string, unknown>,
  projectId: string,
  afterScript: string
): Promise<ExecuteAfterScriptResult> => {
  if (!afterScript.trim()) {
    return { success: true };
  }
  return new Promise((resolve) => {
    const worker = new HttpNodeAfterRequestWorker();
    let hasResponse = false;
    const timeout = setTimeout(() => {
      if (!hasResponse) {
        hasResponse = true;
        worker.terminate();
        resolve({
          success: false,
          error: { message: i18n.global.t('后置脚本执行超时（10秒）') },
        });
      }
    }, 10000);

    const handleHttpRequest = async (event: OnHttpRequestEvent) => {
      const { requestId, options } = event.value;
      try {
        let response: AfHttpResponse | undefined;
        if (isElectron()) {
          response = await window.electronAPI?.afHttpRequest(options);
        } else {
          response = await new Promise<AfHttpResponse>((resolveResponse, rejectResponse) => {
            const requestOptions = ({
              ...options,
              onResponse: () => {},
              onResponseEnd: (responseInfo: ResponseInfo) => {
                resolveResponse({
                  statusCode: responseInfo.statusCode,
                  statusMessage: '',
                  headers: responseInfo.headers,
                  body: responseInfo.responseData.textData || responseInfo.responseData.jsonData || '',
                  json: responseInfo.responseData.jsonData ? responseInfo.responseData.jsonData : null,
                });
              },
              onError: (err: Error) => {
                rejectResponse(err);
              },
            } as unknown) as GotRequestOptions;
            webRequest(requestOptions);
          });
        }
        if (!response) {
          worker.postMessage({
            type: 'after-request-http-error',
            value: { requestId, message: 'HTTP请求不可用' },
          });
          return;
        }
        worker.postMessage({
          type: 'after-request-http-response',
          value: { requestId, response },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        worker.postMessage({
          type: 'after-request-http-error',
          value: { requestId, message },
        });
      }
    };

    worker.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
      if (e.data.type === 'after-request-set-session-storage') {
        httpNodeCache.setPreRequestSessionStorage(projectId, e.data.value);
      } else if (e.data.type === 'after-request-delete-session-storage') {
        httpNodeCache.setPreRequestSessionStorage(projectId, {});
      } else if (e.data.type === 'after-request-set-local-storage') {
        httpNodeCache.setPreRequestLocalStorage(projectId, e.data.value);
      } else if (e.data.type === 'after-request-delete-local-storage') {
        httpNodeCache.setPreRequestLocalStorage(projectId, {});
      } else if (e.data.type === 'after-request-http-request') {
        handleHttpRequest(e.data);
      }
    });

    worker.onmessage = (e: MessageEvent) => {
      const { type } = e.data;
      if (type === 'after-request-init-success') {
        worker.postMessage({
          type: 'eval',
          code: afterScript,
        });
      } else if (type === 'after-request-eval-success') {
        if (hasResponse) return;
        hasResponse = true;
        clearTimeout(timeout);
        const afValue = e.data.value as { variables?: Record<string, unknown> };
        worker.terminate();
        resolve({
          success: true,
          updatedVariables: afValue.variables,
        });
      } else if (type === 'after-request-eval-error') {
        if (hasResponse) return;
        hasResponse = true;
        clearTimeout(timeout);
        const errorValue = e.data.value as { message?: string; stack?: string } | string;
        const errorMessage = typeof errorValue === 'string' ? errorValue : (errorValue.message || i18n.global.t('后置脚本执行失败'));
        const errorStack = typeof errorValue === 'string' ? undefined : errorValue.stack;
        worker.terminate();
        resolve({
          success: false,
          error: {
            message: errorMessage,
            stack: errorStack,
          },
        });
      }
    };

    worker.onerror = (error) => {
      if (hasResponse) return;
      hasResponse = true;
      clearTimeout(timeout);
      worker.terminate();
      resolve({
        success: false,
        error: { message: error.message || i18n.global.t('后置脚本执行失败') },
      });
    };

    worker.postMessage({
      type: 'initData',
      requestInfo,
      responseInfo,
      variables,
      cookies,
      localStorage,
      sessionStorage,
    });
  });
};
