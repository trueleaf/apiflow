import { useSkill } from '../skillStore'
import { useLLMClientStore } from '../llmClientStore'
import { AgentTool } from '@src/types/ai'
import { simpleCreateProjectPrompt } from '@/store/ai/prompt/prompt'

export const projectTools: AgentTool[] = [
  {
    name: 'simpleCreateProject',
    description: '根据用户的简单描述创建项目（推荐）。当用户没有提供明确的项目名称时，使用此工具自动推断',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: '项目的自然语言描述，例如"创建一个电商系统项目"',
        },
      },
      required: ['description'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const llmClientStore = useLLMClientStore()
      const description = args.description as string
      try {
        const response = await llmClientStore.chat({
          messages: [
            { role: 'system', content: simpleCreateProjectPrompt },
            { role: 'user', content: description }
          ],
          response_format: { type: 'json_object' }
        })
        const content = response.choices[0]?.message?.content || '{}'
        const inferredParams: { projectName?: string } = JSON.parse(content)
        const projectName = inferredParams.projectName || '未命名项目'
        const result = await skillStore.createProject(projectName)
        return { code: result ? 0 : 1, data: result }
      } catch (error) {
        return { code: 1, data: { error: error instanceof Error ? error.message : '创建失败' } }
      }
    },
  },
  {
    name: 'getProjectList',
    description: '获取项目列表',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: false,
    execute: async () => {
      const skillStore = useSkill()
      const result = await skillStore.getProjectList()
      return {
        code: 0,
        data: result,
      }
    },
  },
  {
    name: 'getProjectById',
    description: '根据项目ID获取项目信息',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目ID',
        },
      },
      required: ['projectId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = args.projectId as string
      const result = await skillStore.getProjectById(projectId)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'createProject',
    description: '创建一个新项目',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectName: {
          type: 'string',
          description: '项目名称',
        },
      },
      required: ['projectName'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectName = args.projectName as string
      const result = await skillStore.createProject(projectName)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'batchCreateProjects',
    description: '批量创建项目',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectNames: {
          type: 'array',
          description: '项目名称列表',
          items: {
            type: 'string',
            description: '项目名称',
          },
        },
      },
      required: ['projectNames'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectNames = args.projectNames as string[]
      if (!projectNames || projectNames.length === 0) {
        return { code: 1, data: { message: '项目名称列表不能为空' } }
      }
      const result = await skillStore.batchCreateProjects(projectNames)
      return {
        code: 0,
        data: {
          message: '批量创建项目完成',
          successCount: result.success.length,
          failedCount: result.failed.length,
          createdProjects: result.success,
        },
      }
    },
  },
  {
    name: 'searchProject',
    description: '根据关键词、项目名称、创建者等条件搜索项目，支持模糊匹配。当需要通过项目名称或创建者查找项目时使用此工具',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: '通用关键词，同时搜索项目名称和描述（模糊匹配）',
        },
        projectName: {
          type: 'string',
          description: '项目名称（模糊匹配）',
        },
        creator: {
          type: 'string',
          description: '创建者（模糊匹配）',
        },
        isStared: {
          type: 'boolean',
          description: '是否收藏',
        },
      },
      required: [],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const result = await skillStore.searchProject({
        keyword: args.keyword as string | undefined,
        projectName: args.projectName as string | undefined,
        creator: args.creator as string | undefined,
        isStared: args.isStared as boolean | undefined,
      })
      return {
        code: 0,
        data: result,
      }
    },
  },
  {
    name: 'updateProjectName',
    description: '更新项目名称',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '项目ID',
        },
        projectName: {
          type: 'string',
          description: '新的项目名称',
        },
      },
      required: ['projectId', 'projectName'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = args.projectId as string
      const projectName = args.projectName as string
      const result = await skillStore.updateProjectName(projectId, projectName)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'deleteProject',
    description: '删除单个项目。如需删除多个项目，请使用 batchDeleteProjects；如需删除所有项目，请使用 deleteAllProjects',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '要删除的项目ID',
        },
      },
      required: ['projectId'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = args.projectId as string
      const result = await skillStore.deleteProject(projectId)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'batchDeleteProjects',
    description: '批量删除多个项目',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectIds: {
          type: 'array',
          description: '要删除的项目ID列表',
          items: {
            type: 'string',
            description: '项目ID',
          },
        },
      },
      required: ['projectIds'],
    },
    needConfirm: true,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectIds = args.projectIds as string[]
      if (!projectIds || projectIds.length === 0) {
        return { code: 1, data: { message: '项目ID列表不能为空' } }
      }
      const result = await skillStore.batchDeleteProjects(projectIds)
      return {
        code: 0,
        data: {
          message: '批量删除项目完成',
          successCount: result.success.length,
          failedCount: result.failed.length,
          deletedProjectIds: result.success,
        },
      }
    },
  },
  {
    name: 'deleteAllProjects',
    description: '删除所有项目。这是一个危险操作，会删除系统中的全部项目',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    needConfirm: true,
    execute: async () => {
      const skillStore = useSkill()
      const result = await skillStore.deleteAllProjects()
      return {
        code: 0,
        data: {
          message: '已删除所有项目',
          deletedCount: result.deletedCount,
          deletedProjectIds: result.projectIds,
        },
      }
    },
  },
  {
    name: 'starProject',
    description: '收藏项目',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '要收藏的项目ID',
        },
      },
      required: ['projectId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = args.projectId as string
      const result = await skillStore.starProject(projectId)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
  {
    name: 'unstarProject',
    description: '取消收藏项目',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: '要取消收藏的项目ID',
        },
      },
      required: ['projectId'],
    },
    needConfirm: false,
    execute: async (args: Record<string, unknown>) => {
      const skillStore = useSkill()
      const projectId = args.projectId as string
      const result = await skillStore.unstarProject(projectId)
      return {
        code: result ? 0 : 1,
        data: result,
      }
    },
  },
]
