import type { HttpNode, FolderNode } from '@src/types'
import type { ChatRequestBody, OpenAiResponseBody } from '@src/types/ai/agent.type'
import { createEmptyHttpNode, createEmptyFolderNode, generateId } from '@/composables/useImport'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import type { HttpNodeContentType, HttpNodeBodyMode, HttpNodeRequestMethod } from '@src/types/httpNode/types'
import { aiImportPrompt } from '@/store/ai/prompt/prompt'

// 项目文件类型（用于代码仓库导入）
type ProjectFile = {
  path: string
  content: string
}

// 项目分析结果类型
type ProjectAnalysisResult = {
  framework: string
  language: string
  routeFiles: string[]
  confidence: 'high' | 'medium' | 'low'
}

// 项目结构分析prompt
const projectAnalyzePrompt = `分析以下项目文件列表，识别项目框架和语言，并找出可能包含API路由定义的文件：

文件列表：
{fileList}

请返回JSON格式：
{
  "framework": "框架名称（如：Express, FastAPI, Spring Boot等）",
  "language": "编程语言",
  "routeFiles": ["路由文件路径1", "路由文件路径2"],
  "confidence": "high/medium/low"
}`

// API提取prompt  
const apiExtractPrompt = `从以下{framework}代码中提取API接口信息：

{codeContent}

请返回JSON格式：
{
  "apis": [
    {
      "name": "接口名称",
      "method": "HTTP方法",
      "url": "路径",
      "description": "描述"
    }
  ],
  "folders": ["文件夹名1", "文件夹名2"]
}`

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
    const prompt = aiImportPrompt + rawData
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

const analyzeProjectStructure = async (
  llmStore: ReturnType<typeof useLLMClientStore>,
  files: ProjectFile[],
  signal?: AbortSignal
): Promise<{ result: ProjectAnalysisResult; tokenUsage: TokenUsage }> => {
  const fileList = files.map(f => f.path).join('\n')
  const body: ChatRequestBody = {
    messages: [
      {
        role: 'user',
        content: projectAnalyzePrompt.replace('{fileList}', fileList),
      },
    ],
    max_tokens: 2000,
    temperature: 0.1,
  }
  const response: OpenAiResponseBody = await llmStore.chat(body, signal)
  const tokenUsage: TokenUsage = {
    promptTokens: response.usage?.prompt_tokens || 0,
    completionTokens: response.usage?.completion_tokens || 0,
    totalTokens: response.usage?.total_tokens || 0,
  }
  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('AI 分析项目结构失败')
  }
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('无法解析分析结果')
    }
    return { result: JSON.parse(jsonMatch[0]) as ProjectAnalysisResult, tokenUsage }
  } catch {
    return { result: { framework: 'Unknown', language: 'Unknown', routeFiles: [], confidence: 'low' }, tokenUsage }
  }
}
// 单文件最大内容长度（50KB）
const MAX_FILE_CONTENT_LENGTH = 50 * 1024
// 最大处理文件数（硬编码配置）
const MAX_ROUTE_FILES = 30
// 每批处理的文件数
const BATCH_SIZE = 1
// 每批最大字符数（50KB）
const MAX_CONTENT_PER_BATCH = 10 * 1024
// 路由文件路径评分模式
const ROUTE_PATH_PATTERNS: RegExp[] = [
  /controller/i,
  /router/i,
  /routes?/i,
  /api/i,
  /handler/i,
  /endpoint/i,
  /resource/i,
]
// 路由内容评分模式（不同框架的路由定义特征）
const ROUTE_CONTENT_PATTERNS: RegExp[] = [
  /\.(get|post|put|delete|patch|head|options)\s*\(/gi,           // Express/Koa/Hono
  /@(Get|Post|Put|Delete|Patch|Head|Options)\s*\(/g,             // NestJS/Spring 装饰器
  /@(app|router)\.(get|post|put|delete|patch)\s*\(/gi,           // FastAPI
  /router\.(GET|POST|PUT|DELETE|PATCH|Handle)/g,                 // Gin/Echo
  /@RequestMapping|@GetMapping|@PostMapping|@PutMapping|@DeleteMapping/g, // Spring
  /def\s+(get|post|put|delete|patch)\s*\(/gi,                    // Flask class-based
  /@app\.route\s*\(/gi,                                          // Flask
  /http\.(Get|Post|Put|Delete|Patch|Handle)/g,                   // Go net/http
  /func\s+\w+Handler\s*\(/g,                                     // Go handler 函数
]
// 排除的路径模式
const EXCLUDE_PATH_PATTERNS: RegExp[] = [
  /node_modules/i,
  /\.git/i,
  /dist/i,
  /build/i,
  /\.test\./i,
  /\.spec\./i,
  /__tests__/i,
  /\.d\.ts$/i,
  /\.min\./i,
]
// 计算文件的路由相关性得分
const scoreRouteFile = (filePath: string, content: string): number => {
  // 排除测试文件和构建产物
  for (const pattern of EXCLUDE_PATH_PATTERNS) {
    if (pattern.test(filePath)) return -1
  }
  let score = 0
  // 路径评分：路径中包含路由相关关键词
  for (const pattern of ROUTE_PATH_PATTERNS) {
    if (pattern.test(filePath)) score += 10
  }
  // 内容评分：匹配路由定义特征
  for (const pattern of ROUTE_CONTENT_PATTERNS) {
    const matches = content.match(pattern)
    if (matches) score += matches.length * 5
  }
  return score
}
// 静态预筛选路由文件
const prefilterRouteFiles = (files: ProjectFile[]): { scored: Array<{ file: ProjectFile; score: number }>; total: number } => {
  const scored = files
    .map(file => ({ file, score: scoreRouteFile(file.path, file.content) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
  return { scored, total: scored.length }
}
// 截断文件内容
const truncateFileContent = (content: string): string => {
  if (content.length <= MAX_FILE_CONTENT_LENGTH) return content
  return content.slice(0, MAX_FILE_CONTENT_LENGTH) + '\n// ... 文件内容过长，已截断 ...'
}
// 从代码中提取 API
const extractApisFromCode = async (
  llmStore: ReturnType<typeof useLLMClientStore>,
  framework: string,
  files: ProjectFile[],
  signal?: AbortSignal
): Promise<{ result: AiImportResponse; tokenUsage: TokenUsage }> => {
  const codeContent = files.map(f => `// File: ${f.path}\n${truncateFileContent(f.content)}`).join('\n\n---\n\n')
  const body: ChatRequestBody = {
    messages: [
      {
        role: 'user',
        content: apiExtractPrompt
          .replace('{framework}', framework)
          .replace('{codeContent}', codeContent),
      },
    ],
    // max_tokens: 80000,
    // temperature: 0.1,
  }
  console.log(body, signal)
  const response: OpenAiResponseBody = await llmStore.chat(body, signal);
  console.log(response)
  const tokenUsage: TokenUsage = {
    promptTokens: response.usage?.prompt_tokens || 0,
    completionTokens: response.usage?.completion_tokens || 0,
    totalTokens: response.usage?.total_tokens || 0,
  }
  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('AI 提取 API 失败')
  }
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('无法解析 API 结果')
    }
    return { result: JSON.parse(jsonMatch[0]) as AiImportResponse, tokenUsage }
  } catch {
    return { result: { apis: [], folders: [] }, tokenUsage }
  }
}
// API 去重（按 method + url）
const deduplicateApis = (apis: AiRecognizedApi[]): AiRecognizedApi[] => {
  const seen = new Map<string, AiRecognizedApi>()
  for (const api of apis) {
    const key = `${api.method.toUpperCase()}:${api.url}`
    if (!seen.has(key)) {
      seen.set(key, api)
    } else {
      // 合并信息：保留更完整的
      const existing = seen.get(key)!
      if (!existing.description && api.description) {
        existing.description = api.description
      }
      if (!existing.name && api.name) {
        existing.name = api.name
      }
      if (!existing.headers && api.headers) {
        existing.headers = api.headers
      }
      if (!existing.queryParams && api.queryParams) {
        existing.queryParams = api.queryParams
      }
      if (!existing.pathParams && api.pathParams) {
        existing.pathParams = api.pathParams
      }
      if (!existing.requestBody && api.requestBody) {
        existing.requestBody = api.requestBody
      }
    }
  }
  return Array.from(seen.values())
}
// 将文件列表分批
const createBatches = (files: ProjectFile[]): ProjectFile[][] => {
  const batches: ProjectFile[][] = []
  let currentBatch: ProjectFile[] = []
  let currentSize = 0
  for (const file of files) {
    if (currentBatch.length >= BATCH_SIZE || currentSize + file.content.length > MAX_CONTENT_PER_BATCH) {
      if (currentBatch.length > 0) batches.push(currentBatch)
      currentBatch = []
      currentSize = 0
    }
    currentBatch.push(file)
    currentSize += file.content.length
  }
  if (currentBatch.length > 0) batches.push(currentBatch)
  return batches
}
// 分批处理文件并提取 API（串行）
const analyzeInBatches = async (
  files: ProjectFile[],
  framework: string,
  llmStore: ReturnType<typeof useLLMClientStore>,
  onProgress?: (batchIndex: number, totalBatches: number, message: string) => void,
  signal?: AbortSignal
): Promise<{ result: AiImportResponse; tokenUsage: TokenUsage }> => {
  const batches = createBatches(files)
  const allApis: AiRecognizedApi[] = []
  const allFolders = new Set<string>()
  const totalTokenUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
  // 串行处理每个批次
  for (let i = 0; i < batches.length; i++) {
    if (signal?.aborted) {
      throw new Error('请求已取消')
    }
    onProgress?.(i + 1, batches.length, `正在处理批次 ${i + 1}/${batches.length}...`)
    const { result, tokenUsage } = await extractApisFromCode(llmStore, framework, batches[i], signal)
    allApis.push(...result.apis)
    result.folders?.forEach(f => allFolders.add(f))
    totalTokenUsage.promptTokens += tokenUsage.promptTokens
    totalTokenUsage.completionTokens += tokenUsage.completionTokens
    totalTokenUsage.totalTokens += tokenUsage.totalTokens
  }
  // 去重
  const dedupedApis = deduplicateApis(allApis)
  return {
    result: { apis: dedupedApis, folders: Array.from(allFolders) },
    tokenUsage: totalTokenUsage,
  }
}
// Token 使用统计
type TokenUsage = {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}
// 进度回调类型
type ProgressStage = 'analyzing' | 'extracting' | 'converting'
type ProgressCallback = (stage: ProgressStage, message: string, percent: number) => void
// 完成回调类型（用于返回 Token 消耗）
type CompleteCallback = (tokenUsage: TokenUsage) => void
// 分析项目并提取 API
export const analyzeProject = async (
  projectId: string,
  llmStore: ReturnType<typeof useLLMClientStore>,
  files: ProjectFile[],
  onProgress?: ProgressCallback,
  onComplete?: CompleteCallback,
  signal?: AbortSignal
): Promise<(HttpNode | FolderNode)[]> => {
  if (!llmStore.isAvailable()) {
    throw new Error('AI 模型未配置')
  }
  if (files.length === 0) {
    throw new Error('没有可分析的文件')
  }
  // 累计 Token 消耗
  const totalTokenUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
  // 阶段 1：静态预筛选（0 Token）
  onProgress?.('analyzing', `正在预筛选 ${files.length} 个文件...`, 5)
  const { scored: prefiltered, total: totalRouteFiles } = prefilterRouteFiles(files)
  // 阶段 2：LLM 分析项目结构
  onProgress?.('analyzing', `正在分析项目结构...`, 10)
  const { result: analysis, tokenUsage: analysisTokens } = await analyzeProjectStructure(llmStore, files, signal)
  totalTokenUsage.promptTokens += analysisTokens.promptTokens
  totalTokenUsage.completionTokens += analysisTokens.completionTokens
  totalTokenUsage.totalTokens += analysisTokens.totalTokens
  onProgress?.('analyzing', `识别到 ${analysis.framework} (${analysis.language}) 框架，置信度: ${analysis.confidence}`, 20)
  // 阶段 3：确定要分析的文件列表
  let routeFiles: ProjectFile[] = []
  // 优先使用静态预筛选结果
  if (prefiltered.length > 0) {
    routeFiles = prefiltered.slice(0, MAX_ROUTE_FILES).map(item => item.file)
  } else if (analysis.routeFiles.length > 0) {
    // 回退到 LLM 识别的路由文件
    routeFiles = files
      .filter(f => analysis.routeFiles.some(rf => f.path.includes(rf) || rf.includes(f.path)))
      .slice(0, MAX_ROUTE_FILES)
  }
  // 最后回退：取前 MAX_ROUTE_FILES 个文件
  if (routeFiles.length === 0) {
    routeFiles = files.slice(0, MAX_ROUTE_FILES)
  }
  // 显示筛选信息
  const actualCount = routeFiles.length
  if (totalRouteFiles > MAX_ROUTE_FILES) {
    onProgress?.('analyzing', `共识别到 ${totalRouteFiles} 个路由文件，将分析前 ${actualCount} 个`, 25)
  } else {
    onProgress?.('analyzing', `共识别到 ${actualCount} 个路由文件`, 25)
  }
  // 阶段 4：分批提取 API
  onProgress?.('extracting', `正在从 ${actualCount} 个文件中提取 API...`, 30)
  const { result: apiResult, tokenUsage: extractTokens } = await analyzeInBatches(
    routeFiles,
    analysis.framework,
    llmStore,
    (batchIndex, totalBatches, message) => {
      // 进度从 30% 到 85%
      const progressPercent = 30 + Math.round((batchIndex / totalBatches) * 55)
      onProgress?.('extracting', message, progressPercent)
    },
    signal
  )
  totalTokenUsage.promptTokens += extractTokens.promptTokens
  totalTokenUsage.completionTokens += extractTokens.completionTokens
  totalTokenUsage.totalTokens += extractTokens.totalTokens
  onProgress?.('extracting', `成功提取 ${apiResult.apis.length} 个 API 接口`, 90)
  // 阶段 5：转换为文档格式
  onProgress?.('converting', '正在转换为文档格式...', 95)
  const nodes = convertAiResultToNodes(projectId, apiResult)
  onProgress?.('converting', `转换完成，共 ${nodes.length} 个节点`, 100)
  // 完成时回调 Token 统计
  onComplete?.(totalTokenUsage)
  return nodes
}
// 将 AI 结果转换为节点列表
const convertAiResultToNodes = (projectId: string, result: AiImportResponse): (HttpNode | FolderNode)[] => {
  const nodes: (HttpNode | FolderNode)[] = []
  const folderMap = new Map<string, FolderNode>()
  const allFolders = new Set<string>([
    ...(result.folders || []),
    ...result.apis.map(api => api.folder).filter((f): f is string => !!f),
  ])
  allFolders.forEach(folderName => {
    const folder = createEmptyFolderNode(projectId, folderName)
    folderMap.set(folderName, folder)
    nodes.push(folder)
  })
  for (const api of result.apis) {
    const node = convertApiToHttpNode(projectId, api)
    if (api.folder && folderMap.has(api.folder)) {
      node.pid = folderMap.get(api.folder)!._id
    }
    nodes.push(node)
  }
  return nodes
}
// 转换单个 API 为 HttpNode
const convertApiToHttpNode = (projectId: string, api: AiRecognizedApi): HttpNode => {
  const node = createEmptyHttpNode(projectId)
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
