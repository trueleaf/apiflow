import { useSkill } from '../skillStore'
import { AgentTool } from '@src/types/ai'
import { HttpNodeRequestMethod, ApidocProperty, HttpNodeContentType, HttpNodeBodyMode, HttpNodeBodyRawType, HttpNodeResponseParams } from '@src/types'
import { CreateHttpNodeOptions } from '@src/types/ai/tools.type'

export const httpNodeTools: AgentTool[] = [
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
]
