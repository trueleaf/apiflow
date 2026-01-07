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
    description: 'Retrieve all variables defined in the current project. Returns complete variable metadata including names, values, types, and IDs. Use this to inspect available variables or gather context before variable operations.',
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
    description: 'Retrieve detailed information for a specific variable by its unique identifier. Returns name, value, type, and metadata for the variable. Use this to inspect or verify variable details before operations.',
    type: 'variable',
    parameters: {
      type: 'object',
      properties: {
        variableId: {
          type: 'string',
          description: 'The unique identifier of the variable to retrieve',
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
    description: 'Create a new variable in the current project. Variables can be referenced in API requests using {{variableName}} syntax. Supports multiple data types including strings, numbers, booleans, and file uploads.',
    type: 'variable',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Variable name used for referencing in API requests (e.g., "apiKey" for {{apiKey}})',
        },
        value: {
          type: 'string',
          description: 'The value to store in the variable',
        },
        type: {
          type: 'string',
          enum: ['string', 'number', 'boolean', 'null', 'any', 'file'],
          description: 'Data type of the variable (default: "string"). Use "file" for file upload variables',
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
    description: 'Modify the name, value, or type of an existing variable. Provide only the fields you want to change. Changes take effect immediately for all API requests using this variable.',
    type: 'variable',
    parameters: {
      type: 'object',
      properties: {
        variableId: {
          type: 'string',
          description: 'The unique identifier of the variable to update',
        },
        name: {
          type: 'string',
          description: 'New variable name (optional - only provide if renaming)',
        },
        value: {
          type: 'string',
          description: 'New variable value (optional - only provide if changing value)',
        },
        type: {
          type: 'string',
          enum: ['string', 'number', 'boolean', 'null', 'any', 'file'],
          description: 'New variable type (optional - only provide if changing type)',
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
    description: 'Permanently delete one or more variables from the project. Requires confirmation. After deletion, API requests using these variables via {{variableName}} will fail with unresolved reference errors.',
    type: 'variable',
    parameters: {
      type: 'object',
      properties: {
        variableIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of variable IDs to permanently delete',
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
    description: 'Find variables in the current project by name using keyword matching. Returns all variables whose names contain the search keyword. Use this to quickly locate specific variables without listing all of them.',
    type: 'variable',
    parameters: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'Search term to match against variable names (case-insensitive partial matching)',
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
