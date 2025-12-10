import { useSkill } from '../skillStore'
import { useLLMClientStore } from '../llmClientStore'
import { AgentTool } from '@src/types/ai'
import { HttpNodeRequestMethod, ApidocProperty, HttpNodeContentType, HttpNodeBodyMode, HttpNodeBodyRawType, HttpNodeResponseParams } from '@src/types'
import { CreateHttpNodeOptions } from '@src/types/ai/tools.type'
import { nanoid } from 'nanoid'

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
const buildCreateHttpNodeOptions = (projectId: string, params: LLMInferredParams): CreateHttpNodeOptions => {
  const options: CreateHttpNodeOptions = {
    projectId,
    name: params.name || '未命名接口',
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
    description: '根据用户的简单描述创建httpNode节点（推荐）。当用户没有提供完整的method、url、body等参数时，使用此工具自动推断',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目id',
        },
        description: {
          type: 'string',
          description: '接口的自然语言描述，例如"创建一个用户登录接口，需要用户名和密码"',
        },
         pid: {
          type: 'string',
          description: '父节点id，根节点留空字符串',
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
      const systemPrompt = `你是一个API设计专家。根据用户的自然语言描述，推断出完整的HTTP接口参数。
返回严格的JSON格式，不要有任何其他内容。

JSON结构：
{
  "name": "接口名称",
  "method": "GET|POST|PUT|DELETE|PATCH",
  "urlPath": "/api/xxx",
  "description": "接口描述",
  "bodyMode": "json|formdata|urlencoded|none",
  "rawJson": "JSON body字符串（如果有body的话）",
  "queryParams": [{ "key": "xxx", "value": "", "description": "xxx" }],
  "headers": [{ "key": "xxx", "value": "xxx", "description": "xxx" }]
}

规则：
1. GET请求通常不需要body，使用queryParams
2. POST/PUT/PATCH通常需要body，优先使用json格式
3. 登录/注册类接口使用POST
4. 获取列表/详情使用GET
5. 删除使用DELETE
6. urlPath使用RESTful风格，如/api/users, /api/users/{id}
7. 如果不需要body则bodyMode为none，不要设置rawJson
8. queryParams和headers如果没有则返回空数组`
      try {
        const response = await llmClientStore.chat({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: description }
          ],
          response_format: { type: 'json_object' }
        })
        const content = response.choices[0]?.message?.content || '{}'
        const inferredParams: LLMInferredParams = JSON.parse(content)
        const options = buildCreateHttpNodeOptions(projectId, inferredParams)
        const node = await skillStore.createHttpNode(options)
        return { code: node ? 0 : 1, data: node }
      } catch (error) {
        return { code: 1, data: { error: error instanceof Error ? error.message : '创建失败' } }
      }
    },
  },
  {
    name: 'createHttpNode',
    description: '创建一个新的httpNode节点',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目id',
        },
        name: {
          type: 'string',
          description: '节点名称',
        },
        pid: {
          type: 'string',
          description: '父节点id，根节点留空字符串',
        },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
          description: '请求方法，默认GET',
        },
        urlPath: {
          type: 'string',
          description: '请求路径，例如/api/users',
        },
        urlPrefix: {
          type: 'string',
          description: '请求路径前缀',
        },
        description: {
          type: 'string',
          description: '接口描述',
        },
        version: {
          type: 'string',
          description: '版本信息',
        },
        creator: {
          type: 'string',
          description: '创建者',
        },
        maintainer: {
          type: 'string',
          description: '维护人员',
        },
        contentType: {
          type: 'string',
          enum: ['', 'application/json', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain', 'application/xml', 'text/html', 'text/javascript', 'application/octet-stream'],
          description: 'Content-Type请求头',
        },
        bodyMode: {
          type: 'string',
          enum: ['json', 'raw', 'formdata', 'urlencoded', 'binary', 'none'],
          description: '请求body模式',
        },
        rawJson: {
          type: 'string',
          description: 'JSON格式的body内容（当bodyMode为json时使用）',
        },
        queryParams: {
          type: 'array',
          description: 'query查询参数数组',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: '参数id' },
              key: { type: 'string', description: '字段名称(键)' },
              value: { type: 'string', description: '字段值' },
              type: { type: 'string', const: 'string', description: '字段类型' },
              required: { type: 'boolean', description: '是否必填' },
              description: { type: 'string', description: '备注' },
              select: { type: 'boolean', description: '是否选中' },
            },
            required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
          },
        },
        pathParams: {
          type: 'array',
          description: 'RESTful路径参数数组',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: '参数id' },
              key: { type: 'string', description: '字段名称(键)' },
              value: { type: 'string', description: '字段值' },
              type: { type: 'string', const: 'string', description: '字段类型' },
              required: { type: 'boolean', description: '是否必填' },
              description: { type: 'string', description: '备注' },
              select: { type: 'boolean', description: '是否选中' },
            },
            required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
          },
        },
        headers: {
          type: 'array',
          description: '请求头数组',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: '参数id' },
              key: { type: 'string', description: 'header名称' },
              value: { type: 'string', description: 'header值' },
              type: { type: 'string', const: 'string', description: '字段类型' },
              required: { type: 'boolean', description: '是否必填' },
              description: { type: 'string', description: '备注' },
              select: { type: 'boolean', description: '是否选中' },
            },
            required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
          },
        },
        formdata: {
          type: 'array',
          description: 'formdata参数数组（当bodyMode为formdata时使用）',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: '参数id' },
              key: { type: 'string', description: '字段名称(键)' },
              value: { type: 'string', description: '字段值' },
              type: { type: 'string', enum: ['string', 'file'], description: '字段类型' },
              required: { type: 'boolean', description: '是否必填' },
              description: { type: 'string', description: '备注' },
              select: { type: 'boolean', description: '是否选中' },
            },
            required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
          },
        },
        urlencoded: {
          type: 'array',
          description: 'urlencoded参数数组（当bodyMode为urlencoded时使用）',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: '参数id' },
              key: { type: 'string', description: '字段名称(键)' },
              value: { type: 'string', description: '字段值' },
              type: { type: 'string', const: 'string', description: '字段类型' },
              required: { type: 'boolean', description: '是否必填' },
              description: { type: 'string', description: '备注' },
              select: { type: 'boolean', description: '是否选中' },
            },
            required: ['_id', 'key', 'value', 'type', 'required', 'description', 'select'],
          },
        },
        rawBody: {
          type: 'object',
          description: 'raw类型body内容（当bodyMode为raw时使用）',
          properties: {
            data: { type: 'string', description: 'raw数据内容' },
            dataType: { type: 'string', enum: ['application/xml', 'text/javascript', 'text/plain', 'text/html'], description: 'raw数据类型' },
          },
          required: ['data', 'dataType'],
        },
        responseParams: {
          type: 'array',
          description: '返回参数定义数组',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: '响应参数id' },
              title: { type: 'string', description: '返回参数描述' },
              statusCode: { type: 'number', description: 'HTTP状态码' },
              value: {
                type: 'object',
                description: '返回值定义',
                properties: {
                  dataType: { type: 'string', description: '返回参数类型，如application/json、text/plain等' },
                  strJson: { type: 'string', description: 'JSON字符串数据' },
                  text: { type: 'string', description: '文本类型返回数据' },
                },
              },
            },
            required: ['title', 'statusCode', 'value'],
          },
        },
        preRequest: {
          type: 'string',
          description: '前置脚本内容',
        },
        afterRequest: {
          type: 'string',
          description: '后置脚本内容',
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
    description: '根据ID列表删除httpNode节点',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeIds: {
          type: 'array',
          description: '要删除的节点id列表',
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
    description: '根据ID更改当前httpNode节点的请求方法',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
          description: '请求方法',
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
    description: '根据ID更改当前httpNode节点的请求地址',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        url: {
          type: 'string',
          description: '请求的URL路径，例如/api/users',
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
    description: '根据ID添加一个query参数到当前httpNode节点',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        queryParams: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: '参数id',
            },
            key: {
              type: 'string',
              description: '字段名称(键)',
            },
            value: {
              type: 'string',
              description: '字段值',
            },
            type: {
              type: 'string',
              const: 'string',
              description: '字段类型',
            },
            required: {
              type: 'boolean',
              description: '是否必填',
            },
            description: {
              type: 'string',
              description: '备注',
            },
            select: {
              type: 'boolean',
              description: '是否选中(选中数据会随请求一起发送)',
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
    description: '根据ID获取httpNode节点的完整信息',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
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
    description: '根据ID更新httpNode节点的一个query参数',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        paramId: {
          type: 'string',
          description: '参数id',
        },
        updates: {
          type: 'object',
          description: '要更新的字段',
          properties: {
            key: { type: 'string', description: '字段名称(键)' },
            value: { type: 'string', description: '字段值' },
            required: { type: 'boolean', description: '是否必填' },
            description: { type: 'string', description: '备注' },
            select: { type: 'boolean', description: '是否选中' },
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
    description: '根据ID删除httpNode节点的一个query参数',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        paramId: {
          type: 'string',
          description: '要删除的参数id',
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
    description: '根据ID批量设置httpNode节点的所有query参数（替换现有参数）',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        queryParams: {
          type: 'array',
          description: 'query参数数组',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: '参数id' },
              key: { type: 'string', description: '字段名称(键)' },
              value: { type: 'string', description: '字段值' },
              type: { type: 'string', const: 'string', description: '字段类型' },
              required: { type: 'boolean', description: '是否必填' },
              description: { type: 'string', description: '备注' },
              select: { type: 'boolean', description: '是否选中' },
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
    description: '根据ID添加一个path参数到httpNode节点',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        pathParam: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: '参数id' },
            key: { type: 'string', description: '字段名称(键)' },
            value: { type: 'string', description: '字段值' },
            type: { type: 'string', const: 'string', description: '字段类型' },
            required: { type: 'boolean', description: '是否必填' },
            description: { type: 'string', description: '备注' },
            select: { type: 'boolean', description: '是否选中' },
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
    description: '根据ID更新httpNode节点的一个path参数',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        paramId: {
          type: 'string',
          description: '参数id',
        },
        updates: {
          type: 'object',
          description: '要更新的字段',
          properties: {
            key: { type: 'string', description: '字段名称(键)' },
            value: { type: 'string', description: '字段值' },
            required: { type: 'boolean', description: '是否必填' },
            description: { type: 'string', description: '备注' },
            select: { type: 'boolean', description: '是否选中' },
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
    description: '根据ID删除httpNode节点的一个path参数',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        paramId: {
          type: 'string',
          description: '要删除的参数id',
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
    description: '根据ID批量设置httpNode节点的所有path参数（替换现有参数）',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        pathParams: {
          type: 'array',
          description: 'path参数数组',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: '参数id' },
              key: { type: 'string', description: '字段名称(键)' },
              value: { type: 'string', description: '字段值' },
              type: { type: 'string', const: 'string', description: '字段类型' },
              required: { type: 'boolean', description: '是否必填' },
              description: { type: 'string', description: '备注' },
              select: { type: 'boolean', description: '是否选中' },
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
    description: '根据ID添加一个header到httpNode节点',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        header: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: '参数id' },
            key: { type: 'string', description: 'header名称' },
            value: { type: 'string', description: 'header值' },
            type: { type: 'string', const: 'string', description: '字段类型' },
            required: { type: 'boolean', description: '是否必填' },
            description: { type: 'string', description: '备注' },
            select: { type: 'boolean', description: '是否选中' },
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
    description: '根据ID更新httpNode节点的一个header',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        headerId: {
          type: 'string',
          description: 'header id',
        },
        updates: {
          type: 'object',
          description: '要更新的字段',
          properties: {
            key: { type: 'string', description: 'header名称' },
            value: { type: 'string', description: 'header值' },
            required: { type: 'boolean', description: '是否必填' },
            description: { type: 'string', description: '备注' },
            select: { type: 'boolean', description: '是否选中' },
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
    description: '根据ID删除httpNode节点的一个header',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        headerId: {
          type: 'string',
          description: '要删除的header id',
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
    description: '根据ID批量设置httpNode节点的所有header（替换现有header）',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        headers: {
          type: 'array',
          description: 'header数组',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: '参数id' },
              key: { type: 'string', description: 'header名称' },
              value: { type: 'string', description: 'header值' },
              type: { type: 'string', const: 'string', description: '字段类型' },
              required: { type: 'boolean', description: '是否必填' },
              description: { type: 'string', description: '备注' },
              select: { type: 'boolean', description: '是否选中' },
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
    description: '根据ID添加一个formdata参数到httpNode节点',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        formdata: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: '参数id' },
            key: { type: 'string', description: '字段名称(键)' },
            value: { type: 'string', description: '字段值' },
            type: { type: 'string', enum: ['string', 'file'], description: '字段类型' },
            required: { type: 'boolean', description: '是否必填' },
            description: { type: 'string', description: '备注' },
            select: { type: 'boolean', description: '是否选中' },
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
    description: '根据ID更新httpNode节点的一个formdata参数',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        paramId: {
          type: 'string',
          description: '参数id',
        },
        updates: {
          type: 'object',
          description: '要更新的字段',
          properties: {
            key: { type: 'string', description: '字段名称(键)' },
            value: { type: 'string', description: '字段值' },
            type: { type: 'string', enum: ['string', 'file'], description: '字段类型' },
            required: { type: 'boolean', description: '是否必填' },
            description: { type: 'string', description: '备注' },
            select: { type: 'boolean', description: '是否选中' },
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
    description: '根据ID删除httpNode节点的一个formdata参数',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        paramId: {
          type: 'string',
          description: '要删除的参数id',
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
    description: '根据ID批量设置httpNode节点的所有formdata参数（替换现有参数）',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        formdata: {
          type: 'array',
          description: 'formdata参数数组',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: '参数id' },
              key: { type: 'string', description: '字段名称(键)' },
              value: { type: 'string', description: '字段值' },
              type: { type: 'string', enum: ['string', 'file'], description: '字段类型' },
              required: { type: 'boolean', description: '是否必填' },
              description: { type: 'string', description: '备注' },
              select: { type: 'boolean', description: '是否选中' },
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
    description: '根据ID添加一个urlencoded参数到httpNode节点',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        urlencoded: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: '参数id' },
            key: { type: 'string', description: '字段名称(键)' },
            value: { type: 'string', description: '字段值' },
            type: { type: 'string', const: 'string', description: '字段类型' },
            required: { type: 'boolean', description: '是否必填' },
            description: { type: 'string', description: '备注' },
            select: { type: 'boolean', description: '是否选中' },
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
    description: '根据ID更新httpNode节点的一个urlencoded参数',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        paramId: {
          type: 'string',
          description: '参数id',
        },
        updates: {
          type: 'object',
          description: '要更新的字段',
          properties: {
            key: { type: 'string', description: '字段名称(键)' },
            value: { type: 'string', description: '字段值' },
            required: { type: 'boolean', description: '是否必填' },
            description: { type: 'string', description: '备注' },
            select: { type: 'boolean', description: '是否选中' },
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
    description: '根据ID删除httpNode节点的一个urlencoded参数',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        paramId: {
          type: 'string',
          description: '要删除的参数id',
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
    description: '根据ID批量设置httpNode节点的所有urlencoded参数（替换现有参数）',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        urlencoded: {
          type: 'array',
          description: 'urlencoded参数数组',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: '参数id' },
              key: { type: 'string', description: '字段名称(键)' },
              value: { type: 'string', description: '字段值' },
              type: { type: 'string', const: 'string', description: '字段类型' },
              required: { type: 'boolean', description: '是否必填' },
              description: { type: 'string', description: '备注' },
              select: { type: 'boolean', description: '是否选中' },
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
    description: '根据ID更改httpNode节点的body模式',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        mode: {
          type: 'string',
          enum: ['json', 'raw', 'formdata', 'urlencoded', 'binary', 'none'],
          description: 'body模式',
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
    description: '根据ID更新httpNode节点的rawJson内容（用于json模式的body）',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        rawJson: {
          type: 'string',
          description: 'JSON字符串内容',
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
    description: '根据ID更改httpNode节点的ContentType',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        contentType: {
          type: 'string',
          enum: ['', 'application/json', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain', 'application/xml', 'text/html', 'text/javascript', 'application/octet-stream'],
          description: 'Content-Type',
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
    description: '根据ID更改httpNode节点的名称',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        name: {
          type: 'string',
          description: '节点名称',
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
    description: '根据接口详情使用AI自动生成简洁的接口名称（不超过10个字）',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
      },
      required: ['nodeId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const llmClientStore = useLLMClientStore()
      const nodeId = args.nodeId as string
      const node = await skillStore.getHttpNodeById(nodeId)
      if (!node) {
        return { code: 1, data: { error: '节点不存在' } }
      }
      const apiDetail = {
        method: node.item.method,
        url: node.item.url.path,
        description: node.info.description,
        queryParams: node.item.queryParams.map(p => ({ key: p.key, description: p.description })),
        bodyMode: node.item.requestBody.mode,
        rawJson: node.item.requestBody.rawJson,
      }
      const systemPrompt = `你是一个API命名专家。根据接口信息生成简洁准确的中文接口名称。
要求：
1. 名称长度不超过10个字
2. 使用常见动词开头，如：获取、创建、更新、删除、查询等
3. 只返回名称，不要有任何其他内容`
      const userMessage = `请求方法：${apiDetail.method}
URL路径：${apiDetail.url}
描述：${apiDetail.description || '无'}
查询参数：${JSON.stringify(apiDetail.queryParams)}
请求体模式：${apiDetail.bodyMode}
请求体内容：${apiDetail.rawJson || '无'}`
      try {
        const response = await llmClientStore.chat({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
        })
        let generatedName = response.choices[0]?.message?.content?.trim() || ''
        if (generatedName.length > 10) {
          generatedName = generatedName.slice(0, 10)
        }
        const result = await skillStore.patchHttpNodeInfoById(nodeId, {
          info: { name: generatedName }
        })
        return {
          code: result ? 0 : 1,
          data: { name: generatedName, node: result },
        }
      } catch (error) {
        return {
          code: 1,
          data: { error: error instanceof Error ? error.message : '生成名称失败' }
        }
      }
    },
  },
  {
    name: 'patchHttpNodeDescriptionById',
    description: '根据ID更改httpNode节点的描述',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '节点id',
        },
        description: {
          type: 'string',
          description: '节点描述',
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
    name: 'searchHttpNodes',
    description: '根据名称、URL路径、描述等条件搜索httpNode节点，支持模糊匹配。当需要通过接口名称或URL查找节点时使用此工具',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目ID',
        },
        keyword: {
          type: 'string',
          description: '通用关键词，同时搜索名称、描述、URL路径（模糊匹配）',
        },
        name: {
          type: 'string',
          description: '节点名称（模糊匹配）',
        },
        description: {
          type: 'string',
          description: '接口描述（模糊匹配）',
        },
        urlPath: {
          type: 'string',
          description: 'URL路径（模糊匹配）',
        },
        urlPrefix: {
          type: 'string',
          description: 'URL前缀（模糊匹配）',
        },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
          description: '请求方法（精确匹配）',
        },
        contentType: {
          type: 'string',
          enum: ['', 'application/json', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain', 'application/xml', 'text/html', 'text/javascript', 'application/octet-stream'],
          description: 'Content-Type（精确匹配）',
        },
        bodyMode: {
          type: 'string',
          enum: ['json', 'raw', 'formdata', 'urlencoded', 'binary', 'none'],
          description: '请求body模式（精确匹配）',
        },
        creator: {
          type: 'string',
          description: '创建者（模糊匹配）',
        },
        maintainer: {
          type: 'string',
          description: '维护人员（模糊匹配）',
        },
        version: {
          type: 'string',
          description: '版本号（精确匹配）',
        },
        includeDeleted: {
          type: 'boolean',
          description: '是否包含已删除的节点，默认false',
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
    description: '移动httpNode节点到新的父文件夹。可以将节点移动到其他文件夹下或移动到根目录',
    type: 'httpNode',
    parameters: {
      type: 'object',
      properties: {
        nodeId: {
          type: 'string',
          description: '要移动的节点id',
        },
        newPid: {
          type: 'string',
          description: '新的父节点id，移动到根目录则传空字符串',
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
