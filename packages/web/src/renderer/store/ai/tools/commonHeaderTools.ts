import { useSkill } from '../skillStore'
import { AgentTool } from '@src/types/ai'

export const commonHeaderTools: AgentTool[] = [
  // ==================== 全局公共请求头工具 ====================
  {
    name: 'getGlobalCommonHeaders',
    description: '获取当前项目的所有全局公共请求头列表',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: false,
    execute: async () => {
      const skillStore = useSkill()
      const result = await skillStore.getGlobalCommonHeaders()
      return { code: 0, data: result }
    },
  },
  {
    name: 'getGlobalCommonHeaderById',
    description: '根据ID获取单个全局公共请求头的详细信息',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        headerId: {
          type: 'string',
          description: '公共请求头ID',
        },
      },
      required: ['headerId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const headerId = args.headerId as string
      const result = await skillStore.getGlobalCommonHeaderById(headerId)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'createGlobalCommonHeader',
    description: '创建一个新的全局公共请求头，对项目内所有接口生效',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: '请求头的键名，如 Authorization、Content-Type 等',
        },
        value: {
          type: 'string',
          description: '请求头的值',
        },
        description: {
          type: 'string',
          description: '请求头的描述说明',
        },
      },
      required: ['key', 'value'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.createGlobalCommonHeader({
        key: args.key as string,
        value: args.value as string,
        description: args.description as string | undefined,
      })
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'updateGlobalCommonHeader',
    description: '更新指定全局公共请求头的信息',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        headerId: {
          type: 'string',
          description: '要更新的公共请求头ID',
        },
        key: {
          type: 'string',
          description: '新的请求头键名',
        },
        value: {
          type: 'string',
          description: '新的请求头值',
        },
        description: {
          type: 'string',
          description: '新的描述说明',
        },
        select: {
          type: 'boolean',
          description: '是否启用该请求头',
        },
      },
      required: ['headerId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const headerId = args.headerId as string
      const updates: Partial<{ key: string; value: string; description: string; select: boolean }> = {}
      if (args.key !== undefined) {
        updates.key = args.key as string
      }
      if (args.value !== undefined) {
        updates.value = args.value as string
      }
      if (args.description !== undefined) {
        updates.description = args.description as string
      }
      if (args.select !== undefined) {
        updates.select = args.select as boolean
      }
      const result = await skillStore.updateGlobalCommonHeader(headerId, updates)
      return {
        code: result ? 0 : 1,
        data: { updated: result },
      }
    },
  },
  {
    name: 'deleteGlobalCommonHeaders',
    description: '批量删除全局公共请求头',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        headerIds: {
          type: 'array',
          items: { type: 'string' },
          description: '要删除的公共请求头ID数组',
        },
      },
      required: ['headerIds'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const headerIds = args.headerIds as string[]
      const result = await skillStore.deleteGlobalCommonHeaders(headerIds)
      return {
        code: result ? 0 : 1,
        data: { deleted: result },
      }
    },
  },
  {
    name: 'searchGlobalCommonHeaders',
    description: '按键名搜索全局公共请求头',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: '搜索关键词，会匹配请求头的键名',
        },
      },
      required: ['keyword'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const keyword = args.keyword as string
      const result = await skillStore.searchGlobalCommonHeaders(keyword)
      return { code: 0, data: result }
    },
  },
  // ==================== 文件夹级公共请求头工具 ====================
  {
    name: 'getFolderCommonHeaders',
    description: '获取指定文件夹的公共请求头列表，这些请求头会应用于该文件夹下的所有接口',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: '文件夹ID',
        },
      },
      required: ['folderId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const folderId = args.folderId as string
      const result = await skillStore.getFolderCommonHeaders(folderId)
      return {
        code: result !== null ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'addFolderCommonHeader',
    description: '为指定文件夹添加一个公共请求头，该请求头会应用于文件夹下的所有接口',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: '文件夹ID',
        },
        key: {
          type: 'string',
          description: '请求头的键名',
        },
        value: {
          type: 'string',
          description: '请求头的值',
        },
        description: {
          type: 'string',
          description: '请求头的描述说明',
        },
      },
      required: ['folderId', 'key', 'value'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const folderId = args.folderId as string
      const result = await skillStore.addFolderCommonHeader(folderId, {
        key: args.key as string,
        value: args.value as string,
        description: args.description as string | undefined,
      })
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'updateFolderCommonHeader',
    description: '更新指定文件夹中某个公共请求头的信息',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: '文件夹ID',
        },
        headerId: {
          type: 'string',
          description: '要更新的公共请求头ID',
        },
        key: {
          type: 'string',
          description: '新的请求头键名',
        },
        value: {
          type: 'string',
          description: '新的请求头值',
        },
        description: {
          type: 'string',
          description: '新的描述说明',
        },
        select: {
          type: 'boolean',
          description: '是否启用该请求头',
        },
      },
      required: ['folderId', 'headerId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const folderId = args.folderId as string
      const headerId = args.headerId as string
      const updates: Partial<{ key: string; value: string; description: string; select: boolean }> = {}
      if (args.key !== undefined) {
        updates.key = args.key as string
      }
      if (args.value !== undefined) {
        updates.value = args.value as string
      }
      if (args.description !== undefined) {
        updates.description = args.description as string
      }
      if (args.select !== undefined) {
        updates.select = args.select as boolean
      }
      const result = await skillStore.updateFolderCommonHeader(folderId, headerId, updates)
      return {
        code: result ? 0 : 1,
        data: { updated: result },
      }
    },
  },
  {
    name: 'deleteFolderCommonHeaders',
    description: '批量删除指定文件夹中的公共请求头',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: '文件夹ID',
        },
        headerIds: {
          type: 'array',
          items: { type: 'string' },
          description: '要删除的公共请求头ID数组',
        },
      },
      required: ['folderId', 'headerIds'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const folderId = args.folderId as string
      const headerIds = args.headerIds as string[]
      const result = await skillStore.deleteFolderCommonHeaders(folderId, headerIds)
      return {
        code: result ? 0 : 1,
        data: { deleted: result },
      }
    },
  },
  {
    name: 'setFolderCommonHeaders',
    description: '设置文件夹的全部公共请求头（覆盖式更新），会替换原有的所有公共请求头',
    type: 'commonHeader',
    parameters: {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: '文件夹ID',
        },
        headers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: '请求头ID，新建时可不传' },
              key: { type: 'string', description: '请求头键名' },
              value: { type: 'string', description: '请求头值' },
              description: { type: 'string', description: '描述说明' },
              select: { type: 'boolean', description: '是否启用' },
            },
            required: ['key', 'value'],
          },
          description: '公共请求头数组',
        },
      },
      required: ['folderId', 'headers'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const { nanoid } = await import('nanoid')
      const folderId = args.folderId as string
      const inputHeaders = args.headers as { _id?: string; key: string; value: string; description?: string; select?: boolean }[]
      const headers = inputHeaders.map(h => ({
        _id: h._id || nanoid(),
        key: h.key,
        value: h.value,
        type: 'string' as const,
        required: false,
        description: h.description || '',
        select: h.select !== undefined ? h.select : true,
      }))
      const result = await skillStore.setFolderCommonHeaders(folderId, headers)
      return {
        code: result ? 0 : 1,
        data: { updated: result },
      }
    },
  },
]
