import { i18n } from '@/i18n'
import { useSkill } from '../skillStore'
import { useLLMClientStore } from '../llmClientStore'
import { AgentTool } from '@src/types/ai'
import { HttpNodeRequestMethod, ApidocProperty, HttpNodeContentType, HttpNodeBodyMode, HttpNodeBodyRawType, HttpNodeResponseParams, Language } from '@src/types'
import { CreateHttpNodeOptions } from '@src/types/ai/tools.type'
import { nanoid } from 'nanoid'
import { simpleCreateHttpNodePrompt } from '@/store/ai/prompt/prompt'
import { createErrorResponse, createSuccessResponse } from '@src/types/ai/toolError'
import { validateToolArgs, validators, createValidationErrorResponse } from './validators'

//名称生成缓存：基于API特征的哈希作为key
const nameGenerationCache = new Map<string, { name: string; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 30 //缓存30分钟
//清理过期缓存
const cleanExpiredCache = () => {
  const now = Date.now()
  for (const [key, value] of nameGenerationCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      nameGenerationCache.delete(key)
    }
  }
}
//生成缓存key
const generateCacheKey = (method: string, urlPath: string, description: string): string => {
  return `${method}:${urlPath}:${description.slice(0, 50)}`
}
//智能截断名称，处理多字节字符（中文、emoji等）
const truncateName = (name: string, maxLength: number): string => {
  if (!name || name.length <= maxLength) return name
  //使用Intl.Segmenter处理多字节字符（支持emoji、中文等）
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
      const graphemes = Array.from(segmenter.segment(name), s => s.segment)
      if (graphemes.length <= maxLength) return name
      return graphemes.slice(0, maxLength).join('') + '…'
    } catch (error) {
      console.warn('Intl.Segmenter not available, falling back to simple slice')
    }
  }
  //降级方案：简单截断
  return name.slice(0, maxLength) + (name.length > maxLength ? '…' : '')
}

type LLMInferredParam = {
  key?: string
  value?: string
  description?: string
  required?: boolean
}
type LLMInferredParams = {
  name?: string
  method?: string
  urlPath?: string
  description?: string
  bodyMode?: string
  rawJson?: string
  queryParams?: LLMInferredParam[]
  headers?: LLMInferredParam[]
}
//将LLM返回的简化JSON转换为完整的CreateHttpNodeOptions
const buildCreateHttpNodeOptions = (projectId: string, params: LLMInferredParams, pid?: string): CreateHttpNodeOptions => {
  const options: CreateHttpNodeOptions = {
    projectId,
    pid: pid || '',
    name: params.name || i18n.global.t('未命名接口'),
    description: params.description || '',
  }
  options.item = {
    method: (params.method as HttpNodeRequestMethod) || 'GET',
    url: { path: params.urlPath || '/' },
  }
  if (Array.isArray(params.queryParams) && params.queryParams.length > 0) {
    options.item.queryParams = params.queryParams.map(p => ({
      _id: nanoid(),
      key: p.key || '',
      value: p.value || '',
      type: 'string' as const,
      required: p.required ?? true,
      description: p.description || '',
      select: true,
    }))
  }
  if (Array.isArray(params.headers) && params.headers.length > 0) {
    options.item.headers = params.headers.map(h => ({
      _id: nanoid(),
      key: h.key || '',
      value: h.value || '',
      type: 'string' as const,
      required: h.required ?? false,
      description: h.description || '',
      select: true,
    }))
  }
  if (params.bodyMode && params.bodyMode !== 'none') {
    options.item.requestBody = { mode: params.bodyMode as HttpNodeBodyMode }
    if (params.bodyMode === 'json' && params.rawJson) {
      options.item.requestBody.rawJson = params.rawJson
    }
  }
  return options
}

export const httpNodeTools: AgentTool[] = [
  {
    name: 'simpleCreateHttpNode',
    description: 'Create an HTTP API node from natural language description (Smart Mode - Recommended). Automatically infers HTTP method, URL path, query parameters, headers, and request body structure from user input. Use this when the user provides a high-level API description without specifying technical details. Example: "Create a user login API requiring username and password" will auto-generate POST method, /login path, and JSON body with username/password fields.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project where the API node will be created',
        },
        description: {
          type: 'string',
          description: 'Natural language description of the API behavior and requirements. Be specific about the API purpose, required parameters, and expected functionality.',
        },
         pid: {
          type: 'string',
          description: 'Optional parent folder ID to organize the API. If omitted or empty string, the API will be created at the root level',
        },
      },
      required: ['projectId', 'description'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const llmClientStore = useLLMClientStore()
      const projectId = args.projectId as string
      const description = args.description as string
      const pid = typeof args.pid === 'string' ? args.pid : ''
      const targetLanguage = (args._targetLanguage as Language) || 'zh-cn'
      const languageInstruction = {
        'zh-cn': '[CRITICAL] You MUST generate all text fields (name, description) in Simplified Chinese.',
        'zh-tw': '[CRITICAL] You MUST generate all text fields (name, description) in Traditional Chinese.',
        'en': '[CRITICAL] You MUST generate all text fields (name, description) in English.',
        'ja': '[CRITICAL] You MUST generate all text fields (name, description) in Japanese.',
      }[targetLanguage]
      try {
        const response = await llmClientStore.chat({
          messages: [
            { role: 'system', content: simpleCreateHttpNodePrompt },
            { role: 'system', content: languageInstruction },
            { role: 'user', content: description }
          ],
          response_format: { type: 'json_object' }
        })
        const content = response.choices[0]?.message?.content || '{}'
        const inferredParams: LLMInferredParams = JSON.parse(content)
        const options = buildCreateHttpNodeOptions(projectId, inferredParams, pid)
        const node = await skillStore.createHttpNode(options)
        return { code: node ? 0 : 1, data: node }
      } catch (error) {
        return { code: 1, data: { error: error instanceof Error ? error.message : i18n.global.t('创建失败') } }
      }
    },
  },
  {
    name: 'createHttpNode',
    description: 'Create an HTTP API node with complete control over all parameters (Precise Mode). Use this when you need explicit control over every aspect of the API configuration: method, URL, query parameters, headers, body structure, response definitions, and scripts. For simpler creation from natural language, prefer simpleCreateHttpNode instead.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project where the API node will be created',
        },
        name: {
          type: 'string',
          description: 'The display name for the API node',
        },
        pid: {
          type: 'string',
          description: 'Optional parent folder ID. If omitted or empty string, the API will be created at the root level',
        },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
          description: 'Request method, default GET',
        },
        urlPath: {
          type: 'string',
          description: 'Request path, e.g., /api/users',
        },
        urlPrefix: {
          type: 'string',
          description: 'Request path prefix',
        },
        description: {
          type: 'string',
          description: 'API description',
        },
        version: {
          type: 'string',
          description: 'Version information',
        },
        creator: {
          type: 'string',
          description: 'Creator',
        },
        maintainer: {
          type: 'string',
          description: 'Maintainer',
        },
        contentType: {
          type: 'string',
          enum: ['', 'application/json', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain', 'application/xml', 'text/html', 'text/javascript', 'application/octet-stream'],
          description: 'Content-Type request header',
        },
        bodyMode: {
          type: 'string',
          enum: ['json', 'raw', 'formdata', 'urlencoded', 'binary', 'none'],
          description: 'Request body mode',
        },
        rawJson: {
          type: 'string',
          description: 'JSON formatted body content (use when bodyMode is json)',
        },
        queryParams: {
          type: 'array',
          description: 'Query parameter array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Parameter ID' },
              key: { type: 'string', description: 'Parameter name (key)' },
              value: { type: 'string', description: 'Parameter value' },
              type: { type: 'string', const: 'string', description: 'Parameter type' },
              required: { type: 'boolean', description: 'Required' },
              description: { type: 'string', description: 'Note' },
              select: { type: 'boolean', description: 'Selected' },
            },
            required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
          },
        },
        pathParams: {
          type: 'array',
          description: 'RESTful path parameter array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Parameter ID' },
              key: { type: 'string', description: 'Parameter name (key)' },
              value: { type: 'string', description: 'Parameter value' },
              type: { type: 'string', const: 'string', description: 'Parameter type' },
              required: { type: 'boolean', description: 'Required' },
              description: { type: 'string', description: 'Note' },
              select: { type: 'boolean', description: 'Selected' },
            },
            required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
          },
        },
        headers: {
          type: 'array',
          description: 'Request header array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Parameter ID' },
              key: { type: 'string', description: 'Header name' },
              value: { type: 'string', description: 'Header value' },
              type: { type: 'string', const: 'string', description: 'Parameter type' },
              required: { type: 'boolean', description: 'Required' },
              description: { type: 'string', description: 'Note' },
              select: { type: 'boolean', description: 'Selected' },
            },
            required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
          },
        },
        formdata: {
          type: 'array',
          description: 'Formdata parameter array (use when bodyMode is formdata)',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Parameter ID' },
              key: { type: 'string', description: 'Parameter name (key)' },
              value: { type: 'string', description: 'Parameter value' },
              type: { type: 'string', enum: ['string', 'file'], description: 'Parameter type' },
              required: { type: 'boolean', description: 'Required' },
              description: { type: 'string', description: 'Note' },
              select: { type: 'boolean', description: 'Selected' },
            },
            required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
          },
        },
        urlencoded: {
          type: 'array',
          description: 'Urlencoded parameter array (use when bodyMode is urlencoded)',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Parameter ID' },
              key: { type: 'string', description: 'Parameter name (key)' },
              value: { type: 'string', description: 'Parameter value' },
              type: { type: 'string', const: 'string', description: 'Parameter type' },
              required: { type: 'boolean', description: 'Required' },
              description: { type: 'string', description: 'Note' },
              select: { type: 'boolean', description: 'Selected' },
            },
            required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
          },
        },
        rawBody: {
          type: 'object',
          description: 'Raw type body content (use when bodyMode is raw)',
          properties: {
            data: { type: 'string', description: 'Raw data content' },
            dataType: { type: 'string', enum: ['application/xml', 'text/javascript', 'text/plain', 'text/html'], description: 'Raw data type' },
          },
          required: ['data', 'dataType'],
        },
        responseParams: {
          type: 'array',
          description: 'Response parameter definition array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Response parameter ID' },
              title: { type: 'string', description: 'Response parameter description' },
              statusCode: { type: 'number', description: 'HTTP status code' },
              value: {
                type: 'object',
                description: 'Return value definition',
                properties: {
                  dataType: { type: 'string', description: 'Response parameter type, e.g., application/json, text/plain, etc.' },
                  strJson: { type: 'string', description: 'JSON string data' },
                  text: { type: 'string', description: 'Text type response data' },
                },
              },
            },
            required: ['title', 'statusCode', 'value'],
          },
        },
        preRequest: {
          type: 'string',
          description: 'Pre-request script content',
        },
        afterRequest: {
          type: 'string',
          description: 'Post-request script content',
        },
      },
      required: ['projectId', 'name'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = typeof args.projectId === 'string' ? args.projectId : ''
      const name = typeof args.name === 'string' ? args.name : ''
      const pid = typeof args.pid === 'string' ? args.pid : ''
      const description = typeof args.description === 'string' ? args.description : ''
      const options: CreateHttpNodeOptions = {
        projectId,
        name,
        pid,
        description,
      }
      if (typeof args.version === 'string') {
        options.version = args.version
      }
      if (typeof args.creator === 'string') {
        options.creator = args.creator
      }
      if (typeof args.maintainer === 'string') {
        options.maintainer = args.maintainer
      }
      if (typeof args.preRequest === 'string') {
        options.preRequest = { raw: args.preRequest }
      }
      if (typeof args.afterRequest === 'string') {
        options.afterRequest = { raw: args.afterRequest }
      }
      let method = typeof args.method === 'string' ? args.method as HttpNodeRequestMethod : 'GET'
      const urlPath = typeof args.urlPath === 'string' && args.urlPath.trim() !== '' ? args.urlPath : '/'
      const urlPrefix = typeof args.urlPrefix === 'string' ? args.urlPrefix : ''
      options.item = {
        method,
        url: {
          path: urlPath,
          prefix: urlPrefix,
        },
      }
      if (typeof args.contentType === 'string') {
        options.item.contentType = args.contentType as HttpNodeContentType
      }
      if (Array.isArray(args.queryParams)) {
        options.item.queryParams = args.queryParams as ApidocProperty<'string'>[]
      }
      if (Array.isArray(args.pathParams)) {
        options.item.paths = args.pathParams as ApidocProperty<'string'>[]
      }
      if (Array.isArray(args.headers)) {
        options.item.headers = args.headers as ApidocProperty<'string'>[]
      }
      if (Array.isArray(args.responseParams)) {
        options.item.responseParams = args.responseParams as HttpNodeResponseParams[]
      }
      if (typeof args.bodyMode === 'string' || typeof args.rawJson === 'string' || Array.isArray(args.formdata) || Array.isArray(args.urlencoded) || args.rawBody) {
        if (!args.method && options.item.method === 'GET') {
          method = 'POST'
          options.item.method = method
        }
        options.item.requestBody = {}
        if (typeof args.bodyMode === 'string') {
          options.item.requestBody.mode = args.bodyMode as HttpNodeBodyMode
        }
        if (typeof args.rawJson === 'string') {
          options.item.requestBody.rawJson = args.rawJson
        }
        if (Array.isArray(args.formdata)) {
          options.item.requestBody.formdata = args.formdata as ApidocProperty<'string' | 'file'>[]
        }
        if (Array.isArray(args.urlencoded)) {
          options.item.requestBody.urlencoded = args.urlencoded as ApidocProperty<'string'>[]
        }
        if (args.rawBody && typeof args.rawBody === 'object') {
          const rawBodyArg = args.rawBody as { data?: string; dataType?: string }
          options.item.requestBody.raw = {
            data: typeof rawBodyArg.data === 'string' ? rawBodyArg.data : '',
            dataType: typeof rawBodyArg.dataType === 'string' ? rawBodyArg.dataType as HttpNodeBodyRawType : 'text/plain',
          }
        }
      }
      const node = await skillStore.createHttpNode(options)
      return {
        code: node ? 0 : 1,
        data: node,
      }
    },
  },
  {
    name: 'deleteHttpNodes',
    description: 'Delete one or multiple HTTP API nodes permanently. Use this when the user wants to remove API endpoints from the project. Accepts an array of node IDs to enable bulk deletion.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeIds: {
          type: 'array',
          description: 'Array of node IDs to delete. Each ID must be a valid HTTP node identifier',

          items: {
            type: 'string',
          },
        },
      },
      required: ['nodeIds'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const nodeIds = Array.isArray(args.nodeIds)
        ? (args.nodeIds as unknown[]).filter((id): id is string => typeof id === 'string')
        : []
      const result = await skillStore.deleteHttpNodes(nodeIds)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'patchHttpNodeMethodByNodeId',
    description: 'Change the HTTP request method of an existing API node. Use this when the user wants to update an API from one method to another (e.g., from GET to POST). The node must already exist.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to modify',
        },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
          description: 'The new HTTP request method to apply',

        },
      },
      required: ['method', 'nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.patchHttpNodeInfoById(
        args.nodeId as string,
        { item: { method: args.method as HttpNodeRequestMethod } }
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'patchHttpNodeUrlById',
    description: 'Update the URL path of an existing HTTP API node. Use this when the user wants to change the endpoint path. Only updates the path component, not the full URL.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to modify',
        },
        url: {
          type: 'string',
          description: 'The new URL path for the API, e.g., /api/users or /v1/products/:id',

        },
      },
      required: ['nodeId', 'url'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.patchHttpNodeInfoById(
        args.nodeId as string,
        { item: { url: { path: args.url as string } } }
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'addHttpNodeQueryParamsById',
    description: 'Add a new query parameter to an HTTP API node. Query parameters appear in the URL after "?", e.g., /api/users?page=1&limit=10. Use this when the user wants to add URL query string parameters to an API.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to modify',

        },
        queryParams: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Parameter ID',
            },
            key: {
              type: 'string',
              description: 'Parameter name (key)',
            },
            value: {
              type: 'string',
              description: 'Parameter value',
            },
            type: {
              type: 'string',
              const: 'string',
              description: 'Parameter type',
            },
            required: {
              type: 'boolean',
              description: 'Required',
            },
            description: {
              type: 'string',
              description: 'Note',
            },
            select: {
              type: 'boolean',
              description: 'Selected (selected data will be sent with the request)',
            },
          },
          required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
        },
      },
      required: ['nodeId', 'queryParams'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.addQueryParamByNodeId(
        args.nodeId as string,
        args.queryParams as ApidocProperty<'string'>
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'getHttpNodeById',
    description: 'Retrieve complete information about an HTTP API node including method, URL, parameters, headers, body configuration, and scripts. Use this to inspect the current state of an API before making modifications.',
    type: 'httpNode',

    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'Node ID',
        },
      },
      required: ['nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.getHttpNodeById(args.nodeId as string)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'updateHttpNodeQueryParamById',
    description: 'Modify an existing query parameter in an HTTP API node. Use this to change the key name, value, required status, or description of a specific query parameter. The parameter must already exist.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node containing the parameter',
        },
        paramId: {
          type: 'string',
          description: 'The unique identifier of the query parameter to update',
        },
        updates: {
          type: 'object',
          description: 'Object containing the fields to update. Only specified fields will be modified',
          properties: {
            key: { type: 'string', description: 'New parameter name' },
            value: { type: 'string', description: 'New parameter value' },
            required: { type: 'boolean', description: 'Whether this parameter is required' },
            description: { type: 'string', description: 'Parameter description or notes' },
            select: { type: 'boolean', description: 'Whether this parameter is enabled' },

          },
        },
      },
      required: ['nodeId', 'paramId', 'updates'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.updateQueryParamByNodeId(
        args.nodeId as string,
        args.paramId as string,
        args.updates as Partial<ApidocProperty<'string'>>
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'deleteHttpNodeQueryParamById',
    description: 'Remove a specific query parameter from an HTTP API node. Use this when the user wants to delete an unwanted query parameter from the URL.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node containing the parameter',
        },
        paramId: {
          type: 'string',
          description: 'The unique identifier of the query parameter to delete',

        },
      },
      required: ['nodeId', 'paramId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.deleteQueryParamByNodeId(
        args.nodeId as string,
        args.paramId as string
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'setHttpNodeQueryParamsById',
    description: 'Replace all query parameters of an HTTP API node with a new set. Use this for bulk updates when you want to completely redefine the query parameter structure. This will overwrite any existing query parameters.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to modify',

        },
        queryParams: {
          type: 'array',
          description: 'Query parameter array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Parameter ID' },
              key: { type: 'string', description: 'Field name (key)' },
              value: { type: 'string', description: 'Field value' },
              type: { type: 'string', const: 'string', description: 'Field type' },
              required: { type: 'boolean', description: 'Whether required' },
              description: { type: 'string', description: 'Description' },
              select: { type: 'boolean', description: 'Whether selected' },
            },
            required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
          },
        },
      },
      required: ['nodeId', 'queryParams'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.setQueryParamsByNodeId(
        args.nodeId as string,
        args.queryParams as ApidocProperty<'string'>[]
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'addHttpNodePathParamById',
    description: 'Add a RESTful path parameter to an HTTP API node. Path parameters are variables in the URL path, e.g., /api/users/:id or /products/:category/:productId. Use this when the API needs dynamic URL segments.',
    type: 'httpNode',

    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'Node ID',
        },
        pathParam: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Parameter ID' },
            key: { type: 'string', description: 'Field name (key)' },
            value: { type: 'string', description: 'Field value' },
            type: { type: 'string', const: 'string', description: 'Field type' },
            required: { type: 'boolean', description: 'Whether required' },
            description: { type: 'string', description: 'Description' },
            select: { type: 'boolean', description: 'Whether selected' },
          },
          required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
        },
      },
      required: ['nodeId', 'pathParam'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.addPathParamByNodeId(
        args.nodeId as string,
        args.pathParam as ApidocProperty<'string'>
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'updateHttpNodePathParamById',
    description: 'Update a path parameter of httpNode by ID',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'Node ID',
        },
        paramId: {
          type: 'string',
          description: 'Parameter ID',
        },
        updates: {
          type: 'object',
          description: 'Fields to update',
          properties: {
            key: { type: 'string', description: 'Field name (key)' },
            value: { type: 'string', description: 'Field value' },
            required: { type: 'boolean', description: 'Whether required' },
            description: { type: 'string', description: 'Description' },
            select: { type: 'boolean', description: 'Whether selected' },
          },
        },
      },
      required: ['nodeId', 'paramId', 'updates'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.updatePathParamByNodeId(
        args.nodeId as string,
        args.paramId as string,
        args.updates as Partial<ApidocProperty<'string'>>
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'deleteHttpNodePathParamById',
    description: 'Remove a specific path parameter from an HTTP API node. Use this when the user wants to delete a RESTful path variable from the URL pattern.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node containing the parameter',
        },
        paramId: {
          type: 'string',
          description: 'The unique identifier of the path parameter to delete',

        },
      },
      required: ['nodeId', 'paramId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.deletePathParamByNodeId(
        args.nodeId as string,
        args.paramId as string
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'setHttpNodePathParamsById',
    description: 'Replace all path parameters of an HTTP API node with a new set. Use this for bulk updates when you want to completely redefine RESTful URL path variables. This will overwrite any existing path parameters.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to modify',

        },
        pathParams: {
          type: 'array',
          description: 'Path parameter array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Parameter ID' },
              key: { type: 'string', description: 'Field name (key)' },
              value: { type: 'string', description: 'Field value' },
              type: { type: 'string', const: 'string', description: 'Field type' },
              required: { type: 'boolean', description: 'Whether required' },
              description: { type: 'string', description: 'Description' },
              select: { type: 'boolean', description: 'Whether selected' },
            },
            required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
          },
        },
      },
      required: ['nodeId', 'pathParams'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.setPathParamsByNodeId(
        args.nodeId as string,
        args.pathParams as ApidocProperty<'string'>[]
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'addHttpNodeHeaderById',
    description: 'Add a custom HTTP request header to an API node. Use this for authentication headers (Authorization, API-Key), content negotiation (Accept, Content-Type), or custom application headers.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to modify',

        },
        header: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Parameter ID' },
            key: { type: 'string', description: 'Header name' },
            value: { type: 'string', description: 'Header value' },
            type: { type: 'string', const: 'string', description: 'Field type' },
            required: { type: 'boolean', description: 'Whether required' },
            description: { type: 'string', description: 'Description' },
            select: { type: 'boolean', description: 'Whether selected' },
          },
          required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
        },
      },
      required: ['nodeId', 'header'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.addHeaderByNodeId(
        args.nodeId as string,
        args.header as ApidocProperty<'string'>
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'updateHttpNodeHeaderById',
    description: 'Modify an existing HTTP request header in an API node. Use this to change the header name, value, or required status. The header must already exist.',
    type: 'httpNode',

    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'Node ID',
        },
        headerId: {
          type: 'string',
          description: 'header id',
        },
        updates: {
          type: 'object',
          description: 'Fields to update',
          properties: {
            key: { type: 'string', description: 'Header name' },
            value: { type: 'string', description: 'Header value' },
            required: { type: 'boolean', description: 'Whether required' },
            description: { type: 'string', description: 'Description' },
            select: { type: 'boolean', description: 'Whether selected' },
          },
        },
      },
      required: ['nodeId', 'headerId', 'updates'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.updateHeaderByNodeId(
        args.nodeId as string,
        args.headerId as string,
        args.updates as Partial<ApidocProperty<'string'>>
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'deleteHttpNodeHeaderById',
    description: 'Remove a specific HTTP request header from an API node. Use this when the user wants to delete an unwanted header.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node containing the header',
        },
        headerId: {
          type: 'string',
          description: 'The unique identifier of the header to delete',

        },
      },
      required: ['nodeId', 'headerId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.deleteHeaderByNodeId(
        args.nodeId as string,
        args.headerId as string
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'setHttpNodeHeadersById',
    description: 'Replace all HTTP request headers of an API node with a new set. Use this for bulk header updates when you want to completely redefine the header configuration. This will overwrite any existing headers.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to modify',

        },
        headers: {
          type: 'array',
          description: 'Header array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Parameter ID' },
              key: { type: 'string', description: 'Header name' },
              value: { type: 'string', description: 'Header value' },
              type: { type: 'string', const: 'string', description: 'Field type' },
              required: { type: 'boolean', description: 'Whether required' },
              description: { type: 'string', description: 'Description' },
              select: { type: 'boolean', description: 'Whether selected' },
            },
            required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
          },
        },
      },
      required: ['nodeId', 'headers'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.setHeadersByNodeId(
        args.nodeId as string,
        args.headers as ApidocProperty<'string'>[]
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'addHttpNodeFormdataById',
    description: 'Add a form-data parameter to an HTTP API node. Form-data is used for multipart/form-data requests, typically for file uploads or HTML forms. Parameters can be either text fields or file upload fields.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to modify',

        },
        formdata: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Parameter ID' },
            key: { type: 'string', description: 'Field name (key)' },
            value: { type: 'string', description: 'Field value' },
            type: { type: 'string', enum: ['string', 'file'], description: 'Field type' },
            required: { type: 'boolean', description: 'Whether required' },
            description: { type: 'string', description: 'Description' },
            select: { type: 'boolean', description: 'Whether selected' },
          },
          required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
        },
      },
      required: ['nodeId', 'formdata'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.addFormdataByNodeId(
        args.nodeId as string,
        args.formdata as ApidocProperty<'string' | 'file'>
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'updateHttpNodeFormdataById',
    description: 'Modify an existing form-data parameter in an HTTP API node. Use this to change the parameter name, value, type (string/file), or required status. The parameter must already exist.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node containing the parameter',
        },
        paramId: {
          type: 'string',
          description: 'The unique identifier of the form-data parameter to update',

        },
        updates: {
          type: 'object',
          description: 'Fields to update',
          properties: {
            key: { type: 'string', description: 'Field name (key)' },
            value: { type: 'string', description: 'Field value' },
            type: { type: 'string', enum: ['string', 'file'], description: 'Field type' },
            required: { type: 'boolean', description: 'Whether required' },
            description: { type: 'string', description: 'Description' },
            select: { type: 'boolean', description: 'Whether selected' },
          },
        },
      },
      required: ['nodeId', 'paramId', 'updates'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.updateFormdataByNodeId(
        args.nodeId as string,
        args.paramId as string,
        args.updates as Partial<ApidocProperty<'string' | 'file'>>
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'deleteHttpNodeFormdataById',
    description: 'Remove a specific form-data parameter from an HTTP API node. Use this when the user wants to delete a form field or file upload field.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node containing the parameter',
        },
        paramId: {
          type: 'string',
          description: 'The unique identifier of the form-data parameter to delete',

        },
      },
      required: ['nodeId', 'paramId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.deleteFormdataByNodeId(
        args.nodeId as string,
        args.paramId as string
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'setHttpNodeFormdataById',
    description: 'Replace all form-data parameters of an HTTP API node with a new set. Use this for bulk updates when you want to completely redefine the multipart/form-data body structure. This will overwrite any existing form-data parameters.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to modify',

        },
        formdata: {
          type: 'array',
          description: 'Formdata parameter array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Parameter ID' },
              key: { type: 'string', description: 'Field name (key)' },
              value: { type: 'string', description: 'Field value' },
              type: { type: 'string', enum: ['string', 'file'], description: 'Field type' },
              required: { type: 'boolean', description: 'Whether required' },
              description: { type: 'string', description: 'Description' },
              select: { type: 'boolean', description: 'Whether selected' },
            },
            required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
          },
        },
      },
      required: ['nodeId', 'formdata'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.setFormdataByNodeId(
        args.nodeId as string,
        args.formdata as ApidocProperty<'string' | 'file'>[]
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'addHttpNodeUrlencodedById',
    description: 'Add a URL-encoded parameter to an HTTP API node. URL-encoded format is used for application/x-www-form-urlencoded requests, commonly used in HTML form submissions. Parameters are sent as key=value pairs in the request body.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to modify',

        },
        urlencoded: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Parameter ID' },
            key: { type: 'string', description: 'Field name (key)' },
            value: { type: 'string', description: 'Field value' },
            type: { type: 'string', const: 'string', description: 'Field type' },
            required: { type: 'boolean', description: 'Whether required' },
            description: { type: 'string', description: 'Description' },
            select: { type: 'boolean', description: 'Whether selected' },
          },
          required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
        },
      },
      required: ['nodeId', 'urlencoded'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.addUrlencodedByNodeId(
        args.nodeId as string,
        args.urlencoded as ApidocProperty<'string'>
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'updateHttpNodeUrlencodedById',
    description: 'Modify an existing URL-encoded parameter in an HTTP API node. Use this to change the parameter name, value, or required status. The parameter must already exist.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node containing the parameter',
        },
        paramId: {
          type: 'string',
          description: 'The unique identifier of the URL-encoded parameter to update',

        },
        updates: {
          type: 'object',
          description: 'Fields to update',
          properties: {
            key: { type: 'string', description: 'Field name (key)' },
            value: { type: 'string', description: 'Field value' },
            required: { type: 'boolean', description: 'Whether required' },
            description: { type: 'string', description: 'Description' },
            select: { type: 'boolean', description: 'Whether selected' },
          },
        },
      },
      required: ['nodeId', 'paramId', 'updates'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.updateUrlencodedByNodeId(
        args.nodeId as string,
        args.paramId as string,
        args.updates as Partial<ApidocProperty<'string'>>
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'deleteHttpNodeUrlencodedById',
    description: 'Remove a specific URL-encoded parameter from an HTTP API node. Use this when the user wants to delete a form field from the urlencoded body.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node containing the parameter',
        },
        paramId: {
          type: 'string',
          description: 'The unique identifier of the URL-encoded parameter to delete',

        },
      },
      required: ['nodeId', 'paramId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.deleteUrlencodedByNodeId(
        args.nodeId as string,
        args.paramId as string
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'setHttpNodeUrlencodedById',
    description: 'Replace all URL-encoded parameters of an HTTP API node with a new set. Use this for bulk updates when you want to completely redefine the application/x-www-form-urlencoded body structure. This will overwrite any existing urlencoded parameters.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to modify',

        },
        urlencoded: {
          type: 'array',
          description: 'Urlencoded parameter array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Parameter ID' },
              key: { type: 'string', description: 'Field name (key)' },
              value: { type: 'string', description: 'Field value' },
              type: { type: 'string', const: 'string', description: 'Field type' },
              required: { type: 'boolean', description: 'Whether required' },
              description: { type: 'string', description: 'Description' },
              select: { type: 'boolean', description: 'Whether selected' },
            },
            required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
          },
        },
      },
      required: ['nodeId', 'urlencoded'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.setUrlencodedByNodeId(
        args.nodeId as string,
        args.urlencoded as ApidocProperty<'string'>[]
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'patchHttpNodeBodyModeById',
    description: 'Change the request body mode of an HTTP API node. Body modes include json (JSON data), raw (plain text/XML/HTML), formdata (multipart uploads), urlencoded (HTML forms), binary (file data), or none (no body). Use this when switching between different body content types.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to modify',
        },
        mode: {
          type: 'string',
          enum: ['json', 'raw', 'formdata', 'urlencoded', 'binary', 'none'],
          description: 'The new body mode to apply',

        },
      },
      required: ['nodeId', 'mode'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.patchHttpNodeInfoById(
        args.nodeId as string,
        { item: { requestBody: { mode: args.mode as HttpNodeBodyMode } } }
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'patchHttpNodeRawJsonById',
    description: 'Update the JSON request body content of an HTTP API node. Use this when the body mode is "json" and you want to change the JSON data structure. Provide a valid JSON string.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to modify',
        },
        rawJson: {
          type: 'string',
          description: 'The new JSON content as a string, must be valid JSON format',

        },
      },
      required: ['nodeId', 'rawJson'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.patchHttpNodeInfoById(
        args.nodeId as string,
        { item: { requestBody: { rawJson: args.rawJson as string } } }
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'patchHttpNodeContentTypeById',
    description: 'Update the Content-Type header of an HTTP API node. This specifies the media type of the request body. Use this to switch between different content encodings like JSON, form data, XML, or plain text.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to modify',
        },
        contentType: {
          type: 'string',
          enum: ['', 'application/json', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain', 'application/xml', 'text/html', 'text/javascript', 'application/octet-stream'],
          description: 'The MIME type to set as Content-Type',

        },
      },
      required: ['nodeId', 'contentType'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.patchHttpNodeInfoById(
        args.nodeId as string,
        { item: { contentType: args.contentType as HttpNodeContentType } }
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'patchHttpNodeNameById',
    description: 'Rename an HTTP API node. Use this when the user wants to change the display name of an API endpoint in the project tree.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to rename',
        },
        name: {
          type: 'string',
          description: 'The new display name for the API node',

        },
      },
      required: ['nodeId', 'name'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.patchHttpNodeInfoById(
        args.nodeId as string,
        { info: { name: args.name as string } }
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'autoGenerateHttpNodeNameById',
    description: 'Automatically generate a concise and meaningful API node name using AI. Analyzes the HTTP method, URL path, description, parameters, and request body to create a short descriptive name (max 10 characters). Use this when the user wants an AI-suggested name based on the API functionality.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to auto-name',

        },
      },
      required: ['nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const validation = validateToolArgs<{ nodeId: string }>(args, {
        required: ['nodeId'],
        validators: {
          nodeId: validators.isValidNodeId
        }
      })
      if (!validation.valid) {
        return createValidationErrorResponse(validation.errors)
      }
      const skillStore = useSkill()
      const llmClientStore = useLLMClientStore()
      const { nodeId } = validation.data
      try {
        const node = await skillStore.getHttpNodeById(nodeId)
        if (!node) {
          return createErrorResponse('NOT_FOUND', 'Node does not exist', {
            details: { nodeId }
          })
        }
        const apiDetail = {
          method: node.item.method,
          url: node.item.url.path,
          description: node.info.description || '',
          queryParams: node.item.queryParams.map(p => ({ key: p.key, description: p.description })),
          bodyMode: node.item.requestBody.mode,
          rawJson: node.item.requestBody.rawJson,
        }
        //生成缓存key
        const cacheKey = generateCacheKey(apiDetail.method, apiDetail.url, apiDetail.description)
        cleanExpiredCache()
        //检查缓存
        const cached = nameGenerationCache.get(cacheKey)
        if (cached) {
          const result = await skillStore.patchHttpNodeInfoById(nodeId, {
            info: { name: cached.name }
          })
          return createSuccessResponse({ name: cached.name, node: result, fromCache: true })
        }
        //优化Prompt：明确要求语言一致性，提供示例
        const targetLanguage = (args._targetLanguage as Language) || 'zh-cn'
        const languageInstruction = {
          'zh-cn': '[CRITICAL] You MUST generate the name in Simplified Chinese.',
          'zh-tw': '[CRITICAL] You MUST generate the name in Traditional Chinese.',
          'en': '[CRITICAL] You MUST generate the name in English.',
          'ja': '[CRITICAL] You MUST generate the name in Japanese.',
        }[targetLanguage]
        const systemPrompt = `You are an API naming expert. Generate concise and accurate API names based on API information.

${languageInstruction}

CRITICAL RULES:
1. Maximum 10 characters (or 10 grapheme clusters for multi-byte languages)
2. Use action verbs: Get, Create, Update, Delete, Query, List, Search, etc.
3. Return ONLY the name, no explanations, quotes, or extra text
4. If description is empty, infer from HTTP method + URL path

Examples:
- GET /users/{id} → "Get User" or "获取用户"
- POST /orders → "Create Order" or "创建订单"
- DELETE /products/{id} → "Delete Prod" or "删除产品"
- GET /search?q=xxx → "Search" or "搜索"`
        const userMessage = `Method: ${apiDetail.method}
URL: ${apiDetail.url}
Description: ${apiDetail.description || 'None'}
Query: ${JSON.stringify(apiDetail.queryParams)}
Body Mode: ${apiDetail.bodyMode}
Body: ${apiDetail.rawJson || 'None'}`
        const response = await llmClientStore.chat({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
        })
        let generatedName = response.choices[0]?.message?.content?.trim() || ''
        //移除可能的引号、括号等包裹符号
        generatedName = generatedName.replace(/^["'`《「【(]|["'`》」】)]$/g, '')
        //应用智能截断（正确处理多字节字符）
        generatedName = truncateName(generatedName, 10)
        if (!generatedName) {
          return createErrorResponse('LLM_PARSE_ERROR', 'Generated name is empty', {
            details: { response: response.choices[0]?.message?.content }
          })
        }
        //缓存生成结果
        nameGenerationCache.set(cacheKey, { name: generatedName, timestamp: Date.now() })
        const result = await skillStore.patchHttpNodeInfoById(nodeId, {
          info: { name: generatedName }
        })
        return createSuccessResponse({ name: generatedName, node: result, fromCache: false })
      } catch (error) {
        return createErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Failed to generate name', {
          details: { error: String(error) }
        })
      }
    },
  },
  {
    name: 'patchHttpNodeDescriptionById',
    description: 'Update the description or notes of an HTTP API node. Use this to add or modify documentation explaining what the API does, its purpose, or usage notes.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to modify',
        },
        description: {
          type: 'string',
          description: 'The new description text for the API node',

        },
      },
      required: ['nodeId', 'description'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.patchHttpNodeInfoById(
        args.nodeId as string,
        { info: { description: args.description as string } }
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'batchCreateHttpNodes',
    description: 'Create multiple HTTP API nodes at once for efficient project setup. Use this when the user wants to quickly scaffold multiple endpoints. Returns success/failure counts and details. Requires confirmation as it creates multiple items. For complex APIs with detailed configurations, consider using simpleCreateHttpNode for each API instead.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project where API nodes will be created',
        },
        nodes: {
          type: 'array',
          description: 'Array of HTTP API node definitions to create',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Display name for the API node',
              },
              pid: {
                type: 'string',
                description: 'Optional parent folder ID. If omitted or empty string, the API will be created at root level',
              },
              method: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
                description: 'HTTP request method. Defaults to GET if not specified',
              },
              urlPath: {
                type: 'string',
                description: 'URL path for the API endpoint, e.g., /api/users. Defaults to / if not specified',
              },
              description: {
                type: 'string',
                description: 'Optional description explaining the API purpose',

              },
            },
            required: ['name'],
          },
        },
      },
      required: ['projectId', 'nodes'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = args.projectId as string
      const nodes = args.nodes as Array<{
        name: string
        pid?: string
        method?: HttpNodeRequestMethod
        urlPath?: string
        description?: string
      }>
      if (!nodes || nodes.length === 0) {
        return { code: 1, data: { message: 'httpNode node list cannot be empty' } }
      }
      const nodeOptions: CreateHttpNodeOptions[] = nodes.map(node => ({
        projectId,
        name: node.name,
        pid: node.pid || '',
        description: node.description || '',
        item: {
          method: node.method || 'GET',
          url: { path: node.urlPath || '/' },
        },
      }))
      const result = await skillStore.batchCreateHttpNodes({ projectId, nodes: nodeOptions })
      return {
        code: 0,
        data: {
          message: 'Batch creation of httpNode nodes completed',
          successCount: result.success.length,
          failedCount: result.failed.length,
          createdNodes: result.success.map(n => ({ _id: n._id, name: n.info.name, method: n.item.method, urlPath: n.item.url.path })),
        },
      }
    },
  },
  {
    name: 'searchHttpNodes',
    description: 'Search for HTTP API nodes using flexible criteria with fuzzy matching. Use this when the user wants to find APIs by name, URL, description, method, or other attributes. Supports both general keyword search and specific field filtering. Returns matching nodes with their complete information.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The unique identifier of the project to search within',
        },
        keyword: {
          type: 'string',
          description: 'General search term that matches against name, description, and URL path fields simultaneously (fuzzy matching)',
        },
        name: {
          type: 'string',
          description: 'Filter by API node name with fuzzy matching',
        },
        description: {
          type: 'string',
          description: 'Filter by API description with fuzzy matching',
        },
        urlPath: {
          type: 'string',
          description: 'Filter by URL path with fuzzy matching, e.g., "/users" or "/api"',
        },
        urlPrefix: {
          type: 'string',
          description: 'Filter by URL prefix with fuzzy matching',
        },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
          description: 'Filter by exact HTTP request method',
        },
        contentType: {
          type: 'string',
          enum: ['', 'application/json', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain', 'application/xml', 'text/html', 'text/javascript', 'application/octet-stream'],
          description: 'Filter by exact Content-Type value',
        },
        bodyMode: {
          type: 'string',
          enum: ['json', 'raw', 'formdata', 'urlencoded', 'binary', 'none'],
          description: 'Filter by exact request body mode',
        },
        creator: {
          type: 'string',
          description: 'Filter by API creator name with fuzzy matching',
        },
        maintainer: {
          type: 'string',
          description: 'Filter by API maintainer name with fuzzy matching',
        },
        version: {
          type: 'string',
          description: 'Filter by exact version number',
        },
        includeDeleted: {
          type: 'boolean',
          description: 'Whether to include deleted nodes in search results. Defaults to false',

        },
      },
      required: ['projectId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.searchHttpNodes({
        projectId: args.projectId as string,
        keyword: args.keyword as string | undefined,
        name: args.name as string | undefined,
        description: args.description as string | undefined,
        urlPath: args.urlPath as string | undefined,
        urlPrefix: args.urlPrefix as string | undefined,
        method: args.method as HttpNodeRequestMethod | undefined,
        contentType: args.contentType as HttpNodeContentType | undefined,
        bodyMode: args.bodyMode as HttpNodeBodyMode | undefined,
        creator: args.creator as string | undefined,
        maintainer: args.maintainer as string | undefined,
        version: args.version as string | undefined,
        includeDeleted: args.includeDeleted as boolean | undefined,
      })
      return {
        code: 0,
        data: result,
      }
    },
  },
  {
    name: 'moveHttpNode',
    description: 'Relocate an HTTP API node to a different folder in the project tree. Use this to reorganize project structure by moving APIs between folders or to the root level. Useful for restructuring and organizing APIs logically.',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: 'The unique identifier of the HTTP node to move',
        },
        newPid: {
          type: 'string',
          description: 'The unique identifier of the destination parent folder. Pass empty string to move to root level',

        },
      },
      required: ['nodeId', 'newPid'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.moveHttpNode(
        args.nodeId as string,
        args.newPid as string
      )
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
]
