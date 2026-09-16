import { expect, test } from '@playwright/test'
import { createServer } from 'node:http'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { generateText, Output, streamText, tool } from 'ai'
import { z } from 'zod'
import { createLanguageModel } from '../../../../src/main/ai/provider'
import { getLLMRequestError } from '../../../../src/config/llmProviders'
import type { LLMProviderSetting } from '../../../../src/types'

test('Provider contract 覆盖文本、thinking、JSON、工具分片、异常流与错误映射', async () => {
  const requests: Array<Record<string, unknown>> = []
  const server = createServer(async (request, response) => {
    const chunks: Buffer[] = []
    for await (const chunk of request) chunks.push(Buffer.from(chunk))
    const rawBody = Buffer.concat(chunks).toString()
    let body: Record<string, unknown> = {}
    try { body = JSON.parse(rawBody) as Record<string, unknown> } catch { /* 非法请求体由响应场景覆盖 */ }
    requests.push(body)
    const model = typeof body.model === 'string' ? body.model : ''
    const statusMatch = model.match(/^error-(\d{3})$/)
    if (statusMatch) {
      const status = Number(statusMatch[1])
      response.writeHead(status, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ error: { message: status === 402 ? 'insufficient balance' : `provider error ${status}` } }))
      return
    }
    if (model === 'timeout') return
    if (model === 'invalid-json') {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end('{invalid')
      return
    }
    if (model === 'half-stream') {
      response.writeHead(200, { 'Content-Type': 'text/event-stream' })
      response.end(`data: ${JSON.stringify({ id: 'half', choices: [{ index: 0, delta: { content: 'half' }, finish_reason: null }] })}\n\n`)
      return
    }
    if (model === 'empty-stream') {
      response.writeHead(200, { 'Content-Type': 'text/event-stream' })
      response.end('data: [DONE]\n\n')
      return
    }
    if (body.stream === true && Array.isArray(body.tools)) {
      response.writeHead(200, { 'Content-Type': 'text/event-stream' })
      response.write(`data: ${JSON.stringify({ id: 'tool-stream', model, choices: [{ index: 0, delta: { role: 'assistant', tool_calls: [{ index: 0, id: 'call-stream', type: 'function', function: { name: 'inspect', arguments: '{"value"' } }] }, finish_reason: null }] })}\n\n`)
      response.write(`data: ${JSON.stringify({ id: 'tool-stream', model, choices: [{ index: 0, delta: { tool_calls: [{ index: 0, function: { arguments: ':"ok"}' } }] }, finish_reason: null }] })}\n\n`)
      response.end(`data: ${JSON.stringify({ id: 'tool-stream', model, choices: [{ index: 0, delta: {}, finish_reason: 'tool_calls' }] })}\n\ndata: [DONE]\n\n`)
      return
    }
    if (model === 'tool' || model === 'unknown-tool' || model === 'duplicate-tool' || Array.isArray(body.tools)) {
      const name = model === 'unknown-tool' ? 'missingTool' : 'inspect'
      const calls = [{ id: 'call-contract', type: 'function', function: { name, arguments: '{"value":"ok"}' } }]
      if (model === 'duplicate-tool') calls.push({ id: 'call-contract', type: 'function', function: { name, arguments: '{"value":"duplicate"}' } })
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ id: 'tool-result', model, choices: [{ index: 0, message: { role: 'assistant', content: null, tool_calls: calls }, finish_reason: 'tool_calls' }], usage: { prompt_tokens: 2, completion_tokens: 3, total_tokens: 5 } }))
      return
    }
    const content = body.response_format && typeof body.response_format === 'object' ? '{"ok":true}' : `文本-${model}`
    if (body.stream === true) {
      response.writeHead(200, { 'Content-Type': 'text/event-stream' })
      response.write(`data: ${JSON.stringify({ id: 'stream-result', model, choices: [{ index: 0, delta: { reasoning_content: '推理内容' }, finish_reason: null }] })}\n\n`)
      response.end(`data: ${JSON.stringify({ id: 'stream-result', model, choices: [{ index: 0, delta: { content }, finish_reason: 'stop' }] })}\n\ndata: [DONE]\n\n`)
      return
    }
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ id: 'text-result', model, choices: [{ index: 0, message: { role: 'assistant', content, reasoning_content: '推理内容' }, finish_reason: 'stop' }], usage: { prompt_tokens: 2, completion_tokens: 3, total_tokens: 5 } }))
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Provider contract server failed')
  const baseURL = `http://127.0.0.1:${address.port}/v1`
  const config: LLMProviderSetting = { id: 'contract', name: 'Contract', provider: 'OpenAICompatible', vendor: 'custom', apiKey: 'contract-secret', baseURL, model: 'text', customHeaders: [{ key: 'X-Contract', value: 'header-secret' }], extraBody: '{"safe":true,"model":"must-not-override"}', thinkingMode: 'default', reasoningEffort: 'default', thinkingBudget: null, maxTokens: 64 }
  try {
    const textResult = await generateText({ model: createLanguageModel(config), messages: [{ role: 'user', content: 'text' }] })
    expect(textResult.text).toBe('文本-text')
    expect(textResult.reasoningText).toBe('推理内容')
    expect(requests.at(-1)).toMatchObject({ model: 'text', safe: true })
    const jsonResult = await generateText({ model: createLanguageModel({ ...config, model: 'json' }), messages: [{ role: 'user', content: 'json' }], output: Output.json() })
    expect(jsonResult.output).toEqual({ ok: true })
    expect(requests.at(-1)).toMatchObject({ response_format: { type: 'json_object' } })
    const inspectTool = { inspect: tool({ inputSchema: z.object({ value: z.string() }).strict() }) }
    const toolResult = await generateText({ model: createLanguageModel({ ...config, model: 'tool' }), messages: [{ role: 'user', content: 'tool' }], tools: inspectTool })
    expect(toolResult.finishReason).toBe('tool-calls')
    expect(toolResult.toolCalls).toMatchObject([{ toolCallId: 'call-contract', toolName: 'inspect', input: { value: 'ok' } }])
    const duplicateResult = await generateText({ model: createLanguageModel({ ...config, model: 'duplicate-tool' }), messages: [{ role: 'user', content: 'duplicate' }], tools: inspectTool })
    expect(duplicateResult.toolCalls).toHaveLength(2)
    expect(new Set(duplicateResult.toolCalls.map(call => call.toolCallId)).size).toBe(1)
    const unknownResult = await generateText({ model: createLanguageModel({ ...config, model: 'unknown-tool' }), messages: [{ role: 'user', content: 'unknown' }], tools: inspectTool })
    expect(unknownResult.toolCalls).toMatchObject([{ toolName: 'missingTool', dynamic: true, invalid: true }])
    expect(unknownResult.steps[0].content.some(part => part.type === 'tool-error')).toBe(true)
    await expect(generateText({ model: createLanguageModel({ ...config, model: 'invalid-json' }), messages: [{ role: 'user', content: 'invalid' }] })).rejects.toThrow()

    const deepSeek = createDeepSeek({ apiKey: 'deepseek-contract', baseURL })
    const pro = await generateText({ model: deepSeek('deepseek-v4-pro'), messages: [{ role: 'user', content: 'pro' }], providerOptions: { deepseek: { thinking: { type: 'enabled' }, reasoningEffort: 'high' } } })
    expect(pro.text).toBe('文本-deepseek-v4-pro')
    expect(pro.reasoningText).toBe('推理内容')
    expect(pro.rawFinishReason).toBe('stop')
    expect(requests.at(-1)).toMatchObject({ model: 'deepseek-v4-pro', thinking: { type: 'enabled' }, reasoning_effort: 'high' })
    const proTool = await generateText({ model: deepSeek('deepseek-v4-pro'), messages: [{ role: 'user', content: 'tool' }], tools: inspectTool })
    expect(proTool.toolCalls).toMatchObject([{ toolName: 'inspect', input: { value: 'ok' } }])
    const flashJson = await generateText({ model: deepSeek('deepseek-v4-flash'), messages: [{ role: 'user', content: 'json' }], output: Output.json() })
    expect(flashJson.output).toEqual({ ok: true })
    const streamed = streamText({ model: deepSeek('deepseek-v4-flash'), messages: [{ role: 'user', content: 'stream' }] })
    const streamParts: string[] = []
    for await (const part of streamed.fullStream) streamParts.push(part.type)
    expect(streamParts).toEqual(expect.arrayContaining(['reasoning-start', 'reasoning-delta', 'text-start', 'text-delta', 'finish']))
    const toolStreamed = streamText({ model: deepSeek('deepseek-v4-flash'), messages: [{ role: 'user', content: 'tool stream' }], tools: { inspect: tool({ inputSchema: z.object({ value: z.string() }).strict() }) } })
    const toolStreamParts: string[] = []
    for await (const part of toolStreamed.fullStream) toolStreamParts.push(part.type)
    expect(toolStreamParts).toEqual(expect.arrayContaining(['tool-input-start', 'tool-input-delta', 'tool-input-end', 'tool-call', 'finish']))
    expect(await toolStreamed.toolCalls).toMatchObject([{ toolCallId: 'call-stream', toolName: 'inspect', input: { value: 'ok' } }])

    for (const model of ['error-401', 'error-403', 'error-404', 'error-402', 'error-429', 'error-500']) {
      await expect(generateText({ model: createLanguageModel({ ...config, model }), messages: [{ role: 'user', content: model }], maxRetries: 0 })).rejects.toThrow()
    }
    expect(getLLMRequestError(new Error('HTTP 401 contract-secret header-secret'), config)).toBe('API Key 无效或已失效，请检查密钥及所属地域')
    expect(getLLMRequestError(new Error('HTTP 403'), config)).toContain('没有模型访问权限')
    expect(getLLMRequestError(new Error('HTTP 404'), config)).toContain('模型或接口不可用')
    expect(getLLMRequestError(new Error('HTTP 402 insufficient balance'), config)).toContain('余额不足')
    expect(getLLMRequestError(new Error('HTTP 429'), config)).toContain('请求过于频繁')
    expect(getLLMRequestError(new Error('timed out'), config)).toContain('请求超时')
    expect(getLLMRequestError(new Error('HTTP 503'), config)).toContain('模型服务暂时不可用')
    expect(getLLMRequestError(new Error('contract-secret header-secret'), config)).toBe('[REDACTED] [REDACTED]')

    for (const model of ['half-stream', 'empty-stream']) {
      const partial = streamText({ model: createDeepSeek({ apiKey: 'contract', baseURL })(model), messages: [{ role: 'user', content: model }] })
      let partialText = ''
      for await (const part of partial.fullStream) if (part.type === 'text-delta') partialText += part.text
      expect(partialText).toBe(model === 'half-stream' ? 'half' : '')
      expect(await partial.finishReason).toBe('other')
    }
  } finally {
    server.closeAllConnections()
    await new Promise<void>(resolve => server.close(() => resolve()))
  }
})
