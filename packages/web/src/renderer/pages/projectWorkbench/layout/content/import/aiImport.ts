import type { HttpNode, FolderNode } from '@src/types'
import type { ChatRequestBody, OpenAiResponseBody } from '@src/types/ai/agent.type'
import { createEmptyHttpNode, createEmptyFolderNode, generateId } from '@/composables/useImport'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import type { HttpNodeContentType, HttpNodeBodyMode, HttpNodeRequestMethod } from '@src/types/httpNode/types'

// AI 识别的 API 结构
type AiRecognizedApi = {
  name: string
  method: string
  url: string
  description?: string
  folder?: string
  headers?: { key: string; value: string; description?: string }[]
  queryParams?: { key: string; value: string; description?: string }[]
  pathParams?: { key: string; value: string; description?: string }[]
  requestBody?: {
    contentType?: string
    json?: string
    formData?: { key: string; value: string; type?: string }[]
  }
}
// AI 响应结构
type AiImportResponse = {
  apis: AiRecognizedApi[]
  folders?: string[]
}
// AI 导入 Prompt 模板
const AI_IMPORT_PROMPT = `你是一个 API 文档解析专家。请分析以下数据，提取所有 API 接口信息。

## 输出要求
请严格按照以下 JSON 格式输出，不要输出任何其他内容：

{
  "apis": [
    {
      "name": "接口名称",
      "method": "GET/POST/PUT/DELETE/PATCH",
      "url": "/api/path/:param",
      "description": "接口描述",
      "folder": "所属文件夹名称（可选）",
      "headers": [{ "key": "头名称", "value": "示例值", "description": "说明" }],
      "queryParams": [{ "key": "参数名", "value": "示例值", "description": "说明" }],
      "pathParams": [{ "key": "参数名", "value": "示例值", "description": "说明" }],
      "requestBody": {
        "contentType": "application/json",
        "json": "JSON字符串格式的请求体示例"
      }
    }
  ],
  "folders": ["文件夹1", "文件夹2"]
}

## 注意事项
1. method 必须是大写的 HTTP 方法
2. url 中的路径参数用 :paramName 格式
3. requestBody.json 必须是有效的 JSON 字符串
4. 如果数据中有分组/分类信息，请提取到 folder 字段
5. 尽可能提取完整的接口信息

## 待分析数据
`
// 代码仓库分析 Prompt 模板
const CODE_ANALYZE_PROMPT = `你是一个后端代码分析专家。请分析以下代码，提取所有 API 路由定义。

## 框架信息
框架类型: {framework}
语言: {language}

## 输出要求
请严格按照以下 JSON 格式输出：

{
  "apis": [
    {
      "name": "接口名称（从注释或函数名推断）",
      "method": "GET/POST/PUT/DELETE/PATCH",
      "url": "/api/path/:param",
      "description": "接口描述（从注释提取）",
      "folder": "所属模块/控制器名称",
      "queryParams": [{ "key": "参数名", "value": "", "description": "说明" }],
      "pathParams": [{ "key": "参数名", "value": "", "description": "说明" }],
      "requestBody": {
        "contentType": "application/json",
        "json": "{}"
      }
    }
  ]
}

## 代码内容
`
// 获取 Content-Type 对应的 Body Mode
const getBodyMode = (contentType?: string): HttpNodeBodyMode => {
  if (!contentType) return 'none'
  if (contentType.includes('json')) return 'json'
  if (contentType.includes('form-data')) return 'formdata'
  if (contentType.includes('urlencoded')) return 'urlencoded'
  return 'none'
}
// AI 导入转换器
export class AiImportTranslator {
  private projectId: string
  private llmStore: ReturnType<typeof useLLMClientStore>
  constructor(projectId: string) {
    this.projectId = projectId
    this.llmStore = useLLMClientStore()
  }
  // 检查 AI 是否可用
  isAvailable(): boolean {
    return this.llmStore.isAvailable()
  }
  // 分析数据并返回 HttpNode 列表
  async analyze(rawData: string): Promise<(HttpNode | FolderNode)[]> {
    const prompt = AI_IMPORT_PROMPT + rawData
    const body: ChatRequestBody = {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 8000,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }
    const response: OpenAiResponseBody = await this.llmStore.chat(body)
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('AI 返回内容为空')
    }
    const result = this.parseAiResponse(content)
    return this.convertToNodes(result)
  }
  // 分析代码仓库
  async analyzeCode(code: string, framework: string, language: string): Promise<(HttpNode | FolderNode)[]> {
    const prompt = CODE_ANALYZE_PROMPT
      .replace('{framework}', framework)
      .replace('{language}', language) + code
    const body: ChatRequestBody = {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 8000,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }
    const response: OpenAiResponseBody = await this.llmStore.chat(body)
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('AI 返回内容为空')
    }
    const result = this.parseAiResponse(content)
    return this.convertToNodes(result)
  }
  // 解析 AI 响应
  private parseAiResponse(content: string): AiImportResponse {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('无法解析 AI 响应')
      }
      return JSON.parse(jsonMatch[0]) as AiImportResponse
    } catch {
      throw new Error('AI 响应格式错误')
    }
  }
  // 转换为 HttpNode 列表
  private convertToNodes(result: AiImportResponse): (HttpNode | FolderNode)[] {
    const nodes: (HttpNode | FolderNode)[] = []
    const folderMap = new Map<string, FolderNode>()
    const allFolders = new Set<string>([
      ...(result.folders || []),
      ...result.apis.map(api => api.folder).filter((f): f is string => !!f),
    ])
    allFolders.forEach(folderName => {
      const folder = createEmptyFolderNode(this.projectId, folderName)
      folderMap.set(folderName, folder)
      nodes.push(folder)
    })
    for (const api of result.apis) {
      const node = this.convertApiToNode(api)
      if (api.folder && folderMap.has(api.folder)) {
        node.pid = folderMap.get(api.folder)!._id
      }
      nodes.push(node)
    }
    return nodes
  }
  // 转换单个 API 为 HttpNode
  private convertApiToNode(api: AiRecognizedApi): HttpNode {
    const node = createEmptyHttpNode(this.projectId)
    node.info.name = api.name || `${api.method} ${api.url}`
    node.info.description = api.description || ''
    node.item.method = api.method.toLowerCase() as HttpNodeRequestMethod
    const urlParts = api.url.split('?')
    node.item.url.path = urlParts[0]
    if (api.headers) {
      node.item.headers = api.headers.map(h => ({
        _id: generateId(),
        key: h.key,
        value: h.value,
        type: 'string' as const,
        required: false,
        description: h.description || '',
        select: true,
      }))
    }
    if (api.queryParams) {
      node.item.queryParams = api.queryParams.map(p => ({
        _id: generateId(),
        key: p.key,
        value: p.value,
        type: 'string' as const,
        required: false,
        description: p.description || '',
        select: true,
      }))
    }
    if (api.pathParams) {
      node.item.paths = api.pathParams.map(p => ({
        _id: generateId(),
        key: p.key,
        value: p.value,
        type: 'string' as const,
        required: true,
        description: p.description || '',
        select: true,
      }))
    }
    if (api.requestBody) {
      const contentType = (api.requestBody.contentType || 'application/json') as HttpNodeContentType
      node.item.contentType = contentType
      node.item.requestBody.mode = getBodyMode(contentType)
      if (api.requestBody.json) {
        node.item.requestBody.rawJson = api.requestBody.json
      }
      if (api.requestBody.formData) {
        node.item.requestBody.formdata = api.requestBody.formData.map(f => ({
          _id: generateId(),
          key: f.key,
          value: f.value,
          type: (f.type === 'file' ? 'file' : 'string') as 'string' | 'file',
          required: false,
          description: '',
          select: true,
        }))
      }
    }
    return node
  }
}
// 框架检测结果
type FrameworkInfo = {
  framework: string
  language: string
  routePatterns: string[]
}
// 检测项目框架类型
export const detectFramework = (files: string[], packageJson?: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }): FrameworkInfo => {
  if (packageJson) {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
    if (deps['express']) return { framework: 'Express', language: 'Node.js', routePatterns: ['**/routes/**/*.{js,ts}', '**/router/**/*.{js,ts}', '**/*Controller.{js,ts}'] }
    if (deps['koa']) return { framework: 'Koa', language: 'Node.js', routePatterns: ['**/routes/**/*.{js,ts}', '**/router/**/*.{js,ts}', '**/*Controller.{js,ts}'] }
    if (deps['fastify']) return { framework: 'Fastify', language: 'Node.js', routePatterns: ['**/routes/**/*.{js,ts}', '**/router/**/*.{js,ts}'] }
    if (deps['@nestjs/core']) return { framework: 'NestJS', language: 'Node.js', routePatterns: ['**/*.controller.ts'] }
    if (deps['next']) return { framework: 'Next.js', language: 'Node.js', routePatterns: ['**/pages/api/**/*.{js,ts}', '**/app/**/route.{js,ts}'] }
  }
  if (files.some(f => f.endsWith('go.mod'))) {
    return { framework: 'Go', language: 'Go', routePatterns: ['**/*handler*.go', '**/*router*.go', '**/*controller*.go', '**/routes/*.go'] }
  }
  if (files.some(f => f.endsWith('pom.xml') || f.endsWith('build.gradle'))) {
    return { framework: 'Spring', language: 'Java', routePatterns: ['**/*Controller.java', '**/*Resource.java'] }
  }
  if (files.some(f => f.endsWith('requirements.txt') || f.endsWith('pyproject.toml'))) {
    return { framework: 'Python', language: 'Python', routePatterns: ['**/views.py', '**/routes.py', '**/*_api.py', '**/main.py'] }
  }
  return { framework: 'Unknown', language: 'Unknown', routePatterns: ['**/*.{js,ts,go,java,py}'] }
}
