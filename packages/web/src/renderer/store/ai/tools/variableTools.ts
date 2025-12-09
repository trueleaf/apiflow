import { useSkill } from '../skillStore'
import { AgentTool } from '@src/types/ai'
import { router } from '@/router'

// 获取当前项目ID
const getCurrentProjectId = (): string | null => {
  return router.currentRoute.value.query.id as string || null
}
export const variableTools: AgentTool[] = [
  {
    name: 'getVariables',
    description: '获取当前项目的所有变量列表',
    type: 'variable',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: false,
    execute: async () => {
      const skillStore = useSkill()
      const projectId = getCurrentProjectId()
      if (!projectId) {
        return { code: 1, data: { error: '未找到当前项目' } }
      }
      const result = await skillStore.getVariablesByProjectId(projectId)
      return { code: 0, data: result }
    },
  },
  {
    name: 'getVariableById',
    description: '根据变量ID获取单个变量的详细信息',
    type: 'variable',
    parameters: {
      type: 'object',
      properties: {
        variableId: {
          type: 'string',
          description: '变量ID',
        },
      },
      required: ['variableId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const variableId = args.variableId as string
      const result = await skillStore.getVariableById(variableId)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'createVariable',
    description: '在当前项目中创建一个新变量',
    type: 'variable',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '变量名称',
        },
        value: {
          type: 'string',
          description: '变量值',
        },
        type: {
          type: 'string',
          enum: ['string', 'number', 'boolean', 'null', 'any', 'file'],
          description: '变量类型，默认为string',
        },
      },
      required: ['name', 'value'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = getCurrentProjectId()
      if (!projectId) {
        return { code: 1, data: { error: '未找到当前项目' } }
      }
      const variableType = (args.type as string) || 'string'
      const result = await skillStore.createVariable({
        projectId,
        name: args.name as string,
        value: args.value as string,
        type: variableType as 'string' | 'number' | 'boolean' | 'null' | 'any' | 'file',
        fileValue: { name: '', path: '', fileType: '' },
      })
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'updateVariable',
    description: '更新指定变量的信息',
    type: 'variable',
    parameters: {
      type: 'object',
      properties: {
        variableId: {
          type: 'string',
          description: '要更新的变量ID',
        },
        name: {
          type: 'string',
          description: '新的变量名称',
        },
        value: {
          type: 'string',
          description: '新的变量值',
        },
        type: {
          type: 'string',
          enum: ['string', 'number', 'boolean', 'null', 'any', 'file'],
          description: '新的变量类型',
        },
      },
      required: ['variableId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const variableId = args.variableId as string
      const updates: Record<string, unknown> = {}
      if (args.name !== undefined) {
        updates.name = args.name
      }
      if (args.value !== undefined) {
        updates.value = args.value
      }
      if (args.type !== undefined) {
        updates.type = args.type
      }
      const result = await skillStore.updateVariableById(variableId, updates)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'deleteVariables',
    description: '批量删除指定的变量',
    type: 'variable',
    parameters: {
      type: 'object',
      properties: {
        variableIds: {
          type: 'array',
          items: { type: 'string' },
          description: '要删除的变量ID数组',
        },
      },
      required: ['variableIds'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const variableIds = args.variableIds as string[]
      const result = await skillStore.deleteVariableByIds(variableIds)
      return {
        code: result ? 0 : 1,
        data: { deleted: result },
      }
    },
  },
  {
    name: 'searchVariables',
    description: '在当前项目中按名称搜索变量',
    type: 'variable',
    parameters: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: '搜索关键词，会匹配变量名称',
        },
      },
      required: ['keyword'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = getCurrentProjectId()
      if (!projectId) {
        return { code: 1, data: { error: '未找到当前项目' } }
      }
      const keyword = args.keyword as string
      const result = await skillStore.searchVariablesByName(projectId, keyword)
      return { code: 0, data: result }
    },
  },
]
