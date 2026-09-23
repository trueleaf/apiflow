import { z } from 'zod'
import { cloneDeep } from 'lodash-es'
import { generateEmptyProperty } from '@/helper'
import type { RequestSnapshot } from '@src/types/ai/requestParser'
import type { HttpNode } from '@src/types'

const parameterSchema = z.object({ key: z.string().min(1), value: z.string().optional(), remove: z.boolean().optional() }).strict()
const patchSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE']).optional(),
  url: z.string().min(1).optional(),
  query: z.array(parameterSchema).optional(),
  paths: z.array(parameterSchema).optional(),
  headers: z.array(parameterSchema).optional(),
  body: z.json().optional(),
}).strict()
// 提取可撤销的请求字段
export const getRequestSnapshot = (item: HttpNode['item']): RequestSnapshot => cloneDeep({
  method: item.method, url: item.url, queryParams: item.queryParams, paths: item.paths,
  headers: item.headers, requestBody: item.requestBody, contentType: item.contentType,
})
// 判断是否需要提示自然语言解析
export const isNaturalLanguageRequest = (text: string): boolean => {
  const value = text.trim().replace(/\{\{[^}]+\}\}/g, 'variable')
  if (!value || /^(https?:\/\/|\/|variable|[\w-]+(?:\.[\w-]+)+(?::\d+)?\/)[^\s]*$/i.test(value)) return false
  return /\s/.test(value) || /[，。；]/.test(value) || /(?:请求|查询|参数|生成|修改|添加|删除|设置|改为)/.test(value)
}
// 判断文本是否为合法 JSON
export const isValidJson = (text: string): boolean => {
  try { JSON.parse(text); return true } catch { return false }
}
// 读取模型返回的完整 JSON
export const parseModelJson = (text: string): unknown => JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''))
// 合并参数并保留未涉及的字段
const mergeParameters = (original: RequestSnapshot['headers'], changes: z.infer<typeof parameterSchema>[], ignoreCase = false): RequestSnapshot['headers'] => {
  const result = cloneDeep(original)
  for (const change of changes) {
    const matches = (key: string) => ignoreCase ? key.toLowerCase() === change.key.toLowerCase() : key === change.key
    if (change.remove) {
      for (let index = result.length - 1; index >= 0; index -= 1) {
        if (matches(result[index].key)) result.splice(index, 1)
      }
    } else {
      if (change.value === undefined) throw new Error('AI_PARSE_INVALID')
      const existing = result.find(item => matches(item.key))
      if (existing) { existing.value = change.value; existing.select = true }
      else result.push({ ...generateEmptyProperty(), key: change.key, value: change.value, select: true })
    }
  }
  return result
}
// 校验请求补丁并生成候选请求
export const buildParsedRequest = (original: RequestSnapshot, value: unknown): RequestSnapshot => {
  const patch = patchSchema.parse(value)
  if (!Object.keys(patch).length) throw new Error('AI_PARSE_INVALID')
  const result = cloneDeep(original)
  if (patch.method) result.method = patch.method
  if (patch.url !== undefined) {
    const protectedUrl = patch.url.replace(/\{\{[^}]+\}\}/g, 'variable')
    if (/\s/.test(protectedUrl) || !/^(https?:\/\/|\/|variable)/i.test(protectedUrl)) throw new Error('AI_PARSE_INVALID')
    if (/^https?:\/\//i.test(protectedUrl) && !patch.url.includes('{{')) new URL(protectedUrl)
    const [path, query] = patch.url.split(/\?(.*)/s)
    result.url.path = path
    if (/^(https?:\/\/|\{\{)/i.test(path)) result.url.prefix = ''
    if (query) {
      result.queryParams = mergeParameters(result.queryParams, Array.from(new URLSearchParams(query), ([key, entry]) => ({ key, value: entry })))
    }
    const keys = Array.from(path.matchAll(/(?<!\{)\{([^{}]+)\}(?!\})/g), match => match[1])
    result.paths = keys.map(key => cloneDeep(original.paths.find(item => item.key === key) ?? { ...generateEmptyProperty(), key }))
  }
  if (patch.query) result.queryParams = mergeParameters(result.queryParams, patch.query)
  if (patch.headers) {
    if (patch.headers.some(item => !/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(item.key) || /[\r\n]/.test(item.value ?? ''))) throw new Error('AI_PARSE_INVALID')
    result.headers = mergeParameters(result.headers, patch.headers, true)
  }
  if (patch.paths) {
    if (patch.paths.some(item => !result.paths.some(path => path.key === item.key))) throw new Error('AI_PARSE_INVALID')
    result.paths = mergeParameters(result.paths, patch.paths)
  }
  if (Object.hasOwn(patch, 'body')) {
    result.requestBody.mode = 'json'
    result.requestBody.rawJson = JSON.stringify(patch.body, null, 2)
    result.contentType = 'application/json'
  }
  return result
}
// 提供可读的请求预览
export const describeRequest = (snapshot: RequestSnapshot): string => JSON.stringify({
  method: snapshot.method, url: snapshot.url.prefix + snapshot.url.path,
  query: snapshot.queryParams.filter(item => item.key).map(({ key, value, select }) => ({ key, value, enabled: select })),
  paths: snapshot.paths.filter(item => item.key).map(({ key, value }) => ({ key, value })),
  headers: snapshot.headers.filter(item => item.key).map(({ key, value, select }) => ({ key, value, enabled: select })),
  bodyMode: snapshot.requestBody.mode,
  body: snapshot.requestBody.mode === 'json' ? snapshot.requestBody.rawJson : undefined,
}, null, 2)
