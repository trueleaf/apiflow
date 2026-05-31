import type { OpenAPIV3, OpenAPIV2 } from 'openapi-types'
import type { HttpNode, FolderNode } from '@src/types'
import type { ApidocProperty, HttpNodeContentType, HttpNodeBodyMode, HttpNodeResponseContentType, HttpNodeResponseParams } from '@src/types/httpNode/types'
import { createEmptyHttpNode, createEmptyFolderNode, generateId } from '@/composables/useImport'

export type OpenApiFolderNamedType = 'tag' | 'url' | 'none'
type OpenApiDocument = OpenAPIV3.Document | OpenAPIV2.Document
type PathItem = OpenAPIV3.PathItemObject | OpenAPIV2.PathItemObject
type Operation = OpenAPIV3.OperationObject | OpenAPIV2.OperationObject
type Parameter = OpenAPIV3.ParameterObject | OpenAPIV2.ParameterObject
type RequestBody = OpenAPIV3.RequestBodyObject
type Response = OpenAPIV3.ResponseObject | OpenAPIV2.ResponseObject
type Schema = OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject
type ReferenceObject = OpenAPIV3.ReferenceObject | OpenAPIV2.ReferenceObject
const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const
const JSON_INDENT = '  '
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
// 判断是否为 OpenAPI 3.x
const isOpenAPI3 = (doc: OpenApiDocument): doc is OpenAPIV3.Document => {
  return 'openapi' in doc
}
// 判断是否为引用对象
const isReferenceObject = (value: unknown): value is ReferenceObject => {
  return typeof value === 'object' && value !== null && '$ref' in value && typeof (value as { $ref: unknown }).$ref === 'string'
}
// 获取缩进文本
const getIndent = (depth: number): string => {
  return JSON_INDENT.repeat(depth)
}
// 清理注释文本
const normalizeComment = (description: string): string => {
  return description.replace(/\r?\n+/g, ' ').replace(/\*\//g, '* /').trim()
}
// 读取本地引用
const getReferenceValue = (document: OpenApiDocument, reference: string): unknown => {
  if (!reference.startsWith('#/')) return undefined
  const segments = reference
    .slice(2)
    .split('/')
    .map(segment => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
  let current: unknown = document
  for (const segment of segments) {
    if (!current || typeof current !== 'object' || !(segment in current)) {
      return undefined
    }
    current = (current as Record<string, unknown>)[segment]
  }
  return current
}
// 解析引用对象
const resolveReference = <T extends object>(
  value: T | ReferenceObject | undefined,
  document: OpenApiDocument,
  visitedRefs = new Set<string>()
): T | undefined => {
  if (!value) return undefined
  if (!isReferenceObject(value)) return value
  if (visitedRefs.has(value.$ref)) return undefined
  const referenceValue = getReferenceValue(document, value.$ref)
  if (!referenceValue || typeof referenceValue !== 'object') return undefined
  const nextVisitedRefs = new Set(visitedRefs)
  nextVisitedRefs.add(value.$ref)
  return resolveReference(referenceValue as T | ReferenceObject, document, nextVisitedRefs)
}
// 合并 allOf schema
const mergeAllOfSchema = (schema: Schema, document: OpenApiDocument, visitedRefs: Set<string>): Schema => {
  const mergedSchema = { ...schema } as Schema & { allOf?: (Schema | ReferenceObject)[] }
  const allOf = mergedSchema.allOf
  if (!allOf || allOf.length === 0) return schema
  delete mergedSchema.allOf
  const mergedProperties: Record<string, Schema | ReferenceObject> = {
    ...((mergedSchema.properties ?? {}) as Record<string, Schema | ReferenceObject>)
  }
  const requiredSet = new Set<string>(mergedSchema.required ?? [])
  for (const item of allOf) {
    const resolvedItem = resolveSchema(item, document, visitedRefs)
    if (!resolvedItem) continue
    const itemProperties = (resolvedItem.properties ?? {}) as Record<string, Schema | ReferenceObject>
    Object.assign(mergedProperties, itemProperties)
    for (const requiredKey of resolvedItem.required ?? []) {
      requiredSet.add(requiredKey)
    }
    if (!mergedSchema.type && resolvedItem.type) {
      mergedSchema.type = resolvedItem.type
    }
    if (mergedSchema.example === undefined && 'example' in resolvedItem && resolvedItem.example !== undefined) {
      mergedSchema.example = resolvedItem.example
    }
  }
  if (Object.keys(mergedProperties).length > 0) {
    mergedSchema.properties = mergedProperties as typeof mergedSchema.properties
  }
  if (requiredSet.size > 0) {
    mergedSchema.required = [...requiredSet]
  }
  return mergedSchema
}
// 解析 schema 对象
const resolveSchema = (
  schema: Schema | ReferenceObject | undefined,
  document: OpenApiDocument,
  visitedRefs = new Set<string>()
): Schema | undefined => {
  const resolvedSchema = resolveReference<Schema>(schema, document, visitedRefs)
  if (!resolvedSchema) return undefined
  if (resolvedSchema.allOf && resolvedSchema.allOf.length > 0) {
    return mergeAllOfSchema(resolvedSchema, document, visitedRefs)
  }
  const firstCandidate = resolvedSchema.oneOf?.[0] ?? resolvedSchema.anyOf?.[0]
  if (firstCandidate) {
    return resolveSchema(firstCandidate as Schema | ReferenceObject, document, visitedRefs) ?? resolvedSchema
  }
  return resolvedSchema
}
// 获取 schema 示例值
const getSchemaExampleValue = (schema: Schema): unknown => {
  if ('example' in schema && schema.example !== undefined) {
    return schema.example
  }
  if ('default' in schema && schema.default !== undefined) {
    return schema.default
  }
  if (schema.enum && schema.enum.length > 0) {
    return schema.enum[0]
  }
  return undefined
}
// 解析 Schema 获取示例值
const getSchemaExample = (schema: Schema | ReferenceObject | undefined, document: OpenApiDocument): string => {
  const resolvedSchema = resolveSchema(schema, document)
  if (!resolvedSchema) return ''
  const schemaExample = getSchemaExampleValue(resolvedSchema)
  if (schemaExample === undefined) return ''
  return typeof schemaExample === 'string' ? schemaExample : JSON.stringify(schemaExample)
}
// 格式化示例值
const formatExampleValue = (value: unknown, depth: number): string => {
  const jsonValue = JSON.stringify(value, null, 2)
  if (!jsonValue) return 'null'
  if (!jsonValue.includes('\n')) return jsonValue
  return jsonValue
    .split('\n')
    .map((line, index) => index === 0 ? line : `${getIndent(depth)}${line}`)
    .join('\n')
}
// 获取 Content-Type
const getContentType = (operation: Operation, document: OpenApiDocument, isOpenAPI3Doc: boolean): HttpNodeContentType => {
  if (isOpenAPI3Doc) {
    const op = operation as OpenAPIV3.OperationObject
    if (op.requestBody) {
      const body = resolveReference<RequestBody>(op.requestBody, document)
      if (!body) return ''
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
const schemaToJson = (
  schema: Schema | ReferenceObject | undefined,
  document: OpenApiDocument,
  visitedRefs = new Set<string>()
): unknown => {
  const resolvedSchema = resolveSchema(schema, document, visitedRefs)
  if (!resolvedSchema) return null
  const schemaExample = getSchemaExampleValue(resolvedSchema)
  if (schemaExample !== undefined) {
    return schemaExample
  }
  if (resolvedSchema.type === 'object' || resolvedSchema.properties) {
    const obj: Record<string, unknown> = {}
    if (resolvedSchema.properties) {
      for (const [key, prop] of Object.entries(resolvedSchema.properties)) {
        obj[key] = schemaToJson(prop as Schema | ReferenceObject, document, visitedRefs)
      }
    }
    return obj
  }
  if (resolvedSchema.type === 'array' && 'items' in resolvedSchema && resolvedSchema.items) {
    return [schemaToJson(resolvedSchema.items as Schema | ReferenceObject, document, visitedRefs)]
  }
  switch (resolvedSchema.type) {
    case 'string':
      return resolvedSchema.default ?? ''
    case 'number':
    case 'integer':
      return resolvedSchema.default ?? 0
    case 'boolean':
      return resolvedSchema.default ?? false
    default:
      return null
  }
}
// 生成带注释的 JSON 字符串
const schemaToCommentedJson = (
  schema: Schema | ReferenceObject | undefined,
  document: OpenApiDocument,
  depth = 0,
  exampleValue?: unknown,
  visitedRefs = new Set<string>()
): string => {
  const resolvedSchema = resolveSchema(schema, document, visitedRefs)
  if (!resolvedSchema) return 'null'
  const schemaExample = exampleValue !== undefined ? exampleValue : getSchemaExampleValue(resolvedSchema)
  if (resolvedSchema.type === 'object' || resolvedSchema.properties) {
    const properties = Object.entries(resolvedSchema.properties ?? {})
    if (properties.length === 0) {
      if (schemaExample !== undefined) {
        return formatExampleValue(schemaExample, depth)
      }
      return '{}'
    }
    const lines = properties.map(([key, prop], index) => {
      const propSchema = resolveSchema(prop as Schema | ReferenceObject, document, visitedRefs)
      const childExample = schemaExample && typeof schemaExample === 'object' && !Array.isArray(schemaExample)
        ? (schemaExample as Record<string, unknown>)[key]
        : undefined
      const valueText = schemaToCommentedJson(prop as Schema | ReferenceObject, document, depth + 1, childExample, visitedRefs)
      const suffix = index === properties.length - 1 ? '' : ','
      const comment = propSchema?.description ? ` //${normalizeComment(propSchema.description)}` : ''
      return `${getIndent(depth + 1)}${JSON.stringify(key)}: ${valueText}${suffix}${comment}`
    })
    return `{\n${lines.join('\n')}\n${getIndent(depth)}}`
  }
  if (resolvedSchema.type === 'array' && 'items' in resolvedSchema && resolvedSchema.items) {
    const itemSchema = resolvedSchema.items as Schema | ReferenceObject
    const itemExample = Array.isArray(schemaExample) ? schemaExample[0] : undefined
    const itemText = schemaToCommentedJson(itemSchema, document, depth + 1, itemExample, visitedRefs)
    const resolvedItemSchema = resolveSchema(itemSchema, document, visitedRefs)
    const itemComment = resolvedItemSchema?.description ? ` //${normalizeComment(resolvedItemSchema.description)}` : ''
    return `[\n${getIndent(depth + 1)}${itemText}${itemComment}\n${getIndent(depth)}]`
  }
  if (schemaExample !== undefined) {
    return formatExampleValue(schemaExample, depth)
  }
  switch (resolvedSchema.type) {
    case 'string':
      return JSON.stringify(resolvedSchema.default ?? '')
    case 'number':
    case 'integer':
      return JSON.stringify(resolvedSchema.default ?? 0)
    case 'boolean':
      return JSON.stringify(resolvedSchema.default ?? false)
    default:
      return 'null'
  }
}
// 获取响应状态码
const getResponseStatusCode = (statusCode: string): number | undefined => {
  if (/^\d+$/.test(statusCode)) {
    return Number(statusCode)
  }
  if (statusCode === 'default') {
    return 200
  }
  return undefined
}
// 获取 OpenAPI3 响应内容
const getOpenAPI3ResponseContent = (
  response: Response,
  document: OpenApiDocument
): { dataType: HttpNodeResponseContentType; schema?: Schema | ReferenceObject; text: string } => {
  const openAPI3Response = response as OpenAPIV3.ResponseObject
  const contentEntries = Object.entries(openAPI3Response.content ?? {})
  if (contentEntries.length === 0) {
    return { dataType: 'application/json', text: '' }
  }
  const matchedEntry = contentEntries.find(([contentType]) => contentType === 'application/json') ?? contentEntries[0]
  const [contentType, mediaType] = matchedEntry
  const firstExample = Object.values(mediaType.examples ?? {})[0]
  const resolvedExample = resolveReference<OpenAPIV3.ExampleObject>(firstExample as OpenAPIV3.ExampleObject | ReferenceObject | undefined, document)
  const mediaTypeExample = mediaType.example ?? resolvedExample?.value
  const text = mediaTypeExample === undefined
    ? ''
    : typeof mediaTypeExample === 'string'
      ? mediaTypeExample
      : JSON.stringify(mediaTypeExample, null, 2)
  return {
    dataType: contentType as HttpNodeResponseContentType,
    schema: mediaType.schema as Schema | ReferenceObject | undefined,
    text,
  }
}
// 获取 Swagger 响应内容
const getSwaggerResponseContent = (
  response: Response,
  operation: OpenAPIV2.OperationObject,
  document: OpenAPIV2.Document
): { dataType: HttpNodeResponseContentType; schema?: Schema | ReferenceObject; text: string } => {
  const swaggerResponse = response as OpenAPIV2.ResponseObject
  const produces = operation.produces ?? document.produces ?? []
  const dataType = (produces.find(contentType => contentType === 'application/json') ?? produces[0] ?? 'application/json') as HttpNodeResponseContentType
  const exampleValue = swaggerResponse.examples?.[dataType]
  const text = exampleValue === undefined
    ? ''
    : typeof exampleValue === 'string'
      ? exampleValue
      : JSON.stringify(exampleValue, null, 2)
  return {
    dataType,
    schema: swaggerResponse.schema as Schema | ReferenceObject | undefined,
    text,
  }
}
// 解析 OpenAPI 3.x 请求体
const parseOpenAPI3RequestBody = (
  requestBody: OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject | undefined,
  node: HttpNode,
  document: OpenApiDocument
) => {
  const body = resolveReference<RequestBody>(requestBody, document)
  if (!body) return
  if (!body.content) return
  const contentType = Object.keys(body.content)[0]
  if (!contentType) return
  const mediaType = body.content[contentType]
  const schema = mediaType?.schema as Schema | ReferenceObject | undefined
  if (contentType === 'application/json') {
    node.item.requestBody.mode = 'json'
    if (schema) {
      const jsonData = schemaToJson(schema, document)
      node.item.requestBody.rawJson = jsonData ? JSON.stringify(jsonData, null, 2) : ''
    }
  } else if (contentType === 'multipart/form-data') {
    node.item.requestBody.mode = 'formdata'
    const resolvedSchema = resolveSchema(schema, document)
    if (resolvedSchema?.properties) {
      node.item.requestBody.formdata = Object.entries(resolvedSchema.properties).map(([key, prop]) => {
        const propSchema = resolveSchema(prop as Schema | ReferenceObject, document)
        const isFile = propSchema?.type === 'string' && propSchema.format === 'binary'
        return {
          _id: generateId(),
          key,
          value: isFile ? '' : getSchemaExample(prop as Schema | ReferenceObject, document),
          type: isFile ? 'file' : 'string',
          required: resolvedSchema.required?.includes(key) ?? false,
          description: propSchema?.description || '',
          select: true,
        } as ApidocProperty<'string' | 'file'>
      })
    }
  } else if (contentType === 'application/x-www-form-urlencoded') {
    node.item.requestBody.mode = 'urlencoded'
    const resolvedSchema = resolveSchema(schema, document)
    if (resolvedSchema?.properties) {
      node.item.requestBody.urlencoded = Object.entries(resolvedSchema.properties).map(([key, prop]) => {
        const propSchema = resolveSchema(prop as Schema | ReferenceObject, document)
        return createProperty(
          key,
          getSchemaExample(prop as Schema | ReferenceObject, document),
          propSchema?.description || '',
          resolvedSchema.required?.includes(key) ?? false
        )
      })
    }
  }
}
// 解析 OpenAPI 2.x (Swagger) 请求体
const parseSwaggerRequestBody = (
  parameters: (OpenAPIV2.ParameterObject | ReferenceObject)[] | undefined,
  node: HttpNode,
  document: OpenApiDocument
) => {
  if (!parameters) return
  const resolvedParameters = parameters
    .map(parameter => resolveReference<OpenAPIV2.ParameterObject>(parameter, document))
    .filter((parameter): parameter is OpenAPIV2.ParameterObject => parameter !== undefined)
  const bodyParam = resolvedParameters.find(p => p.in === 'body')
  if (bodyParam && 'schema' in bodyParam) {
    node.item.requestBody.mode = 'json'
    const jsonData = schemaToJson(bodyParam.schema as Schema | ReferenceObject, document)
    node.item.requestBody.rawJson = jsonData ? JSON.stringify(jsonData, null, 2) : ''
  }
  const formDataParams = resolvedParameters.filter(p => p.in === 'formData')
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
  node: HttpNode,
  document: OpenApiDocument
) => {
  if (!parameters) return
  for (const param of parameters) {
    const p = resolveReference<Parameter>(param as Parameter | ReferenceObject, document)
    if (!p) continue
    const property = createProperty(
      p.name,
      getSchemaExample('schema' in p ? p.schema as Schema | ReferenceObject : undefined, document) || (p as OpenAPIV2.ParameterObject).default?.toString() || '',
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
// 解析响应参数
const parseResponses = (operation: Operation, node: HttpNode, document: OpenApiDocument, isOpenAPI3Doc: boolean) => {
  const responseEntries = Object.entries(operation.responses ?? {})
  if (responseEntries.length === 0) return
  const parsedResponses: HttpNodeResponseParams[] = []
  for (const [statusCode, responseInfo] of responseEntries) {
    const resolvedResponse = resolveReference<Response>(responseInfo as Response | ReferenceObject, document)
    if (!resolvedResponse) continue
    const normalizedStatusCode = getResponseStatusCode(statusCode)
    if (normalizedStatusCode === undefined) continue
    const responseContent = isOpenAPI3Doc
      ? getOpenAPI3ResponseContent(resolvedResponse, document)
      : getSwaggerResponseContent(resolvedResponse, operation as OpenAPIV2.OperationObject, document as OpenAPIV2.Document)
    const hasJsonSchema = responseContent.dataType === 'application/json' && responseContent.schema
    parsedResponses.push({
      _id: generateId(),
      title: resolvedResponse.description || `HTTP ${statusCode}`,
      statusCode: normalizedStatusCode,
      value: {
        dataType: responseContent.dataType,
        strJson: hasJsonSchema ? schemaToCommentedJson(responseContent.schema, document) : '',
        text: hasJsonSchema ? '' : responseContent.text,
        file: {
          url: '',
          raw: '',
        },
      },
    })
  }
  if (parsedResponses.length > 0) {
    node.item.responseParams = parsedResponses
  }
}
// OpenAPI 转换器类
export class OpenApiTranslator {
  private projectId: string
  private document: OpenApiDocument
  private isOpenAPI3Doc: boolean
  constructor(projectId: string, document: OpenApiDocument) {
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
        node.item.contentType = getContentType(operation, this.document, this.isOpenAPI3Doc)
        node.item.requestBody.mode = getBodyMode(node.item.contentType)
        const allParameters = [
          ...((pathItem as PathItem).parameters || []),
          ...(operation.parameters || []),
        ]
        parseParameters(allParameters, node, this.document)
        if (this.isOpenAPI3Doc) {
          const op = operation as OpenAPIV3.OperationObject
          parseOpenAPI3RequestBody(op.requestBody, node, this.document)
        } else {
          parseSwaggerRequestBody(operation.parameters as (OpenAPIV2.ParameterObject | ReferenceObject)[] | undefined, node, this.document)
        }
        parseResponses(operation, node, this.document, this.isOpenAPI3Doc)
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
