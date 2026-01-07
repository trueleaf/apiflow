import { useSkill } from '../skillStore'
import { useLLMClientStore } from '../llmClientStore'
import { AgentTool } from '@src/types/ai'
import { simpleCreateProjectPrompt } from '@/store/ai/prompt/prompt'

export const projectTools: AgentTool[] = [
  {
    name: 'simpleCreateProject',
    description: 'Create a project based on user\'s simple description (recommended). Use this tool to automatically infer when the user does not provide a clear project name',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Natural language description of the project, for example "Create an e-commerce system project"',
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
    description: 'Get project list',
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
    description: 'Get project information by project ID',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID',
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
    description: 'Create a new project',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectName: {
          type: 'string',
          description: 'Project name',
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
    description: 'Batch create projects',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectNames: {
          type: 'array',
          description: 'List of project names',
          items: {
            type: 'string',
            description: 'Project name',
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
    description: 'Search projects by keyword, project name, creator and other conditions, supports fuzzy matching. Use this tool when you need to find projects by project name or creator',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'General keyword, searches both project name and description (fuzzy matching)',
        },
        projectName: {
          type: 'string',
          description: 'Project name (fuzzy matching)',
        },
        creator: {
          type: 'string',
          description: 'Creator (fuzzy matching)',
        },
        isStared: {
          type: 'boolean',
          description: 'Whether is starred',
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
    description: 'Update project name',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID',
        },
        projectName: {
          type: 'string',
          description: 'New project name',
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
    description: 'Delete a single project. To delete multiple projects, use batchDeleteProjects; to delete all projects, use deleteAllProjects',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID to delete',
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
    description: 'Batch delete multiple projects',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectIds: {
          type: 'array',
          description: 'List of project IDs to delete',
          items: {
            type: 'string',
            description: 'Project ID',
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
    description: 'Delete all projects. This is a dangerous operation that will delete all projects in the system',
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
    description: 'Star a project',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID to star',
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
    description: 'Unstar a project',
    type: 'projectManager',
    parameters: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID to unstar',
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
