const sensitiveKeyPattern = /authorization|cookie|set-cookie|api[-_]?key|accessToken|refreshToken|idToken|password|secret|(^|[-_])(token|key)$/i
const bearerPattern = /Bearer\s+[A-Za-z0-9._~+/=-]+/gi

// 判断字段是否包含敏感信息
export const isSensitiveAIKey = (key: string): boolean => sensitiveKeyPattern.test(key)
// 脱敏文本中的认证信息
export const redactAIText = (value: string, secrets: string[] = []): string => {
  let redacted = value.replace(bearerPattern, 'Bearer [REDACTED]')
  for (const secret of secrets) {
    if (!secret) continue
    redacted = redacted.split(secret).join('[REDACTED]').split(encodeURIComponent(secret)).join('[REDACTED]')
  }
  return redacted
}
// 递归脱敏 AI 数据
export const redactAIValue = (value: unknown, secrets: string[] = [], seen = new WeakSet<object>()): unknown => {
  if (typeof value === 'string') return redactAIText(value, secrets)
  if (typeof value !== 'object' || value === null) return value
  if (seen.has(value)) return '[CIRCULAR]'
  seen.add(value)
  if (Array.isArray(value)) return value.map(item => redactAIValue(item, secrets, seen))
  const source = value as Record<string, unknown>
  const sensitiveValue = source.valueType === 'secret' || typeof source.name === 'string' && isSensitiveAIKey(source.name) || typeof source.key === 'string' && isSensitiveAIKey(source.key)
  const result: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value)) {
    result[key] = isSensitiveAIKey(key) || sensitiveValue && (key === 'value' || key === 'fileValue') ? '[REDACTED]' : redactAIValue(child, secrets, seen)
  }
  return result
}
