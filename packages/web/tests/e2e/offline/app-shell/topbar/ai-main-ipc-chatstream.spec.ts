import { test, expect } from '../../../../fixtures/electron.fixture'

test('离线 aiManager.chatStream 保留增量、完成与错误回调契约', async ({ contentPage, clearCache }) => {
  await clearCache()
  for (const model of ['ai-test-text', 'ai-test-error']) {
    // 通过完整配置和 ai/test 模型验证兼容 IPC，不将任意 SSE 当成模型协议
    const result = await contentPage.evaluate(async model => {
      const bridge = window.electronAPI!.aiManager
      bridge.updateConfig({ id: 'agent-e2e-compat', name: 'Test', provider: 'OpenAICompatible', vendor: 'custom', apiKey: '', baseURL: 'https://ai.test/v1', model, customHeaders: [], extraBody: '', thinkingMode: 'default', reasoningEffort: 'default', thinkingBudget: null, maxTokens: 64 })
      return await new Promise<{ chunks: string[]; ended: boolean; error: string }>((resolve, reject) => {
        const chunks: string[] = []
        const timer = window.setTimeout(() => { controller.abort(); reject(new Error('Stream callback timeout')) }, 10000)
        const controller = bridge.chatStream({ messages: [{ role: 'user', content: '请返回流式内容' }] }, {
          onData: chunk => { chunks.push(new TextDecoder().decode(chunk)) },
          onEnd: () => { window.clearTimeout(timer); resolve({ chunks, ended: true, error: '' }) },
          onError: error => { window.clearTimeout(timer); resolve({ chunks, ended: false, error: typeof error === 'string' ? error : error.message }) },
        })
      })
    }, model)
    if (model === 'ai-test-text') {
      expect(result.ended).toBe(true)
      expect(result.error).toBe('')
      expect(result.chunks.join('')).toContain('测试流式回答完成')
      expect(result.chunks.join('')).toContain('reasoning_content')
      expect(result.chunks.at(-1)).toContain('[DONE]')
    } else {
      expect(result.ended).toBe(false)
      expect(result.error).toContain('test-model-error')
    }
  }
})
