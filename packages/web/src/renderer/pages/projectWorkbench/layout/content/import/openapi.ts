import type { OpenAPIV3, OpenAPIV2 } from 'openapi-types'
import type { HttpNode, FolderNode } from '@src/types'
import type { ApidocProperty, HttpNodeContentType, HttpNodeBodyMode } from '@src/types/httpNode/types'
import { createEmptyHttpNode, createEmptyFolderNode, generateId } from '@/composables/useImport'

export type OpenApiFolderNamedType = 'tag' | 'url' | 'none'
type PathItem = OpenAPIV3.PathItemObject | OpenAPIV2.PathItemObject
type Operation = OpenAPIV3.OperationObject | OpenAPIV2.OperationObject
type Parameter = OpenAPIV3.ParameterObject | OpenAPIV2.ParameterObject
type RequestBody = OpenAPIV3.RequestBodyObject
type Schema = OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject
const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const
// 创建参数属性
const createProperty = (key: string, value = '', description = '', required = false): ApidocProperty<'string'> => ({
  _id: generateId(),
  key,
  value,
  type: 'string',
  required,
  description,
  select: true,
})
// 解析 Schema 获取示例值
const getSchemaExample = (schema: Schema | undefined): string => {
  if (!schema) return ''
  if ('example' in schema && schema.example !== undefined) {
    return typeof schema.example === 'string' ? schema.example : JSON.stringify(schema.example)
  }
  if ('default' in schema && schema.default !== undefined) {
    return typeof schema.default === 'string' ? schema.default : JSON.stringify(schema.default)
  }
  return ''
}
// 判断是否为 OpenAPI 3.x
const isOpenAPI3 = (doc: OpenAPIV3.Document | OpenAPIV2.Document): doc is OpenAPIV3.Document => {
  return 'openapi' in doc
}
// 获取 Content-Type
const getContentType = (operation: Operation, isOpenAPI3Doc: boolean): HttpNodeContentType => {
  if (isOpenAPI3Doc) {
    const op = operation as OpenAPIV3.OperationObject
    if (op.requestBody) {
      const body = op.requestBody as RequestBody
      if (body.content) {
        const contentTypes = Object.keys(body.content)
        if (contentTypes.includes('application/json')) return 'application/json'
        if (contentTypes.includes('multipart/form-data')) return 'multipart/form-data'
        if (contentTypes.includes('application/x-www-form-urlencoded')) return 'application/x-www-form-urlencoded'
        if (contentTypes.length > 0) return contentTypes[0] as HttpNodeContentType
      }
    }
  } else {
    const op = operation as OpenAPIV2.OperationObject
    if (op.consumes && op.consumes.length > 0) {
      if (op.consumes.includes('application/json')) return 'application/json'
      if (op.consumes.includes('multipart/form-data')) return 'multipart/form-data'
      if (op.consumes.includes('application/x-www-form-urlencoded')) return 'application/x-www-form-urlencoded'
      return op.consumes[0] as HttpNodeContentType
    }
  }
  return ''
}
// 获取 Body Mode
const getBodyMode = (contentType: HttpNodeContentType): HttpNodeBodyMode => {
  switch (contentType) {
    case 'application/json':
      return 'json'
    case 'multipart/form-data':
      return 'formdata'
    case 'application/x-www-form-urlencoded':
      return 'urlencoded'
    case 'application/octet-stream':
      return 'binary'
    default:
      return 'none'
  }
}
// 解析 JSON Schema 为 JSON 字符串
const schemaToJson = (schema: Schema | undefined, visited = new Set<Schema>()): unknown => {
  if (!schema) return null
  if (visited.has(schema)) return null
  visited.add(schema)
  if ('example' in schema && schema.example !== undefined) {
    return schema.example
  }
  if (schema.type === 'object' || schema.properties) {
    const obj: Record<string, unknown> = {}
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        obj[key] = schemaToJson(prop as Schema, visited)
      }
    }
    return obj
  }
  if (schema.type === 'array' && 'items' in schema && schema.items) {
    return [schemaToJson(schema.items as Schema, visited)]
  }
  switch (schema.type) {
    case 'string':
      return schema.default ?? ''
    case 'number':
    case 'integer':
      return schema.default ?? 0
    case 'boolean':
      return schema.default ?? false
    default:
      return null
  }
}
// 解析 OpenAPI 3.x 请求体
const parseOpenAPI3RequestBody = (
  requestBody: OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject | undefined,
  node: HttpNode
) => {
  if (!requestBody || '$ref' in requestBody) return
  const body = requestBody as RequestBody
  if (!body.content) return
  const contentType = Object.keys(body.content)[0]
  if (!contentType) return
  const mediaType = body.content[contentType]
  const schema = mediaType?.schema as Schema | undefined
  if (contentType === 'application/json') {
    node.item.requestBody.mode = 'json'
    if (schema) {
      const jsonData = schemaToJson(schema)
      node.item.requestBody.rawJson = jsonData ? JSON.stringify(jsonData, null, 2) : ''
    }
  } else if (contentType === 'multipart/form-data') {
    node.item.requestBody.mode = 'formdata'
    if (schema?.properties) {
      node.item.requestBody.formdata = Object.entries(schema.properties).map(([key, prop]) => {
        const propSchema = prop as Schema
        const isFile = propSchema.type === 'string' && propSchema.format === 'binary'
        return {
          _id: generateId(),
          key,
          value: isFile ? '' : getSchemaExample(propSchema),
          type: isFile ? 'file' : 'string',
          required: schema.required?.includes(key) ?? false,
          description: propSchema.description || '',
          select: true,
        } as ApidocProperty<'string' | 'file'>
      })
    }
  } else if (contentType === 'application/x-www-form-urlencoded') {
    node.item.requestBody.mode = 'urlencoded'
    if (schema?.properties) {
      node.item.requestBody.urlencoded = Object.entries(schema.properties).map(([key, prop]) => {
        const propSchema = prop as Schema
        return createProperty(
          key,
          getSchemaExample(propSchema),
          propSchema.description || '',
          schema.required?.includes(key) ?? false
        )
      })
    }
  }
}
// 解析 OpenAPI 2.x (Swagger) 请求体
const parseSwaggerRequestBody = (
  parameters: OpenAPIV2.ParameterObject[] | undefined,
  node: HttpNode
) => {
  if (!parameters) return
  const bodyParam = parameters.find(p => p.in === 'body')
  if (bodyParam && 'schema' in bodyParam) {
    node.item.requestBody.mode = 'json'
    const jsonData = schemaToJson(bodyParam.schema as Schema)
    node.item.requestBody.rawJson = jsonData ? JSON.stringify(jsonData, null, 2) : ''
  }
  const formDataParams = parameters.filter(p => p.in === 'formData')
  if (formDataParams.length > 0) {
    const hasFile = formDataParams.some(p => p.type === 'file')
    if (hasFile) {
      node.item.requestBody.mode = 'formdata'
      node.item.requestBody.formdata = formDataParams.map(p => ({
        _id: generateId(),
        key: p.name,
        value: p.type === 'file' ? '' : (p.default?.toString() ?? ''),
        type: p.type === 'file' ? 'file' : 'string',
        required: p.required ?? false,
        description: p.description || '',
        select: true,
      } as ApidocProperty<'string' | 'file'>))
    } else {
      node.item.requestBody.mode = 'urlencoded'
      node.item.requestBody.urlencoded = formDataParams.map(p =>
        createProperty(p.name, p.default?.toString() ?? '', p.description || '', p.required ?? false)
      )
    }
  }
}
// 解析参数
const parseParameters = (
  parameters: (Parameter | OpenAPIV3.ReferenceObject)[] | undefined,
  node: HttpNode
) => {
  if (!parameters) return
  for (const param of parameters) {
    if ('$ref' in param) continue
    const p = param as Parameter
    const property = createProperty(
      p.name,
      getSchemaExample('schema' in p ? p.schema as Schema : undefined) || (p as OpenAPIV2.ParameterObject).default?.toString() || '',
      p.description || '',
      p.required ?? false
    )
    switch (p.in) {
      case 'query':
        node.item.queryParams.push(property)
        break
      case 'path':
        node.item.paths.push(property)
        break
      case 'header':
        node.item.headers.push(property)
        break
    }
  }
}
// OpenAPI 转换器类
export class OpenApiTranslator {
  private projectId: string
  private document: OpenAPIV3.Document | OpenAPIV2.Document
  private isOpenAPI3Doc: boolean
  constructor(projectId: string, document: OpenAPIV3.Document | OpenAPIV2.Document) {
    this.projectId = projectId
    this.document = document
    this.isOpenAPI3Doc = isOpenAPI3(document)
  }
  // 获取基础 URL
  getBaseUrl(): string {
    if (this.isOpenAPI3Doc) {
      const doc = this.document as OpenAPIV3.Document
      if (doc.servers && doc.servers.length > 0) {
        return doc.servers[0].url
      }
    } else {
      const doc = this.document as OpenAPIV2.Document
      const scheme = doc.schemes?.[0] || 'https'
      const host = doc.host || ''
      const basePath = doc.basePath || ''
      if (host) {
        return `${scheme}://${host}${basePath}`
      }
    }
    return ''
  }
  // 转换为 apiflow 格式文档
  getDocsInfo(folderNamedType: OpenApiFolderNamedType = 'tag'): (HttpNode | FolderNode)[] {
    const result: (HttpNode | FolderNode)[] = []
    const folderMap = new Map<string, FolderNode>()
    const baseUrl = this.getBaseUrl()
    if (!this.document.paths) return result
    for (const [path, pathItem] of Object.entries(this.document.paths)) {
      if (!pathItem) continue
      for (const method of HTTP_METHODS) {
        const operation = pathItem[method as keyof PathItem] as Operation | undefined
        if (!operation) continue
        const node = createEmptyHttpNode(this.projectId)
        node.info.name = operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`
        node.info.description = operation.description || ''
        node.item.method = method
        node.item.url.prefix = baseUrl
        node.item.url.path = path
        node.item.contentType = getContentType(operation, this.isOpenAPI3Doc)
        node.item.requestBody.mode = getBodyMode(node.item.contentType)
        const allParameters = [
          ...((pathItem as PathItem).parameters || []),
          ...(operation.parameters || []),
        ]
        parseParameters(allParameters, node)
        if (this.isOpenAPI3Doc) {
          const op = operation as OpenAPIV3.OperationObject
          parseOpenAPI3RequestBody(op.requestBody, node)
        } else {
          parseSwaggerRequestBody(operation.parameters as OpenAPIV2.ParameterObject[], node)
        }
        if (folderNamedType === 'none') {
          result.push(node)
        } else if (folderNamedType === 'tag') {
          const tag = operation.tags?.[0] || 'default'
          let folder = folderMap.get(tag)
          if (!folder) {
            folder = createEmptyFolderNode(this.projectId, tag)
            folderMap.set(tag, folder)
            result.push(folder)
          }
          node.pid = folder._id
          result.push(node)
        } else if (folderNamedType === 'url') {
          const segments = path.split('/').filter(Boolean)
          const folderName = segments[0] || 'root'
          let folder = folderMap.get(folderName)
          if (!folder) {
            folder = createEmptyFolderNode(this.projectId, folderName)
            folderMap.set(folderName, folder)
            result.push(folder)
          }
          node.pid = folder._id
          result.push(node)
        }
      }
    }
    return result
  }
}
export default OpenApiTranslator