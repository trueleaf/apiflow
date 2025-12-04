import { WebSocketNode } from '@src/types/websocketNode';
import { WS, WorkerMessage } from '@/worker/websocketPreRequest/types/types';
import WebSocketPreRequestWorker from '@/worker/websocketPreRequest/websocketPreRequest.ts?worker';
import { httpNodeCache } from '@/cache/httpNode/httpNodeCache';
import { i18n } from '@/i18n';

type ExecutePreScriptResult = {
  success: boolean;
  modifiedWebsocket?: Partial<WebSocketNode>;
  error?: {
    message: string;
    stack?: string;
  };
}

/**
 * 执行 WebSocket 前置脚本
 * @param websocketNode WebSocket 节点数据
 * @param variables 变量数据
 * @param cookies Cookie 数据
 * @param localStorage 本地存储数据
 * @param sessionStorage 会话存储数据
 * @returns 执行结果
 */
export async function executeWebSocketPreScript(
  websocketNode: WebSocketNode,
  variables: Record<string, unknown>,
  cookies: Record<string, unknown>,
  localStorage: Record<string, unknown>,
  sessionStorage: Record<string, unknown>,
  projectId: string
): Promise<ExecutePreScriptResult> {
  // 如果没有前置脚本，直接返回成功
  if (!websocketNode.preRequest.raw || websocketNode.preRequest.raw.trim() === '') {
    return {
      success: true,
    };
  }

  return new Promise((resolve) => {
    const worker = new WebSocketPreRequestWorker();
    let hasResponse = false;

    // 设置超时
    const timeout = setTimeout(() => {
      if (!hasResponse) {
        hasResponse = true;
        worker.terminate();
        resolve({
          success: false,
          error: {
            message: i18n.global.t('前置脚本执行超时（10秒）'),
          },
        });
      }
    }, 10000);

    // 处理 Worker 发送的存储更新消息
    worker.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
      if (e.data.type === 'ws-pre-request-set-session-storage') {
        httpNodeCache.setPreRequestSessionStorage(projectId, e.data.value);
      } else if (e.data.type === 'ws-pre-request-delete-session-storage') {
        httpNodeCache.setPreRequestSessionStorage(projectId, {});
      } else if (e.data.type === 'ws-pre-request-set-local-storage') {
        httpNodeCache.setPreRequestLocalStorage(projectId, e.data.value);
      } else if (e.data.type === 'ws-pre-request-delete-local-storage') {
        httpNodeCache.setPreRequestLocalStorage(projectId, {});
      }
    });

    worker.onmessage = (e: MessageEvent) => {
      const { type } = e.data;

      if (type === 'ws-pre-request-init-success') {
        // 初始化成功，执行脚本
        worker.postMessage({
          type: 'eval',
          code: websocketNode.preRequest.raw,
        });
      } else if (type === 'ws-pre-request-eval-success') {
        if (hasResponse) return;
        hasResponse = true;
        clearTimeout(timeout);

        const ws: WS = e.data.value;

        // 构建修改后的 WebSocket 数据
        const modifiedWebsocket: Partial<WebSocketNode> = {
          item: {
            ...websocketNode.item,
          },
        };

        // 应用协议修改
        if (ws.request.protocol) {
          modifiedWebsocket.item!.protocol = ws.request.protocol;
        }

        // 应用 URL 修改
        if (ws.request.url) {
          modifiedWebsocket.item!.url = {
            ...websocketNode.item.url,
            ...ws.request.url,
          };
        }

        // 应用请求头修改
        if (ws.request.headers) {
          const headers = Object.entries(ws.request.headers).map(([key, value]) => ({
            _id: `header-${key}`,
            key,
            value: String(value),
            description: '',
            required: false,
            type: 'string' as const,
            select: true,
          }));

          // 合并原有的请求头和新的请求头
          const originalHeaders = websocketNode.item.headers.filter(
            (h) => !Object.keys(ws.request.headers).includes(h.key)
          );
          modifiedWebsocket.item!.headers = [...originalHeaders, ...headers];
        }

        // 应用查询参数修改
        if (ws.request.queryParams) {
          const queryParams = Object.entries(ws.request.queryParams).map(([key, value]) => ({
            _id: `param-${key}`,
            key,
            value: String(value),
            description: '',
            required: false,
            type: 'string' as const,
            select: true,
          }));

          // 合并原有的查询参数和新的查询参数
          const originalParams = websocketNode.item.queryParams.filter(
            (p) => !Object.keys(ws.request.queryParams).includes(p.key)
          );
          modifiedWebsocket.item!.queryParams = [...originalParams, ...queryParams];
        }

        worker.terminate();
        resolve({
          success: true,
          modifiedWebsocket,
        });
      } else if (type === 'ws-pre-request-eval-error') {
        if (hasResponse) return;
        hasResponse = true;
        clearTimeout(timeout);

        const errorValue = e.data.value;
        let errorMessage: string;
        let errorStack: string | undefined;

        if (typeof errorValue === 'string') {
          errorMessage = errorValue;
        } else {
          errorMessage = errorValue.message || '脚本执行失败';
          errorStack = errorValue.stack;
        }

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
        error: {
          message: error.message || 'Worker执行异常',
        },
      });
    };

    // 发送初始化数据
    worker.postMessage({
      type: 'initData',
      websocketInfo: websocketNode,
      variables,
      cookies,
      localStorage,
      sessionStorage,
    });
  });
}
