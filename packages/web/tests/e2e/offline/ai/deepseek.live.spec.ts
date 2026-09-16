import { expect, test } from '@playwright/test'
import { generateText, streamText, tool } from 'ai'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { z } from 'zod'
import dotenv from 'dotenv'
import { normalizeLLMBaseURL } from '../../../../src/config/llmProviders'

dotenv.config({ path: '../../.env', quiet: true })
dotenv.config({ path: '.env.test', quiet: true })
for (const scenario of [
  { name: 'V4 Flash 普通文本', model: 'deepseek-v4-flash', kind: 'text' },
  { name: 'V4 Flash SSE', model: 'deepseek-v4-flash', kind: 'stream' },
  { name: 'V4 Flash 一次工具调用', model: 'deepseek-v4-flash', kind: 'tool' },
  { name: 'V4 Pro 配置可用性', model: 'deepseek-v4-pro', kind: 'text' },
]) {
  test(`${scenario.name} @live-api`, async ({}, testInfo) => {
    test.skip(process.env.APIFLOW_LIVE_API !== '1', '仅设置 APIFLOW_LIVE_API=1 时调用真实服务')
    test.skip(!process.env.DEEPSEEK_API_KEY, '缺少 DEEPSEEK_API_KEY，跳过 live-api')
    const model = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: normalizeLLMBaseURL(process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com') })(scenario.model)
    // 每个场景只允许一次真实请求，关闭自动重试与推理以限制费用
    let usage: { inputTokens?: number; outputTokens?: number; totalTokens?: number } = {}
    try {
      const options = { model, maxOutputTokens: 128, maxRetries: 0, abortSignal: AbortSignal.timeout(60000), providerOptions: { deepseek: { thinking: { type: 'disabled' as const } } } }
      if (scenario.kind === 'stream') {
        const response = streamText({ ...options, prompt: 'Reply only: OK' })
        let text = ''
        for await (const part of response.textStream) text += part
        usage = await response.usage
        expect(text.trim().length > 0).toBe(true)
      } else if (scenario.kind === 'tool') {
        const response = await generateText({ ...options, prompt: 'Call echo with value OK.', toolChoice: { type: 'tool', toolName: 'echo' }, tools: { echo: tool({ description: 'Echo a short value', inputSchema: z.object({ value: z.string() }).strict() }) } })
        usage = response.usage
        expect(response.toolCalls.map(call => call.toolName)).toEqual(['echo'])
      } else {
        const response = await generateText({ ...options, prompt: 'Reply only: OK' })
        usage = response.usage
        expect(response.text.trim().length > 0).toBe(true)
      }
    } catch {
      throw new Error(`${scenario.name} 真实 API 验证失败；不保存请求、Key 或完整响应`)
    } finally {
      testInfo.annotations.push({ type: 'live-api-usage', description: JSON.stringify({ purpose: scenario.name, calls: 1, maxOutputTokens: 128, ...usage }) })
    }
  })
}
