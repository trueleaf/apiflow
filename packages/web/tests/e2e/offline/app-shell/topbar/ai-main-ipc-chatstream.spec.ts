import { test, expect } from '../../../../fixtures/electron.fixture';

test.describe('AiMainIpcChatStream', () => {
  // 直接校验 preload 暴露的 aiManager.chatStream：增量分片、结束态、错误态
  test('离线模式下 aiManager.chatStream 回调状态保持一致', async ({ contentPage, clearCache }) => {
    await clearCache();

    // 使用本地 mock 流式接口，校验 onData 与 onEnd 回调
    const streamSuccessResult = await contentPage.evaluate(async () => {
      const bridge = (window as Window & {
        electronAPI?: {
          aiManager?: {
            updateConfig: (config: {
              id: string;
              name: string;
              provider: 'DeepSeek' | 'OpenAICompatible';
              apiKey: string;
              baseURL: string;
              model: string;
              customHeaders: Array<{ key: string; value: string }>;
              extraBody: string;
            }) => void;
            chatStream: (
              body: { messages: Array<{ role: 'user' | 'system' | 'assistant' | 'tool'; content: string }> },
              callbacks: {
                onData: (chunk: Uint8Array) => void;
                onEnd: () => void;
                onError: (error: Error | string) => void;
              },
              useFreeLLM: boolean
            ) => { abort: () => void };
          };
        };
      }).electronAPI?.aiManager;
      if (!bridge) {
        return {
          hasBridge: false,
          chunkCount: 0,
          ended: false,
          errorMessage: '',
        };
      }
      bridge.updateConfig({
        id: 'e2e-openai-compatible',
        name: 'E2E OpenAI Compatible',
        provider: 'OpenAICompatible',
        apiKey: 'sk-e2e-stream',
        baseURL: 'http://127.0.0.1:3456/sse/chunked',
        model: 'e2e-stream-model',
        customHeaders: [],
        extraBody: '',
      });

      const callbackState = {
        chunkCount: 0,
        ended: false,
        errorMessage: '',
      };

      const streamController = bridge.chatStream({
        messages: [{ role: 'user', content: '请返回流式分片' }],
      }, {
        onData: () => {
          callbackState.chunkCount += 1;
        },
        onEnd: () => {
          callbackState.ended = true;
        },
        onError: (error) => {
          callbackState.errorMessage = typeof error === 'string' ? error : error.message;
        },
      }, false);

      await new Promise<void>((resolve) => {
        const timeoutId = window.setTimeout(() => {
          streamController.abort();
          resolve();
        }, 5000);
        const pollId = window.setInterval(() => {
          if (callbackState.ended || callbackState.errorMessage.length > 0) {
            window.clearTimeout(timeoutId);
            window.clearInterval(pollId);
            resolve();
          }
        }, 80);
      });

      return {
        hasBridge: true,
        chunkCount: callbackState.chunkCount,
        ended: callbackState.ended,
        errorMessage: callbackState.errorMessage,
      };
    });

    expect(streamSuccessResult.hasBridge).toBeTruthy();
    expect(streamSuccessResult.chunkCount).toBeGreaterThan(0);
    expect(streamSuccessResult.ended).toBeTruthy();
    expect(streamSuccessResult.errorMessage).toBe('');

    // 切换到不可达地址，校验 onError 错误回调可达
    const streamErrorResult = await contentPage.evaluate(async () => {
      const bridge = (window as Window & {
        electronAPI?: {
          aiManager?: {
            updateConfig: (config: {
              id: string;
              name: string;
              provider: 'DeepSeek' | 'OpenAICompatible';
              apiKey: string;
              baseURL: string;
              model: string;
              customHeaders: Array<{ key: string; value: string }>;
              extraBody: string;
            }) => void;
            chatStream: (
              body: { messages: Array<{ role: 'user' | 'system' | 'assistant' | 'tool'; content: string }> },
              callbacks: {
                onData: (chunk: Uint8Array) => void;
                onEnd: () => void;
                onError: (error: Error | string) => void;
              },
              useFreeLLM: boolean
            ) => { abort: () => void };
          };
        };
      }).electronAPI?.aiManager;
      if (!bridge) {
        return {
          hasBridge: false,
          hasError: false,
          errorMessage: '',
        };
      }
      bridge.updateConfig({
        id: 'e2e-openai-compatible-error',
        name: 'E2E OpenAI Compatible Error',
        provider: 'OpenAICompatible',
        apiKey: 'sk-e2e-stream-error',
        baseURL: 'http://127.0.0.1:1/unreachable-chat-stream',
        model: 'e2e-stream-model-error',
        customHeaders: [],
        extraBody: '',
      });

      let errorMessage = '';

      const streamController = bridge.chatStream({
        messages: [{ role: 'user', content: '请触发错误回调' }],
      }, {
        onData: () => {
          // 错误分支无需处理增量数据
        },
        onEnd: () => {
          // 错误分支无需处理结束态
        },
        onError: (error) => {
          errorMessage = typeof error === 'string' ? error : error.message;
        },
      }, false);

      await new Promise<void>((resolve) => {
        const timeoutId = window.setTimeout(() => {
          streamController.abort();
          resolve();
        }, 5000);
        const pollId = window.setInterval(() => {
          if (errorMessage.length > 0) {
            window.clearTimeout(timeoutId);
            window.clearInterval(pollId);
            resolve();
          }
        }, 80);
      });

      return {
        hasBridge: true,
        hasError: errorMessage.length > 0,
        errorMessage,
      };
    });

    expect(streamErrorResult.hasBridge).toBeTruthy();
    expect(streamErrorResult.hasError).toBeTruthy();
    expect(streamErrorResult.errorMessage.length).toBeGreaterThan(0);
  });
});
