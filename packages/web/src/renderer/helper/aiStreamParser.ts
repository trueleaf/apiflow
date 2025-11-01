/**
 * DeepSeek 流式响应数据结构
 */
export interface DeepSeekStreamDelta {
  choices?: Array<{
    index: number
    delta?: {
      content?: string
      role?: string
    }
    finish_reason?: string | null
  }>
}

/**
 * 解析 AI 流式响应数据（SSE 格式）
 * @param buffer - 当前缓冲区内容
 * @param chunk - 新接收的数据块
 * @param onContent - 解析到内容时的回调
 * @returns 新的缓冲区内容
 */
export function parseAiStream(
  buffer: string,
  chunk: string,
  onContent: (content: string) => void
): string {
  // 将新数据追加到缓冲区
  const newBuffer = buffer + chunk

  // 按行分割数据
  const lines = newBuffer.split('\n')

  // 保留最后一行（可能不完整）
  const remainingBuffer = lines.pop() || ''

  // 处理每一行完整的数据
  for (const line of lines) {
    const trimmedLine = line.trim()

    // 跳过空行和结束标记
    if (!trimmedLine || trimmedLine === 'data: [DONE]') {
      continue
    }

    // 解析 SSE 格式的数据行
    if (trimmedLine.startsWith('data: ')) {
      try {
        // 提取 JSON 字符串（移除 "data: " 前缀）
        const jsonStr = trimmedLine.slice(6)
        const parsedData: DeepSeekStreamDelta = JSON.parse(jsonStr)

        // 提取 content 字段
        const content = parsedData.choices?.[0]?.delta?.content

        if (content) {
          onContent(content)
        }
      } catch (parseError) {
        // 解析失败时记录警告但不中断处理
        console.warn('Failed to parse AI stream data:', trimmedLine, parseError)
      }
    }
  }

  return remainingBuffer
}
