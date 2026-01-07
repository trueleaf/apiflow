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
    description: 'Get all variables list of the current project',
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
    description: 'Get detailed information of a single variable by variable ID',
    type: 'variable',
    parameters: {
      type: 'object',
      properties: {
        variableId: {
          type: 'string',
          description: 'Variable ID',
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
    description: 'Create a new variable in the current project',
    type: 'variable',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Variable name',
        },
        value: {
          type: 'string',
          description: 'Variable value',
        },
        type: {
          type: 'string',
          enum: ['string', 'number', 'boolean', 'null', 'any', 'file'],
          description: 'Variable type, default is string',
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
    description: 'Update information of a specified variable',
    type: 'variable',
    parameters: {
      type: 'object',
      properties: {
        variableId: {
          type: 'string',
          description: 'Variable ID to update',
        },
        name: {
          type: 'string',
          description: 'New variable name',
        },
        value: {
          type: 'string',
          description: 'New variable value',
        },
        type: {
          type: 'string',
          enum: ['string', 'number', 'boolean', 'null', 'any', 'file'],
          description: 'New variable type',
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
    description: 'Batch delete specified variables',
    type: 'variable',
    parameters: {
      type: 'object',
      properties: {
        variableIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of variable IDs to delete',
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
    description: 'Search variables by name in the current project',
    type: 'variable',
    parameters: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'Search keyword, will match variable name',
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
