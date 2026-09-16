import type { LanguageModel } from 'ai'
import { MockLanguageModelV3, simulateReadableStream } from 'ai/test'

const usage = {
  inputTokens: { total: 5, noCache: 5, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 6, text: 4, reasoning: 2 },
}
// 创建仅测试环境可用的确定性模型
export const createTestLanguageModel = (modelId: string): LanguageModel => {
  let callCount = 0
  return new MockLanguageModelV3({
    provider: 'apiflow-test',
    modelId,
    doGenerate: async () => ({
      content: [{ type: 'text', text: '测试完成' }],
      finishReason: { unified: 'stop', raw: 'stop' },
      usage,
      warnings: [],
    }),
    doStream: async options => {
      callCount += 1
      const prompt = JSON.stringify(options.prompt)
      if (modelId === 'ai-test-language') {
        const system = options.prompt.find(message => message.role === 'system')?.content ?? ''
        const language = system.match(/Reply in ([\w-]+)\./)?.[1]
        if (!language || !['zh-cn', 'en', 'ja'].includes(language)) throw new Error('Missing language instruction')
        const text = language === 'en' ? 'API design: User directory' : language === 'ja' ? 'API設計：ユーザー一覧' : '接口设计：用户列表'
        return { stream: simulateReadableStream({ chunks: [{ type: 'text-start', id: 'language' }, { type: 'text-delta', id: 'language', delta: text }, { type: 'text-end', id: 'language' }, { type: 'finish', finishReason: { unified: 'stop', raw: 'stop' }, usage }] }) }
      }
      if (modelId === 'ai-test-script') {
        const user = [...options.prompt].reverse().find(message => message.role === 'user')
        const input = user?.content.find(part => part.type === 'text')
        const script = JSON.parse(input?.type === 'text' ? input.text : '{}') as { steps?: Array<Array<{ toolName: string; toolCallId?: string; input: Record<string, unknown> }>>; text?: string }
        const completedCalls = options.prompt.filter(message => message.role === 'tool').flatMap(message => message.content).filter(part => part.type === 'tool-result').length
        let offset = 0
        const batch = script.steps?.find(step => { offset += step.length; return offset > completedCalls })
        if (batch) {
          const ids = options.prompt.filter(message => message.role === 'tool').flatMap(message => message.content).flatMap(part => {
            if (part.type !== 'tool-result' || part.output.type !== 'text') return []
            try { const result = JSON.parse(part.output.value) as { changeSetId?: string }; return result.changeSetId ? [result.changeSetId] : [] } catch { return [] }
          })
          const calls = batch.map((call, index) => ({ type: 'tool-call' as const, toolCallId: call.toolCallId ?? `script-${completedCalls}-${index}`, toolName: call.toolName, input: JSON.stringify(call.input).replaceAll('$changeSetId', ids.at(-1) ?? 'missing-change-set') }))
          return { stream: simulateReadableStream({ chunks: [...calls, { type: 'finish', finishReason: { unified: 'tool-calls', raw: 'tool_calls' }, usage }] }) }
        }
        return { stream: simulateReadableStream({ chunks: [{ type: 'text-start', id: 'script-text' }, { type: 'text-delta', id: 'script-text', delta: script.text ?? '脚本完成' }, { type: 'text-end', id: 'script-text' }, { type: 'finish', finishReason: { unified: 'stop', raw: 'stop' }, usage }] }) }
      }
      if (modelId === 'ai-test-error') {
        return {
          stream: simulateReadableStream({ chunks: [{ type: 'error', error: new Error('test-model-error') }] }),
        }
      }
      if (modelId === 'ai-test-read' && callCount === 1) {
        return {
          stream: simulateReadableStream({ chunks: [
            { type: 'tool-input-start', id: 'test-read-call', toolName: 'getWorkspaceContext' },
            { type: 'tool-input-delta', id: 'test-read-call', delta: '{}' },
            { type: 'tool-input-end', id: 'test-read-call' },
            { type: 'tool-call', toolCallId: 'test-read-call', toolName: 'getWorkspaceContext', input: '{}' },
            { type: 'finish', finishReason: { unified: 'tool-calls', raw: 'tool_calls' }, usage },
          ] }),
        }
      }
      const isSlow = modelId === 'ai-test-slow'
      const approvalResolved = prompt.includes('tool-approval-response')
      const hasPreviousAnswer = options.prompt.some(message => message.role === 'assistant')
      const text = approvalResolved ? '审批流程完成' : modelId === 'ai-test-read' ? '只读查询完成' : hasPreviousAnswer ? '第二轮上下文完成' : '测试流式回答完成'
      return {
        stream: simulateReadableStream({
          initialDelayInMs: isSlow ? 300 : null,
          chunkDelayInMs: isSlow ? 300 : null,
          chunks: [
            { type: 'reasoning-start', id: 'test-reasoning' },
            { type: 'reasoning-delta', id: 'test-reasoning', delta: '正在分析' },
            { type: 'reasoning-end', id: 'test-reasoning' },
            { type: 'text-start', id: 'test-text' },
            { type: 'text-delta', id: 'test-text', delta: text },
            { type: 'text-end', id: 'test-text' },
            { type: 'source', sourceType: 'url', id: 'test-source', url: 'https://example.com/docs', title: 'Test docs' },
            { type: 'source', sourceType: 'document', id: 'test-document', mediaType: 'application/json', title: 'Test schema', filename: 'schema.json' },
            { type: 'file', mediaType: 'application/json', data: 'e30=' },
            { type: 'finish', finishReason: { unified: 'stop', raw: 'stop' }, usage },
          ],
        }),
      }
    },
  })
}
