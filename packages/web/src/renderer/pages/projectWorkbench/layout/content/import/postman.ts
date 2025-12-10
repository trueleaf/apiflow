import type { HttpNode, FolderNode } from '@src/types'
import type { ApidocProperty, HttpNodeContentType, HttpNodeBodyMode } from '@src/types/httpNode/types'
import { createEmptyHttpNode, createEmptyFolderNode, generateId, type PostmanCollection, type PostmanItem } from '@/composables/useImport'

// 解析 Postman URL
const parsePostmanUrl = (url: PostmanItem['request']): { prefix: string; path: string } => {
  if (!url) return { prefix: '', path: '' }
  const request = url
  if (!request.url) return { prefix: '', path: '' }
  if (typeof request.url === 'string') {
    try {
      const urlObj = new URL(request.url)
      return {
        prefix: `${urlObj.protocol}//${urlObj.host}`,
        path: urlObj.pathname,
      }
    } catch {
      return { prefix: '', path: request.url }
    }
  }
  const urlObj = request.url
  const host = Array.isArray(urlObj.host) ? urlObj.host.join('.') : (urlObj.host || '')
  const path = Array.isArray(urlObj.path) ? '/' + urlObj.path.join('/') : ''
  const protocol = urlObj.raw?.match(/^(\w+):\/\//)?.[1] || 'https'
  return {
    prefix: host ? `${protocol}://${host}` : '',
    path,
  }
}
// 获取 Content-Type
const getContentType = (request: PostmanItem['request']): HttpNodeContentType => {
  if (!request?.body) return ''
  const mode = request.body.mode
  switch (mode) {
    case 'raw':
      const contentTypeHeader = request.header?.find(h => h.key.toLowerCase() === 'content-type')
      if (contentTypeHeader?.value?.includes('json')) return 'application/json'
      if (contentTypeHeader?.value?.includes('xml')) return 'application/xml'
      return 'text/plain'
    case 'formdata':
      return 'multipart/form-data'
    case 'urlencoded':
      return 'application/x-www-form-urlencoded'
    default:
      return ''
  }
}
// 获取 Body Mode
const getBodyMode = (request: PostmanItem['request']): HttpNodeBodyMode => {
  if (!request?.body) return 'none'
  switch (request.body.mode) {
    case 'raw':
      const contentTypeHeader = request.header?.find(h => h.key.toLowerCase() === 'content-type')
      if (contentTypeHeader?.value?.includes('json')) return 'json'
      return 'raw'
    case 'formdata':
      return 'formdata'
    case 'urlencoded':
      return 'urlencoded'
    case 'file':
      return 'binary'
    default:
      return 'none'
  }
}
// 解析请求体
const parseRequestBody = (request: PostmanItem['request'], node: HttpNode) => {
  if (!request?.body) return
  const body = request.body
  const mode = getBodyMode(request)
  node.item.requestBody.mode = mode
  switch (body.mode) {
    case 'raw':
      if (mode === 'json') {
        node.item.requestBody.rawJson = body.raw || ''
      } else {
        node.item.requestBody.raw.data = body.raw || ''
        node.item.requestBody.raw.dataType = 'text/plain'
      }
      break
    case 'formdata':
      if (body.formdata) {
        node.item.requestBody.formdata = body.formdata.map(item => ({
          _id: generateId(),
          key: item.key,
          value: item.value || '',
          type: item.type === 'file' ? 'file' : 'string',
          required: false,
          description: '',
          select: true,
        } as ApidocProperty<'string' | 'file'>))
      }
      break
    case 'urlencoded':
      if (body.urlencoded) {
        node.item.requestBody.urlencoded = body.urlencoded.map(item => ({
          _id: generateId(),
          key: item.key,
          value: item.value || '',
          type: 'string',
          required: false,
          description: '',
          select: true,
        }))
      }
      break
  }
}
// 解析请求头
const parseHeaders = (request: PostmanItem['request'], node: HttpNode) => {
  if (!request?.header) return
  node.item.headers = request.header
    .filter(h => h.key.toLowerCase() !== 'content-type')
    .map(h => ({
      _id: generateId(),
      key: h.key,
      value: h.value,
      type: 'string' as const,
      required: false,
      description: '',
      select: !h.disabled,
    }))
}
// 解析 Query 参数
const parseQueryParams = (request: PostmanItem['request'], node: HttpNode) => {
  if (!request?.url || typeof request.url === 'string') return
  const query = request.url.query
  if (!query) return
  node.item.queryParams = query.map(q => ({
    _id: generateId(),
    key: q.key,
    value: q.value || '',
    type: 'string' as const,
    required: false,
    description: '',
    select: !q.disabled,
  }))
}
// Postman 转换器类
export class PostmanTranslator {
  private projectId: string
  private collection: PostmanCollection
  constructor(projectId: string, collection: PostmanCollection) {
    this.projectId = projectId
    this.collection = collection
  }
  // 递归转换 Postman Item
  private convertItems(items: PostmanItem[], parentId = ''): (HttpNode | FolderNode)[] {
    const result: (HttpNode | FolderNode)[] = []
    for (const item of items) {
      if (item.item && item.item.length > 0) {
        const folder = createEmptyFolderNode(this.projectId, item.name, parentId)
        result.push(folder)
        const children = this.convertItems(item.item, folder._id)
        result.push(...children)
      } else if (item.request) {
        const node = createEmptyHttpNode(this.projectId, parentId)
        node.info.name = item.name
        node.item.method = (item.request.method?.toLowerCase() || 'get') as HttpNode['item']['method']
        const urlInfo = parsePostmanUrl(item.request)
        node.item.url.prefix = urlInfo.prefix
        node.item.url.path = urlInfo.path
        node.item.contentType = getContentType(item.request)
        parseHeaders(item.request, node)
        parseQueryParams(item.request, node)
        parseRequestBody(item.request, node)
        result.push(node)
      }
    }
    return result
  }
  // 转换为 apiflow 格式文档
  getDocsInfo(): (HttpNode | FolderNode)[] {
    if (!this.collection.item) return []
    return this.convertItems(this.collection.item)
  }
}
export default PostmanTranslator