import { WebSocketNode } from '@src/types/websocketNode';
import { WSAfter, WorkerMessage } from '@/worker/websocketAfterRequest/types/types';
import WebSocketAfterRequestWorker from '@/worker/websocketAfterRequest/websocketAfterRequest.ts?worker';
import { httpNodeCache } from '@/cache/httpNode/httpNodeCache';
import { i18n } from '@/i18n';

type ExecuteAfterScriptResult = {
  success: boolean;
  updatedVariables?: Record<string, unknown>;
  updatedStorage?: {
    localStorage?: Record<string, unknown>;
    sessionStorage?: Record<string, unknown>;
  };
  error?: {
    message: string;
    stack?: string;
  };
}

/**
 * 执行 WebSocket 后置脚本
 * @param websocketNode WebSocket 节点数据
 * @param responseData 接收到的响应数据
 * @param variables 变量数据
 * @param cookies Cookie 数据
 * @param localStorage 本地存储数据
 * @param sessionStorage 会话存储数据
 * @returns 执行结果
 */
export async function executeWebSocketAfterScript(
  websocketNode: WebSocketNode,
  responseData: {
    data: string | ArrayBuffer;
    type: 'text' | 'binary';
    timestamp: number;
    size: number;
    mimeType?: string;
  },
  variables: Record<string, unknown>,
  cookies: Record<string, unknown>,
  localStorage: Record<string, unknown>,
  sessionStorage: Record<string, unknown>,
  projectId: string
): Promise<ExecuteAfterScriptResult> {
  // 如果没有后置脚本，直接返回成功
  if (!websocketNode.afterRequest.raw || websocketNode.afterRequest.raw.trim() === '') {
    return {
      success: true,
    };
  }

  return new Promise((resolve) => {
    const worker = new WebSocketAfterRequestWorker();
    let hasResponse = false;

    // 设置超时
    const timeout = setTimeout(() => {
      if (!hasResponse) {
        hasResponse = true;
        worker.terminate();
        resolve({
          success: false,
          error: {
            message: i18n.global.t('后置脚本执行超时（10秒）'),
          },
        });
      }
    }, 10000);

    // 处理 Worker 发送的存储更新消息
    worker.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
      if (e.data.type === 'ws-after-request-set-session-storage') {
        httpNodeCache.setPreRequestSessionStorage(projectId, e.data.value);
      } else if (e.data.type === 'ws-after-request-delete-session-storage') {
        httpNodeCache.setPreRequestSessionStorage(projectId, {});
      } else if (e.data.type === 'ws-after-request-set-local-storage') {
        httpNodeCache.setPreRequestLocalStorage(projectId, e.data.value);
      } else if (e.data.type === 'ws-after-request-delete-local-storage') {
        httpNodeCache.setPreRequestLocalStorage(projectId, {});
      }
    });

    worker.onmessage = (e: MessageEvent) => {
      const { type } = e.data;

      if (type === 'ws-after-request-init-success') {
        // 初始化成功，执行脚本
        worker.postMessage({
          type: 'eval',
          code: websocketNode.afterRequest.raw,
        });
      } else if (type === 'ws-after-request-eval-success') {
        if (hasResponse) return;
        hasResponse = true;
        clearTimeout(timeout);

        const ws: WSAfter = e.data.value;

        // 提取更新后的变量和存储
        const updatedVariables = ws.variables;
        const updatedStorage = {
          localStorage: ws.localStorage,
          sessionStorage: ws.sessionStorage,
        };

        worker.terminate();
        resolve({
          success: true,
          updatedVariables,
          updatedStorage,
        });
      } else if (type === 'ws-after-request-eval-error') {
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
      responseData,
      variables,
      cookies,
      localStorage,
      sessionStorage,
    });
  });
}
